import React from 'react';

export default function EditorialBanner({ discount, featuredProducts, onShopSale, onShopCollections }) {
  const onSale = discount > 0;
  const navigate = onSale ? onShopSale : onShopCollections;

  return (
    <section className="bg-[#f6eee7] pt-[104px] text-[#391d20] sm:pt-[110px]">
      <div className="mx-auto grid max-w-[1600px] items-center gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[2fr_3fr] lg:gap-10 lg:px-12 lg:py-10">
        <div className="px-3 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#713347]">YASRAF Textiles</p>
          <h1 className="text-5xl leading-[0.95] sm:text-7xl xl:text-8xl" style={{ fontFamily: 'var(--font-family-editorial)' }}>
            {onSale ? '11.11 Sale' : 'Explore the Collection'}
          </h1>
          {onSale && <p className="mt-4 text-base sm:text-lg">Up to <strong>{discount}% off</strong> selected styles</p>}
          <a
            href={onSale ? '/collections/sale' : '/collections'}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              navigate();
            }}
            className="mt-6 inline-flex min-h-11 items-center bg-[#681e34] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#471323] focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {onSale ? 'Shop the Sale' : 'Shop Collections'}
          </a>
        </div>
        {featuredProducts.length > 0 && (
          <div className="flex justify-center gap-2 sm:gap-4">
            {featuredProducts.map((product, index) => (
              <figure key={product.id} className="relative w-full max-w-[340px] overflow-hidden border border-[#653041]/10 bg-[#e9d9d1]">
                <img
                  src={product.image}
                  alt={product.title}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className="block aspect-[4/5] w-full object-contain"
                />
                <figcaption className="bg-[#f9f2ec] px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.12em] sm:text-xs">
                  {product.title}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
