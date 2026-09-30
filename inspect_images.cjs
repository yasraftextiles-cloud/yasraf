const fs = require('fs');
const files = fs.readdirSync('public/products');
const whatsapp = files.filter(f => f.startsWith('WhatsApp Image'));
const chatgpt = files.filter(f => f.startsWith('ChatGPT Image'));
const others = files.filter(f => !f.startsWith('WhatsApp') && !f.startsWith('ChatGPT'));
fs.writeFileSync('public/inventory_summary.json', JSON.stringify({
  total: files.length,
  others,
  sampleWhatsapp: whatsapp.slice(0, 30),
  totalWhatsapp: whatsapp.length,
  totalChatgpt: chatgpt.length
}, null, 2));
console.log('Written inventory summary');
