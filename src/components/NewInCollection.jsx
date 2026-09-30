import React from 'react';

const NEW_IN_PRODUCTS = [
  {
    id: 'new-in-mehraab',
    title: 'Mehraab',
    category: '3-Piece Suit',
    price: 9890,
    priceFormatted: 'Rs. 9,890',
    image: '/images/new-in-loom.jpg',
    description: 'Contemporary luxury ivory raw-silk relaxed three-piece suit with hand-finished cutwork accents.'
  },
  {
    id: 'new-in-gulzar',
    title: 'Gulzar',
    category: 'Shrug & Co-ord',
    price: 11500,
    priceFormatted: 'Rs. 11,500',
    image: '/images/new-in-zephyr.jpg',
    description: 'Flowing modal-linen overlay and tailored tunic in warm terracotta with artisanal thread embroidery.'
  },
  {
    id: 'new-in-shab-e-noor',
    title: 'Shab-e-Noor',
    category: 'Evening Prêt',
    price: 14200,
    priceFormatted: 'Rs. 14,200',
    image: '/images/new-in-nocturne.jpg',
    description: 'Exquisite midnight-obsidian raw silk three-piece ensemble adorned with subtle neckline artistry.'
  },
  {
    id: 'new-in-rawayat',
    title: 'Rawayat',
    category: 'Signature Set',
    price: 12800,
    priceFormatted: 'Rs. 12,800',
    image: '/images/new-in-solstice.jpg',
    description: 'Luxe pistachio sage silk-blend co-ord set accented with refined metallic zari motifs.'
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
      <div className="max-w-[2000px] mx-auto px-2 sm:px-4 lg:px-8">
        
        {/* Header Typography with Light Heading Color */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 
            className="text-[28px] sm:text-[34px] lg:text-[38px] text-[#67615c] font-light tracking-tight mb-2"
            style={{ fontFamily: 'var(--font-family-editorial)', color: '#67615c' }}
          >
            New In: <span className="italic font-light text-[#857d74]">The Silk Edit</span>
          </h2>
          <a 
            href="#collections" 
            onClick={handleDiscoverClick}
            className="text-[11.5px] uppercase tracking-[0.18em] font-medium text-[#67615c] border-b border-[#67615c]/60 pb-[3px] hover:text-[#1a1814] hover:border-[#1a1814] transition-colors inline-block cursor-pointer"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            DISCOVER THE CAPSULE
          </a>
        </div>

        {/* Responsive Grid with 2/3 Aspect Ratio */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-3.5">
          {NEW_IN_PRODUCTS.map((product) => (
            <div key={product.id} className="flex flex-col">
              <div 
                onClick={() => handleProductClick(product)}
                className="group jm-card relative cursor-pointer overflow-hidden bg-[#ebe6e0] text-center w-full"
                style={{ aspectRatio: '2 / 3' }}
              >
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover object-[center_18%] transition-all duration-500 ease-out group-hover:opacity-[0.14] group-hover:scale-[1.02]"
                  loading="lazy"
                />

                {/* Ghost Hover Overlay Matching Jahaan */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 p-4 sm:p-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out pointer-events-none">
                  <h3 
                    className="text-[20px] sm:text-[22px] text-[#1a1814] font-normal leading-[1.25] tracking-normal max-w-[90%]"
                    style={{ fontFamily: 'var(--font-family-editorial)' }}
                  >
                    {product.title}
                  </h3>
                  <div 
                    className="flex items-center justify-center gap-2 text-[13px] text-[#67615c] tracking-[0.04em]"
                    style={{ fontFamily: 'var(--font-family-primary)' }}
                  >
                    <span className="font-normal text-[#1a1814]">
                      {product.priceFormatted}
                    </span>
                    <span className="text-[11px] font-medium text-[#a4574b] tracking-[0.1em] uppercase">
                      10% OFF
                    </span>
                  </div>
                  <span 
                    className="mt-1 pb-[3px] border-b border-[#1a1814] text-[11px] font-medium tracking-[0.18em] uppercase text-[#1a1814]"
                    style={{ fontFamily: 'var(--font-family-primary)' }}
                  >
                    VIEW NOW
                  </span>
                </div>
              </div>

              {/* Mobile Title & Price under card */}
              <div 
                onClick={() => handleProductClick(product)}
                className="mt-2.5 px-1 text-center md:hidden cursor-pointer"
              >
                <h3 
                  className="text-[14px] text-[#1a1814] font-normal leading-tight tracking-wide"
                  style={{ fontFamily: 'var(--font-family-editorial)' }}
                >
                  {product.title}
                </h3>
                <div 
                  className="mt-1 flex items-center justify-center gap-1.5 text-[11.5px] text-[#67615c]"
                  style={{ fontFamily: 'var(--font-family-primary)' }}
                >
                  <span className="font-normal text-[#1a1814]">
                    {product.priceFormatted}
                  </span>
                  <span className="text-[10px] font-medium tracking-wide uppercase text-[#a4574b]">
                    10% OFF
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
