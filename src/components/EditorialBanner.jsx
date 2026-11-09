import React from 'react';

export default function EditorialBanner({ onShopSale }) {
  const handleClick = (e) => {
    if (onShopSale) {
      e.preventDefault();
      onShopSale();
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#f4ebe1]">
      <a 
        href="/collections/sale" 
        onClick={handleClick}
        className="block relative w-full aspect-[1024/341] max-h-[580px] overflow-hidden group cursor-pointer"
        aria-label="Shop Yasraf 11.11 Sale - Up to 40% Off"
      >
        <picture>
          <source srcSet="/images/yasraf-11-11-sale-banner.webp" type="image/webp" />
          <img 
            src="/images/yasraf-11-11-sale-banner.jpg" 
            alt="YASRAF Textiles 11.11 Sale - Up to 40% Off Special Savings on Selected Styles" 
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            loading="lazy"
            decoding="async"
            width={1024}
            height={341}
          />
        </picture>
      </a>
    </section>
  );
}
