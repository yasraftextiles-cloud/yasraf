import React, { useState, useEffect } from 'react';
import { 
  X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, 
  Gift, Tag, Truck, Check, Sparkles 
} from 'lucide-react';
import { CURRENCIES } from '../data/products';
import { BRAND_CONFIG } from '../data/brandConfig';
import './CartDrawer.css';

// Safe attribute extractors to prevent "Objects are not valid as a React child" crashes
const getItemColor = (item) => {
  if (!item) return 'Original';
  if (typeof item.selectedColor === 'string' && item.selectedColor.trim()) {
    return item.selectedColor.trim();
  }
  if (item.selectedColor && typeof item.selectedColor === 'object') {
    if (typeof item.selectedColor.name === 'string' && item.selectedColor.name.trim()) {
      return item.selectedColor.name.trim();
    }
  }
  if (typeof item.color === 'string' && item.color.trim()) {
    return item.color.trim();
  }
  if (item.color && typeof item.color === 'object') {
    if (typeof item.color.name === 'string' && item.color.name.trim()) {
      return item.color.name.trim();
    }
  }
  return 'Original';
};

const getItemSize = (item) => {
  if (!item) return 'Standard';
  if (typeof item.selectedSize === 'string' && item.selectedSize.trim()) {
    return item.selectedSize.trim();
  }
  if (item.selectedSize && typeof item.selectedSize === 'object') {
    if (typeof item.selectedSize.name === 'string' && item.selectedSize.name.trim()) {
      return item.selectedSize.name.trim();
    }
  }
  if (typeof item.size === 'string' && item.size.trim()) {
    return item.size.trim();
  }
  return 'Standard';
};

const getItemTitle = (item) => {
  if (!item) return 'Luxury Ensemble';
  if (typeof item.title === 'string' && item.title.trim()) {
    return item.title.trim();
  }
  if (typeof item.name === 'string' && item.name.trim()) {
    return item.name.trim();
  }
  return 'Luxury Ensemble';
};

const getItemImage = (item) => {
  if (!item) return '/favicon.svg';
  if (typeof item.image === 'string' && item.image.trim()) {
    return item.image.trim();
  }
  if (Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string') {
    return item.images[0].trim();
  }
  return '/favicon.svg';
};

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  currency = 'PKR'
}) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // decimal 0.10 for 10%
  const [promoMessage, setPromoMessage] = useState(null);
  const [giftWrap, setGiftWrap] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const safeCartItems = Array.isArray(cartItems) ? cartItems.filter(Boolean) : [];
  const curr = CURRENCIES[currency] || CURRENCIES.PKR || { symbol: 'Rs.', rate: 1 };
  const currRate = Number(curr?.rate) || 1;
  const currSymbol = curr?.symbol || 'Rs.';

  // Real calculations based on configured threshold
  const subtotalPKR = safeCartItems.reduce((acc, item) => {
    const p = Number(item?.price) || 0;
    const q = Math.max(1, parseInt(item?.quantity, 10) || 1);
    return acc + (p * q);
  }, 0);
  const freeShippingThresholdPKR = BRAND_CONFIG.freeShippingThreshold || 4990;
  const isFreeShipping = subtotalPKR >= freeShippingThresholdPKR;
  const amountNeededForFree = Math.max(0, freeShippingThresholdPKR - subtotalPKR);
  const shippingFeePKR = isFreeShipping || safeCartItems.length === 0 ? 0 : (BRAND_CONFIG.standardShippingFee || 250);
  const giftWrapFeePKR = giftWrap && safeCartItems.length > 0 ? 350 : 0;
  const discountAmountPKR = Math.round(subtotalPKR * (Number(appliedDiscount) || 0));
  const grandTotalPKR = Math.max(0, subtotalPKR - discountAmountPKR + shippingFeePKR + giftWrapFeePKR);

  // Total items calculation with accurate pluralization
  const totalItemCount = safeCartItems.reduce((acc, i) => acc + Math.max(1, parseInt(i?.quantity, 10) || 1), 0);
  const itemCountLabel = `${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'}`;

  // Shipping progress ratio (0 to 100%)
  const shippingProgress = freeShippingThresholdPKR > 0
    ? Math.min(100, Math.max(0, (subtotalPKR / freeShippingThresholdPKR) * 100))
    : 100;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'YASRAF10') {
      setAppliedDiscount(0.10);
      setPromoMessage({ type: 'success', text: '10% Welcome Voucher applied' });
    } else if (cleanCode === 'EID26') {
      setAppliedDiscount(0.15);
      setPromoMessage({ type: 'success', text: '15% Festive Eid Voucher applied' });
    } else {
      setAppliedDiscount(0);
      setPromoMessage({ type: 'error', text: 'Invalid voucher code. Try "YASRAF10"' });
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(0);
    setPromoCode('');
    setPromoMessage(null);
  };

  const handleProceedToCheckout = () => {
    onClose();
    if (onOpenCheckout) {
      onOpenCheckout({
        cartItems: safeCartItems,
        subtotal: subtotalPKR,
        discount: discountAmountPKR,
        shipping: shippingFeePKR,
        giftWrap: giftWrapFeePKR,
        total: grandTotalPKR,
        currency
      });
    }
  };

  return (
    <div className="cart-drawer-overlay select-none" role="dialog" aria-modal="true" aria-label="Shopping Bag">
      
      {/* Click outside to close backdrop */}
      <div 
        className="flex-1 w-full h-full cursor-pointer" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Main Drawer Panel */}
      <aside className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        
        {/* 1. Compact Header */}
        <header className="cart-drawer-header">
          <div className="cart-header-title-group">
            <ShoppingBag size={17} className="cart-header-icon" aria-hidden="true" />
            <h2 className="cart-header-heading">Shopping Bag</h2>
            <span className="cart-header-count">({itemCountLabel})</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="cart-close-btn"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </header>

        {/* 2. Compact Free Shipping Meter */}
        {safeCartItems.length > 0 && (
          <div className={`cart-shipping-meter ${isFreeShipping ? 'unlocked' : ''}`}>
            <div className="cart-shipping-status">
              {isFreeShipping ? (
                <>
                  <Check size={14} className="text-[#1d4838] shrink-0" aria-hidden="true" />
                  <span>Complimentary nationwide shipping unlocked</span>
                </>
              ) : (
                <>
                  <Truck size={14} className="text-[#c5a880] shrink-0" aria-hidden="true" />
                  <span>
                    Add <strong>{currSymbol} {Math.round(amountNeededForFree * currRate).toLocaleString()}</strong> more for complimentary delivery
                  </span>
                </>
              )}
            </div>

            <div className="cart-shipping-track" role="progressbar" aria-valuenow={Math.round(shippingProgress)} aria-valuemin="0" aria-valuemax="100">
              <div 
                className={`cart-shipping-bar ${isFreeShipping ? 'unlocked' : ''}`}
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 3. Single Scrollable Content Area */}
        <div className="cart-scroll-area">
          {safeCartItems.length === 0 ? (
            /* Empty State */
            <div className="cart-empty-container">
              <div className="cart-empty-icon-wrap">
                <ShoppingBag size={28} strokeWidth={1.5} />
              </div>
              <h3 className="cart-empty-heading">Your Bag is Empty</h3>
              <p className="cart-empty-text">
                Explore our curated luxury prêt and ready-to-wear collections to add timeless pieces.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="cart-empty-shop-btn"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Product Rows */}
              <div className="cart-items-list">
                {safeCartItems.map((item, index) => {
                  const colorStr = getItemColor(item);
                  const sizeStr = getItemSize(item);
                  const titleStr = getItemTitle(item);
                  const imageStr = getItemImage(item);
                  const itemKey = `${item?.id || 'item'}-${sizeStr}-${colorStr}-${index}`;
                  const itemQty = Math.max(1, parseInt(item?.quantity, 10) || 1);
                  const itemPrice = Number(item?.price) || 0;
                  const itemTotalPrice = Math.round(itemPrice * itemQty * currRate);

                  return (
                    <div key={itemKey} className="cart-item-card">
                      {/* Product Thumbnail */}
                      <div className="cart-item-thumb">
                        <img
                          src={imageStr}
                          alt={titleStr}
                          loading="lazy"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="cart-item-info">
                        <div className="cart-item-top">
                          <h4 className="cart-item-title" title={titleStr}>
                            {titleStr}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item)}
                            aria-label={`Remove ${titleStr} from shopping bag`}
                            className="cart-item-remove-btn"
                            title="Remove item"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>

                        {/* Product SKU */}
                        {item?.sku && (
                          <div className="cart-item-sku">
                            SKU: {String(item.sku)}
                          </div>
                        )}

                        {/* Selected Variants */}
                        <div className="cart-item-meta">
                          <span>Size: <strong>{sizeStr}</strong></span>
                          <span style={{ margin: '0 0.35rem', color: '#d5cfc4' }}>•</span>
                          <span>Color: <strong>{colorStr}</strong></span>
                        </div>

                        {/* Bottom Row: Stepper + Price */}
                        <div className="cart-item-bottom">
                          {/* Stepper */}
                          <div className="cart-stepper">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item, itemQty - 1)}
                              aria-label="Decrease quantity"
                              className="cart-stepper-btn"
                            >
                              <Minus size={11} aria-hidden="true" />
                            </button>
                            <span className="cart-stepper-val" aria-label={`Quantity: ${itemQty}`}>
                              {itemQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item, itemQty + 1)}
                              aria-label="Increase quantity"
                              className="cart-stepper-btn"
                            >
                              <Plus size={11} aria-hidden="true" />
                            </button>
                          </div>

                          {/* Line Price */}
                          <span className="cart-item-price">
                            {currSymbol} {itemTotalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Options Section: Voucher & Gift Box */}
              <div className="cart-options-section">
                
                {/* Voucher Input */}
                <form onSubmit={handleApplyPromo} className="cart-voucher-form">
                  <input
                    type="text"
                    placeholder="VOUCHER CODE (TRY YASRAF10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="cart-voucher-input"
                    aria-label="Promotional voucher code"
                  />
                  <button
                    type="submit"
                    disabled={!promoCode.trim()}
                    className="cart-voucher-submit-btn"
                  >
                    Apply
                  </button>
                </form>

                {/* Voucher Feedback Message */}
                {promoMessage && (
                  <div className={`cart-voucher-feedback ${promoMessage.type}`} role="status">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Tag size={12} aria-hidden="true" />
                      {promoMessage.text}
                    </span>
                    {promoMessage.type === 'success' && (
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="cart-voucher-remove-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}

                {/* Gift Box Row */}
                <label className="cart-gift-row">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="cart-gift-checkbox"
                  />
                  <span className="cart-gift-label">
                    <Gift size={13} className="text-[#c5a880]" aria-hidden="true" />
                    <span>Luxury Gold Gift Packaging</span>
                    <span className="cart-gift-price">(+{currSymbol} {Math.round(350 * currRate)})</span>
                  </span>
                </label>
              </div>

              {/* Price Breakdown Summary */}
              <div className="cart-price-breakdown">
                <div className="cart-price-row">
                  <span>Subtotal</span>
                  <span className="cart-price-val">
                    {currSymbol} {Math.round(subtotalPKR * currRate).toLocaleString()}
                  </span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="cart-price-row savings">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Sparkles size={11} aria-hidden="true" /> Voucher Savings
                    </span>
                    <span className="cart-price-val">
                      -{currSymbol} {Math.round(discountAmountPKR * currRate).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="cart-price-row">
                  <span>Estimated Delivery</span>
                  <span className="cart-price-val">
                    {isFreeShipping ? (
                      <span style={{ color: '#1d4838', fontWeight: 600 }}>Complimentary</span>
                    ) : (
                      `${currSymbol} ${Math.round(shippingFeePKR * currRate)}`
                    )}
                  </span>
                </div>

                {giftWrap && (
                  <div className="cart-price-row">
                    <span>Gift Packaging</span>
                    <span className="cart-price-val">
                      +{currSymbol} {Math.round(giftWrapFeePKR * currRate)}
                    </span>
                  </div>
                )}

                <div className="cart-price-divider" />

                <div className="cart-price-row total">
                  <span>Estimated Total</span>
                  <span className="cart-price-val">
                    {currSymbol} {Math.round(grandTotalPKR * currRate).toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 4. Non-Overlapping Checkout Footer (Only rendered when items exist) */}
        {safeCartItems.length > 0 && (
          <footer className="cart-drawer-footer">
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="cart-checkout-btn"
            >
              <span>Proceed to Checkout</span>
              <span>•</span>
              <span>{currSymbol} {Math.round(grandTotalPKR * currRate).toLocaleString()}</span>
              <ArrowRight size={14} aria-hidden="true" style={{ marginLeft: '0.2rem' }} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="cart-continue-btn"
            >
              Continue Shopping
            </button>
          </footer>
        )}

      </aside>
    </div>
  );
}
