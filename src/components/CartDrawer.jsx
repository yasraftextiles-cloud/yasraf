import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Gift, Tag, Check, Truck, ArrowLeft } from 'lucide-react';
import { CURRENCIES } from '../data/products';
import { BRAND_CONFIG } from '../data/brandConfig';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  currency = 'PKR'
}) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // decimal 0.10 for 10%
  const [promoMessage, setPromoMessage] = useState(null);
  const [giftWrap, setGiftWrap] = useState(false);

  if (!isOpen) return null;

  const curr = CURRENCIES[currency] || CURRENCIES.PKR;

  // Subtotal in PKR
  const subtotalPKR = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const freeShippingThresholdPKR = BRAND_CONFIG.freeShippingThreshold;
  const isFreeShipping = subtotalPKR >= freeShippingThresholdPKR;
  const amountNeededForFree = Math.max(0, freeShippingThresholdPKR - subtotalPKR);
  const shippingFeePKR = isFreeShipping || cartItems.length === 0 ? 0 : BRAND_CONFIG.standardShippingFee;
  const giftWrapFeePKR = giftWrap ? 350 : 0;
  const discountAmountPKR = Math.round(subtotalPKR * appliedDiscount);
  const grandTotalPKR = subtotalPKR - discountAmountPKR + shippingFeePKR + giftWrapFeePKR;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'YASRAF10') {
      setAppliedDiscount(0.10);
      setPromoMessage({ type: 'success', text: '10% Welcome Discount applied!' });
    } else if (promoCode.trim().toUpperCase() === 'EID26') {
      setAppliedDiscount(0.15);
      setPromoMessage({ type: 'success', text: '15% Eid Festive Discount applied!' });
    } else {
      setAppliedDiscount(0);
      setPromoMessage({ type: 'error', text: 'Invalid voucher code. Try "YASRAF10"' });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(18, 18, 18, 0.65)',
      backdropFilter: 'blur(5px)',
      zIndex: 99999,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      {/* Click outside to close */}
      <div style={{ flex: 1 }} onClick={onClose} />

      {/* Drawer Body */}
      <div 
        className="animate-slide-right"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-drawer)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.4rem 1.6rem',
          borderBottom: '1px solid #ede8de',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} style={{ color: '#141414' }} />
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.3rem',
              fontWeight: 600,
              letterSpacing: '0.04em'
            }}>
              Your Shopping Bag
            </h3>
            <span style={{
              fontSize: '0.72rem',
              backgroundColor: '#f5f0ea',
              color: '#8c867f',
              padding: '0.2rem 0.6rem',
              fontWeight: 700
            }}>
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close cart"
            style={{
              padding: '0.4rem',
              borderRadius: '50%',
              backgroundColor: '#f5f0ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ede8dd'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f0ea'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div style={{
          padding: '0.85rem 1.6rem',
          backgroundColor: isFreeShipping ? '#f0f7f3' : '#faf7f2',
          borderBottom: '1px solid #ede8de'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: isFreeShipping ? '#1d4838' : '#6e6b66',
            marginBottom: '0.4rem'
          }}>
            <Truck size={15} style={{ color: isFreeShipping ? '#1d4838' : '#c5a880' }} />
            {isFreeShipping ? (
              <span>🎉 Congratulations! You unlocked <strong>FREE Nationwide Delivery</strong></span>
            ) : (
              <span>Add <strong>{curr.symbol} {Math.round(amountNeededForFree * curr.rate).toLocaleString()}</strong> more for FREE Shipping!</span>
            )}
          </div>

          {/* Meter bar */}
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e6dfd5',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, (subtotalPKR / freeShippingThresholdPKR) * 100)}%`,
              height: '100%',
              backgroundColor: isFreeShipping ? '#1d4838' : '#c5a880',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Cart Item List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.2rem 1.6rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem'
        }}>
          {cartItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              color: '#8c867f'
            }}>
              <ShoppingBag size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#141414', marginBottom: '0.4rem' }}>
                Your bag is empty
              </h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Explore our luxury prêt and ready-to-wear collections to add pieces.
              </p>
              <button
                onClick={onClose}
                className="btn-luxury"
                style={{ padding: '0.75rem 1.8rem' }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingBottom: '1.2rem',
                  borderBottom: '1px solid #f2eee8',
                  alignItems: 'center'
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '74px',
                  height: '96px',
                  borderRadius: '0',
                  overflow: 'hidden',
                  backgroundColor: '#f6f3ed',
                  flexShrink: 0
                }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.96rem',
                    fontWeight: 600,
                    color: '#141414',
                    lineHeight: 1.25,
                    marginBottom: '0.25rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.title}
                  </h4>

                  <div style={{ fontSize: '0.72rem', color: '#8c867f', marginBottom: '0.5rem' }}>
                    <span>Size: <strong>{item.selectedSize}</strong></span> • <span>Color: <strong>{item.selectedColor}</strong></span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    {/* Quantity controls */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #d5cfc4',
                      backgroundColor: '#fcfbf9'
                    }}>
                      <button
                        onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                        style={{ padding: '0.3rem 0.6rem', color: '#141414' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0 0.5rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                        style={{ padding: '0.3rem 0.6rem', color: '#141414' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#141414' }}>
                        {curr.symbol} {Math.round(item.price * item.quantity * curr.rate).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveItem(item)}
                  aria-label="Remove item"
                  style={{
                    color: '#9c978f',
                    padding: '0.4rem',
                    transition: 'color 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#942929'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9c978f'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Summary */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '1.2rem 1.6rem 1.6rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #ede8de',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.04)'
          }}>
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Tag size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9c978f' }} />
                <input
                  type="text"
                  placeholder="Voucher code (try YASRAF10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.6rem 0.55rem 2rem',
                    border: '1px solid #ddd',
                    fontSize: '0.78rem',
                    outline: 'none',
                    textTransform: 'uppercase'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '0.55rem 1rem',
                  backgroundColor: '#121212',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Apply
              </button>
            </form>

            {promoMessage && (
              <div style={{
                fontSize: '0.72rem',
                color: promoMessage.type === 'success' ? '#1d4838' : '#942929',
                marginBottom: '0.6rem',
                fontWeight: 600
              }}>
                {promoMessage.text}
              </div>
            )}

            {/* Gift Wrap Checkbox */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.78rem',
              color: '#4a4642',
              cursor: 'pointer',
              marginBottom: '1rem',
              padding: '0.4rem 0'
            }}>
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
                style={{ accentColor: '#c5a880', width: '15px', height: '15px' }}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Gift size={14} style={{ color: '#c5a880' }} /> Luxury Gold Gift Box (+{curr.symbol} {Math.round(350 * curr.rate)})
              </span>
            </label>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: '#6e6b66', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span style={{ color: '#141414', fontWeight: 600 }}>{curr.symbol} {Math.round(subtotalPKR * curr.rate).toLocaleString()}</span>
              </div>
              {appliedDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1d4838', fontWeight: 600 }}>
                  <span>Voucher Savings</span>
                  <span>-{curr.symbol} {Math.round(discountAmountPKR * curr.rate).toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Charges</span>
                <span style={{ color: isFreeShipping ? '#1d4838' : '#141414', fontWeight: 600 }}>
                  {isFreeShipping ? 'FREE' : `${curr.symbol} ${Math.round(shippingFeePKR * curr.rate)}`}
                </span>
              </div>
              {giftWrap && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Luxury Gift Packaging</span>
                  <span>{curr.symbol} {Math.round(giftWrapFeePKR * curr.rate)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.6rem',
                borderTop: '1px solid #ede8de',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#141414'
              }}>
                <span>Total Amount</span>
                <span>{curr.symbol} {Math.round(grandTotalPKR * curr.rate).toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onClose();
                onOpenCheckout({
                  cartItems,
                  subtotal: subtotalPKR,
                  discount: discountAmountPKR,
                  shipping: shippingFeePKR,
                  giftWrap: giftWrapFeePKR,
                  total: grandTotalPKR,
                  currency
                });
              }}
              style={{
                width: '100%',
                padding: '0.95rem',
                backgroundColor: '#121212',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                marginBottom: '0.6rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c5a880';
                e.currentTarget.style.color = '#121212';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#121212';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              Proceed to Secure Checkout <ArrowRight size={17} />
            </button>

            {/* Continue Shopping Button */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: 'transparent',
                color: '#6e6b66',
                fontSize: '0.76rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} /> Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
