import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  CheckCircle, 
  ShieldCheck, 
  Truck, 
  Banknote, 
  MapPin, 
  AlertCircle, 
  MessageCircle, 
  Copy, 
  Check, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { CURRENCIES } from '../data/products';
import { BRAND_CONFIG } from '../data/brandConfig';
import { createOrder } from '../services/supabaseService';
import { inferProvince } from '../utils/location';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage({
  cartItems = [],
  buyNowItem = null,
  cartCheckoutMeta = null,
  currency = 'PKR',
  onBackToStore,
  onNavigateCollections,
  onNavigateAccount,
  onNavigateLogin,
  onOrderPlaced
}) {
  const { user, profile, addresses, defaultAddress } = useAuth();

  // Active items being checked out
  const isBuyNow = !!buyNowItem;
  const itemsToCheckout = isBuyNow 
    ? [buyNowItem] 
    : (Array.isArray(cartItems) ? cartItems.filter(Boolean) : []);

  // Form Fields: Full Name, Mobile / WhatsApp, Delivery Address, City, Delivery Notes (optional)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const idempotencyKeyRef = useRef(null);

  // Pre-fill from user profile and default saved address if authenticated
  useEffect(() => {
    idempotencyKeyRef.current = null;
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      setFormData((prev) => ({
        ...prev,
        fullName: defaultAddress.full_name || prev.fullName,
        phone: defaultAddress.phone || prev.phone,
        address: defaultAddress.address_line1 + (defaultAddress.address_line2 ? `, ${defaultAddress.address_line2}` : '') || prev.address,
        city: defaultAddress.city || prev.city
      }));
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile?.full_name || user?.user_metadata?.full_name || prev.fullName,
        phone: profile?.phone || user?.user_metadata?.phone || prev.phone
      }));
    }
  }, [defaultAddress, user, profile]);

  const curr = CURRENCIES[currency] || CURRENCIES.PKR || { symbol: 'Rs.', rate: 1 };
  const currRate = Number(curr?.rate) || 1;
  const currSymbol = curr?.symbol || 'Rs.';

  // Calculations
  const subtotalPKR = isBuyNow
    ? Math.round((Number(buyNowItem?.price) || 0) * Math.max(1, parseInt(buyNowItem?.quantity, 10) || 1))
    : (cartCheckoutMeta?.subtotal ?? itemsToCheckout.reduce((acc, item) => {
        const p = Number(item?.price) || 0;
        const q = Math.max(1, parseInt(item?.quantity, 10) || 1);
        return acc + (p * q);
      }, 0));

  const freeShippingThresholdPKR = BRAND_CONFIG.freeShippingThreshold || 4990;
  const isFreeShipping = subtotalPKR >= freeShippingThresholdPKR;
  const standardShippingFeePKR = BRAND_CONFIG.standardShippingFee || 250;
  const shippingFeePKR = isFreeShipping || itemsToCheckout.length === 0 ? 0 : standardShippingFeePKR;
  
  const discountAmountPKR = isBuyNow ? 0 : (Number(cartCheckoutMeta?.discount) || 0);
  const giftWrapFeePKR = isBuyNow ? 0 : (Number(cartCheckoutMeta?.giftWrap) || 0);
  const grandTotalPKR = Math.max(0, subtotalPKR - discountAmountPKR + shippingFeePKR + giftWrapFeePKR);

  const totalItemCount = itemsToCheckout.reduce((acc, i) => acc + Math.max(1, parseInt(i?.quantity, 10) || 1), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    idempotencyKeyRef.current = null;
    if (errorMessage) setErrorMessage(null);
  };

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    idempotencyKeyRef.current = null;
    setFormData((prev) => ({
      ...prev,
      fullName: addr.full_name || prev.fullName,
      phone: addr.phone || prev.phone,
      address: addr.address_line1 + (addr.address_line2 ? `, ${addr.address_line2}` : ''),
      city: addr.city || prev.city
    }));
    setFieldErrors({});
    if (errorMessage) setErrorMessage(null);
  };

  const handleCopyTrackingToken = () => {
    if (completedOrder?.trackingToken) {
      navigator.clipboard?.writeText(completedOrder.trackingToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Please enter your full name';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Please enter your mobile or WhatsApp number';
    } else if (formData.phone.trim().replace(/\D/g, '').length < 8) {
      errors.phone = 'Please enter a valid contact number';
    }
    if (!formData.address.trim()) {
      errors.address = 'Please enter your delivery street address';
    }
    if (!formData.city.trim()) {
      errors.city = 'Please enter your destination city';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (itemsToCheckout.length === 0) {
      setErrorMessage('Your bag is currently empty.');
      return;
    }

    if (!validateForm()) {
      setErrorMessage('Please complete all required delivery fields.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // High-entropy idempotency key (>= 32 chars)
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `ord_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    }
    const idempotencyKey = idempotencyKeyRef.current;

    try {
      const provinceInferred = inferProvince(formData.city);
      const customerPayload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        province: provinceInferred,
        notes: formData.notes?.trim() || null,
        email: user?.email || null
      };

      const result = await createOrder({
        customer: customerPayload,
        items: itemsToCheckout,
        paymentMethod: 'cod',
        idempotencyKey
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Unable to place order. Please review your details and try again.');
        setIsProcessing(false);
        return;
      }

      idempotencyKeyRef.current = null;

      const order = {
        orderId: result.order_id,
        trackingToken: result.tracking_token,
        date: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: itemsToCheckout,
        total: result.total || grandTotalPKR,
        customer: {
          ...customerPayload,
          province: provinceInferred
        },
        estDelivery: result.estimated_delivery || '2 - 3 Working Days (via TCS / Leopards Express)'
      };

      // Persist order details locally for immediate tracking on this device
      if (result.tracking_token) {
        try {
          localStorage.setItem('yasraf_last_order', JSON.stringify({
            orderId: result.order_id,
            trackingToken: result.tracking_token,
            phone: formData.phone.trim()
          }));
        } catch {}
      }

      setCompletedOrder(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (onOrderPlaced) {
        onOrderPlaced({ isBuyNow, order });
      }
    } catch (err) {
      console.error('Order submission error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-[#fdfbf9] min-h-screen pt-24 sm:pt-28 pb-24 text-[#1a1814]">
      {/* Spacious, Centered Container */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: '1500px',
          paddingLeft: 'clamp(18px, 5vw, 110px)',
          paddingRight: 'clamp(18px, 5vw, 110px)'
        }}
      >
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-[11.5px] uppercase tracking-[0.16em] text-[#8c867f] pb-4 mb-6 sm:mb-8 border-b border-[#ede7df]">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <button
              type="button"
              onClick={onBackToStore}
              className="group text-[#8c867f] hover:text-[#1a1814] transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft size={13} className="transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Return to Store</span>
            </button>
            <span>/</span>
            <span className="text-[#1a1814] font-medium">Checkout</span>
            {isBuyNow && (
              <span className="px-2 py-0.5 text-[9.5px] bg-[#1a1814] text-[#ffffff] font-medium tracking-wider">
                Instant Buy
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#2d6a4f] font-medium">
            <ShieldCheck size={14} />
            <span>Nationwide Cash on Delivery</span>
          </div>
        </div>

        {/* ORDER SUCCESS SCREEN */}
        {completedOrder ? (
          <div className="max-w-2xl mx-auto py-8 sm:py-14 text-center animate-fadeIn">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-[#eaf4ee] text-[#1d4838] flex items-center justify-center mx-auto mb-4 shadow-xs">
              <CheckCircle size={36} />
            </div>

            <span className="text-[11px] font-semibold text-[#c5a880] tracking-[0.25em] uppercase block mb-1">
              Order Received
            </span>
            <h1 
              className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1a1814] mb-3"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              Shukriya, {completedOrder.customer.fullName || 'Valued Patron'}!
            </h1>
            <p className="text-[#6e6b66] text-sm sm:text-base max-w-lg mx-auto mb-8 font-light leading-relaxed">
              Your order has been confirmed with <strong>Cash on Delivery (COD)</strong>. Our concierge will verify and dispatch your parcel via courier.
            </p>

            {/* Receipt Summary Card */}
            <div className="bg-[#ffffff] border border-[#ede7df] text-left p-6 sm:p-9 mb-8">
              
              {/* Order Reference & Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#ede7df] gap-1">
                <div>
                  <span className="text-[10.5px] text-[#8c867f] uppercase tracking-wider block">Order Reference</span>
                  <span className="text-base sm:text-lg font-bold text-[#1a1814] tracking-wide">{completedOrder.orderId}</span>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10.5px] text-[#8c867f] uppercase tracking-wider block">Date</span>
                  <span className="text-xs text-[#6e6b66] font-medium">{completedOrder.date}</span>
                </div>
              </div>

              {/* Private Tracking Token */}
              {completedOrder.trackingToken && (
                <div className="py-4 border-b border-[#ede7df]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10.5px] text-[#8c867f] uppercase tracking-wider block">Private Tracking Token</span>
                      <span className="font-mono text-sm sm:text-base font-semibold text-[#a4574b] tracking-wider">
                        {completedOrder.trackingToken}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyTrackingToken}
                      className="px-3.5 py-1.5 text-xs border border-[#e2ded7] bg-[#faf8f5] hover:bg-[#ede7df] text-[#1a1814] flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
                    >
                      {copiedToken ? (
                        <>
                          <Check size={13} className="text-[#2d6a4f]" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copy Token
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8c867f] mt-1.5 font-light">
                    Saved to this browser session. You can track this shipment anytime using this token.
                  </p>
                </div>
              )}

              {/* Delivery Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-[#ede7df] text-xs">
                <div>
                  <span className="text-[10.5px] text-[#8c867f] uppercase tracking-wider block mb-1">Recipient</span>
                  <p className="font-medium text-[#1a1814]">{completedOrder.customer.fullName}</p>
                  <p className="text-[#6e6b66]">{completedOrder.customer.phone}</p>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#8c867f] uppercase tracking-wider block mb-1">Destination</span>
                  <p className="text-[#1a1814] font-medium leading-relaxed">{completedOrder.customer.address}</p>
                  <p className="text-[#6e6b66]">{completedOrder.customer.city}</p>
                </div>
              </div>

              {/* Payment & Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-[#ede7df] text-xs">
                <div>
                  <span className="text-[10.5px] text-[#8c867f] uppercase tracking-wider block mb-1">Payment Method</span>
                  <div className="flex items-center gap-1.5 text-[#1d4838] font-semibold">
                    <Banknote size={14} /> Cash on Delivery (COD)
                  </div>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#8c867f] uppercase tracking-wider block mb-1">Estimated Delivery</span>
                  <div className="flex items-center gap-1.5 text-[#1a1814] font-medium">
                    <Truck size={14} className="text-[#c5a880]" /> {completedOrder.estDelivery}
                  </div>
                </div>
              </div>

              {/* Purchased Items List */}
              <div className="py-4 border-b border-[#ede7df]">
                <span className="text-[10.5px] text-[#8c867f] uppercase tracking-wider block mb-3 font-semibold">
                  Purchased Items ({completedOrder.items.length})
                </span>
                <div className="space-y-3">
                  {completedOrder.items.map((item, idx) => {
                    const itemQty = parseInt(item.quantity, 10) || 1;
                    const linePrice = Math.round((Number(item.price) || 0) * itemQty * currRate);
                    const colorDisplay = item.selectedColor?.name || (typeof item.selectedColor === 'string' ? item.selectedColor : (item.color || ''));
                    return (
                      <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1a1814] truncate">{item.title}</p>
                          {item.sku && (
                            <p className="text-[10px] text-[#8c867f] uppercase tracking-wider mt-0.5">
                              SKU: {item.sku}
                            </p>
                          )}
                          <p className="text-[#6e6b66] text-[11px] mt-0.5">
                            Size: {item.selectedSize || item.size || 'Standard'}
                            {colorDisplay ? ` • ${colorDisplay}` : ''} • Qty: {itemQty}
                          </p>
                        </div>
                        <span className="font-semibold text-[#1a1814] shrink-0">
                          {currSymbol} {linePrice.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Payable */}
              <div className="flex items-center justify-between pt-5 text-base sm:text-lg font-bold">
                <span className="text-[#1a1814]">Total Payable at Doorstep:</span>
                <span className="text-[#1a1814]">
                  {currSymbol} {Math.round(completedOrder.total * currRate).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Success Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onBackToStore}
                className="py-4 px-8 border border-[#1a1814] bg-white text-[#1a1814] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#1a1814] hover:text-white transition-all duration-250 ease-out cursor-pointer"
              >
                Continue Shopping
              </button>

              {user && onNavigateAccount && (
                <button
                  type="button"
                  onClick={() => onNavigateAccount('orders', completedOrder.orderId)}
                  className="group py-4 px-8 bg-[#1a1814] hover:bg-[#2c2824] text-white text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-250 ease-out cursor-pointer flex items-center gap-2"
                >
                  <span>View in My Account</span>
                  <ArrowRight size={14} className="transition-transform duration-250 group-hover:translate-x-1" />
                </button>
              )}

              <a
                href={BRAND_CONFIG.getWhatsAppSupportUrl(
                  `Assalam-o-Alaikum YASRAF Clothing! I just placed an order. Order Reference: ${completedOrder.orderId}. Customer: ${completedOrder.customer.fullName}. Total: Rs. ${completedOrder.total}.`
                )}
                target="_blank"
                rel="noreferrer"
                className="py-4 px-8 bg-[#1d4838] hover:bg-[#153e2f] text-white text-xs font-semibold uppercase tracking-[0.18em] flex items-center gap-2.5 transition-all duration-250 ease-out cursor-pointer shadow-xs"
              >
                <MessageCircle size={15} /> Confirm via WhatsApp
              </a>
            </div>
          </div>
        ) : itemsToCheckout.length === 0 ? (
          /* EMPTY CHECKOUT STATE */
          <div className="max-w-md mx-auto py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f4eee6] text-[#8c867f] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <h2 
              className="text-2xl font-normal text-[#1a1814] mb-2"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              Your Shopping Bag is Empty
            </h2>
            <p className="text-xs text-[#6e6b66] mb-8 leading-relaxed font-light">
              Explore our handcrafted luxury collections to select your timeless Pakistani ensemble.
            </p>
            <button
              type="button"
              onClick={onNavigateCollections}
              className="py-4 px-8 bg-[#1a1814] hover:bg-[#2c2824] text-white text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-250 ease-out cursor-pointer"
            >
              Explore Collections
            </button>
          </div>
        ) : (
          /* ACTIVE CHECKOUT FORM & SUMMARY */
          <div>
            {/* Page Header with Generous Breathing Room */}
            <div className="mt-4 mb-10 sm:mb-14">
              <span className="text-[10.5px] uppercase tracking-[0.28em] text-[#9c9589] font-semibold block mb-2">
                Express Atelier Checkout
              </span>
              <h1 
                className="text-3xl sm:text-4xl lg:text-[42px] text-[#1a1814] font-normal tracking-tight leading-[1.15]"
                style={{ fontFamily: 'var(--font-family-editorial)' }}
              >
                Shipping & Confirmation
              </h1>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-8 p-4 bg-[#fdf2f2] border border-[#f8b4b4] text-[#9b1c1c] text-xs flex items-center gap-2.5">
                <AlertCircle size={17} className="shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Main Checkout Grid: Form on Left, Order Summary on Right (Desktop); Form on Top, Order Summary Below (Mobile) */}
            <form onSubmit={handleSubmitOrder} noValidate>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 2xl:gap-24 items-start">
                
                {/* LEFT COLUMN: Shipping Form (Desktop: col-span-7, Mobile: Top) */}
                <div className="lg:col-span-7 space-y-8">
                  
                  {/* Section Title */}
                  <div className="border-b border-[#ede7df] pb-3.5">
                    <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#1a1814]">
                      1. Delivery Address
                    </h2>
                  </div>

                  {/* Guest Sign-In Notice */}
                  {!user && onNavigateLogin && (
                    <div className="p-4 bg-[#faf8f5] border border-[#e8e2d9] text-xs flex items-center justify-between text-[#666057]">
                      <span>Already have an atelier account?</span>
                      <button
                        type="button"
                        onClick={() => onNavigateLogin('checkout')}
                        className="text-[#1a1814] font-semibold underline underline-offset-4 hover:text-[#c5a880] transition-colors duration-200 cursor-pointer"
                      >
                        Sign in for saved details &rarr;
                      </button>
                    </div>
                  )}

                  {/* Authenticated Saved Address Quick-Chips */}
                  {user && addresses && addresses.length > 0 && (
                    <div className="p-4 sm:p-5 bg-[#faf8f5] border border-[#e8e2d9] space-y-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#1a1814]">
                        <MapPin size={13} className="text-[#c5a880]" /> Quick Select Saved Address:
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {addresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id || 
                            (formData.city.toLowerCase() === addr.city?.toLowerCase() && formData.address.includes(addr.address_line1));
                          return (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => handleSelectSavedAddress(addr)}
                              className={`px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider cursor-pointer border transition-all duration-200 ease-out ${
                                isSelected 
                                  ? 'bg-[#1a1814] text-white border-[#1a1814]' 
                                  : 'bg-white text-[#4a4642] border-[#e2ded7] hover:border-[#1a1814] hover:bg-white'
                              }`}
                            >
                              {addr.label} ({addr.city}) {addr.is_default ? '★' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Form Inputs: Clean Placeholders, No Visible Labels, 60–64px Height */}
                  <div className="space-y-4 sm:space-y-5">
                    
                    {/* Full Name */}
                    <div>
                      <input
                        type="text"
                        name="fullName"
                        aria-label="Full Name"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full h-[60px] sm:h-[62px] px-5 bg-[#faf8f5] text-[14.5px] text-[#1a1814] placeholder:text-[#9c9589] font-normal transition-all duration-200 ease-in-out border ${
                          fieldErrors.fullName ? 'border-[#b91c1c] bg-[#fffcfc]' : 'border-[#e5dfd7]'
                        } focus:bg-white focus:border-[#1a1814] focus:outline-none focus:ring-0`}
                      />
                      {fieldErrors.fullName && (
                        <span className="text-[12px] text-[#b91c1c] font-normal block mt-1.5 pl-0.5">
                          {fieldErrors.fullName}
                        </span>
                      )}
                    </div>

                    {/* Mobile / WhatsApp */}
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        aria-label="Mobile / WhatsApp"
                        placeholder="Mobile / WhatsApp"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full h-[60px] sm:h-[62px] px-5 bg-[#faf8f5] text-[14.5px] text-[#1a1814] placeholder:text-[#9c9589] font-normal transition-all duration-200 ease-in-out border ${
                          fieldErrors.phone ? 'border-[#b91c1c] bg-[#fffcfc]' : 'border-[#e5dfd7]'
                        } focus:bg-white focus:border-[#1a1814] focus:outline-none focus:ring-0`}
                      />
                      {fieldErrors.phone && (
                        <span className="text-[12px] text-[#b91c1c] font-normal block mt-1.5 pl-0.5">
                          {fieldErrors.phone}
                        </span>
                      )}
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <input
                        type="text"
                        name="address"
                        aria-label="Delivery Address"
                        placeholder="House / Apartment #, Street, Phase / Block, Area"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full h-[60px] sm:h-[62px] px-5 bg-[#faf8f5] text-[14.5px] text-[#1a1814] placeholder:text-[#9c9589] font-normal transition-all duration-200 ease-in-out border ${
                          fieldErrors.address ? 'border-[#b91c1c] bg-[#fffcfc]' : 'border-[#e5dfd7]'
                        } focus:bg-white focus:border-[#1a1814] focus:outline-none focus:ring-0`}
                      />
                      {fieldErrors.address && (
                        <span className="text-[12px] text-[#b91c1c] font-normal block mt-1.5 pl-0.5">
                          {fieldErrors.address}
                        </span>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <input
                        type="text"
                        name="city"
                        aria-label="City"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full h-[60px] sm:h-[62px] px-5 bg-[#faf8f5] text-[14.5px] text-[#1a1814] placeholder:text-[#9c9589] font-normal transition-all duration-200 ease-in-out border ${
                          fieldErrors.city ? 'border-[#b91c1c] bg-[#fffcfc]' : 'border-[#e5dfd7]'
                        } focus:bg-white focus:border-[#1a1814] focus:outline-none focus:ring-0`}
                      />
                      {fieldErrors.city && (
                        <span className="text-[12px] text-[#b91c1c] font-normal block mt-1.5 pl-0.5">
                          {fieldErrors.city}
                        </span>
                      )}
                    </div>

                    {/* Delivery Notes (Optional) */}
                    <div>
                      <textarea
                        rows={2}
                        name="notes"
                        aria-label="Delivery Notes (Optional)"
                        placeholder="Delivery Notes (Optional)"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="w-full min-h-[64px] py-4 px-5 bg-[#faf8f5] text-[14.5px] text-[#1a1814] placeholder:text-[#9c9589] font-normal transition-all duration-200 ease-in-out border border-[#e5dfd7] focus:bg-white focus:border-[#1a1814] focus:outline-none focus:ring-0 resize-none"
                      />
                    </div>

                  </div>

                  {/* Payment Method Section: Cash on Delivery Only */}
                  <div className="pt-6 border-t border-[#ede7df] space-y-4">
                    <div className="border-b border-[#ede7df] pb-3.5">
                      <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#1a1814]">
                        2. Payment Method
                      </h2>
                    </div>

                    <div className="p-5 sm:p-6 border border-[#1a1814] bg-[#faf8f5] flex items-center gap-4 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={true}
                        readOnly
                        className="accent-[#1a1814] w-4 h-4 cursor-pointer"
                      />
                      <Banknote size={24} className="text-[#1d4838] shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[13.5px] sm:text-sm font-semibold text-[#1a1814]">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#1d4838] text-white">
                            Active Nationwide
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#7a756f] mt-1 font-light leading-relaxed">
                          Pay in cash to the courier representative when the parcel arrives at your doorstep.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Order Summary (Desktop: col-span-5 & sticky, Mobile: Below Form) */}
                <div className="lg:col-span-5 lg:sticky lg:top-28">
                  <div className="bg-[#ffffff] border border-[#eae4dc] p-7 sm:p-9 xl:p-10">
                    
                    {/* Summary Header */}
                    <div className="flex items-baseline justify-between pb-5 border-b border-[#ede7df] mb-6">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1814]">
                        Order Summary
                      </h3>
                      <span className="text-[11.5px] text-[#9c9589] tracking-wider font-medium">
                        {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-[#f2ede4] max-h-[360px] overflow-y-auto pr-1 mb-6">
                      {itemsToCheckout.map((item, idx) => {
                        const itemQty = parseInt(item.quantity, 10) || 1;
                        const linePrice = Math.round((Number(item.price) || 0) * itemQty * currRate);
                        const colorDisplay = item.selectedColor?.name || (typeof item.selectedColor === 'string' ? item.selectedColor : (item.color || ''));
                        const itemImg = item.image || item.images?.[0] || '/products/yasraf-meerab-black-1.png';

                        return (
                          <div key={idx} className="py-4 flex items-start gap-3.5 text-xs">
                            {/* Product Thumbnail */}
                            <div className="w-16 h-22 sm:w-18 sm:h-24 bg-[#f8f6f2] shrink-0 overflow-hidden border border-[#ede7df] relative">
                              <img 
                                src={itemImg} 
                                alt={item.title} 
                                className="w-full h-full object-cover object-[center_20%]"
                              />
                              <span className="absolute bottom-1 right-1 bg-[#1a1814]/90 text-white text-[9.5px] px-1.5 py-0.5 font-medium tracking-wider">
                                x{itemQty}
                              </span>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <h4 className="font-medium text-[#1a1814] text-[13.5px] leading-snug line-clamp-2">
                                {item.title}
                              </h4>
                              {item.sku && (
                                <p className="text-[10px] text-[#9c9589] uppercase tracking-wider mt-1">
                                  SKU: {item.sku}
                                </p>
                              )}
                              <p className="text-[11.5px] text-[#8c867f] mt-1">
                                Size: {item.selectedSize || item.size || 'Standard'}
                                {colorDisplay ? ` • ${colorDisplay}` : ''}
                              </p>
                              <p className="font-semibold text-[#1a1814] text-[13px] mt-1.5">
                                {currSymbol} {linePrice.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3.5 pt-5 border-t border-[#ede7df] text-[13px]">
                      <div className="flex justify-between text-[#6e6b66]">
                        <span>Subtotal</span>
                        <span className="font-medium text-[#1a1814]">
                          {currSymbol} {Math.round(subtotalPKR * currRate).toLocaleString()}
                        </span>
                      </div>

                      {discountAmountPKR > 0 && (
                        <div className="flex justify-between text-[#1d4838]">
                          <span>Voucher Discount</span>
                          <span className="font-medium">
                            -{currSymbol} {Math.round(discountAmountPKR * currRate).toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-[#6e6b66]">
                        <span>Nationwide Shipping</span>
                        <span className="font-medium text-[#1a1814]">
                          {shippingFeePKR === 0 ? (
                            <span className="text-[#1d4838] font-semibold">FREE</span>
                          ) : (
                            `${currSymbol} ${Math.round(shippingFeePKR * currRate)}`
                          )}
                        </span>
                      </div>

                      {giftWrapFeePKR > 0 && (
                        <div className="flex justify-between text-[#6e6b66]">
                          <span>Luxury Gift Box</span>
                          <span className="font-medium text-[#1a1814]">
                            {currSymbol} {Math.round(giftWrapFeePKR * currRate)}
                          </span>
                        </div>
                      )}

                      {/* Grand Total */}
                      <div className="flex justify-between items-baseline pt-5 mt-3 border-t border-[#ede7df] text-[#1a1814]">
                        <span className="text-xs uppercase tracking-[0.16em] font-semibold">
                          Total Payable (COD)
                        </span>
                        <span className="text-xl sm:text-2xl font-normal tracking-tight" style={{ fontFamily: 'var(--font-family-editorial)' }}>
                          {currSymbol} {Math.round(grandTotalPKR * currRate).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Confirm Order Button with Polished Hover & Arrow Motion */}
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="group w-full mt-7 h-[60px] sm:h-[64px] px-8 bg-[#1a1814] hover:bg-[#2c2824] active:bg-black text-white text-[12px] font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-250 ease-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
                      style={{
                        transition: 'all 250ms ease'
                      }}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2.5">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Placing Order...</span>
                        </span>
                      ) : (
                        <>
                          <span>Confirm Order (COD)</span>
                          <ArrowRight 
                            size={16} 
                            className="shrink-0 transition-transform duration-250 ease-out group-hover:translate-x-1" 
                          />
                        </>
                      )}
                    </button>

                    {/* Trust Signals */}
                    <div className="mt-6 pt-5 border-t border-[#ede7df] space-y-2.5 text-[11px] text-[#7a756f]">
                      <div className="flex items-center gap-2.5">
                        <Truck size={14} className="text-[#c5a880] shrink-0" />
                        <span>Dispatch in 24–48 hours via TCS / Leopards</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck size={14} className="text-[#c5a880] shrink-0" />
                        <span>100% Authentic Pakistani Artisanal Craftsmanship</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
