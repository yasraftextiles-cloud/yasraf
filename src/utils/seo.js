// ==========================================================================
// YASRAF TEXTILES — PRODUCTION TECHNICAL SEO UTILITIES & METADATA
// Official Domain: https://yasraftextiles.com/
// ==========================================================================

export const PRODUCTION_DOMAIN = 'https://yasraftextiles.com';

/**
 * Generate a clean, SEO-friendly slug from a product object
 */
export function getProductSlug(product) {
  if (!product) return '';
  if (product.slug && typeof product.slug === 'string') {
    return product.slug.toLowerCase().trim();
  }
  if (product.title) {
    return product.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  return product.id || '';
}

/**
 * Find a product by slug or id from catalog
 */
export function findProductBySlug(products = [], slugOrId = '') {
  if (!slugOrId || !Array.isArray(products)) return null;
  const clean = slugOrId.toLowerCase().trim();
  return products.find(
    (p) =>
      p.id?.toLowerCase() === clean ||
      p.slug?.toLowerCase() === clean ||
      getProductSlug(p) === clean
  ) || null;
}

/**
 * Curated SEO metadata for every major storefront collection
 */
export const COLLECTION_SEO_DATA = {
  'all': {
    title: "Women's Clothing Collections Pakistan | YASRAF Textiles",
    description: "Explore the complete YASRAF Textiles women's collection in Pakistan. Discover ready to wear, unstitched luxury suits, festive couture, and seasonal edits.",
    h1: "All Collections",
    intro: "Discover hand-finished luxury lawn, unstitched three-piece suits, and contemporary ready-to-wear ensembles crafted with authentic Pakistani artisanal grace.",
    canonicalPath: '/collections'
  },
  'ready-to-wear': {
    title: "Ready to Wear Women's Dresses Pakistan | YASRAF Textiles",
    description: "Explore elegant ready to wear women's dresses by YASRAF Textiles, featuring refined Pakistani designs for everyday, festive and special occasions.",
    h1: "Ready to Wear Collection",
    intro: "Tailored ready made women's suits, pret tunics, and coordinated co-ord sets designed for effortless contemporary poise and timeless style.",
    canonicalPath: '/collections/ready-to-wear'
  },
  'unstitched': {
    title: "Unstitched Suits for Women Pakistan | YASRAF Textiles",
    description: "Shop premium unstitched suits for women in Pakistan by YASRAF Textiles. Handcrafted embroidered 3-piece and 2-piece lawn, chiffon, and silk fabrics.",
    h1: "Unstitched Collection",
    intro: "Bespoke unstitched fabrics featuring intricate Schiffli embroidery, digital printed silk dupattas, and pure cotton cambric trousers customizable to your fit.",
    canonicalPath: '/collections/unstitched'
  },
  'luxury-pret': {
    title: "Luxury Prêt Pakistan | Premium Women's Dresses | YASRAF Textiles",
    description: "Discover luxury prêt in Pakistan by YASRAF Textiles. Exquisite hand-embellished formal wear, organza insets, and fine silk ready-to-wear attire.",
    h1: "Luxury Prêt Collection",
    intro: "High-end luxury prêt silhouettes highlighting delicate Resham threadwork, organza cutwork sleeves, and statement drapes for distinguished occasions.",
    canonicalPath: '/collections/luxury-pret'
  },
  'party-wear': {
    title: "Party Wear & Festive Dresses Pakistan | YASRAF Textiles",
    description: "Shop party wear and festive dresses for women in Pakistan by YASRAF Textiles. Beautifully embellished formal suits for weddings, Eid, and celebrations.",
    h1: "Party Wear & Formals",
    intro: "Celebratory formal wear featuring artisanal zardozi accents, metallic zari embroidery, and regal jewel tones crafted for weddings and festive soirees.",
    canonicalPath: '/collections/party-wear'
  },
  'winter-collection': {
    title: "Winter Collection Women Pakistan | Warm Dresses | YASRAF Textiles",
    description: "Discover the women's winter collection in Pakistan by YASRAF Textiles. Luxurious khaddar, velvet, and warm fabric dresses crafted for the cold season.",
    h1: "Winter Collection",
    intro: "Warm luxury winter fabrics, rich textures, and cozy yet sophisticated silhouettes designed to keep you elegantly dressed through the chill.",
    canonicalPath: '/collections/winter-collection'
  },
  'winter': {
    title: "Winter Collection Women Pakistan | Warm Dresses | YASRAF Textiles",
    description: "Discover the women's winter collection in Pakistan by YASRAF Textiles. Luxurious khaddar, velvet, and warm fabric dresses crafted for the cold season.",
    h1: "Winter Collection",
    intro: "Warm luxury winter fabrics, rich textures, and cozy yet sophisticated silhouettes designed to keep you elegantly dressed through the chill.",
    canonicalPath: '/collections/winter-collection'
  },
  'festive': {
    title: "Festive Wear Pakistan | Embroidered Festive Suits | YASRAF Textiles",
    description: "Explore the YASRAF Textiles festive collection in Pakistan. Splendid embroidered dresses, fine silks, and couture details for celebratory moments.",
    h1: "Festive Collection",
    intro: "Festive couture ensembles adorned with radiant embroidery, handcrafted laces, and luminous silk shawls celebrating Pakistan's rich textile heritage.",
    canonicalPath: '/collections/festive'
  },
  'the-edit': {
    title: "The Signature Edit | Women's Fashion Pakistan | YASRAF Textiles",
    description: "Browse The Edit by YASRAF Textiles. A hand-curated edit of distinguished Pakistani women's dresses, limited releases, and signature couture.",
    h1: "The Signature Edit",
    intro: "A discerning curation of YASRAF's finest silhouettes, highlighting statement embroidery, hand-finished hems, and premier luxury fabrics.",
    canonicalPath: '/collections/the-edit'
  },
  'best-sellers': {
    title: "Best Selling Women's Dresses Pakistan | YASRAF Textiles",
    description: "Shop best-selling women's dresses in Pakistan at YASRAF Textiles. Client-favorite luxury prêt, embroidered suits, and ready to wear outfits.",
    h1: "Best Sellers",
    intro: "Our most coveted, highest-rated client favorites — celebrated for impeccable craftsmanship, supreme comfort, and unmatched elegance.",
    canonicalPath: '/collections/best-sellers'
  },
  'new-in': {
    title: "New Arrivals | Latest Women's Pakistani Fashion | YASRAF Textiles",
    description: "Discover fresh new arrivals in Pakistani women's clothing by YASRAF Textiles. Seasonal releases, modern cuts, and freshly tailored prêt designs.",
    h1: "New Arrivals",
    intro: "The newest additions to the YASRAF atelier — freshly tailored, contemporary silhouettes imbued with seasonal palettes and exquisite embroidery.",
    canonicalPath: '/collections/new-in'
  },
  'summer': {
    title: "Summer Lawn Collection Pakistan | YASRAF Textiles",
    description: "Shop breezy summer lawn dresses for women in Pakistan by YASRAF Textiles. Breathable Egyptian lawn, light cottons, and pastel floral prints.",
    h1: "Summer Lawn Collection",
    intro: "Lightweight, breathable Egyptian lawn and airy voile dupattas in soothing sunlit hues crafted for warm summer days and breezy evenings.",
    canonicalPath: '/collections/summer'
  },
  'sale': {
    title: "Sale | Exclusive Offers on Women's Clothing | YASRAF Textiles",
    description: "Shop seasonal sales and special discounts on women's Pakistani dresses at YASRAF Textiles. Limited-time offers on ready to wear and luxury prêt.",
    h1: "Special Offers & Sale",
    intro: "Limited-edition archived styles and seasonal privilege pieces at exceptional value. All crafted with our signature authentic standards.",
    canonicalPath: '/collections/sale'
  }
};

/**
 * Generate Product Structured Data (JSON-LD)
 * strictly using real backend data without fabricated reviews/ratings
 */
export function getProductJsonLd(product) {
  if (!product) return null;
  const slug = getProductSlug(product);
  const canonicalUrl = `${PRODUCTION_DOMAIN}/products/${slug}`;
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `${PRODUCTION_DOMAIN}${product.image}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": [imageUrl],
    "description": product.description || `${product.title} - Luxury women's clothing by YASRAF Textiles.`,
    "sku": product.sku ? product.sku : undefined,
    "brand": {
      "@type": "Brand",
      "name": "YASRAF Textiles"
    },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "PKR",
      "price": Number(product.price) || 0,
      "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "YASRAF Textiles"
      }
    }
  };
}

/**
 * Generate Organization + WebSite Structured Data (JSON-LD)
 */
export function getOrganizationAndWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${PRODUCTION_DOMAIN}/#organization`,
        "name": "YASRAF Textiles",
        "url": `${PRODUCTION_DOMAIN}/`,
        "logo": `${PRODUCTION_DOMAIN}/hero-banner.jpg`,
        "description": "Distinguished Pakistani women's clothing brand specializing in ready-to-wear, unstitched, luxury prêt, and festive couture.",
        "sameAs": [
          "https://www.instagram.com/yasrafclothing",
          "https://www.facebook.com/profile.php?id=61590429044323",
          "https://www.tiktok.com/@yasrafclothing",
          "https://www.snapchat.com/@yasrafclothing"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+92-302-4220514",
          "contactType": "customer service",
          "areaServed": "PK",
          "availableLanguage": ["en", "ur"]
        }
      },
      {
        "@type": "WebSite",
        "@id": `${PRODUCTION_DOMAIN}/#website`,
        "name": "YASRAF Textiles",
        "url": `${PRODUCTION_DOMAIN}/`,
        "publisher": {
          "@id": `${PRODUCTION_DOMAIN}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${PRODUCTION_DOMAIN}/collections?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };
}

/**
 * Synchronize document head elements dynamically for client-side navigation
 */
export function updateDocumentSeo({
  page = 'home',
  product = null,
  category = 'all'
}) {
  let title = "YASRAF Textiles | Premium Women's Clothing in Pakistan";
  let description = "Shop YASRAF Textiles for elegant women's clothing in Pakistan. Discover ready to wear, unstitched, festive, winter and premium collections crafted for timeless style.";
  let canonicalPath = '/';
  let robots = 'index, follow';
  let ogType = 'website';
  let ogImage = `${PRODUCTION_DOMAIN}/hero-banner.jpg`;
  let jsonLdData = null;

  if (page === 'home') {
    title = "YASRAF Textiles | Premium Women's Clothing in Pakistan";
    description = "Shop YASRAF Textiles for elegant women's clothing in Pakistan. Discover ready to wear, unstitched, festive, winter and premium collections crafted for timeless style.";
    canonicalPath = '/';
    jsonLdData = getOrganizationAndWebsiteJsonLd();
  } else if (page === 'product' && product) {
    title = `${product.title} | Women's Pakistani Dress | YASRAF Textiles`;
    
    // Natural, rich meta description
    const descParts = [];
    descParts.push(`Shop ${product.title} by YASRAF Textiles.`);
    if (product.type) descParts.push(`Exclusive ${product.type}.`);
    if (product.fabricCategory) descParts.push(`Tailored in ${product.fabricCategory}.`);
    if (product.occasion) descParts.push(`Perfect for ${product.occasion}.`);
    descParts.push("Nationwide Cash on Delivery available across Pakistan.");
    description = descParts.join(' ');
    
    const slug = getProductSlug(product);
    canonicalPath = `/products/${slug}`;
    ogType = 'product';
    if (product.image) {
      ogImage = product.image.startsWith('http') ? product.image : `${PRODUCTION_DOMAIN}${product.image}`;
    }
    jsonLdData = getProductJsonLd(product);
  } else if (page === 'collections') {
    const colData = COLLECTION_SEO_DATA[category] || COLLECTION_SEO_DATA['all'];
    title = colData.title;
    description = colData.description;
    canonicalPath = colData.canonicalPath;
    jsonLdData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": colData.h1,
      "url": `${PRODUCTION_DOMAIN}${canonicalPath}`,
      "description": colData.description,
      "isPartOf": {
        "@type": "WebSite",
        "name": "YASRAF Textiles",
        "url": `${PRODUCTION_DOMAIN}/`
      }
    };
  } else if (page === 'about') {
    title = "The Atelier Story | About Us | YASRAF Textiles";
    description = "Learn the story behind YASRAF Textiles — Pakistan's distinguished women's fashion atelier celebrating timeless Eastern silhouettes, refined craftsmanship, and ready-to-wear luxury.";
    canonicalPath = '/about';
  } else if (page === 'contact') {
    title = "Client Concierge & Contact | YASRAF Textiles";
    description = "Contact the YASRAF Textiles client care team for order inquiries, bespoke sizing guidance, and delivery assistance across Pakistan and worldwide.";
    canonicalPath = '/contact';
  } else if (page === 'shipping') {
    title = "Delivery, Shipping Rates & 7-Day Exchange | YASRAF Textiles";
    description = "View YASRAF Textiles shipping rates, nationwide Cash on Delivery terms, and straightforward 7-day exchange policy for women's dresses across Pakistan.";
    canonicalPath = '/shipping';
  } else if (['login', 'register', 'forgot-password', 'reset-password', 'auth-callback', 'account', 'admin'].includes(page)) {
    title = `${page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' ')} | YASRAF Textiles`;
    description = "Secure client portal for YASRAF Textiles.";
    canonicalPath = `/${page}`;
    robots = 'noindex, follow'; // Exclude private and utility pages from search indexing
  } else if (page === '404') {
    title = "Page Not Found | YASRAF Textiles";
    description = "The requested page could not be found on YASRAF Textiles.";
    canonicalPath = '/404';
    robots = 'noindex, nofollow';
  }

  // Set document title
  document.title = title;

  // Set or create Meta tags helper
  const setMetaTag = (attributeName, attributeValue, content) => {
    let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attributeName, attributeValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard Meta
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'robots', robots);

  // Canonical Link
  const fullCanonicalUrl = `${PRODUCTION_DOMAIN}${canonicalPath === '/' ? '/' : canonicalPath}`;
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', fullCanonicalUrl);

  // Open Graph
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', fullCanonicalUrl);
  setMetaTag('property', 'og:type', ogType);
  setMetaTag('property', 'og:image', ogImage);
  setMetaTag('property', 'og:site_name', 'YASRAF Textiles');

  // Twitter
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', ogImage);

  // Dynamic JSON-LD structured data injection
  let scriptEl = document.getElementById('dynamic-jsonld');
  if (jsonLdData) {
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'dynamic-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLdData);
  } else if (scriptEl) {
    scriptEl.remove();
  }
}
