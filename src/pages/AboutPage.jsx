import React from 'react';
import { ArrowLeft, Sparkles, Heart, ShieldCheck } from 'lucide-react';

export default function AboutPage({ onBackToHome, onExploreCollections }) {
  return (
    <div className="w-full bg-[#ffffff] min-h-screen text-[#1a1814] pt-24 sm:pt-28 pb-20 select-none">
      
      {/* 1. Breadcrumbs */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-3 border-b border-neutral-200/50 mb-10">
        <div className="flex items-center gap-2 text-[11.5px] uppercase tracking-[0.14em] text-[#8c867f]">
          <button 
            onClick={onBackToHome}
            className="hover:text-[#1a1814] transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Back to Home
          </button>
          <span>/</span>
          <span className="text-[#1a1814] font-medium">The Atelier Story</span>
        </div>
      </div>

      {/* 2. Hero Editorial Banner */}
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mb-16 sm:mb-20 text-center">
        <span className="text-[11px] uppercase tracking-[0.25em] font-medium text-[#9c9489] block mb-3">
          FOUNDED IN LAHORE • CRAFTED FOR THE WORLD
        </span>
        <h1 
          className="text-4xl sm:text-5xl lg:text-6xl text-[#67615c] font-light tracking-tight leading-[1.08] mb-6"
          style={{ fontFamily: 'var(--font-family-editorial)' }}
        >
          Artistry Woven in <span className="italic font-light text-[#857d74]">Quiet Luxury</span>
        </h1>
        <p className="max-w-2xl mx-auto text-[13px] sm:text-[14px] text-[#78716a] font-light leading-relaxed">
          Yasraf Clothing was born from an unyielding devotion to Pakistani sartorial heritage: breathing modern life into centuries-old textile traditions through fluid cuts, delicate cutwork, and hand-finished three-piece silhouettes.
        </p>
      </div>

      {/* 3. Editorial Two-Column Visual Showcase */}
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mb-20 sm:mb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          <div className="lg:col-span-6 overflow-hidden bg-[#ebe6e0]">
            <img 
              src="/brand-editorial.jpg" 
              alt="Yasraf Atelier Craftsmanship" 
              className="w-full aspect-[4/5] object-cover object-[center_20%]"
            />
          </div>

          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[#8c867f]">
              THE PHILOSOPHY
            </span>
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1a1814] leading-snug"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              Every stitch honors the woman who wears it.
            </h2>
            <p className="text-[13px] text-[#67615c] font-light leading-relaxed">
              In a world of fast fashion, Yasraf chooses the path of patience. Our fabrics begin with the purest long-staple Egyptian lawn yarns, calibrated for breathability under warm skies, and pure raw silks that fall with effortless grace.
            </p>
            <p className="text-[13px] text-[#67615c] font-light leading-relaxed">
              Each print and embroidery motif is envisioned in our Lahore design studio—blending Mughal architectural geometric symmetry with soft organic florals.
            </p>

            <div className="pt-4 border-t border-neutral-200/60 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-2xl sm:text-3xl font-light text-[#1a1814] block" style={{ fontFamily: 'var(--font-family-editorial)' }}>
                  80/80
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8c867f]">Pure Lawn Weave</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-light text-[#1a1814] block" style={{ fontFamily: 'var(--font-family-editorial)' }}>
                  100%
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8c867f]">Artisanal Cutwork</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-light text-[#1a1814] block" style={{ fontFamily: 'var(--font-family-editorial)' }}>
                  12k+
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8c867f]">Patron Women</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Pillars of Excellence */}
      <div className="w-full bg-[#fbfaf8] py-16 sm:py-24 border-t border-b border-neutral-200/50 mb-16">
        <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            
            <div className="p-6 bg-white border border-[#ebe6e0]">
              <Sparkles size={24} className="text-[#c5a880] mx-auto mb-3" />
              <h3 className="text-lg font-normal text-[#1a1814] mb-2" style={{ fontFamily: 'var(--font-family-editorial)' }}>
                Artisanal Schiffli Embroidery
              </h3>
              <p className="text-xs text-[#78716a] leading-relaxed">
                Handcrafted openwork lace and delicate scalloped borders meticulously finished by generational artisans.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#ebe6e0]">
              <Heart size={24} className="text-[#c5a880] mx-auto mb-3" />
              <h3 className="text-lg font-normal text-[#1a1814] mb-2" style={{ fontFamily: 'var(--font-family-editorial)' }}>
                Mindful Fabric Sourcing
              </h3>
              <p className="text-xs text-[#78716a] leading-relaxed">
                We select ethically spun silks, airy cotton cambrics, and lightweight chiffons that withstand season after season.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#ebe6e0]">
              <ShieldCheck size={24} className="text-[#c5a880] mx-auto mb-3" />
              <h3 className="text-lg font-normal text-[#1a1814] mb-2" style={{ fontFamily: 'var(--font-family-editorial)' }}>
                Contemporary Ready-To-Wear
              </h3>
              <p className="text-xs text-[#78716a] leading-relaxed">
                Tailored cuts designed for contemporary Pakistani women, from boardroom meetings to festive celebrations.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* 5. Bottom Invitation */}
      <div className="text-center max-w-xl mx-auto px-4">
        <button
          onClick={onExploreCollections}
          className="text-[12px] uppercase tracking-[0.2em] font-semibold text-[#1a1814] border-b-2 border-[#1a1814] pb-1 hover:opacity-60 transition-opacity cursor-pointer"
          style={{ fontFamily: 'var(--font-family-primary)' }}
        >
          EXPLORE THE CURRENT ATELIER COLLECTION &rarr;
        </button>
      </div>

    </div>
  );
}
