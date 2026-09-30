import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  Globe,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { CURRENCIES, NAV_CATEGORIES } from '../data/products';
import { BRAND_CONFIG } from '../data/brandConfig';

export default function Navbar({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenTrackOrder,
  onOpenImageManager,
  currency,
  setCurrency,
  activeCategory,
  onSelectCategory
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Standard requested navigation structure
  const navItems = [
    { id: 'home', label: 'Home', isHome: true },
    { id: 'new-in', label: 'New In', badge: 'NEW' },
    { id: 'ready-to-wear', label: 'Ready to Wear', badge: null },
    { id: 'luxury-pret', label: 'Luxury Prêt', badge: 'LUXE' },
    { id: 'party-wear', label: 'Party Wear', badge: null },
    { id: 'winter-collection', label: 'Winter Collection', badge: null },
    { id: 'best-sellers', label: 'Best Sellers', badge: 'HOT' },
    { id: 'all', label: 'All Products', badge: null },
  ];

  const handleNavClick = (item) => {
    if (item.isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onSelectCategory('all');
    } else {
      onSelectCategory(item.id);
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: '#ffffff',
      boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.08)' : '0 1px 0 rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.3s ease'
    }}>
      {/* Sleek Announcement Top Bar */}
      <div style={{
        backgroundColor: '#121212',
        color: '#f5f0ea',
        fontSize: '0.68rem',
        letterSpacing: '0.08em',
        padding: '0.35rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#c5a880', fontWeight: 600 }}>
          <Sparkles size={11} /> FREE NATIONWIDE SHIPPING ON ORDERS ABOVE RS. {BRAND_CONFIG.freeShippingThreshold.toLocaleString()}
        </span>
        <span style={{ opacity: 0.4 }} className="hide-mobile">•</span>
        <span style={{ opacity: 0.85 }} className="hide-mobile">
          CASH ON DELIVERY (COD) AVAILABLE ACROSS PAKISTAN
        </span>
      </div>

      {/* SINGLE-LINE MAIN HEADER (Logo, Links, Actions all in 1 line) */}
      <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px',
        position: 'relative',
        whiteSpace: 'nowrap'
      }}>
        {/* Left: Brand Logo & Wordmark */}
        <div
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onSelectCategory('all');
          }}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            justifyContent: 'flex-start'
          }}
        >
          {/* Mobile Hamburger Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(true);
            }}
            aria-label="Open Menu"
            className="show-mobile"
            style={{ padding: '0.4rem', color: '#141414' }}
          >
            <Menu size={22} />
          </button>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.85rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              lineHeight: 1,
              color: '#121212'
            }}>
              YASRAF
            </span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#c5a880',
              textTransform: 'uppercase'
            }} className="hide-mobile">
              CLOTHING
            </span>
          </div>
        </div>

        {/* Center: Clean Desktop Navigation Menu */}
        <nav className="nav-desktop" style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.2rem',
          justifyContent: 'center',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {navItems.map((item) => {
            const isActive = !item.isHome && activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isActive ? '#141414' : '#55524e',
                  padding: '0.4rem 0',
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#121212'}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#55524e';
                }}
              >
                <span style={{ position: 'relative' }}>
                  {item.label}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-6px',
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: '#121212'
                    }} />
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions (Currency, Search, Wishlist, Bag, My Photos) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.5rem'
        }}>
          {/* Custom Photo Manager Button */}
          {onOpenImageManager && (
            <button
              onClick={onOpenImageManager}
              title="Upload / Change Your Product Photos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.65rem',
                backgroundColor: '#faf7f2',
                border: '1px solid #dfc298',
                color: '#8e704b',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                borderRadius: '2px'
              }}
              className="hide-mobile"
            >
              <ImageIcon size={13} /> My Photos
            </button>
          )}

          {/* Currency Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            padding: '0.35rem 0.5rem',
            backgroundColor: '#f7f4ee',
            border: '1px solid rgba(0,0,0,0.06)'
          }} className="hide-mobile">
            <Globe size={13} style={{ color: '#c5a880' }} />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Currency"
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#141414',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {Object.keys(CURRENCIES).map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            aria-label="Search Collection"
            style={{
              padding: '0.5rem',
              color: '#141414',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f4ee'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Search size={19} />
          </button>

          {/* Wishlist Trigger */}
          <button
            onClick={onOpenWishlist}
            aria-label="Wishlist"
            style={{
              padding: '0.5rem',
              color: '#141414',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f4ee'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '3px',
                right: '3px',
                backgroundColor: '#942929',
                color: '#fff',
                fontSize: '0.6rem',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Bag Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping Bag"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.95rem',
              backgroundColor: '#121212',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c5a880'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#121212'}
          >
            <ShoppingBag size={17} />
            <span>BAG ({cartCount})</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex'
        }}>
          <div style={{
            width: '85%',
            maxWidth: '320px',
            backgroundColor: '#ffffff',
            height: '100%',
            overflowY: 'auto',
            padding: '1.8rem 1.4rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-drawer)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.15em' }}>
                  YASRAF
                </span>
                <button onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.3rem', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavClick(item);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem 0',
                      fontSize: '0.88rem',
                      fontWeight: (!item.isHome && activeCategory === item.id) ? 700 : 500,
                      color: (!item.isHome && activeCategory === item.id) ? '#c5a880' : '#141414',
                      borderBottom: '1px solid #f6f3ed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}

                {onOpenImageManager && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenImageManager();
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem 0',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#8e704b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    <ImageIcon size={15} /> Upload / Manage Product Photos
                  </button>
                )}
              </div>
            </div>

            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#666' }}>Currency:</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ padding: '0.3rem 0.5rem', border: '1px solid #ddd', fontWeight: 600 }}
                >
                  {Object.keys(CURRENCIES).map((cur) => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
