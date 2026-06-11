const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'game_loop.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const cleanedLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // If it's one of the header lines, keep it intact
    if (i < 5) {
        cleanedLines.push(line);
        continue;
    }
    // Remove the prefix like "      1|" or "   1735|"
    const match = line.match(/^\s*\d+\|(.*)$/);
    if (match) {
        cleanedLines.push(match[1]);
    } else {
        cleanedLines.push(line);
    }
}

fs.writeFileSync(filePath, cleanedLines.join('\n'));
console.log("game_loop.js cleaned successfully!");
