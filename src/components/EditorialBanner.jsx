import React from 'react';

export default function EditorialBanner() {
  return (
    <section className="relative w-full h-[65vh] sm:h-[75vh] lg:h-[85vh] overflow-hidden bg-[#e8e4df]">
      {/* Full-width campaign editorial image */}
      <img 
        src="/images/luxury-editorial-banner-wide.jpg" 
        alt="Yasraf Campaign Editorial" 
        className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out hover:scale-102"
        loading="lazy"
      />

      {/* Subtle seamless vignette overlay */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
    </section>
  );
}
