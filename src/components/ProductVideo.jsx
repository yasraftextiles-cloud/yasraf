import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, GripHorizontal, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { getProductVideoUrl } from '../services/productVideoService.js';
import { normalizeInstagramPost } from '../utils/productVideo.js';

const INSET = 12;
const DRAG_THRESHOLD = 6;
const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

function clampPosition(left, top, element) {
  const { width, height } = element.getBoundingClientRect();
  return {
    left: Math.min(Math.max(left, INSET), Math.max(INSET, document.documentElement.clientWidth - width - INSET)),
    top: Math.min(Math.max(top, INSET), Math.max(INSET, window.innerHeight - height - INSET)),
  };
}

function timeLabel(seconds) {
  const value = Math.floor(seconds);
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

function VideoDialog({ path, poster, title, instagram, onClose }) {
  const dialog = useRef(null);
  const player = useRef(null);
  const titleId = useId();
  const [source, setSource] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);

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

  function retry() {
    setFailed(false);
    setSource(null);
    setPaused(true);
    setMuted(true);
    setDuration(0);
    setElapsed(0);
    setAttempt((value) => value + 1);
  }

  function togglePlayback() {
    const video = player.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => { setPaused(true); });
    else video.pause();
  }

  function toggleSound() {
    if (player.current) player.current.muted = !player.current.muted;
  }

  const controlClass = 'grid size-10 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

  return createPortal(
    <dialog ref={dialog} aria-labelledby={titleId}
      className="fixed inset-0 m-auto w-[min(92vw,26rem)] max-w-none max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-[1.4rem] border border-white/15 bg-[#171411] p-0 text-white shadow-[0_24px_90px_#0008] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      style={{ width: 'min(92vw, 26rem, calc((100dvh - 1.5rem) * 0.625))' }}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative isolate grid aspect-[10/16] place-items-center overflow-hidden bg-[#171411]">
        {source && !failed ? (
          <video ref={player} key={attempt} src={source} poster={poster} autoPlay muted playsInline aria-label={title}
            className="absolute inset-0 size-full object-contain"
            onError={() => setFailed(true)} onPlay={() => setPaused(false)} onPause={() => setPaused(true)} onEnded={() => setPaused(true)}
            onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
            onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
            onDurationChange={(event) => { const next = event.currentTarget.duration; setDuration(Number.isFinite(next) && next > 0 ? next : 0); }} />
        ) : (
          <>
            {poster && <img src={poster} alt="" className="absolute inset-0 size-full object-cover opacity-25" />}
            <div className="relative -mt-16 space-y-3 px-5 text-center text-sm" role="status">
              <p>{failed ? 'This video is currently unavailable.' : 'Loading video…'}</p>
              {failed && <button type="button" onClick={retry} className="underline underline-offset-4">Try again</button>}
            </div>
          </>
        )}

        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/60 to-transparent p-3 sm:p-4">
          <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f6ecdf]">Yasraf in motion</span>
          <button type="button" autoFocus aria-label="Close product video" onClick={onClose} className={`${controlClass} bg-black/45`}>
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#16120f] via-[#16120f]/90 to-transparent px-3 pb-3 pt-12 sm:px-4 sm:pb-4">
          {source && !failed && (
            <div className="mb-2 flex items-center gap-2 sm:gap-3">
              <button type="button" aria-label={paused ? 'Play video' : 'Pause video'} onClick={togglePlayback} className={controlClass}>
                {paused ? <Play size={15} fill="currentColor" aria-hidden="true" /> : <Pause size={16} fill="currentColor" aria-hidden="true" />}
              </button>
              <input type="range" min="0" max={duration || 1} step="0.1" value={Math.min(elapsed, duration)} disabled={!duration} aria-label="Video position" aria-valuetext={`${timeLabel(elapsed)} of ${timeLabel(duration)}`}
                className="h-6 min-w-0 flex-1 cursor-pointer accent-[#f2deca] disabled:cursor-default"
                onChange={(event) => { const next = Number(event.currentTarget.value); if (player.current && duration) { player.current.currentTime = next; setElapsed(next); } }} />
              <button type="button" aria-label={muted ? 'Unmute video' : 'Mute video'} onClick={toggleSound} className={controlClass}>
                {muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-black/35 p-2.5 backdrop-blur-md">
            <p id={titleId} className="min-w-0 flex-1 basis-24 break-words pl-1 text-base leading-tight text-[#fff8ef] sm:text-lg" style={{ fontFamily: 'var(--font-family-editorial)' }}>{title}</p>
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#f6ecdf] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#1a1814] transition-colors hover:bg-[#e8d2b9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                See on Instagram <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </dialog>, document.body
  );
}

export default function ProductVideo({ path, poster, title, instagram }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [dragging, setDragging] = useState(false);
  const trigger = useRef(null);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const instructions = useId();

  useEffect(() => {
    function keepVisible() {
      const button = trigger.current;
      if (button) setPosition((value) => value ? clampPosition(value.left, value.top, button) : value);
    }
    window.addEventListener('resize', keepVisible);
    return () => window.removeEventListener('resize', keepVisible);
  }, []);

  function pointerDown(event) {
    if (!event.isPrimary || event.button !== 0) return;
    const { left, top } = event.currentTarget.getBoundingClientRect();
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left, top, moved: false };
    suppressClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event) {
    const start = gesture.current;
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!start.moved) {
      start.moved = true;
      suppressClick.current = true;
      setDragging(true);
    }
    setPosition(clampPosition(start.left + dx, start.top + dy, event.currentTarget));
  }

  function endDrag(event) {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null;
    setDragging(false);
  }

  function moveByKey(event) {
    if (event.key === 'Home') {
      event.preventDefault();
      setPosition(null);
      return;
    }
    const offset = ARROWS[event.key];
    if (!Array.isArray(offset)) return;
    event.preventDefault();
    const { left, top } = event.currentTarget.getBoundingClientRect();
    setPosition(clampPosition(left + offset[0] * 24, top + offset[1] * 24, event.currentTarget));
  }

  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <span id={instructions} className="sr-only">Click to play. Drag or use arrow keys to move this card. Press Home to reset its position.</span>
      <button ref={trigger} type="button" aria-label={`Watch product video for ${title}`} aria-haspopup="dialog" aria-describedby={instructions}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onKeyDown={moveByKey}
        onClick={(event) => { if (!suppressClick.current || event.detail === 0) setOpen(true); suppressClick.current = false; }}
        style={position ? { left: position.left, top: position.top, right: 'auto', bottom: 'auto' } : undefined}
        className={`group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-[80] grid aspect-[9/15] w-[4.5rem] touch-none select-none overflow-hidden rounded-xl border border-white/55 bg-[#352c25] text-white shadow-[0_8px_26px_#21191046] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b513c] sm:bottom-24 sm:left-auto sm:right-6 sm:w-24 lg:w-28 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
        {poster && <img src={poster} alt="" draggable={false} loading="lazy" decoding="async" className="pointer-events-none absolute inset-0 size-full object-cover" />}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/35" />
        <span className="pointer-events-none absolute inset-x-0 top-1.5 flex justify-center" aria-hidden="true"><GripHorizontal size={16} className="drop-shadow" /></span>
        <span className="pointer-events-none relative m-auto grid size-8 place-items-center rounded-full border border-white/55 bg-black/40 backdrop-blur-sm transition-transform group-hover:scale-110 motion-reduce:transition-none sm:size-10">
          <Play size={14} className="ml-0.5 fill-current" aria-hidden="true" />
        </span>
        <span className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[8px] font-semibold uppercase tracking-wider sm:text-[9px]">Watch video</span>
      </button>
      {open && <VideoDialog path={path} poster={poster} title={title} instagram={normalizeInstagramPost(instagram)} onClose={close} />}
    </>, document.body
  );
}
