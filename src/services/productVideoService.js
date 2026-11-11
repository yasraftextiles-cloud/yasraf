import { supabase, isSupabaseConfigured, supabaseUrl } from '../lib/supabase.js';
import { PRODUCT_VIDEO_BUCKET, validateProductVideo } from '../utils/productVideo.js';

export async function getProductVideoUrl(path) {
  const { data, error } = await supabase.storage.from(PRODUCT_VIDEO_BUCKET).createSignedUrl(path, 900);
  if (error || !data?.signedUrl) throw new Error('This video is currently unavailable.');
  return data.signedUrl;
}

export async function uploadProductVideo(file, onProgress) {
  const validationError = validateProductVideo(file);
  if (validationError) throw new Error(validationError);
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

  const [{ Upload }, { data: { session }, error }] = await Promise.all([
    import('tus-js-client'),
    supabase.auth.getSession(),
  ]);
  if (error || !session) throw new Error('Sign in again before uploading the product video.');

  const storageUrl = new URL(supabaseUrl);
  if (/^[a-z0-9]+\.supabase\.co$/.test(storageUrl.hostname)) {
    storageUrl.hostname = storageUrl.hostname.replace('.supabase.co', '.storage.supabase.co');
  }
  const endpoint = new URL('storage/v1/upload/resumable', `${storageUrl.href.replace(/\/$/, '')}/`).href;
  const path = `catalog/${crypto.randomUUID()}.mp4`;

  return new Promise((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint,
      headers: { authorization: `Bearer ${session.access_token}` },
      metadata: { bucketName: PRODUCT_VIDEO_BUCKET, objectName: path, contentType: 'video/mp4', cacheControl: '3600' },
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 1000, 3000, 5000],
      storeFingerprintForResuming: false,
      onProgress: (sent, total) => onProgress?.(total ? Math.floor(sent * 100 / total) : 0),
      onSuccess: () => resolve(path),
      onError: () => reject(new Error('Video upload failed. Check your connection or admin session, then try saving again.')),
    });
    upload.start();
  });
}
