import React, { useMemo, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Check, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under-8k', label: 'Under Rs. 8,000', min: 0, max: 8000 },
  { id: '8k-10k', label: 'Rs. 8,000 – Rs. 10,000', min: 8000, max: 10000 },
  { id: '10k-13k', label: 'Rs. 10,000 – Rs. 13,000', min: 10000, max: 13000 },
  { id: 'above-13k', label: 'Above Rs. 13,000', min: 13000, max: Infinity }
];

// Curated hex fallback mapping for natural fabric & dye names
const COLOR_HEX_MAP = {
  black: '#1a1814',
  onyx: '#1e1c1b',
  white: '#ffffff',
  ivory: '#f8f6f0',
  cream: '#f2ece1',
  beige: '#d8ccb8',
  emerald: '#16503c',
  green: '#246b4e',
  sage: '#688c75',
  olive: '#556b2f',
  wine: '#582138',
  burgundy: '#5a1827',
  plum: '#4e223c',
  maroon: '#4a1525',
  red: '#a82c35',
  rust: '#8c3d26',
  ruby: '#9b111e',
  pink: '#d9869b',
  rose: '#c97284',
  blush: '#e3b3b8',
  mauve: '#915f6d',
  blue: '#2c5282',
  navy: '#1a2744',
  teal: '#1b4d5a',
  peacock: '#164e59',
  glacier: '#8faec2',
  yellow: '#d49b28',
  mustard: '#c48b28',
  gold: '#c5a880',
  ochre: '#633d26',
  saffron: '#d49b28',
  purple: '#5e3a6e',
  violet: '#634b82',
  lavender: '#9d8bb8',
  grey: '#7a7672',
  gray: '#7a7672',
  charcoal: '#2e2c2a',
  brown: '#4a3325'
};

export function resolveColorHex(colorName = '', explicitHex = null) {
  if (explicitHex && typeof explicitHex === 'string' && explicitHex.startsWith('#')) {
    return explicitHex;
  }
  const clean = String(colorName).toLowerCase();
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (clean.includes(key)) {
      return hex;
    }
  }
  return '#c5a880';
}

export default function ProductFilters({
  isOpen,
  onClose,
  products = [],
  // Categories (Multi-select)
  selectedCategories = [],
  onToggleCategory,
  // Availability
  selectedAvailability = 'all', // 'all' | 'in_stock' | 'out_of_stock'
  onSelectAvailability,
  // Price
  selectedPriceRange = 'all',
  onSelectPriceRange,
  customPriceMin = '',
  customPriceMax = '',
  onChangePriceMin,
  onChangePriceMax,
  // Sizes (Multi-select)
  selectedSizes = [],
  onToggleSize,
  // Colors (Multi-select)
  selectedColors = [],
  onToggleColor,
  // Fabrics (Multi-select)
  selectedFabrics = [],
  onToggleFabric,
  // Reset & Metrics
  onResetFilters,
  totalResultsCount = 0
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Dynamically extract real available filters and counts from actual products
  const {
    availableCategories,
    availableSizes,
    availableColors,
    availableFabrics,
    stockCounts,
    minCatalogPrice,
    maxCatalogPrice
  } = useMemo(() => {
    // 1. Categories
    const canonicalCategories = [
      { id: 'ready-to-wear', label: 'Ready to Wear' },
      { id: 'unstitched', label: 'Unstitched' },
      { id: 'luxury-pret', label: 'Luxury Prêt' },
      { id: 'party-wear', label: 'Party Wear / Formal' },
      { id: 'summer', label: 'Summer' },
      { id: 'winter', label: 'Winter' },
      { id: 'festive', label: 'Festive' }
    ];

    const catCounts = {};
    canonicalCategories.forEach((c) => { catCounts[c.id] = 0; });

    // 2. Sizes
    const sizeMap = new Map(); // size -> count
    const preferredSizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Unstitched', 'Free Size'];

    // 3. Colors
    const colorMap = new Map(); // name -> { name, hex, count }

    // 4. Fabrics
    const fabricMap = new Map(); // fabric -> count

    // 5. Stock
    let inStockCount = 0;
    let outOfStockCount = 0;

    // 6. Price
    let minP = Infinity;
    let maxP = 0;

    products.forEach((p) => {
      // Check category match
      canonicalCategories.forEach((c) => {
        const catId = c.id;
        const cLower = catId.toLowerCase();
        const inCols = Array.isArray(p.collections) && p.collections.some((col) => {
          const cl = String(col).toLowerCase().trim();
          return cl === cLower || cl === cLower.replace(/-/g, ' ');
        });
        const catF = (p.category || '').toLowerCase().trim();
        const occF = (p.occasion || '').toLowerCase().trim();
        const tagF = (p.tag || '').toLowerCase().trim();
        const fabF = (p.fabric || '').toLowerCase().trim();
        const fabCat = (p.fabricCategory || '').toLowerCase().trim();

        let matches = false;
        if (catId === 'ready-to-wear') matches = catF === 'ready-to-wear' || occF.includes('ready to wear') || inCols;
        else if (catId === 'unstitched') matches = catF === 'unstitched' || (Array.isArray(p.sizes) && p.sizes.some((s) => String(s).toLowerCase().includes('unstitched'))) || inCols;
        else if (catId === 'luxury-pret') matches = catF === 'luxury-pret' || occF.includes('luxury') || inCols;
        else if (catId === 'party-wear') matches = catF === 'party-wear' || catF === 'festive' || occF.includes('party') || occF.includes('festive') || occF.includes('formal') || inCols;
        else if (catId === 'summer') matches = catF === 'summer' || fabCat.includes('lawn') || fabF.includes('lawn') || inCols;
        else if (catId === 'winter') matches = catF === 'winter' || catF === 'winter-collection' || tagF.includes('winter') || inCols;
        else if (catId === 'festive') matches = catF === 'festive' || catF === 'party-wear' || occF.includes('festive') || tagF.includes('festive') || inCols;
        else matches = catF === catId || occF === catId || inCols;

        if (matches) {
          catCounts[catId] = (catCounts[catId] || 0) + 1;
        }
      });

      // Sizes
      const pSizes = new Set();
      if (Array.isArray(p.sizes)) {
        p.sizes.forEach((s) => { if (s) pSizes.add(String(s).trim()); });
      }
      if (Array.isArray(p.variants)) {
        p.variants.forEach((v) => { if (v.size) pSizes.add(String(v.size).trim()); });
      }
      pSizes.forEach((s) => {
        sizeMap.set(s, (sizeMap.get(s) || 0) + 1);
      });

      // Colors
      const pColors = new Map();
      if (Array.isArray(p.colors)) {
        p.colors.forEach((c) => {
          if (typeof c === 'string' && c.trim()) {
            const name = c.trim();
            pColors.set(name, resolveColorHex(name, null));
          } else if (c && c.name && typeof c.name === 'string') {
            const name = c.name.trim();
            pColors.set(name, resolveColorHex(name, c.hex));
          }
        });
      }
      if (Array.isArray(p.variants)) {
        p.variants.forEach((v) => {
          const name = (v.color_name || v.color || '').trim();
          if (name) {
            pColors.set(name, resolveColorHex(name, v.color_hex));
          }
        });
      }
      if (p.color && typeof p.color === 'string' && p.color.trim()) {
        const name = p.color.trim();
        pColors.set(name, resolveColorHex(name, null));
      }

      pColors.forEach((hex, name) => {
        if (!colorMap.has(name)) {
          colorMap.set(name, { name, hex, count: 1 });
        } else {
          colorMap.get(name).count += 1;
        }
      });

      // Fabrics
      const pFabrics = new Set();
      if (p.fabricCategory && typeof p.fabricCategory === 'string') {
        pFabrics.add(p.fabricCategory.trim());
      }
      if (p.fabric && typeof p.fabric === 'string') {
        const short = p.fabric.split(/[,.]/)[0].trim();
        if (short && short.length <= 25 && !short.toLowerCase().includes('with') && !short.toLowerCase().includes('digital')) {
          pFabrics.add(short);
        }
      }
      pFabrics.forEach((f) => {
        fabricMap.set(f, (fabricMap.get(f) || 0) + 1);
      });

      // Stock
      const inSt = p.inStock === true || (p.stockCount !== undefined && p.stockCount > 0);
      if (inSt) inStockCount++;
      else outOfStockCount++;

      // Price
      const pr = Number(p.price) || 0;
      if (pr > 0) {
        if (pr < minP) minP = pr;
        if (pr > maxP) maxP = pr;
      }
    });

    const sortedSizes = Array.from(sizeMap.entries())
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => {
        const idxA = preferredSizeOrder.indexOf(a.size);
        const idxB = preferredSizeOrder.indexOf(b.size);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.size.localeCompare(b.size);
      });

    const sortedColors = Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count);

    const sortedFabrics = Array.from(fabricMap.entries())
      .map(([fabric, count]) => ({ fabric, count }))
      .sort((a, b) => b.count - a.count);

    const categoriesWithCounts = canonicalCategories.map((c) => ({
      ...c,
      count: catCounts[c.id] || 0
    }));

    return {
      availableCategories: categoriesWithCounts,
      availableSizes: sortedSizes,
      availableColors: sortedColors,
      availableFabrics: sortedFabrics,
      stockCounts: { inStock: inStockCount, outOfStock: outOfStockCount },
      minCatalogPrice: minP === Infinity ? 0 : minP,
      maxCatalogPrice: maxP === 0 ? 25000 : maxP
    };
  }, [products]);

  if (!isOpen) return null;

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
    <div 
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: 'rgba(18, 18, 18, 0.65)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div 
        className="w-full sm:w-[420px] max-w-full h-full bg-[#ffffff] flex flex-col shadow-2xl relative animate-slide-left select-none text-[#1a1814]"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: 'var(--font-family-primary)' }}
      >
        {/* 1. Header */}
        <header className="px-5 py-4 border-b border-[#ede8de] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={17} className="text-[#1a1814]" />
            <h2 
              className="text-base sm:text-lg font-medium tracking-[0.06em] uppercase text-[#1a1814]"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              Filter Products
            </h2>
            {activeFiltersCount > 0 && (
              <span className="bg-[#1a1814] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wider">
                {activeFiltersCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-[11px] uppercase tracking-[0.14em] font-medium text-[#8c867f] hover:text-[#1a1814] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} /> Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="w-8 h-8 rounded-full bg-[#f6ece4] hover:bg-[#faede5] text-[#1a1814] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7 scrollbar-thin">
          
          {/* Section: Category */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1814]">
                Category
              </span>
              {selectedCategories.length > 0 && (
                <span className="text-[10px] text-[#8c867f]">
                  {selectedCategories.length} selected
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-1.5">
              {availableCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onToggleCategory(cat.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded text-[12px] tracking-[0.04em] flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1814] text-white font-medium shadow-xs'
                        : 'bg-[#faf8f5] hover:bg-[#f5ede5] text-[#3a3530]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-white border-white text-[#1a1814]' : 'border-[#d6cebf] bg-white'
                      }`}>
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span>{cat.label}</span>
                    </div>
                    <span className={`text-[10.5px] ${isSelected ? 'text-neutral-300' : 'text-[#8c867f]'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Availability */}
          <div className="space-y-3 pt-2 border-t border-[#ede8de]">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1814] block">
              Availability
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectAvailability(selectedAvailability === 'in_stock' ? 'all' : 'in_stock')}
                className={`px-3 py-2.5 rounded text-[11.5px] uppercase tracking-[0.1em] font-medium flex items-center justify-between transition-all cursor-pointer ${
                  selectedAvailability === 'in_stock'
                    ? 'bg-[#1a1814] text-white shadow-xs'
                    : 'bg-[#faf8f5] hover:bg-[#f5ede5] text-[#3a3530] border border-[#eee7dc]'
                }`}
              >
                <span>In Stock</span>
                <span className={`text-[10px] ${selectedAvailability === 'in_stock' ? 'text-neutral-300' : 'text-[#8c867f]'}`}>
                  ({stockCounts.inStock})
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectAvailability(selectedAvailability === 'out_of_stock' ? 'all' : 'out_of_stock')}
                className={`px-3 py-2.5 rounded text-[11.5px] uppercase tracking-[0.1em] font-medium flex items-center justify-between transition-all cursor-pointer ${
                  selectedAvailability === 'out_of_stock'
                    ? 'bg-[#1a1814] text-white shadow-xs'
                    : 'bg-[#faf8f5] hover:bg-[#f5ede5] text-[#3a3530] border border-[#eee7dc]'
                }`}
              >
                <span>Out of Stock</span>
                <span className={`text-[10px] ${selectedAvailability === 'out_of_stock' ? 'text-neutral-300' : 'text-[#8c867f]'}`}>
                  ({stockCounts.outOfStock})
                </span>
              </button>
            </div>
          </div>

          {/* Section: Price Range */}
          <div className="space-y-3 pt-2 border-t border-[#ede8de]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1814]">
                Price (PKR)
              </span>
              {(selectedPriceRange !== 'all' || customPriceMin !== '' || customPriceMax !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectPriceRange('all');
                    if (onChangePriceMin) onChangePriceMin('');
                    if (onChangePriceMax) onChangePriceMax('');
                  }}
                  className="text-[10px] uppercase tracking-wider text-[#8c867f] hover:text-[#1a1814]"
                >
                  Reset Price
                </button>
              )}
            </div>

            {/* Custom Min-Max Inputs */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8c867f] tracking-wider uppercase font-semibold">
                  Min Rs.
                </span>
                <input
                  type="number"
                  placeholder={String(minCatalogPrice)}
                  value={customPriceMin}
                  onChange={(e) => {
                    if (onChangePriceMin) onChangePriceMin(e.target.value);
                    onSelectPriceRange('custom');
                  }}
                  className="w-full pl-15 pr-2.5 py-2 text-[12px] bg-[#faf8f5] border border-[#e8e0d5] focus:border-[#1a1814] focus:bg-white rounded outline-none transition-all"
                />
              </div>

              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8c867f] tracking-wider uppercase font-semibold">
                  Max Rs.
                </span>
                <input
                  type="number"
                  placeholder={String(maxCatalogPrice)}
                  value={customPriceMax}
                  onChange={(e) => {
                    if (onChangePriceMax) onChangePriceMax(e.target.value);
                    onSelectPriceRange('custom');
                  }}
                  className="w-full pl-15 pr-2.5 py-2 text-[12px] bg-[#faf8f5] border border-[#e8e0d5] focus:border-[#1a1814] focus:bg-white rounded outline-none transition-all"
                />
              </div>
            </div>

            {/* Quick Price Bracket Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRICE_RANGES.map((pr) => {
                const isSelected = selectedPriceRange === pr.id && customPriceMin === '' && customPriceMax === '';
                return (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => {
                      onSelectPriceRange(isSelected ? 'all' : pr.id);
                      if (onChangePriceMin) onChangePriceMin('');
                      if (onChangePriceMax) onChangePriceMax('');
                    }}
                    className={`px-2.5 py-1.5 rounded text-[11px] tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1814] text-white font-medium'
                        : 'bg-[#faf8f5] text-[#554f48] hover:bg-[#f5ede5] border border-[#ede5d8]'
                    }`}
                  >
                    {pr.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Size */}
          <div className="space-y-3 pt-2 border-t border-[#ede8de]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1814]">
                Size
              </span>
              {selectedSizes.length > 0 && (
                <span className="text-[10px] text-[#8c867f]">
                  {selectedSizes.length} selected
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map(({ size, count }) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onToggleSize(size)}
                    className={`min-w-[48px] h-9 px-2.5 rounded text-[11px] font-medium uppercase tracking-[0.08em] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1814] text-white shadow-xs'
                        : 'bg-[#faf8f5] text-[#2c2824] hover:bg-[#f5ede5] border border-[#e5ded2]'
                    }`}
                  >
                    <span>{size}</span>
                    <span className={`text-[9px] ${isSelected ? 'text-neutral-300' : 'text-[#8c867f]'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Color Palette */}
          {availableColors.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#ede8de]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1814]">
                  Color Palette
                </span>
                {selectedColors.length > 0 && (
                  <span className="text-[10px] text-[#8c867f]">
                    {selectedColors.length} selected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {availableColors.map((color) => {
                  const isSelected = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => onToggleColor(color.name)}
                      className={`text-left px-2.5 py-2 rounded text-[11px] flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1a1814] text-white font-medium'
                          : 'bg-[#faf8f5] hover:bg-[#f5ede5] text-[#3a3530] border border-[#eee7dc]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span 
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="truncate">{color.name}</span>
                      </div>
                      <span className={`text-[9.5px] shrink-0 ${isSelected ? 'text-neutral-300' : 'text-[#8c867f]'}`}>
                        {color.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Fabric */}
          {availableFabrics.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#ede8de]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1814]">
                  Fabric
                </span>
                {selectedFabrics.length > 0 && (
                  <span className="text-[10px] text-[#8c867f]">
                    {selectedFabrics.length} selected
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {availableFabrics.map(({ fabric, count }) => {
                  const isSelected = selectedFabrics.includes(fabric);
                  return (
                    <button
                      key={fabric}
                      type="button"
                      onClick={() => onToggleFabric(fabric)}
                      className={`w-full text-left px-3 py-2 rounded text-[11.5px] flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1a1814] text-white font-medium'
                          : 'bg-[#faf8f5] hover:bg-[#f5ede5] text-[#3a3530]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-white border-white text-[#1a1814]' : 'border-[#d6cebf] bg-white'
                        }`}>
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span>{fabric}</span>
                      </div>
                      <span className={`text-[10px] ${isSelected ? 'text-neutral-300' : 'text-[#8c867f]'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* 3. Sticky Footer Action Bar */}
        <footer className="p-4 sm:p-5 border-t border-[#ede8de] bg-white space-y-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-[#1a1814] hover:bg-[#c5a880] text-white text-[12px] font-semibold tracking-[0.16em] uppercase rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Check size={15} />
            <span>Show {totalResultsCount} {totalResultsCount === 1 ? 'Piece' : 'Pieces'}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="w-full py-2 text-[11px] text-[#8c867f] hover:text-[#1a1814] tracking-[0.14em] uppercase font-medium transition-colors cursor-pointer text-center block"
            >
              Clear All Filters
            </button>
          )}
        </footer>

      </div>
    </div>
  );
}
