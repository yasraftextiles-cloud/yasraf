import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { CURRENCIES } from '../data/products';

export default function WishlistModal({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveWishlist,
  onAddToCart,
  currency = 'PKR'
}) {
  if (!isOpen) return null;

  const curr = CURRENCIES[currency] || CURRENCIES.PKR;

  const handleMoveAllToBag = () => {
    wishlistProducts.forEach((item) => {
      onAddToCart({
        ...item,
        selectedSize: item.sizes ? item.sizes[0] : 'Standard',
        selectedColor: item.colors ? item.colors[0].name : 'Default',
        quantity: 1
      });
      onRemoveWishlist(item.id);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          padding: '2rem',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '2px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.2rem',
          paddingBottom: '0.8rem',
          borderBottom: '1px solid #ede8de'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={20} fill="#942929" color="#942929" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#141414' }}>
              Saved Wishlist ({wishlistProducts.length})
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {wishlistProducts.length > 1 && (
              <button
                onClick={handleMoveAllToBag}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#8e704b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  cursor: 'pointer'
                }}
              >
                Move All to Bag
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close wishlist"
              style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: '#f5f0ea', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {wishlistProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#8c867f' }}>
              <Heart size={44} strokeWidth={1} style={{ margin: '0 auto 0.8rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.95rem', color: '#141414', marginBottom: '0.4rem', fontWeight: 600 }}>
                Your wishlist is currently empty
              </p>
              <p style={{ fontSize: '0.82rem', marginBottom: '1.2rem' }}>
                Tap the heart on any ready-to-wear or luxury prêt design to save it here for later.
              </p>
              <button onClick={onClose} className="btn-luxury" style={{ padding: '0.65rem 1.6rem' }}>
                Explore Collections
              </button>
            </div>
          ) : (
            wishlistProducts.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.8rem',
                  backgroundColor: '#fbf9f6',
                  border: '1px solid #ede8de'
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: '64px', height: '84px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', color: '#c5a880', fontWeight: 700, textTransform: 'uppercase' }}>
                    {item.categoryLabel}
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', fontWeight: 600, color: '#141414', marginBottom: '0.2rem' }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#141414' }}>
                    {curr.symbol} {Math.round(item.price * curr.rate).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                  <button
                    onClick={() => {
                      onAddToCart({
                        ...item,
                        selectedSize: item.sizes ? item.sizes[0] : 'Standard',
                        selectedColor: item.colors ? item.colors[0].name : 'Default',
                        quantity: 1
                      });
                      onRemoveWishlist(item.id);
                    }}
                    style={{
                      padding: '0.45rem 0.85rem',
                      backgroundColor: '#121212',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    <ShoppingBag size={13} /> Move to Bag
                  </button>

                  <button
                    onClick={() => onRemoveWishlist(item.id)}
                    style={{
                      color: '#9c978f',
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#942929'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9c978f'}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
