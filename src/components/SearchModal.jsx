import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ArrowRight, Sparkles } from 'lucide-react';
import { CURRENCIES } from '../data/products';

export default function SearchModal({
  isOpen,
  onClose,
  products,
  currency = 'PKR',
  onSelectProduct
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const curr = CURRENCIES[currency] || CURRENCIES.PKR;

  const trendingTags = [
    'Ready to Wear',
    'Luxury Prêt',
    'Party Wear',
    'Winter Collection',
    'Egyptian Lawn',
    'Schiffli Lace',
    'Pure Silk'
  ];

  const results = searchTerm.trim() === '' 
    ? [] 
    : products.filter((p) => {
        const q = searchTerm.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
        );
      });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '4rem' }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '780px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          padding: '2rem',
          animation: 'fadeIn 0.25s ease-out',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#c5a880', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Instant Search Yasraf Collection
          </span>
          <button 
            onClick={onClose}
            style={{ padding: '0.35rem', borderRadius: '50%', backgroundColor: '#f5f0ea', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Input box */}
        <div style={{
          position: 'relative',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #121212'
        }}>
          <Search size={22} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', color: '#141414' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by print, fabric (lawn, silk, chiffon), or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem 0.8rem 2.4rem',
              border: 'none',
              fontSize: '1.15rem',
              fontFamily: 'var(--font-serif)',
              outline: 'none',
              backgroundColor: 'transparent'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Trending Search Tags */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#8c867f', fontWeight: 600, marginBottom: '0.6rem' }}>
            <Sparkles size={13} style={{ color: '#c5a880' }} /> POPULAR SEARCHES:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                style={{
                  padding: '0.35rem 0.75rem',
                  backgroundColor: '#f7f4ee',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  color: '#4a4642',
                  border: '1px solid #e8e2d8',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#121212';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f7f4ee';
                  e.currentTarget.style.color = '#4a4642';
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Results */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.3rem' }}>
          {searchTerm.trim() !== '' && results.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6e6b66', marginBottom: '0.8rem', fontWeight: 600 }}>
                Found {results.length} results:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.6rem',
                      backgroundColor: '#fdfbf7',
                      border: '1px solid #ede8de',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f7f2ea';
                      e.currentTarget.style.borderColor = '#c5a880';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fdfbf7';
                      e.currentTarget.style.borderColor = '#ede8de';
                    }}
                  >
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      style={{ width: '50px', height: '64px', objectFit: 'cover' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.68rem', color: '#c5a880', fontWeight: 700, textTransform: 'uppercase' }}>
                        {product.categoryLabel}
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', fontWeight: 600, color: '#141414' }}>
                        {product.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#7a756f' }}>
                        {product.type}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', paddingRight: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#141414' }}>
                        {curr.symbol} {Math.round(product.price * curr.rate).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchTerm.trim() !== '' && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#8c867f' }}>
              <p>No matching designs found for "{searchTerm}".</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>Try searching "lawn", "pret", or "chiffon".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
