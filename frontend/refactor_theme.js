const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  // Typography
  { regex: /\btext-slate-900\b/g, replacement: 'text-[#333333]' },
  { regex: /\btext-slate-800\b/g, replacement: 'text-[#333333]' },
  { regex: /\btext-slate-700\b/g, replacement: 'text-[#333333]' },
  { regex: /\btext-slate-600\b/g, replacement: 'text-[#4A4A4A]' },
  { regex: /\btext-slate-500\b/g, replacement: 'text-[#555555]' },
  { regex: /\btext-slate-400\b/g, replacement: 'text-[#666666]' },
  { regex: /\btext-gray-900\b/g, replacement: 'text-[#333333]' },
  { regex: /\btext-gray-800\b/g, replacement: 'text-[#333333]' },
  { regex: /\btext-gray-700\b/g, replacement: 'text-[#333333]' },
  
  // Backgrounds
  { regex: /\bbg-slate-50\b/g, replacement: 'bg-white/60' },
  { regex: /\bbg-slate-100\b/g, replacement: 'bg-white/80' },
  { regex: /\bbg-gray-50\b/g, replacement: 'bg-white/60' },
  { regex: /\bbg-gray-100\b/g, replacement: 'bg-white/80' },
  { regex: /\bhover:bg-slate-100\b/g, replacement: 'hover:bg-white' },
  { regex: /\bhover:bg-slate-50\b/g, replacement: 'hover:bg-white/80' },
  { regex: /\bhover:bg-gray-100\b/g, replacement: 'hover:bg-white' },

  // Borders
  { regex: /\bborder-slate-200\b/g, replacement: 'border-[#EAE8E1]' },
  { regex: /\bborder-slate-300\b/g, replacement: 'border-[#DFDCD4]' },
  { regex: /\bborder-gray-200\b/g, replacement: 'border-[#EAE8E1]' },
  { regex: /\bborder-gray-300\b/g, replacement: 'border-[#DFDCD4]' },
  
  // Divide
  { regex: /\bdivide-slate-200\b/g, replacement: 'divide-[#EAE8E1]' },
];

let changedFiles = 0;

walkDir(SRC_DIR, function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    replacements.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
      changedFiles++;
    }
  }
});

console.log(`Refactoring complete. ${changedFiles} files updated.`);
