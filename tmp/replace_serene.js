const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace primary blue with Serene Lavender dark
  content = content.replace(/#8A8AFF/gi, '#5f559a');
  content = content.replace(/#6B6BCC/gi, '#4b4185'); 

  // Replace primary lighter blue with Serene Lavender light
  content = content.replace(/#D3D3FF/gi, '#e5deff');
  content = content.replace(/#BDBDFE/gi, '#bdb2ff');

  // Any remaining old brutalist hover shadows or styles if any
  content = content.replace(/shadow-\[3px_3px_0_#000\]/g, 'shadow-sm');
  content = content.replace(/shadow-\[4px_4px_0_#000\]/g, 'shadow-sm');
  content = content.replace(/shadow-\[6px_6px_0_#000\]/g, 'shadow-md');
  content = content.replace(/shadow-\[12px_12px_0_#000\]/g, 'shadow-lg');
  content = content.replace(/border-\[3px\]/g, 'border-2');
  content = content.replace(/border-\[4px\]/g, 'border-2');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      if (!fullPath.includes('replace_')) {
        replaceInFile(fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, '../components'));
processDirectory(path.join(__dirname, '../app'));
