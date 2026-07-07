const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 800, height: 450 });

  const path = require('path');
  const filePath = 'file://' + path.resolve('dist/index.html');

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Loading ' + filePath);
  await page.goto(filePath);

  await page.waitForSelector('canvas');
  await page.waitForTimeout(2000);
  await page.click('canvas');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'verification/screenshots/final_check.png' });
  await browser.close();
})();
