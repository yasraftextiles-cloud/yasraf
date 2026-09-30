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
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(197, 168, 128, 0.3)',
          padding: '2.5rem 2rem',
          marginBottom: '4.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c5a880', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              <Sparkles size={14} /> The Yasraf Circle Privileges
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', color: '#ffffff', marginBottom: '0.4rem' }}>
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
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '3rem 2rem',
          marginBottom: '4rem'
        }}>
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
                <button onClick={() => onSelectCategory('new-in')} style={{ color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  New In
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('ready-to-wear')} style={{ color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  Ready to Wear
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('luxury-pret')} style={{ color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  Luxury Prêt
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('party-wear')} style={{ color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  Party Wear & Formals
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('winter-collection')} style={{ color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  Winter Collection
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('best-sellers')} style={{ color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  Best Sellers
                </button>
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
                <button onClick={onOpenTrackOrder} style={{ color: '#c5a880', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  Track Your Order Online
                </button>
              </li>
              <li>
                <button onClick={onOpenSizeGuide} style={{ color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  Size Chart & Fitting Guide
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage && onNavigatePage('about')} style={{ color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  The Atelier Story (About Us)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage && onNavigatePage('contact')} style={{ color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  Client Concierge & Contact
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage && onNavigatePage('shipping')} style={{ color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  Delivery & Shipping Rates
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage && onNavigatePage('shipping')} style={{ color: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  7-Day Exchange Policy
                </button>
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
          color: '#7a756f'
        }}>
          <div>
            © {new Date().getFullYear()} <strong>{BRAND_CONFIG.name.toUpperCase()}</strong>. All Rights Reserved. Crafted with authentic Pakistani craftsmanship.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#9c978f' }}>Cash on Delivery Available Nationwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
