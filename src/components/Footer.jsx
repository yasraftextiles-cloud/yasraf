import React, { useState } from 'react';
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Heart, Sparkles, Check } from 'lucide-react';
import { InstagramIcon, FacebookIcon } from './SocialIcons';
import { BRAND_CONFIG } from '../data/brandConfig';

export default function Footer({ onOpenTrackOrder, onOpenSizeGuide, onSelectCategory }) {
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
            <span style={{ fontSize: '0.62rem', color: '#c5a880', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '1.2rem' }}>
              {BRAND_CONFIG.subTagline}
            </span>
            <p style={{ fontSize: '0.84rem', color: '#9c978f', lineHeight: 1.65, marginBottom: '1.5rem' }}>
              Yasraf Clothing is Pakistan’s distinguished women’s fashion atelier, celebrating timeless Eastern silhouettes, refined craftsmanship, and contemporary ready-to-wear luxury.
            </p>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="Instagram"
                style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
              >
                <InstagramIcon size={17} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="Facebook"
                style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
              >
                <FacebookIcon size={17} />
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
                <button onClick={() => onSelectCategory('new-in')} style={{ color: 'inherit', cursor: 'pointer' }}>
                  New In
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('ready-to-wear')} style={{ color: 'inherit', cursor: 'pointer' }}>
                  Ready to Wear
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('luxury-pret')} style={{ color: 'inherit', cursor: 'pointer' }}>
                  Luxury Prêt
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('party-wear')} style={{ color: 'inherit', cursor: 'pointer' }}>
                  Party Wear & Formals
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('winter-collection')} style={{ color: 'inherit', cursor: 'pointer' }}>
                  Winter Collection
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('best-sellers')} style={{ color: 'inherit', cursor: 'pointer' }}>
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
                <button onClick={onOpenTrackOrder} style={{ color: '#c5a880', fontWeight: 600, cursor: 'pointer' }}>
                  Track Your Order Online
                </button>
              </li>
              <li>
                <button onClick={onOpenSizeGuide} style={{ color: 'inherit', cursor: 'pointer' }}>
                  Size Chart & Fitting Guide
                </button>
              </li>
              <li><span>Cash on Delivery Across Pakistan</span></li>
              <li><span>Exchange Policy (7 Days)</span></li>
              <li><span>Fabric Care Guidelines</span></li>
            </ul>
          </div>

          {/* Col 4: Boutiques & Contact */}
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '1.2rem' }}>
              Contact & Boutiques
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem', color: '#9c978f' }}>
              {BRAND_CONFIG.boutiques.map((b) => (
                <div key={b.city} style={{ display: 'flex', gap: '0.5rem' }}>
                  <MapPin size={16} style={{ color: '#c5a880', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>{b.city}:</strong> {b.address}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                <Phone size={16} style={{ color: '#c5a880', flexShrink: 0 }} />
                <a href={BRAND_CONFIG.getWhatsAppSupportUrl()} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                  WhatsApp: {BRAND_CONFIG.whatsappDisplay}
                </a>
              </div>
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
