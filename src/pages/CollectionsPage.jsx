import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import ProductFilters, { PRICE_RANGES } from '../components/ProductFilters';
import { SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { NAV_CATEGORIES } from '../data/products';

export default function CollectionsPage({
  products = [],
  currency = 'PKR',
  activeCategory = 'all',
  onSelectCategory,
  onSelectProduct,
  onBackToHome,
  wishlistIds = [],
  onToggleWishlist
}) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);

  const handleToggleSize = (size) => {
    setSelectedSizes((prev) => 
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleToggleFabric = (fabric) => {
    setSelectedFabrics((prev) => 
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const handleResetFilters = () => {
    setSelectedPriceRange('all');
    setSelectedSizes([]);
    setSelectedFabrics([]);
    setSortBy('featured');
  };

  // Multi-criteria filtering & sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category
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

    // Price range
    if (selectedPriceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range) {
        list = list.filter((p) => p.price >= range.min && p.price < range.max);
      }
    }

    // Sizes
    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.sizes && p.sizes.some((sz) => selectedSizes.includes(sz)));
    }

    // Fabrics
    if (selectedFabrics.length > 0) {
      list = list.filter((p) => selectedFabrics.includes(p.fabricCategory));
    }

    // Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [products, activeCategory, selectedPriceRange, selectedSizes, selectedFabrics, sortBy]);

  const activeCategoryObj = NAV_CATEGORIES.find((c) => c.id === activeCategory) || { label: 'All Collections' };

  return (
    <div className="w-full bg-[#ffffff] min-h-screen text-[#1a1814] pt-24 sm:pt-28 pb-20">
      
      {/* 1. Breadcrumbs */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-3 border-b border-neutral-200/50 mb-6">
        <div className="flex items-center gap-2 text-[11.5px] uppercase tracking-[0.14em] text-[#8c867f]">
          <button 
            onClick={onBackToHome}
            className="hover:text-[#1a1814] transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Back to Home
          </button>
          <span>/</span>
          <span className="text-[#1a1814] font-medium">{activeCategoryObj.label}</span>
        </div>
      </div>

      {/* 2. Collection Header */}
      <div className="text-center max-w-xl mx-auto px-4 mb-8 sm:mb-12">
        <span className="text-[10.5px] uppercase tracking-[0.24em] font-medium text-[#8c867f] block mb-2">
          YASRAF ATELIER
        </span>
        <h1 
          className="text-3xl sm:text-4xl lg:text-[44px] text-[#67615c] font-light tracking-tight leading-tight mb-3"
          style={{ fontFamily: 'var(--font-family-editorial)' }}
        >
          {activeCategoryObj.label}
        </h1>
        <p className="text-xs sm:text-[13px] text-[#78716a] font-light leading-relaxed">
          Discover hand-finished luxury lawn, unstitched three-piece suits, and contemporary ready-to-wear ensembles.
        </p>
      </div>

      {/* 3. Category Horizontal Pills Filter Bar */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mb-8">
        <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none py-2 border-b border-neutral-200/60">
          {NAV_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 text-[11.5px] uppercase tracking-[0.14em] font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'border-b-2 border-[#1a1814] text-[#1a1814]'
                  : 'text-[#8c867f] hover:text-[#1a1814]'
              }`}
              style={{ fontFamily: 'var(--font-family-primary)' }}
            >
              {cat.shortLabel || cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Filter Trigger & Sort Control Bar */}
      <div className="w-full max-w-[2000px] mx-auto px-2 sm:px-4 lg:px-8 mb-6">
        <div className="flex items-center justify-between py-2 border-b border-neutral-200/50 text-[12px] text-[#67615c]">
          
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 uppercase tracking-[0.16em] font-medium text-[#1a1814] hover:opacity-60 transition-opacity cursor-pointer"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            <SlidersHorizontal size={14} />
            <span>Filter Products</span>
          </button>

          <span className="text-[11.5px] text-[#8c867f] tracking-wide">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
          </span>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline uppercase tracking-[0.12em] text-[11px] text-[#8c867f]">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[11.5px] uppercase tracking-[0.12em] text-[#1a1814] border-none outline-none cursor-pointer"
              style={{ fontFamily: 'var(--font-family-primary)' }}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

        </div>
      </div>

      {/* 5. 4-Column Edge-to-Edge Grid with Tall 2/3 Photos Matching Jahaan */}
      <div className="w-full max-w-[2000px] mx-auto px-2 sm:px-4 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-[#faf8f6] border border-[#ebe6e0] p-8">
            <h3 
              className="text-2xl font-light text-[#67615c] mb-2"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              No ensembles found in this criteria
            </h3>
            <p className="text-xs text-[#8c867f] mb-4">
              Try adjusting your filters or browsing another collection.
            </p>
            <button
              onClick={handleResetFilters}
              className="text-[11px] uppercase tracking-[0.18em] font-medium text-[#1a1814] border-b border-[#1a1814] pb-0.5 hover:opacity-60 transition-opacity cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-3.5">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                currency={currency}
                onQuickView={() => onSelectProduct && onSelectProduct(prod)}
                isWishlisted={wishlistIds.includes(prod.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <ProductFilters
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedPriceRange={selectedPriceRange}
        onSelectPriceRange={setSelectedPriceRange}
        selectedSizes={selectedSizes}
        onToggleSize={handleToggleSize}
        selectedColors={[]}
        onToggleColor={() => {}}
        selectedFabrics={selectedFabrics}
        onToggleFabric={handleToggleFabric}
        selectedOccasions={[]}
        onToggleOccasion={() => {}}
        availabilityOnly="all"
        onSelectAvailability={() => {}}
        onResetAll={handleResetFilters}
        totalProductsCount={filteredProducts.length}
      />

    </div>
  );
}
