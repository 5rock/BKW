const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');
const rootDir = path.join(__dirname, 'frontend');

// Define mappings (old path relative to src -> new path relative to src)
const dirMap = {
  'components/auth': 'features/auth/components',
  'components/categories': 'features/products/components',
  'components/products': 'features/products/components',
  'components/filters': 'features/search/components',
  'pages/auth': 'features/auth/pages',
  'pages/products': 'features/products/pages',
  'pages/seller': 'features/seller/pages',
  'context': 'app/providers'
};

const fileMap = {
  'App.jsx': 'app/App.jsx',
  'main.jsx': 'app/main.jsx',
  'components/CartItem.jsx': 'features/cart/components/CartItem.jsx',
  'components/Chatbot.jsx': 'features/ai/components/Chatbot.jsx',
  'components/ChatbotLauncher.jsx': 'features/ai/components/ChatbotLauncher.jsx',
  'components/DarkModeToggle.jsx': 'components/ui/DarkModeToggle.jsx',
  'components/ErrorBoundary.jsx': 'app/providers/ErrorBoundary.jsx',
  'components/Footer.jsx': 'components/ui/Footer.jsx',
  'components/Navbar.jsx': 'components/ui/Navbar.jsx',
  'components/ProductCard.jsx': 'features/products/components/ProductCard.jsx',
  'components/ProtectedRoute.jsx': 'app/routes/ProtectedRoute.jsx',
  'components/SearchBar.jsx': 'features/search/components/SearchBar.jsx',
  'components/StarRating.jsx': 'features/products/components/StarRating.jsx',
  'pages/HomePage.jsx': 'app/routes/HomePage.jsx',
  'pages/About.jsx': 'app/routes/About.jsx',
  'pages/CartPage.jsx': 'features/cart/pages/CartPage.jsx',
  'pages/Contact.jsx': 'app/routes/Contact.jsx',
  'pages/LoginPage.jsx': 'features/auth/pages/LoginPage.jsx',
  'pages/ProductDetailsPage.jsx': 'features/products/pages/ProductDetailsPage.jsx',
  'pages/ProductListingPage.jsx': 'features/products/pages/ProductListingPage.jsx',
  'pages/Returns.jsx': 'app/routes/Returns.jsx',
  'pages/SellerDashboard.jsx': 'features/seller/pages/SellerDashboard.jsx',
  'pages/ShippingInfo.jsx': 'app/routes/ShippingInfo.jsx',
};

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });
  return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir);

// 1. Convert all relative to @ alias
allFiles.filter(f => f.endsWith('.js') || f.endsWith('.jsx')).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/(from\s+['"]|import\(['"])([.][^'"]+)(['"])/g, (match, prefix, relPath, suffix) => {
    const absoluteImport = path.resolve(path.dirname(file), relPath);
    const relativeToSrc = path.relative(srcDir, absoluteImport).replace(/\\/g, '/');
    if (relativeToSrc.startsWith('..')) return match;
    return `${prefix}@/${relativeToSrc}${suffix}`;
  });
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Step 1 complete: Converted relative imports to alias @/');

// Generate move mapping for all files
const moves = {};
allFiles.forEach(file => {
  const relPath = path.relative(srcDir, file).replace(/\\/g, '/');
  let newRelPath = relPath;
  
  if (fileMap[relPath]) {
    newRelPath = fileMap[relPath];
  } else {
    for (const [oldDir, newDir] of Object.entries(dirMap)) {
      if (relPath.startsWith(oldDir + '/')) {
        newRelPath = relPath.replace(oldDir + '/', newDir + '/');
        break;
      }
    }
  }
  
  if (newRelPath === relPath && relPath.startsWith('components/')) {
      if (relPath.startsWith('components/hero/')) newRelPath = relPath.replace('components/hero/', 'components/ui/');
      else if (relPath.startsWith('components/animations/')) newRelPath = relPath.replace('components/animations/', 'components/ui/');
      else if (relPath.startsWith('components/performance/')) newRelPath = relPath.replace('components/performance/', 'components/ui/');
  }

  if (relPath !== newRelPath) {
    moves[relPath] = newRelPath;
  }
});

// 2. Rewrite aliases in all files according to moves
allFiles.filter(f => f.endsWith('.js') || f.endsWith('.jsx')).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const moveKeys = Object.keys(moves).sort((a,b) => b.length - a.length);
  
  moveKeys.forEach(oldRelPath => {
    const newRelPath = moves[oldRelPath];
    const oldImport = oldRelPath.replace(/\.(jsx?)$/, '');
    const newImport = newRelPath.replace(/\.(jsx?)$/, '');
    
    // Replace `@/oldImport` with `@/newImport`
    const regex = new RegExp(`@/${oldImport}(['"/])`, 'g');
    content = content.replace(regex, `@/${newImport}$1`);
  });
  
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Step 2 complete: Rewrote aliases based on new paths');

// 3. Update index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    indexHtml = indexHtml.replace('/src/main.jsx', '/src/app/main.jsx');
    fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
}
console.log('Step 3 complete: Updated index.html');

// 4. Perform file moves
Object.entries(moves).forEach(([oldRelPath, newRelPath]) => {
  const oldAbs = path.join(srcDir, oldRelPath);
  const newAbs = path.join(srcDir, newRelPath);
  
  if (fs.existsSync(oldAbs)) {
    const newDir = path.dirname(newAbs);
    if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
    fs.renameSync(oldAbs, newAbs);
  }
});
console.log('Step 4 complete: Moved files successfully');
