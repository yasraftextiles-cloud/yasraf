import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ArrowRight, 
  Lock,
  AlertCircle,
  MessageCircle,
  MapPin,
  UserCheck
} from 'lucide-react';
import { CURRENCIES } from '../data/products';
import { BRAND_CONFIG } from '../data/brandConfig';
import { createOrder } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  checkoutData, 
  onOrderSuccess,
  onNavigateLogin,
  onNavigateAccount
}) {
  const { user, profile, addresses, defaultAddress } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'cod' // Confirmed: Cash on Delivery (COD) only
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const idempotencyKeyRef = useRef(null);

  // Auto pre-fill from user profile and default saved address
  useEffect(() => {
    if (isOpen) {
      idempotencyKeyRef.current = null;
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setFormData(prev => ({
          ...prev,
          fullName: defaultAddress.full_name || prev.fullName,
          email: user?.email || prev.email,
          phone: defaultAddress.phone || prev.phone,
          address: defaultAddress.address_line1 + (defaultAddress.address_line2 ? `, ${defaultAddress.address_line2}` : '') || prev.address,
          city: defaultAddress.city || prev.city,
          province: defaultAddress.province || prev.province,
          postalCode: defaultAddress.postal_code || prev.postalCode
        }));
      } else if (user) {
        setFormData(prev => ({
          ...prev,
          fullName: profile?.full_name || user?.user_metadata?.full_name || prev.fullName,
          email: user?.email || prev.email,
          phone: profile?.phone || user?.user_metadata?.phone || prev.phone
        }));
      }
    }
  }, [isOpen, defaultAddress, user, profile]);

  if (!isOpen || !checkoutData) return null;

  const curr = CURRENCIES[checkoutData?.currency] || CURRENCIES.PKR;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    idempotencyKeyRef.current = null; // Payload changed, generate new key on next attempt
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    // Preserve checkout idempotency key across retries of the same request
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `ord_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    }
    const idempotencyKey = idempotencyKeyRef.current;

    try {
      const result = await createOrder({
        customer: formData,
        items: checkoutData.cartItems,
        paymentMethod: formData.paymentMethod,
        idempotencyKey
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Unable to place order. Please review your details and try again.');
        setIsProcessing(false);
        return;
      }

      // Order succeeded: reset key
      idempotencyKeyRef.current = null;

      const order = {
        orderId: result.order_id,
        trackingToken: result.tracking_token,
        date: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: checkoutData.cartItems,
        total: result.total || checkoutData.total,
        customer: formData,
        estDelivery: result.estimated_delivery || '2 - 3 Working Days (via TCS / Leopards Express)'
      };

      // Save credentials locally for seamless tracking on this device
      if (result.tracking_token) {
        try {
          localStorage.setItem('yasraf_last_order', JSON.stringify({
            orderId: result.order_id,
            trackingToken: result.tracking_token,
            phone: formData.phone
          }));
        } catch (e) {
          // ignore storage error
        }
      }

      setCompletedOrder(order);
      if (onOrderSuccess) onOrderSuccess(order);
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '860px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          padding: '2.4rem 2rem',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '2px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close checkout"
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            padding: '0.4rem',
            borderRadius: '50%',
            backgroundColor: '#f5f0ea',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {completedOrder ? (
          /* Order Confirmation Screen */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#eaf4ee',
              color: '#1d4838',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem'
            }}>
              <CheckCircle size={36} />
            </div>

            <span style={{ fontSize: '0.72rem', color: '#c5a880', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Order Received
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#141414', margin: '0.4rem 0 1rem' }}>
              Shukriya, {completedOrder.customer.fullName || 'Valued Patron'}!
            </h2>
            <p style={{ color: '#6e6b66', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.8rem' }}>
              Your order has been placed with <strong>Cash on Delivery</strong>. Our team will verify and dispatch your parcel shortly.
            </p>

            {/* Order Card */}
            <div style={{
              backgroundColor: '#faf8f4',
              border: '1px solid #ede8de',
              padding: '1.5rem',
              maxWidth: '520px',
              margin: '0 auto 2rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: '0.8rem', color: '#7a756f' }}>Order Reference:</span>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#141414' }}>{completedOrder.orderId}</span>
              </div>
              {completedOrder.trackingToken && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.6rem 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#7a756f' }}>Private Tracking Token:</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a4574b', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                      {completedOrder.trackingToken}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#8c867f' }}>
                    (Saved to this device. Keep this safe to track your order without revealing personal data.)
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: '0.8rem', color: '#7a756f' }}>Customer:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#141414' }}>{completedOrder.customer.fullName} ({completedOrder.customer.phone})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: '0.8rem', color: '#7a756f' }}>Destination:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#141414' }}>{completedOrder.customer.city}, {completedOrder.customer.province}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: '0.8rem', color: '#7a756f' }}>Payment Method:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1d4838' }}>
                  Cash on Delivery (COD)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: '0.8rem', color: '#7a756f' }}>Est. Delivery:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1d4838' }}>{completedOrder.estDelivery}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.8rem', fontSize: '1.05rem', fontWeight: 700 }}>
                <span>Total Payable at Doorstep:</span>
                <span>{curr.symbol} {Math.round(completedOrder.total * curr.rate).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={onClose}
                className="btn-luxury"
              >
                Back To Shopping
              </button>

              {user && onNavigateAccount && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateAccount('orders', completedOrder.orderId);
                  }}
                  className="btn-luxury"
                  style={{ backgroundColor: '#1a1814', color: '#ffffff', borderColor: '#1a1814' }}
                >
                  View in My Account &rarr;
                </button>
              )}

              <a
                href={BRAND_CONFIG.getWhatsAppSupportUrl(`Assalam-o-Alaikum YASRAF Clothing! I just placed an order. Order Reference: ${completedOrder.orderId}. Customer: ${completedOrder.customer.fullName}.`)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.9rem 1.8rem',
                  backgroundColor: '#1d4838',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                <MessageCircle size={16} /> Confirm via WhatsApp
              </a>
            </div>
          </div>
        ) : (
          /* Checkout Input Form */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#c5a880', marginBottom: '0.3rem' }}>
              <ShieldCheck size={18} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Official YASRAF Express Checkout
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#141414', marginBottom: '1.5rem' }}>
              Shipping & Order Confirmation
            </h2>

            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: '#fdf2f2',
                border: '1px solid #f8b4b4',
                color: '#9b1c1c',
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                fontSize: '0.85rem'
              }}>
                <AlertCircle size={18} style={{ shrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2.5rem',
                marginBottom: '2rem'
              }}>
                {/* Left: Contact & Address */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem', color: '#141414' }}>
                    1. Contact & Shipping Address
                  </h4>

                  {/* Guest Sign-In Notice */}
                  {!user && onNavigateLogin && (
                    <div style={{
                      backgroundColor: '#faf8f6',
                      border: '1px solid #e8e2d9',
                      padding: '0.65rem 0.9rem',
                      marginBottom: '1rem',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#666057'
                    }}>
                      <span>Have a Yasraf account?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateLogin('checkout');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1a1814',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: 'inherit',
                          padding: 0
                        }}
                      >
                        Sign in for saved addresses &rarr;
                      </button>
                    </div>
                  )}

                  {/* Authenticated Saved Address Selector */}
                  {user && addresses && addresses.length > 0 && (
                    <div style={{
                      backgroundColor: '#faf8f6',
                      border: '1px solid #e8e2d9',
                      padding: '0.75rem 0.9rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#1a1814', marginBottom: '0.5rem' }}>
                        <MapPin size={13} style={{ color: '#c5a880' }} /> Choose Saved Address:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {addresses.map(addr => {
                          const isSelected = selectedAddressId === addr.id || (formData.city === addr.city && formData.address.includes(addr.address_line1));
                          return (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => {
                                setSelectedAddressId(addr.id);
                                idempotencyKeyRef.current = null;
                                setFormData(prev => ({
                                  ...prev,
                                  fullName: addr.full_name,
                                  phone: addr.phone,
                                  address: addr.address_line1 + (addr.address_line2 ? `, ${addr.address_line2}` : ''),
                                  city: addr.city,
                                  province: addr.province,
                                  postalCode: addr.postal_code || ''
                                }));
                              }}
                              style={{
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                backgroundColor: isSelected ? '#1a1814' : '#ffffff',
                                color: isSelected ? '#ffffff' : '#4a4642',
                                border: isSelected ? '1px solid #1a1814' : '1px solid #d5cfc4'
                              }}
                            >
                              {addr.label} ({addr.city}) {addr.is_default ? '★' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4a4642', marginBottom: '0.3rem' }}>
                        Customer Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        placeholder="e.g. Ayesha Tariq"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #d5cfc4', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4a4642', marginBottom: '0.3rem' }}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="client@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #d5cfc4', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4a4642', marginBottom: '0.3rem' }}>
                          Mobile / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="0300 1234567"
                          value={formData.phone}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #d5cfc4', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4a4642', marginBottom: '0.3rem' }}>
                        Delivery Address (House #, Street, Area) *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        placeholder="e.g. House 24-A, Block C, Gulberg III"
                        value={formData.address}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #d5cfc4', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4a4642', marginBottom: '0.3rem' }}>
                          City / Town *
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          placeholder="e.g. Lahore, Karachi"
                          value={formData.city}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #d5cfc4', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4a4642', marginBottom: '0.3rem' }}>
                          Province / Territory *
                        </label>
                        <select
                          name="province"
                          required
                          value={formData.province}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #d5cfc4', fontSize: '0.85rem', outline: 'none', background: '#fff' }}
                        >
                          <option value="">Select Territory *</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Sindh">Sindh</option>
                          <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                          <option value="Balochistan">Balochistan</option>
                          <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                          <option value="Azad Jammu & Kashmir">Azad Jammu & Kashmir</option>
                          <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4a4642', marginBottom: '0.3rem' }}>
                        Delivery Instructions / Notes (Optional)
                      </label>
                      <input
                        type="text"
                        name="notes"
                        placeholder="e.g. Leave with security / Call before delivery"
                        value={formData.notes}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #d5cfc4', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Payment Method & Order Summary */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', color: '#141414' }}>
                    2. Payment Method
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {/* Active: Cash on Delivery Option */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      padding: '0.85rem 1rem',
                      border: '2px solid #141414',
                      backgroundColor: '#fbf9f5',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={true}
                        readOnly
                        style={{ accentColor: '#c5a880' }}
                      />
                      <Banknote size={20} style={{ color: '#1d4838' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#141414', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>Cash on Delivery (COD)</span>
                          <span style={{ fontSize: '0.62rem', backgroundColor: '#1d4838', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '2px' }}>
                            ACTIVE NATIONWIDE
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#7a756f' }}>
                          Pay with cash to courier upon package delivery at your doorstep
                        </div>
                      </div>
                    </label>

                    {/* Prepared: Credit/Debit Card Option (Transparently prepared for future integration) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      padding: '0.85rem 1rem',
                      border: '1px dashed #d5cfc4',
                      backgroundColor: '#fafafa',
                      opacity: 0.8
                    }}>
                      <CreditCard size={20} style={{ color: '#888' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#666', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>Debit / Credit Card (Visa / Mastercard)</span>
                          <span style={{ fontSize: '0.6rem', backgroundColor: '#eee', color: '#555', padding: '0.1rem 0.35rem', borderRadius: '2px' }}>
                            GATEWAY PREPARED
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '2px' }}>
                          Online card gateway is prepared for future merchant activation. Currently, please select Cash on Delivery.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div style={{ backgroundColor: '#faf7f2', padding: '1.2rem', border: '1px solid #ede8de', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#141414', marginBottom: '0.6rem' }}>
                      Order Summary ({checkoutData.cartItems.length} items)
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#6e6b66', marginBottom: '0.3rem' }}>
                      <span>Subtotal</span>
                      <span>{curr.symbol} {Math.round(checkoutData.subtotal * curr.rate).toLocaleString()}</span>
                    </div>
                    {checkoutData.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#1d4838', marginBottom: '0.3rem' }}>
                        <span>Promo Savings</span>
                        <span>-{curr.symbol} {Math.round(checkoutData.discount * curr.rate).toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#6e6b66', marginBottom: '0.3rem' }}>
                      <span>Shipping Fee</span>
                      <span>{checkoutData.shipping === 0 ? 'FREE' : `${curr.symbol} ${Math.round(checkoutData.shipping * curr.rate)}`}</span>
                    </div>
                    {checkoutData.giftWrap > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#6e6b66', marginBottom: '0.3rem' }}>
                        <span>Luxury Gift Box</span>
                        <span>{curr.symbol} {Math.round(checkoutData.giftWrap * curr.rate)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: '#141414', borderTop: '1px solid #ddd', paddingTop: '0.6rem', marginTop: '0.4rem' }}>
                      <span>Final Total (COD)</span>
                      <span>{curr.symbol} {Math.round(checkoutData.total * curr.rate).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: isProcessing ? '#666' : '#121212',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.18)'
                    }}
                  >
                    {isProcessing ? 'Confirming Order...' : (
                      <>
                        Confirm Order (COD) • {curr.symbol} {Math.round(checkoutData.total * curr.rate).toLocaleString()} <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
