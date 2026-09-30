import React from 'react';

export default function EditorialStatement({ onViewCollection }) {
  const handleCtaClick = (e) => {
    if (onViewCollection) {
      e.preventDefault();
      onViewCollection();
    } else {
      const el = document.getElementById('collections') || document.getElementById('new-arrivals');
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="w-full bg-[#fbfaf8] h-[300px] max-h-[300px] overflow-hidden py-6 sm:py-7 px-6 sm:px-8 lg:px-12 flex flex-col justify-between">
      <div className="w-full max-w-[1240px] mx-auto h-full flex flex-col justify-between">
        {/* Top Tri-Column Header Line */}
        <div className="flex items-center justify-between w-full border-b border-neutral-200/60 pb-2.5 sm:pb-3 flex-wrap">
          <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-medium text-[#9c9489] whitespace-nowrap">
            NEW CAPSULE
          </span>
          <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-medium text-[#9c9489] whitespace-nowrap mx-2">
            THE ATELIER
          </span>
          <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-medium text-[#9c9489] whitespace-nowrap">
            YASRAF
          </span>
        </div>

        {/* Centered Editorial Statement - Vertically Centered with Light Heading Color */}
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center justify-center my-auto py-1">
          <h2 
            className="text-2xl sm:text-4xl lg:text-[46px] text-[#67615c] font-light leading-[1.15] mb-2 sm:mb-2.5 tracking-tight"
            style={{ fontFamily: 'var(--font-family-editorial)', color: '#67615c' }}
          >
            Drape in <span className="italic font-light text-[#857d74]">grace.</span> Walk in poise.
          </h2>
          <p className="text-xs sm:text-[13px] text-[#78716a] font-light leading-relaxed max-w-lg mb-3.5 sm:mb-4">
            Artisanal three-piece lawn suits, fluid shrugs, and tailored twin sets designed for sunlit afternoons, quiet evenings, and effortless poise.
          </p>
          <a 
            href="/shop" 
            onClick={handleCtaClick}
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium text-[#67615c] border-b border-[#67615c]/60 pb-0.5 hover:text-[#1a1814] hover:border-[#1a1814] transition-colors"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            EXPLORE THE ATELIER
          </a>
        </div>
      </div>
    </section>
  );
}
