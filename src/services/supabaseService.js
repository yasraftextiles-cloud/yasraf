import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { PRODUCTS as localProducts } from '../data/products.js';

export { supabase, isSupabaseConfigured };

/**
 * Normalizes a raw database product row into the format expected by storefront and admin components.
 * Solves the TEXT[] vs JSON image-access mismatch and normalizes snake_case to camelCase.
 */
export function normalizeProduct(p) {
  if (!p) return null;

  // Handle images TEXT[] / JSON / string / legacy array
  let imgList = [];
  if (Array.isArray(p.images)) {
    imgList = p.images.filter(Boolean);
  } else if (typeof p.images === 'string' && p.images.trim()) {
    try {
      const parsed = JSON.parse(p.images);
      imgList = Array.isArray(parsed) ? parsed : [p.images];
    } catch {
      imgList = [p.images];
    }
  }

  // Cover and secondary images
  const coverImage = imgList[0] || p.image || '/products/yasraf-meerab-black-1.png';
  const secondaryImage = imgList[1] || p.secondaryImage || coverImage;
  const gallery = imgList.length > 0 ? imgList : [coverImage, secondaryImage].filter(Boolean);

  // Parse colors (support array of objects or strings or JSONB)
  let colorsList = [];
  if (Array.isArray(p.colors)) {
    colorsList = p.colors.map(c => {
      if (typeof c === 'string') return { name: c, hex: '#c5a880' };
      return { name: c.name || 'Default', hex: c.hex || '#c5a880' };
    });
  } else if (p.colors && typeof p.colors === 'object') {
    colorsList = [p.colors];
  } else if (p.color) {
    colorsList = [{ name: p.color, hex: '#c5a880' }];
  } else {
    colorsList = [{ name: 'Original', hex: '#d4c5b9' }];
  }

  // Parse sizes (show only sizes actually configured for this product)
  const sizesList = Array.isArray(p.sizes) && p.sizes.length > 0
    ? p.sizes
    : ['XS', 'S', 'M', 'L', 'XL'];

  // Calculate total stock from variants if available
  const variants = p.product_variants || p.variants || [];
  const totalStock = variants.length > 0
    ? variants.reduce((acc, v) => acc + (parseInt(v.stock, 10) || 0), 0)
    : (p.stock_count ?? (p.stockCount ?? 14));

  const isPublished = p.is_published ?? (p.isPublished ?? true);

  return {
    ...p,
    id: p.id,
    sku: p.sku || `YAS-${p.id}`,
    slug: p.slug || p.id,
    title: p.title,
    subheading: p.subheading || p.tag || 'HAUTE COUTURE',
    tag: p.subheading || p.badge || p.tag || 'HAUTE COUTURE',
    category: p.category,
    categoryLabel: p.category_label || p.categoryLabel || 'Luxury Prêt',
    collections: Array.isArray(p.collections) ? p.collections : [],
    price: Number(p.price) || 0,
    originalPrice: p.original_price ? Number(p.original_price) : (p.originalPrice ? Number(p.originalPrice) : null),
    badge: p.badge || null,
    rating: p.rating ?? null,
    reviewsCount: p.reviews_count ?? (p.reviewsCount ?? 0),
    description: p.description || '',
    fabric: p.fabric || 'Luxury Egyptian Lawn & Pure Silk',
    includes: p.includes || 'Embroidered Shirt, Pure Silk Dupatta, Dyed Trouser',
    careInstructions: p.care_instructions || p.careInstructions || 'Dry clean recommended.',
    sizeGuide: p.size_guide || p.sizeGuide || null,
    relatedProductIds: Array.isArray(p.related_product_ids) ? p.related_product_ids : (p.relatedProductIds || []),
    image: coverImage,
    secondaryImage: secondaryImage,
    images: imgList,
    gallery: gallery,
    colors: colorsList,
    sizes: sizesList,
    variants: variants,
    stockCount: totalStock,
    inStock: totalStock > 0,
    isNew: p.is_new ?? (p.isNew ?? false),
    isFeatured: p.is_featured ?? (p.isFeatured ?? false),
    isPublished: isPublished
  };
}

/**
 * Fetch published products from Supabase for the storefront
 */
export async function getProducts() {
  if (!isSupabaseConfigured) {
    return { data: localProducts.map(normalizeProduct), error: null, source: 'local' };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Supabase products query returned no rows or errored, using local fallback:', error?.message);
      return { data: localProducts.map(normalizeProduct), error, source: 'local-fallback' };
    }

    const normalized = data.map(normalizeProduct);
    return { data: normalized, error: null, source: 'supabase' };
  } catch (err) {
    console.error('Error in getProducts:', err);
    return { data: localProducts.map(normalizeProduct), error: err, source: 'local-fallback' };
  }
}

/**
 * Check if the currently authenticated user has admin role
 */
export async function checkIsAdmin() {
  if (!isSupabaseConfigured) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // 1. Check via database RPC
    const { data: rpcAdmin, error: rpcErr } = await supabase.rpc('is_admin');
    if (!rpcErr && typeof rpcAdmin === 'boolean') {
      return rpcAdmin;
    }

    // 2. Fallback check directly in user_roles table
    const { data: roleRow, error: roleErr } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleErr && roleRow) {
      return true;
    }

    return false;
  } catch (err) {
    console.warn('Failed admin role check:', err);
    return false;
  }
}

/**
 * Fetch all products (published + drafts) for Admin Dashboard
 */
export async function getAdminProducts() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeProduct);
}

/**
 * Save product with variants atomically using RPC, with resilient client-side fallback
 */
export async function saveProduct(productData) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  // 1. First attempt atomic RPC save_product_with_variants
  try {
    const { data, error } = await supabase.rpc('save_product_with_variants', {
      payload: productData
    });

    if (!error && data) {
      return data;
    }

    if (error) {
      const errMsg = error.message || '';
      // If it's a known validation error from the function, throw it directly
      if (
        errMsg.includes('is required') ||
        errMsg.includes('cannot be less') ||
        errMsg.includes('Access Denied') ||
        errMsg.includes('cannot be negative') ||
        errMsg.includes('already used by another variant')
      ) {
        throw new Error(errMsg);
      }

      console.warn('RPC save_product_with_variants error, falling back to direct table update:', errMsg);
    }
  } catch (rpcErr) {
    // If it's an explicit validation error, re-throw it so user sees the message
    if (
      rpcErr.message && (
        rpcErr.message.includes('is required') ||
        rpcErr.message.includes('cannot be less') ||
        rpcErr.message.includes('Access Denied') ||
        rpcErr.message.includes('cannot be negative') ||
        rpcErr.message.includes('already used by another variant')
      )
    ) {
      throw rpcErr;
    }
    console.warn('RPC execution exception, proceeding with direct client update:', rpcErr?.message);
  }

  // 2. Direct Supabase Client fallback (for resilience if RPC was not yet migrated in remote database)
  const isUpdate = Boolean(productData.id);
  const now = new Date().toISOString();
  const productId = productData.id || `yas-${productData.slug || 'product-' + Date.now()}`;

  const productRow = {
    id: productId,
    slug: productData.slug,
    title: productData.title,
    subheading: productData.subheading || null,
    category: productData.category || 'luxury-pret',
    category_label: productData.category_label || null,
    collections: productData.collections || [],
    price: productData.price,
    original_price: productData.original_price || null,
    badge: productData.badge || null,
    description: productData.description || '',
    fabric: productData.fabric || '',
    includes: productData.includes || '',
    care_instructions: productData.care_instructions || '',
    size_guide: productData.size_guide || {},
    related_product_ids: productData.related_product_ids || [],
    images: productData.images || [],
    colors: productData.colors || [],
    sizes: productData.sizes || [],
    is_published: productData.is_published ?? false,
    is_new: productData.is_new ?? false,
    is_featured: productData.is_featured ?? false,
    updated_at: now
  };

  if (isUpdate) {
    const { error: prodErr } = await supabase
      .from('products')
      .update(productRow)
      .eq('id', productId);
    if (prodErr) throw new Error(prodErr.message || 'Failed to update product record.');
  } else {
    const { error: prodErr } = await supabase
      .from('products')
      .insert({ ...productRow, created_at: now });
    if (prodErr) throw new Error(prodErr.message || 'Failed to insert product record.');
  }

  // Handle variants
  if (Array.isArray(productData.variants) && productData.variants.length > 0) {
    const submittedIds = productData.variants.map((v) => v.id).filter(Boolean);

    // Delete removed variants if updating
    if (isUpdate) {
      if (submittedIds.length > 0) {
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', productId)
          .not('id', 'in', `(${submittedIds.join(',')})`);
      } else {
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', productId);
      }
    }

    // Upsert / Update / Insert variants
    for (const v of productData.variants) {
      if (v.id) {
        // Update existing variant preserving ID
        const { error: vErr } = await supabase
          .from('product_variants')
          .update({
            sku: v.sku.trim(),
            size: v.size,
            color: v.color || 'Standard',
            stock: Number(v.stock) || 0,
            price: v.price ? Number(v.price) : Number(productData.price),
            updated_at: now
          })
          .eq('id', v.id);

        if (vErr) throw new Error(`Variant (${v.sku}) update failed: ${vErr.message}`);
      } else {
        // Insert genuinely new variant
        const { error: vErr } = await supabase
          .from('product_variants')
          .insert({
            product_id: productId,
            sku: v.sku.trim(),
            size: v.size,
            color: v.color || 'Standard',
            stock: Number(v.stock) || 0,
            price: v.price ? Number(v.price) : Number(productData.price),
            created_at: now,
            updated_at: now
          });

        if (vErr) throw new Error(`Variant (${v.sku}) creation failed: ${vErr.message}`);
      }
    }
  }

  return {
    success: true,
    product_id: productId,
    slug: productData.slug,
    is_published: productData.is_published
  };
}

/**
 * Quick toggle publish / unpublish status
 */
export async function toggleProductPublish(productId, isPublished) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('products')
    .update({ 
      is_published: isPublished,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return normalizeProduct(data);
}

/**
 * Delete product and cascading variants
 */
export async function deleteProduct(productId) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
  return true;
}

/**
 * Upload an image to the 'product-images' storage bucket with validation
 */
export async function uploadProductImage(file) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type (${file.type}). Allowed formats: JPG, PNG, WebP, GIF.`);
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`);
  }

  const ext = file.name.split('.').pop().toLowerCase() || 'webp';
  const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = `catalog/${Date.now()}_${cleanName}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Upload to storage failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Fetch collections
 */
export async function getCollections() {
  if (!isSupabaseConfigured) {
    return [
      { id: 'new-in', slug: 'new-in', title: 'New In' },
      { id: 'ready-to-wear', slug: 'ready-to-wear', title: 'Ready to Wear' },
      { id: 'luxury-pret', slug: 'luxury-pret', title: 'Luxury Prêt' },
      { id: 'party-wear', slug: 'party-wear', title: 'Party Wear' },
      { id: 'winter-collection', slug: 'winter-collection', title: 'Winter Collection' },
      { id: 'best-sellers', slug: 'best-sellers', title: 'Best Sellers' }
    ];
  }

  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (error || !data || data.length === 0) {
      return [
        { id: 'new-in', slug: 'new-in', title: 'New In' },
        { id: 'ready-to-wear', slug: 'ready-to-wear', title: 'Ready to Wear' },
        { id: 'luxury-pret', slug: 'luxury-pret', title: 'Luxury Prêt' },
        { id: 'party-wear', slug: 'party-wear', title: 'Party Wear' },
        { id: 'winter-collection', slug: 'winter-collection', title: 'Winter Collection' },
        { id: 'best-sellers', slug: 'best-sellers', title: 'Best Sellers' }
      ];
    }

    return data;
  } catch (err) {
    console.warn('Failed to load collections from DB:', err);
    return [];
  }
}

/**
 * Fetch store settings
 */
export async function getStoreSettings() {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*');

    if (error || !data) return null;

    const map = {};
    data.forEach(item => {
      map[item.key] = item.value;
    });
    return map;
  } catch {
    return null;
  }
}

/**
 * Update a store setting
 */
export async function updateStoreSetting(key, value) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('store_settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Submit checkout through secure backend endpoint (/api/checkout)
 */
export async function createOrder({ customer, items, paymentMethod = 'cod', idempotencyKey = null }) {
  const key = idempotencyKey || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idemp_${Date.now()}_${Math.random().toString(36).substring(2)}`);

  const payload = {
    idempotency_key: key,
    customer: {
      fullName: customer.fullName?.trim(),
      email: customer.email?.trim() || null,
      phone: customer.phone?.trim(),
      address: customer.address?.trim(),
      city: customer.city?.trim(),
      province: customer.province?.trim(),
      postalCode: customer.postalCode?.trim() || null,
      notes: customer.notes?.trim() || null
    },
    paymentMethod: paymentMethod,
    items: items.map((item) => ({
      productId: item.productId || item.id,
      variantId: item.variantId || null,
      size: item.selectedSize || item.size || null,
      color: item.selectedColor?.name || (typeof item.color === 'string' ? item.color : null),
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
    }))
  };

  try {
    const headers = { 'Content-Type': 'application/json' };
    
    // Attach customer JWT token if authenticated
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (sessionErr) {
      // Proceed as guest checkout if session retrieval fails
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data?.error || `Checkout failed (HTTP ${res.status})` };
    }

    return {
      success: true,
      order_id: data.order_id,
      tracking_token: data.tracking_token,
      total: data.total,
      subtotal: data.subtotal,
      shipping_fee: data.shipping_fee,
      currency: data.currency || 'PKR',
      status: data.status,
      estimated_delivery: data.estimated_delivery,
      source: 'backend-endpoint'
    };
  } catch (err) {
    console.error('Failed to submit order via /api/checkout:', err);
    return { success: false, error: err.message || 'Network error during checkout' };
  }
}

/**
 * Securely track an order through backend endpoint (/api/track)
 */
export async function trackOrder({ orderId, trackingToken }) {
  if (!orderId || !trackingToken) {
    throw new Error('Both Order ID and secret Tracking Token are required.');
  }

  try {
    const res = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId.trim(),
        trackingToken: trackingToken.trim()
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error || `Tracking query failed (HTTP ${res.status})`);
    }

    return {
      orderId: data.order_id,
      status: data.status,
      currentStep: data.current_step,
      courierTracking: data.courier_tracking,
      destinationCity: data.destination_city,
      destinationProvince: data.destination_province,
      estimatedDelivery: data.estimated_delivery,
      datePlaced: data.date_placed,
      items: data.items || []
    };
  } catch (err) {
    console.error('Error tracking order via /api/track:', err);
    throw err;
  }
}
