import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { PRODUCTS as DEFAULT_PRODUCTS } from './data/products';
import { getProducts } from './services/supabaseService';
import AdminPage from './admin/AdminPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  fetchCustomerCart, 
  syncCustomerCart, 
  mergeGuestCart, 
  clearCustomerCart, 
  revalidateCartItems 
} from './services/customerCartService';

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

// Customer Auth & Account Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import AccountPage from './pages/account/AccountPage';

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

function AppContent() {
  const { user, profile, lastMergedUserIdRef } = useAuth();

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

  // Page Routing State ('home' | 'product' | 'collections' | 'about' | 'contact' | 'shipping' | 'login' | 'register' | 'forgot-password' | 'reset-password' | 'auth-callback' | 'account' | 'admin')
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [accountParams, setAccountParams] = useState({ tab: 'overview', orderId: null });
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);

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

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Live catalog synchronization with Supabase
  const refreshCatalog = useCallback(async () => {
    try {
      const res = await getProducts();
      if (res && res.data && res.data.length > 0) {
        setProducts(res.data);
      }
    } catch (err) {
      console.warn('Failed to load live catalog from Supabase:', err);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  // Handle Cart Merging & Account Cart Restoration on Authentication State Change
  const prevUserRef = useRef(null);
  const cartSyncSeqRef = useRef(0);
  const isCheckoutActiveRef = useRef(false);

  useEffect(() => {
    const handleAuthCartSync = async () => {
      // 1. User Just Logged In (or session restored)
      if (user && user.id) {
        // Only merge guest cart once per distinct user login
        if (lastMergedUserIdRef.current !== user.id) {
          lastMergedUserIdRef.current = user.id;

          let guestItems = [];
          try {
            const raw = localStorage.getItem('yasraf_cart');
            guestItems = raw ? JSON.parse(raw) : [];
          } catch {
            guestItems = [];
          }

          if (guestItems.length > 0) {
            try {
              const mergeResult = await mergeGuestCart(user.id, guestItems, products);
              if (mergeResult.success && Array.isArray(mergeResult.mergedItems)) {
                setCartItems(mergeResult.mergedItems);
                if (mergeResult.notices?.length > 0) {
                  showToast(mergeResult.notices[0]);
                }
              }
            } catch (mergeErr) {
              console.warn('[App] Guest cart merge warning:', mergeErr);
            }
          } else {
            // Restore customer cart from Supabase with strict error verification
            try {
              const fetchResult = await fetchCustomerCart(user.id, products);
              // A failed fetch must NOT be treated as an empty cart that gets saved!
              if (fetchResult.success && Array.isArray(fetchResult.items)) {
                setCartItems(fetchResult.items);
                if (fetchResult.notices?.length > 0) {
                  showToast(fetchResult.notices[0]);
                }
              }
            } catch (fetchErr) {
              console.warn('[App] Customer cart fetch warning:', fetchErr);
            }
          }
        }
      } 
      // 2. User Just Logged Out
      else if (prevUserRef.current && !user) {
        // Clear private account cart state to ensure no data bleed
        setCartItems([]);
        try {
          localStorage.removeItem('yasraf_cart');
          localStorage.removeItem('yasraf_last_order');
        } catch {}
        showToast('You have been signed out.');
        if (currentPage === 'account') {
          setCurrentPage('home');
          window.history.pushState({ page: 'home' }, '', '/');
        }
      }

      prevUserRef.current = user;
    };

    handleAuthCartSync();
  }, [user, products, showToast, lastMergedUserIdRef, currentPage]);

  // Persist cart changes safely without race conditions or overwriting post-checkout
  const persistCart = useCallback((nextCart) => {
    if (isCheckoutActiveRef.current) return;

    if (user) {
      const seq = ++cartSyncSeqRef.current;
      syncCustomerCart(user.id, nextCart, products).then(res => {
        if (seq !== cartSyncSeqRef.current || isCheckoutActiveRef.current) return;
        if (res?.reconciledItems) {
          setCartItems(res.reconciledItems);
        }
      }).catch(err => {
        console.warn('[App] Cart sync error:', err);
      });
    } else {
      try {
        localStorage.setItem('yasraf_cart', JSON.stringify(nextCart));
      } catch {}
    }
  }, [user, products]);

  // Cart operations
  const handleAddToCart = (productToAdd) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === productToAdd.id &&
          (item.variantId || '') === (productToAdd.variantId || '') &&
          item.selectedSize === productToAdd.selectedSize &&
          (item.selectedColor?.name || item.color) === (productToAdd.selectedColor?.name || productToAdd.color)
      );

      let nextCart;
      if (existingIndex > -1) {
        nextCart = [...prev];
        nextCart[existingIndex].quantity += productToAdd.quantity || 1;
      } else {
        nextCart = [...prev, { ...productToAdd, quantity: productToAdd.quantity || 1 }];
      }

      persistCart(nextCart);
      return nextCart;
    });

    showToast(`Added "${productToAdd.title}" to bag!`);
  };

  const handleUpdateQuantity = (itemToUpdate, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemToUpdate);
      return;
    }

    setCartItems((prev) => {
      const nextCart = prev.map((item) => {
        if (
          item.id === itemToUpdate.id &&
          (item.variantId || '') === (itemToUpdate.variantId || '') &&
          item.selectedSize === itemToUpdate.selectedSize &&
          (item.selectedColor?.name || item.color) === (itemToUpdate.selectedColor?.name || itemToUpdate.color)
        ) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      persistCart(nextCart);
      return nextCart;
    });
  };

  const handleRemoveFromCart = (itemToRemove) => {
    setCartItems((prev) => {
      const nextCart = prev.filter(
        (item) =>
          !(
            item.id === itemToRemove.id &&
            (item.variantId || '') === (itemToRemove.variantId || '') &&
            item.selectedSize === itemToRemove.selectedSize &&
            (item.selectedColor?.name || item.color) === (itemToRemove.selectedColor?.name || itemToRemove.color)
          )
      );

      persistCart(nextCart);
      return nextCart;
    });
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

  // Revalidate cart items when catalog products update
  useEffect(() => {
    if (products.length > 0 && cartItems.length > 0) {
      const { validatedItems, notices } = revalidateCartItems(cartItems, products);
      if (notices.length > 0) {
        setCartItems(validatedItems);
      }
    }
  }, [products]);

  // Save wishlist locally
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

  // Navigation Controller with History API & Hash Synchronization
  const navigateTo = (page, param = null) => {
    // Protected Account Route: Prompt Login if Unauthenticated
    if (page === 'account' && !user) {
      setRedirectAfterLogin('account');
      setCurrentPage('login');
      window.history.pushState({ page: 'login' }, '', '/#login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage(page);

    if (page === 'admin') {
      window.history.pushState({ page: 'admin' }, '', '/admin');
    } else if (page === 'product') {
      const prod = param || products[0];
      setSelectedProduct(prod);
      window.history.pushState({ page, id: prod.id }, '', `/#product/${prod.id}`);
    } else if (page === 'collections') {
      const cat = param || 'all';
      setActiveCategory(cat);
      window.history.pushState({ page, category: cat }, '', `/#collections/${cat}`);
    } else if (page === 'account') {
      const tab = typeof param === 'string' ? param : (param?.tab || 'overview');
      const orderId = param?.orderId || null;
      setAccountParams({ tab, orderId });
      const query = orderId ? `&order=${orderId}` : '';
      window.history.pushState({ page: 'account', tab, orderId }, '', `/#account?tab=${tab}${query}`);
    } else if (page === 'home') {
      window.history.pushState({ page: 'home' }, '', '/');
    } else {
      window.history.pushState({ page }, '', `/#${page}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle URL Hash Synchronization
  useEffect(() => {
    const handleUrlChange = () => {
      const pathname = window.location.pathname.toLowerCase();
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      const hash = rawHash.toLowerCase();

      if (pathname === '/admin' || pathname.startsWith('/admin') || hash === 'admin' || hash.startsWith('admin')) {
        setCurrentPage('admin');
        return;
      }

      if (hash === 'login') {
        setCurrentPage('login');
        return;
      }
      if (hash === 'register') {
        setCurrentPage('register');
        return;
      }
      if (hash === 'forgot-password') {
        setCurrentPage('forgot-password');
        return;
      }
      if (hash.startsWith('reset-password') || hash.includes('type=recovery')) {
        setCurrentPage('reset-password');
        return;
      }
      if (hash.startsWith('auth-callback') || hash.includes('access_token=') || hash.includes('error=')) {
        setCurrentPage('auth-callback');
        return;
      }
      if (hash.startsWith('account')) {
        const queryIdx = rawHash.indexOf('?');
        let tab = 'overview';
        let orderId = null;
        if (queryIdx !== -1) {
          const searchParams = new URLSearchParams(rawHash.slice(queryIdx));
          tab = searchParams.get('tab') || 'overview';
          orderId = searchParams.get('order') || null;
        }
        setAccountParams({ tab, orderId });
        setCurrentPage('account');
        return;
      }

      if (hash.startsWith('product/')) {
        const prodId = rawHash.replace(/^product\//i, '');
        const found = products.find((p) => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          setCurrentPage('product');
          return;
        }
      } else if (hash.startsWith('collections/')) {
        const cat = rawHash.replace(/^collections\//i, '');
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
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [products]);

  // Login Success Callback preserving destination
  const handleLoginSuccess = (targetOverride = null, authUser = null) => {
    const destination = targetOverride || redirectAfterLogin;
    setRedirectAfterLogin(null);

    const activeUser = authUser || user;
    const clientName = profile?.full_name 
      || activeUser?.user_metadata?.full_name 
      || activeUser?.email?.split('@')[0] 
      || 'Client';

    showToast(`Welcome back, ${clientName}!`);

    if (destination === 'checkout') {
      const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (parseInt(item.quantity, 10) || 1)), 0);
      const shipping = subtotal >= 4990 ? 0 : 250;
      setCheckoutData({
        cartItems,
        subtotal,
        discount: 0,
        shipping,
        giftWrap: 0,
        total: subtotal + shipping,
        currency
      });
      navigateTo('home');
    } else {
      // Automatically open the storefront homepage using the existing navigation system
      navigateTo('home');
    }
  };

  // Outcome-Driven WhatsApp Channel Popup
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('yasraf_wa_channel_popup');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsWhatsAppChannelOpen(true);
        }, 4000);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));
  const totalCartCount = cartItems.reduce((acc, item) => acc + (parseInt(item.quantity, 10) || 1), 0);

  // If viewing Admin Atelier Dashboard
  if (currentPage === 'admin') {
    return (
      <AdminPage 
        onBackToStore={() => {
          refreshCatalog();
          navigateTo('home');
        }} 
      />
    );
  }

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
        onNavigatePage={(page, param) => navigateTo(page, param)}
      />

      {/* Main Page Rendering */}
      <main className="flex-1 w-full">
        {currentPage === 'home' && (
          <>
            <HeroSlider onSelectCategory={(cat) => navigateTo('collections', cat)} />
            <ShopByCollection onSelectCollection={(cat) => navigateTo('collections', cat)} />
            <NewArrivals
              products={products}
              currency={currency}
              onQuickView={(prod) => navigateTo('product', prod)}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onSelectCategory={(cat) => navigateTo('collections', cat)}
            />
            <BrandStory onOpenStory={() => navigateTo('about')} />
            <CategoryLookbook onSelectCategory={(cat) => navigateTo('collections', cat)} />
            <EditorialBanner />
            <EditorialStatement onViewCollection={() => navigateTo('collections', 'all')} />
            <DualEditorialSplit />
            <NewInCollection onQuickView={(prod) => navigateTo('product', prod)} />
            <EditorialSplitPromo onShopFestive={() => navigateTo('collections', 'festive')} />
            <BrandStatement />
            <TrustBar />
            <InstagramFeed />
          </>
        )}

        {/* Dedicated Product Detail Page */}
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

        {/* Customer Auth Pages */}
        {currentPage === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => navigateTo('register')}
            onNavigateForgotPassword={() => navigateTo('forgot-password')}
            onBackToStore={() => navigateTo('home')}
            redirectTarget={redirectAfterLogin}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleLoginSuccess}
            onNavigateLogin={() => navigateTo('login')}
            onBackToStore={() => navigateTo('home')}
            redirectTarget={redirectAfterLogin}
          />
        )}

        {currentPage === 'forgot-password' && (
          <ForgotPasswordPage
            onNavigateLogin={() => navigateTo('login')}
            onBackToStore={() => navigateTo('home')}
          />
        )}

        {currentPage === 'reset-password' && (
          <ResetPasswordPage
            onResetSuccess={() => navigateTo('account')}
            onBackToStore={() => navigateTo('home')}
          />
        )}

        {currentPage === 'auth-callback' && (
          <AuthCallbackPage
            onNavigateLogin={() => navigateTo('login')}
            onNavigateResetPassword={() => navigateTo('reset-password')}
            onNavigateAccount={() => navigateTo('account')}
            onBackToStore={() => navigateTo('home')}
          />
        )}

        {/* Customer Account Area */}
        {currentPage === 'account' && (
          user ? (
            <AccountPage
              onNavigateHome={() => navigateTo('home')}
              onNavigateCollections={() => navigateTo('collections', 'all')}
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
              catalogProducts={products}
              initialTab={accountParams.tab || 'overview'}
              initialOrderId={accountParams.orderId}
              showToast={showToast}
            />
          ) : (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigateRegister={() => navigateTo('register')}
              onNavigateForgotPassword={() => navigateTo('forgot-password')}
              onBackToStore={() => navigateTo('home')}
              redirectTarget={null}
            />
          )
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

      {/* Luxury Footer with Customer Account Integration */}
      <Footer
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectCategory={(cat) => navigateTo('collections', cat)}
        onNavigatePage={(page, param) => navigateTo(page, param)}
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
        onOrderSuccess={async () => {
          // Prevent pending cart writes from restoring purchased items after checkout
          cartSyncSeqRef.current++;
          isCheckoutActiveRef.current = true;

          setCartItems([]);
          try {
            localStorage.removeItem('yasraf_cart');
          } catch {}

          if (user) {
            try {
              await clearCustomerCart(user.id);
              // Reload server cart after successful checkout to verify empty state
              const { items: reloadedItems } = await fetchCustomerCart(user.id, products);
              setCartItems(reloadedItems || []);
            } catch (reloadErr) {
              console.warn('[App] Post-checkout cart reload warning:', reloadErr);
            }
          }

          setTimeout(() => {
            isCheckoutActiveRef.current = false;
          }, 1500);
        }}
        onNavigateLogin={(target) => {
          setRedirectAfterLogin(target || 'checkout');
          navigateTo('login');
        }}
        onNavigateAccount={(tab, orderId) => navigateTo('account', { tab, orderId })}
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
