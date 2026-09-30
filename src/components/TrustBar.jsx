import React from 'react';
import { Truck, Banknote, Sparkles, MessageCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../data/brandConfig';

export default function TrustBar() {
  const trustItems = [
    {
      icon: <Truck size={22} strokeWidth={1.5} />,
      title: 'Nationwide Delivery',
      subtitle: `Free shipping above Rs. ${BRAND_CONFIG.freeShippingThreshold.toLocaleString()}`
    },
    {
      icon: <Banknote size={22} strokeWidth={1.5} />,
      title: 'Cash On Delivery',
      subtitle: 'Pay at your doorstep across Pakistan'
    },
    {
      icon: <Sparkles size={22} strokeWidth={1.5} />,
      title: 'Authentic Luxury Prêt',
      subtitle: 'Pure silks, fine lawn & artisanal Schiffli'
    },
    {
      icon: <MessageCircle size={22} strokeWidth={1.5} />,
      title: 'WhatsApp Concierge',
      subtitle: 'Direct styling advice & size assistance'
    }
  ];

  return (
    <section style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid rgba(20, 20, 20, 0.06)',
      borderBottom: '1px solid rgba(20, 20, 20, 0.06)',
      padding: '2.5rem 0'
    }}>
      <div className="yasraf-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem 1.5rem',
          alignItems: 'center'
        }}>
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.5rem 0'
              }}
            >
              <div style={{
                color: '#c5a880',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div>
                <h4 style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#141414',
                  margin: 0,
                  lineHeight: 1.3
                }}>
                  {item.title}
                </h4>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.74rem',
                  color: '#7a756f',
                  margin: '0.15rem 0 0 0',
                  lineHeight: 1.4
                }}>
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
