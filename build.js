const fs = require('fs');
const path = require('path');

// Simple build script to prepare frontend for production
const buildDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');

// Create dist directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy public files to dist
function copyDirectory(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Minify HTML files (basic)
function minifyHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const minified = content
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\n/g, '')
    .trim();
  fs.writeFileSync(filePath, minified);
}

// Copy and process files
copyDirectory(publicDir, buildDir);

// Minify HTML files
const htmlFiles = ['index.html'];
htmlFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  if (fs.existsSync(filePath)) {
    minifyHTML(filePath);
  }
});

console.log('Build completed successfully!');
console.log('Files are ready in the /dist directory');
