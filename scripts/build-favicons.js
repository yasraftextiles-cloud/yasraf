import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const userImagePath = 'C:/Users/mohtisham/.gemini/antigravity-ide/brain/e0d8079f-6ce5-4968-ad8e-2c7fea588ad7/.user_uploaded/media_1791871266266.png';
const publicDir = 'd:/yasraf-main/public';

async function generateFavicons() {
  console.log('Reading source image:', userImagePath);
  const { data, info } = await sharp(userImagePath).raw().toBuffer({ resolveWithObject: true });

  // 1. Identify glyph boundaries with balanced padding
  // Non-zero alpha bounds were x: 235..787, y: 277..810
  const cropX = 191;
  const cropY = 224;
  const boxSize = 640;

  // Extract binary grid within the 640x640 frame
  const grid = new Uint8Array((boxSize + 2) * (boxSize + 2));
  const gw = boxSize + 2;
  const gh = boxSize + 2;

  for (let y = 0; y < boxSize; y++) {
    const srcY = cropY + y;
    for (let x = 0; x < boxSize; x++) {
      const srcX = cropX + x;
      if (srcX >= 0 && srcX < info.width && srcY >= 0 && srcY < info.height) {
        const a = data[(srcY * info.width + srcX) * 4 + 3];
        if (a > 30) {
          grid[(y + 1) * gw + (x + 1)] = 1;
        }
      }
    }
  }

  // 2. Moore-Neighbor Contour Tracing
  const visitedEdges = new Set();
  const rawContours = [];
  const DIRS = [
    [0, -1], [1, -1], [1, 0], [1, 1],
    [0, 1], [-1, 1], [-1, 0], [-1, -1]
  ];

  for (let y = 1; y < gh - 1; y++) {
    for (let x = 1; x < gw - 1; x++) {
      if (grid[y * gw + x] === 1 && grid[y * gw + (x - 1)] === 0) {
        const startKey = `${x},${y}`;
        if (visitedEdges.has(startKey)) continue;

        const contour = [];
        let cx = x, cy = y;
        let dir = 6;
        let steps = 0;

        while (steps++ < 25000) {
          visitedEdges.add(`${cx},${cy}`);
          contour.push([cx - 1, cy - 1]);

          let found = false;
          let nextDir = (dir + 5) % 8;
          for (let i = 0; i < 8; i++) {
            const checkDir = (nextDir + i) % 8;
            const nx = cx + DIRS[checkDir][0];
            const ny = cy + DIRS[checkDir][1];
            if (grid[ny * gw + nx] === 1) {
              cx = nx;
              cy = ny;
              dir = checkDir;
              found = true;
              break;
            }
          }

          if (!found || (cx === x && cy === y && contour.length > 2)) {
            break;
          }
        }

        if (contour.length > 100) {
          rawContours.push(contour);
        }
      }
    }
  }

  console.log(`Extracted ${rawContours.length} contours.`);

  // 3. Catmull-Rom to Cubic Bezier curve conversion for vector SVG
  function contourToSvgPath(pts, step = 3) {
    const sampled = [];
    for (let i = 0; i < pts.length; i += step) {
      sampled.push(pts[i]);
    }
    const n = sampled.length;
    if (n < 3) return '';

    let d = `M${Math.round(sampled[0][0])} ${Math.round(sampled[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = sampled[(i - 1 + n) % n];
      const p1 = sampled[i];
      const p2 = sampled[(i + 1) % n];
      const p3 = sampled[(i + 2) % n];

      const cp1x = (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1);
      const cp1y = (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1);
      const cp2x = (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1);
      const cp2y = (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1);

      d += `C${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    d += 'Z';
    return d;
  }

  const path0 = contourToSvgPath(rawContours[0], 3);
  const path1 = contourToSvgPath(rawContours[1], 3);

  // 4. Generate favicon.svg (with responsive dark mode color adaptation)
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="100%" height="100%">
  <style>
    .brand-glyph { fill: #18120c; }
    @media (prefers-color-scheme: dark) {
      .brand-glyph { fill: #faf7f2; }
    }
  </style>
  <path class="brand-glyph" d="${path0}" fill-rule="evenodd" />
  <path class="brand-glyph" d="${path1}" fill-rule="evenodd" />
</svg>
`;

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
  console.log('✓ Generated favicon.svg');

  // 5. Generate high-res transparent master PNG from source image
  const masterBuffer = await sharp(userImagePath)
    .extract({ left: cropX, top: cropY, width: boxSize, height: boxSize })
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), masterBuffer);
  console.log('✓ Generated android-chrome-512x512.png');

  // 192x192
  const png192 = await sharp(masterBuffer)
    .resize(192, 192, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), png192);
  console.log('✓ Generated android-chrome-192x192.png');

  // 32x32
  const png32 = await sharp(masterBuffer)
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
  console.log('✓ Generated favicon-32x32.png');

  // 16x16
  const png16 = await sharp(masterBuffer)
    .resize(16, 16, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);
  console.log('✓ Generated favicon-16x16.png');

  // 48x48 for ICO
  const png48 = await sharp(masterBuffer)
    .resize(48, 48, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  // 6. Generate apple-touch-icon.png (180x180, solid luxury off-white background)
  const appleTouch = await sharp(masterBuffer)
    .resize(150, 150, { kernel: sharp.kernel.lanczos3 })
    .extend({
      top: 15,
      bottom: 15,
      left: 15,
      right: 15,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);
  console.log('✓ Generated apple-touch-icon.png');

  // 7. Generate favicon.ico (multi-resolution container: 16x16, 32x32, 48x48)
  function createIco(pngBuffers, sizes) {
    const count = pngBuffers.length;
    const headerSize = 6 + count * 16;
    let offset = headerSize;
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type 1 = ICO
    header.writeUInt16LE(count, 4); // count

    const entries = [];
    for (let i = 0; i < count; i++) {
      const buf = pngBuffers[i];
      const size = sizes[i];
      const entry = Buffer.alloc(16);
      entry.writeUInt8(size >= 256 ? 0 : size, 0);
      entry.writeUInt8(size >= 256 ? 0 : size, 1);
      entry.writeUInt8(0, 2);
      entry.writeUInt8(0, 3);
      entry.writeUInt16LE(1, 4);
      entry.writeUInt16LE(32, 6);
      entry.writeUInt32LE(buf.length, 8);
      entry.writeUInt32LE(offset, 12);
      entries.push(entry);
      offset += buf.length;
    }

    return Buffer.concat([header, ...entries, ...pngBuffers]);
  }

  const icoBuffer = createIco([png16, png32, png48], [16, 32, 48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Generated favicon.ico');

  // 8. Generate site.webmanifest
  const manifest = {
    name: 'YASRAF Textiles',
    short_name: 'YASRAF',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#18120c',
    background_color: '#ffffff',
    display: 'standalone'
  };
  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✓ Generated site.webmanifest');
}

generateFavicons().catch(err => {
  console.error('Failed to generate favicons:', err);
  process.exit(1);
});
