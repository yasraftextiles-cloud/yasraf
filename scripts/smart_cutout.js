import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const basePath = 'C:/Users/mohtisham/.gemini/antigravity/brain/91be9abc-b88c-4c17-9ea6-95b2f4f9ec78/.user_uploaded/';
const outputDir = path.resolve('public/images/rack');

async function testSegment3() {
  const f = 'media_1793187851248_a483f27e.jpg';
  const img = sharp(basePath + f);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const out = Buffer.alloc(width * height * 4);

  // Dress 3: Carpet is very dark reddish (R < 80, G < 35, B < 30).
  // Everything else is white dress, blue print, pearl hanger!
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const outIdx = (y * width + x) * 4;
      out[outIdx] = r;
      out[outIdx + 1] = g;
      out[outIdx + 2] = b;

      // Carpet detection:
      // Dark red carpet: low brightness, low green and blue
      const isCarpet = (r < 85 && g < 42 && b < 40) && (g < r * 0.75);

      // Bottom carpet check or edge check
      // Also note toes at the very bottom center (y > 990)
      const isToe = (y > 980 && x < 250);

      if (isCarpet || isToe) {
        out[outIdx + 3] = 0; // transparent
      } else {
        out[outIdx + 3] = 255;
      }
    }
  }

  // Flood fill from outer corners to remove any stray carpet islands
  // and keep the main garment connected
  await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(outputDir, 'yasraf-03-test.png'));
  console.log('Saved yasraf-03-test.png');
}

async function testSegment4() {
  const f = 'media_1793187942204_d720fdb1.jpg';
  const img = sharp(basePath + f);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const out = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const outIdx = (y * width + x) * 4;
      out[outIdx] = r;
      out[outIdx + 1] = g;
      out[outIdx + 2] = b;

      // Marble wall: neutral grey/white (r ≈ g ≈ b)
      // Yellow dress: high saturation, r > 100, g > 80, b < 90, (r - b) > 40 && (g - b) > 25
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      const isYellow = (r > 80 && g > 60 && (r - b) > 30 && (g - b) > 20);
      const isMirrorSilver = (chroma < 35 && (r + g + b) > 350 && x > 80 && x < 500 && y > 30 && y < 900); // mirror embroidery inside dress

      // Let's check if it's dress
      const isDress = isYellow || (isMirrorSilver && x > 100 && x < 480);

      if (!isDress) {
        out[outIdx + 3] = 0;
      } else {
        out[outIdx + 3] = 255;
      }
    }
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(outputDir, 'yasraf-04-test.png'));
  console.log('Saved yasraf-04-test.png');
}

Promise.all([testSegment3(), testSegment4()]).catch(console.error);

