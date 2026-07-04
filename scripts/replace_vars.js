const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const replacements = [
    { from: /var\(--red-primary\)/g, to: 'var(--primary-emerald)' },
    { from: /var\(--red-dark\)/g, to: 'var(--primary-hover)' },
    { from: /var\(--red-light\)/g, to: 'var(--mint-accent)' },
    { from: /var\(--red-accent\)/g, to: 'var(--light-mint)' },
    { from: /var\(--black-soft\)/g, to: 'var(--text-primary)' },
    { from: /var\(--black\)/g, to: 'var(--text-primary)' },
    { from: /var\(--gray-900\)/g, to: 'var(--text-primary)' },
    { from: /var\(--gray-800\)/g, to: 'var(--text-primary)' },
    { from: /var\(--gray-700\)/g, to: 'var(--text-secondary)' },
    { from: /var\(--gray-600\)/g, to: 'var(--text-secondary)' },
    { from: /var\(--gray-500\)/g, to: 'var(--text-secondary)' },
    { from: /var\(--gray-400\)/g, to: 'var(--border-color)' },
    { from: /var\(--gray-300\)/g, to: 'var(--border-color)' },
    { from: /var\(--gray-200\)/g, to: 'var(--border-color)' },
    { from: /var\(--gray-100\)/g, to: 'var(--border-color)' },
    { from: /var\(--gray-50\)/g, to: 'var(--bg-section)' },
    { from: /var\(--white\)/g, to: 'var(--bg-card)' },
    { from: /var\(--shadow-sm\)/g, to: 'var(--shadow-card)' },
    { from: /var\(--shadow-md\)/g, to: 'var(--shadow-card)' },
    { from: /var\(--shadow-lg\)/g, to: 'var(--shadow-card)' },
    { from: /var\(--shadow-red\)/g, to: 'var(--shadow-primary)' },
    { from: /background-color: rgba\(15, 23, 42, 0.02\);/g, to: 'background-color: #FFFFFF;' },
    { from: /background-color: rgba\(15, 23, 42, 0.04\);/g, to: 'background-color: #FFFFFF;' },
    { from: /background: rgba\(15, 23, 42, 0.02\);/g, to: 'background: #FFFFFF;' },
  ];
  
  let newContent = content;
  for (const rep of replacements) {
    newContent = newContent.replace(rep.from, rep.to);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory(srcDir);
console.log("Done updating variables.");
