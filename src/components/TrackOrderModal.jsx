import React, { useState } from 'react';
import { X, Search, CheckCircle, Clock, Truck, Package, MapPin } from 'lucide-react';

export default function TrackOrderModal({ isOpen, onClose }) {
  const [orderQuery, setOrderQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleTrack = (e) => {
    e.preventDefault();
    setSearched(true);
    // Simulate lookup
    if (orderQuery.trim().length > 3) {
      setTrackedOrder({
        orderId: orderQuery.toUpperCase().startsWith('YAS-') ? orderQuery.toUpperCase() : `YAS-${orderQuery.toUpperCase()}`,
        status: 'Dispatched via TCS Express',
        courierTracking: 'TCS-78923412',
        origin: 'Yasraf Central Atelier, Lahore',
        destination: 'Karachi, Pakistan',
        currentStep: 3, // 1: Placed, 2: Inspected/Stitched, 3: Dispatched, 4: Delivered
        datePlaced: '22 Sep 2026',
        estDelivery: 'Tomorrow by 4:00 PM',
        items: [
          { title: 'Firouzeh Emerald Embroidered Festive Kalidar', qty: 1, size: 'Stitched - M' }
        ]
      });
    } else {
      setTrackedOrder(null);
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
            Live Shipment Tracker
          </span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', color: '#141414', marginBottom: '0.4rem' }}>
          Track Your Yasraf Order
        </h3>
        <p style={{ color: '#6e6b66', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Enter your Order Tracking ID (e.g. <code>YAS-9821</code>) or phone number to check status.
        </p>

        {/* Input Form */}
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem' }}>
          <input
            type="text"
            required
            placeholder="Enter Order # or Tracking Code (Try: YAS-9821)"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid #d5cfc4',
              fontSize: '0.9rem',
              outline: 'none',
              textTransform: 'uppercase'
            }}
          />
          <button
            type="submit"
            className="btn-luxury"
            style={{ padding: '0.75rem 1.6rem' }}
          >
            Track
          </button>
        </form>

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
                <span style={{ fontSize: '0.7rem', color: '#8c867f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Courier CN</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1d4838' }}>{trackedOrder.courierTracking}</div>
              </div>
            </div>

            {/* Stepper */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              position: 'relative',
              marginBottom: '1.8rem'
            }}>
              {steps.map((st) => {
                const isPassed = st.num <= trackedOrder.currentStep;
                const isCurrent = st.num === trackedOrder.currentStep;
                return (
                  <div key={st.num} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      margin: '0 auto 0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isPassed ? '#1d4838' : '#e6dfd5',
                      color: isPassed ? '#ffffff' : '#888',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(29, 72, 56, 0.2)' : 'none'
                    }}>
                      {isPassed ? <CheckCircle size={16} /> : st.num}
                    </div>
                    <div style={{ fontSize: '0.74rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#141414' : '#6e6b66' }}>
                      {st.label}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#8c867f' }}>
                      {st.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.6rem 0', borderTop: '1px solid #eee' }}>
              <span style={{ color: '#7a756f' }}>Expected Arrival:</span>
              <strong style={{ color: '#1d4838' }}>{trackedOrder.estDelivery}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.6rem 0' }}>
              <span style={{ color: '#7a756f' }}>Transit Route:</span>
              <span>{trackedOrder.origin} → {trackedOrder.destination}</span>
            </div>
          </div>
        )}

        {searched && !trackedOrder && (
          <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#fff5f5', border: '1px solid #ffd8d8', color: '#942929', fontSize: '0.85rem' }}>
            No parcel found for tracking reference <strong>"{orderQuery}"</strong>. Please verify the code or contact WhatsApp concierge.
          </div>
        )}
      </div>
    </div>
  );
}
