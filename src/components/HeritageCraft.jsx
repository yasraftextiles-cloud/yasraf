import React from 'react';
import { Feather, ShieldCheck, HeartHandshake, Scissors, Sparkles } from 'lucide-react';

const CRAFT_PILLARS = [
  {
    icon: Scissors,
    title: 'Master Karigar Artistry',
    subtitle: 'Heirloom Handcrafting',
    desc: 'Each bridal kalidar and formal tunic undergoes over 120 hours of hand-embroidery including authentic zardozi, marori, resham, and gota work.'
  },
  {
    icon: Feather,
    title: 'Egyptian 80/80 Lawn',
    subtitle: 'Supreme Silky Comfort',
    desc: 'Woven from long-staple cotton yarns to produce a featherweight, cool texture that breathes effortlessly through hot South Asian summers.'
  },
  {
    icon: Sparkles,
    title: 'Pure Bemberg & Raw Silk',
    subtitle: 'Uncompromising Fabrics',
    desc: 'We never compromise on synthetic blends. Our chiffons, raw silks, and jacquards are 100% pure fibers sourced directly from certified heritage mills.'
  },
  {
    icon: HeartHandshake,
    title: 'Ethical Artisan Wages',
    subtitle: 'Empowering Communities',
    desc: 'Over 600 female artisans across rural Sindh and Punjab are fairly compensated with healthcare benefits and dignified livelihoods through Yasraf.'
  }
];

export default function HeritageCraft() {
  return (
    <section style={{
      padding: '5.5rem 0',
      backgroundColor: '#121212',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative subtle gold radial ambient */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(197, 168, 128, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="yasraf-container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: '#c5a880',
            marginBottom: '0.6rem',
            display: 'block'
          }}>
            Our Textile Philosophy
          </span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '0.8rem'
          }}>
            The Art of Yasraf Craftsmanship
          </h2>
          <p style={{
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '560px',
            margin: '0 auto'
          }}>
            Reviving classical Subcontinental design traditions with modern tailoring aesthetics. Every thread tells a story of enduring elegance.
          </p>
          <div style={{ width: '50px', height: '2px', background: '#c5a880', margin: '1.2rem auto 0' }} />
        </div>

        {/* 4 Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem'
        }}>
          {CRAFT_PILLARS.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div 
                key={idx}
                style={{
                  padding: '2rem 1.8rem',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.4)';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '0',
                  backgroundColor: 'rgba(197, 168, 128, 0.15)',
                  border: '1px solid rgba(197, 168, 128, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c5a880',
                  marginBottom: '0.4rem'
                }}>
                  <IconComp size={22} />
                </div>

                <span style={{ fontSize: '0.68rem', color: '#c5a880', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
                  {item.subtitle}
                </span>

                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.28rem',
                  fontWeight: 500,
                  color: '#ffffff'
                }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
