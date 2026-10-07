import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Search, Filter, Eye, Truck, CheckCircle, 
  Clock, Package, RefreshCw, X, MapPin, User, Phone, Mail 
} from 'lucide-react';
import { getAdminOrders } from '../services/supabaseService.js';

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminOrders();
      setOrders(data || []);
    } catch (err) {
      console.warn('Failed to load orders for admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        order.order_id?.toLowerCase().includes(query) ||
        order.customer_name?.toLowerCase().includes(query) ||
        order.customer_phone?.toLowerCase().includes(query) ||
        order.city?.toLowerCase().includes(query) ||
        order.order_items?.some((it) => 
          it.title?.toLowerCase().includes(query) || 
          it.sku?.toLowerCase().includes(query)
        );

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-900/10 text-emerald-800 border-emerald-300';
      case 'Dispatched':
        return 'bg-amber-900/10 text-amber-800 border-amber-300';
      case 'Artisan Inspection':
        return 'bg-blue-900/10 text-blue-800 border-blue-300';
      default:
        return 'bg-neutral-900/10 text-neutral-800 border-neutral-300';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e5dfd7] pb-6">
        <div>
          <h1 
            className="text-2xl md:text-3xl text-[#1a1814] font-normal tracking-wide"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            Orders &amp; Line Items
          </h1>
          <p className="text-xs uppercase tracking-[0.16em] text-[#8c867f] font-medium mt-1">
            Track customer orders and inspect item SKUs &amp; details
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#d5cfc4] bg-white text-[#1a1814] text-xs uppercase tracking-wider font-medium hover:bg-[#faf8f6] transition-colors cursor-pointer"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 border border-[#e5dfd7]">
        <div className="sm:col-span-8 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c867f]" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, phone, city, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#faf8f6] border border-[#e5dfd7] text-xs text-[#1a1814] focus:outline-none focus:border-[#1a1814]"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#faf8f6] border border-[#e5dfd7] text-xs text-[#1a1814] focus:outline-none focus:border-[#1a1814]"
          >
            <option value="all">All Order Statuses</option>
            <option value="Order Received">Order Received</option>
            <option value="Artisan Inspection">Artisan Inspection</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="text-center py-16 bg-white border border-[#e5dfd7]">
          <RefreshCw size={24} className="animate-spin mx-auto text-[#8c867f] mb-3" />
          <p className="text-xs uppercase tracking-wider text-[#8c867f]">Loading Atelier Orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#e5dfd7]">
          <ShoppingBag size={32} className="mx-auto text-[#8c867f] mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-[#1a1814]">No Orders Found</p>
          <p className="text-xs text-[#8c867f] mt-1">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search query or status filter.' 
              : 'Orders placed on the storefront will appear here with preserved SKUs.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5dfd7] overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e5dfd7] bg-[#faf8f6] text-[10px] uppercase tracking-[0.14em] text-[#8c867f]">
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Destination</th>
                <th className="py-3 px-4 font-semibold">Items &amp; SKU</th>
                <th className="py-3 px-4 font-semibold">Total</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece4]">
              {filteredOrders.map((order) => {
                const itemCount = order.order_items?.length || 0;
                return (
                  <tr key={order.order_id} className="hover:bg-[#faf8f6] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1a1814]">
                      {order.order_id}
                    </td>
                    <td className="py-3.5 px-4 text-[#666057]">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#1a1814]">{order.customer_name}</div>
                      <div className="text-[11px] text-[#8c867f]">{order.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#666057]">
                      {order.city}, {order.province}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {(order.order_items || []).slice(0, 2).map((it, idx) => (
                          <div key={idx} className="text-[11.5px]">
                            <span className="font-medium text-[#1a1814]">{it.title}</span>
                            {it.sku && (
                              <span className="ml-2 font-mono text-[10px] text-[#8c867f] uppercase bg-[#f5f1eb] px-1 py-0.5 border border-[#e5dfd7]">
                                SKU: {it.sku}
                              </span>
                            )}
                          </div>
                        ))}
                        {itemCount > 2 && (
                          <span className="text-[10px] text-[#8c867f] italic">
                            +{itemCount - 2} more {itemCount - 2 === 1 ? 'item' : 'items'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1a1814]">
                      Rs. {Number(order.total || 0).toLocaleString('en-PK')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border rounded-xs ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#1a1814] hover:bg-[#1a1814] hover:text-white border border-[#d5cfc4] transition-colors cursor-pointer"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal with full SKU inspection */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#d5cfc4] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#e5dfd7] pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a880] font-semibold">
                  Order Details
                </span>
                <h3 className="text-xl font-bold font-mono text-[#1a1814] mt-0.5">
                  {selectedOrder.order_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[#8c867f] hover:text-[#1a1814] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#faf8f6] border border-[#e5dfd7] text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8c867f] block font-semibold mb-1">
                  Customer &amp; Contact
                </span>
                <p className="font-medium text-[#1a1814] m-0">{selectedOrder.customer_name}</p>
                <p className="text-[#666057] m-0 mt-0.5">Phone: {selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && (
                  <p className="text-[#666057] m-0">Email: {selectedOrder.customer_email}</p>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8c867f] block font-semibold mb-1">
                  Shipping Address
                </span>
                <p className="text-[#666057] m-0">
                  {selectedOrder.shipping_address}<br />
                  {selectedOrder.city}, {selectedOrder.province} {selectedOrder.postal_code || ''}
                </p>
              </div>
            </div>

            {/* Line Items with SKU */}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#1a1814] font-bold block mb-3">
                Order Items ({selectedOrder.order_items?.length || 0})
              </span>
              <div className="space-y-3">
                {(selectedOrder.order_items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#faf8f6] border border-[#e5dfd7]">
                    <img
                      src={item.image || '/products/yasraf-meerab-black-1.png'}
                      alt={item.title}
                      className="w-12 h-16 object-cover bg-white border border-[#e5dfd7]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-[#1a1814] m-0 truncate">
                        {item.title}
                      </h4>
                      {item.sku && (
                        <div className="text-[10.5px] text-[#8c867f] uppercase font-mono tracking-wider mt-0.5">
                          SKU: {item.sku}
                        </div>
                      )}
                      <div className="text-[11px] text-[#666057] mt-0.5">
                        Size: {item.size || 'M'} {item.color ? `• Color: ${item.color}` : ''} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs text-[#1a1814]">
                        Rs. {Number(item.line_total || item.unit_price * item.quantity).toLocaleString('en-PK')}
                      </div>
                      <div className="text-[10px] text-[#8c867f]">
                        Rs. {Number(item.unit_price || item.price).toLocaleString('en-PK')} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-[#e5dfd7] pt-4 space-y-1.5 text-xs text-[#666057]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {Number(selectedOrder.subtotal || 0).toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{selectedOrder.shipping_fee ? `Rs. ${Number(selectedOrder.shipping_fee).toLocaleString('en-PK')}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1a1814] pt-2 border-t border-[#e5dfd7]">
                <span>Total Amount</span>
                <span>Rs. {Number(selectedOrder.total || 0).toLocaleString('en-PK')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
