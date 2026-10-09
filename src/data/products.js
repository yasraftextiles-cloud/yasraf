// ==========================================================================
// YASRAF CLOTHING — EXCLUSIVE LUXURY WOMEN'S HAUTE COUTURE & READY-TO-WEAR
// 100% Dedicated to Pakistani Women's Eastern Fashion & Luxury Prêt
// ==========================================================================

export const CURRENCIES = {
  PKR: { symbol: 'Rs.', rate: 1, label: 'PKR - Pakistan (Rs.)' },
  USD: { symbol: '$', rate: 0.0036, label: 'USD - United States ($)' },
  AED: { symbol: 'AED', rate: 0.0132, label: 'AED - United Arab Emirates' },
  GBP: { symbol: '£', rate: 0.0028, label: 'GBP - United Kingdom (£)' },
  SAR: { symbol: 'SAR', rate: 0.0135, label: 'SAR - Saudi Arabia' },
};

// Canonical Navigation & Filter Categories (matches user requirements)
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
  { id: 'best-sellers', label: 'Best Sellers', shortLabel: 'Best Sellers', badge: 'HOT' }
];

export const FABRICS = [
  'Egyptian Lawn',
  'Pure Silk',
  'Chiffon',
  'Organza',
  'Raw Silk',
  'Cotton Cambric'
];

export const OCCASIONS = [
  'Ready to Wear',
  'Luxury Prêt',
  'Party Wear',
  'Festive',
  'Casual'
];

export const SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'Unstitched'
];

// The 12 Original Curated Demo Products
export const PRODUCTS = [
  {
    id: 'yas-001',
    sku: 'YAS-SIGN-01',
    title: 'Noor-e-Kashmir Black & Rust Embroidered 3-Piece Silk Lawn',
    category: 'luxury-pret',
    categoryLabel: 'Luxury Prêt',
    type: '3 Piece Embroidered Suit',
    price: 10850,
    originalPrice: 13500,
    tag: 'SIGNATURE EDIT',
    image: '/products/yasraf-meerab-black-1.png',
    secondaryImage: '/products/yasraf-meerab-black-2.jpg',
    gallery: [
      '/products/yasraf-meerab-black-1.png',
      '/products/yasraf-meerab-black-2.jpg',
      '/products/yasraf-real-1.jpg'
    ],
    rating: 5.0,
    reviewsCount: 84,
    isNew: true,
    isBestSeller: true,
    showInNewArrivals: true,
    showInSignatureEdit: true,
    show_in_new_arrivals: true,
    show_in_signature_edit: true,
    inStock: true,
    stockStatus: 'in_stock',
    stockCount: 14,
    fabricCategory: 'Egyptian Lawn',
    occasion: 'Luxury Prêt',
    colors: [
      { name: 'Onyx & Rust', hex: '#1e1c1b' },
      { name: 'Deep Ochre', hex: '#633d26' }
    ],
    sizes: ['Unstitched', 'XS', 'S', 'M', 'L', 'XL'],
    fabric: 'Digital printed 80/80 Egyptian Lawn with Handcrafted Schiffli Cotton Lace Insets, Organza Embroidered Floral Cuffs, Pure Printed Silk/Voile Dupatta, and Dyed Trousers with Scalloped Lace Hem.',
    includes: 'Digital Printed & Embroidered Lawn Shirt (3.15m), Printed Pure Silk Dupatta (2.5m), Dyed/Printed Trousers (2.5m), Handcrafted Neckline Lace & Tassel Insets.',
    careInstructions: 'Gentle cold hand wash or delicate dry clean. Avoid direct sunlight drying.',
    description: 'The crowning signature silhouette of Yasraf Clothing. An enchanting palette of deep midnight black adorned with rich botanical floral embroidery, complemented by an opulent printed silk shawl drape.'
  },
  {
    id: 'yas-002',
    sku: 'YAS-FEST-02',
    title: 'Firouzeh Emerald Embroidered Festive Organza & Lawn 3-Piece',
    category: 'party-wear',
    categoryLabel: 'Party Wear',
    type: '3 Piece Festive Suit',
    price: 12950,
    originalPrice: 15900,
    tag: 'FESTIVE COUTURE',
    image: '/products/yasraf-emerald-green-1.png',
    secondaryImage: '/products/yasraf-emerald-green-2.jpg',
    gallery: [
      '/products/yasraf-emerald-green-1.png',
      '/products/yasraf-emerald-green-2.jpg',
      '/products/yasraf-emerald-green-3.jpg'
    ],
    rating: 5.0,
    reviewsCount: 62,
    isNew: true,
    isBestSeller: true,
    showInNewArrivals: true,
    showInSignatureEdit: false,
    show_in_new_arrivals: true,
    show_in_signature_edit: false,
    inStock: true,
    stockStatus: 'in_stock',
    stockCount: 9,
    fabricCategory: 'Organza',
    occasion: 'Party Wear',
    colors: [
      { name: 'Emerald Jewel', hex: '#16503c' }
    ],
    sizes: ['Unstitched', 'XS', 'S', 'M', 'L'],
    fabric: 'Lustrous Emerald Lawn with intricate Ton-Sur-Ton Resham Threadwork, Organza Cutwork Sleeve Insets, Matching Embroidered Cigarette Pants, and Diaphanous Printed Dupatta.',
    includes: 'Embroidered Lawn Shirt (3.1m), Pure Voile Dupatta (2.5m), Dyed Trousers (2.5m), Organza Lace Trims.',
    careInstructions: 'Dry clean recommended to preserve hand-embellished threadwork.',
    description: 'A regal jewel-toned emerald ensemble capturing traditional subcontinent craftsmanship. Decorated with ton-sur-ton silk thread floral motifs and laser-cut organza details.'
  },
  {
    id: 'yas-003',
    sku: 'YAS-LAWN-03',
    title: 'Zehra Plum Rose Schiffli Embroidered 3-Piece Luxury Lawn',
    category: 'ready-to-wear',
    categoryLabel: 'Ready to Wear',
    type: '3 Piece Embroidered Suit',
    price: 9850,
    originalPrice: 12900,
    tag: 'BESTSELLER',
    image: '/products/yasraf-real-1.jpg',
    secondaryImage: '/products/yasraf-real-2.jpg',
    gallery: [
      '/products/yasraf-real-1.jpg',
      '/products/yasraf-real-2.jpg',
      '/products/yasraf-real-3.jpg',
      '/products/yasraf-real-4.jpg',
      '/products/yasraf-real-5.jpg'
    ],
    rating: 4.9,
    reviewsCount: 96,
    isNew: false,
    isBestSeller: true,
    showInNewArrivals: false,
    showInSignatureEdit: true,
    show_in_new_arrivals: false,
    show_in_signature_edit: true,
    inStock: true,
    stockStatus: 'in_stock',
    stockCount: 18,
    fabricCategory: 'Egyptian Lawn',
    occasion: 'Ready to Wear',
    colors: [
      { name: 'Plum Rose', hex: '#582138' },
      { name: 'Burgundy Wine', hex: '#421424' }
    ],
    sizes: ['Unstitched', 'S', 'M', 'L', 'XL'],
    fabric: '80/80 Combed Egyptian Lawn with pristine white Schiffli Lace placket, Embroidered Organza wristlets, and Pure Chiffon Silk Dupatta.',
    includes: 'Embroidered Shirt (3.15m), Printed Voile/Silk Dupatta (2.5m), Dyed Trousers (2.5m).',
    careInstructions: 'Gentle hand wash cold. Low iron.',
    description: 'One of Yasraf Clothing\'s most beloved signature creations. Luxurious botanical roses rendered in rich plum shades with crisp white lace insets and floral embroidered organza.'
  },
  {
    id: 'yas-004',
    sku: 'YAS-FEST-04',
    title: 'Shahana Royal Courtyard Violet Schiffli Luxury Lawn',
    category: 'party-wear',
    categoryLabel: 'Party Wear',
    type: '3 Piece Festive Suit',
    price: 13490,
    originalPrice: 16800,
    tag: 'PALACE EDIT',
    image: '/products/yasraf-violet-court-2.jpg',
    secondaryImage: '/products/yasraf-violet-court-3.jpg',
    gallery: [
      '/products/yasraf-violet-court-2.jpg',
      '/products/yasraf-violet-court-3.jpg'
    ],
    rating: 5.0,
    reviewsCount: 47,
    isNew: true,
    isBestSeller: true,
    showInNewArrivals: true,
    showInSignatureEdit: false,
    show_in_new_arrivals: true,
    show_in_signature_edit: false,
    inStock: true,
    stockStatus: 'low_stock',
    stockCount: 3,
    fabricCategory: 'Pure Silk',
    occasion: 'Party Wear',
    colors: [
      { name: 'Royal Violet', hex: '#634b82' },
      { name: 'Lavender Mist', hex: '#9d88b8' }
    ],
    sizes: ['Unstitched', 'XS', 'S', 'M', 'L'],
    fabric: 'Heavy Embroidered Lawn with intricate Schiffli Cutwork panels, scalloped neckline, embroidered daman border, and pure printed silk dupatta.',
    includes: 'Schiffli Embroidered Shirt (3.2m), Finished Silk Dupatta (2.5m), Tailored Trouser Fabric (2.5m).',
    careInstructions: 'Dry clean only.',
    description: 'Captured in grand heritage courtyard aesthetics, this heirloom lavender violet 3-piece suit showcases all-over Schiffli cutwork embroidery, scalloped neckline, and pure silk printed dupatta.'
  },
  {
    id: 'yas-005',
    sku: 'YAS-PRET-05',
    title: 'Gul-e-Dawood Saffron Mustard & Black Floral Silk Lawn',
    category: 'ready-to-wear',
    categoryLabel: 'Ready to Wear',
    type: '2 Piece Luxury Prêt',
    price: 8490,
    originalPrice: 10900,
    tag: 'READY TO WEAR',
    image: '/products/yasraf-saffron-yellow-1.png',
    secondaryImage: '/products/yasraf-saffron-yellow-2.jpg',
    gallery: [
      '/products/yasraf-saffron-yellow-1.png',
      '/products/yasraf-saffron-yellow-2.jpg'
    ],
    rating: 4.9,
    reviewsCount: 53,
    isNew: true,
    isBestSeller: true,
    showInNewArrivals: true,
    showInSignatureEdit: false,
    show_in_new_arrivals: true,
    show_in_signature_edit: false,
    inStock: true,
    stockStatus: 'in_stock',
    stockCount: 11,
    fabricCategory: 'Egyptian Lawn',
    occasion: 'Ready to Wear',
    colors: [
      { name: 'Saffron Mustard', hex: '#d49b28' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: 'Pre-stitched Premium Lawn Kurta with Statement Sleeve Bow-Ties, Keyhole Neckline, and Botanical Printed Silk Dupatta.',
    includes: 'Stitched Kurta & Matching Pants.',
    careInstructions: 'Machine wash delicate or hand wash cold.',
    description: 'Striking saffron mustard and ivory monochrome floral silhouette. Tailored with statement sleeve tie-ribbons, split keyhole neckline, and a contrasting botanical printed silk dupatta.'
  },
  {
    id: 'yas-006',
    sku: 'YAS-PRET-06',
    title: 'Zardozi Noir Hand-Embroidered Raw Silk Luxury Kurta',
    category: 'luxury-pret',
    categoryLabel: 'Luxury Prêt',
    type: '1 Piece Stitched Kurti',
    price: 7950,
    originalPrice: 9500,
    tag: 'HAUTE PRET',
    image: '/products/yasraf-zardozi-black-1.png',
    secondaryImage: '/products/yasraf-meerab-black-1.png',
    gallery: [
      '/products/yasraf-zardozi-black-1.png',
      '/products/yasraf-meerab-black-1.png'
    ],
    rating: 4.9,
    reviewsCount: 38,
    isNew: true,
    isBestSeller: false,
    showInSignatureEdit: true,
    showInNewArrivals: false,
    show_in_signature_edit: true,
    show_in_new_arrivals: false,
    inStock: true,
    stockStatus: 'in_stock',
    stockCount: 7,
    fabricCategory: 'Raw Silk',
    occasion: 'Luxury Prêt',
    colors: [
      { name: 'Midnight Black & Gold', hex: '#111111' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: 'Pure Raw Silk Blend Kurta with antique Gold Zari & Tilla hand embroidery along neckline, hem, and flared sleeves.',
    includes: 'Stitched Raw Silk Kurti.',
    careInstructions: 'Dry clean recommended.',
    description: 'Pure midnight black silhouette illuminated with authentic antique gold zardozi and tilla hand-embroidery along the split neckline and dramatic flared sleeve borders.'
  },
  {
    id: 'yas-007',
    sku: 'YAS-LAWN-07',
    title: 'Daria Sage Green Chikan & Organza 3-Piece Luxury Suit',
    category: 'ready-to-wear',
    categoryLabel: 'Ready to Wear',
    type: '3 Piece Embroidered Suit',
    price: 9450,
    originalPrice: 11800,
    tag: 'LIMITED DROP',
    image: '/products/yasraf-sage-green-1.jpg',
    secondaryImage: '/products/yasraf-sage-green-2.jpg',
    gallery: [
      '/products/yasraf-sage-green-1.jpg',
      '/products/yasraf-sage-green-2.jpg'
    ],
    rating: 4.8,
    reviewsCount: 41,
    isNew: true,
    isBestSeller: false,
    showInSignatureEdit: true,
    showInNewArrivals: false,
    show_in_signature_edit: true,
    show_in_new_arrivals: false,
    inStock: true,
    stockStatus: 'in_stock',
    stockCount: 8,
    fabricCategory: 'Organza',
    occasion: 'Ready to Wear',
    colors: [
      { name: 'Sage Green', hex: '#688c75' }
    ],
    sizes: ['Unstitched', 'S', 'M', 'L'],
    fabric: 'Dense Schiffli Chikan Embroidered Lawn with Organza Cutwork Bodice, Dyed Trousers, and Printed Organza Dupatta.',
    includes: 'Embroidered Lawn Shirt (3m), Organza Dupatta (2.5m), Dyed Trouser (2.5m).',
    careInstructions: 'Dry clean or cold delicate wash.',
    description: 'Misty sage green ensemble featuring dense schiffli chikan embroidery with mirror-work highlights, paired with dyed trousers and a contrasting printed organza dupatta.'
  },
  {
    id: 'yas-008',
    sku: 'YAS-FEST-08',
    title: 'Neelam Peacock Teal Metallic Embroidered 3-Piece Suit',
    category: 'winter-collection',
    categoryLabel: 'Winter Collection',
    type: '3 Piece Festive Suit',
    price: 11900,
    originalPrice: 14500,
    tag: 'ROYAL EDIT',
    image: '/products/yasraf-peacock-teal-1.jpg',
    secondaryImage: '/products/yasraf-peacock-teal-3.jpg',
    gallery: [
      '/products/yasraf-peacock-teal-1.jpg',
      '/products/yasraf-peacock-teal-2.jpg',
      '/products/yasraf-peacock-teal-3.jpg'
    ],
    rating: 5.0,
    reviewsCount: 52,
    isNew: true,
    isBestSeller: true,
    showInSignatureEdit: true,
    showInNewArrivals: false,
    show_in_signature_edit: true,
    show_in_new_arrivals: false,
    inStock: true,
    stockStatus: 'in_stock',
    stockCount: 6,
    fabricCategory: 'Pure Silk',
    occasion: 'Party Wear',
    colors: [
      { name: 'Peacock Teal', hex: '#1b4d5a' }
    ],
    sizes: ['Unstitched', 'S', 'M', 'L'],
    fabric: 'Premium Peacock Blue Lawn with Gilded Resham & Metallic Thread Embroidery, Pure Organza Printed Dupatta with Zari Borders.',
    includes: 'Embroidered Shirt (3m), Organza Dupatta (2.5m), Dyed Trousers (2.5m).',
    careInstructions: 'Dry clean only.',
    description: 'Deep peacock teal fabric embellished with golden zari thread embroidery across the bodice and sleeves, finished with a sheer organza floral dupatta and pearl-embellished border.'
  },
  {
    id: 'yas-009',
    sku: 'YAS-PRET-09',
    title: 'Chandni Ivory & Onyx Monochrome Embroidered 2-Piece Lawn',
    category: 'ready-to-wear',
    categoryLabel: 'Ready to Wear',
    type: '2 Piece Luxury Prêt',
    price: 6850,
    originalPrice: 8200,
    tag: 'MONOCHROME',
    image: '/products/yasraf-ivory-onyx-1.jpg',
    secondaryImage: '/products/yasraf-ivory-onyx-2.jpg',
    gallery: [
      '/products/yasraf-ivory-onyx-1.jpg',
      '/products/yasraf-ivory-onyx-2.jpg'
    ],
    rating: 4.8,
    reviewsCount: 34,
    isNew: false,
    isBestSeller: true,
    inStock: true,
    stockStatus: 'in_stock',
    stockCount: 16,
    fabricCategory: 'Cotton Cambric',
    occasion: 'Ready to Wear',
    colors: [
      { name: 'Ivory & Onyx', hex: '#eceae3' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: 'Breathable Pure Cotton Lawn with high-contrast Black Resham Floral Threadwork and Schiffli Embroidered Daman and Sleeve borders.',
    includes: 'Stitched Kurta & Straight Pants.',
    careInstructions: 'Machine wash delicate. Cool iron.',
    description: 'Timeless minimal chic. Breathable ivory cotton lawn adorned with high-contrast black resham floral threadwork and scalloped embroidered border.'
  },
  {
    id: 'yas-010',
    sku: 'YAS-LAWN-10',
    title: 'Zehra Mauve & White Paisley Embroidered 3-Piece Suit',
    category: 'winter-collection',
    categoryLabel: 'Winter Collection',
    type: '3 Piece Embroidered Suit',
    price: 8950,
    originalPrice: 11200,
    tag: 'WINTER EDIT',
    image: '/products/yasraf-mauve-paisley-1.jpg',
    secondaryImage: '/products/yasraf-mauve-paisley-2.jpg',
    gallery: [
      '/products/yasraf-mauve-paisley-1.jpg',
      '/products/yasraf-mauve-paisley-2.jpg',
      '/products/yasraf-mauve-paisley-3.jpg'
    ],
    rating: 4.9,
    reviewsCount: 65,
    isNew: false,
    isBestSeller: true,
    inStock: true,
    stockStatus: 'in_stock',
    stockCount: 12,
    fabricCategory: 'Chiffon',
    occasion: 'Ready to Wear',
    colors: [
      { name: 'Dusty Mauve', hex: '#87677b' }
    ],
    sizes: ['Unstitched', 'S', 'M', 'L'],
    fabric: 'Swiss Voile Cotton Lawn with delicate White Paisley Threadwork embroidery on placket, daman, and four-sided dupatta borders.',
    includes: 'Embroidered Lawn Shirt (3m), Voile Dupatta (2.5m), Trousers (2.5m).',
    careInstructions: 'Hand wash cold. Medium iron.',
    description: 'Enchanting dusty mauve base featuring white paisley daman embroidery, organza sleeve borders, matching trousers and printed dupatta.'
  },
  {
    id: 'yas-011',
    sku: 'YAS-LAWN-11',
    title: 'Falak Glacier Blue Floral Fringed Lace Lawn Ensemble',
    category: 'luxury-pret',
    categoryLabel: 'Luxury Prêt',
    type: '3 Piece Embroidered Suit',
    price: 9250,
    originalPrice: 11500,
    tag: 'PASTEL EDIT',
    image: '/products/yasraf-glacier-blue-1.jpg',
    secondaryImage: '/products/yasraf-glacier-blue-2.jpg',
    gallery: [
      '/products/yasraf-glacier-blue-1.jpg',
      '/products/yasraf-glacier-blue-2.jpg',
      '/products/yasraf-glacier-blue-3.jpg'
    ],
    rating: 4.9,
    reviewsCount: 44,
    isNew: true,
    isBestSeller: true,
    inStock: true,
    stockStatus: 'in_stock',
    stockCount: 10,
    fabricCategory: 'Chiffon',
    occasion: 'Luxury Prêt',
    colors: [
      { name: 'Glacier Blue', hex: '#8faec2' }
    ],
    sizes: ['Unstitched', 'S', 'M', 'L', 'XL'],
    fabric: 'Fine Pastel Blue Lawn with Digital Floral Infusions, Handcrafted White Fringed Lace Cuffs & Hem, and Chiffon Dupatta.',
    includes: 'Printed Lawn Shirt (3m), Chiffon Dupatta (2.5m), Trouser Fabric (2.5m), Fringed Lace Edging.',
    careInstructions: 'Delicate hand wash.',
    description: 'Pastel glacier blue floral printed lawn adorned with delicate white threadwork and luxurious fringed lace edging on sleeves, daman, and silk dupatta.'
  },
  {
    id: 'yas-012',
    sku: 'YAS-PRET-12',
    title: 'Parizad Blush Pink Butterfly Schiffli Stitched Kurta Set',
    category: 'ready-to-wear',
    categoryLabel: 'Ready to Wear',
    type: '2 Piece Luxury Prêt',
    price: 7490,
    originalPrice: 8990,
    tag: 'NEW ARRIVAL',
    image: '/products/yasraf-blush-butterfly-1.jpg',
    secondaryImage: '/products/yasraf-peach-tangerine-1.jpg',
    gallery: [
      '/products/yasraf-blush-butterfly-1.jpg',
      '/products/yasraf-peach-tangerine-1.jpg'
    ],
    rating: 4.8,
    reviewsCount: 31,
    isNew: true,
    isBestSeller: false,
    inStock: true,
    stockStatus: 'low_stock',
    stockCount: 2,
    fabricCategory: 'Cotton Cambric',
    occasion: 'Casual',
    colors: [
      { name: 'Blush Rose', hex: '#e3b3b8' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: 'Fine Cotton Cambric Kurta with Butterfly Schiffli Cutwork motifs, scalloped hemline, and tailored culottes.',
    includes: 'Stitched Kurta & Trouser.',
    careInstructions: 'Machine wash gentle. Medium iron.',
    description: 'Pastel blush pink kurta tailored with intricate butterfly cutwork embroidery, scalloped lace hemline, and relaxed palazzo trousers.'
  }
];

export const CATEGORIES = [
  {
    id: 'ready-to-wear',
    title: 'Ready To Wear',
    subtitle: 'Tailored Kurtas & 2-Piece Sets',
    image: '/products/yasraf-saffron-yellow-1.png',
    count: 'Curated Pret',
    link: '#catalog'
  },
  {
    id: 'luxury-pret',
    title: 'Luxury Prêt',
    subtitle: 'Signature Silk & Chiffon Edits',
    image: '/products/yasraf-meerab-black-1.png',
    count: 'Haute Pret',
    link: '#catalog'
  },
  {
    id: 'party-wear',
    title: 'Party Wear & Festive',
    subtitle: 'Hand-Embroidered Zardozi Formals',
    image: '/products/yasraf-emerald-green-1.png',
    count: 'Festive Wear',
    link: '#catalog'
  },
  {
    id: 'winter-collection',
    title: 'Winter Collection',
    subtitle: 'Heirloom Shawls & Rich Tones',
    image: '/products/yasraf-violet-court-2.jpg',
    count: 'Winter Warmth',
    link: '#catalog'
  }
];

export const STORIES = [
  {
    id: 'story-1',
    title: "Signature '26",
    tag: 'SIGNATURE',
    previewImage: '/products/yasraf-meerab-black-1.png',
    stories: [
      {
        image: '/products/yasraf-meerab-black-1.png',
        heading: 'Noor-e-Kashmir Signature Edition',
        caption: 'Handcrafted Egyptian lawn infused with rich rust botanical floral prints, Schiffli lace, and pure silk dupatta.',
        cta: 'Shop The Drop'
      },
      {
        image: '/products/yasraf-meerab-black-2.jpg',
        heading: 'Artisanal Studio Photoshoot',
        caption: 'Exquisite attention to every seam, tassel cord, and scalloped lace hemline.',
        cta: 'View Details'
      }
    ]
  },
  {
    id: 'story-2',
    title: 'Royal Palace',
    tag: 'EDITORIAL',
    previewImage: '/products/yasraf-violet-court-2.jpg',
    stories: [
      {
        image: '/products/yasraf-violet-court-2.jpg',
        heading: 'Runway Look: Royal Violet',
        caption: 'Shot on location in grand heritage courtyards. Experience authentic Pakistani luxury lawn.',
        cta: 'Shop Palace Edit'
      },
      {
        image: '/products/yasraf-violet-court-2.jpg',
        heading: 'Intricate Schiffli Cutwork',
        caption: 'Delicate tone-on-tone embroidery on lightweight, breathable summer lawn.',
        cta: 'Explore More'
      }
    ]
  },
  {
    id: 'story-3',
    title: 'Firouzeh Green',
    tag: 'FESTIVE',
    previewImage: '/products/yasraf-emerald-green-1.png',
    stories: [
      {
        image: '/products/yasraf-emerald-green-1.png',
        heading: 'Firouzeh Emerald Luxury',
        caption: 'Enchanting jewel-toned festive 3-piece with organza sleeve cutwork and rich dupatta borders.',
        cta: 'View Festive'
      },
      {
        image: '/products/yasraf-emerald-green-2.jpg',
        heading: 'Exquisite Threadwork Bodice',
        caption: 'Precision resham stitching designed to stun at daytime and evening occasions.',
        cta: 'Shop The Look'
      }
    ]
  },
  {
    id: 'story-4',
    title: 'Saffron Chic',
    tag: 'READY TO WEAR',
    previewImage: '/products/yasraf-saffron-yellow-1.png',
    stories: [
      {
        image: '/products/yasraf-saffron-yellow-1.png',
        heading: 'Gul-e-Dawood Saffron Prêt',
        caption: 'Statement sleeve ribbon ties, breathable summer lawn, and a lavish floral dupatta.',
        cta: 'View Prêt Sets'
      },
      {
        image: '/products/yasraf-saffron-yellow-2.jpg',
        heading: 'Effortless Modern Silhouette',
        caption: 'Tailored for university, work, and celebratory family dinners.',
        cta: 'Shop Prêt'
      }
    ]
  },
  {
    id: 'story-5',
    title: 'Plum Rose',
    tag: 'HERITAGE',
    previewImage: '/products/yasraf-real-1.jpg',
    stories: [
      {
        image: '/products/yasraf-real-1.jpg',
        heading: 'The Iconic Zehra Plum Rose',
        caption: 'Our signature silhouette that started a revolution in luxury botanical lawn.',
        cta: 'Shop Zehra'
      },
      {
        image: '/products/yasraf-real-2.jpg',
        heading: 'Pure Handcrafted Craftsmanship',
        caption: 'Organza floral appliques and heirloom lace insets.',
        cta: 'Explore Details'
      }
    ]
  }
];

export const REVIEWS = [
  {
    id: 1,
    name: 'Ayesha Tariq',
    city: 'Gulberg, Lahore',
    verified: true,
    rating: 5,
    title: 'Fabric quality is outstanding',
    comment: 'I ordered the Noor-e-Kashmir 3-piece lawn. The print clarity and feel of the Egyptian lawn is superb. Delivery in Lahore took only 24 hours. Truly impressed!',
    date: '3 days ago',
    product: 'Noor-e-Kashmir Black & Rust Embroidered 3-Piece'
  },
  {
    id: 2,
    name: 'Mahnoor Khan',
    city: 'DHA Phase 6, Karachi',
    verified: true,
    rating: 5,
    title: 'Stitching and fall of the Firouzeh Emerald is flawless',
    comment: 'The collar and sleeve finishing on the Emerald festive suit is razor sharp. I got so many compliments at my family dinner. Yasraf Clothing has won a permanent customer!',
    date: '1 week ago',
    product: 'Firouzeh Emerald Embroidered Festive Organza & Lawn'
  },
  {
    id: 3,
    name: 'Zainab Qureshi',
    city: 'F-7, Islamabad',
    verified: true,
    rating: 5,
    title: 'The Royal Courtyard Violet is a true masterpiece',
    comment: 'Wore the Shahana Violet lawn to an afternoon hi-tea in Islamabad. Everyone kept asking where I bought it from. The Schiffli cutwork lace is completely authentic!',
    date: '2 weeks ago',
    product: 'Shahana Royal Courtyard Violet Schiffli Luxury Lawn'
  },
  {
    id: 4,
    name: 'Sara Siddiqui',
    city: 'Dubai, UAE',
    verified: true,
    rating: 5,
    title: 'Fast international delivery to Dubai',
    comment: 'Received my festive parcel via DHL within 4 days. The packaging box with the gold embossed logo was like unwrapping a luxury designer item.',
    date: '2 weeks ago',
    product: 'Zehra Plum Rose Schiffli Embroidered 3-Piece'
  }
];

export const LOOKBOOK_HOTSPOTS = [
  {
    id: 1,
    x: 48,
    y: 35,
    title: 'Schiffli Cutwork Lace Placket',
    sku: 'YAS-LOOK-NECK',
    price: 'Rs. 4,950',
    desc: 'Intricate white cotton lace placket with delicate tassel tie cord.'
  },
  {
    id: 2,
    x: 23,
    y: 43,
    title: 'Embroidered Organza Sleeve Cuffs',
    sku: 'YAS-LOOK-SLEEVE',
    price: 'Rs. 2,850',
    desc: 'Floral resham embroidery appliqued onto organza lace cuffs.'
  },
  {
    id: 3,
    x: 75,
    y: 72,
    title: 'Digital Floral Voile Dupatta',
    sku: 'YAS-LOOK-DUP',
    price: 'Rs. 3,450',
    desc: 'Featherweight pure voile/silk dupatta with botanical roses.'
  },
  {
    id: 4,
    x: 48,
    y: 84,
    title: 'Scalloped Schiffli Lace Hem',
    sku: 'YAS-LOOK-HEM',
    price: 'Rs. 2,200',
    desc: 'Hand-cut white Schiffli lace border trimming the shirt and trousers.'
  }
];
