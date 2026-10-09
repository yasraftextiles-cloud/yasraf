import React, { useMemo } from 'react';
import ProductCard from './ProductCard';

const HANDPICKED_STYLES = [
  {
    id: 'new-in-mehraab',
    title: 'Mehraab',
    category: 'pret',
    categoryLabel: '3-Piece Suit',
    price: 9890,
    originalPrice: 11868,
    image: '/images/new-in-loom.jpg',
    description: 'Contemporary luxury ivory raw-silk relaxed three-piece suit with hand-finished cutwork accents.',
    inStock: true,
    isPublished: true,
    showInSignatureEdit: true
  },
  {
    id: 'new-in-gulzar',
    title: 'Gulzar',
    category: 'pret',
    categoryLabel: 'Shrug & Co-ord',
    price: 11500,
    originalPrice: 13800,
    image: '/images/new-in-zephyr.jpg',
    description: 'Flowing modal-linen overlay and tailored tunic in warm terracotta with artisanal thread embroidery.',
    inStock: true,
    isPublished: true,
    showInSignatureEdit: true
  },
  {
    id: 'new-in-shab-e-noor',
    title: 'Shab-e-Noor',
    category: 'pret',
    categoryLabel: 'Evening Prêt',
    price: 14200,
    originalPrice: 17040,
    image: '/images/new-in-nocturne.jpg',
    description: 'Exquisite midnight-obsidian raw silk three-piece ensemble adorned with subtle neckline artistry.',
    inStock: true,
    isPublished: true,
    showInSignatureEdit: true
  },
  {
    id: 'new-in-rawayat',
    title: 'Rawayat',
    category: 'pret',
    categoryLabel: 'Signature Set',
    price: 12800,
    originalPrice: 15360,
    image: '/images/new-in-solstice.jpg',
    description: 'Luxe pistachio sage silk-blend co-ord set accented with refined metallic zari motifs.',
    inStock: true,
    isPublished: true,
    showInSignatureEdit: true
  }
];

export default function SignatureEdit({
  products = [],
  currency = 'PKR',
  onQuickView,
  wishlistIds = [],
  onToggleWishlist,
  onDiscover
}) {
  const displayItems = useMemo(() => {
    return products
      .filter((p) => {
        const isPublished = p.isPublished ?? p.is_published ?? true;
        const inSigEdit = Boolean(
          p.showInSignatureEdit ?? p.show_in_signature_edit ?? p.isFeatured ?? p.is_featured
        );
        return isPublished && inSigEdit;
      })
      .slice()
      .sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
      });
  }, [products]);

  // Fallback to original 4 handpicked styles if no catalog products are assigned to Signature Edit yet
  const itemsToRender = displayItems.length > 0 ? displayItems : HANDPICKED_STYLES;

  const handleDiscoverClick = (e) => {
    e.preventDefault();
    if (onDiscover) {
      onDiscover();
    } else {
      const el = document.getElementById('catalog') || document.getElementById('new-arrivals');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="signature-edit" 
      className="w-full bg-[#fbfaf8] py-16 sm:py-24 lg:py-28 border-b border-neutral-200/50"
    >
      <div className="max-w-[2000px] mx-auto px-2 sm:px-4 lg:px-8">
        
        {/* Header Typography */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 
            className="text-[28px] sm:text-[34px] lg:text-[38px] text-[#67615c] font-light tracking-tight mb-1"
            style={{ fontFamily: 'var(--font-family-editorial)', color: '#67615c' }}
          >
            The Signature Edit
          </h2>
          <p 
            className="text-[10.5px] sm:text-[11.5px] uppercase tracking-[0.22em] font-medium text-[#857d74] mb-3"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            HANDPICKED STYLES BY YASRAF
          </p>
          <a 
            href="#collections" 
            onClick={handleDiscoverClick}
            className="text-[11.5px] uppercase tracking-[0.18em] font-medium text-[#67615c] border-b border-[#67615c]/60 pb-[3px] hover:text-[#1a1814] hover:border-[#1a1814] transition-colors inline-block cursor-pointer"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            DISCOVER THE CAPSULE
          </a>
        </div>

        {/* Dynamic 4-Column Grid: 4 per row on desktop, continuing naturally onto next rows */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-3.5">
          {itemsToRender.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              currency={currency}
              onQuickView={onQuickView}
              isWishlisted={wishlistIds.includes(prod.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
