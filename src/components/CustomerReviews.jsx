import React from 'react';
import { REVIEWS } from '../data/products';
import { Star, CheckCircle, Quote } from 'lucide-react';

export default function CustomerReviews() {
  return (
    <section style={{
      padding: '5rem 0',
      backgroundColor: '#fcfbf9'
    }}>
      <div className="yasraf-container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">Client Testimonials</span>
          <h2 className="section-title">Loved by Thousands Nationwide</h2>
          <p style={{
            fontSize: '0.95rem',
            color: '#6e6b66',
            maxWidth: '520px',
            margin: '0 auto'
          }}>
            Real words from our patrons in Lahore, Karachi, Islamabad, Dubai, and beyond.
          </p>
          <div className="section-divider" />
        </div>

        {/* 4 Testimonial Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.8rem'
        }}>
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              style={{
                backgroundColor: '#ffffff',
                padding: '2rem 1.6rem',
                border: '1px solid rgba(20,20,20,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}
            >
              <Quote 
                size={34} 
                style={{ 
                  color: 'rgba(197, 168, 128, 0.25)', 
                  position: 'absolute', 
                  top: '1.5rem', 
                  right: '1.5rem' 
                }} 
              />

              <div>
                {/* Star rating */}
                <div style={{ display: 'flex', gap: '0.2rem', color: '#c5a880', marginBottom: '0.8rem' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#c5a880" color="#c5a880" />
                  ))}
                </div>

                <h4 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.08rem',
                  fontWeight: 600,
                  color: '#141414',
                  lineHeight: 1.35,
                  marginBottom: '0.65rem'
                }}>
                  "{rev.title}"
                </h4>

                <p style={{
                  fontSize: '0.86rem',
                  color: '#5e5a55',
                  lineHeight: 1.6,
                  marginBottom: '1.4rem'
                }}>
                  {rev.comment}
                </p>
              </div>

              <div style={{
                paddingTop: '1rem',
                borderTop: '1px solid #f1ede6',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#141414' }}>
                    {rev.name}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.68rem',
                    color: '#1d4838',
                    fontWeight: 600
                  }}>
                    <CheckCircle size={12} /> Verified Buyer
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#8c867f' }}>
                  <span>{rev.city}</span>
                  <span style={{ color: '#c5a880', fontWeight: 500 }}>{rev.product}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
