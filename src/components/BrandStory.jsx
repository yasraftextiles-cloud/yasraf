import React from 'react';

export default function BrandStory({ onOpenStory, onOpenLookbook }) {
  const handleCtaClick = (e) => {
    e.preventDefault();
    if (onOpenStory) {
      onOpenStory();
    } else if (onOpenLookbook) {
      onOpenLookbook();
    } else {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="brand-story" 
      className="w-full bg-[#fbfaf8] border-t border-b border-neutral-200/50"
    >
      <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column — Editorial Visual (55% / 7 cols) */}
          <div className="lg:col-span-7 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[520px] aspect-[4/5] overflow-hidden bg-[#f4f1ea] shadow-sm">
              <img
                src="/brand-editorial.jpg"
                alt="The Yasraf Philosophy — Editorial Haute Couture"
                loading="lazy"
                className="w-full h-full object-cover object-[center_20%] transition-transform duration-1000 ease-out hover:scale-105"
              />
              {/* Subtle luxury edge framing */}
              <div className="absolute inset-0 pointer-events-none border border-black/5" />
            </div>
          </div>

          {/* Right Column — Luxury Editorial Copy */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left pl-0 lg:pl-6">
            {/* Eyebrow */}
            <span 
              className="text-[11px] font-medium tracking-[0.22em] text-[#9c9489] uppercase mb-4"
              style={{ fontFamily: 'var(--font-family-primary)' }}
            >
              ATELIER LAHORE
            </span>

            {/* Headline with Light Heading Color */}
            <h2 
              className="text-3xl sm:text-4xl lg:text-[46px] text-[#67615c] font-light leading-[1.18] mb-5 tracking-[-0.01em]"
              style={{ fontFamily: 'var(--font-family-editorial)', color: '#67615c' }}
            >
              For women who<br className="hidden sm:inline" /> embrace <span className="italic font-light text-[#857d74]">timeless grace.</span>
            </h2>

            {/* Brand Narrative */}
            <p 
              className="text-[13px] sm:text-[13.5px] text-[#78716a] font-normal leading-[24px] mb-6 max-w-md"
              style={{ fontFamily: 'var(--font-family-primary)' }}
            >
              Yasraf is crafted for the discerning woman who values subtle artistry: artisanal lawn, hand-finished three-piece suits, and fluid silhouettes woven for celebratory days and everyday poise.
            </p>

            {/* Callout Quote */}
            <div 
              className="border-l-2 border-[#dfc7a7] pl-4 italic text-[13.5px] text-[#78716a] mb-8"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              Every weave tells a story of heritage, quiet luxury, and artful detail.
            </div>

            {/* CTA Link */}
            <a 
              href="#story" 
              onClick={handleCtaClick}
              className="text-[11.5px] uppercase tracking-[0.22em] font-medium text-[#67615c] border-b border-[#67615c]/60 pb-0.5 w-fit hover:text-[#1a1814] hover:border-[#1a1814] transition-all flex items-center gap-2 group cursor-pointer"
              style={{ fontFamily: 'var(--font-family-primary)' }}
            >
              <span>DISCOVER THE ATELIER</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
