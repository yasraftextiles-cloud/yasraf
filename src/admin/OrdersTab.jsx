import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShoppingBag, Search, Filter, Eye, Truck, CheckCircle2, 
  Clock, Package, RefreshCw, X, MapPin, User, Phone, Mail,
  Copy, Check, Archive, RotateCcw, Trash2, ArrowUpDown, 
  ChevronLeft, ChevronRight, MessageSquare, AlertCircle, Sparkles
} from 'lucide-react';
import { 
  getAdminOrders,
  getAdminOrderById,
  getOrderSummaryStats, 
  ORDER_STATUSES, 
  getStatusBadgeClass,
  getStatusLabel,
  normalizeStatus,
  archiveOrder,
  updateOrderStatus
} from '../services/supabaseService.js';
import OrderDetailsDrawer from './OrderDetailsDrawer.jsx';

export default function OrdersTab({ initialOrderId = null, onClearInitialOrder, currentUser }) {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, shipped: 0, delivered: 0, archived: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // View state: 'active' | 'archived'
  const [viewMode, setViewMode] = useState('active');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | '7days' | '30days'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'amount_desc' | 'amount_asc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Selected Order for Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // Fetch orders and KPI stats
  const fetchOrdersAndStats = useCallback(async (quiet = false) => {
    if (quiet !== true) setIsLoading(true);
    try {
      const [orderList, summary] = await Promise.all([
        getAdminOrders({ includeArchived: viewMode === 'archived' }),
        getOrderSummaryStats()
      ]);

      setOrders(orderList || []);
      if (summary) setStats(summary);
    } catch (err) {
      console.warn('Failed to load orders for admin:', err);
    } finally {
      if (quiet !== true) setIsLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchOrdersAndStats();

    const timer = window.setInterval(() => fetchOrdersAndStats(true), 30_000);
    return () => window.clearInterval(timer);
  }, [fetchOrdersAndStats]);

  // Handle incoming initialOrderId from notification bell
  useEffect(() => {
    if (!initialOrderId) return;
    let cancelled = false;
    getAdminOrderById(initialOrderId)
      .then(target => {
        if (cancelled) return;
        if (target) {
          setViewMode(target.is_archived ? 'archived' : 'active');
          setSelectedOrder(target);
        } else {
          alert('This order is no longer available.');
        }
      })
      .catch(error => {
        if (!cancelled) alert(`Could not open order: ${error.message}`);
      })
      .finally(() => {
        if (!cancelled) onClearInitialOrder?.();
      });
    return () => { cancelled = true; };
  }, [initialOrderId, onClearInitialOrder]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter, dateFilter, sortBy, viewMode]);

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchQuery.toLowerCase().trim();
      const shortId = order.order_number || '';
      const orderId = order.order_id || '';
      const customerName = order.customer_name || '';
      const customerPhone = order.customer_phone || '';
      const city = order.city || '';

      const matchesSearch = !query || 
        shortId.toLowerCase().includes(query) ||
        orderId.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        customerPhone.toLowerCase().includes(query) ||
        city.toLowerCase().includes(query) ||
        order.order_items?.some((it) => 
          it.title?.toLowerCase().includes(query) || 
          it.sku?.toLowerCase().includes(query)
        );

      // Status match (case-insensitive & canonical-safe)
      const matchesStatus = statusFilter === 'all' || normalizeStatus(order.status) === normalizeStatus(statusFilter);

      // Payment match
      const matchesPayment = paymentFilter === 'all' || order.payment_method === paymentFilter;

      // Date match
      let matchesDate = true;
      if (dateFilter !== 'all' && order.created_at) {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        if (dateFilter === 'today') {
          matchesDate = orderDate.toDateString() === now.toDateString();
        } else if (dateFilter === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= sevenDaysAgo;
        } else if (dateFilter === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= thirtyDaysAgo;
        }
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === 'amount_desc') {
        return (Number(b.total) || 0) - (Number(a.total) || 0);
      }
      if (sortBy === 'amount_asc') {
        return (Number(a.total) || 0) - (Number(b.total) || 0);
      }
      return 0;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter, dateFilter, sortBy]);

  // Pagination calculation
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Quick Status change from table
  const handleQuickStatusChange = async (order, newStatus) => {
    if (normalizeStatus(order.status) === newStatus) return;
    try {
      const updatedOrder = await updateOrderStatus(order.order_id, newStatus, 'Quick table update');
      setOrders(prev => prev.map(o => o.order_id === order.order_id ? { ...o, ...updatedOrder } : o));
      const summary = await getOrderSummaryStats();
      if (summary) setStats(summary);
    } catch (err) {
      alert(`Could not update status: ${err.message}`);
    }
  };

  // Quick Archive / Restore
  const handleQuickArchive = async (order) => {
    const shouldArchive = !order.is_archived;
    try {
      await archiveOrder(order.order_id, shouldArchive);
      setOrders(prev => prev.filter(o => o.order_id !== order.order_id));
      const summary = await getOrderSummaryStats();
      if (summary) setStats(summary);
    } catch (err) {
      alert(`Could not archive order: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e5dfd7] pb-5">
        <div>
          <h1 
            className="text-2xl sm:text-3xl text-[#1a1814] font-normal tracking-wide"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            Orders &amp; Line Items
          </h1>
          <p className="text-xs uppercase tracking-[0.16em] text-[#8c867f] font-medium mt-1">
            Complete E-Commerce Order Fulfillment, Status Control &amp; Line Item Inspection
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active vs Archived View Switcher */}
          <div className="inline-flex border border-[#d5cfc4] bg-[#faf8f6] p-0.5">
            <button
              onClick={() => setViewMode('active')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === 'active' 
                  ? 'bg-[#1a1814] text-white shadow-xs' 
                  : 'text-[#666057] hover:text-[#1a1814]'
              }`}
            >
              Active ({stats.total})
            </button>
            <button
              onClick={() => setViewMode('archived')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === 'archived' 
                  ? 'bg-[#1a1814] text-white shadow-xs' 
                  : 'text-[#666057] hover:text-[#1a1814]'
              }`}
            >
              Archived ({stats.archived})
            </button>
          </div>

          <button
            onClick={fetchOrdersAndStats}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#d5cfc4] bg-white text-[#1a1814] text-xs uppercase tracking-wider font-medium hover:bg-[#faf8f6] transition-colors cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Compact KPI Summary Cards (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white border border-[#e5dfd7] p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c867f] font-semibold block">
              Total Active
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#1a1814] mt-1">
              {stats.total}
            </div>
            <span className="text-[11px] text-[#8c867f]">Orders in store</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#faf8f6] border border-[#e5dfd7] flex items-center justify-center text-[#1a1814]">
            <ShoppingBag size={18} strokeWidth={1.75} />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-[#e5dfd7] p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-semibold block">
              Pending Prep
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#1a1814] mt-1">
              {stats.pending}
            </div>
            <span className="text-[11px] text-[#8c867f]">Awaiting dispatch</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock size={18} strokeWidth={1.75} />
          </div>
        </div>

        {/* Shipped Orders */}
        <div className="bg-white border border-[#e5dfd7] p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-800 font-semibold block">
              In Transit
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#1a1814] mt-1">
              {stats.shipped}
            </div>
            <span className="text-[11px] text-[#8c867f]">Shipped / Out for delivery</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-800">
            <Truck size={18} strokeWidth={1.75} />
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white border border-[#e5dfd7] p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-800 font-semibold block">
              Delivered
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#1a1814] mt-1">
              {stats.delivered}
            </div>
            <span className="text-[11px] text-[#8c867f]">Completed &amp; collected</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
            <CheckCircle2 size={18} strokeWidth={1.75} />
          </div>
        </div>
      </div>

      {/* 3. Search, Filters & Sorting Toolbar */}
      <div className="bg-white border border-[#e5dfd7] p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c867f]" />
            <input
              type="text"
              placeholder="Search by Order #, Customer, Phone, City, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#faf8f6] border border-[#e5dfd7] text-xs text-[#1a1814] placeholder-[#8c867f] focus:outline-none focus:border-[#1a1814]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c867f] hover:text-[#1a1814]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf8f6] border border-[#e5dfd7] text-xs text-[#1a1814] focus:outline-none focus:border-[#1a1814]"
            >
              <option value="all">All Statuses ({orders.length})</option>
              {ORDER_STATUSES.map(st => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="md:col-span-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf8f6] border border-[#e5dfd7] text-xs text-[#1a1814] focus:outline-none focus:border-[#1a1814]"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf8f6] border border-[#e5dfd7] text-xs text-[#1a1814] focus:outline-none focus:border-[#1a1814]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Filter Badges & Clear Filter */}
        {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all' || paymentFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f0ece4] text-[11px]">
            <span className="text-[#8c867f]">Active Filters:</span>
            {searchQuery && (
              <span className="bg-[#f5f1eb] text-[#1a1814] px-2 py-0.5 border border-[#e5dfd7] flex items-center gap-1">
                Query: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X size={10} /></button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="bg-[#f5f1eb] text-[#1a1814] px-2 py-0.5 border border-[#e5dfd7] flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')}><X size={10} /></button>
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="bg-[#f5f1eb] text-[#1a1814] px-2 py-0.5 border border-[#e5dfd7] flex items-center gap-1">
                Date: {dateFilter}
                <button onClick={() => setDateFilter('all')}><X size={10} /></button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFilter('all');
                setPaymentFilter('all');
              }}
              className="text-[#c5a880] hover:text-[#1a1814] font-medium ml-2 underline cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Professional Orders Table */}
      {isLoading ? (
        <div className="text-center py-20 bg-white border border-[#e5dfd7]">
          <RefreshCw size={26} className="animate-spin mx-auto text-[#c5a880] mb-3" />
          <p className="text-xs uppercase tracking-wider text-[#8c867f] font-semibold">
            Loading Atelier Orders...
          </p>
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#e5dfd7]">
          <ShoppingBag size={36} className="mx-auto text-[#c5a880]/60 mb-3" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-[#1a1814]">No Orders Found</p>
          <p className="text-xs text-[#8c867f] mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your search criteria or resetting the active filters.'
              : viewMode === 'archived'
                ? 'No archived orders. Archived orders will appear here for safekeeping and restoration.'
                : 'Customer orders placed on the storefront will appear here with short order numbers and real-time alerts.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e5dfd7] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#e5dfd7] bg-[#faf8f6] text-[10px] uppercase tracking-[0.14em] text-[#8c867f]">
                  <th className="py-3 px-4 font-bold">Order ID</th>
                  <th className="py-3 px-4 font-bold">Date &amp; Time</th>
                  <th className="py-3 px-4 font-bold">Customer</th>
                  <th className="py-3 px-4 font-bold">City</th>
                  <th className="py-3 px-4 font-bold">Products / Qty</th>
                  <th className="py-3 px-4 font-bold">Total</th>
                  <th className="py-3 px-4 font-bold">Payment</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {paginatedOrders.map((order) => {
                  const shortId = order.order_number || order.order_id;
                  const totalItemsInOrder = (order.order_items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
                  const isCopied = copiedOrderId === order.order_id;

                  return (
                    <tr 
                      key={order.order_id} 
                      className="hover:bg-[#faf8f6]/80 transition-colors group"
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span 
                            onClick={() => setSelectedOrder(order)}
                            className="font-mono font-bold text-[#1a1814] hover:text-[#c5a880] transition-colors cursor-pointer text-[12.5px]"
                          >
                            {shortId}
                          </span>
                          <button
                            onClick={() => handleCopy(shortId, order.order_id)}
                            className="text-[#8c867f] hover:text-[#1a1814] p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Copy Order ID"
                          >
                            {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                        {order.order_id && order.order_id !== shortId && (
                          <div className="font-mono text-[9.5px] text-[#8c867f] truncate max-w-[120px]">
                            {order.order_id}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-[#666057] whitespace-nowrap">
                        <div className="font-medium text-[#1a1814]">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </div>
                        <div className="text-[10.5px] text-[#8c867f]">
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#1a1814]">{order.customer_name}</div>
                        <div className="text-[11px] font-mono text-[#8c867f] flex items-center gap-1">
                          <span>{order.customer_phone}</span>
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 text-[#666057] whitespace-nowrap">
                        <div className="font-medium text-[#1a1814]">{order.city}</div>
                        <div className="text-[10px] text-[#8c867f]">{order.province}</div>
                      </td>

                      {/* Products / Quantity */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-xs">
                          {(order.order_items || []).slice(0, 2).map((it, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] truncate">
                              <span className="font-medium text-[#1a1814] truncate">{it.title}</span>
                              <span className="text-[#8c867f] shrink-0 font-mono text-[10px]">×{it.quantity}</span>
                              {it.sku && (
                                <span className="font-mono text-[9px] text-[#666] bg-[#f5f1eb] px-1 py-0.2 border border-[#e5dfd7] uppercase shrink-0">
                                  {it.sku}
                                </span>
                              )}
                            </div>
                          ))}
                          {(order.order_items?.length || 0) > 2 && (
                            <span className="text-[10px] text-[#8c867f] italic block">
                              +{(order.order_items?.length || 0) - 2} more items ({totalItemsInOrder} total pcs)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1a1814] whitespace-nowrap text-[12.5px]">
                        Rs. {Number(order.total || 0).toLocaleString('en-PK')}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#faf8f6] border border-[#d5cfc4] text-[#1a1814]">
                          {order.payment_method === 'cod' ? 'COD' : (order.payment_method || 'COD')}
                        </span>
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={normalizeStatus(order.status)}
                          onChange={(e) => handleQuickStatusChange(order, e.target.value)}
                          className={`text-[10px] uppercase tracking-wider font-semibold border px-2 py-0.5 rounded-none cursor-pointer focus:outline-none ${getStatusBadgeClass(order.status)}`}
                          title="Click to quickly update status"
                        >
                          {ORDER_STATUSES.map(st => (
                            <option key={st.id} value={st.id} className="bg-white text-black normal-case">
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#1a1814] bg-white hover:bg-[#1a1814] hover:text-white border border-[#d5cfc4] transition-colors cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleQuickArchive(order)}
                            className="p-1 text-[#8c867f] hover:text-[#1a1814] hover:bg-[#faf8f6] border border-transparent hover:border-[#d5cfc4] transition-colors cursor-pointer"
                            title={order.is_archived ? "Restore Order" : "Archive Order"}
                          >
                            {order.is_archived ? <RotateCcw size={13} /> : <Archive size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 5. Pagination Bar */}
          <div className="p-4 border-t border-[#e5dfd7] bg-[#faf8f6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#666057]">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong>{Math.min(totalItems, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
                <strong>{Math.min(totalItems, currentPage * pageSize)}</strong> of{' '}
                <strong>{totalItems}</strong> orders
              </span>

              <span className="text-[#d5cfc4]">|</span>

              <div className="flex items-center gap-1 text-[11px]">
                <span>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-[#d5cfc4] px-1.5 py-0.5 text-xs text-[#1a1814]"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-[#d5cfc4] bg-white disabled:opacity-30 hover:bg-[#faf8f6] cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  // Show only current, first, last, and near current
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 text-xs font-semibold border cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#1a1814] text-white border-[#1a1814]'
                            : 'bg-white text-[#1a1814] border-[#d5cfc4] hover:bg-[#faf8f6]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-1 text-[#8c867f]">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-[#d5cfc4] bg-white disabled:opacity-30 hover:bg-[#faf8f6] cursor-pointer"
                  aria-label="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Order Details Drawer Modal */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          currentUser={currentUser}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={(updated) => {
            setOrders(prev => prev.flatMap(o => o.order_id !== updated.order_id
              ? [o]
              : Boolean(updated.is_archived) === (viewMode === 'archived') ? [updated] : []));
            setSelectedOrder(updated);
            getOrderSummaryStats().then(s => s && setStats(s));
          }}
          onOrderDeleted={(deletedId) => {
            setOrders(prev => prev.filter(o => o.order_id !== deletedId));
            setSelectedOrder(null);
            getOrderSummaryStats().then(s => s && setStats(s));
          }}
        />
      )}

    </div>
  );
}
