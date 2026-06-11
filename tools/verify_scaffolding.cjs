const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');

const expectedDirs = [
  'js',
  'tools',
  'tests'
];

const expectedFiles = [
  'js/upgrade_system.js',
  'js/combo.js',
  'js/banter_engine.js',
  'tools/generate_audio.py',
  'tools/veo_client.py'
];

let failed = false;

console.log('=== Starting Foundational Structure Verification ===\n');

// 1. Verify directories
console.log('Checking directories:');
expectedDirs.forEach(dir => {
  const dirPath = path.join(baseDir, dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`  ✅ Directory '${dir}/' exists.`);
  } else {
    console.error(`  ❌ Missing directory '${dir}/'`);
    failed = true;
  }
});

// 2. Verify moved files
console.log('\nChecking moved files:');
expectedFiles.forEach(file => {
  const filePath = path.join(baseDir, file);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    console.log(`  ✅ File '${file}' exists at target path.`);
  } else {
    console.error(`  ❌ Missing file at '${file}'`);
    failed = true;
  }
});

// 3. Verify index.html script tags
console.log('\nChecking index.html script tags:');
const indexPath = path.join(baseDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  const scriptsToCheck = [
    'js/upgrade_system.js',
    'js/save_system.js',
    'js/combo.js',
    'js/economy.js',
    'js/banter_engine.js',
    'js/multiplayer.js',
    'js/ngplus.js',
    'js/leaderboard.js'
  ];
  
  scriptsToCheck.forEach(script => {
    const pattern = new RegExp(`<script\\s+src=["']${script}["']>`);
    if (pattern.test(content)) {
      console.log(`  ✅ script tag for '${script}' correctly references the js/ directory.`);
    } else {
      console.error(`  ❌ script tag for '${script}' is missing or incorrect in index.html.`);
      failed = true;
    }
  });

  // Verify no old scripts remain in index.html
  const oldScripts = [
    'src="upgrade_system.js"',
    'src="save_system.js"',
    'src="combo.js"',
    'src="economy.js"',
    'src="banter_engine.js"',
    'src="multiplayer.js"',
    'src="ngplus.js"',
    'src="leaderboard.js"'
  ];
  oldScripts.forEach(oldScript => {
    if (content.includes(oldScript)) {
      console.error(`  ❌ index.html still contains old reference: ${oldScript}`);
      failed = true;
    }
  });
} else {
  console.error('  ❌ index.html does not exist!');
  failed = true;
}

// 4. Verify upgrade_shop.html script tags
console.log('\nChecking upgrade_shop.html script tags:');
const shopPath = path.join(baseDir, 'upgrade_shop.html');
if (fs.existsSync(shopPath)) {
  const content = fs.readFileSync(shopPath, 'utf8');
  if (content.includes('src="js/upgrade_system.js"')) {
    console.log("  ✅ upgrade_shop.html correctly references 'js/upgrade_system.js'.");
  } else {
    console.error("  ❌ upgrade_shop.html is missing correct reference to 'js/upgrade_system.js'.");
    failed = true;
  }

  if (content.includes('src="upgrade_system.js"')) {
    console.error("  ❌ upgrade_shop.html still contains old reference to 'upgrade_system.js'.");
    failed = true;
  }
} else {
  console.error('  ❌ upgrade_shop.html does not exist!');
  failed = true;
}

console.log('\n====================================================');
if (failed) {
  console.error('❌ Verification FAILED. Please resolve errors.');
  process.exit(1);
} else {
  console.log('🎉 Verification PASSED. Foundational structure is clean and valid!');
  process.exit(0);
}
