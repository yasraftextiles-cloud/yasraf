import React, { useMemo } from 'react';
import ProductCard from './ProductCard';

export default function SignatureEdit({
  products = [],
  currency = 'PKR',
  onQuickView,
  wishlistIds = [],
  onToggleWishlist,
  onDiscover
}) {
  const displayItems = useMemo(() => {
    return products
      .filter((product) => product.isPublished ?? product.is_published ?? true)
      .sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
      });
  }, [products]);

  if (displayItems.length === 0) return null;

  const handleDiscoverClick = (e) => {
    e.preventDefault();
    if (onDiscover) {
      onDiscover();
    } else {
      const el = document.getElementById('catalog') || document.getElementById('new-arrivals');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="signature-edit" 
      className="w-full bg-[#fbfaf8] py-16 sm:py-24 lg:py-28 border-b border-neutral-200/50"
    >
      <div className="max-w-[2000px] mx-auto px-2 sm:px-4 lg:px-8">
        
        {/* Header Typography */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 
            className="text-[28px] sm:text-[34px] lg:text-[38px] text-[#67615c] font-light tracking-tight mb-1"
            style={{ fontFamily: 'var(--font-family-editorial)', color: '#67615c' }}
          >
            The Signature Edit
          </h2>
          <p 
            className="text-[10.5px] sm:text-[11.5px] uppercase tracking-[0.22em] font-medium text-[#857d74] mb-3"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            HANDPICKED STYLES BY YASRAF
          </p>
          <a 
            href="#collections" 
            onClick={handleDiscoverClick}
            className="text-[11.5px] uppercase tracking-[0.18em] font-medium text-[#67615c] border-b border-[#67615c]/60 pb-[3px] hover:text-[#1a1814] hover:border-[#1a1814] transition-colors inline-block cursor-pointer"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            DISCOVER THE CAPSULE
          </a>
        </div>

        {/* Dynamic 4-Column Grid: 4 per row on desktop, continuing naturally onto next rows */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-3.5">
          {displayItems.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              currency={currency}
              onQuickView={onQuickView}
              isWishlisted={wishlistIds.includes(prod.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
