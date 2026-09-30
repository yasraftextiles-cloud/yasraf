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
          <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-medium text-neutral-500 whitespace-nowrap">
            NEW SEASON
          </span>
          <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-medium text-neutral-500 whitespace-nowrap mx-2">
            THE EDIT
          </span>
          <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-medium text-neutral-500 whitespace-nowrap">
            YASRAF
          </span>
        </div>

        {/* Centered Editorial Statement - Vertically Centered */}
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center justify-center my-auto py-1">
          <h2 
            className="text-2xl sm:text-4xl lg:text-5xl text-neutral-900 font-normal leading-[1.15] mb-2 sm:mb-2.5 tracking-tight"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            Travel <span className="italic font-normal">light.</span> Dress well.
          </h2>
          <p className="text-xs sm:text-[13px] text-neutral-600 font-light leading-relaxed max-w-lg mb-3.5 sm:mb-4">
            Effortless three-piece suits, shrugs, and signature co-ords designed for long days, quiet evenings, and everything in between.
          </p>
          <a 
            href="/shop" 
            onClick={handleCtaClick}
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium text-neutral-900 border-b border-neutral-900 pb-0.5 hover:opacity-70 transition-opacity"
          >
            VIEW THE COLLECTION
          </a>
        </div>
      </div>
    </section>
  );
}
