import React, { useState, useEffect } from 'react';
import { 
  Heart, ShoppingBag, Ruler, Check, ChevronDown, 
  Truck, ShieldCheck, RefreshCw, ArrowLeft, Share2, Sparkles,
  Zap, AlertCircle
} from 'lucide-react';
import { CURRENCIES } from '../data/products';
import { BRAND_CONFIG } from '../data/brandConfig';
import ProductCard from '../components/ProductCard';
import { WhatsAppIcon } from '../components/SocialIcons';

export default function ProductDetailPage({
  product,
  allProducts = [],
  currency = 'PKR',
  onAddToCart,
  onBuyNow,
  onBackToHome,
  onSelectProduct,
  onOpenSizeGuide,
  isWishlisted = false,
  onToggleWishlist,
  onOpenCart
}) {
  const curr = CURRENCIES[currency] || CURRENCIES.PKR;
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('details');
  const [copiedLink, setCopiedLink] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product) {
      setSelectedImage(0);
      setSelectedSize(product.sizes?.[0] || 'M');
      setSelectedColor(product.colors?.[0] || { name: 'Original', hex: '#d4c5b9' });
      setQuantity(1);
      setValidationError(null);
    }
  }, [product]);

  if (!product) return null;

  const images = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image, product.secondaryImage].filter(Boolean);

  const convertedPrice = Math.round(product.price * curr.rate).toLocaleString();
  const convertedOriginal = product.originalPrice 
    ? Math.round(product.originalPrice * curr.rate).toLocaleString()
    : null;

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 10;

  // Resolve existing product or variant SKU strictly without generating new ones
  const matchedVariant = (product.variants || product.product_variants || [])?.find((v) => {
    const matchSize = String(v.size || '').trim().toLowerCase() === String(selectedSize).trim().toLowerCase();
    const colorName = selectedColor?.name || selectedColor;
    if (colorName && v.color) {
      return matchSize && String(v.color).trim().toLowerCase() === String(colorName).trim().toLowerCase();
    }
    return matchSize;
  });
  const productSku = (matchedVariant?.sku || product.sku)?.trim() || null;

  const validateSelection = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setValidationError('Please select a size to continue.');
      return false;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setValidationError('Please select a color to continue.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleAdd = () => {
    if (!validateSelection()) return;
    if (onAddToCart) {
      onAddToCart({
        ...product,
        variantId: matchedVariant?.id || product.variantId || null,
        sku: productSku || undefined,
        selectedSize: selectedSize || 'Standard',
        selectedColor: selectedColor?.name || 'Standard',
        quantity
      });
    }
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    if (onBuyNow) {
      onBuyNow({
        ...product,
        productId: product.id,
        variantId: matchedVariant?.id || product.variantId || null,
        sku: productSku || undefined,
        selectedSize: selectedSize || 'Standard',
        selectedColor: selectedColor?.name || (typeof selectedColor === 'string' ? selectedColor : 'Standard'),
        color: selectedColor?.name || (typeof selectedColor === 'string' ? selectedColor : 'Standard'),
        quantity: quantity || 1,
        price: Number(product.price) || 0
      });
    }
  };

  const handleDirectWhatsAppOrder = () => {
    const url = BRAND_CONFIG.getWhatsAppOrderUrl(product, selectedSize, selectedColor?.name || 'Original');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Look at this luxury piece from Yasraf Clothing: ${product.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="w-full bg-[#ffffff] min-h-screen text-[#1a1814] pt-24 sm:pt-28 pb-20">
      
      {/* 1. Breadcrumbs & Back Navigation Bar */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-3 border-b border-neutral-200/50 mb-6 sm:mb-10">
        <div className="flex items-center justify-between text-[11.5px] uppercase tracking-[0.14em] text-[#8c867f]">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <a 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (onBackToHome) onBackToHome();
              }}
              className="hover:text-[#1a1814] transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft size={13} /> Back to Store
            </a>
            <span>/</span>
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                if (onBackToHome) onBackToHome();
              }}
              className="hover:text-[#1a1814] transition-colors cursor-pointer"
            >
              Home
            </a>
            <span>/</span>
            <a
              href={`/collections/${product.category || 'all'}`}
              className="text-[#67615c] hover:text-[#1a1814] transition-colors"
            >
              {product.categoryLabel || 'Collections'}
            </a>
            <span>/</span>
            <span className="text-[#1a1814] font-medium truncate max-w-[180px] sm:max-w-none">
              {product.title}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="hidden sm:flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase hover:text-[#1a1814] transition-colors cursor-pointer"
          >
            <Share2 size={13} />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Jahaan-Inspired PDP Stage */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-16 items-start">
          
          {/* Left Column: Edge-to-Edge Tall 2/3 Ratio Product Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 items-start">
            
            {/* Thumbnail Strip (Left on Desktop, Bottom on Mobile) */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 w-full md:w-20 shrink-0 overflow-x-auto md:overflow-y-auto scrollbar-none pb-2 md:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 md:w-20 aspect-[2/3] shrink-0 overflow-hidden bg-[#ebe6e0] transition-all cursor-pointer border ${
                      selectedImage === idx 
                        ? 'border-[#1a1814] ring-1 ring-[#1a1814]' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.title} — Detail View ${idx + 1}`}
                      className="w-full h-full object-cover object-[center_18%]"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Large Image */}
            <div className="flex-1 w-full relative overflow-hidden bg-[#ebe6e0] group select-none">
              <div className="w-full aspect-[2/3] relative overflow-hidden">
                <img 
                  src={images[selectedImage] || product.image} 
                  alt={`${product.title} — Luxury Women's Clothing Pakistan | YASRAF Textiles`}
                  className="w-full h-full object-cover object-[center_18%] transition-transform duration-700 ease-out group-hover:scale-105"
                  fetchPriority="high"
                />

                {/* Subtle Discount Pill */}
                {discountPercent > 0 && (
                  <span 
                    className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-[#faf8f6]/95 text-[#1a1814] text-[10px] tracking-[0.16em] uppercase font-semibold border border-black/5"
                    style={{ fontFamily: 'var(--font-family-primary)' }}
                  >
                    {discountPercent}% OFF
                  </span>
                )}

                {/* Wishlist Button floating over image */}
                <button
                  onClick={() => onToggleWishlist && onToggleWishlist(product)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#1a1814] hover:bg-white shadow-sm transition-all cursor-pointer"
                  aria-label="Save to Wishlist"
                >
                  <Heart 
                    size={17} 
                    fill={isWishlisted ? '#a4574b' : 'none'} 
                    stroke={isWishlisted ? '#a4574b' : '#1a1814'} 
                  />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Haute Couture Purchasing Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 text-left">
            
            {/* Header / Category & Title */}
            <div>
              <span className="text-[10.5px] uppercase tracking-[0.24em] font-medium text-[#8c867f] block mb-2">
                {product.tag || product.categoryLabel || 'HAUTE COUTURE'}
              </span>
              <h1 
                className="text-3xl sm:text-4xl text-[#1a1814] font-normal leading-[1.15] tracking-tight mb-3"
                style={{ fontFamily: 'var(--font-family-editorial)' }}
              >
                {product.title}
              </h1>

              {/* Price Line matching Jahaan */}
              <div className="flex items-baseline gap-3 my-2" style={{ fontFamily: 'var(--font-family-primary)' }}>
                <span className="text-xl sm:text-2xl font-normal text-[#1a1814]">
                  {curr.symbol === 'Rs.' ? 'Rs. ' : curr.symbol}{convertedPrice}
                </span>
                {convertedOriginal && (
                  <span className="text-sm sm:text-base text-[#8c867f] line-through font-light">
                    {curr.symbol === 'Rs.' ? 'Rs. ' : curr.symbol}{convertedOriginal}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-[11px] font-medium text-[#a4574b] tracking-[0.1em] uppercase">
                    ({discountPercent}% OFF)
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#8c867f] tracking-wide">
                Taxes included. Complimentary shipping on orders over Rs. 4,990.
              </p>
            </div>

            {/* Cash on Delivery / Express Dispatch Trust Banner */}
            <div className="flex items-center gap-2.5 p-3 bg-[#faf8f6] border border-[#ebe6e0] text-[11.5px] text-[#67615c]">
              <Truck size={16} className="text-[#c5a880] shrink-0" />
              <span>
                <strong>Express Delivery:</strong> Dispatched in 24–48 hours. Cash on delivery available.
              </span>
            </div>

            {/* Color Option Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex justify-between items-center text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#67615c] mb-2">
                  <span>Color: <strong className="text-[#1a1814]">{selectedColor?.name || product.colors[0].name}</strong></span>
                </div>
                <div className="flex gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedColor(c);
                        setValidationError(null);
                      }}
                      className={`w-7 h-7 rounded-full border transition-all cursor-pointer relative ${
                        selectedColor?.name === c.name 
                          ? 'ring-2 ring-offset-2 ring-[#1a1814] border-transparent' 
                          : 'border-neutral-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div>
              <div className="flex justify-between items-center text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#67615c] mb-2">
                <span>Select Size: <strong className="text-[#1a1814]">{selectedSize}</strong></span>
                {onOpenSizeGuide && (
                  <button 
                    onClick={onOpenSizeGuide}
                    className="flex items-center gap-1 text-[11px] underline underline-offset-2 hover:text-[#1a1814] transition-colors cursor-pointer"
                  >
                    <Ruler size={13} /> Size Guide
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'Unstitched']).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      setSelectedSize(sz);
                      setValidationError(null);
                    }}
                    className={`min-w-[46px] h-10 px-3.5 flex items-center justify-center text-[12px] uppercase tracking-[0.08em] border cursor-pointer select-none transition-all ${
                      selectedSize === sz
                        ? 'bg-black text-white font-medium shadow-sm ring-1 ring-black border-black'
                        : 'border-neutral-200 bg-[#faf8f6] text-[#67615c] hover:border-black hover:text-black hover:bg-white transition-all'
                    }`}
                    style={{ fontFamily: 'var(--font-family-primary)' }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-stretch gap-3">
                {/* Quantity Counter */}
                <div className="flex items-center border border-neutral-200 bg-white px-1 shadow-2xs h-12">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-full flex items-center justify-center text-base text-[#67615c] hover:text-black hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer rounded-none select-none"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="text-[13px] font-medium w-8 text-center select-none text-black">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-full flex items-center justify-center text-base text-[#67615c] hover:text-black hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer rounded-none select-none"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Cart Button */}
                <button
                  type="button"
                  onClick={() => {
                    handleAdd();
                    if (onOpenCart) onOpenCart();
                  }}
                  className="flex-1 h-12 px-4 sm:px-6 border border-black bg-white text-black font-medium tracking-[0.16em] text-xs uppercase flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-xs"
                  style={{ fontFamily: 'var(--font-family-primary)' }}
                >
                  <ShoppingBag size={15} strokeWidth={2} className="shrink-0 transition-colors duration-200" />
                  <span>ADD TO CART</span>
                </button>
              </div>

              {/* Buy Now Button (Direct checkout for this product only) */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full h-12 px-6 bg-[#1a1814] text-white border border-[#1a1814] font-medium tracking-[0.18em] text-xs uppercase flex items-center justify-center gap-2 hover:bg-black hover:border-black active:scale-[0.99] transition-all duration-200 cursor-pointer shadow-sm"
                style={{ fontFamily: 'var(--font-family-primary)' }}
              >
                <Zap size={15} className="text-[#c5a880] fill-[#c5a880]" />
                <span>BUY NOW</span>
              </button>

              {/* Validation Error Banner */}
              {validationError && (
                <div className="p-3 bg-[#fdf2f2] border border-[#f8b4b4] text-[#9b1c1c] text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Direct WhatsApp Ordering Button */}
              <button
                type="button"
                onClick={handleDirectWhatsAppOrder}
                className="w-full h-12 px-6 bg-[#25D366] text-white border-0 shadow-md font-medium tracking-[0.15em] text-xs uppercase flex items-center justify-center gap-2 hover:bg-[#20ba5a] active:scale-[0.99] transition-all duration-200 hover:shadow-lg cursor-pointer"
                style={{ fontFamily: 'var(--font-family-primary)' }}
              >
                <WhatsAppIcon size={18} color="white" className="shrink-0" />
                <span>ORDER VIA WHATSAPP · QUICK CHECKOUT</span>
              </button>
            </div>

            {/* Collapsible Accordions matching Jahaan "Product Details" */}
            <div className="pt-4 border-t border-neutral-200/60 divide-y divide-neutral-200/50">
              
              {/* 1. Product Details */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'details' ? '' : 'details')}
                  className="w-full py-3.5 flex items-center justify-between text-left text-[12px] uppercase tracking-[0.16em] font-medium text-[#1a1814] hover:text-[#67615c] transition-colors cursor-pointer"
                >
                  <span>Product Details</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-300 ${openAccordion === 'details' ? 'rotate-180' : ''}`}
                  />
                </button>
                {openAccordion === 'details' && (
                  <div className="pb-4 text-[12.5px] text-[#67615c] font-light leading-relaxed space-y-2">
                    <p>{product.description}</p>
                    {productSku && (
                      <p className="text-[12px] text-[#8c867f]">
                        <strong className="text-[#1a1814] font-medium">Product Code:</strong> {productSku}
                      </p>
                    )}
                    <p><strong>Fabric:</strong> {product.fabric || 'Luxury Egyptian Lawn & Pure Silk'}</p>
                    {product.type && <p><strong>Ensemble Type:</strong> {product.type}</p>}
                    <p><strong>Workmanship:</strong> Artisanal ton-sur-ton embroidery, Schiffli cutwork border, delicate neckline lace embellishment.</p>
                  </div>
                )}
              </div>

              {/* 2. Inclusions */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'inclusions' ? '' : 'inclusions')}
                  className="w-full py-3.5 flex items-center justify-between text-left text-[12px] uppercase tracking-[0.16em] font-medium text-[#1a1814] hover:text-[#67615c] transition-colors cursor-pointer"
                >
                  <span>Package Inclusions</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-300 ${openAccordion === 'inclusions' ? 'rotate-180' : ''}`}
                  />
                </button>
                {openAccordion === 'inclusions' && (
                  <div className="pb-4 text-[12.5px] text-[#67615c] font-light leading-relaxed">
                    <p>{product.includes || 'Embroidered Shirt (3.1m), Pure Silk Dupatta (2.5m), Dyed Trouser (2.5m), Handcrafted Neckline Lace Insets.'}</p>
                  </div>
                )}
              </div>

              {/* 3. Shipping & Delivery */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                  className="w-full py-3.5 flex items-center justify-between text-left text-[12px] uppercase tracking-[0.16em] font-medium text-[#1a1814] hover:text-[#67615c] transition-colors cursor-pointer"
                >
                  <span>Shipping & Returns</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-300 ${openAccordion === 'shipping' ? 'rotate-180' : ''}`}
                  />
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-4 text-[12.5px] text-[#67615c] font-light leading-relaxed space-y-1.5">
                    <p>• <strong>Complimentary Shipping:</strong> Free nationwide on orders over Rs. 4,990.</p>
                    <p>• <strong>Delivery Time:</strong> 2 to 4 business days across major cities of Pakistan (Karachi, Lahore, Islamabad, etc.).</p>
                    <p>• <strong>Cash on Delivery (COD):</strong> Available throughout Pakistan.</p>
                    <p>• <strong>7-Day Exchange Window:</strong> Hassle-free exchanges via our WhatsApp concierge.</p>
                  </div>
                )}
              </div>

              {/* 4. Fabric Care */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'care' ? '' : 'care')}
                  className="w-full py-3.5 flex items-center justify-between text-left text-[12px] uppercase tracking-[0.16em] font-medium text-[#1a1814] hover:text-[#67615c] transition-colors cursor-pointer"
                >
                  <span>Care Instructions</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-300 ${openAccordion === 'care' ? 'rotate-180' : ''}`}
                  />
                </button>
                {openAccordion === 'care' && (
                  <div className="pb-4 text-[12.5px] text-[#67615c] font-light leading-relaxed">
                    <p>{product.careInstructions || 'Dry clean recommended to preserve hand-embellished threadwork. Gentle cold wash separately. Do not tumble dry or expose to harsh direct sunlight.'}</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* 3. "Complete The Look" / "You May Also Like" 4-Column Grid matching Jahaan */}
      {relatedProducts.length > 0 && (
        <section className="w-full max-w-[2000px] mx-auto px-2 sm:px-4 lg:px-8 mt-20 sm:mt-28 pt-12 border-t border-neutral-200/50">
          <div className="text-center mb-8 sm:mb-12">
            <h2 
              className="text-[28px] sm:text-[34px] lg:text-[38px] text-[#67615c] font-light tracking-tight mb-2"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              Pairs Well With
            </h2>
            <span 
              className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#8c867f]"
              style={{ fontFamily: 'var(--font-family-primary)' }}
            >
              CURATED ENSEMBLES & ACCESSORIES
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-3.5">
            {relatedProducts.map((relProd) => (
              <ProductCard
                key={relProd.id}
                product={relProd}
                currency={currency}
                onQuickView={() => onSelectProduct && onSelectProduct(relProd)}
                isWishlisted={false}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
