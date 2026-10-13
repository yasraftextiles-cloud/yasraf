import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductFilters, { PRICE_RANGES } from '../components/ProductFilters';
import { SlidersHorizontal, ArrowLeft, X, RotateCcw } from 'lucide-react';
import { COLLECTION_SEO_DATA } from '../utils/seo';

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
  
  // Multi-Filter State
  const [selectedCategories, setSelectedCategories] = useState(() => {
    return activeCategory && activeCategory !== 'all' ? [activeCategory] : [];
  });
  const [selectedAvailability, setSelectedAvailability] = useState('all'); // 'all' | 'in_stock' | 'out_of_stock'
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [customPriceMin, setCustomPriceMin] = useState('');
  const [customPriceMax, setCustomPriceMax] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);

  // Sync with prop when external navigation happens (e.g. user clicked category in header)
  useEffect(() => {
    if (activeCategory && activeCategory !== 'all') {
      setSelectedCategories([activeCategory]);
    } else {
      setSelectedCategories([]);
    }
  }, [activeCategory]);

  // Toggle Handlers
  const handleToggleCategory = (catId) => {
    setSelectedCategories((prev) => 
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleToggleSize = (size) => {
    setSelectedSizes((prev) => 
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleToggleColor = (color) => {
    setSelectedColors((prev) => 
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleToggleFabric = (fabric) => {
    setSelectedFabrics((prev) => 
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedAvailability('all');
    setSelectedPriceRange('all');
    setCustomPriceMin('');
    setCustomPriceMax('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedFabrics([]);
    setSortBy('featured');
    if (onSelectCategory && activeCategory !== 'all') {
      onSelectCategory('all');
    }
  };

  // Helper to match a single product against a category
  const matchesCategory = (p, catId) => {
    const c = (catId || '').toLowerCase().trim();
    if (!c || c === 'all') return true;
    const inCols = Array.isArray(p.collections) && p.collections.some((col) => {
      const cl = String(col).toLowerCase().trim();
      return cl === c || cl === c.replace(/-/g, ' ') || cl.replace(/-/g, ' ') === c.replace(/-/g, ' ');
    });
    const catF = (p.category || '').toLowerCase().trim();
    const occF = (p.occasion || '').toLowerCase().trim();
    const tagF = (p.tag || '').toLowerCase().trim();
    const fabF = (p.fabric || '').toLowerCase().trim();
    const fabCat = (p.fabricCategory || '').toLowerCase().trim();

    if (c === 'ready-to-wear') return catF === 'ready-to-wear' || occF.includes('ready to wear') || inCols;
    if (c === 'unstitched') return catF === 'unstitched' || (Array.isArray(p.sizes) && p.sizes.some((s) => String(s).toLowerCase().includes('unstitched'))) || inCols;
    if (c === 'luxury-pret') return catF === 'luxury-pret' || occF.includes('luxury') || inCols;
    if (c === 'party-wear' || c === 'formal') return catF === 'party-wear' || catF === 'festive' || occF.includes('party') || occF.includes('festive') || occF.includes('formal') || inCols;
    if (c === 'summer') return catF === 'summer' || fabCat.includes('lawn') || fabF.includes('lawn') || inCols;
    if (c === 'winter' || c === 'winter-collection') return catF === 'winter' || catF === 'winter-collection' || tagF.includes('winter') || inCols;
    if (c === 'festive') return catF === 'festive' || catF === 'party-wear' || occF.includes('festive') || tagF.includes('festive') || inCols;
    if (c === 'best-sellers') return Boolean(p.isBestSeller || inCols);
    if (c === 'new-in') return Boolean(p.isNew || inCols);
    return catF === c || occF === c || inCols;
  };

  // Multi-Criteria Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Category Filter (Multi-select)
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.some((catId) => matchesCategory(p, catId)));
    }

    // 2. Availability Filter
    if (selectedAvailability === 'in_stock') {
      list = list.filter((p) => p.inStock === true || (p.stockCount !== undefined && p.stockCount > 0));
    } else if (selectedAvailability === 'out_of_stock') {
      list = list.filter((p) => p.inStock === false || (p.stockCount !== undefined && p.stockCount === 0));
    }

    // 3. Price Filter
    if (customPriceMin !== '' || customPriceMax !== '') {
      const min = customPriceMin !== '' && !isNaN(Number(customPriceMin)) ? Number(customPriceMin) : 0;
      const max = customPriceMax !== '' && !isNaN(Number(customPriceMax)) ? Number(customPriceMax) : Infinity;
      list = list.filter((p) => p.price >= min && p.price <= max);
    } else if (selectedPriceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range) {
        list = list.filter((p) => p.price >= range.min && p.price < range.max);
      }
    }

    // 4. Sizes Filter (Multi-select)
    if (selectedSizes.length > 0) {
      list = list.filter((p) => {
        const pSizes = (Array.isArray(p.sizes) ? p.sizes : []).concat(
          Array.isArray(p.variants) ? p.variants.map((v) => v.size).filter(Boolean) : []
        );
        return selectedSizes.some((sz) => 
          pSizes.some((ps) => String(ps).trim().toLowerCase() === String(sz).trim().toLowerCase())
        );
      });
    }

    // 5. Colors Filter (Multi-select)
    if (selectedColors.length > 0) {
      list = list.filter((p) => {
        const pColorNames = [];
        if (Array.isArray(p.colors)) {
          p.colors.forEach((c) => {
            if (typeof c === 'string') pColorNames.push(c.trim().toLowerCase());
            else if (c && c.name) pColorNames.push(c.name.trim().toLowerCase());
          });
        }
        if (Array.isArray(p.variants)) {
          p.variants.forEach((v) => {
            if (v.color_name) pColorNames.push(v.color_name.trim().toLowerCase());
            else if (v.color) pColorNames.push(v.color.trim().toLowerCase());
          });
        }
        if (p.color) pColorNames.push(String(p.color).trim().toLowerCase());

        return selectedColors.some((sc) => {
          const scLower = sc.trim().toLowerCase();
          return pColorNames.some((pcn) => pcn === scLower || pcn.includes(scLower) || scLower.includes(pcn));
        });
      });
    }

    // 6. Fabrics Filter (Multi-select)
    if (selectedFabrics.length > 0) {
      list = list.filter((p) => {
        const pFabrics = [];
        if (p.fabricCategory) pFabrics.push(p.fabricCategory.trim().toLowerCase());
        if (p.fabric) pFabrics.push(p.fabric.trim().toLowerCase());

        return selectedFabrics.some((sf) => {
          const sfLower = sf.trim().toLowerCase();
          return pFabrics.some((pf) => pf.includes(sfLower));
        });
      });
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
      });
    } else {
      // 'featured'
      list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
    }

    return list;
  }, [
    products, 
    selectedCategories, 
    selectedAvailability, 
    selectedPriceRange, 
    customPriceMin, 
    customPriceMax, 
    selectedSizes, 
    selectedColors, 
    selectedFabrics, 
    sortBy
  ]);

  // Page Heading & SEO Data
  const effectiveCategoryKey = selectedCategories.length === 1 ? selectedCategories[0] : (activeCategory || 'all');
  const colData = COLLECTION_SEO_DATA[effectiveCategoryKey] || COLLECTION_SEO_DATA['all'];

  // Check if any filter is actively applied
  const hasActiveFilters = 
    selectedCategories.length > 0 ||
    selectedAvailability !== 'all' ||
    selectedPriceRange !== 'all' ||
    customPriceMin !== '' ||
    customPriceMax !== '' ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedFabrics.length > 0;

  const activeFiltersCount = 
    selectedCategories.length +
    (selectedAvailability !== 'all' ? 1 : 0) +
    (selectedPriceRange !== 'all' || customPriceMin !== '' || customPriceMax !== '' ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    selectedFabrics.length;

  return (
    <div className="w-full bg-[#ffffff] min-h-screen text-[#1a1814] pt-24 sm:pt-28 pb-20">
      
      {/* 1. Breadcrumbs */}
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-3 border-b border-neutral-200/50 mb-6">
        <div className="flex items-center gap-2 text-[11.5px] uppercase tracking-[0.14em] text-[#8c867f]">
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onBackToHome) onBackToHome();
            }}
            className="hover:text-[#1a1814] transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Back to Home
          </a>
          <span>/</span>
          <span className="text-[#1a1814] font-medium">
            {selectedCategories.length === 0 ? 'All Collections' : (colData.h1 || 'Collections')}
          </span>
        </div>
      </div>

      {/* 2. Collection Header */}
      <div className="text-center max-w-2xl mx-auto px-4 mb-8 sm:mb-10">
        <span className="text-[10.5px] uppercase tracking-[0.24em] font-medium text-[#8c867f] block mb-2">
          YASRAF ATELIER
        </span>
        <h1 
          className="text-3xl sm:text-4xl lg:text-[44px] text-[#2c2824] font-light tracking-tight leading-tight mb-3"
          style={{ fontFamily: 'var(--font-family-editorial)' }}
        >
          {selectedCategories.length === 0 ? 'All Collections' : (colData.h1 || 'Collections')}
        </h1>
        <p className="text-xs sm:text-[13px] text-[#78716a] font-light leading-relaxed max-w-lg mx-auto">
          {selectedCategories.length === 0 ? COLLECTION_SEO_DATA['all'].intro : colData.intro}
        </p>
      </div>

      {/* 3. Filter Trigger, Active Chips & Sort Control Bar */}
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-y border-neutral-200/70 text-[12px] text-[#67615c]">
          
          {/* Left: Filter Trigger Button & Count */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#faf8f5] hover:bg-[#f5ede5] border border-[#e5dfd4] rounded text-[11.5px] uppercase tracking-[0.16em] font-medium text-[#1a1814] transition-all cursor-pointer shadow-2xs"
              style={{ fontFamily: 'var(--font-family-primary)' }}
            >
              <SlidersHorizontal size={14} />
              <span>Filter Products</span>
              {activeFiltersCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-[#1a1814] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Live Count */}
            <span className="text-[11.5px] sm:text-[12px] text-[#7a736a] tracking-wider uppercase font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
            </span>
          </div>

          {/* Right: Sort Control */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="hidden sm:inline uppercase tracking-[0.12em] text-[11px] text-[#8c867f] font-medium">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#faf8f5] border border-[#e5dfd4] rounded px-3 py-1.5 text-[11.5px] uppercase tracking-[0.1em] text-[#1a1814] outline-none cursor-pointer hover:border-[#1a1814] transition-colors"
              style={{ fontFamily: 'var(--font-family-primary)' }}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="flex items-center flex-wrap gap-1.5 pt-3">
            {/* Category Chips */}
            {selectedCategories.map((catId) => (
              <button
                key={catId}
                onClick={() => handleToggleCategory(catId)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f4efe9] text-[#1a1814] hover:bg-[#ebd4be] rounded-full text-[11px] font-medium tracking-wide transition-colors cursor-pointer"
              >
                <span className="capitalize">{catId.replace(/-/g, ' ')}</span>
                <X size={12} />
              </button>
            ))}

            {/* Availability Chip */}
            {selectedAvailability !== 'all' && (
              <button
                onClick={() => setSelectedAvailability('all')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f4efe9] text-[#1a1814] hover:bg-[#ebd4be] rounded-full text-[11px] font-medium tracking-wide transition-colors cursor-pointer"
              >
                <span>{selectedAvailability === 'in_stock' ? 'In Stock' : 'Out of Stock'}</span>
                <X size={12} />
              </button>
            )}

            {/* Price Chip */}
            {(selectedPriceRange !== 'all' || customPriceMin !== '' || customPriceMax !== '') && (
              <button
                onClick={() => {
                  setSelectedPriceRange('all');
                  setCustomPriceMin('');
                  setCustomPriceMax('');
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f4efe9] text-[#1a1814] hover:bg-[#ebd4be] rounded-full text-[11px] font-medium tracking-wide transition-colors cursor-pointer"
              >
                <span>
                  {customPriceMin || customPriceMax
                    ? `Rs. ${customPriceMin || '0'} - ${customPriceMax || 'Max'}`
                    : (PRICE_RANGES.find((r) => r.id === selectedPriceRange)?.label || 'Price')}
                </span>
                <X size={12} />
              </button>
            )}

            {/* Size Chips */}
            {selectedSizes.map((sz) => (
              <button
                key={sz}
                onClick={() => handleToggleSize(sz)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f4efe9] text-[#1a1814] hover:bg-[#ebd4be] rounded-full text-[11px] font-medium tracking-wide transition-colors cursor-pointer"
              >
                <span>Size: {sz}</span>
                <X size={12} />
              </button>
            ))}

            {/* Color Chips */}
            {selectedColors.map((col) => (
              <button
                key={col}
                onClick={() => handleToggleColor(col)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f4efe9] text-[#1a1814] hover:bg-[#ebd4be] rounded-full text-[11px] font-medium tracking-wide transition-colors cursor-pointer"
              >
                <span>Color: {col}</span>
                <X size={12} />
              </button>
            ))}

            {/* Fabric Chips */}
            {selectedFabrics.map((fab) => (
              <button
                key={fab}
                onClick={() => handleToggleFabric(fab)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f4efe9] text-[#1a1814] hover:bg-[#ebd4be] rounded-full text-[11px] font-medium tracking-wide transition-colors cursor-pointer"
              >
                <span>Fabric: {fab}</span>
                <X size={12} />
              </button>
            ))}

            {/* Clear All Filters Button */}
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-[#8c867f] hover:text-[#1a1814] ml-2 cursor-pointer py-1 transition-colors"
            >
              <RotateCcw size={11} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* 4. 4-Column Edge-to-Edge Grid with Product Cards */}
      <div className="w-full max-w-[2000px] mx-auto px-2 sm:px-4 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-[#faf8f6] border border-[#ebe6e0] p-8 max-w-xl mx-auto rounded">
            <h3 
              className="text-2xl font-light text-[#67615c] mb-2"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              No ensembles found in this criteria
            </h3>
            <p className="text-xs text-[#8c867f] mb-6 leading-relaxed">
              Try adjusting your active filters or clear all filters to view our complete collection.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-[#1a1814] text-white text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-[#c5a880] transition-colors cursor-pointer rounded shadow-sm"
            >
              Clear All Filters
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

      {/* 5. Professional Product Filters Drawer */}
      <ProductFilters
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        products={products}
        // Categories
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        // Availability
        selectedAvailability={selectedAvailability}
        onSelectAvailability={setSelectedAvailability}
        // Price
        selectedPriceRange={selectedPriceRange}
        onSelectPriceRange={setSelectedPriceRange}
        customPriceMin={customPriceMin}
        customPriceMax={customPriceMax}
        onChangePriceMin={setCustomPriceMin}
        onChangePriceMax={setCustomPriceMax}
        // Sizes
        selectedSizes={selectedSizes}
        onToggleSize={handleToggleSize}
        // Colors
        selectedColors={selectedColors}
        onToggleColor={handleToggleColor}
        // Fabrics
        selectedFabrics={selectedFabrics}
        onToggleFabric={handleToggleFabric}
        // Reset
        onResetFilters={handleResetFilters}
        totalResultsCount={filteredProducts.length}
      />

    </div>
  );
}
