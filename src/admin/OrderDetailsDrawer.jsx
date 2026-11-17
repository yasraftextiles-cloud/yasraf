import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, Phone, Mail, MapPin, Truck, Printer, Archive, 
  RotateCcw, Trash2, Clock, CheckCircle2, ChevronRight, MessageSquare, 
  ExternalLink, AlertTriangle, ShieldAlert, Loader2 
} from 'lucide-react';
import { 
  ORDER_STATUSES, 
  getStatusBadgeClass, 
  getStatusLabel,
  normalizeStatus,
  updateOrderStatus, 
  archiveOrder, 
  deleteOrderPermanently,
  getOrderStatusHistory 
} from '../services/supabaseService.js';
import OrderPackingSlip from './OrderPackingSlip.jsx';

export default function OrderDetailsDrawer({ 
  order, 
  currentUser,
  onClose, 
  onOrderUpdated, 
  onOrderDeleted 
}) {
  if (!order) return null;

  const orderNumber = order.order_number || order.order_id;
  const [currentStatus, setCurrentStatus] = useState(normalizeStatus(order.status));
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [copiedId, setCopiedId] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [showPackingSlip, setShowPackingSlip] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Fetch status audit history
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      setIsLoadingHistory(true);
      try {
        const data = await getOrderStatusHistory(order.order_id);
        if (isMounted) setHistory(data || []);
      } catch (err) {
        console.warn('Could not load status history:', err);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    }
    loadHistory();
    return () => { isMounted = false; };
  }, [order.order_id]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (currentStatus === normalizeStatus(order.status) && !statusNotes.trim()) return;

    setIsUpdatingStatus(true);
    setStatusMessage(null);
    try {
      await updateOrderStatus(
        order.order_id, 
        currentStatus, 
        statusNotes.trim(),
        currentUser?.email
      );

      setStatusMessage({ type: 'success', text: `Status updated to "${getStatusLabel(currentStatus)}"` });
      setStatusNotes('');

      // Refresh history
      const newHistory = await getOrderStatusHistory(order.order_id);
      setHistory(newHistory || []);

      if (onOrderUpdated) {
        onOrderUpdated({ ...order, status: currentStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update order status' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleArchive = async () => {
    const shouldArchive = !order.is_archived;
    setIsArchiving(true);
    try {
      await archiveOrder(order.order_id, shouldArchive);
      if (onOrderUpdated) {
        onOrderUpdated({ ...order, is_archived: shouldArchive });
      }
      onClose();
    } catch (err) {
      alert(`Error archiving order: ${err.message}`);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteInput !== orderNumber && deleteInput !== 'DELETE') {
      alert('Please type DELETE or the exact Order Number to confirm.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOrderPermanently(order.order_id);
      if (onOrderDeleted) {
        onOrderDeleted(order.order_id);
      }
      onClose();
    } catch (err) {
      alert(`Error deleting order: ${err.message}`);
      setIsDeleting(false);
    }
  };

  // Format WhatsApp Link (strip non-digits, ensure 92 country code)
  const cleanPhone = (order.customer_phone || '').replace(/\D/g, '');
  const waPhone = cleanPhone.startsWith('0') 
    ? '92' + cleanPhone.slice(1) 
    : cleanPhone.startsWith('92') 
      ? cleanPhone 
      : '92' + cleanPhone;
  const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Assalam-o-Alaikum ${order.customer_name}! Regarding your YASRAF order #${orderNumber}:`)}`;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
        <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl border-l border-[#d5cfc4] animate-in slide-in-from-right duration-200">
          
          {/* 1. Header Bar */}
          <div className="p-6 bg-[#141311] text-[#f7f4ee] flex items-start justify-between border-b border-[#262320] shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#c5a880] font-semibold">
                  {order.is_archived ? 'Archived Order Details' : 'Atelier Order Details'}
                </span>
                {order.is_archived && (
                  <span className="bg-neutral-800 text-neutral-300 text-[9px] uppercase px-1.5 py-0.5 rounded-xs font-semibold">
                    Archived
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wide">
                  {orderNumber}
                </h2>
                <button
                  onClick={() => handleCopy(orderNumber, 'id')}
                  className="p-1 text-[#8c867f] hover:text-[#c5a880] transition-colors cursor-pointer"
                  title="Copy Short Order Number"
                >
                  {copiedId ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                </button>
              </div>

              {order.order_id && order.order_id !== orderNumber && (
                <div className="text-[11px] font-mono text-[#8c867f] mt-0.5">
                  Internal ID: {order.order_id}
                </div>
              )}

              <div className="text-[11px] text-[#8c867f] mt-1">
                Placed on {order.created_at ? new Date(order.created_at).toLocaleString('en-PK', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                }) : '—'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPackingSlip(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#f7f4ee] text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer"
                title="Print Packing Slip"
              >
                <Printer size={13} />
                <span>Print Slip</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-[#8c867f] hover:text-white transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* 2. Actions Toolbar */}
          <div className="px-6 py-2.5 bg-[#faf8f6] border-b border-[#e5dfd7] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2.5 py-0.5 text-[10.5px] uppercase tracking-wider font-semibold border ${getStatusBadgeClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
              <span className="text-[11px] text-[#8c867f]">
                Payment: <strong className="uppercase text-[#1a1814]">{order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : order.payment_method}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPackingSlip(true)}
                className="sm:hidden inline-flex items-center gap-1 px-2 py-1 text-xs text-[#1a1814] border border-[#d5cfc4] bg-white cursor-pointer"
              >
                <Printer size={12} /> Slip
              </button>

              <button
                onClick={handleToggleArchive}
                disabled={isArchiving}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#1a1814] hover:bg-[#1a1814] hover:text-white border border-[#d5cfc4] transition-colors cursor-pointer"
                title={order.is_archived ? "Restore to active orders" : "Move order to archives"}
              >
                {order.is_archived ? (
                  <><RotateCcw size={12} /> <span>Restore</span></>
                ) : (
                  <><Archive size={12} /> <span>Archive</span></>
                )}
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-700 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                title="Permanently delete test order"
              >
                <Trash2 size={12} /> <span>Delete</span>
              </button>
            </div>
          </div>

          {/* 3. Main Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Status Update Card */}
            <div className="bg-[#faf8f6] border border-[#e5dfd7] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c867f] font-bold">
                  Update Order Status
                </span>
                <span className="text-[11px] text-[#666057]">
                  Current: <strong className="text-[#1a1814]">{getStatusLabel(order.status)}</strong>
                </span>
              </div>

              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#d5cfc4] text-xs text-[#1a1814] font-medium focus:outline-none focus:border-[#1a1814]"
                  >
                    {ORDER_STATUSES.map(st => (
                      <option key={st.id} value={st.id}>
                        Step {st.step}: {st.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Optional tracking note / reason..."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#d5cfc4] text-xs text-[#1a1814] focus:outline-none focus:border-[#1a1814]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {statusMessage && (
                    <span className={`text-xs ${statusMessage.type === 'success' ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}`}>
                      {statusMessage.text}
                    </span>
                  )}
                  {!statusMessage && <div />}

                  <button
                    type="submit"
                    disabled={isUpdatingStatus || (currentStatus === order.status && !statusNotes.trim())}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1a1814] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#333] disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isUpdatingStatus ? (
                      <><Loader2 size={12} className="animate-spin" /> <span>Saving...</span></>
                    ) : (
                      <span>Save Status</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Customer Information Card */}
            <div className="border border-[#e5dfd7] p-5 space-y-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c867f] font-bold block">
                Customer &amp; Shipping Destination
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Contact */}
                <div className="space-y-1.5">
                  <div className="font-bold text-sm text-[#1a1814]">{order.customer_name}</div>
                  
                  <div className="flex items-center gap-2 text-[#444]">
                    <Phone size={13} className="text-[#8c867f] shrink-0" />
                    <span className="font-mono">{order.customer_phone}</span>
                    <button
                      onClick={() => handleCopy(order.customer_phone, 'phone')}
                      className="p-0.5 text-[#8c867f] hover:text-[#1a1814]"
                      title="Copy Phone"
                    >
                      {copiedPhone ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>

                  {cleanPhone && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#128C7E] hover:underline"
                    >
                      <MessageSquare size={12} />
                      <span>Message on WhatsApp</span>
                    </a>
                  )}

                  {order.customer_email && (
                    <div className="flex items-center gap-2 text-[#666]">
                      <Mail size={13} className="text-[#8c867f] shrink-0" />
                      <a href={`mailto:${order.customer_email}`} className="hover:underline">{order.customer_email}</a>
                    </div>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-[#e5dfd7] pt-3 sm:pt-0 sm:pl-4">
                  <div className="flex items-start gap-2 text-[#444]">
                    <MapPin size={14} className="text-[#8c867f] shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      {order.shipping_address}<br />
                      <strong>{order.city}</strong>, {order.province || ''} {order.postal_code || ''}
                    </div>
                  </div>

                  {order.notes && (
                    <div className="text-[11px] text-[#666057] italic bg-[#faf8f6] p-2 border border-[#e5dfd7] mt-2">
                      Customer Note: "{order.notes}"
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Card */}
            <div className="border border-[#e5dfd7] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c867f] font-bold">
                  Ordered Items ({order.order_items?.length || 0})
                </span>
                <span className="text-xs text-[#8c867f]">
                  Total Qty: {(order.order_items || []).reduce((acc, it) => acc + (it.quantity || 1), 0)}
                </span>
              </div>

              <div className="space-y-3">
                {(order.order_items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#faf8f6] border border-[#e5dfd7]">
                    <img
                      src={item.image || '/products/yasraf-meerab-black-1.png'}
                      alt={item.title}
                      className="w-14 h-18 object-cover bg-white border border-[#e5dfd7] shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-[#1a1814] truncate">
                        {item.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {item.sku && (
                          <span className="font-mono text-[10px] text-[#1a1814] bg-white px-1.5 py-0.5 border border-[#d5cfc4] uppercase font-semibold">
                            SKU: {item.sku}
                          </span>
                        )}
                        <span className="text-[11px] text-[#666]">
                          Size: <strong>{item.size || 'M'}</strong>
                        </span>
                        {item.color && (
                          <span className="text-[11px] text-[#666]">
                            Color: <strong>{item.color}</strong>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-[#8c867f] mt-1">
                        Qty: {item.quantity} × Rs. {Number(item.unit_price || item.price || 0).toLocaleString('en-PK')}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-xs text-[#1a1814]">
                        Rs. {Number(item.line_total || ((item.unit_price || item.price || 0) * item.quantity)).toLocaleString('en-PK')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="border-t border-[#e5dfd7] pt-3 space-y-1.5 text-xs text-[#666057]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {Number(order.subtotal || 0).toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{order.shipping_fee ? `Rs. ${Number(order.shipping_fee).toLocaleString('en-PK')}` : 'FREE (Nationwide)'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1a1814] pt-2 border-t border-[#e5dfd7]">
                  <span>Total Amount</span>
                  <span className="font-mono">Rs. {Number(order.total || 0).toLocaleString('en-PK')}</span>
                </div>
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="border border-[#e5dfd7] p-5 space-y-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c867f] font-bold block">
                Status History &amp; Audit Trail
              </span>

              {isLoadingHistory ? (
                <div className="py-4 text-center text-xs text-[#8c867f]">
                  <Loader2 size={16} className="animate-spin mx-auto mb-1 text-[#c5a880]" />
                  Loading history...
                </div>
              ) : history.length === 0 ? (
                <div className="text-xs text-[#8c867f] py-2">
                  No status updates recorded yet. Order initialized at "Order Received".
                </div>
              ) : (
                <div className="relative border-l-2 border-[#d5cfc4] ml-3 pl-4 space-y-4 text-xs">
                  {history.map((h, i) => (
                    <div key={h.id || i} className="relative">
                      <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-[#1a1814] border-2 border-white" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1a1814]">{getStatusLabel(h.new_status)}</span>
                          {h.previous_status && (
                            <span className="text-[11px] text-[#8c867f]">
                              (from {getStatusLabel(h.previous_status)})
                            </span>
                          )}
                        </div>

                        <div className="text-[10.5px] text-[#8c867f] mt-0.5">
                          {new Date(h.created_at).toLocaleString('en-PK', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                          {h.changed_by_email && ` by ${h.changed_by_email}`}
                        </div>

                        {h.notes && (
                          <div className="mt-1 text-[11px] text-[#444] bg-[#faf8f6] p-1.5 border border-[#e5dfd7]">
                            {h.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* 4. Footer */}
          <div className="p-4 bg-[#faf8f6] border-t border-[#e5dfd7] flex items-center justify-between text-xs shrink-0">
            <span className="text-[#8c867f]">
              YASRAF Atelier Management System
            </span>

            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#d5cfc4] bg-white text-[#1a1814] uppercase tracking-wider font-medium hover:bg-[#faf8f6] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      {/* Printable Packing Slip Modal */}
      {showPackingSlip && (
        <OrderPackingSlip order={order} onClose={() => setShowPackingSlip(false)} />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md border border-rose-300 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-700">
              <ShieldAlert size={24} />
              <h3 className="font-bold text-base text-[#1a1814]">Permanently Delete Order?</h3>
            </div>

            <p className="text-xs text-[#666057] leading-relaxed">
              This action is permanent and completely purges order <strong className="font-mono text-[#1a1814]">{orderNumber}</strong> and its line items.
              Normal completed orders should be <strong>Archived</strong> instead of deleted.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#1a1814] uppercase tracking-wider">
                Type <span className="font-mono text-rose-700 font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-[#d5cfc4] text-xs font-mono focus:outline-none focus:border-rose-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                className="px-3 py-1.5 text-xs border border-[#d5cfc4] hover:bg-[#faf8f6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || (deleteInput !== 'DELETE' && deleteInput !== orderNumber)}
                className="px-4 py-1.5 text-xs bg-rose-700 text-white font-semibold uppercase tracking-wider hover:bg-rose-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
