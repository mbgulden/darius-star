import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname, '..');

const jsFiles = [];

function getFilesRecursively(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getFilesRecursively(fullPath);
    } else if (file.endsWith('.js')) {
      jsFiles.push(fullPath);
    }
  }
}

getFilesRecursively(path.join(baseDir, 'js'));

console.log(`=== Syntax Sweep: Checking ${jsFiles.length} JS Files with node --check ===\n`);
let failed = 0;

for (const filePath of jsFiles) {
  const relativePath = path.relative(baseDir, filePath);
  try {
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    console.log(`✅ ${relativePath}: OK`);
  } catch (err) {
    console.error(`❌ ${relativePath}: parse failure!`);
    console.error(err.stderr ? err.stderr.toString() : err.message);
    failed++;
  }
}

console.log(`\n=== Sweep Complete: ${failed} failures out of ${jsFiles.length} files ===`);
if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
