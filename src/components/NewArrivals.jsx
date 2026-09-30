import React from 'react';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';

export default function NewArrivals({
  products = [],
  currency,
  onQuickView,
  wishlistIds = [],
  onToggleWishlist,
  onSelectCategory
}) {
  // Filter new arrivals (or take top 4)
  const newProducts = products.filter((p) => p.isNew).slice(0, 4);
  const displayItems = newProducts.length > 0 ? newProducts : products.slice(0, 4);

  return (
    <section id="new-arrivals" style={{
      padding: '5rem 0',
      backgroundColor: '#ffffff'
    }}>
      <div className="yasraf-container">
        {/* Clean Minimal Section Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(20, 20, 20, 0.06)'
        }}>
          <div>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#c5a880',
              display: 'block',
              marginBottom: '0.35rem'
            }}>
              JUST ARRIVED
            </span>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
              fontWeight: 400,
              color: '#141414',
              margin: 0,
              letterSpacing: '0.02em'
            }}>
              New Arrivals
            </h2>
          </div>

          <button
            onClick={() => {
              onSelectCategory('new-in');
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#141414',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              paddingBottom: '0.2rem',
              borderBottom: '1px solid #141414',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#c5a880';
              e.currentTarget.style.borderColor = '#c5a880';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#141414';
              e.currentTarget.style.borderColor = '#141414';
            }}
          >
            <span>View All New</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 4 Cards Grid with Generous Spacing */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem 1.5rem'
        }}>
          {displayItems.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              currency={currency}
              onQuickView={onQuickView}
              isWishlisted={wishlistIds.includes(prod.id)}
              onToggleWishlist={onToggleWishlist}
              variant="editorial"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
