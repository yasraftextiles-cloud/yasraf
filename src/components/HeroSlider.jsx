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
      className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden flex items-end justify-center text-center text-white bg-[#1a1814] select-none"
      style={{ height: '100dvh', minHeight: '100dvh' }}
      aria-label="Yasraf Luxury Campaign"
    >
      {/* Responsive Luxury Campaign Hero Background with AVIF, WebP & Mobile Breakpoints */}
      <picture className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Mobile Viewports (< 768px): Tailored 3:4 portrait AVIF then WebP */}
        <source
          media="(max-width: 767px)"
          type="image/avif"
          srcSet="/hero-banner-mobile.avif 800w, /hero-banner-mobile-hd.avif 1100w"
          sizes="100vw"
        />
        <source
          media="(max-width: 767px)"
          type="image/webp"
          srcSet="/hero-banner-mobile.webp 800w, /hero-banner-mobile-hd.webp 1100w"
          sizes="100vw"
        />
        <source
          media="(max-width: 767px)"
          type="image/jpeg"
          srcSet="/hero-banner-mobile.jpg"
        />

        {/* Desktop Displays (>= 768px): AVIF then WebP */}
        <source
          media="(min-width: 768px)"
          type="image/avif"
          srcSet="/hero-banner-desktop.avif 1920w, /hero-banner-desktop-2k.avif 2560w"
          sizes="100vw"
        />
        <source
          media="(min-width: 768px)"
          type="image/webp"
          srcSet="/hero-banner-desktop.webp 1920w, /hero-banner-desktop-4k.webp 3840w"
          sizes="100vw"
        />
        <source
          media="(min-width: 768px)"
          type="image/jpeg"
          srcSet="/hero-banner-desktop.jpg 1920w, /hero-banner-desktop-4k.jpg 3840w"
          sizes="100vw"
        />

        {/* Universal Fallback Image with Intrinsic Dimensions & High Priority */}
        <img
          src="/hero-banner.jpg"
          alt="Yasraf Luxury Atelier Campaign — Draped in Poetic Grace"
          width="800"
          height="1000"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="hero-bg-cover w-full h-full object-cover object-[center_28%] sm:object-[center_22%]"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </picture>

      {/* Black Overlay on Hero Image for Deep Contrast & Luxury Editorial Feel */}
      <div 
        className="absolute inset-0 pointer-events-none bg-black/35 z-[2]"
      />
      {/* Subtle bottom shadow vignette for crisp legibility */}
      <div 
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)'
        }}
      />

      {/* Content — Positioned in Lower-Third with Soft Light Heading & Original Yasraf Copy */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 pb-16 sm:pb-20 md:pb-24 flex flex-col items-center">
        <h1 
          className="text-[#fcfaf7] text-3xl sm:text-5xl md:text-6xl lg:text-[58px] font-normal leading-[1.1] tracking-normal drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: 'var(--font-family-editorial)', color: '#fcfaf7' }}
        >
          Draped in <span className="italic font-light text-[#f7ede1]">Poetic Grace</span>
        </h1>

        <div 
          className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-5"
          style={{ fontFamily: 'var(--font-family-primary)' }}
        >
          <a
            href="#collections"
            onClick={(e) => {
              e.preventDefault();
              handleCta('collections');
            }}
            className="text-[#fcfaf7] text-[11.5px] sm:text-[12px] font-medium tracking-[0.18em] uppercase border-b border-[#fcfaf7] pb-0.5 hover:opacity-60 transition-opacity cursor-pointer"
          >
            SHOP THE EDIT
          </a>
          <span className="text-[#fcfaf7]/70 select-none text-[12px] font-light">/</span>
          <a
            href="#new-arrivals"
            onClick={(e) => {
              e.preventDefault();
              handleCta('new-arrivals');
            }}
            className="text-[#fcfaf7] text-[11.5px] sm:text-[12px] font-medium tracking-[0.18em] uppercase border-b border-[#fcfaf7] pb-0.5 hover:opacity-60 transition-opacity cursor-pointer"
          >
            SHOP NEW IN
          </a>
        </div>
      </div>
    </section>
  );
}
