const fs = require('node:fs');
const path = require('node:path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const importRegex = /lucide-react\/dist\/esm\/icons\/([^']+)/g;
  
  content = content.replace(importRegex, (match, iconName) => {
    // If it ends with a number and no dash before it, e.g., clock3
    let fixedName = iconName;
    if (/[a-z]\d+$/.test(iconName)) {
      fixedName = iconName.replace(/\d+$/, '-$&');
    }
    if (fixedName !== iconName) {
      changed = true;
      return `lucide-react/dist/esm/icons/${fixedName}`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

walk(path.join(__dirname, 'src'));
