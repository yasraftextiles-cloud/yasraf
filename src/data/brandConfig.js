// ==========================================================================
// YASRAF CLOTHING — CENTRALIZED BRAND & STORE CONFIGURATION
// ==========================================================================

export const BRAND_CONFIG = {
  name: 'YASRAF Clothing',
  shortName: 'YASRAF',
  tagline: 'Elegance in Every Stitch',
  subTagline: "Luxury Prêt & Women's Eastern Fashion",
  currencyBase: 'PKR',
  freeShippingThreshold: 3500,
  standardShippingFee: 250,

  // --------------------------------------------------------------------------
  // WHATSAPP CONFIGURATION
  // NOTE: This is a placeholder number. Replace '923000000000' with your real
  // YASRAF WhatsApp number once available. All WhatsApp buttons site-wide
  // will immediately update.
  // --------------------------------------------------------------------------
  whatsappNumber: '923000000000', // <-- PLACEHOLDER: Update here with real YASRAF number
  whatsappDisplay: '+92 300 0000000', // <-- PLACEHOLDER display string
  isWhatsAppPlaceholder: true,

  // Helper method for generating standardized WhatsApp order/inquiry links
  getWhatsAppOrderUrl: (product, size = 'Standard', color = 'Default') => {
    const phone = BRAND_CONFIG.whatsappNumber;
    const text = `Assalam-o-Alaikum YASRAF Clothing!%0A%0AI would like to inquire about/order this piece:%0A• *Product*: ${encodeURIComponent(product.title)}%0A• *SKU*: ${encodeURIComponent(product.sku || 'YAS-001')}%0A• *Size*: ${encodeURIComponent(size)}%0A• *Color*: ${encodeURIComponent(color)}%0A• *Price*: Rs. ${encodeURIComponent((product.price || 0).toLocaleString())}%0A%0APlease confirm availability and delivery details. Shukriya!`;
    return `https://wa.me/${phone}?text=${text}`;
  },

  getWhatsAppSupportUrl: (query = 'Hello YASRAF Clothing, I need assistance with your collection.') => {
    const phone = BRAND_CONFIG.whatsappNumber;
    return `https://wa.me/${phone}?text=${encodeURIComponent(query)}`;
  },

  // Contact & Social information
  contactEmail: 'contact@yasrafclothing.com', // placeholder
  supportHours: 'Mon - Sat: 10:00 AM - 8:00 PM (PKT)',
  boutiques: [
    { city: 'Lahore', address: 'Gulberg III, MM Alam Road' },
    { city: 'Karachi', address: 'Clifton & DHA Phase 6' },
    { city: 'Islamabad', address: 'Blue Area' }
  ]
};
