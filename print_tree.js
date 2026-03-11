const fs = require('fs');
const path = require('path');
function walk(dir, prefix = '') {
  const basename = path.basename(dir);
  if (['node_modules', '.git', '.next'].includes(basename)) return;
  try {
    const files = fs.readdirSync(dir);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(prefix + (i === files.length - 1 ? '└── ' : '├── ') + file);
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath, prefix + (i === files.length - 1 ? '    ' : '│   '));
      }
    }
  } catch(e) {}
}
walk('.');
