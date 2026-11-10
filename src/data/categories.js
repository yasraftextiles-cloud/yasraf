// Canonical shared category & collection taxonomy for YASRAF Textiles
// Used across storefront header, admin product forms, filters, and collections

export const PRODUCT_CATEGORIES = [
  { id: 'luxury-pret', label: 'Luxury Prêt' },
  { id: 'ready-to-wear', label: 'Ready to Wear' },
  { id: 'festive', label: 'Festive' },
  { id: 'party-wear', label: 'Party Wear' },
  { id: 'winter-collection', label: 'Winter Collection' },
  { id: 'summer', label: 'Summer' },
  { id: 'unstitched', label: 'Unstitched' }
];

export const BASE_COLLECTIONS = [
  { id: 'new-in', label: 'New In' },
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'festive', label: 'Festive' },
  { id: 'ready-to-wear', label: 'Ready to Wear' },
  { id: 'luxury-pret', label: 'Luxury Prêt' },
  { id: 'party-wear', label: 'Party Wear' },
  { id: 'winter-collection', label: 'Winter Collection' },
  { id: 'summer', label: 'Summer' },
  { id: 'unstitched', label: 'Unstitched' },
  { id: 'sale', label: 'Sale' }
];

export const NAV_CATEGORIES = [
  { id: 'all', label: 'All Products', shortLabel: 'All' },
  { id: 'new-in', label: 'New In', shortLabel: 'New In', badge: 'NEW' },
  { id: 'ready-to-wear', label: 'Ready to Wear', shortLabel: 'Ready to Wear' },
  { id: 'unstitched', label: 'Unstitched', shortLabel: 'Unstitched' },
  { id: 'summer', label: 'Summer', shortLabel: 'Summer' },
  { id: 'festive', label: 'Festive', shortLabel: 'Festive' },
  { id: 'luxury-pret', label: 'Luxury Prêt', shortLabel: 'Luxury Prêt', badge: 'LUXE' },
  { id: 'party-wear', label: 'Party Wear', shortLabel: 'Party Wear' },
  { id: 'winter-collection', label: 'Winter Collection', shortLabel: 'Winter' },
  { id: 'best-sellers', label: 'Best Sellers', shortLabel: 'Best Sellers', badge: 'HOT' },
  { id: 'sale', label: 'Sale', shortLabel: 'Sale' }
];

export function getCategoryLabel(categoryId) {
  if (!categoryId) return 'Luxury Prêt';
  const match = PRODUCT_CATEGORIES.find((c) => c.id === categoryId) ||
                BASE_COLLECTIONS.find((c) => c.id === categoryId) ||
                NAV_CATEGORIES.find((c) => c.id === categoryId);
  if (match) return match.label;
  return categoryId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function matchesCategory(p, catId) {
  const c = (catId || '').toLowerCase().trim();
  if (!c || c === 'all') return true;
  const inCols = Array.isArray(p.collections) && p.collections.some((col) => {
    const cl = String(col).toLowerCase().trim();
    return (c === 'winter-collection' && cl === 'winter') || cl === c || cl === c.replace(/-/g, ' ') || cl.replace(/-/g, ' ') === c.replace(/-/g, ' ');
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
  if (c === 'sale') return getMarkdownPercent(p) > 0;
  if (c === 'best-sellers') return Boolean(p.isBestSeller || inCols);
  if (c === 'new-in') return Boolean(p.isNew || inCols);
  return catF === c || occF === c || inCols;
}

export function getMarkdownPercent(product) {
  const price = Number(product.price);
  const originalPrice = Number(product.originalPrice);
  return price > 0 && originalPrice > price
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;
}

export function getStorefrontNav(products) {
  return [
    { label: '11.11 Sale', category: 'sale' },
    { label: 'Collections', category: 'all' },
    ...['ready-to-wear', 'luxury-pret', 'festive', 'winter-collection'].map((category) => ({
      category,
      label: getCategoryLabel(category)
    }))
  ].filter(({ category }) => category === 'all' || products.some((product) => (
    product.inStock && matchesCategory(product, category)
  )));
}
