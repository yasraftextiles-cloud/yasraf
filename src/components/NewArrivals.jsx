import React, { useMemo } from 'react';
import ProductCard from './ProductCard';

export default function NewArrivals({
  products = [],
  currency,
  onQuickView,
  wishlistIds = [],
  onToggleWishlist,
  onSelectCategory
}) {
  const displayItems = useMemo(() => {
    return products
      .filter((p) => {
        const isPublished = p.isPublished ?? p.is_published ?? true;
        const showInNewArrivals = Boolean(p.showInNewArrivals ?? p.show_in_new_arrivals ?? p.isNew ?? p.is_new);
        return isPublished && showInNewArrivals;
      })
      .slice()
      .sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
      });
  }, [products]);

  const itemsToRender = displayItems.length > 0 
    ? displayItems 
    : products.filter(p => (p.isPublished ?? true) && (p.isNew ?? true)).slice(0, 4);

  if (itemsToRender.length === 0) return null;

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
          {itemsToRender.map((prod) => (
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
