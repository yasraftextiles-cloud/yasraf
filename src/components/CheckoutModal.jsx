import React, { useState } from 'react';
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
  MessageCircle
} from 'lucide-react';
import { CURRENCIES } from '../data/products';
import { BRAND_CONFIG } from '../data/brandConfig';

export default function CheckoutModal({ isOpen, onClose, checkoutData, onOrderSuccess }) {
  if (!isOpen || !checkoutData) return null;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Lahore',
    province: 'Punjab',
    postalCode: '',
    notes: '',
    paymentMethod: 'cod' // 'cod' is active. 'card' and 'wallet' are prepared for future integrations.
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const curr = CURRENCIES[checkoutData.currency] || CURRENCIES.PKR;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order placement
    setTimeout(() => {
      setIsProcessing(false);
      const randomOrderId = `YAS-${Math.floor(100000 + Math.random() * 900000)}`;
      const order = {
        orderId: randomOrderId,
        date: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: checkoutData.cartItems,
        total: checkoutData.total,
        customer: formData,
        estDelivery: '2 - 3 Working Days (via TCS / Leopards Express)'
      };
      setCompletedOrder(order);
      if (onOrderSuccess) onOrderSuccess(order);
    }, 1200);
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

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={onClose}
                className="btn-luxury"
              >
                Back To Shopping
              </button>
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

            <form onSubmit={handleSubmitOrder}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2.5rem',
                marginBottom: '2rem'
              }}>
                {/* Left: Contact & Address */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', color: '#141414' }}>
                    1. Contact & Shipping Address
                  </h4>

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
                          City *
                        </label>
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #d5cfc4', fontSize: '0.85rem', outline: 'none', background: '#fff' }}
                        >
                          <option value="Lahore">Lahore</option>
                          <option value="Karachi">Karachi</option>
                          <option value="Islamabad">Islamabad</option>
                          <option value="Rawalpindi">Rawalpindi</option>
                          <option value="Faisalabad">Faisalabad</option>
                          <option value="Multan">Multan</option>
                          <option value="Peshawar">Peshawar</option>
                          <option value="Sialkot">Sialkot</option>
                          <option value="Gujranwala">Gujranwala</option>
                          <option value="Quetta">Quetta</option>
                          <option value="Other City">Other City (Nationwide)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4a4642', marginBottom: '0.3rem' }}>
                          Province *
                        </label>
                        <select
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #d5cfc4', fontSize: '0.85rem', outline: 'none', background: '#fff' }}
                        >
                          <option value="Punjab">Punjab</option>
                          <option value="Sindh">Sindh</option>
                          <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                          <option value="Balochistan">Balochistan</option>
                          <option value="Islamabad Capital">Islamabad Capital</option>
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
