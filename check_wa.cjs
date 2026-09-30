const fs = require('fs');
const files = fs.readdirSync('public/products');
const whatsapp = files.filter(f => f.startsWith('WhatsApp Image'));
console.log('WhatsApp files count:', whatsapp.length);
console.log('First 10:', whatsapp.slice(0, 10));
console.log('Last 10:', whatsapp.slice(-10));
