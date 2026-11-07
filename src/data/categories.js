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

