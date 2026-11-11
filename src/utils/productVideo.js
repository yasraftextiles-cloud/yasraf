export const PRODUCT_VIDEO_BUCKET = 'product-videos';
export const PRODUCT_VIDEO_MAX_BYTES = 25 * 1024 * 1024;

export function validateProductVideo(file) {
  if (!file || file.type !== 'video/mp4' || !file.size) {
    return 'Choose a non-empty MP4 video. For best compatibility, export as H.264 MP4.';
  }
  if (file.size > PRODUCT_VIDEO_MAX_BYTES) return 'The video must be 25 MB or smaller.';
  return null;
}

export function normalizeInstagramPost(value) {
  try {
    const url = new URL(value?.trim());
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.host)
      || url.username || url.password) return null;
    const post = url.pathname.match(/^\/(reel|p|tv)\/([A-Za-z0-9_-]+)\/?$/);
    return post ? `https://www.instagram.com/${post[1]}/${post[2]}/` : null;
  } catch {
    return null;
  }
}
