import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import ProductFilters, { PRICE_RANGES } from './ProductFilters';
import { SlidersHorizontal, X, RotateCcw, Check, Sparkles } from 'lucide-react';
import { NAV_CATEGORIES } from '../data/products';

export default function ProductGrid({
  products,
  currency,
  activeCategory,
  onSelectCategory,
  onQuickView,
  onAddToCart,
  wishlistIds,
  onToggleWishlist,
  searchQuery,
  onUpdateProductImage
}) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  
  // Multi-faceted filter states
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [availabilityOnly, setAvailabilityOnly] = useState('all');

  // Toggle helpers
  const handleToggleSize = (size) => {
    setSelectedSizes((prev) => 
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleToggleColor = (colorName) => {
    setSelectedColors((prev) => 
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const handleToggleFabric = (fabric) => {
    setSelectedFabrics((prev) => 
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const handleToggleOccasion = (occ) => {
    setSelectedOccasions((prev) => 
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const handleResetAllFilters = () => {
    onSelectCategory('all');
    setSelectedPriceRange('all');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setAvailabilityOnly('all');
    setSortBy('featured');
  };

  // Comprehensive multi-criteria filtering
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Category Filter
    if (activeCategory && activeCategory !== 'all') {
      list = list.filter((p) => {
        if (activeCategory === 'best-sellers') return p.isBestSeller;
        if (activeCategory === 'new-in') return p.isNew;
        if (activeCategory === 'ready-to-wear') return p.category === 'ready-to-wear';
        if (activeCategory === 'luxury-pret') return p.category === 'luxury-pret';
        if (activeCategory === 'party-wear') return p.category === 'party-wear';
        if (activeCategory === 'winter-collection') return p.category === 'winter-collection';
        return p.category === activeCategory;
      });
    }

    // 2. Price Range Filter
    if (selectedPriceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range) {
        list = list.filter((p) => p.price >= range.min && p.price < range.max);
      }
    }

    // 3. Sizes Filter
    if (selectedSizes.length > 0) {
      list = list.filter((p) => 
        p.sizes && p.sizes.some((sz) => selectedSizes.includes(sz))
      );
    }

    // 4. Colors Filter
    if (selectedColors.length > 0) {
      list = list.filter((p) => 
        p.colors && p.colors.some((c) => selectedColors.some((sc) => c.name.toLowerCase().includes(sc.toLowerCase()) || sc.toLowerCase().includes(c.name.toLowerCase())))
      );
    }

    // 5. Fabric Filter
    if (selectedFabrics.length > 0) {
      list = list.filter((p) => 
        selectedFabrics.some((f) => 
          (p.fabricCategory && p.fabricCategory.toLowerCase().includes(f.toLowerCase())) ||
          (p.fabric && p.fabric.toLowerCase().includes(f.toLowerCase()))
        )
      );
    }

    // 6. Occasion Filter
    if (selectedOccasions.length > 0) {
      list = list.filter((p) => 
        selectedOccasions.some((o) => 
          (p.occasion && p.occasion.toLowerCase() === o.toLowerCase()) ||
          (p.categoryLabel && p.categoryLabel.toLowerCase().includes(o.toLowerCase()))
        )
      );
    }

    // 7. Availability Filter
    if (availabilityOnly !== 'all') {
      if (availabilityOnly === 'in_stock') {
        list = list.filter((p) => p.stockStatus === 'in_stock');
      } else if (availabilityOnly === 'low_stock') {
        list = list.filter((p) => p.stockStatus === 'low_stock');
      }
    }

    // 8. Search Query Filter
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
        (p.fabric && p.fabric.toLowerCase().includes(q)) ||
        (p.type && p.type.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    // 9. Sorting
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        list.sort((a, b) => ((b.isBestSeller ? 1 : 0) * 100 + b.reviewsCount) - ((a.isBestSeller ? 1 : 0) * 100 + a.reviewsCount));
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // 'featured'
        break;
    }

    return list;
  }, [
    products, 
    activeCategory, 
    selectedPriceRange, 
    selectedSizes, 
    selectedColors, 
    selectedFabrics, 
    selectedOccasions, 
    availabilityOnly, 
    searchQuery, 
    sortBy
  ]);

  const activeFilterCount = 
    (activeCategory !== 'all' ? 1 : 0) +
    (selectedPriceRange !== 'all' ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    selectedFabrics.length +
    selectedOccasions.length +
    (availabilityOnly !== 'all' ? 1 : 0);

  return (
    <section id="catalog" style={{
      padding: '4.5rem 0',
      backgroundColor: '#ffffff'
    }}>
      <div className="yasraf-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#c5a880',
            display: 'block',
            marginBottom: '0.4rem'
          }}>
            WOMEN&apos;S READY TO WEAR
          </span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
            fontWeight: 400,
            color: '#141414',
            margin: 0,
            letterSpacing: '0.02em'
          }}>
            Featured Collections
          </h2>
        </div>

        {/* Filter & Sort Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1.2rem',
          borderBottom: '1px solid rgba(20,20,20,0.06)',
          marginBottom: '1.5rem'
        }}>
          {/* Category Tabs (Single Line Nowrap) */}
          <div style={{
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            whiteSpace: 'nowrap',
            gap: '0.45rem',
            alignItems: 'center',
            paddingBottom: '0.2rem'
          }}>
            {NAV_CATEGORIES.map((tab) => {
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectCategory(tab.id)}
                  style={{
                    padding: '0.5rem 1.1rem',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 700 : 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    backgroundColor: isSelected ? '#121212' : '#f7f4ee',
                    color: isSelected ? '#ffffff' : '#4a4642',
                    border: 'none',
                    borderRadius: '2px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#ede8dd';
                      e.currentTarget.style.color = '#121212';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f7f4ee';
                      e.currentTarget.style.color = '#4a4642';
                    }
                  }}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Controls: Filter Trigger + Sort Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            marginLeft: 'auto'
          }}>
            {/* Filter Drawer Trigger Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.9rem',
                backgroundColor: activeFilterCount > 0 ? '#121212' : '#f7f4ee',
                color: activeFilterCount > 0 ? '#ffffff' : '#141414',
                border: '1px solid rgba(20,20,20,0.1)',
                borderRadius: '2px',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <SlidersHorizontal size={14} style={{ color: activeFilterCount > 0 ? '#c5a880' : '#8e704b' }} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span style={{
                  backgroundColor: '#c5a880',
                  color: '#121212',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Select */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#f7f4ee',
              padding: '0.45rem 0.8rem',
              border: '1px solid rgba(20,20,20,0.08)',
              borderRadius: '2px'
            }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products by"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#141414',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="newest">Sort by: Newest</option>
                <option value="popularity">Sort by: Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Badges Bar (Shows active pills with x button) */}
        {activeFilterCount > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.5rem',
            paddingBottom: '1.2rem',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#8c867f', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active Filters ({filteredProducts.length} Results):
            </span>

            {/* Category tag */}
            {activeCategory !== 'all' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.55rem',
                backgroundColor: '#f5f0ea',
                border: '1px solid #dcd4c7',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                Category: {activeCategory}
                <button onClick={() => onSelectCategory('all')} style={{ cursor: 'pointer', padding: 0 }}>
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Price tag */}
            {selectedPriceRange !== 'all' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.55rem',
                backgroundColor: '#f5f0ea',
                border: '1px solid #dcd4c7',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                Price: {PRICE_RANGES.find(r => r.id === selectedPriceRange)?.label}
                <button onClick={() => setSelectedPriceRange('all')} style={{ cursor: 'pointer', padding: 0 }}>
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Sizes tags */}
            {selectedSizes.map((sz) => (
              <span key={sz} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.55rem',
                backgroundColor: '#f5f0ea',
                border: '1px solid #dcd4c7',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                Size: {sz}
                <button onClick={() => handleToggleSize(sz)} style={{ cursor: 'pointer', padding: 0 }}>
                  <X size={12} />
                </button>
              </span>
            ))}

            {/* Color tags */}
            {selectedColors.map((col) => (
              <span key={col} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.55rem',
                backgroundColor: '#f5f0ea',
                border: '1px solid #dcd4c7',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                Color: {col}
                <button onClick={() => handleToggleColor(col)} style={{ cursor: 'pointer', padding: 0 }}>
                  <X size={12} />
                </button>
              </span>
            ))}

            {/* Fabric tags */}
            {selectedFabrics.map((fab) => (
              <span key={fab} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.55rem',
                backgroundColor: '#f5f0ea',
                border: '1px solid #dcd4c7',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                Fabric: {fab}
                <button onClick={() => handleToggleFabric(fab)} style={{ cursor: 'pointer', padding: 0 }}>
                  <X size={12} />
                </button>
              </span>
            ))}

            {/* Occasion tags */}
            {selectedOccasions.map((occ) => (
              <span key={occ} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.55rem',
                backgroundColor: '#f5f0ea',
                border: '1px solid #dcd4c7',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                Occasion: {occ}
                <button onClick={() => handleToggleOccasion(occ)} style={{ cursor: 'pointer', padding: 0 }}>
                  <X size={12} />
                </button>
              </span>
            ))}

            {/* Availability tag */}
            {availabilityOnly !== 'all' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.55rem',
                backgroundColor: '#f5f0ea',
                border: '1px solid #dcd4c7',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                {availabilityOnly === 'in_stock' ? 'In Stock' : 'Low Stock'}
                <button onClick={() => setAvailabilityOnly('all')} style={{ cursor: 'pointer', padding: 0 }}>
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Clear All button */}
            <button
              onClick={handleResetAllFilters}
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#942929',
                textTransform: 'uppercase',
                cursor: 'pointer',
                marginLeft: '0.4rem'
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Products Grid Display */}
        {filteredProducts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '2.5rem 1.8rem'
          }}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onUpdateImage={onUpdateProductImage}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            backgroundColor: '#faf8f5',
            border: '1px dashed #d5cfc4'
          }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              No designs match your active filters
            </h3>
            <p style={{ color: '#7a756f', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Try adjusting your price range, sizes, or category selection.
            </p>
            <button
              onClick={handleResetAllFilters}
              className="btn-luxury"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Slide-over Filter Drawer Component */}
      <ProductFilters
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedCategory={activeCategory}
        onSelectCategory={onSelectCategory}
        selectedPriceRange={selectedPriceRange}
        onSelectPriceRange={setSelectedPriceRange}
        selectedSizes={selectedSizes}
        onToggleSize={handleToggleSize}
        selectedColors={selectedColors}
        onToggleColor={handleToggleColor}
        selectedFabrics={selectedFabrics}
        onToggleFabric={handleToggleFabric}
        selectedOccasions={selectedOccasions}
        onToggleOccasion={handleToggleOccasion}
        availabilityOnly={availabilityOnly}
        onToggleAvailability={setAvailabilityOnly}
        onResetFilters={handleResetAllFilters}
        totalResultsCount={filteredProducts.length}
      />
    </section>
  );
}
