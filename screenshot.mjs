import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

await page.goto('http://127.0.0.1:4173');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'd:/app/review-hero.png', fullPage: false });

// scroll to system section
await page.evaluate(() => document.querySelector('#system').scrollIntoView());
await page.waitForTimeout(600);
await page.screenshot({ path: 'd:/app/review-system.png', fullPage: false });

// scroll to coaching
await page.evaluate(() => document.querySelector('#coaching').scrollIntoView());
await page.waitForTimeout(600);
await page.screenshot({ path: 'd:/app/review-coaching.png', fullPage: false });

// scroll to communities
await page.evaluate(() => document.querySelector('#communities').scrollIntoView());
await page.waitForTimeout(600);
await page.screenshot({ path: 'd:/app/review-communities.png', fullPage: false });

// scroll to coach signup
await page.evaluate(() => document.querySelector('#coach-signup').scrollIntoView());
await page.waitForTimeout(600);
await page.screenshot({ path: 'd:/app/review-form.png', fullPage: false });

await browser.close();
console.log('done');
