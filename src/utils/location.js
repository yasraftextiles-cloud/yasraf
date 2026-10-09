/**
 * Location utilities for Pakistani delivery destinations.
 * Maps city names to supported administrative territories recognized by the store.
 */

export const SUPPORTED_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan'
];

export function inferProvince(city = '') {
  if (!city || typeof city !== 'string') return 'Punjab';
  const c = city.trim().toLowerCase();

  // Sindh
  if (
    c.includes('karachi') ||
    c.includes('hyderabad') ||
    c.includes('sukkur') ||
    c.includes('larkana') ||
    c.includes('nawabshah') ||
    c.includes('mirpurkhas') ||
    c.includes('thatta') ||
    c.includes('badin') ||
    c.includes('sindh')
  ) {
    return 'Sindh';
  }

  // Islamabad
  if (c.includes('islamabad')) {
    return 'Islamabad Capital Territory';
  }

  // Khyber Pakhtunkhwa
  if (
    c.includes('peshawar') ||
    c.includes('abbottabad') ||
    c.includes('mardan') ||
    c.includes('swat') ||
    c.includes('kohat') ||
    c.includes('mingora') ||
    c.includes('bannu') ||
    c.includes('haripur') ||
    c.includes('dera ismail') ||
    c.includes('di khan') ||
    c.includes('nowshera') ||
    c.includes('charsadda') ||
    c.includes('mansehra') ||
    c.includes('kpk') ||
    c.includes('khyber')
  ) {
    return 'Khyber Pakhtunkhwa';
  }

  // Balochistan
  if (
    c.includes('quetta') ||
    c.includes('gwadar') ||
    c.includes('turbat') ||
    c.includes('khuzdar') ||
    c.includes('chaman') ||
    c.includes('sibi') ||
    c.includes('hub') ||
    c.includes('balochistan')
  ) {
    return 'Balochistan';
  }

  // Azad Jammu & Kashmir
  if (
    c.includes('muzaffarabad') ||
    c.includes('mirpur') ||
    c.includes('rawalakot') ||
    c.includes('kotli') ||
    c.includes('bhmber') ||
    c.includes('bagh') ||
    c.includes('ajk') ||
    c.includes('kashmir')
  ) {
    return 'Azad Jammu & Kashmir';
  }

  // Gilgit-Baltistan
  if (
    c.includes('gilgit') ||
    c.includes('skardu') ||
    c.includes('hunza') ||
    c.includes('diamer') ||
    c.includes('ghizer') ||
    c.includes('baltistan')
  ) {
    return 'Gilgit-Baltistan';
  }

  // Default to Punjab
  return 'Punjab';
}
