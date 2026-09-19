/**
 * Switching city has to change the app, without a manual refresh.
 *
 * نهاوند runs five services, ملایر runs three (no ۱۳۷, no کارتابل). So the
 * home screen's «خدمات شهر» list, the drawer and the tab bar all have to be
 * different one tap after the switch — with no reload. This asserts exactly
 * that, and fails if any of them still answers for the previous city.
 *
 *   node city-switch.mjs
 */
import { chromium } from '/root/.claude/skills/playwright-skill/node_modules/playwright/index.mjs';

const BASE = process.env.BASE || 'http://127.0.0.1:3020';

const browser = await chromium.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1148/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fa-IR' });
await context.addCookies([
  { name: 'auth_token', value: 'dev-token', domain: new URL(BASE).hostname, path: '/' },
]);
await context.addInitScript(() => {
  try { localStorage.setItem('pm-push-dismissed', '1'); } catch {}
});

const page = await context.newPage();
const failures = [];
let reloads = 0;
page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) reloads += 1; });

const services = () => page.evaluate(() => {
  const heading = Array.from(document.querySelectorAll('h2'))
    .find((h) => h.textContent.includes('خدمات شهر'));
  const panel = heading?.parentElement?.nextElementSibling;
  return Array.from(panel?.querySelectorAll('a') || []).map((a) => a.textContent.trim().slice(0, 28));
});

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const before = await services();
const navBefore = reloads;
console.log('نهاوند:', before);
if (!before.some((t) => t.includes('۱۳۷'))) failures.push('نهاوند should list سامانهٔ ۱۳۷ to begin with');

// ── the switch, through the plaque the design made the city switcher ──
await page.click('.sh-plaque');
await page.waitForTimeout(1200);
const picked = await page.evaluate(() => {
  const target = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim().startsWith('ملایر'));
  if (!target) return false;
  target.click();
  return true;
});
if (!picked) failures.push('the city picker did not offer ملایر');
await page.waitForTimeout(4000);

const after = await services();
console.log('ملایر:', after);

// The whole point: no page load happened in between.
if (reloads > navBefore) failures.push(`the app reloaded ${reloads - navBefore} time(s) — the switch should not need one`);

if (after.some((t) => t.includes('۱۳۷'))) failures.push('سامانهٔ ۱۳۷ is still listed after switching to ملایر');
if (after.some((t) => t.includes('کارتابل'))) failures.push('کارتابل is still listed after switching to ملایر');
if (!after.some((t) => t.includes('اماکن'))) failures.push('رزرو اماکن should still be listed — ملایر runs it');

// The plaque itself has to say where we are.
const plaque = await page.evaluate(() => document.querySelector('.sh-plaque h1')?.textContent?.trim());
console.log('plaque:', plaque);
if (plaque !== 'ملایر') failures.push(`the plaque still reads «${plaque}»`);

// And the drawer, which is a different component reading the same answer.
await page.click('[aria-label="منو"]');
await page.waitForTimeout(1500);
const drawer = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[role="dialog"] a, aside a')).map((a) => a.textContent.trim()));
if (drawer.some((t) => t.includes('۱۳۷'))) failures.push('the drawer still offers ۱۳۷ after the switch');
console.log('drawer entries:', drawer.length);

await browser.close();

console.log(`\n--- ${failures.length ? 'FAILED' : 'passed'} ---`);
console.log(failures.length ? failures.join('\n') : 'switching city changed the app in place');
process.exit(failures.length ? 1 : 0);
