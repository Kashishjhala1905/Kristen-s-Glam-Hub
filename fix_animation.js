const fs = require('fs');
const path = require('path');
const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));
let count = 0;

files.forEach(f => {
  let p = path.join(viewsDir, f);
  let c = fs.readFileSync(p, 'utf8');
  let updated = false;

  const targetRegex = /const span = document\.createElement\("span"\);\s*span\.textContent = char === " " \? "\\u00A0" : char;\s*span\.style\.animationDelay = `\$\{i \* 0\.03\}s`;\s*heading\.appendChild\(span\);/g;

  if (targetRegex.test(c)) {
    c = c.replace(targetRegex, `if (char === " ") {
            heading.appendChild(document.createTextNode(" "));
          } else {
            const span = document.createElement("span");
            span.textContent = char;
            span.style.animationDelay = \`\${i * 0.03}s\`;
            heading.appendChild(span);
          }`);
    updated = true;
  }

  // Also catch variations with single quotes or different spacing
  const altRegex = /const span = document\.createElement\("span"\);\s*span\.textContent = char === " " \? "\\u00A0" : char;\s*span\.style\.animationDelay = `\$\{i \* 0\.03\}s`;\s*(\/\/ Quick effect)?\s*heading\.appendChild\(span\);/g;

  if (altRegex.test(c)) {
      c = c.replace(altRegex, `if (char === " ") {
            heading.appendChild(document.createTextNode(" "));
          } else {
            const span = document.createElement("span");
            span.textContent = char;
            span.style.animationDelay = \`\${i * 0.03}s\`;
            heading.appendChild(span);
          }`);
      updated = true;
  }

  if (updated) {
    fs.writeFileSync(p, c);
    count++;
  }
});
console.log('Fixed heading animation in ' + count + ' files.');
