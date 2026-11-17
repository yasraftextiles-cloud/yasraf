import React from 'react';
import { Printer, X } from 'lucide-react';

export default function OrderPackingSlip({ order, onClose }) {
  if (!order) return null;

  const orderNumber = order.order_number || order.order_id;
  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-PK');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-[#d5cfc4]">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 bg-[#141311] text-[#f7f4ee] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#c5a880] font-semibold">
              Packing Slip &amp; Dispatch Invoice
            </span>
            <span className="text-xs text-[#8c867f]">|</span>
            <span className="font-mono font-bold text-sm text-white">{orderNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c5a880] text-[#141311] text-xs font-semibold uppercase tracking-wider hover:bg-[#dfc7a7] transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8c867f] hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Canvas */}
        <div id="printable-packing-slip" className="p-8 sm:p-10 overflow-y-auto space-y-6 text-[#1a1814] text-xs font-sans">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-[#1a1814] pb-6">
            <div>
              <h1 
                className="text-3xl text-[#1a1814] font-normal tracking-wider m-0"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                YASRAF
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#8c867f] font-semibold mt-0.5">
                Luxury Pret &amp; Artisanal Textiles
              </p>
              <p className="text-[11px] text-[#666] mt-2">
                Lahore, Pakistan · info@yasraftextiles.com · www.yasraftextiles.com
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-[#1a1814] text-white font-mono text-xs font-bold uppercase tracking-wider">
                PACKING SLIP
              </span>
              <div className="mt-2 text-right">
                <div className="text-[10px] uppercase text-[#8c867f] font-semibold">Order Reference</div>
                <div className="font-mono font-bold text-base text-[#1a1814]">{orderNumber}</div>
                {order.order_id && order.order_id !== orderNumber && (
                  <div className="font-mono text-[10px] text-[#8c867f]">Internal ID: {order.order_id}</div>
                )}
                <div className="text-[11px] text-[#666] mt-1">Date: {orderDate}</div>
              </div>
            </div>
          </div>

          {/* Consignee & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-[#faf8f6] border border-[#e5dfd7]">
            <div>
              <span className="text-[9.5px] uppercase tracking-[0.16em] text-[#8c867f] font-bold block mb-1.5">
                Ship To (Consignee)
              </span>
              <div className="font-bold text-sm text-[#1a1814]">{order.customer_name}</div>
              <div className="text-[#444] mt-1 leading-relaxed">
                {order.shipping_address}<br />
                <strong>{order.city}</strong>, {order.province || ''} {order.postal_code || ''}
              </div>
              <div className="mt-2 font-medium text-[#1a1814]">
                Phone: <span className="font-mono">{order.customer_phone}</span>
              </div>
              {order.customer_email && (
                <div className="text-[#666]">Email: {order.customer_email}</div>
              )}
            </div>

            <div className="border-l border-[#e5dfd7] pl-6 space-y-3">
              <div>
                <span className="text-[9.5px] uppercase tracking-[0.16em] text-[#8c867f] font-bold block mb-1">
                  Payment Mode
                </span>
                <span className="inline-block px-2 py-0.5 bg-white border border-[#1a1814] font-bold text-xs uppercase">
                  {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : order.payment_method}
                </span>
              </div>

              <div>
                <span className="text-[9.5px] uppercase tracking-[0.16em] text-[#8c867f] font-bold block mb-1">
                  Amount to Collect
                </span>
                <div className="font-bold text-lg font-mono text-[#1a1814]">
                  Rs. {Number(order.total || 0).toLocaleString('en-PK')}
                </div>
              </div>

              {order.notes && (
                <div>
                  <span className="text-[9.5px] uppercase tracking-[0.16em] text-[#8c867f] font-bold block mb-0.5">
                    Customer Note
                  </span>
                  <div className="text-[11px] text-[#666] italic bg-white p-2 border border-[#e5dfd7]">
                    "{order.notes}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[#1a1814] text-[10px] uppercase tracking-wider text-[#1a1814]">
                  <th className="py-2 px-2 font-bold">#</th>
                  <th className="py-2 px-2 font-bold">Item Description</th>
                  <th className="py-2 px-2 font-bold">SKU</th>
                  <th className="py-2 px-2 font-bold">Size / Color</th>
                  <th className="py-2 px-2 font-bold text-center">Qty</th>
                  <th className="py-2 px-2 font-bold text-right">Price</th>
                  <th className="py-2 px-2 font-bold text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee]">
                {(order.order_items || []).map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-3 px-2 text-[#8c867f]">{idx + 1}</td>
                    <td className="py-3 px-2 font-medium text-[#1a1814]">
                      {item.title}
                    </td>
                    <td className="py-3 px-2 font-mono text-[11px] text-[#666]">
                      {item.sku || '—'}
                    </td>
                    <td className="py-3 px-2 text-[#666]">
                      {item.size || 'M'} {item.color ? `· ${item.color}` : ''}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-[#1a1814]">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-right text-[#666]">
                      Rs. {Number(item.unit_price || item.price || 0).toLocaleString('en-PK')}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-[#1a1814]">
                      Rs. {Number(item.line_total || ((item.unit_price || item.price || 0) * item.quantity)).toLocaleString('en-PK')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-3">
            <div className="w-64 space-y-1.5 border-t-2 border-[#1a1814] pt-3 text-xs">
              <div className="flex justify-between text-[#666]">
                <span>Subtotal:</span>
                <span>Rs. {Number(order.subtotal || 0).toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-[#666]">
                <span>Shipping Delivery:</span>
                <span>{order.shipping_fee ? `Rs. ${Number(order.shipping_fee).toLocaleString('en-PK')}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1a1814] pt-2 border-t border-[#eee]">
                <span>Total Amount:</span>
                <span className="font-mono">Rs. {Number(order.total || 0).toLocaleString('en-PK')}</span>
              </div>
            </div>
          </div>

          {/* Courier Verification & Signatures */}
          <div className="pt-8 border-t border-[#e5dfd7] grid grid-cols-2 gap-8 text-[11px] text-[#666]">
            <div>
              <p className="font-semibold text-[#1a1814] mb-4">Dispatcher Verification:</p>
              <div className="border-b border-[#ccc] w-48 mb-1"></div>
              <span>Inspected &amp; Packed by YASRAF Atelier</span>
            </div>
            <div>
              <p className="font-semibold text-[#1a1814] mb-4">Receiver Signature &amp; Date:</p>
              <div className="border-b border-[#ccc] w-48 mb-1"></div>
              <span>Package received sealed in original condition</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
