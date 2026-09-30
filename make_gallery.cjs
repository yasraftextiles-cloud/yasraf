const fs = require('fs');
const path = './public/products';
const files = fs.readdirSync(path);

// Let's create an html file that displays thumbnails of distinct groups
let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Yasraf Image Catalog Preview</title>
<style>
  body { font-family: sans-serif; background: #111; color: #fff; padding: 20px; }
  h2 { border-bottom: 1px solid #444; padding-bottom: 8px; margin-top: 30px; color: #d4af37; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 20px; }
  .card { background: #222; border-radius: 8px; overflow: hidden; padding: 8px; text-align: center; }
  img { width: 100%; height: 220px; object-fit: cover; border-radius: 4px; }
  p { font-size: 11px; word-break: break-all; margin: 8px 0 0 0; color: #ccc; }
</style>
</head>
<body>
<h1>Yasraf Public Image Vault</h1>
`;

// Specific named images
const named = files.filter(f => !f.startsWith('WhatsApp') && !f.startsWith('ChatGPT'));
html += `<h2>Named & Curated Images (${named.length})</h2><div class="grid">`;
named.forEach(f => {
  html += `<div class="card"><img src="/products/${encodeURIComponent(f)}" loading="lazy"><p>${f}</p></div>`;
});
html += `</div>`;

// WhatsApp by date
const dates = ['2026-09-17', '2026-09-16', '2026-08-17', '2026-08-12', '2026-08-05', '2026-08-03', '2026-07-25', '2026-07-24', '2026-07-17', '2026-06-29'];
dates.forEach(d => {
  const wFiles = files.filter(f => f.includes(d) && f.endsWith('.jpeg'));
  if (wFiles.length > 0) {
    html += `<h2>WhatsApp Batch: ${d} (${wFiles.length} photos - showing top 8)</h2><div class="grid">`;
    wFiles.slice(0, 8).forEach(f => {
      html += `<div class="card"><img src="/products/${encodeURIComponent(f)}" loading="lazy"><p>${f}</p></div>`;
    });
    html += `</div>`;
  }
});

// ChatGPT images
const cDates = ['Sep 17', 'Sep 16', 'Aug 15', 'Aug 13', 'Aug 12', 'Aug 7', 'Aug 5', 'Aug 3', 'Jul 24', 'Jul 19'];
cDates.forEach(d => {
  const cFiles = files.filter(f => f.startsWith('ChatGPT Image') && f.includes(d));
  if (cFiles.length > 0) {
    html += `<h2>ChatGPT Renders: ${d} (${cFiles.length} images - showing top 4)</h2><div class="grid">`;
    cFiles.slice(0, 4).forEach(f => {
      html += `<div class="card"><img src="/products/${encodeURIComponent(f)}" loading="lazy"><p>${f}</p></div>`;
    });
    html += `</div>`;
  }
});

html += `</body></html>`;
fs.writeFileSync('public/gallery_preview.html', html);
console.log('gallery_preview.html written successfully');
