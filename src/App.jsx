import React, { useState, useEffect } from 'react';
import './App.css';
import { PRODUCTS as DEFAULT_PRODUCTS } from './data/products';

import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import ShopByCollection from './components/ShopByCollection';
import NewArrivals from './components/NewArrivals';
import BrandStory from './components/BrandStory';
import CategoryLookbook from './components/CategoryLookbook';
import EditorialBanner from './components/EditorialBanner';
import EditorialStatement from './components/EditorialStatement';
import DualEditorialSplit from './components/DualEditorialSplit';
import NewInCollection from './components/NewInCollection';
import EditorialSplitPromo from './components/EditorialSplitPromo';
import BrandStatement from './components/BrandStatement';
import TrustBar from './components/TrustBar';
import InstagramFeed from './components/InstagramFeed';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import WhatsAppChannelModal from './components/WhatsAppChannelModal';

// Dedicated Storefront Pages
import ProductDetailPage from './pages/ProductDetailPage';
import CollectionsPage from './pages/CollectionsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';

import CartDrawer from './components/CartDrawer';
import QuickViewModal from './components/QuickViewModal';
import SizeGuideModal from './components/SizeGuideModal';
import SearchModal from './components/SearchModal';
import CheckoutModal from './components/CheckoutModal';
import TrackOrderModal from './components/TrackOrderModal';
import StoryModal from './components/StoryModal';
import WishlistModal from './components/WishlistModal';
import ImageManagerModal from './components/ImageManagerModal';

import { Check } from 'lucide-react';

export default function App() {
  // Support custom product images updated by user
  const [products, setProducts] = useState(() => {
    try {
      const savedCustomImages = localStorage.getItem('yasraf_custom_images');
      if (savedCustomImages) {
        const imageMap = JSON.parse(savedCustomImages);
        return DEFAULT_PRODUCTS.map((p) => {
          const custom = imageMap[p.id];
          return {
            ...p,
            image: (custom && custom.startsWith('data:image')) ? custom : p.image
          };
        });
      }
      return DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  // Persistence for Cart & Wishlist
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('yasraf_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('yasraf_wishlist');
      return saved ? JSON.parse(saved) : ['yas-001', 'yas-002'];
    } catch {
      return ['yas-001', 'yas-002'];
    }
  });

  const [currency, setCurrency] = useState('PKR');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Page Routing State ('home' | 'product' | 'collections' | 'about' | 'contact' | 'shipping')
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [storyIndex, setStoryIndex] = useState(null);
  const [isWhatsAppChannelOpen, setIsWhatsAppChannelOpen] = useState(false);

  // Navigation Controller with History API & Hash Synchronization
  const navigateTo = (page, param = null) => {
    setCurrentPage(page);
    if (page === 'product') {
      const prod = param || products[0];
      setSelectedProduct(prod);
      window.history.pushState({ page, id: prod.id }, '', `#product/${prod.id}`);
    } else if (page === 'collections') {
      const cat = param || 'all';
      setActiveCategory(cat);
      window.history.pushState({ page, category: cat }, '', `#collections/${cat}`);
    } else if (page === 'home') {
      window.history.pushState({ page: 'home' }, '', window.location.pathname);
    } else {
      window.history.pushState({ page }, '', `#${page}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize browser forward/back buttons & initial URL hash
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash.startsWith('product/')) {
        const prodId = hash.replace('product/', '');
        const found = products.find((p) => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          setCurrentPage('product');
          return;
        }
      } else if (hash.startsWith('collections/')) {
        const cat = hash.replace('collections/', '');
        setActiveCategory(cat || 'all');
        setCurrentPage('collections');
        return;
      } else if (hash === 'collections') {
        setCurrentPage('collections');
        return;
      } else if (hash === 'about') {
        setCurrentPage('about');
        return;
      } else if (hash === 'contact') {
        setCurrentPage('contact');
        return;
      } else if (hash === 'shipping') {
        setCurrentPage('shipping');
        return;
      }
      setCurrentPage('home');
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [products]);

  // Auto-trigger Outcome-Driven WhatsApp Channel Popup gracefully after 4 seconds
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('yasraf_wa_channel_popup');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsWhatsAppChannelOpen(true);
        }, 4000);
        return () => clearTimeout(timer);
      }
    } catch {
      // fallback
    }
  }, []);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    try {
      localStorage.setItem('yasraf_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('yasraf_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistIds]);

  // Handle custom image updates
  const handleUpdateProductImage = (productId, newImageDataUrl) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === productId ? { ...p, image: newImageDataUrl } : p));
      try {
        const imageMap = {};
        updated.forEach((p) => {
          imageMap[p.id] = p.image;
        });
        localStorage.setItem('yasraf_custom_images', JSON.stringify(imageMap));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
    showToast('Product photo updated successfully!');
  };

  // Cart operations
  const handleAddToCart = (productToAdd) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === productToAdd.id &&
          item.selectedSize === productToAdd.selectedSize &&
          item.selectedColor === productToAdd.selectedColor
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += productToAdd.quantity || 1;
        return copy;
      } else {
        return [...prev, { ...productToAdd, quantity: productToAdd.quantity || 1 }];
      }
    });

    showToast(`Added "${productToAdd.title}" to bag!`);
  };

  const handleUpdateQuantity = (itemToUpdate, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemToUpdate);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (
          item.id === itemToUpdate.id &&
          item.selectedSize === itemToUpdate.selectedSize &&
          item.selectedColor === itemToUpdate.selectedColor
        ) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (itemToRemove) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === itemToRemove.id &&
            item.selectedSize === itemToRemove.selectedSize &&
            item.selectedColor === itemToRemove.selectedColor
          )
      )
    );
  };

  // Wishlist operations
  const handleToggleWishlist = (product) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Removed from wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Saved to your wishlist!`);
        return [...prev, product.id];
      }
    });
  };

  const handleRemoveWishlistId = (id) => {
    setWishlistIds((prev) => prev.filter((item) => item !== id));
  };

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="yasraf-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-luxury">
          <Check size={16} style={{ color: '#c5a880' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Single-Line Header & Navbar with Adaptive Theme */}
      <Header 
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenVIPChannel={() => setIsWhatsAppChannelOpen(true)}
        currentPage={currentPage}
        onNavigateHome={() => navigateTo('home')}
        onNavigateCollections={(cat) => navigateTo('collections', cat)}
        onNavigatePage={(page) => navigateTo(page)}
      />

      {/* Main Page Rendering */}
      <main className="flex-1 w-full">
        {currentPage === 'home' && (
          <>
            {/* 1. Single Static 100vh Hero Banner Matching Jahaan */}
            <HeroSlider
              onSelectCategory={(cat) => navigateTo('collections', cat)}
            />

            {/* 2. Direct after Hero: Circular "Shop by Collection" Editorial Showcase */}
            <ShopByCollection 
              onSelectCollection={(cat) => navigateTo('collections', cat)}
            />

            {/* 3. New Arrivals: 4-Column Large Photo Product Grid Matching Jahaan */}
            <NewArrivals
              products={products}
              currency={currency}
              onQuickView={(prod) => navigateTo('product', prod)}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onSelectCategory={(cat) => navigateTo('collections', cat)}
            />

            {/* Editorial Brand Storytelling Section */}
            <BrandStory 
              onOpenStory={() => navigateTo('about')}
            />

            {/* 3-Column Category Lookbook Showcase */}
            <CategoryLookbook 
              onSelectCategory={(cat) => navigateTo('collections', cat)}
            />

            {/* Full-Width Cinematic Editorial Campaign Banner */}
            <EditorialBanner />

            {/* Minimal Luxury Editorial Text Section */}
            <EditorialStatement 
              onViewCollection={() => navigateTo('collections', 'all')}
            />

            {/* Dual Editorial Split Campaign Showcase */}
            <DualEditorialSplit />

            {/* New In: The Silk Edit Luxury Product Showcase */}
            <NewInCollection 
              onQuickView={(prod) => navigateTo('product', prod)}
            />

            {/* Editorial Dual Split Campaign & Styling Promo */}
            <EditorialSplitPromo 
              onShopFestive={() => navigateTo('collections', 'festive')}
            />

            {/* One Elegant Brand Statement Section */}
            <BrandStatement />

            {/* Customer Trust / Shipping / Returns (Compact) */}
            <TrustBar />

            {/* Instagram / Social Editorial Section */}
            <InstagramFeed />
          </>
        )}

        {/* Dedicated Jahaan-Style Product Detail Page */}
        {currentPage === 'product' && (
          <ProductDetailPage
            product={selectedProduct || products[0]}
            allProducts={products}
            currency={currency}
            onAddToCart={handleAddToCart}
            onBackToHome={() => navigateTo('home')}
            onSelectProduct={(prod) => navigateTo('product', prod)}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
            isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
            onToggleWishlist={handleToggleWishlist}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {/* Collections Catalog Page */}
        {currentPage === 'collections' && (
          <CollectionsPage
            products={products}
            currency={currency}
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              window.history.pushState({ page: 'collections', category: cat }, '', `#collections/${cat}`);
            }}
            onSelectProduct={(prod) => navigateTo('product', prod)}
            onBackToHome={() => navigateTo('home')}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* About The Atelier Page */}
        {currentPage === 'about' && (
          <AboutPage
            onBackToHome={() => navigateTo('home')}
            onExploreCollections={() => navigateTo('collections', 'all')}
          />
        )}

        {/* Client Concierge & Contact Page */}
        {currentPage === 'contact' && (
          <ContactPage
            onBackToHome={() => navigateTo('home')}
          />
        )}

        {/* Nationwide Shipping & Exchange Policy Page */}
        {currentPage === 'shipping' && (
          <ShippingPolicyPage
            onBackToHome={() => navigateTo('home')}
            onOpenConcierge={() => navigateTo('contact')}
          />
        )}
      </main>

      {/* Master Clean Luxury Footer with Official Social Links & No Location */}
      <Footer
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectCategory={(cat) => navigateTo('collections', cat)}
        onNavigatePage={(page) => navigateTo(page)}
        onNavigateHome={() => navigateTo('home')}
      />

      {/* Floating VIP WhatsApp Assistance */}
      <WhatsAppFloat 
        onOpenChannelModal={() => setIsWhatsAppChannelOpen(true)}
      />

      {/* Modals & Slide Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onOpenCheckout={(data) => setCheckoutData(data)}
        currency={currency}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        currency={currency}
        onAddToCart={handleAddToCart}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onDirectBuyNow={(prod) => {
          handleAddToCart(prod);
          setQuickViewProduct(null);
          setIsCartOpen(true);
        }}
        allProducts={products}
        onSelectProduct={(p) => {
          setQuickViewProduct(null);
          navigateTo('product', p);
        }}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        currency={currency}
        onSelectProduct={(prod) => {
          setIsSearchOpen(false);
          navigateTo('product', prod);
        }}
      />

      <CheckoutModal
        isOpen={!!checkoutData}
        onClose={() => setCheckoutData(null)}
        checkoutData={checkoutData}
        onOrderSuccess={() => {
          setCartItems([]);
        }}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      <StoryModal
        isOpen={storyIndex !== null}
        initialIndex={storyIndex || 0}
        onClose={() => setStoryIndex(null)}
        onSelectCategory={(cat) => {
          setStoryIndex(null);
          navigateTo('collections', cat);
        }}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistedProducts}
        onRemoveWishlist={handleRemoveWishlistId}
        onAddToCart={handleAddToCart}
        currency={currency}
      />

      {/* Custom Photos Manager Modal */}
      <ImageManagerModal
        isOpen={isImageManagerOpen}
        onClose={() => setIsImageManagerOpen(false)}
        products={products}
        onUpdateProductImage={handleUpdateProductImage}
      />

      {/* Outcome-Driven WhatsApp Channel VIP Popup Modal */}
      <WhatsAppChannelModal
        isOpen={isWhatsAppChannelOpen}
        onClose={() => {
          setIsWhatsAppChannelOpen(false);
          try {
            sessionStorage.setItem('yasraf_wa_channel_popup', 'dismissed');
          } catch {}
        }}
        onApplyVoucher={(code) => showToast(`Voucher "${code}" copied to clipboard!`)}
      />
    </div>
  );
}
