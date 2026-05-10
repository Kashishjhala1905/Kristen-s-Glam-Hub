const fs = require('fs');
const path = require('path');
const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));
let count = 0;

const logoHTML = `<div class="nav-logo" onclick="location.href='/'" style="cursor:pointer; display:flex; align-items:center; margin-right: 15px;"><img src="/images/logo.png" alt="Glam Hub Logo" style="height: 45px; width: auto; border-radius: 50%; border: 2px solid #d63384; padding: 2px;" /></div>`;

files.forEach(f => {
  let p = path.join(viewsDir, f);
  let c = fs.readFileSync(p, 'utf8');
  let updated = false;

  if (c.includes('<nav>') && !c.includes('class="nav-logo"')) {
    c = c.replace(/<nav>(\s*)<ul>/i, '<nav>\n      ' + logoHTML + '$1<ul>');
    updated = true;
  }
  
  if (f === 'index.ejs' && !c.includes('class="nav-logo"')) {
     c = c.replace(/<div class="right">(\s*)<div class="nav-item">/i, '<div class="right">\n      ' + logoHTML + '$1<div class="nav-item">');
     updated = true;
  }

  if (updated) {
    fs.writeFileSync(p, c);
    count++;
  }
});
console.log('Updated ' + count + ' files with logo.');
