import React, { useState } from 'react';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { InstagramIcon, FacebookIcon, TikTokIcon, SnapchatIcon, WhatsAppIcon } from './SocialIcons';
import { BRAND_CONFIG } from '../data/brandConfig';

export default function Footer({ 
  onOpenTrackOrder, 
  onOpenSizeGuide, 
  onSelectCategory,
  onNavigatePage,
  onNavigateHome
}) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer style={{
      backgroundColor: '#121212',
      color: '#f5f0ea',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingTop: '5rem',
      paddingBottom: '2.5rem'
    }}>
      <div className="yasraf-container">
        {/* Top Newsletter Privilege Banner */}
        <div className="bg-[#1a1a1a] border border-[#c5a880]/30 p-5 sm:p-8 lg:p-10 mb-12 sm:mb-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c5a880', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              <Sparkles size={14} /> The Yasraf Circle Privileges
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', color: '#ffffff', marginBottom: '0.4rem' }}>
              Subscribe For 10% Off Your First Order
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#9c978f' }}>
              Receive exclusive early previews of seasonal drops, festive couture edits, and private showings.
            </p>
          </div>

          <div>
            {subscribed ? (
              <div style={{
                backgroundColor: '#1d4838',
                color: '#ffffff',
                padding: '0.9rem 1.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <Check size={18} /> Welcome to the Circle! Use voucher <strong>YASRAF10</strong> at checkout for 10% off.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.85rem 1.1rem',
                    backgroundColor: '#121212',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.85rem 1.6rem',
                    backgroundColor: '#c5a880',
                    color: '#121212',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c5a880'}
                >
                  Join <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4 Columns Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12 sm:mb-16">
          {/* Col 1: Brand Info */}
          <div>
            <button
              onClick={() => onNavigateHome && onNavigateHome()}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.9rem',
                letterSpacing: '0.22em',
                fontWeight: 600,
                color: '#ffffff',
                display: 'block',
                marginBottom: '0.3rem'
              }}>
                YASRAF
              </span>
            </button>
            <span style={{ fontSize: '0.62rem', color: '#c5a880', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '1.2rem' }}>
              {BRAND_CONFIG.subTagline}
            </span>
            <p style={{ fontSize: '0.84rem', color: '#9c978f', lineHeight: 1.65, marginBottom: '1.5rem' }}>
              Yasraf Clothing is Pakistan’s distinguished women’s fashion atelier, celebrating timeless Eastern silhouettes, refined craftsmanship, and contemporary ready-to-wear luxury.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <a 
                href={BRAND_CONFIG.socialLinks.instagram} 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Instagram"
                style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                className="hover:bg-white hover:text-black transition-colors"
              >
                <InstagramIcon size={16} />
              </a>
              <a 
                href={BRAND_CONFIG.socialLinks.facebook} 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Facebook"
                style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                className="hover:bg-white hover:text-black transition-colors"
              >
                <FacebookIcon size={16} />
              </a>
              <a 
                href={BRAND_CONFIG.socialLinks.tiktok} 
                target="_blank" 
                rel="noreferrer" 
                aria-label="TikTok"
                style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                className="hover:bg-white hover:text-black transition-colors"
              >
                <TikTokIcon size={15} />
              </a>
              <a 
                href={BRAND_CONFIG.socialLinks.snapchat} 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Snapchat"
                style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                className="hover:bg-white hover:text-black transition-colors"
              >
                <SnapchatIcon size={15} />
              </a>
              <a 
                href={BRAND_CONFIG.socialLinks.whatsapp} 
                target="_blank" 
                rel="noreferrer" 
                aria-label="WhatsApp"
                style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366' }}
                className="hover:bg-[#25D366] hover:text-white transition-colors"
              >
                <WhatsAppIcon size={16} />
              </a>
            </div>
          </div>

          {/* Col 2: Collections matching requested taxonomy */}
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '1.2rem' }}>
              Collections
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem', color: '#9c978f' }}>
              <li>
                <a 
                  href="/collections/new-in" 
                  onClick={(e) => { e.preventDefault(); onSelectCategory('new-in'); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  New In
                </a>
              </li>
              <li>
                <a 
                  href="/collections/ready-to-wear" 
                  onClick={(e) => { e.preventDefault(); onSelectCategory('ready-to-wear'); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  Ready to Wear
                </a>
              </li>
              <li>
                <a 
                  href="/collections/luxury-pret" 
                  onClick={(e) => { e.preventDefault(); onSelectCategory('luxury-pret'); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  Luxury Prêt
                </a>
              </li>
              <li>
                <a 
                  href="/collections/party-wear" 
                  onClick={(e) => { e.preventDefault(); onSelectCategory('party-wear'); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  Party Wear & Formals
                </a>
              </li>
              <li>
                <a 
                  href="/collections/winter-collection" 
                  onClick={(e) => { e.preventDefault(); onSelectCategory('winter-collection'); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  Winter Collection
                </a>
              </li>
              <li>
                <a 
                  href="/collections/best-sellers" 
                  onClick={(e) => { e.preventDefault(); onSelectCategory('best-sellers'); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  Best Sellers
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Concierge */}
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '1.2rem' }}>
              Client Care
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem', color: '#9c978f' }}>
              <li>
                <a 
                  href="/account" 
                  onClick={(e) => { e.preventDefault(); onNavigatePage && onNavigatePage('account'); }} 
                  style={{ color: '#c5a880', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:underline"
                >
                  My Account & Orders
                </a>
              </li>
              <li>
                <a 
                  href="#track-order" 
                  onClick={(e) => { e.preventDefault(); onOpenTrackOrder(); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  Track Your Order Online
                </a>
              </li>
              <li>
                <a 
                  href="#size-guide" 
                  onClick={(e) => { e.preventDefault(); onOpenSizeGuide(); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  Size Chart & Fitting Guide
                </a>
              </li>
              <li>
                <a 
                  href="/about" 
                  onClick={(e) => { e.preventDefault(); onNavigatePage && onNavigatePage('about'); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  The Atelier Story (About Us)
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  onClick={(e) => { e.preventDefault(); onNavigatePage && onNavigatePage('contact'); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  Client Concierge & Contact
                </a>
              </li>
              <li>
                <a 
                  href="/shipping" 
                  onClick={(e) => { e.preventDefault(); onNavigatePage && onNavigatePage('shipping'); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  Delivery & Shipping Rates
                </a>
              </li>
              <li>
                <a 
                  href="/shipping" 
                  onClick={(e) => { e.preventDefault(); onNavigatePage && onNavigatePage('shipping'); }} 
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                  className="hover:text-white transition-colors"
                >
                  7-Day Exchange Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Social Channels */}
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '1.2rem' }}>
              Connect & Follow
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem', color: '#9c978f' }}>
              <a 
                href={BRAND_CONFIG.socialLinks.whatsapp} 
                target="_blank" 
                rel="noreferrer" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'inherit', textDecoration: 'none' }}
                className="hover:text-white transition-colors"
              >
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366' }}>
                  <WhatsAppIcon size={15} />
                </span>
                <span><strong>WhatsApp:</strong> {BRAND_CONFIG.whatsappDisplay}</span>
              </a>

              <a 
                href={BRAND_CONFIG.socialLinks.instagram} 
                target="_blank" 
                rel="noreferrer" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'inherit', textDecoration: 'none' }}
                className="hover:text-white transition-colors"
              >
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <InstagramIcon size={14} />
                </span>
                <span><strong>Instagram:</strong> @yasrafclothing</span>
              </a>

              <a 
                href={BRAND_CONFIG.socialLinks.facebook} 
                target="_blank" 
                rel="noreferrer" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'inherit', textDecoration: 'none' }}
                className="hover:text-white transition-colors"
              >
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <FacebookIcon size={14} />
                </span>
                <span><strong>Facebook:</strong> Yasraf Clothing</span>
              </a>

              <a 
                href={BRAND_CONFIG.socialLinks.tiktok} 
                target="_blank" 
                rel="noreferrer" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'inherit', textDecoration: 'none' }}
                className="hover:text-white transition-colors"
              >
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <TikTokIcon size={14} />
                </span>
                <span><strong>TikTok:</strong> @yasrafclothing</span>
              </a>

              <a 
                href={BRAND_CONFIG.socialLinks.snapchat} 
                target="_blank" 
                rel="noreferrer" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'inherit', textDecoration: 'none' }}
                className="hover:text-white transition-colors"
              >
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <SnapchatIcon size={14} />
                </span>
                <span><strong>Snapchat:</strong> @yasrafclothing</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.2rem',
          fontSize: '0.78rem',
          color: '#9c978f'
        }}>
          <div>
            © {new Date().getFullYear()} <strong>{BRAND_CONFIG.name.toUpperCase()}</strong>. All Rights Reserved. Crafted with authentic Pakistani craftsmanship.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#9c978f' }}>Cash on Delivery Available Nationwide</span>
            <button
              onClick={() => onNavigatePage && onNavigatePage('admin')}
              style={{
                background: 'none',
                border: 'none',
                color: '#9c978f',
                fontSize: '0.72rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              title="Atelier Admin Portal"
            >
              Admin Atelier
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
