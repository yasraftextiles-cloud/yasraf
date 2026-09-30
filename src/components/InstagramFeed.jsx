import React from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';
import { InstagramIcon } from './SocialIcons';

const INSTA_POSTS = [
  { id: 1, image: '/products/yasraf-meerab-black-1.png', handle: '@yasraf.couture', likes: '2.4k' },
  { id: 2, image: '/products/yasraf-violet-court-2.jpg', handle: '@palace.edit', likes: '1.9k' },
  { id: 3, image: '/products/yasraf-emerald-green-1.png', handle: '@firouzeh.lawn', likes: '3.1k' },
  { id: 4, image: '/products/yasraf-saffron-yellow-1.png', handle: '@summer.in.yasraf', likes: '2.8k' },
  { id: 5, image: '/products/yasraf-glacier-blue-1.jpg', handle: '@glacier.chikan', likes: '1.7k' },
  { id: 6, image: '/products/yasraf-mauve-paisley-1.jpg', handle: '@zehra.pakistan', likes: '2.2k' }
];

export default function InstagramFeed() {
  return (
    <section style={{
      padding: '5rem 0 2.5rem',
      backgroundColor: '#fbfaf8',
      borderTop: '1px solid rgba(20,20,20,0.06)'
    }}>
      <div className="yasraf-container" style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1.2rem'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#9c978f',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: '0.4rem'
            }}>
              <InstagramIcon size={14} /> #YasrafWomen Editorial
            </div>
            <h2 style={{
              fontFamily: 'var(--font-editorial, "Cormorant Garamond", Georgia, serif)',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
              color: '#67615c',
              fontWeight: 300,
              letterSpacing: '0.02em',
              margin: 0
            }}>
              Seen In Yasraf Haute Couture
            </h2>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              fontWeight: 500,
              color: '#67615c',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              paddingBottom: '0.2rem',
              borderBottom: '1px solid rgba(103, 97, 92, 0.5)'
            }}
          >
            Follow @YasrafClothing <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Edge-to-edge 6 Photo Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.6rem',
        padding: '0 0.6rem'
      }}>
        {INSTA_POSTS.map((post) => (
          <div
            key={post.id}
            style={{
              position: 'relative',
              aspectRatio: '1 / 1.1',
              overflow: 'hidden',
              backgroundColor: '#141414',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              const overlay = e.currentTarget.querySelector('.insta-overlay');
              if (overlay) overlay.style.opacity = '1';
              const img = e.currentTarget.querySelector('img');
              if (img) img.style.transform = 'scale(1.06)';
            }}
            onMouseLeave={(e) => {
              const overlay = e.currentTarget.querySelector('.insta-overlay');
              if (overlay) overlay.style.opacity = '0';
              const img = e.currentTarget.querySelector('img');
              if (img) img.style.transform = 'scale(1)';
            }}
          >
            <img
              src={post.image}
              alt="Yasraf Instagram Feature"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
                transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            />

            {/* Minimal Hover Scrim */}
            <div 
              className="insta-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 15, 15, 0.65)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                color: '#ffffff',
                opacity: 0,
                transition: 'opacity 0.25s ease',
                padding: '1rem',
                textAlign: 'center'
              }}
            >
              <InstagramIcon size={20} style={{ color: '#dfc298' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.04em' }}>{post.handle}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>
                <Heart size={12} fill="#dfc298" stroke="#dfc298" /> {post.likes}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
