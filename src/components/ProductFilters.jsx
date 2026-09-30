import React from 'react';
import { 
  X, 
  RotateCcw, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { NAV_CATEGORIES, FABRICS, OCCASIONS, SIZES } from '../data/products';

export const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under-8k', label: 'Under Rs. 8,000', min: 0, max: 8000 },
  { id: '8k-10k', label: 'Rs. 8,000 – Rs. 10,000', min: 8000, max: 10000 },
  { id: '10k-13k', label: 'Rs. 10,000 – Rs. 13,000', min: 10000, max: 13000 },
  { id: 'above-13k', label: 'Above Rs. 13,000', min: 13000, max: Infinity }
];

export const COLOR_PALETTE = [
  { name: 'Black / Onyx', hex: '#1e1c1b' },
  { name: 'Emerald Green', hex: '#16503c' },
  { name: 'Plum & Wine', hex: '#582138' },
  { name: 'Royal Violet', hex: '#634b82' },
  { name: 'Saffron Yellow', hex: '#d49b28' },
  { name: 'Sage Green', hex: '#688c75' },
  { name: 'Peacock Teal', hex: '#1b4d5a' },
  { name: 'Ivory & Cream', hex: '#eceae3' },
  { name: 'Glacier Blue', hex: '#8faec2' },
  { name: 'Blush Rose', hex: '#e3b3b8' }
];

export default function ProductFilters({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  selectedPriceRange,
  onSelectPriceRange,
  selectedSizes,
  onToggleSize,
  selectedColors,
  onToggleColor,
  selectedFabrics,
  onToggleFabric,
  selectedOccasions,
  onToggleOccasion,
  availabilityOnly,
  onToggleAvailability,
  onResetFilters,
  totalResultsCount
}) {
  if (!isOpen) return null;

  const hasActiveFilters = 
    selectedCategory !== 'all' ||
    selectedPriceRange !== 'all' ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedFabrics.length > 0 ||
    selectedOccasions.length > 0 ||
    availabilityOnly !== 'all';

  return (
    <div 
      className="filter-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 18, 18, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-start',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        className="filter-drawer animate-slide-left"
        style={{
          width: '100%',
          maxWidth: '380px',
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-drawer)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Filter Drawer Header */}
        <div style={{
          padding: '1.4rem 1.6rem',
          borderBottom: '1px solid #ede8de',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <SlidersHorizontal size={18} style={{ color: '#121212' }} />
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: '#141414'
            }}>
              Filter Collection
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#8e704b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close filters"
              style={{
                padding: '0.4rem',
                borderRadius: '50%',
                backgroundColor: '#f7f4ee',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Scrollable Filter Sections */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.4rem 1.6rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.8rem'
        }}>
          {/* 1. Category */}
          <div>
            <h4 style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#141414',
              marginBottom: '0.8rem'
            }}>
              Category
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {NAV_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    style={{
                      textAlign: 'left',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '2px',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 500,
                      backgroundColor: isSelected ? '#121212' : '#fcfbf9',
                      color: isSelected ? '#ffffff' : '#4a4642',
                      border: isSelected ? '1px solid #121212' : '1px solid #eee8df',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{cat.label}</span>
                    {cat.badge && (
                      <span style={{
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        backgroundColor: isSelected ? '#c5a880' : '#121212',
                        color: '#ffffff',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '2px'
                      }}>
                        {cat.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Price Range */}
          <div>
            <h4 style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#141414',
              marginBottom: '0.8rem'
            }}>
              Price Range (PKR)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {PRICE_RANGES.map((pr) => {
                const isSelected = selectedPriceRange === pr.id;
                return (
                  <label
                    key={pr.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.8rem',
                      color: isSelected ? '#141414' : '#555',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      padding: '0.3rem 0'
                    }}
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      checked={isSelected}
                      onChange={() => onSelectPriceRange(pr.id)}
                      style={{ accentColor: '#c5a880', width: '15px', height: '15px' }}
                    />
                    <span>{pr.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Sizes */}
          <div>
            <h4 style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#141414',
              marginBottom: '0.8rem'
            }}>
              Sizes
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => onToggleSize(size)}
                    style={{
                      minWidth: '46px',
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      backgroundColor: isSelected ? '#121212' : '#f7f4ee',
                      color: isSelected ? '#ffffff' : '#141414',
                      border: isSelected ? '1px solid #121212' : '1px solid #d5cfc4',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Colors */}
          <div>
            <h4 style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#141414',
              marginBottom: '0.8rem'
            }}>
              Color Palette
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {COLOR_PALETTE.map((color) => {
                const isSelected = selectedColors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    onClick={() => onToggleColor(color.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.6rem',
                      border: isSelected ? '1px solid #121212' : '1px solid #eee8df',
                      backgroundColor: isSelected ? '#f5f0ea' : '#ffffff',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 600 : 400,
                      textAlign: 'left'
                    }}
                  >
                    <span style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: color.hex,
                      border: '1px solid rgba(0,0,0,0.2)',
                      flexShrink: 0
                    }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Fabric */}
          <div>
            <h4 style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#141414',
              marginBottom: '0.8rem'
            }}>
              Fabric
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {FABRICS.map((fabric) => {
                const isSelected = selectedFabrics.includes(fabric);
                return (
                  <label
                    key={fabric}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.8rem',
                      color: isSelected ? '#141414' : '#555',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleFabric(fabric)}
                      style={{ accentColor: '#c5a880', width: '15px', height: '15px' }}
                    />
                    <span>{fabric}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 6. Occasion */}
          <div>
            <h4 style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#141414',
              marginBottom: '0.8rem'
            }}>
              Occasion
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {OCCASIONS.map((occ) => {
                const isSelected = selectedOccasions.includes(occ);
                return (
                  <button
                    key={occ}
                    onClick={() => onToggleOccasion(occ)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 600 : 500,
                      backgroundColor: isSelected ? '#121212' : '#f7f4ee',
                      color: isSelected ? '#ffffff' : '#4a4642',
                      border: isSelected ? '1px solid #121212' : '1px solid #e2ddd3',
                      cursor: 'pointer',
                      borderRadius: '2px'
                    }}
                  >
                    {occ}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Availability */}
          <div>
            <h4 style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#141414',
              marginBottom: '0.8rem'
            }}>
              Availability
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {[
                { id: 'all', label: 'All Items' },
                { id: 'in_stock', label: 'In Stock Only' },
                { id: 'low_stock', label: 'Limited / Low Stock Only' }
              ].map((av) => (
                <label
                  key={av.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.8rem',
                    color: availabilityOnly === av.id ? '#141414' : '#555',
                    fontWeight: availabilityOnly === av.id ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="availability"
                    checked={availabilityOnly === av.id}
                    onChange={() => onToggleAvailability(av.id)}
                    style={{ accentColor: '#c5a880', width: '15px', height: '15px' }}
                  />
                  <span>{av.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Apply Button */}
        <div style={{
          padding: '1.2rem 1.6rem',
          borderTop: '1px solid #ede8de',
          backgroundColor: '#ffffff'
        }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.85rem',
              backgroundColor: '#121212',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c5a880'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#121212'}
          >
            <Check size={16} /> Show {totalResultsCount} Results
          </button>
        </div>
      </div>
    </div>
  );
}
