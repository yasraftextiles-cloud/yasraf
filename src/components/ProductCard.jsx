import React, { useState } from 'react';
import { Heart, Eye } from 'lucide-react';
import { CURRENCIES } from '../data/products';

export default function ProductCard({ 
  product, 
  currency = 'PKR', 
  onQuickView, 
  isWishlisted, 
  onToggleWishlist,
  variant = 'default'
}) {
  const [isHovered, setIsHovered] = useState(false);

  const curr = CURRENCIES[currency] || CURRENCIES.PKR;
  const convertedPrice = Math.round(product.price * curr.rate).toLocaleString();
  const convertedOriginal = product.originalPrice 
    ? Math.round(product.originalPrice * curr.rate).toLocaleString() 
    : null;

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : null;

  if (variant === 'editorial') {
    // Single Short Title (e.g., 'Fleuris' or 'Firouzeh')
    const singleTitle = (() => {
      const KNOWN_SINGLE = {
        'yas-001': 'Noor',
        'yas-002': 'Firouzeh',
        'yas-003': 'Gul',
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
      if (KNOWN_SINGLE[product.id]) return KNOWN_SINGLE[product.id];
      return product.title.replace(/-e-/gi, ' ').replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/)[0] || 'Luxury';
    })();

    return (
      <div 
        className="group relative overflow-hidden aspect-[3/4.2] w-full bg-[#f7f4ee] cursor-pointer"
        onClick={() => onQuickView && onQuickView(product)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Default State: Clean Product Image Only */}
        <img
          src={isHovered && product.secondaryImage ? product.secondaryImage : product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-[center_15%] transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Hover Overlay: Tinted Fade In */}
        <div className="absolute inset-0 bg-[#e8e4df]/75 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out flex flex-col items-center justify-center text-center p-6 z-10">
          {/* Staggered / Delayed Content Reveal */}
          <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 delay-100 ease-out flex flex-col items-center max-w-[90%]">
            
            {/* Title: Single Short Title */}
            <h3 
              className="font-serif text-2xl md:text-3xl text-neutral-800 font-normal tracking-normal mb-2"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {singleTitle}
            </h3>

            {/* Price Row (Strict Single Line) */}
            <div className="flex items-baseline justify-center gap-2 whitespace-nowrap mb-6">
              <span className="text-xl md:text-2xl font-light text-neutral-800 tracking-tight">
                {curr.symbol === 'Rs.' ? 'Rs. ' : curr.symbol}{convertedPrice}
              </span>
              {discountPercent && (
                <span className="text-xs md:text-sm font-medium text-[#b46146] tracking-wider uppercase">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* CTA Link */}
            <span className="text-xs uppercase tracking-[0.25em] font-medium text-neutral-900 border-b border-neutral-900 pb-1 hover:opacity-70 transition-all">
              VIEW NOW
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
        height: '100%',
        cursor: 'pointer'
      }}
      className="modern-product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView(product)}
    >
      {/* Editorial Image Stage with 3:4.2 Ratio */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 4.2',
          overflow: 'hidden',
          backgroundColor: '#f7f4ee'
        }}
      >
        {/* Main Photo with Smooth Subtle Zoom on Hover */}
        <img
          src={isHovered && product.secondaryImage ? product.secondaryImage : product.image}
          alt={product.title}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 15%',
            transition: 'transform 0.75s cubic-bezier(0.25, 1, 0.5, 1)',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)'
          }}
        />

        {/* Minimalist Top Badge (Only 1 discreet badge if applicable) */}
        <div style={{
          position: 'absolute',
          top: '0.8rem',
          left: '0.8rem',
          zIndex: 2
        }}>
          {product.isNew ? (
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              padding: '0.25rem 0.6rem',
              textTransform: 'uppercase',
              backgroundColor: '#121212',
              color: '#ffffff'
            }}>
              NEW
            </span>
          ) : discountPercent ? (
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 600,
              padding: '0.25rem 0.6rem',
              backgroundColor: '#942929',
              color: '#ffffff',
              letterSpacing: '0.06em'
            }}>
              -{discountPercent}%
            </span>
          ) : null}
        </div>

        {/* Top-Right: Discreet Wishlist Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: 'absolute',
            top: '0.8rem',
            right: '0.8rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(4px)',
            color: isWishlisted ? '#942929' : '#141414',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            zIndex: 3,
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.12)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={15} fill={isWishlisted ? '#942929' : 'none'} strokeWidth={1.8} />
        </button>

        {/* Slide-Up Quick View Trigger on Hover */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          zIndex: 4,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
          transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#121212'
        }}>
          <Eye size={14} />
          <span>Quick View</span>
        </div>
      </div>

      {/* Refined Minimalist Product Typography */}
      <div style={{
        padding: '1rem 0.2rem 0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        flex: 1
      }}>
        {/* Category line */}
        <div style={{
          fontSize: '0.64rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#8e704b'
        }}>
          <span>{product.categoryLabel || 'LUXURY PRÊT'}</span>
        </div>

        {/* Product Title */}
        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.05rem',
          fontWeight: 500,
          lineHeight: 1.35,
          color: '#141414',
          margin: 0,
          letterSpacing: '0.01em',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.title}
        </h3>

        {/* Price Row */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.55rem',
          marginTop: '0.2rem'
        }}>
          <span style={{
            fontSize: '0.96rem',
            fontWeight: 600,
            color: '#141414',
            letterSpacing: '0.01em'
          }}>
            {curr.symbol} {convertedPrice}
          </span>

          {convertedOriginal && (
            <span style={{
              fontSize: '0.8rem',
              color: '#9c978f',
              textDecoration: 'line-through'
            }}>
              {curr.symbol} {convertedOriginal}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
