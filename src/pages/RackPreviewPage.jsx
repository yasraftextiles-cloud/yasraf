import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { 
  ArrowLeft, 
  Sparkles, 
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import ShowroomRackCanvas from '../components/rack/ShowroomRackCanvas';

// Verified 3-Piece Suit & Rack Items
const RACK_ITEMS = [
  {
    id: 'rack-01',
    title: 'Zehra — Kashmiri Paisley 3-Piece Silk Suit',
    collection: 'Heritage Atelier Collection',
    image: '/images/rack/yasraf-01.png',
    collarOffset: 0,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    views: [
      {
        id: 'front',
        name: 'Front',
        label: 'Front Kameez',
        image: '/images/rack/suit/front.jpg',
        cutout: '/images/rack/yasraf-01.png',
        desc: 'Hand-crafted Kashmiri paisley central motif with turquoise floral flanks, gold gota lace, and scalloped hemline.'
      },
      {
        id: 'back',
        name: 'Back',
        label: 'Back Kameez',
        image: '/images/rack/suit/back.jpg',
        desc: 'Symmetrical floral shoulder yoke with cascading paisley field and matching scalloped border finishing.'
      },
      {
        id: 'trouser',
        name: 'Trouser',
        label: 'Raw Silk Trouser',
        image: '/images/rack/suit/trouser.jpg',
        detailImage: '/images/rack/suit/trouser_detail.jpg',
        desc: 'Wine raw silk fabric with scattered floral roses and ornate cream scalloped cuff border.'
      },
      {
        id: 'dupatta',
        name: 'Dupatta',
        label: 'Silk Printed Dupatta',
        image: '/images/rack/suit/dupatta.jpg',
        desc: 'Full-length luxury silk dupatta featuring mirror-image paisley field and four-sided decorative border.'
      }
    ],
    verifiedDetails: [
      'Front kameez with genuine sheesha (mirror) placket & gold gota ribbon lace',
      'Matching floral back yoke with symmetrical border finishing',
      'Coordinated wine raw silk trousers with rose floral motifs and embroidered cuffs',
      'Full-length luxury printed silk dupatta with 4-sided borders'
    ]
  },
  {
    id: 'rack-02',
    title: 'Gulnar — Festive Fuchsia Chiffon Tunic',
    collection: 'Festive Luxury Collection',
    image: '/images/rack/yasraf-02.png',
    collarOffset: 0.08,
    sizes: ['S', 'M', 'L'],
    views: [
      { id: 'front', name: 'Front', label: 'Front View', image: '/images/rack/yasraf-02.png', desc: 'Flowing magenta chiffon with multitone floral resham embroidery.' },
      { id: 'back', name: 'Back', label: 'Back View', image: '/images/rack/yasraf-02.png', desc: 'Tailored drape with refined neckline finishing.' },
      { id: 'trouser', name: 'Trouser', label: 'Trouser View', image: '/images/rack/suit/trouser.jpg', desc: 'Coordinated raw silk trouser with hem embroidery.' },
      { id: 'dupatta', name: 'Dupatta', label: 'Dupatta View', image: '/images/rack/suit/dupatta.jpg', desc: 'Lightweight matching dupatta with delicate accents.' }
    ],
    verifiedDetails: [
      'Bemberg chiffon with multitone floral resham embroidery',
      'Delicate hand-cut sleeve hems with silver lace inlays',
      'Coordinating silk underslip and tailored raw silk trouser'
    ]
  },
  {
    id: 'rack-03',
    title: 'Noor — Royal Azure Baroque Lawn',
    collection: 'Signature Porcelain Edit',
    image: '/images/rack/yasraf-03.png',
    collarOffset: 0.12,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    views: [
      { id: 'front', name: 'Front', label: 'Front View', image: '/images/rack/yasraf-03.png', desc: 'Cobalt arabesque chintz motifs on crisp cotton lawn.' },
      { id: 'back', name: 'Back', label: 'Back View', image: '/images/rack/yasraf-03.png', desc: 'Clean porcelain damask print layout.' },
      { id: 'trouser', name: 'Trouser', label: 'Trouser View', image: '/images/rack/suit/trouser.jpg', desc: 'Pure cambric trouser with tailored fit.' },
      { id: 'dupatta', name: 'Dupatta', label: 'Dupatta View', image: '/images/rack/suit/dupatta.jpg', desc: 'Voile printed dupatta with contrast borders.' }
    ],
    verifiedDetails: [
      'Supima cotton lawn with Mediterranean cobalt florals',
      'Double-needle stitched borders with heirloom hand finish',
      'Contrast damask motifs engineered with cross-stitch embroidery'
    ]
  },
  {
    id: 'rack-04',
    title: 'Sheesh Mahal — Amber Gold Kurta',
    collection: 'Royal Heritage Occasion',
    image: '/images/rack/yasraf-04.png',
    collarOffset: 0.14,
    sizes: ['S', 'M', 'L', 'XL'],
    views: [
      { id: 'front', name: 'Front', label: 'Front View', image: '/images/rack/yasraf-04.png', desc: 'Lustrous mustard gold raw silk with real mirror needlework.' },
      { id: 'back', name: 'Back', label: 'Back View', image: '/images/rack/yasraf-04.png', desc: 'Embroidered back neck motif with scalloped organza hem.' },
      { id: 'trouser', name: 'Trouser', label: 'Trouser View', image: '/images/rack/suit/trouser.jpg', desc: 'Amber silk straight pant with mirror cuff.' },
      { id: 'dupatta', name: 'Dupatta', label: 'Dupatta View', image: '/images/rack/suit/dupatta.jpg', desc: 'Organza dupatta with four-sided mirror border.' }
    ],
    verifiedDetails: [
      'Hand-woven raw silk with genuine sheesha (mirror) needlework',
      'Extensive hand-embroidered mirror geometric lattices along bodice',
      'Fine net organza cutout hemlines'
    ]
  }
];

// Room Lighting Themes
const ROOM_TONES = {
  studio: {
    name: 'Studio',
    bg: '#F9F8F6',
    textMain: '#1A1A1A',
    textMuted: '#686B73',
    borderCol: 'rgba(0, 0, 0, 0.08)',
    panelBg: 'rgba(255, 255, 255, 0.88)'
  },
  gallery: {
    name: 'Gallery',
    bg: '#F5EFEB',
    textMain: '#241D17',
    textMuted: '#78695E',
    borderCol: 'rgba(0, 0, 0, 0.08)',
    panelBg: 'rgba(250, 246, 240, 0.90)'
  },
  atelier: {
    name: 'Atelier',
    bg: '#141416',
    textMain: '#F2F2F2',
    textMuted: '#989BA3',
    borderCol: 'rgba(255, 255, 255, 0.12)',
    panelBg: 'rgba(24, 24, 27, 0.90)'
  }
};

export default function RackPreviewPage({ onBackToHome }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeView, setActiveView] = useState('front');
  const [hangerFinish, setHangerFinish] = useState('walnut');
  const [roomTone, setRoomTone] = useState('studio');
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [showTrouserDetail, setShowTrouserDetail] = useState(false);

  const panelRef = useRef(null);

  // Return to Rail callback with smooth animation
  const handleReturnToRail = useCallback(() => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        x: 40,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          setSelectedItem(null);
          setActiveView('front');
          setIsZoomed(false);
          setShowTrouserDetail(false);
        }
      });
    } else {
      setSelectedItem(null);
      setActiveView('front');
      setIsZoomed(false);
      setShowTrouserDetail(false);
    }
  }, []);

  // Selection callback: opens showroom dossier with GSAP slide-in
  const handleSelectItem = useCallback((item) => {
    setSelectedItem(item);
    setActiveView('front');
    setIsZoomed(false);
    setShowTrouserDetail(false);
    setSelectedSize(item.sizes[0] || 'M');

    requestAnimationFrame(() => {
      if (panelRef.current) {
        gsap.fromTo(
          panelRef.current,
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: 0.15 }
        );
      }
    });
  }, []);

  // Keyboard controls (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedItem) {
        handleReturnToRail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, handleReturnToRail]);

  const currentTheme = ROOM_TONES[roomTone] || ROOM_TONES.studio;
  const currentViews = selectedItem?.views || [];
  const currentViewObj = currentViews.find((v) => v.id === activeView) || currentViews[0];

  return (
    <div 
      className="relative w-full h-screen overflow-hidden font-sans select-none transition-colors duration-700"
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.textMain }}
    >
      {/* ----------------- Top Header Bar ----------------- */}
      <header 
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b backdrop-blur-md transition-colors"
        style={{ borderColor: currentTheme.borderCol, backgroundColor: `${currentTheme.bg}CC` }}
      >
        {/* Brand & Storefront Back */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium tracking-wider uppercase transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{ borderColor: currentTheme.borderCol }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-serif text-base sm:text-lg font-semibold tracking-[0.24em] uppercase">
              YASRAF
            </span>
            <span className="hidden sm:inline-block text-[9px] font-medium tracking-widest uppercase px-2 py-0.5 rounded border text-[#8C7654] border-[#8C7654]/30 bg-[#8C7654]/10">
              3D Interactive Showroom
            </span>
          </div>
        </div>

        {/* Hanger Material & Lighting Customization */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Hanger Finish Toggle */}
          <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-full border" style={{ borderColor: currentTheme.borderCol }}>
            <span className="hidden md:inline px-1.5 text-[10px] uppercase tracking-wider opacity-60">
              Hanger:
            </span>
            {['walnut', 'chrome', 'ebony', 'brass'].map((k) => (
              <button
                key={k}
                onClick={() => setHangerFinish(k)}
                className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium transition-all cursor-pointer ${
                  hangerFinish === k 
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' 
                    : 'hover:opacity-75'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Room Tone Toggle */}
          <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-full border" style={{ borderColor: currentTheme.borderCol }}>
            {['studio', 'gallery', 'atelier'].map((tone) => (
              <button
                key={tone}
                onClick={() => setRoomTone(tone)}
                className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium transition-all cursor-pointer ${
                  roomTone === tone 
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' 
                    : 'hover:opacity-75'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ----------------- Main 3D Canvas Stage ----------------- */}
      <main className="relative w-full h-full">
        <ShowroomRackCanvas
          items={RACK_ITEMS}
          selectedItem={selectedItem}
          onSelectItem={handleSelectItem}
          activeView={activeView}
          hangerFinish={hangerFinish}
          roomTone={roomTone}
          isZoomed={isZoomed}
        />

        {/* Bottom Ambient Prompt (When in Rail Browsing Mode) */}
        {!selectedItem && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full border bg-black/75 text-white backdrop-blur-md text-xs tracking-wider uppercase font-medium shadow-lg pointer-events-none animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-[#8C7654]" />
            <span>Drag rail to browse • Click dress to enter 3D showroom</span>
          </div>
        )}

        {/* Zoom Control floating pill (When Inspecting) */}
        {selectedItem && (
          <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-black/80 text-white backdrop-blur-md text-xs font-medium tracking-wider uppercase shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
              <span>{isZoomed ? 'Reset View' : 'Zoom In'}</span>
            </button>

            {activeView === 'trouser' && (
              <button
                onClick={() => setShowTrouserDetail(!showTrouserDetail)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-black/80 text-white backdrop-blur-md text-xs font-medium tracking-wider uppercase shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#8C7654]" />
                <span>{showTrouserDetail ? 'Show Full Trouser' : 'Show Cuff Detail'}</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* ----------------- Right Product Showroom Dossier ----------------- */}
      {selectedItem && (
        <aside
          ref={panelRef}
          className="absolute right-0 top-0 bottom-0 z-40 w-full sm:w-[420px] md:w-[480px] p-6 sm:p-8 pt-20 flex flex-col justify-between overflow-y-auto backdrop-blur-xl border-l shadow-2xl transition-all"
          style={{ 
            backgroundColor: currentTheme.panelBg, 
            borderColor: currentTheme.borderCol,
            color: currentTheme.textMain 
          }}
        >
          {/* Header Action: Return to Rail Button */}
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: currentTheme.borderCol }}>
            <span className="text-[10px] font-semibold tracking-[0.26em] uppercase text-[#8C7654]">
              {selectedItem.collection}
            </span>

            <button
              onClick={handleReturnToRail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wider uppercase hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer shadow-xs"
              style={{ borderColor: currentTheme.borderCol }}
              title="Return dress to rail"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return to Rail</span>
            </button>
          </div>

          {/* Dossier Content */}
          <div className="space-y-5 my-auto py-4">
            {/* Title */}
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-md text-[9px] font-semibold tracking-widest uppercase bg-[#8C7654]/15 text-[#8C7654] border border-[#8C7654]/30 mb-2">
                Authentic 3-Piece Pakistani Designer Suit
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
                {selectedItem.title}
              </h1>
            </div>

            {/* 4-VIEW SWITCHER CONTROLS: FRONT | BACK | TROUSER | DUPATTA */}
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75 block mb-2">
                Interactive Suit Perspectives:
              </span>
              <div 
                className="grid grid-cols-4 gap-1 p-1 rounded-xl border shadow-xs"
                style={{ borderColor: currentTheme.borderCol }}
              >
                {['front', 'back', 'trouser', 'dupatta'].map((viewKey) => {
                  const isActive = activeView === viewKey;
                  return (
                    <button
                      key={viewKey}
                      onClick={() => {
                        setActiveView(viewKey);
                        setIsZoomed(false);
                      }}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer text-center ${
                        isActive
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-102'
                          : 'hover:opacity-75'
                      }`}
                    >
                      {viewKey}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed opacity-75 min-h-[2.5rem]">
                {currentViewObj?.desc}
              </p>
            </div>

            {/* Trouser detail preview thumbnail if active */}
            {activeView === 'trouser' && showTrouserDetail && selectedItem.views?.find(v => v.id === 'trouser')?.detailImage && (
              <div className="p-2 rounded-xl border bg-black/5 dark:bg-white/5 space-y-1.5" style={{ borderColor: currentTheme.borderCol }}>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8C7654]">
                  Embroidered Cuff Closeup View:
                </span>
                <img 
                  src={selectedItem.views.find(v => v.id === 'trouser').detailImage} 
                  alt="Trouser cuff detail" 
                  className="w-full h-36 object-cover rounded-lg shadow-xs"
                />
              </div>
            )}

            {/* Verified Product Dossier (No fabricated prices, no fake SKU) */}
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: currentTheme.borderCol }}>
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80 block">
                Verified Artisan Specification:
              </span>
              <div className="space-y-1.5">
                {selectedItem.verifiedDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed opacity-85">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8C7654] shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            {selectedItem.sizes && selectedItem.sizes.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80 block mb-1.5">
                  Available Sizes:
                </span>
                <div className="flex items-center gap-2">
                  {selectedItem.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-semibold tracking-wider transition-all border cursor-pointer ${
                        selectedSize === s
                          ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm'
                          : 'hover:border-black/40 dark:hover:border-white/40'
                      }`}
                      style={{ borderColor: selectedSize === s ? undefined : currentTheme.borderCol }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t space-y-2" style={{ borderColor: currentTheme.borderCol }}>
            <button
              onClick={onBackToHome}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-medium text-xs uppercase tracking-[0.2em] transition-all hover:opacity-90 active:scale-[0.99] shadow-lg cursor-pointer"
            >
              <span>View Product in Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReturnToRail}
              className="w-full py-2.5 rounded-xl border text-xs uppercase tracking-wider font-medium opacity-75 hover:opacity-100 transition-all cursor-pointer"
              style={{ borderColor: currentTheme.borderCol }}
            >
              Return to Rail
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
