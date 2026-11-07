import React from 'react';

export default function DualEditorialSplit() {
  return (
    <section className="w-full h-auto md:h-[min(75vw,1100px)] overflow-hidden bg-neutral-950">
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-0">
        
        {/* Left Column — Blue and White Printed Suit Campaign */}
        <div className="relative w-full aspect-[2/3] md:aspect-auto md:h-full overflow-hidden group">
          <img 
            src="/images/campaign/blue-white-dress-candid-v3.webp" 
            alt="Pakistani model wearing a white and cobalt blue printed two-piece suit with striped cuffs and hem"
            className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-102"
            loading="lazy"
          />
          {/* Subtle editorial film tone overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 pointer-events-none" />
        </div>

        {/* Right Column — Charcoal Winter Campaign */}
        <div className="relative w-full aspect-[2/3] md:aspect-auto md:h-full overflow-hidden group">
          <img 
            src="/images/campaign/winter-charcoal-model-v1.webp" 
            alt="Pakistani classic winter formalwear: charcoal tailored suit with a burgundy wool shawl"
            className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-102"
            loading="lazy"
          />
          {/* Subtle editorial film tone overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
