import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ShoppingBag, Menu, X, ArrowRight, LogOut, Package, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ 
  cartCount = 0,
  onOpenCart,
  onOpenSearch,
  onOpenVIPChannel,
  currentPage = 'home',
  onNavigateHome,
  onNavigateCollections,
  onNavigatePage
}) {
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const clientName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Client';
  const firstName = clientName.split(' ')[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'SUMMER', category: 'summer' },
    { label: 'WINTER', category: 'winter-collection' },
    { label: 'FESTIVE', category: 'festive' },
    { label: 'BEST SELLERS', category: 'best-sellers' },
    { label: 'COLLECTIONS', category: 'all' },
    { label: 'READY TO WEAR', category: 'ready-to-wear' },
    { label: 'UNSTITCHED', category: 'unstitched' },
    { label: 'SALE', category: 'sale' }
  ];

  // Header should be light (solid white with dark text) when scrolled, when mobile menu is open, OR when viewing subpages
  const isLight = currentPage !== 'home' || isScrolled || isMobileMenuOpen;

  const handleNavClick = (e, category) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (onNavigateCollections) {
      onNavigateCollections(category);
    }
  };

  const handleBrandClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? '-translate-y-[36px] sm:-translate-y-[38px]' : ''}`}>
      {/* Top Announcement Bar — Clickable VIP Channel Link */}
      <div 
        onClick={onOpenVIPChannel}
        className="bg-[#f6ece4] hover:bg-[#faede5] text-[#1a1814] text-[10px] sm:text-[11px] font-medium h-[36px] sm:h-[38px] flex items-center justify-center px-3 sm:px-4 tracking-[0.12em] sm:tracking-[0.16em] uppercase text-center transition-all duration-200 select-none cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ fontFamily: 'var(--font-family-primary)' }}
        title="Click to claim 10% Off VIP WhatsApp Pass"
      >
        <span className="sm:hidden">
          FREE SHIPPING OVER RS. 4,990 &nbsp;|&nbsp; 10% OFF ON WHATSAPP &rarr;
        </span>
        <span className="hidden sm:inline">
          COMPLIMENTARY SHIPPING OVER RS. 4,990 &nbsp;|&nbsp; CLAIM 10% OFF ON WHATSAPP &rarr;
        </span>
      </div>

      {/* Main Navigation Bar */}
      <div className={`transition-colors duration-300 relative ${
        isLight ? 'bg-white text-[#1a1814] shadow-[0_1px_0_rgba(0,0,0,0.06)] header-light' : 'bg-transparent text-white'
      }`}>
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="flex lg:grid lg:grid-cols-[1fr_auto_1fr] items-center justify-between h-[68px] sm:h-[72px] py-2">
            
            {/* Mobile Left: Menu & Search */}
            <div className="flex lg:hidden items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="hover:opacity-70 transition-opacity p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
                aria-label="Open Navigation Menu"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>
              <button 
                onClick={onOpenSearch}
                className="hover:opacity-70 transition-opacity p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2" 
                aria-label="Search Catalog"
              >
                <Search size={19} strokeWidth={1.5} />
              </button>
            </div>

            {/* Desktop Left: Brand */}
            <div className="hidden lg:flex items-center justify-start">
              <a 
                href="/" 
                onClick={handleBrandClick}
                className={`text-2xl xl:text-3xl font-normal tracking-[0.22em] uppercase transition-colors duration-300 cursor-pointer ${isLight ? 'text-[#1a1814]' : 'text-white'}`}
                style={{ fontFamily: 'var(--font-family-editorial)' }}
              >
                YASRAF
              </a>
            </div>

            {/* Center: Desktop Navigation with Reduced, Balanced Spacing */}
            <nav 
              className="hidden lg:flex gap-3 xl:gap-4.5 justify-center items-center"
              style={{ fontFamily: 'var(--font-family-primary)' }}
            >
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.category === 'all' ? '/collections' : `/collections/${item.category}`}
                  onClick={(e) => handleNavClick(e, item.category)}
                  className="nav-link text-[11px] font-medium tracking-[0.11em] uppercase whitespace-nowrap px-1 py-1 cursor-pointer focus:outline-none"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Mobile Center Brand */}
            <div className="lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <a 
                href="/" 
                onClick={handleBrandClick}
                className={`text-2xl font-normal tracking-[0.22em] uppercase transition-colors duration-300 cursor-pointer ${isLight ? 'text-[#1a1814]' : 'text-white'}`}
                style={{ fontFamily: 'var(--font-family-editorial)' }}
              >
                YASRAF
              </a>
            </div>

            {/* Right: Icons (Desktop has Search, User, Bag / Mobile has User, Bag) */}
            <div className="flex items-center gap-2 sm:gap-4 justify-end">
              <button 
                onClick={onOpenSearch}
                className="hidden lg:flex hover:opacity-75 transition-opacity p-1 min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer" 
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              
              {/* Desktop Account Entry with Dropdown / Direct Link */}
              <div className="relative" ref={accountMenuRef}>
                <button 
                  id="header-account-button"
                  onClick={() => {
                    if (user) {
                      setIsAccountMenuOpen(!isAccountMenuOpen);
                    } else {
                      if (onNavigatePage) onNavigatePage('login');
                    }
                  }}
                  className={`hover:opacity-75 transition-all p-1 min-h-[44px] flex items-center gap-1.5 cursor-pointer relative ${
                    user ? 'rounded-full px-2.5 py-1 border border-current/25 hover:border-current/50' : 'min-w-[44px] justify-center'
                  }`}
                  aria-label={user ? `Client Account: ${clientName}` : 'Sign In or Register'}
                  title={user ? `Signed in as ${clientName} — Click to view menu` : 'Sign In / Register'}
                >
                  <div className="relative flex items-center justify-center">
                    <User size={19} strokeWidth={1.5} />
                    {user && (
                      <span 
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#c5a880] ring-2 ring-white" 
                        title="Authenticated Client" 
                      />
                    )}
                  </div>
                  {user && (
                    <span 
                      id="header-account-name"
                      className="hidden sm:inline-block text-[11px] font-medium tracking-[0.08em] uppercase max-w-[120px] truncate text-current select-none"
                    >
                      {firstName}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu for Authenticated Client */}
                {isAccountMenuOpen && user && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white text-[#1a1814] border border-[#e8e2d9] shadow-2xl py-2 z-50 text-left">
                    <div className="px-4 py-2.5 border-b border-[#f0eae2] bg-[#faf8f6]">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#c5a880] mb-0.5">
                        <Sparkles size={11} />
                        <span>Atelier Client</span>
                      </div>
                      <span className="text-xs font-semibold text-[#1a1814] truncate block" title={clientName}>
                        {clientName}
                      </span>
                      <span className="text-[11px] text-[#8c867f] truncate block" title={user.email}>
                        {user.email}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        if (onNavigatePage) onNavigatePage('account');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#1a1814] hover:bg-[#faf8f6] flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                    >
                      <User size={14} className="text-[#c5a880]" />
                      My Account Overview
                    </button>

                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        if (onNavigatePage) onNavigatePage('account', 'orders');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#1a1814] hover:bg-[#faf8f6] flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                    >
                      <Package size={14} className="text-[#c5a880]" />
                      My Orders
                    </button>

                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        if (onNavigatePage) onNavigatePage('account', 'addresses');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#1a1814] hover:bg-[#faf8f6] flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                    >
                      <MapPin size={14} className="text-[#c5a880]" />
                      Saved Addresses
                    </button>

                    <div className="border-t border-[#f0eae2] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-[#fff5f5] flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={onOpenCart}
                className="hover:opacity-75 transition-opacity relative p-1 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 lg:-mr-0 cursor-pointer" 
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center min-w-[16px] h-[16px] text-[9px] font-bold text-white bg-red-600 rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide Drawer */}
        <div 
          className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer Menu */}
          <div 
            className={`absolute top-0 left-0 w-[85%] sm:w-[320px] h-full bg-white text-black shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-[82px] px-6 border-b border-gray-100 shrink-0">
              <a 
                href="/" 
                onClick={handleBrandClick}
                className="font-cormorant text-2xl font-medium tracking-[0.15em] uppercase cursor-pointer"
              >
                YASRAF
              </a>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-black hover:opacity-70 transition-opacity p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-5">
              <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#6b655e] pb-2 border-b border-gray-100">
                Collections
              </div>
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.category === 'all' ? '/collections' : `/collections/${item.category}`}
                  className="block text-[13px] font-medium tracking-[0.1em] text-gray-900 uppercase transition-colors hover:text-gray-500 cursor-pointer"
                  onClick={(e) => handleNavClick(e, item.category)}
                >
                  {item.label}
                </a>
              ))}

              {/* Client Account Section in Mobile Menu */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#6b655e]">
                  Client Account
                </div>
                {user ? (
                  <div className="space-y-2">
                    <div className="text-xs text-[#1a1814] pb-1">
                      Signed in as <strong className="block text-sm font-semibold text-[#1a1814]">{clientName}</strong>
                      <span className="text-[11px] text-[#6b655e] block truncate">{user.email}</span>
                    </div>
                    <a
                      href="/account"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        if (onNavigatePage) onNavigatePage('account');
                      }}
                      className="block text-[13px] font-medium text-gray-700 hover:text-black text-left w-full cursor-pointer py-1"
                    >
                      My Account Overview
                    </a>
                    <a
                      href="/account?tab=orders"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        if (onNavigatePage) onNavigatePage('account', 'orders');
                      }}
                      className="block text-[13px] font-medium text-gray-700 hover:text-black text-left w-full cursor-pointer py-1"
                    >
                      My Orders & Tracking
                    </a>
                    <a
                      href="/account?tab=addresses"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        if (onNavigatePage) onNavigatePage('account', 'addresses');
                      }}
                      className="block text-[13px] font-medium text-gray-700 hover:text-black text-left w-full cursor-pointer py-1"
                    >
                      Saved Delivery Addresses
                    </a>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut();
                      }}
                      className="block text-[13px] font-medium text-red-600 hover:text-red-700 text-left w-full cursor-pointer pt-2"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <a
                      href="/login"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        if (onNavigatePage) onNavigatePage('login');
                      }}
                      className="w-full text-center py-2.5 px-3 bg-[#1a1814] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      Sign In to Account
                    </a>
                    <a
                      href="/register"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        if (onNavigatePage) onNavigatePage('register');
                      }}
                      className="w-full text-center py-2.5 px-3 border border-[#1a1814] text-[#1a1814] text-xs font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      Create Atelier Account
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#6b655e]">
                  Atelier & Care
                </div>
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    if (onNavigatePage) onNavigatePage('about');
                  }}
                  className="block text-[13px] font-medium text-gray-700 hover:text-black text-left w-full cursor-pointer"
                >
                  The Atelier Story
                </a>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    if (onNavigatePage) onNavigatePage('contact');
                  }}
                  className="block text-[13px] font-medium text-gray-700 hover:text-black text-left w-full cursor-pointer"
                >
                  Client Concierge & Contact
                </a>
                <a
                  href="/shipping"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    if (onNavigatePage) onNavigatePage('shipping');
                  }}
                  className="block text-[13px] font-medium text-gray-700 hover:text-black text-left w-full cursor-pointer"
                >
                  Delivery & 7-Day Exchange
                </a>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onNavigatePage) {
                    onNavigatePage(user ? 'account' : 'login');
                  }
                }}
                className="flex items-center justify-center space-x-3 text-sm font-medium text-gray-800 hover:text-black w-full min-h-[44px] cursor-pointer"
              >
                <User size={18} strokeWidth={1.5} />
                <span className="uppercase tracking-[0.1em] text-xs font-bold">
                  {user ? 'My Account' : 'Sign In / Register'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}