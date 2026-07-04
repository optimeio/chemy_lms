const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'frontend', 'src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const replacements = [
    { from: /255,\s*123,\s*45/g, to: '15, 118, 110' }, // orange -> teal primary
    { from: /217,\s*92,\s*20/g, to: '19, 78, 74' },  // dark orange -> teal dark
    { from: /46,\s*27,\s*18/g, to: '15, 23, 42' }    // dark brown -> slate black
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
    } else if (fullPath.endsWith('.css')) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory(srcDir);
console.log("Done.");
