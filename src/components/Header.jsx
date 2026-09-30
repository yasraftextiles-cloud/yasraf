import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';

export default function Header({ 
  cartCount = 0,
  onOpenCart,
  onOpenSearch
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

  const navLinks = [
    'TIME OUT', 'SUMMER', 'WINTER', 'FESTIVE', 
    'BEST SELLERS', 'COLLECTIONS', 'SHOP BY', 
    'UNSTITCHED', 'SALE'
  ];

  const isLight = isScrolled || isMobileMenuOpen;

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? '-translate-y-[38px]' : ''}`}>
      {/* Top Announcement Bar */}
      <div className="bg-[#f8ede8] text-[#afa49c] text-[11px] font-medium h-[38px] flex items-center justify-center px-4 tracking-widest uppercase text-center transition-opacity duration-300">
        YOUR ORDER WILL ARRIVE WITHIN 3-8 WORKING DAYS.
      </div>

      {/* Main Navigation Bar */}
      <div className={`transition-colors duration-300 relative ${
        isLight ? 'bg-white text-black shadow-sm' : 'bg-transparent text-white'
      }`}>
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="flex lg:grid lg:grid-cols-[1fr_auto_1fr] items-center justify-between h-[82px] py-[18px]">
            
            {/* Mobile Left: Menu & Search */}
            <div className="flex lg:hidden items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="hover:opacity-75 transition-opacity p-1 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
                aria-label="Menu"
              >
                <Menu size={24} strokeWidth={1.5} />
              </button>
              <button 
                onClick={onOpenSearch}
                className="hover:opacity-75 transition-opacity p-1 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2" 
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Desktop Left: Brand */}
            <div className="hidden lg:flex items-center justify-start">
              <a href="/" className={`font-cormorant text-3xl font-medium tracking-[0.15em] uppercase transition-colors duration-300 ${isLight ? 'text-black' : 'text-white'}`}>
                YASRAF
              </a>
            </div>

            {/* Center: Desktop Navigation / Mobile Brand */}
            <nav 
              className="hidden lg:flex gap-4 xl:gap-6 justify-center items-center"
              style={{ fontFamily: 'Jost, Futura, "Helvetica Neue", sans-serif' }}
            >
              {navLinks.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-[11px] font-bold tracking-[0.1em] hover:opacity-75 transition-opacity duration-200 whitespace-nowrap"
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <a href="/" className={`font-cormorant text-2xl sm:text-3xl font-medium tracking-[0.15em] uppercase transition-colors duration-300 ${isLight ? 'text-black' : 'text-white'}`}>
                YASRAF
              </a>
            </div>

            {/* Right: Icons (Desktop has Search, User, Bag / Mobile has User, Bag) */}
            <div className="flex items-center gap-2 sm:gap-4 justify-end">
              <button 
                onClick={onOpenSearch}
                className="hidden lg:flex hover:opacity-75 transition-opacity p-1 min-h-[44px] min-w-[44px] items-center justify-center" 
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              
              <button 
                className="hover:opacity-75 transition-opacity p-1 min-h-[44px] min-w-[44px] flex items-center justify-center" 
                aria-label="User Profile"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
              
              <button 
                onClick={onOpenCart}
                className="hover:opacity-75 transition-opacity relative p-1 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 lg:-mr-0" 
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
              <a href="/" className="font-cormorant text-2xl font-medium tracking-[0.15em] uppercase">
                YASRAF
              </a>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-black hover:opacity-70 transition-opacity p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
              {navLinks.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="block text-[13px] font-bold tracking-[0.1em] text-gray-900 uppercase transition-colors hover:text-gray-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              <button className="flex items-center justify-center space-x-3 text-sm font-medium text-gray-800 hover:text-black w-full min-h-[44px]">
                <User size={20} strokeWidth={1.5} />
                <span className="uppercase tracking-[0.1em] text-xs font-bold">My Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}