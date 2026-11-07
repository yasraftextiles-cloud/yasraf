import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const basePath = 'C:/Users/mohtisham/.gemini/antigravity/brain/91be9abc-b88c-4c17-9ea6-95b2f4f9ec78/.user_uploaded/';
const outputDir = path.resolve('public/images/rack');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// -------------------------------------------------------------
// Helper: Hole filling & keep largest connected component
// -------------------------------------------------------------
function cleanMask(mask, width, height) {
  const exterior = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qHead = 0, qTail = 0;

  for (let x = 0; x < width; x++) {
    if (mask[0 * width + x] === 0) { exterior[0 * width + x] = 1; queue[qTail++] = 0 * width + x; }
    if (mask[(height - 1) * width + x] === 0) { exterior[(height - 1) * width + x] = 1; queue[qTail++] = (height - 1) * width + x; }
  }
  for (let y = 0; y < height; y++) {
    if (mask[y * width + 0] === 0 && !exterior[y * width + 0]) { exterior[y * width + 0] = 1; queue[qTail++] = y * width + 0; }
    if (mask[y * width + (width - 1)] === 0 && !exterior[y * width + (width - 1)]) { exterior[y * width + (width - 1)] = 1; queue[qTail++] = y * width + (width - 1); }
  }

  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % width;
    const cy = (curr / width) | 0;

    const nbs = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (let i = 0; i < 4; i++) {
      const n = nbs[i];
      if (n !== -1 && exterior[n] === 0 && mask[n] === 0) {
        exterior[n] = 1;
        queue[qTail++] = n;
      }
    }
  }

  // Solid mask: fills internal holes
  const solidMask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    solidMask[i] = exterior[i] === 0 ? 1 : 0;
  }

  // Largest connected component
  const visited = new Uint8Array(width * height);
  let maxComponent = [];
  let maxCount = 0;

  for (let i = 0; i < width * height; i++) {
    if (solidMask[i] === 1 && !visited[i]) {
      const comp = [];
      const cQueue = [i];
      visited[i] = 1;
      let head = 0;

      while (head < cQueue.length) {
        const c = cQueue[head++];
        comp.push(c);
        const cx = c % width;
        const cy = (c / width) | 0;

        const nbs = [
          cx > 0 ? c - 1 : -1,
          cx < width - 1 ? c + 1 : -1,
          cy > 0 ? c - width : -1,
          cy < height - 1 ? c + width : -1
        ];

        for (let j = 0; j < 4; j++) {
          const n = nbs[j];
          if (n !== -1 && !visited[n] && solidMask[n] === 1) {
            visited[n] = 1;
            cQueue.push(n);
          }
        }
      }

      if (comp.length > maxCount) {
        maxCount = comp.length;
        maxComponent = comp;
      }
    }
  }

  const finalMask = new Uint8Array(width * height);
  for (const idx of maxComponent) {
    finalMask[idx] = 1;
  }

  return finalMask;
}

// -------------------------------------------------------------
// Dress 1: Maroon Paisley
// -------------------------------------------------------------
async function processDress1() {
  const f = 'media_1793187830964_44542d9f.jpg';
  const img = sharp(basePath + f);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const rawMask = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const brightness = (r + g + b) / 3;

      const isCarpet = (brightness < 45 && r < 80 && g < 35 && b < 40 && (r - g) > 15) ||
                       (y < 85 && (x < 180 || x > 400) && brightness < 55) ||
                       (y > 905);

      if (!isCarpet && y >= 80 && y <= 910) {
        rawMask[y * width + x] = 1;
      }
    }
  }

  const clean = cleanMask(rawMask, width, height);

  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    out[i * 4] = data[i * channels];
    out[i * 4 + 1] = data[i * channels + 1];
    out[i * 4 + 2] = data[i * channels + 2];
    out[i * 4 + 3] = clean[i] ? 255 : 0;
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(outputDir, 'yasraf-01-cutout.png'));
  console.log('Saved yasraf-01-cutout.png');
}

// -------------------------------------------------------------
// Dress 2: Magenta Floral Festive Tunic
// -------------------------------------------------------------
async function processDress2() {
  const f = 'media_1793187840596_97bedd1f.jpg';
  const img = sharp(basePath + f);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const rawMask = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];

      const inDressVerticalRange = y >= 360 && y <= 865;

      // Carpet colors: dark red/brown
      const isCarpet = (r < 96 && g < 62 && b < 66) ||
                       (r < 110 && g < 65 && b < 70 && (r - g) > 20);

      if (inDressVerticalRange && !isCarpet) {
        rawMask[y * width + x] = 1;
      }
    }
  }

  const clean = cleanMask(rawMask, width, height);

  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    out[i * 4] = data[i * channels];
    out[i * 4 + 1] = data[i * channels + 1];
    out[i * 4 + 2] = data[i * channels + 2];
    out[i * 4 + 3] = clean[i] ? 255 : 0;
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(outputDir, 'yasraf-02-cutout.png'));
  console.log('Saved yasraf-02-cutout.png');
}

// -------------------------------------------------------------
// Dress 3: Porcelain Blue Baroque Lawn
// -------------------------------------------------------------
async function processDress3() {
  const f = 'media_1793187851248_a483f27e.jpg';
  const img = sharp(basePath + f);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const rawMask = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];

      const isCarpet = (r < 85 && g < 42 && b < 40 && g < r * 0.75);
      const isToe = (y > 970 && x < 250);

      if (!isCarpet && !isToe && y > 25 && y < 855) {
        rawMask[y * width + x] = 1;
      }
    }
  }

  const clean = cleanMask(rawMask, width, height);

  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    out[i * 4] = data[i * channels];
    out[i * 4 + 1] = data[i * channels + 1];
    out[i * 4 + 2] = data[i * channels + 2];
    out[i * 4 + 3] = clean[i] ? 255 : 0;
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(outputDir, 'yasraf-03-cutout.png'));
  console.log('Saved yasraf-03-cutout.png');
}

// -------------------------------------------------------------
// Dress 4: Mustard Mirror-Work Raw Silk
// -------------------------------------------------------------
async function processDress4() {
  const f = 'media_1793187942204_d720fdb1.jpg';
  const img = sharp(basePath + f);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const rawMask = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];

      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      const isNeutralMarble = (chroma < 26 && r > 90) || (Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && r > 90);

      const isYellowFabric = (r > 80 && g > 60 && (r - b) > 35 && (g - b) > 22);
      const isMirrorInside = (x > 85 && x < 480 && y > 30 && y < 920 && chroma < 35 && (r + g + b) > 250);
      const isDarkEmbroidery = (x > 85 && x < 480 && y > 30 && y < 920 && (r + g + b) < 110);

      const isShelfOrFloor = (x < 75 && y > 680) || (y > 935);

      if ((isYellowFabric || isMirrorInside || isDarkEmbroidery) && !isNeutralMarble && !isShelfOrFloor) {
        rawMask[y * width + x] = 1;
      }
    }
  }

  const clean = cleanMask(rawMask, width, height);

  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    out[i * 4] = data[i * channels];
    out[i * 4 + 1] = data[i * channels + 1];
    out[i * 4 + 2] = data[i * channels + 2];
    out[i * 4 + 3] = clean[i] ? 255 : 0;
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(outputDir, 'yasraf-04-cutout.png'));
  console.log('Saved yasraf-04-cutout.png');
}

async function main() {
  await processDress1();
  await processDress2();
  await processDress3();
  await processDress4();
  console.log('All cutouts successfully created and cleaned!');
}

main().catch(console.error);
