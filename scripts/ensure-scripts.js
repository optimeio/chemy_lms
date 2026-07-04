const fs = require('fs');
const path = require('path');

const scripts = ['replace_admin.js', 'replace_colors.js', 'replace_vars.js'];
const root = path.join(__dirname, '..');

scripts.forEach(f => {
  const oldPath = path.join(root, f);
  const newPath = path.join(__dirname, f);
  if (fs.existsSync(oldPath)) {
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`Moved ${f} -> scripts/${f}`);
    } catch (e) {
      console.error(`Failed to move ${f}:`, e.message);
    }
  }
});

console.log('Ensure scripts complete.');
