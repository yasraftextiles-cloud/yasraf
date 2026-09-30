import React from 'react';

export default function HeroSlider({ onSelectCategory }) {
  const handleCta = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    const el = document.getElementById('new-arrivals') || document.getElementById('catalog') || document.getElementById('collections');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="relative w-full h-screen min-h-[100vh] max-h-[100vh] overflow-hidden flex items-end justify-center text-center text-white bg-[#2a2522] select-none"
      style={{ height: '100vh', minHeight: '100vh', maxHeight: '100vh' }}
      aria-label="Yasraf Luxury Campaign"
    >
      {/* Single Static Hero Image: Two girls sitting on the table/bench */}
      <img
        src="/hero-banner.jpg"
        alt="Yasraf Campaign — Two models sitting"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
      />

      {/* Black Overlay on Hero Image for Deep Contrast & Luxury Editorial Feel */}
      <div 
        className="absolute inset-0 pointer-events-none bg-black/40 z-[2]"
      />
      {/* Subtle bottom shadow vignette for crisp legibility */}
      <div 
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.65) 100%)'
        }}
      />

      {/* Content — Positioned in Lower-Third with Soft Light Heading & Original Yasraf Copy */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 pb-[clamp(52px,8.5vh,80px)] flex flex-col items-center">
        <h1 
          className="text-[#fcfaf7] text-4xl sm:text-5xl md:text-6xl lg:text-[58px] font-normal leading-[1.08] tracking-normal drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
          style={{ fontFamily: 'var(--font-family-editorial)', color: '#fcfaf7' }}
        >
          Draped in <span className="italic font-light text-[#f7ede1]">Poetic Grace</span>
        </h1>

        <div 
          className="flex items-center justify-center gap-4 sm:gap-6 mt-5"
          style={{ fontFamily: 'var(--font-family-primary)' }}
        >
          <button
            onClick={() => handleCta('collections')}
            className="text-[#fcfaf7] text-[12px] font-medium tracking-[0.18em] uppercase border-b border-[#fcfaf7] pb-0.5 hover:opacity-60 transition-opacity cursor-pointer"
          >
            SHOP THE EDIT
          </button>
          <span className="text-[#fcfaf7]/70 select-none text-[12px] font-light">/</span>
          <button
            onClick={() => handleCta('new-arrivals')}
            className="text-[#fcfaf7] text-[12px] font-medium tracking-[0.18em] uppercase border-b border-[#fcfaf7] pb-0.5 hover:opacity-60 transition-opacity cursor-pointer"
          >
            SHOP NEW IN
          </button>
        </div>
      </div>
    </section>
  );
}
