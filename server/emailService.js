/**
 * Transactional Email Service for YASRAF Textiles
 * Sends beautiful, responsive HTML order notifications to admin (yasraftextiles@gmail.com)
 * Uses Resend API via native fetch (zero extra dependencies).
 * Secrets: RESEND_API_KEY configured in Netlify / server environment.
 */

const ADMIN_EMAIL = 'yasraftextiles@gmail.com';
const DEFAULT_FROM = process.env.ORDER_EMAIL_FROM || 'YASRAF Atelier <orders@yasraftextiles.com>';
const FALLBACK_FROM = 'YASRAF Orders <onboarding@resend.dev>';

/**
 * Format currency in Pakistani Rupees
 */
function formatPKR(num) {
  return 'Rs. ' + Number(num || 0).toLocaleString('en-PK');
}

/**
 * Build professional HTML email template for new order
 */
function generateOrderEmailHtml({ orderNumber, orderId, customer, items, subtotal, shippingFee, total, paymentMethod, orderDate }) {
  const formattedDate = orderDate ? new Date(orderDate).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Karachi'
  }) : new Date().toLocaleString('en-PK');

  const itemsHtml = (items || []).map(item => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; vertical-align: top;">
        <strong style="color: #1a1814; font-size: 13px;">${item.title || 'Product'}</strong>
        ${item.sku ? `<div style="font-family: monospace; font-size: 11px; color: #8c867f; margin-top: 2px;">SKU: ${item.sku}</div>` : ''}
        <div style="font-size: 11px; color: #67615c; margin-top: 2px;">
          Size: ${item.size || 'Standard'} ${item.color ? `· Color: ${item.color}` : ''}
        </div>
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: center; font-size: 13px; color: #1a1814;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 13px; color: #1a1814; font-weight: 600;">
        ${formatPKR(item.line_total || (item.unit_price * item.quantity))}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order — ${orderNumber}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f7f4ee; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1814; line-height: 1.5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f4ee; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5dfd7; border-collapse: separate;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #141311; padding: 25px 30px; text-align: center; border-bottom: 2px solid #c5a880;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 0.15em; color: #f7f4ee; font-weight: normal;">
                YASRAF
              </h1>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #c5a880; margin-top: 4px; font-weight: 600;">
                New Order Received
              </div>
            </td>
          </tr>

          <!-- Order Highlight Banner -->
          <tr>
            <td style="padding: 24px 30px 12px; background-color: #ffffff;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8c867f; font-weight: 600;">
                      Order Reference
                    </div>
                    <div style="font-family: monospace; font-size: 22px; font-weight: bold; color: #1a1814; margin-top: 2px;">
                      ${orderNumber}
                    </div>
                    ${orderId && orderId !== orderNumber ? `<div style="font-family: monospace; font-size: 11px; color: #8c867f;">ID: ${orderId}</div>` : ''}
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="display: inline-block; background-color: #faf4eb; border: 1px solid #e0d5c1; color: #8a6d3b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold; padding: 4px 8px;">
                      Pending Dispatch
                    </span>
                    <div style="font-size: 11px; color: #8c867f; margin-top: 4px;">
                      ${formattedDate}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer & Destination Details -->
          <tr>
            <td style="padding: 12px 30px 20px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf8f6; border: 1px solid #ebe5dc; padding: 15px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 10px;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; color: #8c867f; font-weight: bold; margin-bottom: 6px;">
                      Customer Details
                    </div>
                    <div style="font-weight: 600; font-size: 14px; color: #1a1814;">${customer.fullName || 'Customer'}</div>
                    <div style="font-size: 13px; color: #444; margin-top: 2px;">
                      <strong>Phone:</strong> <a href="tel:${customer.phone}" style="color: #1a1814; text-decoration: none;">${customer.phone}</a>
                    </div>
                    ${customer.email ? `<div style="font-size: 12px; color: #666; margin-top: 2px;">Email: ${customer.email}</div>` : ''}
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 10px; border-left: 1px solid #ebe5dc;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; color: #8c867f; font-weight: bold; margin-bottom: 6px;">
                      Delivery Address
                    </div>
                    <div style="font-size: 13px; color: #333; line-height: 1.4;">
                      ${customer.address}<br />
                      <strong>${customer.city}</strong>, ${customer.province || ''} ${customer.postalCode || ''}
                    </div>
                    ${customer.notes ? `<div style="font-size: 11px; color: #8c867f; margin-top: 6px; font-style: italic;">Note: "${customer.notes}"</div>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items Table -->
          <tr>
            <td style="padding: 10px 30px 20px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; color: #1a1814; font-weight: bold; margin-bottom: 8px;">
                Ordered Items (${(items || []).length})
              </div>
              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f5f1eb; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #67615c;">
                    <th align="left" style="padding: 8px 10px;">Item</th>
                    <th align="center" style="padding: 8px 10px; width: 40px;">Qty</th>
                    <th align="right" style="padding: 8px 10px; width: 90px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Financial Summary -->
          <tr>
            <td style="padding: 0 30px 25px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="border-top: 2px solid #e5dfd7; padding-top: 15px;">
                <tr>
                  <td style="font-size: 12px; color: #666; padding: 3px 0;">Subtotal</td>
                  <td align="right" style="font-size: 12px; color: #1a1814; padding: 3px 0;">${formatPKR(subtotal)}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #666; padding: 3px 0;">Shipping Delivery</td>
                  <td align="right" style="font-size: 12px; color: #1a1814; padding: 3px 0;">
                    ${shippingFee === 0 || !shippingFee ? 'FREE' : formatPKR(shippingFee)}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #666; padding: 3px 0;">Payment Method</td>
                  <td align="right" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #1a1814; font-weight: 600; padding: 3px 0;">
                    ${paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : (paymentMethod || 'COD')}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 15px; font-weight: bold; color: #1a1814; padding: 10px 0 0; border-top: 1px solid #eee;">Grand Total</td>
                  <td align="right" style="font-size: 17px; font-weight: bold; color: #1a1814; padding: 10px 0 0; border-top: 1px solid #eee;">${formatPKR(total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f6; padding: 20px 30px; text-align: center; border-top: 1px solid #ebe5dc; font-size: 11px; color: #8c867f;">
              <div>This is an automated notification from your YASRAF Atelier store.</div>
              <div style="margin-top: 4px;">Log in to the Admin Dashboard to manage fulfillment and update customer status.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Dispatch order notification email to yasraftextiles@gmail.com
 * Never throws — guarantees checkout flow is never blocked.
 */
export async function sendOrderNotificationEmail(orderData) {
  const apiKey = process.env.RESEND_API_KEY;
  const orderNumber = orderData.order_number || orderData.order_id || 'YAS-ORDER';

  if (!apiKey) {
    console.info(`[Email Service] RESEND_API_KEY not configured. To send live email notifications to ${ADMIN_EMAIL}, set RESEND_API_KEY in your Netlify Environment Variables. Order #${orderNumber} processed.`);
    return {
      success: false,
      skipped: true,
      reason: 'RESEND_API_KEY environment variable not configured'
    };
  }

  try {
    const html = generateOrderEmailHtml({
      orderNumber,
      orderId: orderData.order_id,
      customer: orderData.customer || {},
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      shippingFee: orderData.shipping_fee || 0,
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || 'cod',
      orderDate: orderData.created_at || new Date().toISOString()
    });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: DEFAULT_FROM.includes('@') ? DEFAULT_FROM : FALLBACK_FROM,
        to: [ADMIN_EMAIL],
        subject: `New YASRAF Order — ${orderNumber}`,
        html: html
      })
    });

    const result = await res.json();

    if (!res.ok) {
      // If custom domain is not yet verified in Resend, retry with onboarding fallback
      if (res.status === 403 && !DEFAULT_FROM.includes('onboarding@resend.dev')) {
        console.warn('[Email Service] Domain not verified, retrying with onboarding@resend.dev...');
        const retryRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: FALLBACK_FROM,
            to: [ADMIN_EMAIL],
            subject: `New YASRAF Order — ${orderNumber}`,
            html: html
          })
        });
        const retryResult = await retryRes.json();
        if (retryRes.ok) {
          console.info(`[Email Service] Notification sent successfully for Order #${orderNumber} to ${ADMIN_EMAIL} (id: ${retryResult.id})`);
          return { success: true, id: retryResult.id };
        }
      }

      console.warn('[Email Service] Resend API error:', result);
      return { success: false, error: result };
    }

    console.info(`[Email Service] Notification sent successfully for Order #${orderNumber} to ${ADMIN_EMAIL} (id: ${result.id})`);
    return { success: true, id: result.id };
  } catch (err) {
    console.error('[Email Service] Exception sending order notification:', err.message);
    return { success: false, error: err.message };
  }
}
