// ==========================================================================
// YASRAF TEXTILES — DYNAMIC PRODUCTION SITEMAP GENERATOR
// ==========================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTION_DOMAIN = 'https://yasraftextiles.com';
const TODAY = new Date().toISOString().split('T')[0];

async function generateSitemap() {
  console.log('[Sitemap Generator] Generating production sitemap for:', PRODUCTION_DOMAIN);

  // 1. Static Storefront Pages
  const staticPages = [
    { url: `${PRODUCTION_DOMAIN}/`, changefreq: 'daily', priority: '1.0' },
    { url: `${PRODUCTION_DOMAIN}/collections`, changefreq: 'daily', priority: '0.9' },
    { url: `${PRODUCTION_DOMAIN}/collections/ready-to-wear`, changefreq: 'weekly', priority: '0.9' },
    { url: `${PRODUCTION_DOMAIN}/collections/unstitched`, changefreq: 'weekly', priority: '0.9' },
    { url: `${PRODUCTION_DOMAIN}/collections/luxury-pret`, changefreq: 'weekly', priority: '0.8' },
    { url: `${PRODUCTION_DOMAIN}/collections/party-wear`, changefreq: 'weekly', priority: '0.8' },
    { url: `${PRODUCTION_DOMAIN}/collections/winter-collection`, changefreq: 'weekly', priority: '0.8' },
    { url: `${PRODUCTION_DOMAIN}/collections/festive`, changefreq: 'weekly', priority: '0.8' },
    { url: `${PRODUCTION_DOMAIN}/collections/the-edit`, changefreq: 'weekly', priority: '0.8' },
    { url: `${PRODUCTION_DOMAIN}/collections/best-sellers`, changefreq: 'weekly', priority: '0.8' },
    { url: `${PRODUCTION_DOMAIN}/collections/new-in`, changefreq: 'weekly', priority: '0.8' },
    { url: `${PRODUCTION_DOMAIN}/collections/summer`, changefreq: 'weekly', priority: '0.7' },
    { url: `${PRODUCTION_DOMAIN}/collections/sale`, changefreq: 'weekly', priority: '0.7' },
    { url: `${PRODUCTION_DOMAIN}/about`, changefreq: 'monthly', priority: '0.6' },
    { url: `${PRODUCTION_DOMAIN}/contact`, changefreq: 'monthly', priority: '0.6' },
    { url: `${PRODUCTION_DOMAIN}/shipping`, changefreq: 'monthly', priority: '0.6' }
  ];

  // 2. Load Products Catalog
  let products = [];
  try {
    const productsModule = await import('../src/data/products.js');
    products = productsModule.PRODUCTS || [];
  } catch (err) {
    console.warn('[Sitemap Generator] Could not load local products.js:', err.message);
  }

  // Generate clean readable slug helper
  const getSlug = (product) => {
    if (product.slug && typeof product.slug === 'string') return product.slug.toLowerCase().trim();
    if (product.title) {
      return product.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    return product.id;
  };

  const productPages = products.map((prod) => ({
    url: `${PRODUCTION_DOMAIN}/products/${getSlug(prod)}`,
    changefreq: 'weekly',
    priority: '0.8'
  }));

  const allEntries = [...staticPages, ...productPages];

  // Build XML content
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  // Write to public/sitemap.xml
  const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf8');
  console.log(`[Sitemap Generator] Successfully wrote ${allEntries.length} URLs to: ${publicPath}`);

  // Also write to dist/sitemap.xml if dist exists
  const distDir = path.resolve(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    const distPath = path.resolve(distDir, 'sitemap.xml');
    fs.writeFileSync(distPath, xml, 'utf8');
    console.log(`[Sitemap Generator] Also updated dist copy at: ${distPath}`);
  }
}

generateSitemap();
