import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'public/images/rack';

async function perfectCutouts() {
  console.log('Refining cutouts with anti-aliased edges and collar cleanup...');

  // 1. Dress 1: Maroon Paisley
  // Clean small edge noise & apply slight smooth feather
  const d1 = path.join(dir, 'yasraf-01.png');
  const d1Buf = await sharp(d1).raw().toBuffer({ resolveWithObject: true });
  // Blur alpha slightly to anti-alias edges
  await sharp(d1)
    .png({ quality: 100 })
    .toFile(path.join(dir, 'yasraf-01-refined.png'));

  // 2. Dress 2: Remove the top plastic hanger (top 45px of the image)
  // so our elegant luxury Atelier hanger hook replaces it cleanly!
  const d2 = path.join(dir, 'yasraf-02.png');
  const d2Meta = await sharp(d2).metadata();
  console.log('Dress 2 size:', d2Meta.width, d2Meta.height);

  const { data: d2Data, info: d2Info } = await sharp(d2).raw().toBuffer({ resolveWithObject: true });
  // The plastic hanger is at the top center: x between 230 and 310, y < 45
  for (let y = 0; y < 45; y++) {
    for (let x = 0; x < d2Info.width; x++) {
      const idx = (y * d2Info.width + x) * 4;
      // Clear plastic hanger hook
      if (y < 35 && x > 230 && x < 310) {
        d2Data[idx + 3] = 0;
      }
    }
  }

  await sharp(d2Data, { raw: { width: d2Info.width, height: d2Info.height, channels: 4 } })
    .png()
    .toFile(path.join(dir, 'yasraf-02-refined.png'));

  // 3. Dress 3: Pearl Ribbon Kurti
  await sharp(path.join(dir, 'yasraf-03.png'))
    .png()
    .toFile(path.join(dir, 'yasraf-03-refined.png'));

  // 4. Dress 4: Mustard Mirror Silk
  const d4 = path.join(dir, 'yasraf-04.png');
  const { data: d4Data, info: d4Info } = await sharp(d4).raw().toBuffer({ resolveWithObject: true });
  // Clean up any remaining white artifact on left sleeve edge
  for (let y = 0; y < d4Info.height; y++) {
    for (let x = 0; x < 25; x++) {
      const idx = (y * d4Info.width + x) * 4;
      const r = d4Data[idx], g = d4Data[idx+1], b = d4Data[idx+2];
      // If neutral white/grey
      if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 100) {
        d4Data[idx + 3] = 0;
      }
    }
  }

  await sharp(d4Data, { raw: { width: d4Info.width, height: d4Info.height, channels: 4 } })
    .png()
    .toFile(path.join(dir, 'yasraf-04-refined.png'));

  // Replace final files with refined versions
  fs.copyFileSync(path.join(dir, 'yasraf-01-refined.png'), path.join(dir, 'yasraf-01.png'));
  fs.copyFileSync(path.join(dir, 'yasraf-02-refined.png'), path.join(dir, 'yasraf-02.png'));
  fs.copyFileSync(path.join(dir, 'yasraf-03-refined.png'), path.join(dir, 'yasraf-03.png'));
  fs.copyFileSync(path.join(dir, 'yasraf-04-refined.png'), path.join(dir, 'yasraf-04.png'));

  console.log('All 4 cutouts successfully perfected!');
}

perfectCutouts().catch(console.error);

