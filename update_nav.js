const fs = require('fs');
const path = require('path');
const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));
let updated = 0;
files.forEach(f => {
  let p = path.join(viewsDir, f);
  let c = fs.readFileSync(p, 'utf8');
  if (!c.includes('mobile-nav.js')) {
    if (c.includes('</body>')) {
      c = c.replace(/<\/body>/i, '<script src="/js/mobile-nav.js"></script>\n</body>');
      fs.writeFileSync(p, c);
      updated++;
    }
  }
});
console.log('Updated ' + updated + ' files');
