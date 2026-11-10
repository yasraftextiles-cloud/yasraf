import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { getMarkdownPercent } from '../data/categories';
import { getProductSlug } from '../utils/seo';

export const SALE_DEADLINE = Date.parse('2026-11-12T00:00:00+05:00');

const shown = new Set();

function wasShown(key) {
  try {
    return shown.has(key) || sessionStorage.getItem(key) === '1';
  } catch {
    return shown.has(key);
  }
}

function markShown(key) {
  shown.add(key);
  try { sessionStorage.setItem(key, '1'); } catch {}
}

export default function SaleCampaign({ products, enabled, onShopSale, onSelectProduct }) {
  const dialog = useRef(null);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const featured = products.reduce((best, product) => {
    if (!product.inStock || !product.image || getMarkdownPercent(product) <= getMarkdownPercent(best || {})) return best;
    return product;
  }, null);
  const discount = getMarkdownPercent(featured || {});

  useEffect(() => {
    const modal = dialog.current;
    if (!enabled || !discount || Date.now() >= SALE_DEADLINE) {
      modal?.close();
      setShowSpotlight(false);
      return;
    }

    const popupKey = 'yasraf-1111-popup';
    const spotlightKey = 'yasraf-1111-spotlight';
    const popupTimer = window.setTimeout(() => {
      if (Date.now() < SALE_DEADLINE && !wasShown(popupKey) && modal && !modal.open) {
        modal.showModal();
        markShown(popupKey);
      }
    }, 6500);
    let hideTimer;
    const spotlightTimer = window.setTimeout(() => {
      if (Date.now() < SALE_DEADLINE && !modal?.open && !wasShown(spotlightKey)) {
        setShowSpotlight(true);
        markShown(spotlightKey);
        hideTimer = window.setTimeout(() => setShowSpotlight(false), 8000);
      }
    }, wasShown(popupKey) ? 7000 : 22000);

    return () => {
      window.clearTimeout(popupTimer);
      window.clearTimeout(spotlightTimer);
      window.clearTimeout(hideTimer);
    };
  }, [enabled, discount]);

  function follow(event, navigate) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialog.current?.close();
    setShowSpotlight(false);
    navigate();
  }

  if (!featured) return null;

  return (
    <>
      <dialog
        ref={dialog}
        aria-labelledby="sale-campaign-title"
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden bg-[#f8efe8] text-[#391d20] shadow-2xl backdrop:bg-black/55"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="relative px-6 py-10 text-center sm:px-10">
          <button type="button" aria-label="Close sale popup" autoFocus onClick={() => dialog.current.close()} className="absolute right-2 top-2 grid size-11 place-items-center rounded-full hover:bg-black/5">
            <X size={20} />
          </button>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#681e34]">YASRAF Textiles</p>
          <h2 id="sale-campaign-title" className="text-5xl leading-none" style={{ fontFamily: 'var(--font-family-editorial)' }}>11.11 Sale</h2>
          <p className="mt-4">Up to <strong>{discount}% off</strong> selected in-stock styles.</p>
          <a href="/collections/sale" onClick={(event) => follow(event, onShopSale)} className="mt-6 inline-flex min-h-11 items-center bg-[#681e34] px-8 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[#471323]">
            Shop the Sale
          </a>
        </div>
      </dialog>
      {enabled && showSpotlight && (
        <aside aria-label="Featured sale item" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-40 flex w-[min(18rem,calc(100%-5rem))] items-start border border-[#eadcd2] bg-[#fffaf6] text-[#391d20] shadow-lg sm:left-5">
          <a href={`/products/${getProductSlug(featured)}`} onClick={(event) => follow(event, () => onSelectProduct(featured))} className="group flex min-w-0 flex-1 items-center gap-3 p-2.5">
            <img src={featured.image} alt="" className="h-14 w-11 shrink-0 object-cover" />
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#681e34]">11.11 Sale Pick</span>
              <span className="block truncate text-sm font-semibold group-hover:underline">{featured.title}</span>
              <span className="block text-xs">{discount}% off · Rs. {Number(featured.price).toLocaleString('en-PK')}</span>
            </span>
          </a>
          <button type="button" aria-label="Dismiss sale pick" onClick={() => setShowSpotlight(false)} className="grid size-11 shrink-0 place-items-center hover:bg-black/5">
            <X size={15} />
          </button>
        </aside>
      )}
    </>
  );
}
