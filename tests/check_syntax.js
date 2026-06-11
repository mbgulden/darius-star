const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsDir = path.join(__dirname, '..', 'js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

console.log("Checking syntax of JS files in js/ folder...");
let errorsCount = 0;

for (const file of files) {
    const filePath = path.join(jsDir, file);
    const code = fs.readFileSync(filePath, 'utf8');
    try {
        new vm.Script(code, { filename: file });
        console.log(`✅ ${file} is syntactically valid.`);
    } catch (err) {
        console.error(`❌ Syntax error in ${file}:`, err.message);
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
