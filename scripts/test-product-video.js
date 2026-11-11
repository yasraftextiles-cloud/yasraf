import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeInstagramPost, PRODUCT_VIDEO_MAX_BYTES, validateProductVideo } from '../src/utils/productVideo.js';

test('accepts an MP4 up to the configured bucket limit', () => {
  assert.equal(validateProductVideo({ type: 'video/mp4', size: PRODUCT_VIDEO_MAX_BYTES }), null);
  assert.ok(validateProductVideo({ type: 'video/mp4', size: PRODUCT_VIDEO_MAX_BYTES + 1 }));
  assert.ok(validateProductVideo({ type: 'video/mp4', size: 0 }));
  assert.ok(validateProductVideo({ type: 'video/quicktime', size: 123 }));
});

test('normalizes real Instagram posts and rejects other links', () => {
  assert.equal(normalizeInstagramPost('https://instagram.com/reel/D123_ab/?igsh=abc'), 'https://www.instagram.com/reel/D123_ab/');
  assert.equal(normalizeInstagramPost('https://www.instagram.com/p/A1-b'), 'https://www.instagram.com/p/A1-b/');
  for (const url of ['https://instagram.com.evil.test/reel/A/', 'https://evil.test@instagram.com/reel/A/', 'http://instagram.com/reel/A/', 'javascript:alert(1)', 'https://instagram.com/yasraftextiles_/', 'https://instagram.com/reel/A/extra', '']) {
    assert.equal(normalizeInstagramPost(url), null);
  }
});
