import React from 'react';

const NEW_IN_PRODUCTS = [
  {
    id: 'new-in-loom',
    title: 'Loom',
    category: '3-Piece Suit',
    price: 9890,
    priceFormatted: 'Rs. 9,890',
    image: '/images/new-in-loom.jpg',
    description: 'Contemporary luxury ivory raw-silk relaxed three-piece suit with artisanal threadwork.'
  },
  {
    id: 'new-in-zephyr',
    title: 'Zephyr',
    category: 'Shrug & Co-ord',
    price: 11500,
    priceFormatted: 'Rs. 11,500',
    image: '/images/new-in-zephyr.jpg',
    description: 'Flowing silk-linen shrug and tailored tunic in warm terracotta with tonal embroidery.'
  },
  {
    id: 'new-in-nocturne',
    title: 'Nocturne',
    category: 'Evening Prêt',
    price: 14200,
    priceFormatted: 'Rs. 14,200',
    image: '/images/new-in-nocturne.jpg',
    description: 'Exquisite midnight-black luxury raw silk three-piece ensemble with intricate tonal neckline work.'
  },
  {
    id: 'new-in-solstice',
    title: 'Solstice',
    category: 'Signature Set',
    price: 12800,
    priceFormatted: 'Rs. 12,800',
    image: '/images/new-in-solstice.jpg',
    description: 'Contemporary luxury pistachio sage-green silk co-ord set with delicate metallic threadwork.'
  }
];

export default function NewInCollection({ onQuickView, onDiscover }) {
  const handleDiscoverClick = (e) => {
    e.preventDefault();
    if (onDiscover) {
      onDiscover();
    } else {
      const el = document.getElementById('collections') || document.getElementById('new-arrivals');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProductClick = (product) => {
    if (onQuickView) {
      onQuickView({
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: Math.round(product.price * 1.2),
        image: product.image,
        images: [product.image],
        category: 'pret',
        categoryLabel: product.category,
        fabric: 'Raw Silk & Fine Linen',
        description: product.description,
        inStock: true,
        stockStatus: 'in_stock',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [{ name: 'Default', hex: '#d4c5b9' }]
      });
    }
  };

  return (
    <section className="w-full bg-[#fbfaf8] py-16 sm:py-24 lg:py-28 border-b border-neutral-200/50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        
        {/* Header Typography */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl text-neutral-900 font-normal tracking-tight mb-3"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            New In: <span className="italic font-light">Time Out</span>
          </h2>
          <a 
            href="#collections" 
            onClick={handleDiscoverClick}
            className="text-[11px] uppercase tracking-[0.25em] font-medium text-neutral-900 border-b border-neutral-900 pb-1 hover:opacity-70 transition-opacity inline-block cursor-pointer"
          >
            DISCOVER THE PRODUCTS
          </a>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
          {NEW_IN_PRODUCTS.map((product) => (
            <div 
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="group relative cursor-pointer overflow-hidden aspect-[3/4] bg-[#f4f1ea] shadow-sm"
            >
              <img 
                src={product.image} 
                alt={product.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Frosted / Light Semi-Transparent Hover Overlay */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out flex flex-col items-center justify-center text-center p-6 z-10">
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-medium mb-2">
                  {product.category}
                </span>
                <h3 
                  className="text-2xl sm:text-3xl text-neutral-900 font-normal tracking-wide mb-2"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                >
                  {product.title}
                </h3>
                <p 
                  className="text-base sm:text-lg text-neutral-800 font-serif mb-6"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                >
                  {product.priceFormatted}
                </p>
                <span className="text-[11px] uppercase tracking-[0.25em] font-medium text-neutral-900 border-b border-neutral-900 pb-1 hover:opacity-70 transition-opacity">
                  VIEW NOW
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
