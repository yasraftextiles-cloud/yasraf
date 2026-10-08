import { handleTrackOrder } from '../../server/backendHandler.js';

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
 * Netlify Function: track-order
 * Route: /.netlify/functions/track-order
 * Tracks order using cryptographic tracking token via Supabase using the service-role key.
 */
export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({
      success: false,
      error: `Method ${req.method} Not Allowed. Only POST requests are accepted.`
    }, 405);
  }

  const clientIp =
    req.headers.get('x-nf-client-connection-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('client-ip') ||
    '127.0.0.1';

  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    return jsonResponse({
      success: false,
      error: 'Invalid JSON request body.'
    }, 400);
  }

  try {
    const result = await handleTrackOrder(payload, clientIp);
    return jsonResponse(
      result.data || { success: false, error: 'Empty response from tracking handler.' },
      result.status || 200
    );
  } catch (err) {
    console.error('[Netlify Function /track-order uncaught error]:', err);
    return jsonResponse({
      success: false,
      error: err?.message || 'Internal server error tracking order.'
    }, 500);
  }
}
