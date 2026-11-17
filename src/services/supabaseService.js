import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { PRODUCTS as localProducts } from '../data/products.js';
import { getCategoryLabel } from '../data/categories.js';
import { inferProvince } from '../utils/location.js';

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
    sku: p.sku ? String(p.sku).trim() : null,
    slug: p.slug || p.id,
    title: p.title,
    subheading: p.subheading || p.tag || 'HAUTE COUTURE',
    tag: p.subheading || p.badge || p.tag || 'HAUTE COUTURE',
    category: p.category,
    categoryLabel: p.category_label || p.categoryLabel || getCategoryLabel(p.category) || 'Luxury Prêt',
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
    isNew: Boolean(p.show_in_new_arrivals ?? p.showInNewArrivals ?? p.is_new ?? p.isNew ?? false),
    isFeatured: Boolean(p.show_in_signature_edit ?? p.showInSignatureEdit ?? p.is_featured ?? p.isFeatured ?? false),
    isPublished: isPublished,
    showInNewArrivals: Boolean(p.show_in_new_arrivals ?? p.showInNewArrivals ?? p.is_new ?? p.isNew ?? false),
    showInSignatureEdit: Boolean(p.show_in_signature_edit ?? p.showInSignatureEdit ?? p.is_featured ?? p.isFeatured ?? false),
    show_in_new_arrivals: Boolean(p.show_in_new_arrivals ?? p.showInNewArrivals ?? p.is_new ?? p.isNew ?? false),
    show_in_signature_edit: Boolean(p.show_in_signature_edit ?? p.showInSignatureEdit ?? p.is_featured ?? p.isFeatured ?? false)
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

    if (error) return { data: null, error, source: 'supabase' };
    return { data: (data || []).map(normalizeProduct), error: null, source: 'supabase' };
  } catch (err) {
    return { data: null, error: err, source: 'supabase' };
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

  const targetNewArrivals = Boolean(
    productData.show_in_new_arrivals ?? productData.showInNewArrivals ?? productData.is_new ?? productData.isNew ?? false
  );
  const targetSignatureEdit = Boolean(
    productData.show_in_signature_edit ?? productData.showInSignatureEdit ?? productData.is_featured ?? productData.isFeatured ?? false
  );

  const rpcPayload = {
    ...productData,
    is_new: targetNewArrivals,
    is_featured: targetSignatureEdit,
    show_in_new_arrivals: targetNewArrivals,
    show_in_signature_edit: targetSignatureEdit
  };

  // Media and product changes must commit together; the legacy fallback cannot do that.
  if ('product_video_path' in rpcPayload || 'product_instagram_url' in rpcPayload) {
    const { data, error } = await supabase.rpc('save_product_with_media', { payload: rpcPayload });
    if (error) throw error;
    if (!data?.success) throw new Error('Could not save the product video.');
    return data;
  }

  // 1. First attempt atomic RPC save_product_with_variants
  try {
    const { data, error } = await supabase.rpc('save_product_with_variants', {
      payload: rpcPayload
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
    category_label: productData.category_label || getCategoryLabel(productData.category) || null,
    collections: productData.collections || [],
    price: productData.price,
    original_price: productData.original_price || null,
    badge: productData.badge || (targetNewArrivals ? 'NEW' : null),
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
    is_new: targetNewArrivals,
    is_featured: targetSignatureEdit,
    show_in_new_arrivals: targetNewArrivals,
    show_in_signature_edit: targetSignatureEdit,
    updated_at: now
  };

  if (isUpdate) {
    let { error: prodErr } = await supabase
      .from('products')
      .update(productRow)
      .eq('id', productId);

    if (prodErr && prodErr.message && prodErr.message.includes('show_in_')) {
      const { show_in_new_arrivals, show_in_signature_edit, ...fallbackRow } = productRow;
      const fallbackResult = await supabase
        .from('products')
        .update(fallbackRow)
        .eq('id', productId);
      prodErr = fallbackResult.error;
    }

    if (prodErr) throw new Error(prodErr.message || 'Failed to update product record.');
  } else {
    let { error: prodErr } = await supabase
      .from('products')
      .insert({ ...productRow, created_at: now });

    if (prodErr && prodErr.message && prodErr.message.includes('show_in_')) {
      const { show_in_new_arrivals, show_in_signature_edit, ...fallbackRow } = productRow;
      const fallbackResult = await supabase
        .from('products')
        .insert({ ...fallbackRow, created_at: now });
      prodErr = fallbackResult.error;
    }

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
 * Submit checkout through secure backend Netlify Function (/.netlify/functions/checkout)
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
      province: customer.province?.trim() || inferProvince(customer.city) || 'Punjab',
      postalCode: customer.postalCode?.trim() || null,
      notes: customer.notes?.trim() || null
    },
    paymentMethod: paymentMethod,
    items: items.map((item) => ({
      productId: item.productId || item.id,
      variantId: item.variantId || null,
      sku: item.sku ? String(item.sku).trim() : null,
      title: item.title || null,
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

    const res = await fetch('/.netlify/functions/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const rawText = await res.text();
      console.error('Invalid non-JSON response from checkout function:', rawText.slice(0, 300));
      return {
        success: false,
        error: `Checkout server returned an unexpected response (HTTP ${res.status}). Please try again.`
      };
    }

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data?.error || `Checkout failed (HTTP ${res.status})`
      };
    }

    return {
      success: true,
      order_id: data.order_id,
      order_number: data.order_number || data.order_id,
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
    console.error('Failed to submit order via /.netlify/functions/checkout:', err);
    return { success: false, error: err.message || 'Network error during checkout' };
  }
}

/**
 * Order Status Definitions & Step Mapping
 * Uses consistent lowercase database values (e.g. 'confirmed', 'order_received')
 * with readable UI labels.
 */
export const ORDER_STATUSES = [
  { id: 'order_received', value: 'order_received', label: 'Order Received', step: 1, trackingStep: 1, badgeClass: 'bg-neutral-100 text-neutral-800 border-neutral-300' },
  { id: 'confirmed', value: 'confirmed', label: 'Confirmed', step: 2, trackingStep: 1, badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'processing', value: 'processing', label: 'Processing', step: 3, trackingStep: 2, badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'packed', value: 'packed', label: 'Packed', step: 4, trackingStep: 2, badgeClass: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'shipped', value: 'shipped', label: 'Shipped', step: 5, trackingStep: 3, badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  { id: 'out_for_delivery', value: 'out_for_delivery', label: 'Out for Delivery', step: 6, trackingStep: 3, badgeClass: 'bg-orange-50 text-orange-800 border-orange-200' },
  { id: 'delivered', value: 'delivered', label: 'Delivered', step: 7, trackingStep: 4, badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'cancelled', value: 'cancelled', label: 'Cancelled', step: 8, trackingStep: 1, badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'returned', value: 'returned', label: 'Returned', step: 9, trackingStep: 1, badgeClass: 'bg-stone-100 text-stone-700 border-stone-300' }
];

export function normalizeStatus(status) {
  if (!status) return 'order_received';
  const s = String(status).trim().toLowerCase();
  if (s === 'order received' || s === 'order_received') return 'order_received';
  if (s === 'confirmed') return 'confirmed';
  if (s === 'processing' || s === 'artisan inspection' || s === 'artisan_inspection') return 'processing';
  if (s === 'packed') return 'packed';
  if (s === 'shipped' || s === 'dispatched') return 'shipped';
  if (s === 'out for delivery' || s === 'out_for_delivery') return 'out_for_delivery';
  if (s === 'delivered') return 'delivered';
  if (s === 'cancelled') return 'cancelled';
  if (s === 'returned') return 'returned';
  return s.replace(/[\s-]+/g, '_');
}

export function getStatusLabel(status) {
  const norm = normalizeStatus(status);
  const match = ORDER_STATUSES.find(st => st.id === norm || st.value === norm);
  return match ? match.label : (status || 'Order Received');
}

export function getStatusBadgeClass(status) {
  const norm = normalizeStatus(status);
  const match = ORDER_STATUSES.find(st => st.id === norm || st.value === norm);
  return match ? match.badgeClass : 'bg-neutral-100 text-neutral-800 border-neutral-300';
}

export function getStatusStep(status) {
  const norm = normalizeStatus(status);
  const match = ORDER_STATUSES.find(st => st.id === norm || st.value === norm);
  return match ? match.step : 1;
}

export function getTrackingStep(status) {
  const norm = normalizeStatus(status);
  const match = ORDER_STATUSES.find(st => st.id === norm || st.value === norm);
  return match ? match.trackingStep : 1;
}

/**
 * Fetch all orders and line items for admin dashboard
 */
export async function getAdminOrders(options = {}) {
  if (!isSupabaseConfigured) return [];
  const { includeArchived = false } = options;

  try {
    let query = supabase
      .from('orders')
      .select('*, order_items(*), order_status_history(*)')
      .order('created_at', { ascending: false });

    // Handle is_archived filtering safely
    if (includeArchived === true) {
      query = query.eq('is_archived', true);
    } else if (includeArchived === false) {
      // Show non-archived orders (or NULL for legacy rows before migration)
      query = query.or('is_archived.is.null,is_archived.eq.false');
    }

    const { data, error } = await query;
    if (error) {
      // If order_status_history table isn't created yet or relation missing, fallback to standard query
      console.warn('[SupabaseService] getAdminOrders detailed query notice, falling back:', error.message);
      const fallbackQuery = supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      
      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      if (fallbackError) {
        console.warn('[SupabaseService] getAdminOrders fallback warning:', fallbackError.message);
        return [];
      }
      return fallbackData || [];
    }
    return data || [];
  } catch (err) {
    console.warn('[SupabaseService] getAdminOrders exception:', err);
    return [];
  }
}

/**
 * Fetch Order Summary KPIs (Total, Pending, Shipped, Delivered)
 */
export async function getOrderSummaryStats() {
  if (!isSupabaseConfigured) {
    return { total: 0, pending: 0, shipped: 0, delivered: 0, archived: 0 };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, is_archived');

    if (error || !data) {
      return { total: 0, pending: 0, shipped: 0, delivered: 0, archived: 0 };
    }

    const activeOrders = data.filter(o => !o.is_archived);
    const archivedOrders = data.filter(o => o.is_archived);

    const pending = activeOrders.filter(o => {
      const s = normalizeStatus(o.status);
      return ['order_received', 'confirmed', 'processing', 'packed'].includes(s);
    }).length;

    const shipped = activeOrders.filter(o => {
      const s = normalizeStatus(o.status);
      return ['shipped', 'out_for_delivery'].includes(s);
    }).length;

    const delivered = activeOrders.filter(o => {
      return normalizeStatus(o.status) === 'delivered';
    }).length;

    return {
      total: activeOrders.length,
      pending,
      shipped,
      delivered,
      archived: archivedOrders.length
    };
  } catch (err) {
    console.warn('Failed to calculate order stats:', err);
    return { total: 0, pending: 0, shipped: 0, delivered: 0, archived: 0 };
  }
}

/**
 * Update an order's status and record in status history
 * Uses consistent lowercase database values ('confirmed', 'processing', etc.)
 */
export async function updateOrderStatus(orderId, newStatus, notes = '', adminEmail = '') {
  if (!isSupabaseConfigured || !orderId || !newStatus) {
    throw new Error('Order ID and new status are required.');
  }

  const canonicalStatus = normalizeStatus(newStatus);
  const currentStep = getTrackingStep(canonicalStatus);

  // 1. Fetch current status to record in history
  let previousStatus = null;
  try {
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('order_id', orderId)
      .maybeSingle();
    previousStatus = currentOrder?.status ? normalizeStatus(currentOrder.status) : null;
  } catch {}

  // 2. Update orders row
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: canonicalStatus,
      current_step: currentStep,
      updated_at: new Date().toISOString()
    })
    .eq('order_id', orderId)
    .select();

  if (error) {
    console.error('[SupabaseService] Update order status error:', error.message);
    if (/orders_status_check/i.test(error.message)) {
      throw new Error(`Database Check Constraint Notice: The status "${canonicalStatus}" is restricted by an existing check constraint in your Supabase database. Please apply the migration "supabase/migrations/20261117010000_fix_orders_status_check_constraint.sql" in your Supabase SQL Editor to allow all updated statuses.`);
    }
    throw new Error(error.message || 'Failed to update order status');
  }

  // 3. Record in order_status_history table
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      previous_status: previousStatus,
      new_status: canonicalStatus,
      changed_by_user_id: user?.id || null,
      changed_by_email: adminEmail || user?.email || 'admin@yasrafcouture.com',
      notes: notes || null
    });
  } catch (histErr) {
    console.warn('[SupabaseService] Notice writing order status history:', histErr.message);
  }

  return data?.[0] || true;
}

/**
 * Soft delete / Archive an order
 */
export async function archiveOrder(orderId, shouldArchive = true) {
  if (!isSupabaseConfigured || !orderId) {
    throw new Error('Order ID is required.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  const updatePayload = {
    is_archived: shouldArchive,
    archived_at: shouldArchive ? new Date().toISOString() : null,
    archived_by: shouldArchive ? user?.id : null
  };

  const { data, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('order_id', orderId)
    .select();

  if (error) {
    console.error('[SupabaseService] Archive order error:', error.message);
    throw new Error(error.message || 'Failed to update order archive status');
  }

  return data?.[0] || true;
}

/**
 * Permanently delete a test/duplicate order (restricted to admins)
 */
export async function deleteOrderPermanently(orderId) {
  if (!isSupabaseConfigured || !orderId) {
    throw new Error('Order ID is required.');
  }

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('order_id', orderId);

  if (error) {
    console.error('[SupabaseService] Delete order error:', error.message);
    throw new Error(error.message || 'Failed to delete order.');
  }

  return true;
}

/**
 * Fetch Order Status History audit trail
 */
export async function getOrderStatusHistory(orderId) {
  if (!isSupabaseConfigured || !orderId) return [];

  try {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SupabaseService] getOrderStatusHistory error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}

/**
 * Fetch Admin Notifications
 */
export async function getAdminNotifications({ limit = 30, unreadOnly = false } = {}) {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('[SupabaseService] getAdminNotifications warning:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId) {
  if (!isSupabaseConfigured || !notificationId) return;

  try {
    await supabase
      .from('admin_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
  } catch (err) {
    console.warn('Failed to mark notification read:', err);
  }
}

/**
 * Mark all admin notifications as read
 */
export async function markAllNotificationsRead() {
  if (!isSupabaseConfigured) return;

  try {
    await supabase
      .from('admin_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false);
  } catch (err) {
    console.warn('Failed to mark all notifications read:', err);
  }
}

/**
 * Realtime subscription to Admin Notifications
 */
export function subscribeToAdminNotifications(onNotification) {
  if (!isSupabaseConfigured) return () => {};

  try {
    const channel = supabase
      .channel('admin_notifications_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
        (payload) => {
          if (payload && payload.new && typeof onNotification === 'function') {
            onNotification(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return () => {};
  }
}

/**
 * Realtime subscription to Orders
 */
export function subscribeToAdminOrders(onOrderChange) {
  if (!isSupabaseConfigured) return () => {};

  try {
    const channel = supabase
      .channel('admin_orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (typeof onOrderChange === 'function') {
            onOrderChange(payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime orders subscription error:', err);
    return () => {};
  }
}

/**
 * Securely track an order through backend endpoint (/.netlify/functions/track-order)
 */
export async function trackOrder({ orderId, trackingToken }) {
  if (!orderId || !trackingToken) {
    throw new Error('Both Order ID and secret Tracking Token are required.');
  }

  try {
    const res = await fetch('/.netlify/functions/track-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId.trim(),
        trackingToken: trackingToken.trim()
      })
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const rawText = await res.text();
      console.error('Invalid non-JSON response from tracking function:', rawText.slice(0, 300));
      throw new Error(`Tracking service returned an unexpected response (HTTP ${res.status}).`);
    }

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error || `Tracking query failed (HTTP ${res.status})`);
    }

    return {
      orderId: data.order_id,
      orderNumber: data.order_number || data.order_id,
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
    console.error('Error tracking order via /.netlify/functions/track-order:', err);
    throw err;
  }
}
