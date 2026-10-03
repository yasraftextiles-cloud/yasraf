import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, Clock, Truck, Package, MapPin, Loader2, KeyRound, ShieldAlert } from 'lucide-react';
import { trackOrder } from '../services/supabaseService.js';

export default function TrackOrderModal({ isOpen, onClose }) {
  const [orderId, setOrderId] = useState('');
  const [authCredential, setAuthCredential] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Automatically load last order credentials from local storage for seamless user experience
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('yasraf_last_order');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.orderId && !orderId) setOrderId(parsed.orderId);
          if (parsed.trackingToken && !authCredential) setAuthCredential(parsed.trackingToken);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim() || !authCredential.trim()) {
      setErrorMessage('Please enter both your Order ID and secret Tracking Token.');
      return;
    }

    if (authCredential.trim().length < 32) {
      setErrorMessage('The tracking token must be a valid cryptographic token (at least 32 characters).');
      return;
    }

    setIsSearching(true);
    setSearched(true);
    setErrorMessage(null);

    try {
      const liveOrder = await trackOrder({
        orderId: orderId.trim(),
        trackingToken: authCredential.trim()
      });

      if (liveOrder) {
        setTrackedOrder(liveOrder);
      } else {
        setTrackedOrder(null);
        setErrorMessage('Order not found or tracking token invalid.');
      }
    } catch (err) {
      console.warn('Track order lookup error:', err);
      setTrackedOrder(null);
      setErrorMessage(err.message || 'Unable to track order. Please check your credentials.');
    } finally {
      setIsSearching(false);
    }
  };

  const steps = [
    { num: 1, label: 'Order Received', desc: 'Verified & Queued' },
    { num: 2, label: 'Artisan Inspection', desc: 'Quality Check & Packaging' },
    { num: 3, label: 'Dispatched', desc: 'Handed to TCS Logistics' },
    { num: 4, label: 'Delivered', desc: 'Delivered to Doorstep' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          padding: '2.4rem 2rem',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c5a880', marginBottom: '0.3rem' }}>
          <Truck size={18} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Secure Shipment Tracker
          </span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', color: '#141414', marginBottom: '0.4rem' }}>
          Track Your Yasraf Order
        </h3>
        <p style={{ color: '#6e6b66', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          To protect patron privacy, enter your <strong>Order ID</strong> alongside your 48-character <strong>Tracking Token</strong> received upon order confirmation.
        </p>

        {/* Input Form */}
        <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.8rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#6e6b66', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Order ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. YAS-2610-123456"
                value={orderId}
                onChange={(e) => { setOrderId(e.target.value); if (errorMessage) setErrorMessage(null); }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d5cfc4',
                  fontSize: '0.9rem',
                  outline: 'none',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#6e6b66', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Secret Tracking Token *
              </label>
              <input
                type="text"
                required
                placeholder="Paste 48-character tracking token"
                value={authCredential}
                onChange={(e) => { setAuthCredential(e.target.value); if (errorMessage) setErrorMessage(null); }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d5cfc4',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-luxury"
            disabled={isSearching}
            style={{ padding: '0.8rem 1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
          >
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Track Shipment'}
          </button>
        </form>

        {/* Error Alert */}
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
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tracked Details */}
        {searched && trackedOrder && (
          <div style={{
            backgroundColor: '#faf8f5',
            border: '1px solid #ede8de',
            padding: '1.6rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid #eee' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#8c867f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Order Number</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#141414' }}>{trackedOrder.orderId}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: '#8c867f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date Placed</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#141414' }}>{trackedOrder.datePlaced}</div>
              </div>
            </div>

            {/* Stepper Progress */}
            <div style={{ marginBottom: '1.8rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', position: 'relative' }}>
                {steps.map((st) => {
                  const isDone = st.num <= (trackedOrder.currentStep || 1);
                  const isCurrent = st.num === (trackedOrder.currentStep || 1);
                  return (
                    <div key={st.num} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? '#1d4838' : '#e8e4de',
                        color: isDone ? '#ffffff' : '#8c867f',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.4rem',
                        border: isCurrent ? '2px solid #c5a880' : 'none'
                      }}>
                        {isDone ? <CheckCircle size={14} /> : st.num}
                      </div>
                      <div style={{ fontSize: '0.72rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#141414' : '#7a756f' }}>
                        {st.label}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#9e9992', marginTop: '2px' }}>
                        {st.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logistics Status Minimal Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #ebe6df', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={16} color="#c5a880" />
                <span><strong>Status:</strong> {trackedOrder.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Truck size={16} color="#c5a880" />
                <span><strong>Courier Tracking:</strong> {trackedOrder.courierTracking}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MapPin size={16} color="#c5a880" />
                <span><strong>Destination City:</strong> {trackedOrder.destinationCity}, {trackedOrder.destinationProvince}</span>
              </div>
            </div>

            {/* Minimal Items List (No sensitive financial totals) */}
            {trackedOrder.items && trackedOrder.items.length > 0 && (
              <div>
                <span style={{ fontSize: '0.72rem', color: '#8c867f', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
                  Enclosed Items ({trackedOrder.items.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {trackedOrder.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0.4rem 0', borderBottom: '1px dashed #eee' }}>
                      <span style={{ color: '#141414' }}>{it.title}</span>
                      <span style={{ color: '#7a756f', fontSize: '0.75rem' }}>Size: {it.size} &bull; Qty: {it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
