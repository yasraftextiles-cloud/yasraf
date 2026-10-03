import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCustomerOrders } from '../../services/customerService';
import { 
  User, Package, MapPin, ShieldCheck, LogOut, Plus, 
  Check, Trash2, Edit2, ChevronRight, 
  Truck, AlertCircle, Loader2, Sparkles, X, RotateCcw
} from 'lucide-react';
import './Account.css';

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan'
];

export default function AccountPage({
  onNavigateHome,
  onNavigateCollections,
  onAddToCart,
  onOpenCart,
  catalogProducts = [],
  initialTab = 'overview',
  initialOrderId = null,
  showToast
}) {
  const { 
    user, 
    profile, 
    addresses, 
    defaultAddress, 
    signOut, 
    updateProfile, 
    updatePassword, 
    addAddress, 
    editAddress, 
    removeAddress, 
    makeAddressDefault,
    refreshUserData 
  } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // Selected Order for Modal Details
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: 'Punjab',
    postalCode: '',
    isDefault: false
  });
  const [addressFormError, setAddressFormError] = useState(null);
  const [isAddressSaving, setIsAddressSaving] = useState(false);

  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Security Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Orders Filter
  const [ordersFilter, setOrdersFilter] = useState('all'); // 'all' | 'active' | 'delivered' | 'cancelled'

  // Sync profile inputs with profile data
  useEffect(() => {
    if (profile) {
      setProfileName(profile.full_name || '');
      setProfilePhone(profile.phone || '');
      setProfileCity(profile.city || '');
    }
  }, [profile]);

  // Load customer orders strictly bound to user.id
  const loadOrders = useCallback(async () => {
    if (!user) return;
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const { data, error } = await getCustomerOrders(user.id);
      if (error) {
        setOrdersError('Unable to load orders at this time.');
      } else {
        setOrders(data || []);
        if (initialOrderId && data) {
          const match = data.find(o => o.order_id === initialOrderId);
          if (match) setSelectedOrder(match);
        }
      }
    } catch (err) {
      console.warn('[AccountPage] Orders load exception:', err);
      setOrdersError('Failed to fetch orders.');
    } finally {
      setIsOrdersLoading(false);
    }
  }, [user, initialOrderId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Handle Tab Switch
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setProfileMessage(null);
    setPasswordMessage(null);
  };

  // Profile Update Submission
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileMessage({ type: 'error', text: 'Full name cannot be empty.' });
      return;
    }

    setIsProfileSaving(true);
    setProfileMessage(null);

    try {
      await updateProfile({
        fullName: profileName.trim(),
        phone: profilePhone.trim() || null,
        city: profileCity.trim() || null
      });
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
      if (showToast) showToast('Profile details saved.');
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsProfileSaving(false);
    }
  };

  // Password Update Submission
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsPasswordUpdating(true);
    setPasswordMessage(null);

    try {
      await updatePassword(newPassword);
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
      if (showToast) showToast('Password changed.');
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  // Open Address Modal for New
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressFormData({
      label: 'Home',
      fullName: profile?.full_name || '',
      phone: profile?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      province: 'Punjab',
      postalCode: '',
      isDefault: addresses.length === 0
    });
    setAddressFormError(null);
    setIsAddressModalOpen(true);
  };

  // Open Address Modal for Edit
  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressFormData({
      label: addr.label || 'Home',
      fullName: addr.full_name || '',
      phone: addr.phone || '',
      addressLine1: addr.address_line1 || '',
      addressLine2: addr.address_line2 || '',
      city: addr.city || '',
      province: addr.province || 'Punjab',
      postalCode: addr.postal_code || '',
      isDefault: Boolean(addr.is_default)
    });
    setAddressFormError(null);
    setIsAddressModalOpen(true);
  };

  // Save Address Submission
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressFormData.fullName.trim() || !addressFormData.phone.trim() || !addressFormData.addressLine1.trim() || !addressFormData.city.trim()) {
      setAddressFormError('Please fill in all required fields (Name, Phone, Street, City).');
      return;
    }

    setIsAddressSaving(true);
    setAddressFormError(null);

    try {
      if (editingAddress) {
        await editAddress(editingAddress.id, addressFormData);
        if (showToast) showToast('Address updated.');
      } else {
        await addAddress(addressFormData);
        if (showToast) showToast('New address saved.');
      }
      setIsAddressModalOpen(false);
    } catch (err) {
      setAddressFormError(err.message || 'Failed to save address.');
    } finally {
      setIsAddressSaving(false);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you wish to remove this saved address?')) return;
    try {
      await removeAddress(addrId);
      if (showToast) showToast('Address deleted.');
    } catch (err) {
      alert(err.message || 'Failed to delete address.');
    }
  };

  // Set Default Address
  const handleMakeDefault = async (addrId) => {
    try {
      await makeAddressDefault(addrId);
      if (showToast) showToast('Default address set.');
    } catch (err) {
      alert(err.message || 'Failed to update default address.');
    }
  };

  // Buy Again Flow with exact variant, stock & price revalidation
  const handleBuyAgain = (order) => {
    if (!order || !order.order_items || order.order_items.length === 0) return;

    let addedCount = 0;
    const unavailableItems = [];

    for (const item of order.order_items) {
      const catalogMatch = catalogProducts.find(p => p.id === item.product_id);

      if (!catalogMatch || catalogMatch.isPublished === false || catalogMatch.is_published === false) {
        unavailableItems.push(`"${item.title || 'Product'}" is no longer published in the atelier collection.`);
        continue;
      }

      // Check variant matching strictly
      const variants = catalogMatch.variants || catalogMatch.product_variants || [];
      let variantMatch = null;

      if (variants.length > 0) {
        if (item.variant_id) {
          variantMatch = variants.find(v => v.id === item.variant_id);
        }

        if (!variantMatch && item.size) {
          variantMatch = variants.find(v => 
            v.size && v.size.toLowerCase() === item.size.toLowerCase() &&
            (!item.color || !v.color || v.color.toLowerCase() === item.color.toLowerCase())
          );
        }

        // DO NOT fallback to variants[0] or silently select size M!
        if (!variantMatch) {
          unavailableItems.push(`"${catalogMatch.title}" (${item.size || 'Requested size'}) is no longer available in the catalog. Please select an available size.`);
          continue;
        }
      }

      // Determine stock and price strictly from live catalog (no invented stock=14)
      let availableStock = 0;
      let currentPrice = Number(catalogMatch.price || 0);

      if (variantMatch) {
        availableStock = variantMatch.stock !== undefined ? Number(variantMatch.stock) : 0;
        currentPrice = Number(variantMatch.price !== undefined ? variantMatch.price : catalogMatch.price);
      } else {
        availableStock = catalogMatch.stockCount !== undefined 
          ? Number(catalogMatch.stockCount) 
          : (catalogMatch.stock !== undefined ? Number(catalogMatch.stock) : 0);
      }

      if (availableStock <= 0) {
        const variantDesc = variantMatch ? variantMatch.size : (item.size || 'Standard');
        unavailableItems.push(`"${catalogMatch.title}" (${variantDesc}) is sold out.`);
        continue;
      }

      // Valid item to add with exact variant and fresh catalog price
      if (onAddToCart) {
        onAddToCart({
          ...catalogMatch,
          id: catalogMatch.id,
          productId: catalogMatch.id,
          variantId: variantMatch ? variantMatch.id : null,
          price: currentPrice,
          selectedSize: variantMatch ? variantMatch.size : (item.size || null),
          size: variantMatch ? variantMatch.size : (item.size || null),
          selectedColor: variantMatch?.color 
            ? { name: variantMatch.color } 
            : (item.color ? { name: item.color } : null),
          color: variantMatch?.color || item.color || null,
          quantity: Math.min(item.quantity || 1, availableStock)
        });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      if (showToast) showToast(`Added ${addedCount} available ${addedCount === 1 ? 'item' : 'items'} to bag at current prices.`);
      if (onOpenCart) onOpenCart();
    }

    if (unavailableItems.length > 0) {
      alert(`Some items from this previous order could not be re-ordered:\n• ${unavailableItems.join('\n• ')}`);
    }
  };

  // Helper for Status Pill Class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Order Received': return 'status-received';
      case 'Artisan Inspection': return 'status-inspection';
      case 'Dispatched': return 'status-dispatched';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-received';
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (ordersFilter === 'all') return true;
    if (ordersFilter === 'active') return ['Order Received', 'Artisan Inspection', 'Dispatched'].includes(o.status);
    if (ordersFilter === 'delivered') return o.status === 'Delivered';
    if (ordersFilter === 'cancelled') return o.status === 'Cancelled';
    return true;
  });

  const activeOrdersCount = orders.filter(o => ['Order Received', 'Artisan Inspection', 'Dispatched'].includes(o.status)).length;

  return (
    <div className="account-page-container">
      <div className="account-inner">

        {/* Client Privilege Banner */}
        <section className="account-banner">
          <div className="account-banner-greeting">
            <div className="account-badge-vip">
              <Sparkles size={13} /> Yasraf Atelier Member
            </div>
            <h1 className="account-user-name">
              Welcome, {profile?.full_name || user?.email?.split('@')[0] || 'Client'}
            </h1>
            <p className="account-user-email">
              {user?.email}
            </p>
          </div>

          <div className="account-banner-actions">
            <button
              type="button"
              onClick={signOut}
              className="account-logout-btn"
              title="Sign Out from this Device"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </section>

        {/* Account Layout (Sidebar + Content) */}
        <div className="account-layout">
          {/* Navigation Sidebar */}
          <aside className="account-nav">
            <button
              type="button"
              onClick={() => handleSelectTab('overview')}
              className={`account-nav-item ${activeTab === 'overview' ? 'is-active' : ''}`}
            >
              <User size={16} /> Overview
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('orders')}
              className={`account-nav-item ${activeTab === 'orders' ? 'is-active' : ''}`}
            >
              <Package size={16} /> My Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('addresses')}
              className={`account-nav-item ${activeTab === 'addresses' ? 'is-active' : ''}`}
            >
              <MapPin size={16} /> Saved Addresses ({addresses.length})
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('profile')}
              className={`account-nav-item ${activeTab === 'profile' ? 'is-active' : ''}`}
            >
              <ShieldCheck size={16} /> Profile & Security
            </button>
          </aside>

          {/* Main Content Area */}
          <main className="account-content">

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <header className="account-section-header">
                  <div>
                    <h2 className="account-section-title">Client Dashboard</h2>
                    <p className="account-section-subtitle">
                      Atelier activity, delivery coordinates, and purchase record.
                    </p>
                  </div>
                </header>

                <div className="overview-stats-grid">
                  <div className="overview-stat-card">
                    <span className="overview-stat-label">Total Orders</span>
                    <span className="overview-stat-value">{orders.length}</span>
                    <span className="overview-stat-desc">Lifetime purchases at Yasraf</span>
                  </div>

                  <div className="overview-stat-card">
                    <span className="overview-stat-label">Active Orders</span>
                    <span className="overview-stat-value">{activeOrdersCount}</span>
                    <span className="overview-stat-desc">Currently in preparation or transit</span>
                  </div>

                  <div className="overview-stat-card">
                    <span className="overview-stat-label">Default Shipping</span>
                    <span className="overview-stat-value" style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>
                      {defaultAddress ? defaultAddress.city : 'Not set'}
                    </span>
                    <span className="overview-stat-desc">
                      {defaultAddress ? `${defaultAddress.address_line1}, ${defaultAddress.city}` : 'Add a primary delivery address'}
                    </span>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div style={{ marginTop: '2.5rem' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-xl font-medium text-[#1a1814] m-0">Recent Orders</h3>
                    {orders.length > 0 && (
                      <button 
                        onClick={() => handleSelectTab('orders')}
                        className="text-xs font-semibold uppercase tracking-wider text-[#c5a880] hover:text-[#1a1814] flex items-center gap-1 cursor-pointer bg-none border-none"
                      >
                        View All ({orders.length}) <ChevronRight size={14} />
                      </button>
                    )}
                  </div>

                  {isOrdersLoading ? (
                    <div className="p-8 text-center text-[#8c867f] flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-[#c5a880]" /> Loading order history...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="account-empty-state">
                      <Package size={36} className="account-empty-icon mx-auto" />
                      <h4 className="account-empty-title">No Orders Placed Yet</h4>
                      <p className="account-empty-desc">
                        Explore our latest luxury prêt collections and artisan unstitched pieces.
                      </p>
                      <button
                        type="button"
                        onClick={onNavigateCollections}
                        className="btn-primary-dark"
                      >
                        Explore Collections &rarr;
                      </button>
                    </div>
                  ) : (
                    orders.slice(0, 2).map((order) => (
                      <div key={order.order_id} className="order-card">
                        <div className="order-card-header">
                          <div className="order-meta-group">
                            <div className="order-meta-item">
                              <span className="order-meta-label">Order Number</span>
                              <span className="order-meta-value">{order.order_id}</span>
                            </div>
                            <div className="order-meta-item">
                              <span className="order-meta-label">Date Placed</span>
                              <span className="order-meta-value">
                                {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="order-meta-item">
                              <span className="order-meta-label">Total</span>
                              <span className="order-meta-value">Rs. {Number(order.total).toLocaleString('en-PK')}</span>
                            </div>
                          </div>
                          <span className={`status-pill ${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="order-card-body">
                          <div className="order-items-preview">
                            {(order.order_items || []).slice(0, 2).map((item, idx) => (
                              <div key={idx} className="order-item-row">
                                <img
                                  src={item.image || '/products/yasraf-meerab-black-1.png'}
                                  alt={item.title}
                                  className="order-item-thumb"
                                />
                                <div className="order-item-details">
                                  <h5 className="order-item-title">{item.title}</h5>
                                  <p className="order-item-specs">
                                    Size: {item.size || 'M'} {item.color ? `| Color: ${item.color}` : ''} | Qty: {item.quantity}
                                  </p>
                                </div>
                                <span className="order-item-price">
                                  Rs. {Number(item.line_total || item.unit_price * item.quantity).toLocaleString('en-PK')}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="order-card-footer">
                            {order.courier_tracking ? (
                              <span className="courier-info-badge">
                                <Truck size={14} className="text-[#c5a880]" />
                                Courier: {order.courier_tracking}
                              </span>
                            ) : (
                              <span className="text-xs text-[#8c867f]">
                                Delivery: {order.estimated_delivery || '2 - 4 Working Days'}
                              </span>
                            )}
                            <div className="order-actions">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="btn-secondary"
                              >
                                View Details
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBuyAgain(order)}
                                className="btn-primary-dark"
                              >
                                <RotateCcw size={13} /> Buy Again
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div>
                <header className="account-section-header">
                  <div>
                    <h2 className="account-section-title">My Orders</h2>
                    <p className="account-section-subtitle">
                      Review order progress, item breakdowns, courier tracking, and re-order catalog pieces.
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'active', 'delivered', 'cancelled'].map((filterKey) => (
                      <button
                        key={filterKey}
                        type="button"
                        onClick={() => setOrdersFilter(filterKey)}
                        className={`text-xs uppercase font-semibold px-3 py-1.5 transition-colors cursor-pointer border ${
                          ordersFilter === filterKey
                            ? 'bg-[#1a1814] text-white border-[#1a1814]'
                            : 'bg-white text-[#666057] border-[#e8e2d9] hover:border-[#1a1814]'
                        }`}
                      >
                        {filterKey === 'all' ? `All (${orders.length})` : filterKey}
                      </button>
                    ))}
                  </div>
                </header>

                {isOrdersLoading ? (
                  <div className="p-12 text-center text-[#8c867f] flex flex-col items-center justify-center gap-3">
                    <Loader2 size={24} className="animate-spin text-[#c5a880]" />
                    <span>Loading your orders...</span>
                  </div>
                ) : ordersError ? (
                  <div className="auth-error-banner">
                    <AlertCircle size={16} />
                    <span>{ordersError}</span>
                    <button onClick={loadOrders} className="ml-auto underline text-xs">Retry</button>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="account-empty-state">
                    <Package size={40} className="account-empty-icon mx-auto" />
                    <h3 className="account-empty-title">
                      {ordersFilter === 'all' ? 'No Orders Found' : `No ${ordersFilter} Orders`}
                    </h3>
                    <p className="account-empty-desc">
                      {ordersFilter === 'all'
                        ? 'You haven’t placed any orders yet. Discover our signature couture silhouettes.'
                        : `You do not have any orders matching the "${ordersFilter}" filter.`}
                    </p>
                    <button
                      type="button"
                      onClick={onNavigateCollections}
                      className="btn-primary-dark"
                    >
                      Shop The Catalog &rarr;
                    </button>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.order_id} className="order-card">
                      <div className="order-card-header">
                        <div className="order-meta-group">
                          <div className="order-meta-item">
                            <span className="order-meta-label">Order Number</span>
                            <span className="order-meta-value font-mono">{order.order_id}</span>
                          </div>
                          <div className="order-meta-item">
                            <span className="order-meta-label">Date Placed</span>
                            <span className="order-meta-value">
                              {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="order-meta-item">
                            <span className="order-meta-label">Payment</span>
                            <span className="order-meta-value uppercase">{order.payment_method || 'COD'}</span>
                          </div>
                          <div className="order-meta-item">
                            <span className="order-meta-label">Total Amount</span>
                            <span className="order-meta-value text-[#c5a880]">
                              Rs. {Number(order.total).toLocaleString('en-PK')}
                            </span>
                          </div>
                        </div>

                        <span className={`status-pill ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="order-card-body">
                        <div className="order-items-preview">
                          {(order.order_items || []).map((item, idx) => (
                            <div key={idx} className="order-item-row">
                              <img
                                src={item.image || '/products/yasraf-meerab-black-1.png'}
                                alt={item.title}
                                className="order-item-thumb"
                              />
                              <div className="order-item-details">
                                <h5 className="order-item-title">{item.title}</h5>
                                <p className="order-item-specs">
                                  Size: {item.size || 'M'} {item.color ? `| Color: ${item.color}` : ''} | Qty: {item.quantity}
                                </p>
                              </div>
                              <span className="order-item-price">
                                Rs. {Number(item.line_total || item.unit_price * item.quantity).toLocaleString('en-PK')}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="order-card-footer">
                          {order.courier_tracking ? (
                            <span className="courier-info-badge">
                              <Truck size={14} className="text-[#c5a880]" />
                              <strong>Courier Tracking:</strong> {order.courier_tracking}
                            </span>
                          ) : (
                            <span className="text-xs text-[#8c867f]">
                              Courier tracking will appear once dispatched.
                            </span>
                          )}

                          <div className="order-actions">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="btn-secondary"
                            >
                              Order Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBuyAgain(order)}
                              className="btn-primary-dark"
                              title="Re-order available variants at current prices"
                            >
                              <RotateCcw size={13} /> Buy Again
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div>
                <header className="account-section-header">
                  <div>
                    <h2 className="account-section-title">Saved Delivery Addresses</h2>
                    <p className="account-section-subtitle">
                      Manage your destination addresses for rapid luxury checkout across Pakistan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="btn-primary-dark"
                  >
                    <Plus size={15} /> Add New Address
                  </button>
                </header>

                {addresses.length === 0 ? (
                  <div className="account-empty-state">
                    <MapPin size={38} className="account-empty-icon mx-auto" />
                    <h3 className="account-empty-title">No Saved Addresses</h3>
                    <p className="account-empty-desc">
                      Add a shipping address to have your delivery details automatically prefilled during checkout.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="btn-primary-dark"
                    >
                      Add Primary Address
                    </button>
                  </div>
                ) : (
                  <div className="addresses-grid">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`address-card ${addr.is_default ? 'is-default' : ''}`}>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="address-label">{addr.label || 'Home'}</span>
                            {addr.is_default && (
                              <span className="address-tag">Default</span>
                            )}
                          </div>
                          <h4 className="address-person">{addr.full_name}</h4>
                          <p className="address-text">
                            {addr.address_line1}
                            {addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                            {addr.city}, {addr.province} {addr.postal_code || ''}<br />
                            Phone: {addr.phone}
                          </p>
                        </div>

                        <div className="address-actions">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="btn-secondary"
                            style={{ flex: 1 }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          {!addr.is_default && (
                            <button
                              type="button"
                              onClick={() => handleMakeDefault(addr.id)}
                              className="btn-secondary"
                              title="Set as Default Address"
                            >
                              <Check size={13} /> Set Default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="btn-secondary text-red-600 hover:text-red-700"
                            title="Remove Address"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE & SECURITY */}
            {activeTab === 'profile' && (
              <div>
                <header className="account-section-header">
                  <div>
                    <h2 className="account-section-title">Profile & Security</h2>
                    <p className="account-section-subtitle">
                      Maintain your contact coordinates and secure account credentials.
                    </p>
                  </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Profile Details Form */}
                  <div className="bg-[#faf8f6] p-6 border border-[#ede7de]">
                    <h3 className="font-serif text-xl font-medium text-[#1a1814] mb-4">Client Identity</h3>
                    {profileMessage && (
                      <div className={profileMessage.type === 'success' ? 'auth-success-banner mb-4' : 'auth-error-banner mb-4'}>
                        {profileMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                        <span>{profileMessage.text}</span>
                      </div>
                    )}
                    <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                      <div className="auth-field-group">
                        <label className="auth-label">Registered Email</label>
                        <input
                          type="email"
                          disabled
                          value={user?.email || ''}
                          className="auth-input bg-[#f0eae2] text-[#666057] cursor-not-allowed"
                        />
                        <span className="text-[11px] text-[#8c867f]">
                          Verified authentication identity managed by Supabase.
                        </span>
                      </div>

                      <div className="auth-field-group">
                        <label className="auth-label" htmlFor="acc-name">Full Name</label>
                        <input
                          id="acc-name"
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="auth-input"
                        />
                      </div>

                      <div className="auth-field-group">
                        <label className="auth-label" htmlFor="acc-phone">Contact Phone Number</label>
                        <input
                          id="acc-phone"
                          type="tel"
                          placeholder="0300 1234567"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="auth-input"
                        />
                        <span className="text-[11px] text-[#8c867f]">
                          Used for delivery notifications and courier coordination.
                        </span>
                      </div>

                      <div className="auth-field-group">
                        <label className="auth-label" htmlFor="acc-city">City</label>
                        <input
                          id="acc-city"
                          type="text"
                          placeholder="e.g. Lahore, Karachi, Islamabad"
                          value={profileCity}
                          onChange={(e) => setProfileCity(e.target.value)}
                          className="auth-input"
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-primary-dark mt-2"
                        disabled={isProfileSaving}
                      >
                        {isProfileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                      </button>
                    </form>
                  </div>

                  {/* Security / Password Form */}
                  <div className="bg-[#faf8f6] p-6 border border-[#ede7de]">
                    <h3 className="font-serif text-xl font-medium text-[#1a1814] mb-4">Atelier Password</h3>
                    {passwordMessage && (
                      <div className={passwordMessage.type === 'success' ? 'auth-success-banner mb-4' : 'auth-error-banner mb-4'}>
                        {passwordMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                        <span>{passwordMessage.text}</span>
                      </div>
                    )}
                    <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                      <div className="auth-field-group">
                        <label className="auth-label" htmlFor="acc-new-pass">New Password (Min 6 Characters)</label>
                        <input
                          id="acc-new-pass"
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="auth-input"
                        />
                      </div>

                      <div className="auth-field-group">
                        <label className="auth-label" htmlFor="acc-conf-pass">Confirm New Password</label>
                        <input
                          id="acc-conf-pass"
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="auth-input"
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-primary-dark mt-2"
                        disabled={isPasswordUpdating}
                      >
                        {isPasswordUpdating ? 'Updating Password...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ADDRESS MODAL (ADD / EDIT) */}
      {isAddressModalOpen && (
        <div className="account-modal-overlay" onClick={() => setIsAddressModalOpen(false)}>
          <div className="account-modal-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="account-modal-close"
              aria-label="Close address form"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif text-2xl font-medium text-[#1a1814] mb-2">
              {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>
            <p className="text-xs text-[#8c867f] mb-6">
              Saved addresses are available for rapid 1-click selection during checkout.
            </p>

            {addressFormError && (
              <div className="auth-error-banner mb-4">
                <AlertCircle size={16} />
                <span>{addressFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="auth-field-group">
                  <label className="auth-label">Address Tag / Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Home, Atelier, Office"
                    value={addressFormData.label}
                    onChange={(e) => setAddressFormData({ ...addressFormData, label: e.target.value })}
                    className="auth-input"
                  />
                </div>

                <div className="auth-field-group">
                  <label className="auth-label">Recipient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Recipient name"
                    value={addressFormData.fullName}
                    onChange={(e) => setAddressFormData({ ...addressFormData, fullName: e.target.value })}
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="0300 1234567"
                  value={addressFormData.phone}
                  onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                  className="auth-input"
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House #, Street, Phase / Sector"
                  value={addressFormData.addressLine1}
                  onChange={(e) => setAddressFormData({ ...addressFormData, addressLine1: e.target.value })}
                  className="auth-input"
                />
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Apartment / Suite / Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Floor, Apt #, Landmark"
                  value={addressFormData.addressLine2}
                  onChange={(e) => setAddressFormData({ ...addressFormData, addressLine2: e.target.value })}
                  className="auth-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="auth-field-group">
                  <label className="auth-label">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lahore, Karachi"
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                    className="auth-input"
                  />
                </div>

                <div className="auth-field-group">
                  <label className="auth-label">Province / Territory *</label>
                  <select
                    value={addressFormData.province}
                    onChange={(e) => setAddressFormData({ ...addressFormData, province: e.target.value })}
                    className="auth-input bg-white cursor-pointer"
                  >
                    {PAKISTAN_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div className="auth-field-group">
                  <label className="auth-label">Postal Code</label>
                  <input
                    type="text"
                    placeholder="Postal code"
                    value={addressFormData.postalCode}
                    onChange={(e) => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  id="modal-set-default"
                  type="checkbox"
                  checked={addressFormData.isDefault}
                  onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                  className="w-4 h-4 cursor-pointer accent-[#c5a880]"
                />
                <label htmlFor="modal-set-default" className="text-xs text-[#4a453e] cursor-pointer">
                  Set as my primary default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-[#f0eae2] pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-dark"
                  disabled={isAddressSaving}
                >
                  {isAddressSaving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INDIVIDUAL ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="account-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="account-modal-panel max-w-[760px]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="account-modal-close"
              aria-label="Close order details"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-between border-b border-[#f0eae2] pb-4 mb-5">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#c5a880] font-bold block mb-1">
                  Atelier Order Record
                </span>
                <h3 className="font-serif text-2xl font-medium text-[#1a1814] m-0">
                  {selectedOrder.order_id}
                </h3>
                <span className="text-xs text-[#8c867f]">
                  Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <span className={`status-pill ${getStatusClass(selectedOrder.status)} text-xs`}>
                {selectedOrder.status}
              </span>
            </div>

            {/* Courier Tracking Notice if Available */}
            {selectedOrder.courier_tracking && (
              <div className="bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] p-3 text-xs mb-5 flex items-center gap-2">
                <Truck size={16} />
                <span>
                  <strong>Courier Dispatch Information:</strong> {selectedOrder.courier_tracking}
                </span>
              </div>
            )}

            {/* Order Items List */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a453e] mb-3">
                Order Items Snapshot ({selectedOrder.order_items?.length || 0})
              </h4>
              <div className="flex flex-col gap-3">
                {(selectedOrder.order_items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#faf8f6] border border-[#ede7de]">
                    <img
                      src={item.image || '/products/yasraf-meerab-black-1.png'}
                      alt={item.title}
                      className="w-14 h-18 object-cover bg-white border border-[#e5dfd7]"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-sm text-[#1a1814] m-0 truncate">{item.title}</h5>
                      <p className="text-xs text-[#8c867f] m-0 mt-0.5">
                        Size: {item.size || 'M'} {item.color ? `| Color: ${item.color}` : ''} | Quantity: {item.quantity}
                      </p>
                      <p className="text-xs text-[#666057] m-0 mt-1">
                        Unit Price: Rs. {Number(item.unit_price || item.price).toLocaleString('en-PK')}
                      </p>
                    </div>
                    <span className="font-bold text-sm text-[#1a1814]">
                      Rs. {Number(item.line_total || (item.unit_price || item.price) * item.quantity).toLocaleString('en-PK')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Snapshot & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#faf8f6] border border-[#ede7de] mb-6 text-xs text-[#4a453e]">
              <div>
                <strong className="block text-[#1a1814] uppercase tracking-wider mb-1">Shipping Address Snapshot</strong>
                <p className="m-0 leading-relaxed text-[#666057]">
                  {selectedOrder.customer_name}<br />
                  {selectedOrder.shipping_address}<br />
                  {selectedOrder.city}, {selectedOrder.province} {selectedOrder.postal_code || ''}<br />
                  Phone: {selectedOrder.customer_phone}
                </p>
              </div>
              <div>
                <strong className="block text-[#1a1814] uppercase tracking-wider mb-1">Financial Breakdown</strong>
                <div className="flex justify-between py-1 border-b border-[#ede7de]">
                  <span>Subtotal:</span>
                  <span>Rs. {Number(selectedOrder.subtotal).toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ede7de]">
                  <span>Shipping Fee:</span>
                  <span>{Number(selectedOrder.shipping_fee) === 0 ? 'Complimentary' : `Rs. ${Number(selectedOrder.shipping_fee).toLocaleString('en-PK')}`}</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-sm text-[#1a1814]">
                  <span>Grand Total (COD):</span>
                  <span>Rs. {Number(selectedOrder.total).toLocaleString('en-PK')}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-[#f0eae2] pt-4">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  handleBuyAgain(selectedOrder);
                }}
                className="btn-primary-dark"
              >
                <RotateCcw size={14} /> Buy Again from Catalog
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
