import React, { useEffect, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { getProductVideoUrl } from '../services/productVideoService.js';
import { validateProductVideo } from '../utils/productVideo.js';

export default function ProductVideoFields({ value, onChange, disabled, progress }) {
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  async function showPreview() {
    setError('');
    setLoading(true);
    try {
      setPreview(value.file ? URL.createObjectURL(value.file) : await getProductVideoUrl(value.path));
    } catch {
      setError('The video preview could not be opened. Your product changes are still here.');
    }
    finally { setLoading(false); }
  }

  return (
    <section className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-4" aria-labelledby="product-video-heading">
      <h2 id="product-video-heading" className="text-lg border-b border-[#ebe6e0] pb-3" style={{ fontFamily: 'var(--font-family-editorial)' }}>
        Product Video <span className="text-xs text-[#67615c]">(Optional)</span>
      </h2>
      <p className="text-xs text-[#67615c]">MP4 up to 25 MB. A short vertical 9:16 clip works best. Upload starts when you save, publish, or update the product.</p>

      <div className="flex flex-wrap items-center gap-3">
        <label className={`inline-flex items-center gap-2 border border-[#1a1814] px-3 py-2 text-xs font-medium focus-within:outline-2 ${disabled || loading ? 'opacity-50' : 'cursor-pointer hover:bg-[#faf8f6]'}`}>
          <Upload size={15} aria-hidden="true" />
          {value.path || value.file ? 'Replace video' : 'Select MP4'}
          <input className="sr-only" type="file" accept="video/mp4,.mp4" disabled={disabled || loading} onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (!file) return;
            const message = validateProductVideo(file);
            setError(message || '');
            if (!message) {
              setPreview(null);
              onChange({ ...value, file });
            }
          }} />
        </label>
        {(value.path || value.file) && (
          <button type="button" className="inline-flex items-center gap-1.5 text-xs text-[#9b1c1c] underline underline-offset-2 disabled:opacity-50" disabled={disabled || loading} onClick={() => {
            setPreview(null); setError(''); onChange({ path: null, file: null, instagram: '' });
          }}>
            <Trash2 size={14} aria-hidden="true" /> Remove video
          </button>
        )}
      </div>

      {value.file && <p className="text-xs break-all">Selected: {value.file.name}</p>}
      {(value.file || value.path) && !preview && (
        <button type="button" className="text-xs underline underline-offset-2" onClick={showPreview} disabled={disabled || loading}>
          {loading ? 'Loading preview…' : value.file ? 'Preview selected video' : 'Preview uploaded video'}
        </button>
      )}
      {preview && !disabled && (
        <div className="space-y-2">
          <video key={preview} src={preview} controls playsInline preload="none" aria-label="Product video preview" className="max-h-56 w-auto max-w-full bg-black" onError={() => { setError('The preview could not be played. Try an H.264 MP4 export.'); setPreview(null); }} />
          <button type="button" className="text-xs underline underline-offset-2" onClick={() => setPreview(null)}>Close preview</button>
        </div>
      )}
      {progress !== null && <div role="status" className="text-xs"><progress aria-label="Video upload progress" value={progress} max="100" /> Uploading video: {progress}%</div>}
      {error && <p role="alert" className="text-xs text-[#9b1c1c]">{error}</p>}

      <label className="block space-y-2 text-xs font-medium">
        <span>Instagram Reel or post link (optional)</span>
        <input type="url" value={value.instagram} onChange={(event) => onChange({ ...value, instagram: event.target.value })} disabled={disabled} placeholder="https://www.instagram.com/reel/…/" className="block w-full border border-[#ebe6e0] bg-[#faf8f6] px-3 py-2.5 text-sm" />
      </label>
    </section>
  );
}
