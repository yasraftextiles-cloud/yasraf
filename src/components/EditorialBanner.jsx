import React from 'react';

export default function EditorialBanner({ discount, featuredProduct, onShopSale, onShopCollections }) {
  const onSale = discount > 0;
  const navigate = onSale ? onShopSale : onShopCollections;

  return (
    <section className="bg-[#650e22] pt-[104px] text-[#fff7eb] sm:pt-[110px]">
      <div className="relative isolate flex min-h-[420px] items-end overflow-hidden sm:min-h-[460px] sm:items-center">
        {featuredProduct?.image && (
          <>
            <img
              src={featuredProduct.image}
              alt={`Model wearing the YASRAF ${featuredProduct.title} outfit`}
              fetchPriority="high"
              className="absolute inset-0 -z-20 h-full w-full object-cover object-top sm:left-auto sm:right-0 sm:w-[58%]"
            />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#3c0816] via-[#3c0816]/55 to-transparent sm:bg-gradient-to-r sm:from-[#650e22] sm:via-[#650e22]/95 sm:to-[#3c0816]/10" />
          </>
        )}
        <div className="w-full px-5 py-9 text-center sm:w-[52%] sm:px-8 sm:py-16">
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
      </div>
    </section>
  );
}
