import { handleTrackOrder } from '../../server/backendHandler.js';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('client-ip') || '127.0.0.1';
  
  try {
    const payload = await req.json();
    const result = await handleTrackOrder(payload, clientIp);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
