import React, { useState } from 'react';
import { LOOKBOOK_HOTSPOTS } from '../data/products';
import { Plus, X, ShoppingBag, Check } from 'lucide-react';

export default function ShopTheLook({ onAddToCart }) {
  const [activeHotspot, setActiveHotspot] = useState(LOOKBOOK_HOTSPOTS[0]);
  const [addedHotspotId, setAddedHotspotId] = useState(null);

  const handleAddPiece = (spot) => {
    onAddToCart({
      id: `look-${spot.id}`,
      sku: spot.sku,
      title: spot.title,
      price: parseInt(spot.price.replace(/[^0-9]/g, ''), 10) || 4500,
      image: '/products/yasraf-real-1.jpg',
      selectedSize: 'Standard / Stitched',
      selectedColor: 'Plum Rose & Ivory Lace',
      quantity: 1,
      categoryLabel: 'Signature Edition'
    });
    setAddedHotspotId(spot.id);
    setTimeout(() => setAddedHotspotId(null), 2000);
  };

  const handleAddEntireLook = () => {
    LOOKBOOK_HOTSPOTS.forEach((spot) => {
      onAddToCart({
        id: `look-${spot.id}`,
        sku: spot.sku,
        title: spot.title,
        price: parseInt(spot.price.replace(/[^0-9]/g, ''), 10) || 4500,
        image: '/products/yasraf-real-1.jpg',
        selectedSize: 'Standard / Stitched',
        selectedColor: 'Plum Rose & Ivory Lace',
        quantity: 1,
        categoryLabel: 'Signature Edition'
      });
    });
    setAddedHotspotId('all');
    setTimeout(() => setAddedHotspotId(null), 2200);
  };

  return (
    <section id="lookbook" style={{
      padding: '6rem 0',
      backgroundColor: '#fbfaf8',
      borderTop: '1px solid rgba(20,20,20,0.06)',
      borderBottom: '1px solid rgba(20,20,20,0.06)'
    }}>
      <div className="yasraf-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '4rem',
          alignItems: 'center'
        }}>
          {/* Interactive Model Photo with Minimalist Hotspots */}
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <img
              src="/products/yasraf-real-1.jpg"
              alt="Yasraf Plum Lace Signature Look"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />

            {/* Clickable Hotspot Pins */}
            {LOOKBOOK_HOTSPOTS.map((spot) => {
              const isSelected = activeHotspot?.id === spot.id;
              return (
                <div
                  key={spot.id}
                  style={{
                    position: 'absolute',
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                  }}
                >
                  <button
                    onClick={() => setActiveHotspot(isSelected ? null : spot)}
                    aria-label={`View ${spot.title}`}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#121212' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#121212',
                      border: '1px solid rgba(0,0,0,0.15)',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {isSelected ? <X size={14} /> : <Plus size={14} strokeWidth={2} />}
                  </button>

                  {/* Minimal Popover Card */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      bottom: '38px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '220px',
                      backgroundColor: '#ffffff',
                      padding: '1rem',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      zIndex: 20
                    }}>
                      <div style={{ fontSize: '0.62rem', color: '#9c978f', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {spot.sku}
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: 500, color: '#121212', margin: '0.2rem 0' }}>
                        {spot.title}
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#141414', marginBottom: '0.6rem' }}>
                        {spot.price}
                      </div>
                      <button
                        onClick={() => handleAddPiece(spot)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: addedHotspotId === spot.id ? '#1d4838' : '#121212',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          transition: 'background 0.2s ease',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {addedHotspotId === spot.id ? (
                          <>
                            <Check size={12} /> Added to Bag
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={12} /> Add Piece
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Minimal Editorial Column */}
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#9c978f',
              marginBottom: '0.75rem'
            }}>
              Interactive Runway Look
            </div>

            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              lineHeight: 1.12,
              fontWeight: 400,
              color: '#141414',
              marginBottom: '1.2rem'
            }}>
              Shop The Runway Look
            </h2>

            <p style={{
              fontSize: '0.92rem',
              color: '#6e6b66',
              lineHeight: 1.7,
              marginBottom: '2.2rem',
              fontWeight: 300
            }}>
              Click any pinpoint on the photoshoot ensemble to acquire individual separates, or purchase the complete curated 3-piece formal silhouette with complimentary signature packaging.
            </p>

            {/* Separates Breakdown List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '2.5rem'
            }}>
              {LOOKBOOK_HOTSPOTS.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => setActiveHotspot(spot)}
                  style={{
                    padding: '1rem 1.2rem',
                    backgroundColor: activeHotspot?.id === spot.id ? '#ffffff' : 'transparent',
                    border: '1px solid',
                    borderColor: activeHotspot?.id === spot.id ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.06)',
                    borderLeft: activeHotspot?.id === spot.id ? '3px solid #141414' : '1px solid rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 500, color: '#141414' }}>
                      {spot.title}
                    </h4>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#141414' }}>
                      {spot.price}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#8c867f', lineHeight: 1.4 }}>
                    {spot.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={handleAddEntireLook}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.95rem 2.2rem',
                  backgroundColor: addedHotspotId === 'all' ? '#1d4838' : '#141414',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  border: '1px solid #141414',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (addedHotspotId !== 'all') {
                    e.currentTarget.style.backgroundColor = '#333333';
                  }
                }}
                onMouseLeave={(e) => {
                  if (addedHotspotId !== 'all') {
                    e.currentTarget.style.backgroundColor = '#141414';
                  }
                }}
              >
                {addedHotspotId === 'all' ? (
                  <>
                    <Check size={16} /> Complete Look Added!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> Buy Entire Look (Rs. 23,500)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
