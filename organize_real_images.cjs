const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'public', 'products');
const imgDir = path.join(__dirname, 'public', 'images');

const imageMap = [
  // 1. Noor-e-Kashmir Black & Rust Embroidered (With Yasraf Logo)
  { src: 'MEERAB BLACK.png', dest: 'yasraf-meerab-black-1.png' },
  { src: 'WhatsApp Image 2026-08-03 at 5.25.09 AM.jpeg', dest: 'yasraf-meerab-black-2.jpg' },

  // 2. Emerald Green Luxury Festive Suit
  { src: 'green dress meerab.png', dest: 'yasraf-emerald-green-1.png' },
  { src: 'WhatsApp Image 2026-09-16 at 3.45.34 AM.jpeg', dest: 'yasraf-emerald-green-2.jpg' },
  { src: 'WhatsApp Image 2026-09-16 at 3.46.03 AM.jpeg', dest: 'yasraf-emerald-green-3.jpg' },

  // 3. Saffron Mustard Yellow & Black Floral Silk Lawn
  { src: 'yellow.png', dest: 'yasraf-saffron-yellow-1.png' },
  { src: 'WhatsApp Image 2026-08-12 at 4.26.45 AM (1).jpeg', dest: 'yasraf-saffron-yellow-2.jpg' },

  // 4. Zardozi Noir Black & Gold Raw Silk / Pret Kurta
  { src: 'black.png', dest: 'yasraf-zardozi-black-1.png' },

  // 5. Royal Courtyard Violet Schiffli Luxury Lawn (Palace Shoot)
  { src: 'WhatsApp Image 2026-09-17 at 3.45.58 AM.jpeg', dest: 'yasraf-violet-court-1.jpg' },
  { src: 'WhatsApp Image 2026-09-17 at 3.45.57 AM.jpeg', dest: 'yasraf-violet-court-2.jpg' },
  { src: 'WhatsApp Image 2026-09-17 at 3.45.57 AM (1).jpeg', dest: 'yasraf-violet-court-3.jpg' },

  // 6. Sage Green Chikan & Organza Embroidered 3-Piece
  { src: '16d7c07c-71dc-4edf-9fef-16e2d867b010.jpg', dest: 'yasraf-sage-green-1.jpg' },
  { src: '1d2e4bdb-9cf9-436c-832b-5881bc2dd4d5.jpg', dest: 'yasraf-sage-green-2.jpg' },

  // 7. Neelam Peacock Teal Metallic Embroidered Suit
  { src: '2c00df9d-20af-420a-8394-69aefd77f68f.jpg', dest: 'yasraf-peacock-teal-1.jpg' },
  { src: '93a95957-db17-4ff3-b163-6f225728a08e.jpg', dest: 'yasraf-peacock-teal-2.jpg' },
  { src: 'f3eb74de-eaef-4487-b5eb-8f12226f4d4f.jpg', dest: 'yasraf-peacock-teal-3.jpg' },

  // 8. Chandni Ivory & Onyx Monochrome Embroidered Suit
  { src: '615c1f4b-9ab7-4b84-a493-4e45814f2f26.jpg', dest: 'yasraf-ivory-onyx-1.jpg' },
  { src: 'e94cfeed-50ef-4c6d-9502-25e6719a2d80.jpg', dest: 'yasraf-ivory-onyx-2.jpg' },

  // 9. Zehra Mauve Paisley Embroidered Suit
  { src: '720c870e-b115-467d-a27c-bb80d27936b9.jpg', dest: 'yasraf-mauve-paisley-1.jpg' },
  { src: '946c746d-f6bd-4db5-aead-4413b7ac53c1.jpg', dest: 'yasraf-mauve-paisley-2.jpg' },
  { src: '9ff5681a-e09d-438e-b3d1-463ce017a4c3.jpg', dest: 'yasraf-mauve-paisley-3.jpg' },

  // 10. Falak Glacier Blue Fringed Lace Lawn
  { src: '1fb8069d-9f68-4047-95f1-11675e7de4df.jpg', dest: 'yasraf-glacier-blue-1.jpg' },
  { src: '677fb264-7abd-4dad-ab6c-d11da32aeea0.jpg', dest: 'yasraf-glacier-blue-2.jpg' },
  { src: 'WhatsApp Image 2026-06-29 at 6.52.11 AM.jpeg', dest: 'yasraf-glacier-blue-3.jpg' },

  // 11. Peach & Tangerine Schiffli Set
  { src: 'WhatsApp Image 2026-06-29 at 6.54.11 AM.jpeg', dest: 'yasraf-peach-tangerine-1.jpg' },

  // 12. Blush Butterfly Schiffli Stitched Set
  { src: 'WhatsApp Image 2026-08-12 at 5.15.01 AM.jpeg', dest: 'yasraf-blush-butterfly-1.jpg' },

  // 13. Aqua Baroque Digital Kurti
  { src: 'WhatsApp Image 2026-08-03 at 4.38.24 AM.jpeg', dest: 'yasraf-aqua-baroque-1.jpg' },

  // 14. Lilac Floral Lawn Kurta
  { src: 'WhatsApp Image 2026-07-17 at 3.23.58 AM.jpeg', dest: 'yasraf-lilac-fringed-1.jpg' },

  // 15. Editorial Banners
  { src: 'hania amir image banner.webp', dest: 'yasraf-editorial-hania-1.webp' },
  { src: 'hania.webp', dest: 'yasraf-editorial-hania-2.webp' }
];

let copied = 0;
let errors = 0;

imageMap.forEach(item => {
  const sourcePath = path.join(srcDir, item.src);
  const destPath = path.join(srcDir, item.dest);
  const imgDestPath = path.join(imgDir, item.dest);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    // Also copy to public/images for cross-reference
    fs.copyFileSync(sourcePath, imgDestPath);
    copied++;
    console.log(`Copied: ${item.src} -> ${item.dest}`);
  } else {
    console.error(`Source not found: ${item.src}`);
    errors++;
  }
});

console.log(`\nFinished copying images: ${copied} copied, ${errors} errors.`);
