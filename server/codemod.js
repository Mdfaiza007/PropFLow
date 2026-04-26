import fs from 'fs';
import path from 'path';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        processDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.js') && file !== 'codemod.js') {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace const { X, Y } = require("...");
  content = content.replace(/const\s+\{([^}]+)\}\s*=\s*require\((['"])([^'"]+)\2\);?/g, (match, imports, quote, reqPath) => {
    let finalPath = reqPath;
    if (finalPath.startsWith('.')) {
      if (!finalPath.endsWith('.js')) finalPath += '.js';
    }
    return `import {${imports}} from "${finalPath}";`;
  });

  // Replace const X = require("...");
  content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\((['"])([^'"]+)\2\);?/g, (match, varName, quote, reqPath) => {
    let finalPath = reqPath;
    if (finalPath.startsWith('.')) {
      if (!finalPath.endsWith('.js')) finalPath += '.js';
    }
    return `import ${varName} from "${finalPath}";`;
  });
  
  // Replace let X = require("...");
  content = content.replace(/let\s+([a-zA-Z0-9_]+)\s*=\s*require\((['"])([^'"]+)\2\);?/g, (match, varName, quote, reqPath) => {
    let finalPath = reqPath;
    if (finalPath.startsWith('.')) {
      if (!finalPath.endsWith('.js')) finalPath += '.js';
    }
    return `import ${varName} from "${finalPath}";`;
  });

  // Replace require("dotenv").config()
  content = content.replace(/require\((['"])(dotenv)\1\)\.config\(\);?/g, "import dotenv from 'dotenv';\ndotenv.config();");
  
  // Replace require("...")....
  content = content.replace(/require\((['"])([^'"]+)\1\)/g, (match, quote, reqPath) => {
    // We shouldn't blindly replace standalone require unless it's imported at top, but for safety:
    return match; // Leave inline requires alone for now unless specific
  });

  // Replace module.exports = X;
  content = content.replace(/module\.exports\s*=\s*(.*);?/g, "export default $1;");

  // Replace exports.X = Y;
  content = content.replace(/exports\.([a-zA-Z0-9_]+)\s*=\s*/g, "export const $1 = ");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modified:', filePath);
  }
}

// Start processing from current directory
processDirectory('.');
console.log('Done');
