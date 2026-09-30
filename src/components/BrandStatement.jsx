import React from 'react';

export default function BrandStatement() {
  return (
    <section style={{
      padding: '5.5rem 1.5rem',
      backgroundColor: '#fbfaf8',
      borderTop: '1px solid rgba(20, 20, 20, 0.05)',
      borderBottom: '1px solid rgba(20, 20, 20, 0.05)',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#9c9489',
          display: 'block',
          marginBottom: '1.2rem',
          fontFamily: 'var(--font-sans)'
        }}>
          YASRAF ATELIER
        </span>

        <blockquote style={{
          fontFamily: 'var(--font-editorial, "Cormorant Garamond", Georgia, serif)',
          fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)',
          fontWeight: 300,
          lineHeight: 1.45,
          color: '#67615c',
          letterSpacing: '0.01em',
          margin: '0 0 1.5rem 0'
        }}>
          &ldquo;Elegance in every stitch — celebrating the rich heritage of Pakistani craftsmanship through contemporary ready-to-wear luxury.&rdquo;
        </blockquote>

        <div style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.6rem 1rem',
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#8c867f',
          fontWeight: 500,
          padding: '0 0.5rem'
        }}>
          <span>FINE FABRICS</span>
          <span style={{ color: '#c5a880' }}>•</span>
          <span>ARTISANAL CUTWORK</span>
          <span style={{ color: '#c5a880' }}>•</span>
          <span>TIMELESS SILHOUETTES</span>
        </div>
      </div>
    </section>
  );
}
