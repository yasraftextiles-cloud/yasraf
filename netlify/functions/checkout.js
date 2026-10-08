import { handleCheckout } from '../../server/backendHandler.js';

// Standard CORS and JSON response headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

/**
 * Netlify Function: checkout
 * Route: /.netlify/functions/checkout
 * Invokes public.create_order_checkout via Supabase using the server-side service-role key.
 * Always returns JSON, handles CORS preflight, and never serves HTML.
 */
export default async function handler(req) {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  // 2. Enforce POST method
  if (req.method !== 'POST') {
    return jsonResponse({
      success: false,
      error: `Method ${req.method} Not Allowed. Only POST requests are accepted.`
    }, 405);
  }

  // 3. Extract client IP and Authorization header
  const clientIp =
    req.headers.get('x-nf-client-connection-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('client-ip') ||
    '127.0.0.1';
  const authHeader = req.headers.get('authorization') || null;

  // 4. Safely parse JSON request payload
  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    return jsonResponse({
      success: false,
      error: 'Invalid JSON request body.'
    }, 400);
  }

  // 5. Execute checkout logic using server-side service-role key
  try {
    const result = await handleCheckout(payload, clientIp, authHeader);
    return jsonResponse(
      result.data || { success: false, error: 'Empty response from checkout handler.' },
      result.status || 200
    );
  } catch (err) {
    console.error('[Netlify Function /checkout uncaught error]:', err);
    return jsonResponse({
      success: false,
      error: err?.message || 'Internal server error processing checkout.'
    }, 500);
  }
}
