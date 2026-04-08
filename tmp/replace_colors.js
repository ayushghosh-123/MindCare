const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components')
];

const extensions = ['.tsx', '.ts', '.css'];

const replacements = [
  { search: /text-rose-600/g, replace: 'text-[#8A8AFF]' },
  { search: /bg-rose-600/g, replace: 'bg-[#D3D3FF]' },
  { search: /hover:bg-rose-700/g, replace: 'hover:bg-[#BDBDFE]' },
  { search: /hover:text-rose-600/g, replace: 'hover:text-[#8A8AFF]' },
  { search: /border-rose-600/g, replace: 'border-[#D3D3FF]' },
  { search: /bg-rose-100/g, replace: 'bg-[#D3D3FF]/30' },
  { search: /text-rose-100/g, replace: 'text-[#D3D3FF]' },
  { search: /bg-rose-50/g, replace: 'bg-[#D3D3FF]/10' },
  { search: /border-rose-100/g, replace: 'border-[#D3D3FF]/30' },
  { search: /border-rose-200/g, replace: 'border-[#D3D3FF]/50' },
  { search: /border-rose-300/g, replace: 'border-[#D3D3FF]' },
  { search: /shadow-rose-300\/60/g, replace: 'shadow-[#D3D3FF]/60' },
  { search: /shadow-rose-200\/50/g, replace: 'shadow-[#D3D3FF]/50' },
  { search: /hover:bg-rose-50/g, replace: 'hover:bg-[#D3D3FF]/10' },
  { search: /text-rose-500/g, replace: 'text-[#8A8AFF]' },
  { search: /bg-rose-500/g, replace: 'bg-[#8A8AFF]' },
  { search: /hover:bg-rose-600/g, replace: 'hover:bg-[#D3D3FF]' },
  { search: /border-rose-500/g, replace: 'border-[#8A8AFF]' },
  { search: /text-rose-800/g, replace: 'text-slate-800' },
  { search: /bg-rose-200\/20/g, replace: 'bg-[#D3D3FF]/20' }
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
console.log('Color replacement complete');
