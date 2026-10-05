import React from 'react';
import { CURRENCIES } from '../data/products';

export default function ProductCard({ 
  product, 
  currency = 'PKR', 
  onQuickView
}) {
  const curr = CURRENCIES[currency] || CURRENCIES.PKR;
  const convertedPrice = Math.round(product.price * curr.rate).toLocaleString();

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 10;

  // Single Elegant Title (e.g. 'Layrell', 'Noor', 'Firouzeh')
  const singleTitle = (() => {
    const KNOWN_NAMES = {
      'yas-001': 'Noor',
      'yas-002': 'Firouzeh',
      'yas-003': 'Layrell',
      'yas-004': 'Shahana',
      'yas-005': 'Zehra',
      'yas-006': 'Ayla',
      'yas-007': 'Sahar',
      'yas-008': 'Rania',
      'yas-009': 'Mehrunisa',
      'yas-010': 'Zardozi',
      'yas-011': 'Sitara',
      'yas-012': 'Baroque'
    };
    if (KNOWN_NAMES[product.id]) return KNOWN_NAMES[product.id];
    return product.title.replace(/-e-/gi, ' ').replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/)[0] || 'Layrell';
  })();

  return (
    <a 
      href={`#product-${product.id}`}
      className="jm-card group relative block w-full text-center cursor-pointer select-none no-underline text-inherit"
      onClick={(e) => {
        e.preventDefault();
        if (onQuickView) onQuickView(product);
      }}
      aria-label={`View ${singleTitle}`}
    >
      {/* 2 / 3 Tall Aspect Ratio Product Media Stage */}
      <div 
        className="relative block w-full overflow-hidden bg-[#ebe6e0]"
        style={{ aspectRatio: '2 / 3' }}
      >
        {/* Full-bleed Product Image: Drops opacity to 0.14 on hover exactly like Jahaan! */}
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          decoding="async"
          width="400"
          height="600"
          className="absolute inset-0 w-full h-full object-cover object-[center_18%] transition-all duration-500 ease-out group-hover:opacity-[0.14] group-hover:scale-[1.02]"
        />

        {/* Small Tag if applicable (fades out on hover) */}
        {discountPercent > 0 && (
          <span 
            className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 bg-[#faf8f6]/95 text-[#1a1814] text-[10px] tracking-[0.12em] uppercase font-medium group-hover:opacity-0 transition-opacity duration-300"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            SALE
          </span>
        )}

        {/* Centered Ghost Overlay: Fades in on hover with small, elegant typography */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 p-4 sm:p-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out pointer-events-none">
          {/* Product Name (Cormorant Garamond, 20px, light & delicate) */}
          <h3 
            className="text-[20px] sm:text-[22px] text-[#1a1814] font-normal leading-[1.25] tracking-normal max-w-[90%]"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            {singleTitle}
          </h3>

          {/* Price Line (Jost, 13px with terracotta 10% OFF) */}
          <div 
            className="flex items-center justify-center gap-2 text-[13px] text-[#67615c] tracking-[0.04em]"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            <span className="font-normal text-[#1a1814]">
              {curr.symbol === 'Rs.' ? 'Rs.' : curr.symbol}{convertedPrice}
            </span>
            {discountPercent > 0 && (
              <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#a4574b]">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Small Action Link (Jost, 11px, tracked uppercase, thin underline) */}
          <span 
            className="mt-1 pb-[3px] border-b border-[#1a1814] text-[11px] font-medium tracking-[0.18em] uppercase text-[#1a1814]"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            VIEW NOW
          </span>
        </div>
      </div>

      {/* Mobile Title & Price (Visible on touch/mobile screens where hover does not exist) */}
      <div className="mt-2.5 px-1 text-center md:hidden">
        <h3 
          className="text-[14px] text-[#1a1814] font-normal leading-tight tracking-wide"
          style={{ fontFamily: 'var(--font-family-editorial)' }}
        >
          {singleTitle}
        </h3>
        <div 
          className="mt-1 flex items-center justify-center gap-1.5 text-[11.5px] text-[#67615c]"
          style={{ fontFamily: 'var(--font-family-primary)' }}
        >
          <span className="font-normal text-[#1a1814]">
            {curr.symbol === 'Rs.' ? 'Rs. ' : curr.symbol}{convertedPrice}
          </span>
          {discountPercent > 0 && (
            <span className="text-[10px] font-medium tracking-wide uppercase text-[#a4574b]">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
