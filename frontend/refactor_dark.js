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
  { regex: /#0B0F19/g, replacement: '#181818' },
  { regex: /\bbg-black\/40\b/g, replacement: 'bg-[#181818]/60' },
  { regex: /\bbg-black\/60\b/g, replacement: 'bg-[#181818]/80' },
  { regex: /\bbg-black\b/g, replacement: 'bg-[#181818]' },
];

let changedFiles = 0;

walkDir(SRC_DIR, function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
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
