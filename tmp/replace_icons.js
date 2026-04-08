const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components')
];

const extensions = ['.tsx', '.ts', '.css'];

const replacements = [
  // Icon replacements
  { search: /<Brain /g, replace: '<Leaf ' },
  { search: /<Brain>/g, replace: '<Leaf>' },
  { search: /Brain,/g, replace: 'Leaf,' },
  { search: /Brain }/g, replace: 'Leaf }' },
  { search: /<Bot /g, replace: '<Leaf ' },
  { search: /<Bot>/g, replace: '<Leaf>' },
  { search: /Bot,/g, replace: 'Leaf,' },
  { search: /Bot }/g, replace: 'Leaf }' },
  
  // Aggressive Color changes for "Whole website"
  { search: /bg-slate-50/g, replace: 'bg-[#F0F0FF]' },
  { search: /bg-white/g, replace: 'bg-[#F8F8FF]' },
  { search: /from-white/g, replace: 'from-[#F8F8FF]' },
  { search: /via-\[\#D3D3FF\]\/10/g, replace: 'via-[#D3D3FF]/20' },
  { search: /to-slate-50/g, replace: 'to-[#E6E6FF]' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (extensions.includes(path.extname(filePath))) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      for (const { search, replace } of replacements) {
        content = content.replace(search, replace);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
      }
    }
  }
}

directories.forEach(processDirectory);
console.log('Icon and deep color replacement complete');
