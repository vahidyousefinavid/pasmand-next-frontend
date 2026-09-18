/**
 * Screens, as a person meets them.
 *
 * Phone first (390×844, the size the product is actually used at) with a
 * desktop pass for the public pages, because those arrive from a search engine
 * on both. The auth cookie is a dummy: the middleware only checks that one
 * exists, and the mock API never verifies it.
 *
 *   node shots.mjs <out-dir> [only-substring]
 */
import { chromium } from '/root/.claude/skills/playwright-skill/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2] || 'shots';
const ONLY = process.argv[3] || '';
const BASE = process.env.BASE || 'http://127.0.0.1:3020';

const SCREENS = [
  ['welcome', '/welcome', 'public'],
  ['tariff-city', '/tariff/nahavand', 'public'],
  ['waste-types', '/waste-types', 'public'],
  ['guide', '/guide', 'public'],
  ['city-hub', '/city/nahavand', 'public'],
  ['city-venues', '/city/nahavand/venues', 'public'],
  ['login', '/login', 'public'],
  ['home', '/', 'app'],
  ['activity', '/activity', 'app'],
  ['new-request', '/new-request', 'app'],
  ['history', '/history', 'app'],
  ['venues', '/venues', 'app'],
  ['reports', '/reports', 'app'],
  ['cartable', '/cartable', 'app'],
  ['deceased', '/deceased', 'app'],
  ['wallet', '/wallet', 'app'],
  ['messages', '/messages', 'app'],
  ['notifications', '/notifications', 'app'],
  ['profile', '/profile', 'app'],
  ['addresses', '/addresses', 'app'],
  ['contact-us', '/contact-us', 'app'],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1148/chrome-linux/chrome',
  args: ['--no-sandbox'],
});

const problems = [];

for (const [phone, width] of [['phone', 390], ['wide', 1280]]) {
  const context = await browser.newContext({
    viewport: { width, height: phone === 'phone' ? 844 : 900 },
    deviceScaleFactor: phone === 'phone' ? 2 : 1,
    locale: 'fa-IR',
    userAgent: phone === 'phone'
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });
  // The push-permission prompt is a fixed banner; in a full-page screenshot it
  // lands in the middle of the image and hides whatever is behind it. It has
  // its own dismissal flag, so set it rather than screenshotting around it.
  await context.addInitScript(() => {
    try { localStorage.setItem('pm-push-dismissed', '1'); } catch {}
  });
  await context.addCookies([
    { name: 'auth_token', value: 'dev-token', domain: new URL(BASE).hostname, path: '/' },
    { name: 'city', value: 'nahavand', domain: new URL(BASE).hostname, path: '/' },
  ]);

  for (const [name, path, kind] of SCREENS) {
    if (ONLY && !name.includes(ONLY)) continue;
    // The wide pass is only interesting where a desktop visitor actually lands.
    if (phone === 'wide' && kind !== 'public') continue;

    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });

    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 });
    } catch {
      try { await page.waitForTimeout(2500); } catch {}
    }
    await page.waitForTimeout(1200);

    // A page that died on navigation must not take the whole run with it.
    let scroll = 0;
    try {
      scroll = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
    } catch (e) {
      problems.push(`${phone}/${name}: page unavailable — ${String(e).split('\n')[0]}`);
    }
    if (scroll > 2) problems.push(`${phone}/${name}: horizontal overflow ${scroll}px`);
    for (const e of errors.slice(0, 2)) problems.push(`${phone}/${name}: ${e}`);

    try {
      await page.screenshot({
        path: `${OUT}/${phone}-${name}.png`, fullPage: true,
        animations: 'disabled', caret: 'hide', timeout: 20000,
      });
      console.log(`${phone}/${name} ${scroll > 2 ? `OVERFLOW ${scroll}` : 'ok'}`);
    } catch (e) {
      problems.push(`${phone}/${name}: screenshot failed — ${String(e).split('\n')[0]}`);
      console.log(`${phone}/${name} SHOT FAILED`);
    }
    await page.close();
  }
  await context.close();
}

await browser.close();
console.log('\n--- problems ---');
console.log(problems.length ? problems.join('\n') : 'none');
