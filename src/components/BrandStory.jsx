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

          {/* Right Column — Luxury Editorial Copy (45% / 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left pl-0 lg:pl-4">
            {/* Eyebrow */}
            <span className="text-[11px] font-medium tracking-[0.25em] text-[#9c978f] uppercase mb-4">
              THE YASRAF PHILOSOPHY
            </span>

            {/* Headline */}
            <h2 
              className="font-serif text-3xl sm:text-4xl lg:text-5xl text-neutral-900 font-normal leading-[1.2] mb-6"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              For women who dare to{' '}
              <span className="italic font-light">be different.</span>
            </h2>

            {/* Brand Narrative */}
            <p className="text-sm sm:text-[15px] text-neutral-600 font-light leading-relaxed mb-6 max-w-md">
              Yasraf is crafted for the modern woman who balances timeless heritage with quiet confidence — effortless separates and formal couture designed for everyday luxury.
            </p>

            {/* Callout Quote */}
            <div className="border-l border-neutral-300 pl-4 italic font-serif text-sm sm:text-[15px] text-neutral-500 mb-8"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              “Every stitch tells a story of confidence and timeless elegance.”
            </div>

            {/* CTA Link */}
            <a 
              href="#story" 
              onClick={handleCtaClick}
              className="text-xs uppercase tracking-[0.25em] font-medium text-neutral-900 border-b border-neutral-900 pb-1 w-fit hover:opacity-70 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>DISCOVER OUR STORY</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
