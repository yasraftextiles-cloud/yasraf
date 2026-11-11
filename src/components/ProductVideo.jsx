import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Play, X } from 'lucide-react';
import { getProductVideoUrl } from '../services/productVideoService.js';
import { normalizeInstagramPost } from '../utils/productVideo.js';

function VideoDialog({ path, poster, title, instagram, onClose }) {
  const dialog = useRef(null);
  const [source, setSource] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    if (!element.open) element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    let active = true;
    getProductVideoUrl(path).then((url) => { if (active) setSource(url); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [path, attempt]);

  return createPortal(
    <dialog ref={dialog} aria-label={`Product video for ${title}`} className="fixed inset-0 m-auto max-h-[calc(100dvh-1.5rem)] w-[min(90vw,25rem)] max-w-none overflow-y-auto rounded-2xl bg-[#161412] p-0 text-white shadow-2xl backdrop:bg-black/75"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="p-2.5 sm:p-3">
        <div className="relative flex aspect-[9/16] min-h-36 max-h-[calc(100dvh-9rem)] items-center justify-center overflow-hidden rounded-xl bg-black">
          <button type="button" autoFocus aria-label="Close product video" onClick={onClose} className="absolute right-2 top-2 z-10 rounded-full bg-black/65 p-2 text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-white">
            <X size={20} aria-hidden="true" />
          </button>
          {failed ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-6 text-center text-sm" role="status">
              <p>This video is currently unavailable.</p>
              <button type="button" className="underline underline-offset-4" onClick={() => { setFailed(false); setSource(null); setAttempt((value) => value + 1); }}>Try again</button>
            </div>
          ) : source ? (
            <video key={attempt} src={source} poster={poster} autoPlay muted playsInline controls aria-label={title} onError={() => setFailed(true)}
              className="h-full w-full object-contain" />
          ) : (
            <p className="py-16 text-sm text-white/80" role="status">Loading video…</p>
          )}
        </div>
        <p className="px-2 pb-1 pt-3 text-center text-sm">{title}</p>
        {instagram && (
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#f6f0e9] px-4 py-3 text-xs font-medium uppercase tracking-widest text-[#1a1814] transition-colors hover:bg-[#e2d3c1] focus-visible:outline-2 focus-visible:outline-white">
            See on Instagram <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        )}
      </div>
    </dialog>, document.body
  );
}

export default function ProductVideo({ path, poster, title, instagram }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }

  return (
    <>
      <button ref={trigger} type="button" aria-label={`Watch product video for ${title}`} aria-haspopup="dialog" onClick={() => setOpen(true)}
        className="group flex w-full shrink-0 items-center gap-3 rounded-xl border border-[#ebe6e0] bg-[#faf8f6] p-2 text-left transition-colors hover:border-[#9d8264] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b513c] lg:w-28 lg:flex-col lg:gap-2 lg:text-center xl:w-32">
        <span className="relative grid aspect-[9/16] w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#332b26] lg:w-full">
          {poster && <img src={poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
          <span className="relative grid size-8 place-items-center rounded-full bg-black/70 text-white transition-transform group-hover:scale-110 motion-reduce:transition-none">
            <Play size={13} className="ml-0.5 fill-current" aria-hidden="true" />
          </span>
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider">Watch video</span>
      </button>
      {open && <VideoDialog path={path} poster={poster} title={title} instagram={normalizeInstagramPost(instagram)} onClose={close} />}
    </>
  );
}
