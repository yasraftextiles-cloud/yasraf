import React from 'react';

export default function DualEditorialSplit() {
  return (
    <section className="w-full h-auto md:h-[650px] lg:h-[800px] overflow-hidden bg-neutral-950">
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-0">
        
        {/* Left Column — Monochrome B&W Editorial Portrait */}
        <div className="relative w-full h-[480px] sm:h-[580px] md:h-full overflow-hidden group">
          <img 
            src="/images/editorial-portrait-bw.jpg" 
            alt="Monochrome High Fashion Editorial Portrait"
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-102"
            loading="lazy"
          />
          {/* Subtle editorial film tone overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 pointer-events-none" />
        </div>

        {/* Right Column — Rich Warm-Toned Color Editorial Portrait */}
        <div className="relative w-full h-[480px] sm:h-[580px] md:h-full overflow-hidden group">
          <img 
            src="/images/editorial-portrait-color.jpg" 
            alt="Warm-Toned High Fashion Editorial Portrait"
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-102"
            loading="lazy"
          />
          {/* Subtle editorial film tone overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
