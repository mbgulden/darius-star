const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsDir = path.join(__dirname, '..', 'js');

function getJsFilesRecursive(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getJsFilesRecursive(filePath));
        } else if (file.endsWith('.js')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = getJsFilesRecursive(jsDir);

console.log("Checking syntax of JS files in js/ folder recursively...");
let errorsCount = 0;

for (const filePath of files) {
    const relativePath = path.relative(jsDir, filePath);
    const code = fs.readFileSync(filePath, 'utf8');
    try {
        new vm.Script(code, { filename: relativePath });
        console.log(`✅ ${relativePath} is syntactically valid.`);
    } catch (err) {
        console.error(`❌ Syntax error in ${relativePath}:`, err.message);
        console.error(err.stack);
        errorsCount++;
    }
}

console.log(`\nSyntax check completed. Total errors: ${errorsCount}`);
if (errorsCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
