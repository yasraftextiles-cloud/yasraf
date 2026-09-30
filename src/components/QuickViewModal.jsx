import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Check, 
  Ruler, 
  Truck, 
  RefreshCw, 
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { CURRENCIES } from '../data/products';
import { BRAND_CONFIG } from '../data/brandConfig';

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  currency = 'PKR',
  onAddToCart,
  onOpenSizeGuide,
  isWishlisted,
  onToggleWishlist,
  onDirectBuyNow,
  allProducts = [],
  onSelectProduct
}) {
  if (!isOpen || !product) return null;

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setSelectedSize(product.sizes ? product.sizes[0] : 'Standard');
      setQuantity(1);
      setAddedSuccess(false);
    }
  }, [product]);

  const curr = CURRENCIES[currency] || CURRENCIES.PKR;
  const convertedPrice = Math.round(product.price * curr.rate).toLocaleString();
  const convertedOriginal = product.originalPrice 
    ? Math.round(product.originalPrice * curr.rate).toLocaleString() 
    : null;

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : null;

  const handleAdd = () => {
    onAddToCart({
      ...product,
      image: activeImage,
      selectedSize,
      quantity
    });
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 1800);
  };

  const handleBuyNow = () => {
    if (onDirectBuyNow) {
      onDirectBuyNow({
        ...product,
        image: activeImage,
        selectedSize,
        quantity
      });
    } else {
      handleAdd();
    }
  };

  const whatsAppUrl = BRAND_CONFIG.getWhatsAppOrderUrl(product, selectedSize);

  // Clean Related products (3 max)
  const relatedProducts = (allProducts || [])
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const allImages = (product.gallery && product.gallery.length > 0) 
    ? product.gallery 
    : [product.image, product.secondaryImage].filter(Boolean);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 10, 10, 0.72)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem'
    }}
    onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '1020px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '2px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.1)',
            color: '#141414',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f4ee'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          <X size={18} />
        </button>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 p-5 sm:p-8 lg:p-10">
          {/* Left Column: Visual Photography */}
          <div>
            <div style={{
              width: '100%',
              aspectRatio: '3 / 4.1',
              backgroundColor: '#f7f4ee',
              overflow: 'hidden',
              borderRadius: '2px',
              position: 'relative'
            }}>
              <img
                src={activeImage}
                alt={product.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 15%'
                }}
              />

              {discountPercent && (
                <span style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  backgroundColor: '#942929',
                  color: '#fff',
                  padding: '0.3rem 0.65rem',
                  letterSpacing: '0.06em'
                }}>
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '0.6rem',
                marginTop: '0.8rem',
                overflowX: 'auto',
                scrollbarWidth: 'none'
              }}>
                {allImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(imgUrl)}
                    style={{
                      width: '68px',
                      height: '84px',
                      flexShrink: 0,
                      border: activeImage === imgUrl ? '2px solid #141414' : '1px solid rgba(0,0,0,0.1)',
                      padding: 0,
                      backgroundColor: '#f7f4ee',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`View ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Clean Conversion Information */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Category */}
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#8e704b',
              marginBottom: '0.4rem'
            }}>
              {product.categoryLabel || 'LUXURY PRÊT'}
            </span>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 2.5vw, 1.95rem)',
              fontWeight: 500,
              lineHeight: 1.25,
              color: '#141414',
              margin: '0 0 0.8rem 0'
            }}>
              {product.title}
            </h1>

            {/* Price */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.8rem',
              marginBottom: '1.2rem',
              paddingBottom: '1.2rem',
              borderBottom: '1px solid rgba(20,20,20,0.06)'
            }}>
              <span style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#141414',
                letterSpacing: '0.01em'
              }}>
                {curr.symbol} {convertedPrice}
              </span>

              {convertedOriginal && (
                <span style={{
                  fontSize: '1rem',
                  color: '#9c978f',
                  textDecoration: 'line-through'
                }}>
                  {curr.symbol} {convertedOriginal}
                </span>
              )}

              <span style={{
                fontSize: '0.68rem',
                color: '#1d4838',
                fontWeight: 600,
                marginLeft: 'auto',
                letterSpacing: '0.04em'
              }}>
                ● IN STOCK
              </span>
            </div>



            {/* Size Selector + Size Guide */}
            <div style={{ marginBottom: '1.4rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.6rem'
              }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#141414'
                }}>
                  Size: <strong>{selectedSize}</strong>
                </span>

                <button
                  onClick={onOpenSizeGuide}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.72rem',
                    color: '#8e704b',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <Ruler size={13} /> Size Guide
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'Unstitched']).map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        minWidth: '46px',
                        padding: '0.55rem 0.9rem',
                        fontSize: '0.76rem',
                        fontWeight: isSelected ? 700 : 500,
                        backgroundColor: isSelected ? '#121212' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#141414',
                        border: isSelected ? '1px solid #121212' : '1px solid rgba(20,20,20,0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.6rem'
            }}>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#141414'
              }}>
                Quantity:
              </span>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid rgba(20,20,20,0.15)'
              }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '0.45rem 0.8rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  -
                </button>
                <span style={{
                  padding: '0 0.8rem',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    padding: '0.45rem 0.8rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  +
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => onToggleWishlist(product)}
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  color: isWishlisted ? '#942929' : '#55524e',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Heart size={16} fill={isWishlisted ? '#942929' : 'none'} strokeWidth={1.8} />
                <span>{isWishlisted ? 'Saved' : 'Save to Wishlist'}</span>
              </button>
            </div>

            {/* Conversion CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  onClick={handleAdd}
                  style={{
                    flex: 1,
                    padding: '0.95rem 1.4rem',
                    backgroundColor: addedSuccess ? '#1d4838' : '#121212',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  {addedSuccess ? <Check size={16} /> : <ShoppingBag size={16} />}
                  <span>{addedSuccess ? 'Added To Bag' : 'Add To Bag'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  style={{
                    flex: 1,
                    padding: '0.95rem 1.4rem',
                    backgroundColor: '#c5a880',
                    color: '#121212',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  Buy Now
                </button>
              </div>

              {/* Direct WhatsApp Ordering */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#f5faf6',
                  border: '1px solid #c2e5cf',
                  color: '#1c733f',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.04em'
                }}
              >
                <MessageCircle size={16} />
                <span>Order On WhatsApp • Quick Assistance</span>
              </a>
            </div>

            {/* Delivery & Returns Info (Compact) */}
            <div style={{
              borderTop: '1px solid rgba(20,20,20,0.08)',
              paddingTop: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              fontSize: '0.76rem',
              color: '#6e6b66'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Truck size={15} style={{ color: '#c5a880', flexShrink: 0 }} />
                <span><strong>Nationwide Delivery:</strong> 2–4 business days across Pakistan (Free above Rs. {BRAND_CONFIG.freeShippingThreshold.toLocaleString()})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <RefreshCw size={15} style={{ color: '#c5a880', flexShrink: 0 }} />
                <span><strong>Hassle-Free Exchange:</strong> 7-day policy for unworn items with original tags.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{
            borderTop: '1px solid rgba(20,20,20,0.06)',
            padding: '2rem 2.5rem',
            backgroundColor: '#fcfbf9'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.15rem',
              fontWeight: 500,
              color: '#141414',
              marginBottom: '1.2rem'
            }}>
              You May Also Like
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.2rem'
            }}>
              {relatedProducts.map((rel) => {
                const relPrice = Math.round(rel.price * curr.rate).toLocaleString();
                return (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct ? onSelectProduct(rel) : null}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.9rem',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(20,20,20,0.06)'
                    }}
                  >
                    <img
                      src={rel.image}
                      alt={rel.title}
                      style={{ width: '56px', height: '70px', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#141414',
                        margin: 0,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {rel.title}
                      </h4>
                      <span style={{ fontSize: '0.74rem', color: '#8e704b', fontWeight: 600 }}>
                        {curr.symbol} {relPrice}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
