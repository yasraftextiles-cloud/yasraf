import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, Edit2, Trash2, Eye, EyeOff, 
  AlertTriangle, CheckCircle, Package, ArrowUpDown, Loader2, Sparkles 
} from 'lucide-react';
import { toggleProductPublish, deleteProduct } from '../services/supabaseService.js';

export default function AdminDashboard({ 
  products = [], 
  isLoading = false, 
  onRefresh, 
  onAddNewProduct, 
  onEditProduct 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'low_stock'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // 1. Calculate Real Overview Metrics
  const stats = useMemo(() => {
    let total = products.length;
    let published = 0;
    let drafts = 0;
    let lowStockCount = 0;

    products.forEach((p) => {
      if (p.isPublished) published += 1;
      else drafts += 1;

      // Check if total stock <= 5 or any variant <= 5
      const stock = p.stockCount ?? 0;
      const hasLowStockVariant = p.variants?.some((v) => parseInt(v.stock, 10) <= 5);
      if (stock <= 5 || hasLowStockVariant) {
        lowStockCount += 1;
      }
    });

    return { total, published, drafts, lowStockCount };
  }, [products]);

  // 2. Filtered & Sorted Product List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        p.title?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.id?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query);

      // Status match
      let matchesStatus = true;
      if (statusFilter === 'published') matchesStatus = p.isPublished === true;
      if (statusFilter === 'draft') matchesStatus = p.isPublished === false;
      if (statusFilter === 'low_stock') {
        const stock = p.stockCount ?? 0;
        const hasLowVariant = p.variants?.some((v) => parseInt(v.stock, 10) <= 5);
        matchesStatus = stock <= 5 || hasLowVariant;
      }

      // Category match
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  // 3. Quick Toggle Publish Handler
  const handleTogglePublish = async (product) => {
    setUpdatingId(product.id);
    setActionError(null);
    try {
      await toggleProductPublish(product.id, !product.isPublished);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Toggle publish failed:', err);
      setActionError(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. Delete Product Handler
  const handleDeleteProduct = async (id) => {
    setUpdatingId(id);
    setActionError(null);
    try {
      await deleteProduct(id);
      setDeleteConfirmId(null);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Delete product failed:', err);
      setActionError(`Failed to delete product: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#ebe6e0]">
        <div>
          <h1 
            className="text-2xl sm:text-3xl text-[#1a1814] font-normal tracking-wide"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            Catalog & Products
          </h1>
          <p className="text-[12.5px] text-[#524d47] mt-0.5">
            Manage your luxury prêt ensembles, photography, sizes, colors and inventory.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onAddNewProduct}
          className="admin-btn-primary h-11 px-6 text-[12px] shadow-sm shrink-0"
        >
          <Plus size={16} />
          <span>Add New Dress</span>
        </button>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-3.5 bg-[#fdf2f2] border border-[#f5c6cb] text-[#721c24] text-[12.5px] flex items-center justify-between shadow-2xs">
          <span>{actionError}</span>
          <button 
            type="button"
            onClick={() => setActionError(null)} 
            className="text-sm font-semibold px-2 cursor-pointer hover:text-black transition-colors"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Real Data Overview Metric Cards (Clean sans-serif counts for zero 1 vs I confusion) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Products */}
        <div className="bg-white p-5 border border-[#ebe6e0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#524d47]">
              Total Designs
            </span>
            <div className="w-8 h-8 rounded-full bg-[#c5a880]/15 flex items-center justify-center">
              <Package size={16} className="text-[#8e704b]" />
            </div>
          </div>
          <div 
            className="text-[30px] font-semibold text-[#1a1814] leading-tight" 
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            {stats.total}
          </div>
          <div className="text-[11.5px] text-[#67615c] mt-1 font-normal">
            In atelier catalog
          </div>
        </div>

        {/* Card 2: Published */}
        <div className="bg-white p-5 border border-[#ebe6e0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#524d47]">
              Published
            </span>
            <div className="w-8 h-8 rounded-full bg-[#2c6e56]/15 flex items-center justify-center">
              <CheckCircle size={16} className="text-[#1b533f]" />
            </div>
          </div>
          <div 
            className="text-[30px] font-semibold text-[#1b533f] leading-tight" 
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            {stats.published}
          </div>
          <div className="text-[11.5px] text-[#67615c] mt-1 font-normal">
            Live on storefront
          </div>
        </div>

        {/* Card 3: Drafts */}
        <div className="bg-white p-5 border border-[#ebe6e0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#524d47]">
              Drafts
            </span>
            <div className="w-8 h-8 rounded-full bg-neutral-200/70 flex items-center justify-center">
              <EyeOff size={16} className="text-[#524d47]" />
            </div>
          </div>
          <div 
            className="text-[30px] font-semibold text-[#524d47] leading-tight" 
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            {stats.drafts}
          </div>
          <div className="text-[11.5px] text-[#67615c] mt-1 font-normal">
            Hidden from public
          </div>
        </div>

        {/* Card 4: Low Stock Variants */}
        <div className="bg-white p-5 border border-[#ebe6e0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#524d47]">
              Low Stock
            </span>
            <div className="w-8 h-8 rounded-full bg-[#b46146]/15 flex items-center justify-center">
              <AlertTriangle size={16} className="text-[#a4422e]" />
            </div>
          </div>
          <div 
            className="text-[30px] font-semibold text-[#a4422e] leading-tight" 
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            {stats.lowStockCount}
          </div>
          <div className="text-[11.5px] text-[#67615c] mt-1 font-normal">
            5 or fewer units left
          </div>
        </div>

      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white border border-[#ebe6e0] p-4 flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between shadow-2xs">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c867f]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU, or category..."
            className="w-full pl-9 pr-4 py-2 text-[12.5px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] placeholder-[#8c867f] focus:bg-white focus:border-[#c5a880] focus:ring-2 focus:ring-[#c5a880]/30 focus:outline-none transition-all duration-150"
          />
        </div>

        {/* Filter Pills Group */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#faf8f6] p-1 border border-[#ebe6e0]">
          {[
            { id: 'all', label: 'All', count: stats.total },
            { id: 'published', label: 'Published', count: stats.published },
            { id: 'draft', label: 'Drafts', count: stats.drafts },
            { id: 'low_stock', label: 'Low Stock', count: stats.lowStockCount }
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold border transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#c5a880] ${
                  isSelected
                    ? 'border-[#1a1814] bg-[#1a1814] text-white shadow-xs'
                    : 'border-transparent bg-transparent text-[#524d47] hover:bg-white hover:text-[#1a1814] hover:border-[#ebe6e0]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-xs ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200/70 text-[#524d47]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. Products Table */}
      <div className="bg-white border border-[#ebe6e0] overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#8c867f] gap-3">
            <Loader2 size={24} className="animate-spin text-[#c5a880]" />
            <span className="text-[12px] tracking-wider uppercase font-medium">Loading Atelier Catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Package size={36} className="mx-auto text-[#c5a880] mb-3 stroke-1" />
            <h3 
              className="text-xl text-[#1a1814] font-normal mb-1"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              No Products Found
            </h3>
            <p className="text-[12.5px] text-[#67615c] max-w-sm mx-auto mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search query or status filter.' 
                : 'Your catalog is currently empty. Add your first luxury design to get started.'}
            </p>
            <button
              type="button"
              onClick={onAddNewProduct}
              className="admin-btn-primary px-5 py-2.5 text-[11.5px]"
            >
              <Plus size={15} />
              <span>Create First Product</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ebe6e0] bg-[#faf8f6] text-[10.5px] uppercase tracking-[0.18em] text-[#524d47] font-semibold select-none">
                  <th className="py-3.5 px-4 w-20">Preview</th>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price (PKR)</th>
                  <th className="py-3.5 px-4">Total Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebe6e0] text-[12.5px]">
                {filteredProducts.map((p) => {
                  const isUpdating = updatingId === p.id;
                  const discountPercent = p.originalPrice 
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) 
                    : 0;
                  const isLowStock = (p.stockCount ?? 0) <= 5;
                  
                  // Inspect SKU field mapping: show saved business SKU if available, never substitute an internal product ID
                  const rawSku = (p.sku && p.sku.trim()) ? p.sku.trim() : (p.variants?.[0]?.sku?.trim() || '');
                  const isInternalUuid = rawSku.startsWith('yas-') && rawSku.length > 20;
                  const displaySku = isInternalUuid ? null : (rawSku || null);

                  return (
                    <tr 
                      key={p.id} 
                      className="hover:bg-[#faf8f6]/80 transition-colors group"
                    >
                      {/* Thumbnail: enlarged with preserved proportion */}
                      <td className="py-3.5 px-4">
                        <div className="w-14 h-[72px] bg-[#ebe6e0] border border-[#ebe6e0] overflow-hidden shrink-0 relative rounded-none shadow-2xs">
                          <img
                            src={p.image || '/products/yasraf-meerab-black-1.png'}
                            alt={p.title}
                            className="w-full h-full object-cover object-[center_18%]"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/products/yasraf-meerab-black-1.png';
                            }}
                          />
                        </div>
                      </td>

                      {/* Title & SKU */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div 
                          className="font-semibold text-[13.5px] text-[#1a1814] truncate hover:text-[#b46146] transition-colors cursor-pointer"
                          onClick={() => onEditProduct(p)}
                          title={p.title}
                        >
                          {p.title}
                        </div>
                        <div className="text-[11px] text-[#524d47] flex items-center gap-2 mt-1">
                          <span title={displaySku ? `Business SKU: ${displaySku}` : `Internal ID: ${p.id}`}>
                            SKU: {displaySku ? <strong className="font-mono text-[#1a1814]">{displaySku}</strong> : <span className="text-[#8c867f]">—</span>}
                          </span>
                          {p.subheading && (
                            <>
                              <span className="text-[#8c867f]">•</span>
                              <span className="uppercase text-[10px] tracking-wider text-[#8e704b] font-medium">{p.subheading}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[#524d47] text-[11.5px] uppercase tracking-wide font-medium">
                          {p.categoryLabel || p.category || 'Luxury Prêt'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#1a1814] text-[13px]">
                          Rs. {Number(p.price || 0).toLocaleString()}
                        </div>
                        {p.originalPrice && (
                          <div className="text-[11px] text-[#8c867f] line-through mt-0.5">
                            Rs. {Number(p.originalPrice).toLocaleString()}
                            {discountPercent > 0 && (
                              <span className="ml-1 text-[#b46146] no-underline font-medium">
                                (-{discountPercent}%)
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${isLowStock ? 'text-[#a4422e]' : 'text-[#1a1814]'}`}>
                            {p.stockCount ?? 0} units
                          </span>
                          {isLowStock && (
                            <span className="text-[9.5px] uppercase tracking-wider bg-[#b46146]/10 text-[#a4422e] px-1.5 py-0.5 font-bold border border-[#b46146]/20">
                              Low
                            </span>
                          )}
                        </div>
                        <div className="text-[10.5px] text-[#67615c] mt-0.5">
                          {p.variants?.length ? `${p.variants.length} variant(s)` : 'Standard'}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(p)}
                          disabled={isUpdating}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] transition-all duration-150 cursor-pointer border rounded-none focus:outline-none focus:ring-1 focus:ring-[#c5a880] ${
                            p.isPublished
                              ? 'bg-[#2c6e56]/10 border-[#2c6e56]/30 text-[#1b533f] hover:bg-[#2c6e56]/20'
                              : 'bg-[#faf8f6] border-[#d6cfc7] text-[#524d47] hover:bg-[#ebe6e0]'
                          }`}
                          title={`Click to ${p.isPublished ? 'unpublish' : 'publish'} this product`}
                        >
                          {isUpdating ? (
                            <Loader2 size={11} className="animate-spin text-[#c5a880]" />
                          ) : p.isPublished ? (
                            <CheckCircle size={11} className="text-[#1b533f]" />
                          ) : (
                            <EyeOff size={11} className="text-[#67615c]" />
                          )}
                          <span>{p.isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditProduct(p)}
                            className="admin-icon-btn-edit"
                            title="Edit Product"
                            aria-label={`Edit ${p.title}`}
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="admin-icon-btn-delete"
                            title="Delete Product"
                            aria-label={`Delete ${p.title}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#ebe6e0] max-w-md w-full p-6 text-left shadow-xl space-y-4">
            <h3 
              className="text-xl text-[#1a1814] font-normal"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              Delete Product Design?
            </h3>
            <p className="text-[12.5px] text-[#524d47] leading-relaxed">
              Are you sure you want to delete this piece? This action will permanently remove the product and all associated size/color variants from your catalog.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="admin-btn-secondary px-4 py-2 text-[11.5px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                disabled={updatingId === deleteConfirmId}
                className="admin-btn-danger px-4 py-2 text-[11.5px]"
              >
                {updatingId === deleteConfirmId && <Loader2 size={13} className="animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
