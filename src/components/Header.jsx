import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'THE EDIT', category: 'the-edit' },
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
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? '-translate-y-[38px]' : ''}`}>
      {/* Top Announcement Bar — Clickable VIP Channel Link */}
      <div 
        onClick={onOpenVIPChannel}
        className="bg-[#f6ece4] hover:bg-[#faede5] text-[#1a1814] text-[11px] font-medium h-[38px] flex items-center justify-center px-4 tracking-[0.16em] uppercase text-center transition-all duration-200 select-none cursor-pointer"
        style={{ fontFamily: 'var(--font-family-primary)' }}
        title="Click to claim 10% Off VIP WhatsApp Pass"
      >
        COMPLIMENTARY SHIPPING OVER RS. 4,990 &nbsp;|&nbsp; CLAIM 10% OFF ON WHATSAPP &rarr;
      </div>

      {/* Main Navigation Bar */}
      <div className={`transition-colors duration-300 relative ${
        isLight ? 'bg-white text-[#1a1814] shadow-[0_1px_0_rgba(0,0,0,0.06)]' : 'bg-transparent text-white'
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
                  href={`#${item.label.toLowerCase().replace(/ /g, '-')}`}
                  onClick={(e) => handleNavClick(e, item.category)}
                  className="text-[11px] font-medium tracking-[0.11em] uppercase hover:opacity-60 transition-opacity duration-200 whitespace-nowrap px-1 py-1 cursor-pointer"
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
              
              <button 
                onClick={() => {
                  if (onNavigatePage) onNavigatePage('about');
                }}
                className="hover:opacity-75 transition-opacity p-1 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer" 
                aria-label="About the Atelier"
                title="About the Atelier"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
              
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
              <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#8c867f] pb-2 border-b border-gray-100">
                Collections
              </div>
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={`#${item.label.toLowerCase().replace(/ /g, '-')}`}
                  className="block text-[13px] font-medium tracking-[0.1em] text-gray-900 uppercase transition-colors hover:text-gray-500 cursor-pointer"
                  onClick={(e) => handleNavClick(e, item.category)}
                >
                  {item.label}
                </a>
              ))}

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#8c867f]">
                  Atelier & Care
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onNavigatePage) onNavigatePage('about');
                  }}
                  className="block text-[13px] font-medium text-gray-700 hover:text-black text-left w-full cursor-pointer"
                >
                  The Atelier Story
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onNavigatePage) onNavigatePage('contact');
                  }}
                  className="block text-[13px] font-medium text-gray-700 hover:text-black text-left w-full cursor-pointer"
                >
                  Client Concierge & Contact
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onNavigatePage) onNavigatePage('shipping');
                  }}
                  className="block text-[13px] font-medium text-gray-700 hover:text-black text-left w-full cursor-pointer"
                >
                  Delivery & 7-Day Exchange
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onNavigatePage) onNavigatePage('contact');
                }}
                className="flex items-center justify-center space-x-3 text-sm font-medium text-gray-800 hover:text-black w-full min-h-[44px] cursor-pointer"
              >
                <User size={20} strokeWidth={1.5} />
                <span className="uppercase tracking-[0.1em] text-xs font-bold">Client Concierge</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}