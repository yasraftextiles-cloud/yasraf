import React from 'react';

const LOOKBOOK_ITEMS = [
  {
    id: 1,
    title: '3-Piece Suits',
    subtitle: 'EXPLORE',
    image: '/images/lookbook-3piece.jpg',
    categoryTarget: 'luxury-pret'
  },
  {
    id: 2,
    title: 'Shrugs',
    subtitle: 'EXPLORE',
    image: '/images/lookbook-shrugs.jpg',
    categoryTarget: 'ready-to-wear'
  },
  {
    id: 3,
    title: 'Twin Sets',
    subtitle: 'EXPLORE',
    image: '/images/lookbook-twinsets.jpg',
    categoryTarget: 'ready-to-wear'
  }
];

export default function CategoryLookbook({ onSelectCategory }) {
  const handleItemClick = (categoryTarget) => {
    if (onSelectCategory) {
      onSelectCategory(categoryTarget);
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {LOOKBOOK_ITEMS.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item.categoryTarget)}
            className="group relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[2/3] w-full overflow-hidden bg-neutral-900 cursor-pointer"
          >
            {/* Seamless full-height image */}
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Seamless upward gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

            {/* Pinned Editorial Typography (Strictly White & Cormorant Garamond) */}
            <div className="absolute bottom-6 left-6 z-20 text-left">
              <h3 
                className="text-2xl sm:text-3xl font-light tracking-wide leading-tight mb-2 drop-shadow-lg"
                style={{ 
                  color: '#ffffff', 
                  fontFamily: '"Cormorant Garamond", Georgia, serif' 
                }}
              >
                {item.title}
              </h3>
              <span className="text-[11px] font-medium tracking-[0.25em] text-[#dfc7a7] uppercase group-hover:text-white group-hover:tracking-[0.3em] transition-all duration-300 block">
                EXPLORE &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

