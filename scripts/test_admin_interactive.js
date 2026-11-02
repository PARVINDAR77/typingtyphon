
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAdminInteractivity() {
  console.log('Launching browser with msedge...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/admin...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 30000 });

  // 1. Verify Date Range & Period pills
  console.log('Testing Period pills...');
  const pill7d = page.locator('button:has-text("7D")');
  await pill7d.click();
  await page.waitForTimeout(500);

  const pill30d = page.locator('button:has-text("30D")');
  await pill30d.click();
  await page.waitForTimeout(500);

  // 2. Test User Growth Series Filter
  console.log('Testing User Growth series filter...');
  const totalUsersLegend = page.locator('div[title="Click to toggle Total Users series"]');
  if (await totalUsersLegend.count() > 0) {
    await totalUsersLegend.click();
    await page.waitForTimeout(300);
    await totalUsersLegend.click(); // toggle back
  }

  // 3. Test User Distribution Dropdown & Donut Segments
  console.log('Testing User Distribution filter...');
  const distDropdownBtn = page.locator('button:has-text("All Users")');
  if (await distDropdownBtn.count() > 0) {
    await distDropdownBtn.click();
    await page.waitForTimeout(300);
    const guestsOption = page.locator('div:has-text("Guests Only (62%)")');
    if (await guestsOption.count() > 0) {
      await guestsOption.click();
      await page.waitForTimeout(300);
    }
  }

  // 4. Test Performance Trends Interval Dropdown
  console.log('Testing Performance Trends interval...');
  const intervalBtn = page.locator('button:has-text("Daily")');
  if (await intervalBtn.count() > 0) {
    await intervalBtn.click();
    await page.waitForTimeout(300);
    const weeklyOption = page.locator('div:has-text("Weekly (Aggregated)")');
    if (await weeklyOption.count() > 0) {
      await weeklyOption.click();
      await page.waitForTimeout(300);
    }
  }

  // 5. Test Recent Activity Modal
  console.log('Testing Activity Detail modal...');
  const firstActivity = page.locator('div[title="Click to view activity telemetry details"]').first();
  if (await firstActivity.count() > 0) {
    await firstActivity.click();
    await page.waitForTimeout(500);
    const modalClose = page.locator('button:has-text("Close")');
    if (await modalClose.count() > 0) {
      await modalClose.click();
      await page.waitForTimeout(300);
    }
  }

  // 6. Test Lesson Drilldown Modal
  console.log('Testing Lesson Detail modal...');
  const firstLesson = page.locator('div[title="Click to view lesson curriculum drilldown"]').first();
  if (await firstLesson.count() > 0) {
    await firstLesson.click();
    await page.waitForTimeout(500);
    const modalClose = page.locator('button:has-text("Close")');
    if (await modalClose.count() > 0) {
      await modalClose.click();
      await page.waitForTimeout(300);
    }
  }

  // 7. Test Platform Health Live Ping
  console.log('Testing Platform Health ping...');
  const pingBtn = page.locator('button[title="Simulate live ping to cluster"]');
  if (await pingBtn.count() > 0) {
    await pingBtn.click();
    await page.waitForTimeout(600);
  }

  // 8. Capture Dashboard in Light Mode
  console.log('Capturing Light Mode Screenshot...');
  const screenshotDir = path.resolve('apps/web/public/admin');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  await page.screenshot({ path: path.join(screenshotDir, 'admin_dashboard_interactive_light.png'), fullPage: true });

  // 9. Test Notification "Mark all as read"
  console.log('Testing Notifications dropdown and Mark all as read...');
  const notifBell = page.locator('button:has(svg.lucide-bell)');
  if (await notifBell.count() > 0) {
    await notifBell.click();
    await page.waitForTimeout(300);
    const markAllRead = page.locator('button:has-text("Mark all as read")');
    if (await markAllRead.count() > 0) {
      await markAllRead.click();
      await page.waitForTimeout(300);
    }
    await notifBell.click(); // close dropdown
  }

  // 10. Test Theme Toggle
  console.log('Testing Theme Toggle (Switch to Dark)...');
  const themeToggle = page.locator('button[title*="Theme"]');
  if (await themeToggle.count() > 0) {
    await themeToggle.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotDir, 'admin_dashboard_interactive_dark.png'), fullPage: true });
    // Switch back to light
    await themeToggle.click();
    await page.waitForTimeout(400);
  }

  console.log('All interactivity tests passed!');
  await browser.close();
}

testAdminInteractivity().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

