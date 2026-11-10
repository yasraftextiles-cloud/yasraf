import React from 'react';

export default function EditorialBanner({ discount, onShopSale, onShopCollections }) {
  const onSale = discount > 0;
  const navigate = onSale ? onShopSale : onShopCollections;

  return (
    <section className="bg-[#650e22] pt-[104px] text-[#fff7eb] sm:pt-[110px]">
      <div className="mx-auto max-w-6xl px-5 py-12 text-center sm:py-20 lg:py-24">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em]">YASRAF Textiles</p>
        <h1 className="text-5xl leading-none sm:text-7xl lg:text-8xl" style={{ fontFamily: 'var(--font-family-editorial)' }}>
          {onSale ? '11.11 Sale' : 'Explore the Collection'}
        </h1>
        {onSale && <p className="mt-4 text-lg sm:text-2xl">Up to {discount}% off selected styles</p>}
        <a
          href={onSale ? '/collections/sale' : '/collections'}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            navigate();
          }}
          className="mt-7 inline-flex min-h-11 items-center border border-[#fff7eb] bg-[#fff7eb] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#650e22] transition-colors hover:bg-transparent hover:text-[#fff7eb] focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {onSale ? 'Shop the Sale' : 'Shop Collections'}
        </a>
      </div>
    </section>
  );
}
