import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: 'LUXURY PRÊT 2026',
    title: 'NOOR-E-KASHMIR',
    subtitle: 'Artisanal Schiffli cutwork on Egyptian lawn with pure printed silk shawl.',
    image: '/hero-banner.jpg',
    cta: 'Explore Collection',
    categoryTarget: 'luxury-pret'
  },
  {
    id: 2,
    tag: 'PALACE EDIT',
    title: 'THE SHAHANA VIOLET',
    subtitle: 'Intricate tone-on-tone embroidery framed with scalloped lace borders.',
    image: '/hero-banner-2.jpg',
    cta: 'Discover The Edit',
    categoryTarget: 'winter-collection',
    objectPosition: 'center 18%'
  },
  {
    id: 3,
    tag: 'FESTIVE COUTURE',
    title: 'FIROUZEH EMERALD',
    subtitle: 'Jewel-toned emerald silk lawn accented with delicate organza cuffs.',
    image: '/hero-banner-3.jpg',
    cta: 'Shop Festive Couture',
    categoryTarget: 'party-wear',
    objectPosition: 'center 20%'
  }
];

export default function HeroSlider({ onSelectCategory, onOpenLookbook }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const slide = SLIDES[currentSlide];

  return (
    <section 
      className="relative w-full h-screen min-h-[85vh] sm:min-h-[90vh] bg-[#0d0d0d] overflow-hidden flex items-center pt-24 sm:pt-28 pb-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides */}
      {SLIDES.map((s, idx) => {
        const isActive = idx === currentSlide;
        return (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              visibility: isActive ? 'visible' : 'hidden',
              transition: 'opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), transform 7s ease-out',
              transform: isActive ? 'scale(1.02)' : 'scale(1.08)',
              zIndex: 1
            }}
          >
            <img
              src={s.image}
              alt={s.title}
              fetchPriority={idx <= 1 ? 'high' : 'auto'}
              loading={idx <= 1 ? 'eager' : 'lazy'}
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: s.objectPosition || 'center 20%',
                imageRendering: 'auto',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
            />
            {/* Minimal Luxury Vignette Gradient */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.5) 45%, rgba(10,10,10,0.15) 100%)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '140px',
              background: 'linear-gradient(to top, rgba(10,10,10,0.9), transparent)'
            }} />
          </div>
        );
      })}

      {/* Hero Content Overlay — Aligned to Design System Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative z-10 absolute bottom-16 sm:bottom-20 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2">
        <div key={`content-${currentSlide}`} className="flex flex-col items-start animate-fade-in max-w-2xl">
          {/* Eyebrow tag */}
          <div 
            className="text-xs uppercase tracking-[0.25em] text-[#dfc7a7] font-medium mb-3"
            style={{ color: '#dfc7a7' }}
          >
            {slide.tag}
          </div>

          {/* Main Headline */}
          <h1 
            className="font-['Cormorant_Garamond'] font-cormorant text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-wide text-white leading-tight lg:leading-none mb-4 drop-shadow-md"
            style={{ 
              color: '#ffffff',
              fontFamily: "'Cormorant Garamond', Georgia, serif"
            }}
          >
            {slide.title}
          </h1>

          {/* Subtitle / Description */}
          <p 
            className="text-sm sm:text-base text-white/90 max-w-lg leading-relaxed font-light mb-4 drop-shadow-sm"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            {slide.subtitle}
          </p>

          {/* High-Contrast CTA Button */}
          <button
            onClick={() => {
              onSelectCategory(slide.categoryTarget);
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white text-black hover:bg-black hover:text-white px-7 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 shadow-md inline-flex items-center gap-2 mt-4 cursor-pointer group"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#000000';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = '#000000';
            }}
          >
            <span>{slide.cta}</span>
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Minimal Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        style={{
          position: 'absolute',
          left: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'rgba(15, 15, 15, 0.4)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.color = '#111111';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.4)';
          e.currentTarget.style.color = '#ffffff';
        }}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        style={{
          position: 'absolute',
          right: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'rgba(15, 15, 15, 0.4)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.color = '#111111';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.4)';
          e.currentTarget.style.color = '#ffffff';
        }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Minimal Slide Counter Indicator (01 / 04) */}
      <div style={{
        position: 'absolute',
        bottom: '2.5rem',
        right: '2.5rem',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.78rem',
        letterSpacing: '0.2em',
        color: 'rgba(255,255,255,0.7)'
      }}>
        <span style={{ color: '#ffffff', fontWeight: 600 }}>0{currentSlide + 1}</span>
        <div style={{ width: '40px', height: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
        <span>0{SLIDES.length}</span>
      </div>
    </section>
  );
}
