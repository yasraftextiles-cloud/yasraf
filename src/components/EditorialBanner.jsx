import React from 'react';

export default function EditorialBanner({ onShopSale }) {
  const handleClick = (e) => {
    if (onShopSale) {
      e.preventDefault();
      onShopSale();
    }
  };

  return (
    <section className="relative w-full bg-[#f4ebe1] pt-[104px] sm:pt-[110px]">
      <a 
        href="/collections/sale" 
        onClick={handleClick}
        className="block relative w-full overflow-hidden group cursor-pointer"
        aria-label="Shop Yasraf 11.11 Sale - Up to 40% Off"
      >
        <picture>
          <source srcSet="/images/yasraf-11-11-sale-banner.webp" type="image/webp" />
          <img 
            src="/images/yasraf-11-11-sale-banner.jpg" 
            alt="YASRAF Textiles 11.11 Sale - Up to 40% Off Special Savings on Selected Styles" 
            className="block w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            fetchPriority="high"
            decoding="async"
            width={1024}
            height={341}
          />
        </picture>
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-[#670e1a] sm:hidden" aria-hidden="true">
          <span className="text-sm font-semibold">11.11 Sale · Up to 40% Off</span>
          <span className="shrink-0 bg-[#670e1a] px-3 py-2 text-xs font-semibold text-white">Shop Sale →</span>
        </div>
      </a>
    </section>
  );
}
