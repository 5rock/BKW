const fs = require('node:fs');
const path = require('node:path');

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/g;
  
  content = content.replace(importRegex, (match, iconsStr) => {
    changed = true;
    const icons = iconsStr.split(',').map(s => s.trim()).filter(Boolean);
    const newImports = icons.map(icon => {
      // Handle aliased imports if any, e.g. "AlertTriangle as Warning"
      let localName = icon;
      let importedName = icon;
      if (icon.includes(' as ')) {
        const parts = icon.split(' as ');
        importedName = parts[0].trim();
        localName = parts[1].trim();
      }
      const kebab = toKebabCase(importedName);
      return `import ${localName} from 'lucide-react/dist/esm/icons/${kebab}';`;
    });
    return newImports.join('\n');
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
