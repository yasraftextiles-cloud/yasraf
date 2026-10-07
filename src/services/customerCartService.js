import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

// Cache known cart versions per user in memory to manage optimistic concurrency
const cartVersionCache = new Map();

/**
 * Creates unique variant key to distinguish different variants of the same product
 */
export function getCartItemKey(item) {
  const pid = item.productId || item.id || '';
  const vid = item.variantId || '';
  const size = item.selectedSize || item.size || '';
  const color = item.selectedColor?.name || (typeof item.color === 'string' ? item.color : '') || '';
  return `${pid}__${vid}__${size}__${color}`;
}

export function getCachedCartVersion(userId) {
  return cartVersionCache.get(userId) ?? 0;
}

export function setCachedCartVersion(userId, version) {
  if (userId && version !== undefined && version !== null) {
    cartVersionCache.set(userId, Number(version));
  }
}

/**
 * Fetch authenticated customer cart from Supabase and revalidate against current catalog.
 * Strict Error Handling: A failed fetch returns items: null and does NOT wipe active cart.
 */
export async function fetchCustomerCart(userId, catalogProducts = []) {
  if (!isSupabaseConfigured || !userId) {
    return { success: false, items: null, notices: [], error: 'Supabase is not configured or User ID is missing' };
  }

  try {
    // 1. Get customer cart id and version
    const { data: cartRow, error: cartErr } = await supabase
      .from('customer_carts')
      .select('id, version')
      .eq('user_id', userId)
      .maybeSingle();

    if (cartErr) {
      console.warn('[CustomerCart] Cart lookup error:', cartErr.message);
      return { success: false, items: null, notices: [], error: cartErr.message };
    }

    if (!cartRow) {
      // Cart record does not exist yet in DB; version is 0
      setCachedCartVersion(userId, 0);
      return { success: true, items: [], notices: [], version: 0, cartId: null };
    }

    const currentVersion = cartRow.version !== undefined && cartRow.version !== null 
      ? Number(cartRow.version) 
      : 1;
    setCachedCartVersion(userId, currentVersion);

    // 2. Fetch cart items
    const { data: rawItems, error: itemsErr } = await supabase
      .from('customer_cart_items')
      .select('*')
      .eq('cart_id', cartRow.id);

    if (itemsErr) {
      console.warn('[CustomerCart] Cart items fetch error:', itemsErr.message);
      return { success: false, items: null, notices: [], error: itemsErr.message };
    }

    // 3. Revalidate against live catalog
    const { validatedItems, notices } = revalidateCartItems((rawItems || []).map(r => ({
      id: r.product_id,
      productId: r.product_id,
      variantId: r.variant_id,
      selectedSize: r.size,
      size: r.size,
      selectedColor: r.color ? { name: r.color } : null,
      color: r.color,
      quantity: r.quantity
    })), catalogProducts);

    return { 
      success: true, 
      items: validatedItems, 
      notices, 
      version: currentVersion, 
      cartId: cartRow.id 
    };
  } catch (err) {
    console.warn('[CustomerCart] fetchCustomerCart exception:', err.message);
    return { success: false, items: null, notices: [], error: err.message };
  }
}

/**
 * Format cart items into database RPC contract
 * Each item must contain real productId, variantId, and positive integer quantity.
 */
export function formatCartItemsForRpc(cartItems = []) {
  if (!Array.isArray(cartItems)) return [];
  return cartItems
    .filter(item => Boolean(item && (item.productId || item.id)))
    .map(item => ({
      productId: String(item.productId || item.id).trim(),
      variantId: item.variantId || null,
      size: item.selectedSize || item.size || null,
      color: item.selectedColor?.name || (typeof item.color === 'string' ? item.color.trim() : null),
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
    }));
}

/**
 * Atomic customer cart persistence via replace_customer_cart RPC
 * Avoids delete-then-insert races, verifies version, and handles optimistic conflicts.
 */
export async function syncCustomerCart(userId, cartItems = [], catalogProducts = []) {
  if (!isSupabaseConfigured || !userId) {
    return { success: false, error: 'Supabase is not configured or User ID is missing' };
  }

  const formattedItems = formatCartItemsForRpc(cartItems);

  try {
    let expectedVersion = getCachedCartVersion(userId);

    // If expectedVersion is 0, verify with customer_carts row
    if (expectedVersion === 0) {
      const { data: cartRow, error: cErr } = await supabase
        .from('customer_carts')
        .select('id, version')
        .eq('user_id', userId)
        .maybeSingle();

      if (!cErr && cartRow && cartRow.version !== undefined && cartRow.version !== null) {
        expectedVersion = Number(cartRow.version);
        setCachedCartVersion(userId, expectedVersion);
      }
    }

    // Call atomic replace_customer_cart RPC
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('replace_customer_cart', {
      p_items: formattedItems,
      p_expected_version: expectedVersion
    });

    if (rpcErr) {
      const isConflict = rpcErr.code === '409' || 
                         rpcErr.code === 'P0001' || 
                         /conflict|version|mismatch/i.test(rpcErr.message);

      if (isConflict) {
        console.warn('[CustomerCart] Cart version conflict detected. Reloading and reconciling with server state.');
        // Reload remote cart to get latest server version and items
        const remoteCart = await fetchCustomerCart(userId, catalogProducts);
        if (remoteCart.success && Array.isArray(remoteCart.items)) {
          // Reconcile: merge local items into latest remote cart without overwriting other session
          const mergedMap = new Map();
          remoteCart.items.forEach(it => mergedMap.set(getCartItemKey(it), { ...it }));
          cartItems.forEach(it => {
            const k = getCartItemKey(it);
            if (!mergedMap.has(k)) {
              mergedMap.set(k, { ...it });
            }
          });

          const reconciledItems = Array.from(mergedMap.values());
          const nextFormatted = formatCartItemsForRpc(reconciledItems);
          const newExpectedVersion = remoteCart.version ?? (expectedVersion + 1);

          // Retry replace with updated version
          const retryRes = await supabase.rpc('replace_customer_cart', {
            p_items: nextFormatted,
            p_expected_version: newExpectedVersion
          });

          if (!retryRes.error) {
            const updatedVer = typeof retryRes.data === 'number' 
              ? retryRes.data 
              : (retryRes.data?.version ?? (newExpectedVersion + 1));
            setCachedCartVersion(userId, updatedVer);
            return { success: true, version: updatedVer, reconciledItems };
          }
        }
      }

      console.warn('[CustomerCart] replace_customer_cart RPC warning:', rpcErr.message);
      return { success: false, error: rpcErr.message };
    }

    // Parse and store returned version after successful replacement
    const newVersion = (typeof rpcRes === 'number')
      ? rpcRes
      : (rpcRes?.version !== undefined ? Number(rpcRes.version) : (expectedVersion + 1));

    setCachedCartVersion(userId, newVersion);

    return { success: true, version: newVersion, data: rpcRes };
  } catch (err) {
    console.warn('[CustomerCart] syncCustomerCart exception:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Atomic Guest Cart Merge RPC Function
 * Uses merge_guest_cart_items with a persistent merge key and identical payload for retries.
 * Only clears the guest cart after confirmed success.
 */
export async function mergeGuestCart(userId, guestItems = [], catalogProducts = []) {
  if (!isSupabaseConfigured || !userId || !Array.isArray(guestItems) || guestItems.length === 0) {
    return { success: true, mergedItems: [], notices: [] };
  }

  const STORAGE_MERGE_KEY = 'yasraf_guest_merge_key';
  let mergeKey = null;

  try {
    mergeKey = localStorage.getItem(STORAGE_MERGE_KEY);
  } catch {}

  if (!mergeKey) {
    mergeKey = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : `merge_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    try {
      localStorage.setItem(STORAGE_MERGE_KEY, mergeKey);
    } catch {}
  }

  const formattedGuestItems = formatCartItemsForRpc(guestItems);

  try {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('merge_guest_cart_items', {
      p_items: formattedGuestItems,
      p_merge_key: mergeKey
    });

    if (rpcErr) {
      console.warn('[CustomerCart] merge_guest_cart_items error:', rpcErr.message);
      return { success: false, error: rpcErr.message, mergedItems: guestItems, notices: [] };
    }

    // CONFIRMED SUCCESS: Clear guest cart and merge key
    try {
      localStorage.removeItem('yasraf_cart');
      localStorage.removeItem(STORAGE_MERGE_KEY);
    } catch {}

    // Fetch refreshed cart from database to get live catalog validated items
    const fetchResult = await fetchCustomerCart(userId, catalogProducts);

    return {
      success: true,
      mergedItems: fetchResult.items || [],
      notices: fetchResult.notices || [],
      version: fetchResult.version
    };
  } catch (err) {
    console.warn('[CustomerCart] mergeGuestCart exception:', err.message);
    return { success: false, error: err.message, mergedItems: guestItems, notices: [] };
  }
}

/**
 * Clear customer cart in Supabase
 */
export async function clearCustomerCart(userId) {
  if (!isSupabaseConfigured || !userId) return;

  try {
    // Atomically replace with empty array
    await syncCustomerCart(userId, []);
  } catch (err) {
    console.warn('[CustomerCart] clearCustomerCart note:', err.message);
  }
}

/**
 * Revalidate items against current catalog prices, exact variant availability, and stock.
 * 
 * Exact Variant Rules:
 * - Never substitute variants[0]
 * - Never invent stock=14
 * - Never silently select size M
 * - Use the actual selected variant and current catalog stock/price
 * - If that variant is unavailable, show a notice and require a new selection
 */
export function revalidateCartItems(items = [], catalogProducts = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return { validatedItems: [], notices: [] };
  }

  const validatedItems = [];
  const notices = [];

  for (const item of items) {
    const prodId = item.id || item.productId;
    const liveProd = catalogProducts.find(p => p.id === prodId);

    if (!liveProd) {
      notices.push(`"${item.title || prodId}" is currently unlisted.`);
      validatedItems.push({
        ...item,
        productId: prodId,
        isUnavailable: true,
        isOutOfStock: false,
        price: Number(item.price) || 0
      });
      continue;
    }

    if (liveProd.isPublished === false || liveProd.is_published === false) {
      notices.push(`"${liveProd.title}" is no longer published.`);
      validatedItems.push({
        ...item,
        productId: prodId,
        title: liveProd.title,
        isUnavailable: true,
        isOutOfStock: false,
        price: Number(liveProd.price) || Number(item.price) || 0
      });
      continue;
    }

    const variants = liveProd.variants || liveProd.product_variants || [];

    if (variants.length > 0) {
      // Match variant strictly by ID first, then by exact size and color
      let matchedVariant = null;

      if (item.variantId) {
        matchedVariant = variants.find(v => v.id === item.variantId);
      }

      if (!matchedVariant) {
        const itemSize = item.selectedSize || item.size;
        const itemColor = item.selectedColor?.name || (typeof item.color === 'string' ? item.color : null);

        if (itemSize) {
          matchedVariant = variants.find(v => {
            const sizeMatches = v.size && v.size.toLowerCase() === itemSize.toLowerCase();
            const colorMatches = !itemColor || !v.color || v.color.toLowerCase() === itemColor.toLowerCase();
            return sizeMatches && colorMatches;
          });
        }
      }

      // DO NOT fallback to variants[0]!
      // If no exact variant match is found in the current catalog, item is unavailable
      if (!matchedVariant) {
        const variantLabel = item.selectedSize || item.size || 'Requested variant';
        notices.push(`"${liveProd.title}" (${variantLabel}) is no longer available in the catalog. Please choose an available size.`);
        validatedItems.push({
          ...item,
          productId: liveProd.id,
          title: liveProd.title,
          image: liveProd.image || (Array.isArray(liveProd.images) ? liveProd.images[0] : null) || item.image,
          isUnavailable: true,
          isOutOfStock: false,
          availableStock: 0,
          price: Number(item.price) || Number(liveProd.price) || 0
        });
        continue;
      }

      // Exact matched variant exists in catalog
      const currentPrice = Number(matchedVariant.price !== undefined ? matchedVariant.price : liveProd.price);
      // DO NOT invent stock=14! Use real variant stock (or 0 if missing)
      const availableStock = matchedVariant.stock !== undefined ? Number(matchedVariant.stock) : 0;
      let adjustedQty = Math.max(1, parseInt(item.quantity, 10) || 1);

      if (availableStock <= 0) {
        notices.push(`"${liveProd.title}" (${matchedVariant.size}) is currently sold out.`);
        validatedItems.push({
          ...item,
          productId: liveProd.id,
          title: liveProd.title,
          image: liveProd.image || (Array.isArray(liveProd.images) ? liveProd.images[0] : null) || item.image,
          variantId: matchedVariant.id,
          sku: matchedVariant.sku || liveProd.sku || item.sku || undefined,
          price: currentPrice,
          selectedSize: matchedVariant.size,
          size: matchedVariant.size,
          selectedColor: matchedVariant.color ? { name: matchedVariant.color } : null,
          color: matchedVariant.color || null,
          isOutOfStock: true,
          isUnavailable: false,
          availableStock: 0,
          quantity: adjustedQty
        });
        continue;
      }

      if (adjustedQty > availableStock) {
        notices.push(`Quantity for "${liveProd.title}" (${matchedVariant.size}) was adjusted to available stock (${availableStock}).`);
        adjustedQty = availableStock;
      }

      if (item.price && Number(item.price) !== currentPrice) {
        notices.push(`Price for "${liveProd.title}" updated to current catalog price (Rs. ${currentPrice.toLocaleString('en-PK')}).`);
      }

      validatedItems.push({
        ...item,
        id: liveProd.id,
        productId: liveProd.id,
        title: liveProd.title,
        image: liveProd.image || (Array.isArray(liveProd.images) ? liveProd.images[0] : null) || item.image,
        variantId: matchedVariant.id,
        sku: matchedVariant.sku || liveProd.sku || item.sku || undefined,
        price: currentPrice,
        originalPrice: liveProd.originalPrice,
        selectedSize: matchedVariant.size,
        size: matchedVariant.size,
        selectedColor: matchedVariant.color ? { name: matchedVariant.color } : null,
        color: matchedVariant.color || null,
        quantity: adjustedQty,
        availableStock,
        isOutOfStock: false,
        isUnavailable: false
      });
    } else {
      // Product without variants (flat catalog item)
      const currentPrice = Number(liveProd.price);
      // DO NOT invent stock=14! Use real stockCount or stock or 0
      const availableStock = liveProd.stockCount !== undefined 
        ? Number(liveProd.stockCount) 
        : (liveProd.stock !== undefined ? Number(liveProd.stock) : 0);
      let adjustedQty = Math.max(1, parseInt(item.quantity, 10) || 1);

      if (availableStock <= 0) {
        notices.push(`"${liveProd.title}" is currently sold out.`);
        validatedItems.push({
          ...item,
          productId: liveProd.id,
          title: liveProd.title,
          image: liveProd.image || item.image,
          price: currentPrice,
          isOutOfStock: true,
          isUnavailable: false,
          availableStock: 0,
          quantity: adjustedQty
        });
        continue;
      }

      if (adjustedQty > availableStock) {
        notices.push(`Quantity for "${liveProd.title}" was adjusted to available stock (${availableStock}).`);
        adjustedQty = availableStock;
      }

      if (item.price && Number(item.price) !== currentPrice) {
        notices.push(`Price for "${liveProd.title}" updated to current catalog price (Rs. ${currentPrice.toLocaleString('en-PK')}).`);
      }

      validatedItems.push({
        ...item,
        id: liveProd.id,
        productId: liveProd.id,
        title: liveProd.title,
        image: liveProd.image || item.image,
        variantId: null,
        sku: liveProd.sku || item.sku || undefined,
        price: currentPrice,
        originalPrice: liveProd.originalPrice,
        selectedSize: item.selectedSize || item.size || null,
        size: item.selectedSize || item.size || null,
        selectedColor: item.selectedColor || null,
        color: item.color || null,
        quantity: adjustedQty,
        availableStock,
        isOutOfStock: false,
        isUnavailable: false
      });
    }
  }

  return { validatedItems, notices };
}
