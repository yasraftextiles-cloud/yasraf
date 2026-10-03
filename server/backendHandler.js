/**
 * Secure Backend Handler for Checkout and Order Tracking
 * Runs on backend (Node / Vite Dev Server / Netlify Functions / Edge Functions).
 * 
 * - Extracts verified remote IP (never trusts client payload).
 * - Enforces rate limiting on both successful and failed requests.
 * - Invokes privileged RPCs strictly using SUPABASE_SERVICE_ROLE_KEY.
 * - Never leaks secret keys or internal database errors.
 * - Validates input types before calling string methods (.trim()).
 * - Rejects invalid/expired Authorization headers with 401.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// In-memory sliding-window rate limiter for backend endpoints
const rateLimitBuckets = new Map();

function checkRateLimit(action, identifier, limit, windowMs) {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key) || [];
  
  // Clean entries outside window
  const activeEntries = bucket.filter(timestamp => now - timestamp < windowMs);
  
  // Record current attempt (counts both failed and successful attempts)
  activeEntries.push(now);
  rateLimitBuckets.set(key, activeEntries);

  if (activeEntries.length > limit) {
    return false; // Rate limit exceeded
  }
  return true;
}

/**
 * Obtain authenticated Supabase client for backend operations.
 * Requires server-only SUPABASE_SERVICE_ROLE_KEY.
 * Strips all fallbacks to publishable/anon keys for privileged RPCs.
 */
function getBackendSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    try {
      if (fs.existsSync('.env')) {
        const envContent = fs.readFileSync('.env', 'utf-8');
        envContent.split('\n').forEach(line => {
          const [k, ...v] = line.split('=');
          if (k && v && k.trim() === 'SUPABASE_SERVICE_ROLE_KEY') {
            serviceKey = v.join('=').trim().replace(/^['"]|['"]$/g, '');
          }
        });
      }
    } catch {}
  }

  if (!supabaseUrl || !serviceKey) {
    const err = new Error('CONFIG_ERROR: SUPABASE_SERVICE_ROLE_KEY is required on the backend for privileged operations.');
    err.code = 'CONFIG_MISSING';
    throw err;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

/**
 * Handle checkout request
 */
export async function handleCheckout(payload, remoteIp, authHeader = null) {
  // 1. Rate Limiting: Max 10 attempts per 2 minutes per verified remote IP
  const allowed = checkRateLimit('checkout', remoteIp, 10, 2 * 60 * 1000);
  if (!allowed) {
    return {
      status: 429,
      data: { success: false, error: 'Too many checkout attempts. Please wait 2 minutes.' }
    };
  }

  // 2. Validate Payload Structure & Input Types
  if (!payload || typeof payload !== 'object') {
    return {
      status: 400,
      data: { success: false, error: 'Invalid checkout request payload.' }
    };
  }

  // Validate Idempotency Key presence & entropy (>= 32 chars)
  const idempotencyKey = typeof payload.idempotency_key === 'string' ? payload.idempotency_key.trim() : '';
  if (idempotencyKey.length < 32) {
    return {
      status: 400,
      data: { success: false, error: 'High-entropy idempotency_key (minimum 32 characters) is required.' }
    };
  }

  // Validate Customer Details
  const customer = payload.customer;
  if (!customer || typeof customer !== 'object') {
    return {
      status: 400,
      data: { success: false, error: 'Customer details are required.' }
    };
  }

  const fullName = typeof customer.fullName === 'string' ? customer.fullName.trim() : '';
  const phone = typeof customer.phone === 'string' ? customer.phone.trim() : '';
  const address = typeof customer.address === 'string' ? customer.address.trim() : '';
  const city = typeof customer.city === 'string' ? customer.city.trim() : '';
  const province = typeof customer.province === 'string' ? customer.province.trim() : '';

  if (!fullName) {
    return { status: 400, data: { success: false, error: 'Full customer name is required.' } };
  }
  if (!phone) {
    return { status: 400, data: { success: false, error: 'Contact phone number is required.' } };
  }
  if (!address) {
    return { status: 400, data: { success: false, error: 'Shipping street address is required.' } };
  }
  if (!city) {
    return { status: 400, data: { success: false, error: 'Destination city is required.' } };
  }
  if (!province) {
    return { status: 400, data: { success: false, error: 'Destination province is required.' } };
  }

  // Validate Cart Items
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return {
      status: 400,
      data: { success: false, error: 'Cart cannot be empty.' }
    };
  }

  // 3. Authenticate User if Authorization header provided
  // If an Authorization header is supplied but invalid/expired, return 401; do not silently create a guest order.
  let verifiedUserId = null;

  if (authHeader) {
    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return {
        status: 401,
        data: { success: false, error: 'Invalid Authorization header format. Expected Bearer token.' }
      };
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return {
        status: 401,
        data: { success: false, error: 'Authorization token is required.' }
      };
    }
  }

  // 4. Initialize Backend Supabase Client (Service Role required for privileged RPC)
  let supabase;
  try {
    supabase = getBackendSupabaseClient();
  } catch (cfgErr) {
    console.error('[Backend Checkout Config Error]:', cfgErr.message);
    return {
      status: 500,
      data: { success: false, error: 'Checkout service is currently unavailable. Server configuration error.' }
    };
  }

  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) {
        console.warn('[Backend Checkout] Invalid or expired auth token provided:', userError?.message);
        return {
          status: 401,
          data: { success: false, error: 'Your session has expired or is invalid. Please sign in again.' }
        };
      }
      verifiedUserId = user.id;
    } catch (authErr) {
      console.warn('[Backend Checkout] Token validation error:', authErr.message);
      return {
        status: 401,
        data: { success: false, error: 'Failed to authenticate request.' }
      };
    }
  }

  // 5. Attach verified remote IP and verified user_id (strictly derived from Auth, overriding any client payload spoofing)
  const securePayload = {
    ...payload,
    client_ip: remoteIp,
    user_id: verifiedUserId
  };

  try {
    const { data, error } = await supabase.rpc('create_order_checkout', { payload: securePayload });

    if (error) {
      console.error('[Backend Checkout RPC Error]:', error.message);
      const msg = error.message || '';
      let safeError = 'Unable to complete order checkout. Please review your details and try again.';

      if (/insufficient stock/i.test(msg)) {
        safeError = msg.replace(/^.*?exception:\s*/i, '');
      } else if (/not in supported delivery territories/i.test(msg)) {
        safeError = 'The selected province is outside our currently supported delivery zones.';
      } else if (/idempotency/i.test(msg)) {
        safeError = 'A duplicate or conflicting request was detected. Please refresh and try again.';
      } else if (/unpublished|catalog/i.test(msg)) {
        safeError = 'One or more items in your cart are no longer available in the catalog.';
      }

      return {
        status: 400,
        data: { success: false, error: safeError }
      };
    }

    if (!data || !data.success) {
      return {
        status: 400,
        data: { success: false, error: data?.error || 'Order could not be processed.' }
      };
    }

    return {
      status: 200,
      data: data
    };
  } catch (err) {
    console.error('[Backend Checkout System Error]:', err);
    return {
      status: 500,
      data: { success: false, error: 'Internal order processing error.' }
    };
  }
}

/**
 * Handle tracking request
 */
export async function handleTrackOrder(payload, remoteIp) {
  // 1. Rate Limiting: Max 15 lookups per 5 minutes per verified remote IP
  const allowed = checkRateLimit('track_order', remoteIp, 15, 5 * 60 * 1000);
  if (!allowed) {
    return {
      status: 429,
      data: { success: false, error: 'Too many tracking attempts. Please wait 5 minutes.' }
    };
  }

  if (!payload || typeof payload !== 'object') {
    return {
      status: 400,
      data: { success: false, error: 'Invalid tracking request payload.' }
    };
  }

  const orderId = typeof payload.orderId === 'string' ? payload.orderId.trim() : '';
  const trackingToken = typeof payload.trackingToken === 'string' ? payload.trackingToken.trim() : '';

  if (!orderId || !trackingToken || trackingToken.length < 32) {
    return {
      status: 400,
      data: { success: false, error: 'Both Order ID and a valid cryptographic Tracking Token are required.' }
    };
  }

  let supabase;
  try {
    supabase = getBackendSupabaseClient();
  } catch (cfgErr) {
    console.error('[Backend Track Order Config Error]:', cfgErr.message);
    return {
      status: 500,
      data: { success: false, error: 'Tracking service is temporarily unavailable. Server configuration error.' }
    };
  }

  try {
    const { data, error } = await supabase.rpc('track_order_secure', {
      p_order_id: orderId,
      p_tracking_token: trackingToken,
      p_client_ip: remoteIp
    });

    if (error) {
      console.error('[Backend Tracking RPC Error]:', error.message);
      return {
        status: 400,
        data: { success: false, error: 'Unable to retrieve tracking details.' }
      };
    }

    if (!data || !data.success) {
      return {
        status: 404,
        data: { success: false, error: data?.error || 'Order not found or invalid tracking token.' }
      };
    }

    return {
      status: 200,
      data: data
    };
  } catch (err) {
    console.error('[Backend Tracking System Error]:', err);
    return {
      status: 500,
      data: { success: false, error: 'Internal tracking error.' }
    };
  }
}
