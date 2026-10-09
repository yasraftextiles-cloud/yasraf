import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const COLLECTIONS = [
  {
    id: 'unstitched',
    title: 'Unstitched',
    category: 'unstitched',
    image: '/images/collection-unstitched.jpg',
    tag: 'UNSTITCHED'
  },
  {
    id: 'ready-to-wear',
    title: 'Ready to Wear',
    category: 'ready-to-wear',
    image: '/images/collection-ready-to-wear.jpg',
    tag: 'READY TO WEAR'
  },
  {
    id: 'summer',
    title: 'Summer',
    category: 'summer',
    image: '/images/collection-summer.jpg',
    tag: 'SUMMER'
  },
  {
    id: 'festive',
    title: 'Festive',
    category: 'festive',
    image: '/images/collection-festive.jpg',
    tag: 'FESTIVE WEAR'
  },
  {
    id: 'winter',
    title: 'Winter',
    category: 'winter-collection',
    image: '/images/collection-winter.jpg',
    tag: 'WINTER'
  }
];

export default function ShopByCollection({ onSelectCollection }) {
  const sliderRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(1, Math.max(0, scrollLeft / maxScroll)));
    }
  };

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.7;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleItemClick = (col) => {
    if (onSelectCollection) {
      onSelectCollection(col.category || col.id);
    } else {
      const el = document.getElementById('collections') || document.getElementById('new-arrivals');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  return (
    <section id="collections" className="w-full bg-[#fbfaf8] py-16 sm:py-20 lg:py-24 border-b border-neutral-200/60 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">
          
          {/* Left Side: Editorial Title Block with Soft Light Heading Color */}
          <div className="w-full lg:w-[280px] shrink-0 text-center lg:text-left">
            <span 
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium text-[#9c9489] block mb-2 lg:mb-3"
              style={{ fontFamily: 'var(--font-family-primary)' }}
            >
              CURATED ATELIER
            </span>
            <h2 
              className="text-4xl sm:text-5xl lg:text-[54px] text-[#67615c] font-light leading-[1.08] tracking-tight mb-4 lg:mb-6"
              style={{ fontFamily: 'var(--font-family-editorial)', color: '#67615c' }}
            >
              Shop by<br className="hidden lg:block" />{' '}
              <span className="italic font-light text-[#857d74]">Collection</span>
            </h2>

            {/* Slider Navigation Arrows (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Previous Collection"
                className="w-10 h-10 rounded-full border border-neutral-300/70 flex items-center justify-center text-[#67615c] hover:border-[#67615c] hover:text-[#1a1814] transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Next Collection"
                className="w-10 h-10 rounded-full border border-neutral-300/70 flex items-center justify-center text-[#67615c] hover:border-[#67615c] hover:text-[#1a1814] transition-colors cursor-pointer"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Side: Horizontal Scrollable Circular Carousel */}
          <div className="flex-1 min-w-0 w-full">
            <div 
              ref={sliderRef}
              onScroll={handleScroll}
              className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {COLLECTIONS.map((col) => (
                <a 
                  key={col.id}
                  href={`/collections/${col.category}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick(col);
                  }}
                  className="shrink-0 flex flex-col items-center cursor-pointer group select-none snap-start no-underline"
                >
                  {/* Perfectly Round Circle Container */}
                  <div className="rounded-full aspect-square w-36 sm:w-48 lg:w-60 overflow-hidden border border-neutral-200/60 shadow-sm relative bg-[#ebe6e0]">
                    <img 
                      src={col.image} 
                      alt={col.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                      loading="lazy"
                      draggable="false"
                    />
                    {/* Subtle luxury edge vignette */}
                    <div className="absolute inset-0 rounded-full border border-black/5 pointer-events-none group-hover:border-black/20 transition-colors" />
                  </div>

                  {/* Centered Title Underneath Circle */}
                  <h3 
                    className="mt-4 sm:mt-5 text-sm sm:text-base text-[#67615c] font-normal tracking-wide text-center transition-colors group-hover:text-[#1a1814]"
                    style={{ fontFamily: 'var(--font-family-editorial)' }}
                  >
                    {col.title}
                  </h3>
                </a>
              ))}
            </div>

            {/* Minimalist Horizontal Progress Bar Indicator */}
            <div className="mt-6 sm:mt-8 w-32 sm:w-56 h-[2px] bg-neutral-200/80 rounded-full relative overflow-hidden mx-auto lg:mx-0">
              <div 
                className="h-full bg-[#8c867f] rounded-full transition-all duration-150 ease-out"
                style={{ 
                  width: '35%',
                  marginLeft: `${scrollProgress * 65}%`
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
