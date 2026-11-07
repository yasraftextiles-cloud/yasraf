import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const uploads = [
  { id: 'yasraf-01', name: 'Maroon Paisley Kurti', file: 'media_1793187830964_44542d9f.jpg' },
  { id: 'yasraf-02', name: 'Magenta Floral Festive Tunic', file: 'media_1793187840596_97bedd1f.jpg' },
  { id: 'yasraf-03', name: 'Porcelain Blue Baroque Lawn', file: 'media_1793187851248_a483f27e.jpg' },
  { id: 'yasraf-04', name: 'Mustard Mirror-Work Raw Silk', file: 'media_1793187942204_d720fdb1.jpg' }
];

const basePath = 'C:/Users/mohtisham/.gemini/antigravity/brain/91be9abc-b88c-4c17-9ea6-95b2f4f9ec78/.user_uploaded/';
const outputDir = path.resolve('public/images/rack');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Convert RGB to Lab for perceptual color difference Delta-E
function rgb2lab([r, g, b]) {
  let rL = r / 255, gL = g / 255, bL = b / 255;
  rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92;
  gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92;
  bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92;

  let x = (rL * 0.4124 + gL * 0.3576 + bL * 0.1805) / 0.95047;
  let y = (rL * 0.2126 + gL * 0.7152 + bL * 0.0722) / 1.00000;
  let z = (rL * 0.0193 + gL * 0.1192 + bL * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}

function deltaE(labA, labB) {
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

async function processImage(item) {
  console.log(`Processing ${item.id} (${item.file})...`);
  const inputPath = path.join(basePath, item.file);
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const getRGB = (x, y) => {
    const idx = (y * width + x) * channels;
    return [data[idx], data[idx + 1], data[idx + 2]];
  };

  // Collect seed background colors from corners and image borders
  const bgSeeds = [];
  // sample border pixels
  for (let x = 0; x < width; x += 10) {
    bgSeeds.push(rgb2lab(getRGB(x, 2)));
    bgSeeds.push(rgb2lab(getRGB(x, height - 3)));
  }
  for (let y = 0; y < height; y += 10) {
    bgSeeds.push(rgb2lab(getRGB(2, y)));
    bgSeeds.push(rgb2lab(getRGB(width - 3, y)));
  }

  // Flood fill from borders
  // 0 = unvisited, 1 = background, 2 = foreground
  const mask = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qHead = 0;
  let qTail = 0;

  // Push all border pixels that are close to bgSeeds
  const isSeedMatch = (x, y, threshold = 22) => {
    const lab = rgb2lab(getRGB(x, y));
    for (let s = 0; s < bgSeeds.length; s += 4) {
      if (deltaE(lab, bgSeeds[s]) < threshold) return true;
    }
    return false;
  };

  for (let x = 0; x < width; x++) {
    queue[qTail++] = (0 * width + x);
    mask[0 * width + x] = 1;
    queue[qTail++] = ((height - 1) * width + x);
    mask[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    if (!mask[y * width + 0]) {
      queue[qTail++] = (y * width + 0);
      mask[y * width + 0] = 1;
    }
    if (!mask[y * width + (width - 1)]) {
      queue[qTail++] = (y * width + (width - 1));
      mask[y * width + (width - 1)] = 1;
    }
  }

  // Specific tuning per image for perfect crisp cutouts
  let tolerance = 18;
  if (item.id === 'yasraf-01') tolerance = 17;
  if (item.id === 'yasraf-03') tolerance = 24;
  if (item.id === 'yasraf-04') tolerance = 20;
  if (item.id === 'yasraf-02') tolerance = 19;

  // BFS
  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % width;
    const cy = (curr / width) | 0;
    const currLab = rgb2lab(getRGB(cx, cy));

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (let i = 0; i < 4; i++) {
      const nIdx = neighbors[i];
      if (nIdx !== -1 && mask[nIdx] === 0) {
        const nx = nIdx % width;
        const ny = (nIdx / width) | 0;
        const nLab = rgb2lab(getRGB(nx, ny));

        // Background criteria:
        // 1. Matches current neighbor closely OR matches a border seed
        const distToNeighbor = deltaE(currLab, nLab);
        let distToSeed = 999;
        for (let s = 0; s < bgSeeds.length; s += 8) {
          const d = deltaE(nLab, bgSeeds[s]);
          if (d < distToSeed) distToSeed = d;
        }

        if (distToNeighbor < tolerance || distToSeed < tolerance * 1.2) {
          mask[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }
  }

  // Create output RGBA buffer
  const outBuffer = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const dstIdx = i * 4;
    outBuffer[dstIdx] = data[srcIdx];
    outBuffer[dstIdx + 1] = data[srcIdx + 1];
    outBuffer[dstIdx + 2] = data[srcIdx + 2];
    outBuffer[dstIdx + 3] = mask[i] === 1 ? 0 : 255;
  }

  const outFileName = `${item.id}-cutout.png`;
  const outFilePath = path.join(outputDir, outFileName);

  await sharp(outBuffer, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
  .png()
  .toFile(outFilePath);

  console.log(`Saved: ${outFilePath}`);
}

async function run() {
  for (const item of uploads) {
    await processImage(item);
  }
}

run().catch(console.error);

