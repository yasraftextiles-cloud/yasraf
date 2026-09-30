import React from 'react';
import ProductCard from './ProductCard';

export default function NewArrivals({
  products = [],
  currency,
  onQuickView,
  wishlistIds = [],
  onToggleWishlist,
  onSelectCategory
}) {
  const newProducts = products.filter((p) => p.isNew).slice(0, 4);
  const displayItems = newProducts.length >= 4 ? newProducts : products.slice(0, 4);

  return (
    <section 
      id="new-arrivals" 
      className="w-full bg-[#ffffff] pt-12 sm:pt-16 pb-16 sm:pb-20"
    >
      <div className="w-full max-w-[2000px] mx-auto px-2 sm:px-4 lg:px-8">
        
        {/* Subtle Minimal Header with Light Heading Color */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 
            className="text-[28px] sm:text-[34px] lg:text-[38px] text-[#67615c] font-light tracking-tight mb-2"
            style={{ fontFamily: 'var(--font-family-editorial)', color: '#67615c' }}
          >
            New Arrivals
          </h2>
          <button
            onClick={() => {
              if (onSelectCategory) onSelectCategory('all');
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[11.5px] uppercase tracking-[0.18em] font-medium text-[#67615c] border-b border-[#67615c]/60 pb-[3px] hover:text-[#1a1814] hover:border-[#1a1814] transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            DISCOVER THE COLLECTION
          </button>
        </div>

        {/* 4-Column Edge-to-Edge Grid with Large 2/3 Photos Matching Jahaan */}
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
