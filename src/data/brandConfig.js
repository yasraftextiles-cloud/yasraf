// ==========================================================================
// YASRAF CLOTHING — CENTRALIZED BRAND & STORE CONFIGURATION
// ==========================================================================

export const BRAND_CONFIG = {
  name: 'YASRAF Textiles',
  shortName: 'YASRAF',
  productionDomain: 'https://yasraftextiles.com',
  tagline: 'Elegance in Every Stitch',
  subTagline: "Premium Women's Clothing in Pakistan",
  currencyBase: 'PKR',
  freeShippingThreshold: 4990,
  standardShippingFee: 250,

  // --------------------------------------------------------------------------
  // WHATSAPP CONFIGURATION
  // NOTE: This is a placeholder number. Replace '923000000000' with your real
  // YASRAF WhatsApp number once available. All WhatsApp buttons site-wide
  // will immediately update.
  // --------------------------------------------------------------------------
  whatsappNumber: '923024220514',
  whatsappDisplay: '+92 302 4220514',
  isWhatsAppPlaceholder: false,

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

  // WhatsApp Channel Link
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029VbE5FWq8kyyW1WA1K83c',
  getWhatsAppChannelUrl: () => {
    return 'https://whatsapp.com/channel/0029VbE5FWq8kyyW1WA1K83c';
  },

  // Official Social Media Channels
  socialLinks: {
    instagram: 'https://www.instagram.com/yasrafclothing',
    facebook: 'https://www.facebook.com/profile.php?id=61590429044323',
    tiktok: 'https://www.tiktok.com/@yasrafclothing',
    snapchat: 'https://www.snapchat.com/@yasrafclothing',
    whatsapp: 'https://wa.me/923024220514'
  },

  // Contact information
  contactEmail: 'contact@yasraftextiles.com',
  supportHours: 'Mon - Sat: 10:00 AM - 8:00 PM (PKT)'
};
