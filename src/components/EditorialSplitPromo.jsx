import React from 'react';
import { BRAND_CONFIG } from '../data/brandConfig';

export default function EditorialSplitPromo({ onShopFestive }) {
  const handleShopNow = (e) => {
    e.preventDefault();
    if (onShopFestive) {
      onShopFestive();
    } else {
      const el = document.getElementById('collections') || document.getElementById('new-arrivals');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full overflow-hidden bg-neutral-950">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-0">
        
        {/* Left Card — Festive Couture */}
        <div 
          onClick={handleShopNow}
          className="relative w-full h-[480px] sm:h-[580px] md:h-[650px] lg:h-[800px] overflow-hidden group cursor-pointer"
        >
          <img 
            src="/images/promo-festive.jpg" 
            alt="Yasraf Festive Campaign"
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-103"
            loading="lazy"
          />

          {/* Seamless Upward Bottom Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

          {/* Pinned Bottom Content */}
          <div className="absolute bottom-10 inset-x-0 text-center z-10 px-6 flex flex-col items-center">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium text-white/90 mb-2">
              DISCOVER
            </span>
            <h3 
              className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[0.18em] mb-4 drop-shadow-sm"
              style={{ 
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                color: '#ffffff'
              }}
            >
              FESTIVE
            </h3>
            <a 
              href="#collections" 
              onClick={handleShopNow}
              className="text-[11px] uppercase tracking-[0.25em] font-medium text-white border-b border-white pb-0.5 hover:opacity-75 transition-opacity"
            >
              SHOP NOW
            </a>
          </div>
        </div>

        {/* Right Card — Personal Styling via WhatsApp */}
        <div className="relative w-full h-[480px] sm:h-[580px] md:h-[650px] lg:h-[800px] overflow-hidden group">
          <img 
            src="/images/promo-newspaper.jpg" 
            alt="Personal Styling Editorial"
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-103"
            loading="lazy"
          />

          {/* Seamless Upward Bottom Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

          {/* Pinned Bottom Content */}
          <div className="absolute bottom-10 inset-x-0 text-center z-10 px-6 flex flex-col items-center">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium text-white/90 mb-2">
              PERSONAL STYLING
            </span>
            <h3 
              className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[0.08em] mb-4 drop-shadow-sm"
              style={{ 
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                color: '#ffffff'
              }}
            >
              CHAT WITH US
            </h3>
            <a 
              href={BRAND_CONFIG.getWhatsAppSupportUrl('Hello Yasraf Team, I would like personal styling assistance.')} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[11px] uppercase tracking-[0.25em] font-medium text-white border-b border-white pb-0.5 hover:opacity-75 transition-opacity"
            >
              ON WHATSAPP
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
