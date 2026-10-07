import React, { useState } from 'react';
import { 
  Package, ShoppingBag, Settings, LogOut, ExternalLink, Menu, X, 
  Layers, Shield, ChevronRight, Sparkles 
} from 'lucide-react';

export default function AdminLayout({ 
  currentTab = 'products', 
  onSelectTab, 
  user, 
  onLogout, 
  onViewStore, 
  children 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'products', label: 'Products & Catalog', icon: Package, count: null },
    { id: 'orders', label: 'Orders & Line Items', icon: ShoppingBag, count: null },
    { id: 'collections', label: 'Collections', icon: Layers, count: null },
    { id: 'settings', label: 'Store Settings', icon: Settings, count: null }
  ];

  return (
    <div className="h-screen w-full bg-[#faf8f6] text-[#1a1814] flex flex-col md:flex-row antialiased overflow-hidden">
      
      {/* 1. Mobile Top Navigation Bar */}
      <div className="md:hidden bg-[#141311] text-white px-4 py-3.5 flex items-center justify-between border-b border-black/20 shrink-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 hover:bg-white/10 rounded-sm transition-colors text-[#e5dfd7] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span 
            className="text-xl tracking-wider font-normal text-[#f7f4ee]"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            YASRAF
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] bg-[#c5a880]/20 text-[#c5a880] px-1.5 py-0.5 rounded-xs font-semibold">
            Atelier
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[#faf8f6] hover:text-[#c5a880] px-2.5 py-1 bg-white/10 rounded-sm transition-colors cursor-pointer"
            title="Open live storefront in new tab"
          >
            <span>Store</span>
            <ExternalLink size={12} />
          </a>
          <button
            onClick={onLogout}
            className="p-1.5 text-[#f5c6cb] bg-[#721c24]/30 hover:bg-[#721c24] hover:text-white rounded-sm transition-colors cursor-pointer"
            title="Sign out of admin session"
            aria-label="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* 2. Desktop & Mobile Slide-Out Charcoal Sidebar (Fixed left navigation) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 h-full bg-[#141311] text-[#e5dfd7] flex flex-col justify-between border-r border-[#262320] transition-transform duration-300 ease-in-out md:static md:w-64 md:h-screen md:shrink-0 md:translate-x-0 overflow-y-auto
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand & Logo Area */}
        <div>
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 
                className="text-2xl text-[#f7f4ee] font-normal tracking-wider"
                style={{ fontFamily: 'var(--font-family-editorial)' }}
              >
                YASRAF
              </h2>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#c5a880] font-medium mt-0.5">
                Atelier Dashboard
              </p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-[#8c867f] hover:text-white p-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#c5a880]"
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#8c867f] font-semibold">
              Store Management
            </div>

            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-none text-[12.5px] tracking-wide transition-all duration-150 cursor-pointer text-left group focus:outline-none focus:ring-1 focus:ring-[#c5a880]
                    ${isActive 
                      ? 'bg-[#24211e] text-[#faf8f6] font-semibold border-l-[3px] border-[#c5a880] shadow-sm' 
                      : 'text-[#a8a29e] hover:bg-[#1c1a17] hover:text-[#faf8f6] border-l-[3px] border-transparent font-medium'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-[#c5a880]' : 'text-[#8c867f] group-hover:text-[#c5a880] transition-colors'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-[#c5a880]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Mobile Footer Area */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#11100e]">
          <div className="px-2 py-1 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#c5a880]/20 border border-[#c5a880]/40 flex items-center justify-center text-[#dfc7a7] font-semibold text-xs shrink-0">
              {(user?.email?.[0] || 'A').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p 
                className="text-[12px] font-medium text-[#faf8f6] truncate"
                title={user?.email || 'Administrator'}
              >
                {user?.email || 'Administrator'}
              </p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#c5a880] flex items-center gap-1 mt-0.5">
                <Shield size={10} className="shrink-0 text-[#c5a880]" /> Verified Admin
              </p>
            </div>
          </div>

          {/* Mobile-only secondary action links (redundant desktop copies removed) */}
          <div className="pt-2 border-t border-white/5 flex gap-2 md:hidden">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] uppercase tracking-[0.12em] bg-white/5 hover:bg-white/10 text-[#e5dfd7] rounded-none transition-colors cursor-pointer text-center font-medium"
              title="Open public storefront in new tab"
            >
              <ExternalLink size={12} />
              <span>View Store</span>
            </a>
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] uppercase tracking-[0.12em] bg-[#721c24]/20 hover:bg-[#721c24] text-[#f5c6cb] hover:text-white rounded-none transition-colors cursor-pointer font-medium"
              title="Sign out of admin session"
              aria-label="Logout"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* 3. Main Workspace Canvas (Independent Vertical Scroll) */}
      <div className="flex-1 flex flex-col min-w-0 h-full md:h-screen overflow-hidden">
        
        {/* Desktop Sticky Header Bar */}
        <header className="hidden md:flex h-16 shrink-0 bg-white border-b border-[#ebe6e0] px-8 items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <span 
              className="text-lg text-[#1a1814] font-normal tracking-wide"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              YASRAF Atelier
            </span>
            <span className="text-[#8c867f]">/</span>
            <span className="text-[12px] uppercase tracking-[0.14em] font-semibold text-[#1a1814]">
              {navigationItems.find(i => i.id === currentTab)?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-secondary h-9 px-3.5 text-[11px]"
              title="Open public storefront in new tab"
            >
              <ExternalLink size={13} />
              <span>Live Storefront</span>
            </a>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[11px] uppercase tracking-[0.14em] font-medium text-[#721c24] bg-[#fdf2f2] border border-[#f5c6cb] hover:bg-[#721c24] hover:text-white transition-all duration-150 cursor-pointer rounded-none focus:outline-none focus:ring-2 focus:ring-[#721c24]"
              title="Sign out of admin session"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content (Independent Scroll Container) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
