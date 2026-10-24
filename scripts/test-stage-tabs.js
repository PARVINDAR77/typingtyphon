const { chromium } = require('playwright');

async function testTabs() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.goto('http://localhost:3000/academy', { waitUntil: 'networkidle' });
  console.log('Opened /academy');

  // Check stage tabs
  for (let i = 1; i <= 6; i++) {
    const selector = `#btn-stage-tab-${i}`;
    const exists = await page.$(selector);
    console.log(`Tab ${i} exists:`, !!exists);
  }

  // Click stage tab 2
  console.log('Clicking stage tab 2...');
  await page.click('#btn-stage-tab-2');
  await page.waitForTimeout(500);

  // Check what stage header text is displayed
  const stageHeading = await page.$eval('h3', el => el.innerText).catch(() => 'no h3');
  console.log('Heading after clicking Tab 2:', stageHeading);

  // Click stage tab 3
  console.log('Clicking stage tab 3...');
  await page.click('#btn-stage-tab-3');
  await page.waitForTimeout(500);
  const stageHeading3 = await page.$eval('h3', el => el.innerText).catch(() => 'no h3');
  console.log('Heading after clicking Tab 3:', stageHeading3);

  await browser.close();
}

testTabs().catch(console.error);
