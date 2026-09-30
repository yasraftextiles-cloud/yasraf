import React from 'react';
import { STORIES } from '../data/products';
import { Sparkles } from 'lucide-react';

export default function StoryHighlights({ onOpenStory }) {
  return (
    <section style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid rgba(20, 20, 20, 0.06)',
      padding: '1.4rem 0'
    }}>
      <div className="yasraf-container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.4rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {STORIES.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onOpenStory(index)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.55rem',
                flexShrink: 0,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {/* Outer Ring */}
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                padding: '2.5px',
                background: 'linear-gradient(45deg, #c5a880, #dfc298, #942929, #c5a880)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(197, 168, 128, 0.3)',
                transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid #ffffff',
                  backgroundColor: '#f5f0ea'
                }}>
                  <img
                    src={item.previewImage}
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              </div>

              {/* Story Tag / Label */}
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#141414',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}>
                  {item.title}
                </span>
                <span style={{
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: '#c5a880',
                  textTransform: 'uppercase'
                }}>
                  {item.tag}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
