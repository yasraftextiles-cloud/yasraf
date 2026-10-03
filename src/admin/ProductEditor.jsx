import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, Upload, Trash2, MoveLeft, MoveRight, 
  Check, AlertCircle, Loader2, Eye, EyeOff, Plus, ExternalLink 
} from 'lucide-react';
import { uploadProductImage, saveProduct, getCollections } from '../services/supabaseService.js';
import { supabase } from '../lib/supabase.js';

const DEFAULT_CATEGORIES = [
  { id: 'luxury-pret', label: 'Luxury Prêt' },
  { id: 'ready-to-wear', label: 'Ready to Wear' },
  { id: 'party-wear', label: 'Party Wear' },
  { id: 'winter-collection', label: 'Winter Collection' }
];

const BASE_COLLECTIONS = [
  { id: 'new-in', label: 'New In' },
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'ready-to-wear', label: 'Ready to Wear' },
  { id: 'luxury-pret', label: 'Luxury Prêt' },
  { id: 'party-wear', label: 'Party Wear' },
  { id: 'winter-collection', label: 'Winter Collection' }
];

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export default function ProductEditor({ 
  product = null, 
  allProducts = [], 
  onSaveSuccess, 
  onCancel 
}) {
  const isEditing = Boolean(product && product.id);

  // Available collections list (merged from DB and defaults)
  const [availableCollections, setAvailableCollections] = useState(BASE_COLLECTIONS);

  // 1. Basic Information
  const [title, setTitle] = useState(product?.title || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [subheading, setSubheading] = useState(product?.subheading || 'HAUTE COUTURE');
  const [category, setCategory] = useState(product?.category || 'luxury-pret');
  
  // 2. Multiple Collections (Initialized correctly from array or JSON string)
  const [collections, setCollections] = useState(() => {
    if (!product) return ['new-in'];
    if (Array.isArray(product.collections)) return [...product.collections];
    if (typeof product.collections === 'string') {
      try {
        const parsed = JSON.parse(product.collections);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [product.collections];
      }
    }
    return [];
  });

  // 3. Pricing
  const [price, setPrice] = useState(() => {
    if (product?.price !== undefined && product?.price !== null) return String(product.price);
    return '';
  });
  const [originalPrice, setOriginalPrice] = useState(() => {
    const orig = product?.originalPrice ?? product?.original_price;
    if (orig !== undefined && orig !== null) return String(orig);
    return '';
  });

  // 4. Photography & Media
  const [images, setImages] = useState(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      return product.gallery.filter(Boolean);
    }
    if (typeof product.images === 'string' && product.images.trim()) {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        return [product.images.trim()];
      }
    }
    if (product.image) return [product.image];
    return [];
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // 5. Colors & Swatches
  const [colors, setColors] = useState(() => {
    if (!product) return [];
    let list = [];
    if (Array.isArray(product.colors)) {
      list = product.colors
        .map((c) => ({
          name: typeof c === 'string' ? c : (c?.name || ''),
          hex: typeof c === 'object' && c?.hex ? c.hex : '#1a1814'
        }))
        .filter((c) => Boolean(c.name && c.name.toLowerCase() !== 'default' && c.name.toLowerCase() !== 'original'));
    } else if (typeof product.colors === 'string') {
      try {
        const parsed = JSON.parse(product.colors);
        if (Array.isArray(parsed)) {
          list = parsed
            .map((c) => ({
              name: typeof c === 'string' ? c : (c?.name || ''),
              hex: typeof c === 'object' && c?.hex ? c.hex : '#1a1814'
            }))
            .filter((c) => Boolean(c.name && c.name.toLowerCase() !== 'default' && c.name.toLowerCase() !== 'original'));
        }
      } catch {
        // ignore
      }
    }
    // If no colors in product.colors, derive from variants
    if (list.length === 0) {
      const vars = product.variants || product.product_variants || [];
      const distinct = [...new Set(vars.map((v) => v.color).filter(Boolean))].filter(
        (c) => c.toLowerCase() !== 'standard' && c.toLowerCase() !== 'default' && c.toLowerCase() !== 'original'
      );
      list = distinct.map((name) => ({ name, hex: '#1a1814' }));
    }
    return list;
  });
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#800000');
  const [colorError, setColorError] = useState(null);

  // 6. Sizes
  const [selectedSizes, setSelectedSizes] = useState(() => {
    if (product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      return [...product.sizes];
    }
    const vars = product?.variants || product?.product_variants || [];
    if (vars.length > 0) {
      const distinctSizes = [...new Set(vars.map((v) => v.size).filter(Boolean))];
      if (distinctSizes.length > 0) return distinctSizes;
    }
    return ['S', 'M', 'L'];
  });
  const [includeUnstitched, setIncludeUnstitched] = useState(() => {
    const inSizes = Boolean(product?.sizes?.includes('Unstitched'));
    const vars = product?.variants || product?.product_variants || [];
    const inVars = vars.some((v) => v.size === 'Unstitched');
    return inSizes || inVars;
  });

  // Keep a reference to the initial variants loaded from the product record
  const initialVariantsRef = React.useRef(product?.variants || product?.product_variants || []);
  const isVariantsInitializedRef = React.useRef(false);

  // 7. Variants Matrix & SKU Validation State
  const [variants, setVariants] = useState(() => {
    const rawVars = product?.variants || product?.product_variants || [];
    if (rawVars.length > 0) {
      return rawVars.map((v) => ({
        id: v.id || null,
        sku: v.sku || '',
        size: v.size || 'M',
        color: v.color || 'Standard',
        stock: v.stock !== undefined && v.stock !== null ? Number(v.stock) : 10,
        price: v.price !== undefined && v.price !== null && v.price !== '' ? Number(v.price) : (product.price ? Number(product.price) : null)
      }));
    }
    return [];
  });
  const [skuErrors, setSkuErrors] = useState({}); // { [variantIndex]: "Error message" }

  // 8. Content & Product Details
  const [description, setDescription] = useState(product?.description || '');
  const [fabric, setFabric] = useState(product?.fabric || 'Luxury Egyptian Lawn & Pure Silk');
  const [includes, setIncludes] = useState(product?.includes || 'Embroidered Shirt (3.15m), Silk Dupatta (2.5m), Dyed Trouser (2.5m)');
  const [careInstructions, setCareInstructions] = useState(product?.careInstructions || product?.care_instructions || 'Dry clean recommended to preserve hand-embellished threadwork.');
  const [sizeGuideUnit, setSizeGuideUnit] = useState(product?.sizeGuide?.unit || product?.size_guide?.unit || 'inches');
  const [relatedProductIds, setRelatedProductIds] = useState(product?.relatedProductIds || product?.related_product_ids || []);

  // 9. Publishing Status & Badges
  const [isPublished, setIsPublished] = useState(product?.isPublished ?? product?.is_published ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? product?.is_new ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? product?.is_featured ?? false);

  // UI state & Unsaved changes tracking
  const [isSaving, setIsSaving] = useState(false);
  const [savingAction, setSavingAction] = useState(null); // 'update' | 'draft' | 'publish'
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null); // { isUpdate: boolean, isPublished: boolean, productId: string, slug: string }
  const [isDirty, setIsDirty] = useState(false);

  // Load active collections from Supabase on mount
  useEffect(() => {
    async function loadCollectionsList() {
      try {
        const dbCols = await getCollections();
        if (dbCols && dbCols.length > 0) {
          const map = new Map();
          BASE_COLLECTIONS.forEach((c) => map.set(c.id, c));
          dbCols.forEach((c) => {
            const id = c.slug || c.id;
            map.set(id, { id, label: c.title || id });
          });
          setAvailableCollections(Array.from(map.values()));
        }
      } catch (err) {
        console.warn('Could not load dynamic collections:', err);
      }
    }
    loadCollectionsList();
  }, []);

  // Auto-generate slug from title if new product
  useEffect(() => {
    if (!isEditing && title && !slug) {
      const generated = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  }, [title, isEditing, slug]);

  // Synchronize 'Unstitched' with selectedSizes
  useEffect(() => {
    setSelectedSizes((prev) => {
      const hasUnstitched = prev.includes('Unstitched');
      if (includeUnstitched && !hasUnstitched) {
        return [...prev, 'Unstitched'];
      }
      if (!includeUnstitched && hasUnstitched) {
        return prev.filter((s) => s !== 'Unstitched');
      }
      return prev;
    });
  }, [includeUnstitched]);

  // Synchronize Variants Matrix ONLY when sizes or colors explicitly change
  useEffect(() => {
    // Preserve existing variants on initial mount for edit mode
    if (!isVariantsInitializedRef.current) {
      isVariantsInitializedRef.current = true;
      if (isEditing && variants.length > 0) {
        return;
      }
    }

    const currentBasePrice = Number(price) || 0;
    const cleanSlug = (slug || title || 'yas')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .toUpperCase()
      .substring(0, 8) || 'YAS';

    setVariants((prevVariants) => {
      const nextVariants = [];

      selectedSizes.forEach((size) => {
        if (colors.length === 0) {
          // If no colors added, match standard variant
          const existing = prevVariants.find(
            (v) => v.size === size && (!v.color || v.color.toLowerCase() === 'standard' || v.color.toLowerCase() === 'default')
          ) || initialVariantsRef.current.find(
            (v) => v.size === size && (!v.color || v.color.toLowerCase() === 'standard' || v.color.toLowerCase() === 'default')
          );

          if (existing) {
            nextVariants.push({
              id: existing.id || null,
              sku: existing.sku || `YAS-${cleanSlug}-${size.replace(/\s+/g, '')}`,
              size: size,
              color: existing.color || 'Standard',
              stock: existing.stock !== undefined ? Number(existing.stock) : 10,
              price: existing.price !== undefined && existing.price !== null ? Number(existing.price) : currentBasePrice
            });
          } else {
            const cleanSize = size.replace(/\s+/g, '');
            nextVariants.push({
              id: null,
              sku: `YAS-${cleanSlug}-${cleanSize}`,
              size: size,
              color: 'Standard',
              stock: 10,
              price: currentBasePrice
            });
          }
        } else {
          // If colors exist, create variant for each (size, color)
          colors.forEach((color) => {
            const existing = prevVariants.find(
              (v) => v.size === size && v.color?.toLowerCase() === color.name.toLowerCase()
            ) || initialVariantsRef.current.find(
              (v) => v.size === size && v.color?.toLowerCase() === color.name.toLowerCase()
            );

            if (existing) {
              nextVariants.push({
                id: existing.id || null,
                sku: existing.sku || `YAS-${cleanSlug}-${size.replace(/\s+/g, '')}-${color.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`,
                size: size,
                color: color.name,
                stock: existing.stock !== undefined ? Number(existing.stock) : 10,
                price: existing.price !== undefined && existing.price !== null ? Number(existing.price) : currentBasePrice
              });
            } else {
              const cleanSize = size.replace(/\s+/g, '');
              const cleanColor = color.name
                .replace(/[^a-zA-Z0-9]/g, '')
                .substring(0, 4)
                .toUpperCase() || 'COL';

              nextVariants.push({
                id: null,
                sku: `YAS-${cleanSlug}-${cleanSize}-${cleanColor}`,
                size: size,
                color: color.name,
                stock: 10,
                price: currentBasePrice
              });
            }
          });
        }
      });

      return nextVariants;
    });
  }, [selectedSizes, colors]);

  // Auto-calculate discount percentage
  const discountPercent = useMemo(() => {
    const p = parseFloat(price);
    const orig = parseFloat(originalPrice);
    if (!isNaN(p) && !isNaN(orig) && orig > p && orig > 0) {
      return Math.round(((orig - p) / orig) * 100);
    }
    return 0;
  }, [price, originalPrice]);

  // Back / Cancel handler with Unsaved Changes check
  const handleCancelClick = useCallback(() => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes in this dress form. Are you sure you want to discard them and return to the catalog?'
      );
      if (!confirmDiscard) return;
    }
    if (onCancel) onCancel();
  }, [isDirty, onCancel]);

  // 1. Multiple Collections Toggle (Unlimited selection)
  const handleToggleCollection = (colId) => {
    setIsDirty(true);
    setCollections((prev) => {
      if (prev.includes(colId)) {
        return prev.filter((c) => c !== colId);
      }
      return [...prev, colId];
    });
  };

  // 2. Colors & Swatches Handlers
  const handleAddColor = () => {
    setColorError(null);
    const trimmedName = newColorName.trim();
    if (!trimmedName) {
      setColorError('Color name cannot be blank.');
      return;
    }

    const isDuplicate = colors.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setColorError(`Color "${trimmedName}" is already added. Duplicate color names are not allowed.`);
      return;
    }

    setColors((prev) => [...prev, { name: trimmedName, hex: newColorHex }]);
    setNewColorName('');
    setIsDirty(true);
  };

  const handleRemoveColor = (targetIdx) => {
    setColors((prev) => prev.filter((_, idx) => idx !== targetIdx));
    setIsDirty(true);
  };

  const handleUpdateColorHex = (idx, hexValue) => {
    setColors((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], hex: hexValue };
      return updated;
    });
    setIsDirty(true);
  };

  // 3. Photo Upload & URL Handlers
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const publicUrl = await uploadProductImage(file);
        uploadedUrls.push(publicUrl);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
      setIsDirty(true);
    } catch (err) {
      console.error('Photo upload error:', err);
      setUploadError(err.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
      setUploadError('Please enter a valid image URL (e.g., https://example.com/dress.jpg or /products/image.jpg).');
      return;
    }

    setUploadError(null);
    setImages((prev) => [...prev, trimmed]);
    setImageUrlInput('');
    setShowUrlInput(false);
    setIsDirty(true);
  };

  const moveImage = (index, direction) => {
    const newImages = [...images];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    setImages(newImages);
    setIsDirty(true);
  };

  const setCoverImage = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    setImages(newImages);
    setIsDirty(true);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // 4. Sizes Toggle
  const handleToggleSize = (size) => {
    setIsDirty(true);
    if (size === 'Unstitched') {
      setIncludeUnstitched(!includeUnstitched);
      return;
    }
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length <= 1) {
        setFormError('Product must have at least one size.');
        return;
      }
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // 5. Variants Change
  const handleVariantChange = (index, field, value) => {
    setIsDirty(true);
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    // Clear field-level error when edited
    if (skuErrors[index]) {
      setSkuErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const handleBulkSetStock = (qty) => {
    setIsDirty(true);
    setVariants((prev) => prev.map((v) => ({ ...v, stock: qty })));
  };

  // 6. Save & Publish Handlers (Separate Actions with Rigorous SKU & Payload Checks)
  const handleSave = async (explicitPublishState) => {
    setFormError(null);
    setFormSuccess(null);
    setSkuErrors({});

    // Determine target publication status:
    // If explicitPublishState is boolean, use it (e.g. user clicked "Publish Draft Live" or "Save as Draft").
    // Otherwise in edit mode, preserve current publication status (published remains published, draft remains draft).
    const targetPublishState = typeof explicitPublishState === 'boolean' 
      ? explicitPublishState 
      : (isEditing ? isPublished : false);

    const actionName = isEditing 
      ? (explicitPublishState === true && !isPublished ? 'publish' : 'update')
      : (targetPublishState ? 'publish' : 'draft');

    // A. Form field validations
    if (!title.trim()) {
      setFormError('Product title is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Please enter a valid positive regular price in PKR.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const numOrig = originalPrice.trim() ? parseFloat(originalPrice) : null;
    if (numOrig !== null && (isNaN(numOrig) || numOrig < numPrice)) {
      setFormError('Compare-at price cannot be lower than the regular price.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (images.length === 0) {
      setFormError('Please upload at least one product photo or add via URL.');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    if (variants.length === 0) {
      setFormError('At least one size variant must be configured.');
      return;
    }

    // B. Required & Unique SKU Validations (In-Form duplicates)
    const formSkuErrors = {};
    const seenSkus = new Map();
    let hasSkuError = false;

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const trimmedSku = (v.sku || '').trim();

      if (!trimmedSku) {
        formSkuErrors[i] = 'SKU is required for this variant.';
        hasSkuError = true;
      } else {
        const lower = trimmedSku.toLowerCase();
        if (seenSkus.has(lower)) {
          const firstIdx = seenSkus.get(lower);
          formSkuErrors[i] = 'This SKU is already used by another variant.';
          formSkuErrors[firstIdx] = 'This SKU is already used by another variant.';
          hasSkuError = true;
          setFormError(`This SKU is already used by another variant: "${trimmedSku}". Every variant SKU must be unique.`);
        } else {
          seenSkus.set(lower, i);
        }
      }

      if (parseInt(v.stock, 10) < 0 || isNaN(parseInt(v.stock, 10))) {
        setFormError(`Stock for SKU "${trimmedSku || 'variant'}" cannot be negative.`);
        return;
      }
    }

    if (hasSkuError) {
      setSkuErrors(formSkuErrors);
      return;
    }

    setIsSaving(true);
    setSavingAction(actionName);

    // C. Database cross-product / cross-variant duplicate SKU check
    try {
      const allSkus = variants.map((v) => (v.sku || '').trim()).filter(Boolean);
      const { data: dbVariants, error: dbCheckErr } = await supabase
        .from('product_variants')
        .select('id, product_id, sku')
        .in('sku', allSkus);

      if (!dbCheckErr && dbVariants && dbVariants.length > 0) {
        for (const ev of dbVariants) {
          const lowerEvSku = ev.sku.trim().toLowerCase();
          const matchingFormVariant = variants.find(
            (v) => (v.sku || '').trim().toLowerCase() === lowerEvSku
          );

          if (!matchingFormVariant) continue;

          // A variant is allowed to retain its own SKU:
          // If the matching form variant has an ID that matches the DB row's ID, it is its own SKU!
          const isOwnVariant = Boolean(
            matchingFormVariant.id && String(matchingFormVariant.id) === String(ev.id)
          );

          if (isOwnVariant) {
            continue; // Valid: keeping its own SKU
          }

          // If the SKU belongs to another product or another variant in the database
          const dupIdx = variants.indexOf(matchingFormVariant);
          setSkuErrors({ [dupIdx]: 'This SKU is already used by another variant.' });
          setFormError(`This SKU is already used by another variant: "${ev.sku}". Every variant SKU must be unique.`);
          setIsSaving(false);
          setSavingAction(null);
          return;
        }
      }
    } catch (e) {
      console.warn('Pre-save database SKU check notice:', e);
    }

    // D. Construct exact payload compatible with saveProduct / save_product_with_variants
    try {
      const categoryObj = DEFAULT_CATEGORIES.find((c) => c.id === category);

      const payload = {
        id: isEditing ? product.id : null,
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        title: title.trim(),
        subheading: subheading.trim() || 'HAUTE COUTURE',
        category: category,
        category_label: categoryObj?.label || 'Luxury Prêt',
        collections: Array.isArray(collections) ? collections : [],
        price: numPrice,
        original_price: numOrig,
        badge: isNew ? 'NEW' : null,
        description: description.trim(),
        fabric: fabric.trim(),
        includes: includes.trim(),
        care_instructions: careInstructions.trim(),
        size_guide: { unit: sizeGuideUnit },
        related_product_ids: Array.isArray(relatedProductIds) ? relatedProductIds : [],
        images: images,
        colors: colors.map((c) => ({ name: c.name, hex: c.hex })),
        sizes: selectedSizes,
        is_published: targetPublishState,
        is_new: isNew,
        is_featured: isFeatured,
        variants: variants.map((v) => ({
          id: v.id || null,
          sku: v.sku.trim(),
          size: v.size,
          color: v.color || 'Standard',
          stock: parseInt(v.stock, 10) || 0,
          price: v.price !== null && v.price !== undefined && v.price !== '' ? parseFloat(v.price) : numPrice
        }))
      };

      const result = await saveProduct(payload);

      setIsPublished(targetPublishState);
      setIsDirty(false);
      setFormSuccess({
        isUpdate: isEditing,
        isPublished: targetPublishState,
        productId: result?.product_id || product?.id || payload.slug,
        slug: result?.slug || payload.slug
      });

      // Notify parent after brief delay to let user see success banner and refresh catalog
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess(result);
      }, 1200);

    } catch (err) {
      console.error('Product save error:', err);
      const errMsg = err.message || '';
      if (
        errMsg.includes('product_variants_sku_key') || 
        errMsg.includes('idx_variants_sku') || 
        errMsg.includes('duplicate key')
      ) {
        setFormError('This SKU is already used by another variant. Please ensure every variant SKU is unique.');
      } else {
        setFormError(errMsg || 'Failed to save product in database.');
      }
    } finally {
      setIsSaving(false);
      setSavingAction(null);
    }
  };

  return (
    <div className="space-y-8 text-left pb-24">
      
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ebe6e0]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            className="admin-btn-secondary p-2.5 h-10 w-10 flex items-center justify-center shrink-0"
            title="Return to product catalog"
            aria-label="Return to catalog"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 
              className="text-2xl sm:text-3xl text-[#1a1814] font-normal tracking-wide"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              {isEditing ? 'Edit Product' : 'Add New Luxury Dress'}
            </h1>
            <p className="text-[12px] text-[#524d47]">
              {isEditing ? `Product ID: ${product.id} • Editing: ${product.title}` : 'Create a new couture piece for the YASRAF atelier catalog.'}
            </p>
          </div>
        </div>

        {/* Status Pill in Header */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-[11px] uppercase tracking-[0.14em] font-semibold border ${
            isPublished 
              ? 'bg-[#2c6e56]/15 border-[#2c6e56]/40 text-[#1b533f]' 
              : 'bg-[#faf8f6] border-[#d6cfc7] text-[#524d47]'
          }`}>
            {isPublished ? '● Published Live' : '○ Draft Mode'}
          </span>
        </div>
      </div>

      {/* 2. Feedback Alerts */}
      {formError && (
        <div className="p-4 bg-[#fdf2f2] border border-[#f5c6cb] text-[#721c24] text-[13px] flex items-start gap-3 shadow-2xs">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#b46146]" />
          <div className="flex-1">
            <p className="font-semibold">Unable to Save Product</p>
            <p className="mt-0.5 text-[12.5px]">{formError}</p>
          </div>
        </div>
      )}

      {formSuccess && (
        <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-[13px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <Check size={18} className="shrink-0 text-[#2c6e56]" />
            <div>
              <p className="font-semibold">
                {formSuccess.isUpdate 
                  ? 'Product updated successfully' 
                  : (formSuccess.isPublished 
                      ? 'Dress published live to storefront!' 
                      : 'Dress saved securely as Draft!')}
              </p>
              <p className="text-[12px] text-[#15803d]">
                {formSuccess.isUpdate
                  ? 'The existing product record and variants have been updated.'
                  : (formSuccess.isPublished 
                      ? 'This product is now live on the catalog and collection pages.' 
                      : 'Safely stored in the atelier catalog and hidden from public view.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            {formSuccess.isPublished && (
              <a
                href={`/#product/${formSuccess.slug || formSuccess.productId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2c6e56] text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#235845] transition-colors cursor-pointer"
              >
                <span>View on Storefront</span>
                <ExternalLink size={12} />
              </a>
            )}
            <button
              type="button"
              onClick={() => onSaveSuccess && onSaveSuccess(product)}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#bbf7d0] bg-white text-[#166534] text-[11px] uppercase tracking-wider font-medium hover:bg-[#f0fdf4] transition-colors cursor-pointer"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Spacious Main Form (Col-span 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section A: Basic Information & Categorization */}
          <div className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-5">
            <h2 
              className="text-lg text-[#1a1814] font-normal border-b border-[#ebe6e0] pb-3"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              1. Basic Information
            </h2>

            <div className="space-y-4">
              {/* Product Title */}
              <div>
                <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                  Product Title <span className="text-[#b46146]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Noor-e-Kashmir Black & Rust Embroidered 3-Piece Silk Lawn"
                  className="w-full px-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] placeholder-[#8c867f] focus:bg-white focus:border-[#1a1814] focus:outline-none"
                />
              </div>

              {/* URL Slug & Subheading Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="noor-e-kashmir-silk-lawn"
                    className="w-full px-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] placeholder-[#8c867f] focus:bg-white focus:border-[#1a1814] focus:outline-none font-mono text-xs"
                  />
                  <span className="text-[10.5px] text-[#8c867f] mt-1 block">
                    Used for clean shareable URLs: /#product/{slug || 'slug'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                    Subheading / Eyebrow (Optional)
                  </label>
                  <input
                    type="text"
                    value={subheading}
                    onChange={(e) => {
                      setSubheading(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. SIGNATURE EDIT, HAUTE COUTURE"
                    className="w-full px-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] placeholder-[#8c867f] focus:bg-white focus:border-[#1a1814] focus:outline-none"
                  />
                  <span className="text-[10.5px] text-[#8c867f] mt-1 block">
                    Displays in small uppercase text above the title.
                  </span>
                </div>
              </div>

              {/* Category & Collections (Separate fields, full clarity) */}
              <div className="pt-2 border-t border-[#ebe6e0] space-y-4">
                {/* Primary Category */}
                <div>
                  <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                    Primary Category <span className="text-[#b46146]">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full sm:w-80 px-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] focus:bg-white focus:border-[#1a1814] focus:outline-none cursor-pointer"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10.5px] text-[#8c867f] mt-1 block">
                    Defines the main category taxonomy for storefront breadcrumbs.
                  </span>
                </div>

                {/* Multiple Collections (Interactive Selectable Chips with Checkboxes) */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814]">
                      Multiple Collections (Select all that apply)
                    </label>
                    <span className="text-[11px] font-medium text-[#c5a880] uppercase tracking-wider">
                      {collections.length} Selected
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8c867f]">
                    This product will be automatically featured on every selected collection page across the storefront.
                  </p>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {availableCollections.map((col) => {
                      const isSelected = collections.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          type="button"
                          role="checkbox"
                          aria-checked={isSelected}
                          onClick={() => handleToggleCollection(col.id)}
                          className={`flex items-center gap-2.5 px-3.5 py-2 text-[11.5px] uppercase tracking-[0.12em] border transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'border-[#1a1814] bg-[#1a1814] text-white shadow-xs font-semibold'
                              : 'border-[#ebe6e0] bg-[#faf8f6] text-[#4a4640] hover:border-[#c5a880] hover:bg-white hover:text-[#1a1814] font-medium'
                          }`}
                        >
                          {/* Dedicated Checkbox Box Indicator */}
                          <span 
                            className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                              isSelected 
                                ? 'border-white bg-[#c5a880] text-[#141311]' 
                                : 'border-[#b5afa8] bg-white'
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </span>
                          <span>{col.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section B: Photos & Media Management */}
          <div className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#ebe6e0] pb-3">
              <div>
                <h2 
                  className="text-lg text-[#1a1814] font-normal"
                  style={{ fontFamily: 'var(--font-family-editorial)' }}
                >
                  2. Product Photography
                </h2>
                <p className="text-[11.5px] text-[#8c867f]">
                  Upload high-resolution photography. The first image is the cover displayed on the storefront.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] uppercase tracking-[0.12em] text-[#c5a880] hover:text-[#1a1814] underline cursor-pointer font-medium"
              >
                {showUrlInput ? 'Hide URL Input' : '+ Add via URL'}
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-[#fdf2f2] border border-[#f5c6cb] text-[#721c24] text-[12px] flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-[#b46146]" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Direct URL Input Modal/Bar */}
            {showUrlInput && (
              <div className="p-3.5 bg-[#faf8f6] border border-[#ebe6e0] flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  placeholder="https://example.com/photos/dress-front.jpg"
                  className="flex-1 px-3 py-2 text-[12.5px] border border-[#ebe6e0] bg-white text-[#1a1814] focus:outline-none focus:border-[#1a1814]"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="admin-btn-primary px-5 py-2 text-[11px] uppercase tracking-wider font-medium cursor-pointer shrink-0"
                >
                  Add Image
                </button>
              </div>
            )}

            {/* Upload Dropzone */}
            <div className="border-2 border-dashed border-[#ebe6e0] hover:border-[#c5a880] bg-[#faf8f6] p-6 text-center transition-colors">
              <input
                type="file"
                id="photo-uploader"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handlePhotoUpload}
                disabled={isUploadingImage}
                className="hidden"
              />
              <label 
                htmlFor="photo-uploader"
                className="flex flex-col items-center justify-center cursor-pointer select-none"
              >
                {isUploadingImage ? (
                  <div className="flex flex-col items-center gap-2 text-[#c5a880]">
                    <Loader2 size={28} className="animate-spin" />
                    <span className="text-[12px] font-medium tracking-wider uppercase">
                      Uploading to Supabase Storage...
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload size={28} className="text-[#8c867f] mb-2" />
                    <span className="text-[12.5px] font-medium text-[#1a1814]">
                      Click to upload images from your device
                    </span>
                    <span className="text-[11px] text-[#8c867f] mt-1">
                      Supports JPG, PNG, WebP up to 5MB. Multiple selection enabled.
                    </span>
                  </>
                )}
              </label>
            </div>

            {/* Photo Gallery Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {images.map((img, idx) => {
                  const isCover = idx === 0;
                  return (
                    <div 
                      key={idx}
                      className={`relative aspect-[2/3] bg-[#ebe6e0] border group overflow-hidden ${
                        isCover ? 'border-[#1a1814] ring-2 ring-[#1a1814]' : 'border-[#ebe6e0]'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Photo view ${idx + 1}`}
                        className="w-full h-full object-cover object-[center_18%]"
                      />

                      {/* Cover Badge */}
                      {isCover && (
                        <span className="absolute top-2 left-2 z-10 bg-[#1a1814] text-white text-[9px] uppercase tracking-[0.16em] font-semibold px-2 py-0.5 shadow-sm">
                          Cover Photo
                        </span>
                      )}

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                        <div className="flex justify-between items-center">
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => setCoverImage(idx)}
                              className="p-1 bg-white/20 hover:bg-white text-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-none cursor-pointer"
                              title="Set as primary cover photo"
                            >
                              Make Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="ml-auto p-1 bg-red-600/80 hover:bg-red-700 text-white rounded-none cursor-pointer"
                            title="Remove photo"
                            aria-label="Remove photo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex justify-between items-center bg-black/40 p-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveImage(idx, -1)}
                            className="p-1 disabled:opacity-30 hover:bg-white/20 cursor-pointer"
                            title="Move left"
                            aria-label="Move left"
                          >
                            <MoveLeft size={14} />
                          </button>
                          <span className="text-[10px] font-mono">{idx + 1} of {images.length}</span>
                          <button
                            type="button"
                            disabled={idx === images.length - 1}
                            onClick={() => moveImage(idx, 1)}
                            className="p-1 disabled:opacity-30 hover:bg-white/20 cursor-pointer"
                            title="Move right"
                            aria-label="Move right"
                          >
                            <MoveRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section C: Pricing & Commercials */}
          <div className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-5">
            <h2 
              className="text-lg text-[#1a1814] font-normal border-b border-[#ebe6e0] pb-3"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              3. Pricing & Discounts
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Regular Price */}
              <div>
                <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                  Regular Price (PKR) <span className="text-[#b46146]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#8c867f]">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="10850"
                    className="w-full pl-11 pr-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] placeholder-[#8c867f] focus:bg-white focus:border-[#1a1814] focus:outline-none"
                  />
                </div>
              </div>

              {/* Compare-At / Original Price */}
              <div>
                <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                  Compare-At / Original Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#8c867f]">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={originalPrice}
                    onChange={(e) => {
                      setOriginalPrice(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="13500"
                    className="w-full pl-11 pr-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] placeholder-[#8c867f] focus:bg-white focus:border-[#1a1814] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Discount Percentage Callout */}
            {discountPercent > 0 && (
              <div className="p-3 bg-[#faf8f6] border border-[#ebe6e0] flex items-center justify-between text-[12px]">
                <span className="text-[#67615c]">
                  Calculated Discount based on entered prices:
                </span>
                <span className="font-semibold text-[#b46146] uppercase tracking-wider">
                  {discountPercent}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Section D: Colors & Available Sizes */}
          <div className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-6">
            <h2 
              className="text-lg text-[#1a1814] font-normal border-b border-[#ebe6e0] pb-3"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              4. Colors & Available Sizes
            </h2>

            {/* Colors Setup (Unlimited colors, live swatches, clean empty state, no auto-default) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814]">
                  Product Colors & Swatches
                </label>
                <span className="text-[11px] font-medium text-[#c5a880] uppercase tracking-wider">
                  {colors.length} {colors.length === 1 ? 'Color' : 'Colors'} Configured
                </span>
              </div>

              {/* Clean Empty State when no colors exist */}
              {colors.length === 0 ? (
                <div className="p-4 border border-dashed border-[#ebe6e0] bg-[#faf8f6] text-center text-[#8c867f] space-y-1">
                  <p className="text-[12.5px] font-medium text-[#1a1814]">No colors added yet</p>
                  <p className="text-[11px] text-[#8c867f]">
                    Use the "Add Color" form below to configure distinct colorways (e.g. Maroon, Ivory, Emerald). If left empty, a single standard variant will be created.
                  </p>
                </div>
              ) : (
                /* Responsive Grid of Configured Colors */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {colors.map((c, idx) => (
                    <div 
                      key={`${c.name}-${idx}`}
                      className="flex items-center justify-between p-2.5 bg-[#faf8f6] border border-[#ebe6e0] hover:border-[#c5a880] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Live circular swatch preview */}
                        <div 
                          className="w-6 h-6 rounded-full border border-black/20 shadow-xs shrink-0" 
                          style={{ backgroundColor: c.hex }} 
                          title={c.hex}
                        />
                        <div className="min-w-0">
                          <span className="text-[12.5px] font-medium text-[#1a1814] truncate block">
                            {c.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#8c867f] uppercase block">
                            {c.hex}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Native Color Picker to edit hex */}
                        <input
                          type="color"
                          value={c.hex}
                          onChange={(e) => handleUpdateColorHex(idx, e.target.value)}
                          className="w-7 h-7 p-0.5 border border-[#ebe6e0] bg-white cursor-pointer rounded-xs"
                          title={`Edit hex code for ${c.name}`}
                          aria-label={`Edit hex code for ${c.name}`}
                        />
                        {/* Remove Button (Removes only this color) */}
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="p-1 text-[#8c867f] hover:text-[#b46146] hover:bg-white rounded transition-colors cursor-pointer"
                          title={`Remove color ${c.name}`}
                          aria-label={`Remove color ${c.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Color Formlet */}
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => {
                      setNewColorName(e.target.value);
                      setColorError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                    placeholder="Color name (e.g. Maroon, Ivory, Emerald)"
                    className="flex-1 px-3.5 py-2 text-[12.5px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] placeholder-[#8c867f] focus:bg-white focus:border-[#1a1814] focus:outline-none"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Live Swatch Preview for new color */}
                    <div 
                      className="w-8 h-8 rounded-full border border-black/20 shadow-xs shrink-0"
                      style={{ backgroundColor: newColorHex }}
                      title={`Live preview: ${newColorHex}`}
                    />
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-9 h-9 p-0.5 border border-[#ebe6e0] bg-white cursor-pointer rounded-none"
                      title="Pick color hex code"
                      aria-label="Pick color hex code"
                    />
                    <span className="text-[11px] font-mono text-[#8c867f] uppercase w-16">
                      {newColorHex}
                    </span>

                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-4 py-2 bg-[#1a1814] hover:bg-[#33302c] text-white text-[11px] uppercase tracking-wider font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Plus size={13} />
                      <span>Add Color</span>
                    </button>
                  </div>
                </div>

                {colorError && (
                  <p className="text-[11.5px] text-[#b46146] font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} />
                    <span>{colorError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Sizes Setup */}
            <div className="pt-4 border-t border-[#ebe6e0] space-y-3">
              <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814]">
                Available Sizes
              </label>

              <div className="flex flex-wrap gap-2.5">
                {STANDARD_SIZES.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      className={`min-w-[48px] h-10 px-3 text-[12px] font-medium uppercase tracking-wider border transition-colors cursor-pointer ${
                        isSelected 
                          ? 'border-[#1a1814] bg-[#1a1814] text-white' 
                          : 'border-[#ebe6e0] bg-[#faf8f6] text-[#67615c] hover:border-[#1a1814]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* Explicit Unstitched Checkbox */}
              <div className="pt-2 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="include-unstitched"
                  checked={includeUnstitched}
                  onChange={(e) => {
                    setIncludeUnstitched(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="w-4 h-4 accent-[#1a1814] cursor-pointer"
                />
                <label 
                  htmlFor="include-unstitched"
                  className="text-[12.5px] text-[#1a1814] cursor-pointer select-none"
                >
                  Include <strong>Unstitched</strong> option for this design
                </label>
              </div>
            </div>
          </div>

          {/* Section E: Variants & Stock Inventory Matrix */}
          <div className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebe6e0] pb-3">
              <div>
                <h2 
                  className="text-lg text-[#1a1814] font-normal"
                  style={{ fontFamily: 'var(--font-family-editorial)' }}
                >
                  5. Size & Color Inventory Matrix
                </h2>
                <p className="text-[11.5px] text-[#8c867f]">
                  Individual SKUs and live stock levels for each combination. Every SKU must be unique.
                </p>
              </div>

              {/* Bulk Stock Setter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#8c867f] uppercase tracking-wider">Bulk stock:</span>
                {[5, 10, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleBulkSetStock(num)}
                    className="px-2 py-0.5 border border-[#ebe6e0] text-[10.5px] hover:border-[#1a1814] cursor-pointer transition-colors"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Variants Table with Real-Time Field-Level SKU Errors */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#ebe6e0] text-[10.5px] uppercase tracking-[0.14em] text-[#8c867f] bg-[#faf8f6]">
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Color</th>
                    <th className="py-2.5 px-3">Unique SKU <span className="text-[#b46146]">*</span></th>
                    <th className="py-2.5 px-3 w-28">Stock Qty</th>
                    <th className="py-2.5 px-3 w-32">Price Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebe6e0]">
                  {variants.map((v, idx) => {
                    const colorObj = colors.find((c) => c.name === v.color);
                    const isError = Boolean(skuErrors[idx]);
                    return (
                      <tr key={`${v.size}-${v.color}-${idx}`} className="hover:bg-[#faf8f6]/50">
                        <td className="py-2.5 px-3 font-semibold text-[#1a1814]">{v.size}</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1.5">
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: colorObj ? colorObj.hex : '#1a1814' }}
                            />
                            <span>{v.color || 'Standard'}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            required
                            value={v.sku}
                            onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                            className={`w-full px-2.5 py-1.5 border font-mono text-xs focus:outline-none transition-colors ${
                              isError
                                ? 'border-[#b46146] bg-[#fdf2f2] text-[#721c24]'
                                : 'border-[#ebe6e0] bg-white text-[#1a1814] focus:border-[#1a1814]'
                            }`}
                          />
                          {isError && (
                            <span className="text-[10.5px] text-[#b46146] font-medium block mt-0.5">
                              {skuErrors[idx]}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            required
                            value={v.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', parseInt(e.target.value, 10) || 0)}
                            className="w-full px-2 py-1.5 border border-[#ebe6e0] bg-white focus:outline-none focus:border-[#1a1814]"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            value={v.price || ''}
                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder={price || 'Default'}
                            className="w-full px-2 py-1.5 border border-[#ebe6e0] bg-white focus:outline-none focus:border-[#1a1814]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section F: Product Content & Details */}
          <div className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-5">
            <h2 
              className="text-lg text-[#1a1814] font-normal border-b border-[#ebe6e0] pb-3"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              6. Haute Couture Content & Details
            </h2>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                  Editorial Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="The signature silhouette of Yasraf Clothing. An enchanting palette..."
                  className="w-full p-3 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] placeholder-[#8c867f] focus:bg-white focus:border-[#1a1814] focus:outline-none"
                />
              </div>

              {/* Fabric & Embroidery Details */}
              <div>
                <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                  Fabric & Embroidery Details
                </label>
                <textarea
                  rows={2}
                  value={fabric}
                  onChange={(e) => {
                    setFabric(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Digital printed 80/80 Egyptian Lawn with Handcrafted Schiffli Cotton Lace Insets..."
                  className="w-full p-3 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] placeholder-[#8c867f] focus:bg-white focus:border-[#1a1814] focus:outline-none"
                />
              </div>

              {/* Inclusions */}
              <div>
                <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                  Package Inclusions
                </label>
                <textarea
                  rows={2}
                  value={includes}
                  onChange={(e) => {
                    setIncludes(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Digital Printed & Embroidered Lawn Shirt (3.15m), Printed Pure Silk Dupatta (2.5m)..."
                  className="w-full p-3 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] placeholder-[#8c867f] focus:bg-white focus:border-[#1a1814] focus:outline-none"
                />
              </div>

              {/* Care Instructions */}
              <div>
                <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                  Care Instructions
                </label>
                <input
                  type="text"
                  value={careInstructions}
                  onChange={(e) => {
                    setCareInstructions(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Gentle cold hand wash or delicate dry clean. Avoid direct sunlight drying."
                  className="w-full px-3.5 py-2 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] text-[#1a1814] focus:bg-white focus:border-[#1a1814] focus:outline-none"
                />
              </div>

              {/* Related Products "Pairs Well With" */}
              <div className="pt-2">
                <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                  Pairs Well With (Curated Ensembles)
                </label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-[#ebe6e0] bg-[#faf8f6]">
                  {allProducts
                    .filter((p) => p.id !== product?.id)
                    .map((other) => {
                      const isSelected = relatedProductIds.includes(other.id);
                      return (
                        <button
                          key={other.id}
                          type="button"
                          onClick={() => {
                            setIsDirty(true);
                            if (isSelected) {
                              setRelatedProductIds(relatedProductIds.filter((id) => id !== other.id));
                            } else {
                              setRelatedProductIds([...relatedProductIds, other.id]);
                            }
                          }}
                          className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer truncate max-w-xs ${
                            isSelected
                              ? 'border-[#1a1814] bg-[#1a1814] text-white'
                              : 'border-[#ebe6e0] bg-white text-[#67615c] hover:border-[#1a1814]'
                          }`}
                        >
                          {other.title}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Publishing & Preview Sidebar (Col-span 4) */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
          
          {/* Publishing Controls Panel */}
          <div className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-5">
            <h3 
              className="text-base text-[#1a1814] font-medium uppercase tracking-[0.14em] border-b border-[#ebe6e0] pb-3"
            >
              Publishing Actions
            </h3>

            {/* Badges / Flags */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-[12px] text-[#1a1814] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => {
                    setIsNew(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="w-3.5 h-3.5 accent-[#1a1814] cursor-pointer"
                />
                <span>Mark as "New Arrival" (displays NEW tag)</span>
              </label>

              <label className="flex items-center gap-2 text-[12px] text-[#1a1814] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => {
                    setIsFeatured(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="w-3.5 h-3.5 accent-[#1a1814] cursor-pointer"
                />
                <span>Highlight on Homepage Featured Grid</span>
              </label>
            </div>

            {/* Separate Actions: "Publish Product" and "Save as Draft" */}
            <div className="pt-4 border-t border-[#ebe6e0] space-y-2.5">
              
              {isEditing ? (
                <>
                  {/* Edit Mode Primary Action: Update Product */}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave(isPublished)}
                    className="admin-btn-primary w-full h-11 text-[12px] shadow-sm"
                  >
                    {isSaving && savingAction === 'update' ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-[#c5a880]" />
                        <span>Updating Product...</span>
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        <span>Update Product</span>
                      </>
                    )}
                  </button>

                  {/* Edit Mode Separate Action: Publish Draft if currently in draft mode */}
                  {!isPublished ? (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSave(true)}
                      className="admin-btn-secondary w-full h-10 text-[11.5px] border-[#2c6e56]/40 text-[#1b533f] hover:bg-[#2c6e56]/15 hover:border-[#2c6e56]"
                    >
                      {isSaving && savingAction === 'publish' ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-[#1b533f]" />
                          <span>Publishing Live...</span>
                        </>
                      ) : (
                        <>
                          <Eye size={14} />
                          <span>Publish Product</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSave(false)}
                      className="admin-btn-secondary w-full h-10 text-[11.5px] text-[#524d47]"
                    >
                      {isSaving && savingAction === 'draft' ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Reverting to Draft...</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={13} />
                          <span>Revert to Draft</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Create Mode Primary Action: Publish Product */}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave(true)}
                    className="admin-btn-primary w-full h-11 text-[12px] shadow-sm"
                  >
                    {isSaving && savingAction === 'publish' ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-[#c5a880]" />
                        <span>Publishing Live...</span>
                      </>
                    ) : (
                      <>
                        <Eye size={15} />
                        <span>Publish Product</span>
                      </>
                    )}
                  </button>

                  {/* Create Mode Secondary Action: Save as Draft */}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave(false)}
                    className="admin-btn-secondary w-full h-10 text-[11.5px]"
                  >
                    {isSaving && savingAction === 'draft' ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-[#1a1814]" />
                        <span>Saving Draft...</span>
                      </>
                    ) : (
                      <span>Save as Draft</span>
                    )}
                  </button>
                </>
              )}

              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleCancelClick}
                className="admin-btn-secondary w-full py-2.5 text-[11px] text-[#524d47]"
              >
                Cancel and return to catalog
              </button>
            </div>
          </div>

          {/* Live Storefront Card Preview */}
          <div className="bg-white border border-[#ebe6e0] p-4 shadow-2xs space-y-3">
            <span className="text-[10.5px] uppercase tracking-[0.16em] text-[#8c867f] font-medium block">
              Storefront Card Preview
            </span>

            <div className="w-full aspect-[2/3] bg-[#ebe6e0] overflow-hidden relative">
              <img
                src={images[0] || '/products/yasraf-meerab-black-1.png'}
                alt={title || 'Product preview'}
                className="w-full h-full object-cover object-[center_18%]"
              />
              {discountPercent > 0 && (
                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-[#faf8f6]/95 text-[#1a1814] text-[9px] uppercase tracking-wider font-semibold">
                  SALE
                </span>
              )}
            </div>

            <div className="text-center pt-2">
              <h4 
                className="text-lg text-[#1a1814] font-normal truncate"
                style={{ fontFamily: 'var(--font-family-editorial)' }}
              >
                {title || 'Untitled Couture Piece'}
              </h4>
              <div className="flex items-center justify-center gap-2 text-[12px] text-[#67615c] mt-0.5">
                <span className="text-[#1a1814] font-medium">
                  Rs. {Number(price || 0).toLocaleString()}
                </span>
                {originalPrice && (
                  <span className="line-through text-[#8c867f]">
                    Rs. {Number(originalPrice).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
