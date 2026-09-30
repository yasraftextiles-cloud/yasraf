const fs = require('fs');
const path = './public/products';
const files = fs.readdirSync(path);

const groups = {};
files.forEach(f => {
  if (f.startsWith('WhatsApp Image')) {
    // WhatsApp Image 2026-06-29 at 6.52.11 AM.jpeg
    const match = f.match(/WhatsApp Image (\d{4}-\d{2}-\d{2})/);
    const date = match ? match[1] : 'unknown';
    if (!groups[date]) groups[date] = [];
    groups[date].push(f);
  } else if (f.startsWith('ChatGPT Image')) {
    const match = f.match(/ChatGPT Image ([A-Za-z]+ \d{1,2}, \d{4})/);
    const date = match ? match[1] : 'chatgpt';
    if (!groups['ChatGPT: ' + date]) groups['ChatGPT: ' + date] = [];
    groups['ChatGPT: ' + date].push(f);
  }
});

const report = {};
for (const [k, v] of Object.entries(groups)) {
  report[k] = {
    count: v.length,
    samples: v.slice(0, 5)
  };
}

fs.writeFileSync('public/groups_report.json', JSON.stringify(report, null, 2));
console.log('Group report generated');
