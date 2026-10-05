import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage({ onBackToHome, onExploreCollections }) {
  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center bg-[#ffffff] text-[#1a1814] px-4 py-24 sm:py-32">
      <div className="max-w-md w-full text-center">
        <span 
          className="text-xs uppercase tracking-[0.25em] font-medium text-[#9c9489] block mb-3"
          style={{ fontFamily: 'var(--font-family-primary)' }}
        >
          404 — ATELIER ARCHIVE
        </span>
        <h1 
          className="text-4xl sm:text-5xl text-[#67615c] font-light tracking-tight leading-tight mb-4"
          style={{ fontFamily: 'var(--font-family-editorial)' }}
        >
          Piece Not Found
        </h1>
        <p 
          className="text-sm text-[#78716a] font-light leading-relaxed mb-8"
          style={{ fontFamily: 'var(--font-family-primary)' }}
        >
          The silhouette, ensemble, or page you are looking for is currently unavailable or may have been relocated in our seasonal curation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onBackToHome && onBackToHome()}
            className="w-full sm:w-auto px-6 py-3 bg-[#1a1814] text-white text-xs font-medium tracking-[0.16em] uppercase hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            <ArrowLeft size={14} /> Return to Store
          </button>
          <button
            onClick={() => onExploreCollections && onExploreCollections('all')}
            className="w-full sm:w-auto px-6 py-3 border border-[#1a1814] text-[#1a1814] text-xs font-medium tracking-[0.16em] uppercase hover:bg-[#faf8f6] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            <Compass size={14} /> Browse Collections
          </button>
        </div>
      </div>
    </div>
  );
}
