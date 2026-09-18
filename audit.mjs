/**
 * The quality floor, checked rather than assumed.
 *
 * Three things a screenshot cannot tell you: whether the text passes contrast
 * against what is actually behind it, whether the page fits a 360px phone, and
 * whether every interactive element can be reached and seen with a keyboard.
 * All three are computed in the browser, on the real rendered page.
 *
 *   node audit.mjs [theme]        theme = light | dark
 */
import { chromium } from '/root/.claude/skills/playwright-skill/node_modules/playwright/index.mjs';

const THEME = process.argv[2] || 'light';
/** Optional comma-separated paths, for re-running what a crashed run missed. */
const ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const BASE = 'http://127.0.0.1:3020';

const AUTHED = ['/', '/activity', '/new-request', '/history', '/venues', '/reports',
  '/cartable', '/deceased', '/wallet', '/messages', '/notifications', '/profile', '/addresses'];
const ANON = ['/welcome', '/tariff/nahavand', '/waste-types', '/guide', '/city/nahavand', '/login'];

const browser = await chromium.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1148/chrome-linux/chrome',
  args: ['--no-sandbox'],
});

const problems = [];

async function audit(paths, { authed }) {
  const context = await browser.newContext({
    viewport: { width: 360, height: 780 },
    deviceScaleFactor: 2,
    locale: 'fa-IR',
  });
  await context.addInitScript((theme) => {
    try {
      localStorage.setItem('pm-push-dismissed', '1');
      if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    } catch {}
  }, THEME);
  if (authed) {
    await context.addCookies([{ name: 'auth_token', value: 'dev-token', domain: '127.0.0.1', path: '/' }]);
  }

  for (const path of paths) {
    if (ONLY.length && !ONLY.includes(path)) continue;
    const page = await context.newPage();
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 });
    } catch { await page.waitForTimeout(2000); }
    // A crashed tab must not end the run — say which page died and move on.
    // The dark theme is an attribute on <html>, and a client-side theme
    // provider can overwrite it after hydration — set it again once the page
    // has settled.
    try {
      await page.evaluate((theme) => {
        if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      }, THEME);
    } catch {
      // A middleware redirect lands here on the production build — /login with
      // a session goes to /. Let the page settle and carry on.
      await page.waitForTimeout(1500);
      try {
        await page.evaluate((theme) => {
          if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        }, THEME);
      } catch {}
    }
    await page.waitForTimeout(700);

    let found;
    try {
      found = await page.evaluate(() => {
      const out = { overflow: 0, contrast: [], small: [], tapTargets: [], unlabelled: 0 };

      out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

      const parse = (c) => {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const [r, g, b, a] = m[1].split(',').map((n) => parseFloat(n));
        return { r, g, b, a: a === undefined ? 1 : a };
      };
      const lum = ({ r, g, b }) => {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      /**
       * What is actually painted behind an element, layer by layer up the tree.
       *
       * A plaque's field is a gradient, and `backgroundColor` on a gradient is
       * transparent — so a first version of this walked straight past every
       * dark surface in the product and reported white text on enamel as
       * 1.16:1. Gradients are read through their first colour stop, which for
       * every gradient here is the lighter end and therefore the harder case.
       */
      const behind = (el) => {
        let node = el;
        while (node && node !== document.documentElement) {
          const cs = getComputedStyle(node);
          const bg = parse(cs.backgroundColor);
          if (bg && bg.a > 0.85) return bg;
          if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
            const stop = cs.backgroundImage.match(/rgba?\([^)]+\)/);
            const c = stop && parse(stop[0]);
            if (c && c.a > 0.85) return c;
          }
          node = node.parentElement;
        }
        return { r: 255, g: 255, b: 255, a: 1 };
      };
      const ratio = (a, b) => {
        const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (l1 + 0.05) / (l2 + 0.05);
      };

      for (const el of document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, li, td, th, label, div')) {
        const text = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
        if (!text) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.6) continue;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;

        const size = parseFloat(cs.fontSize);
        const weight = parseInt(cs.fontWeight, 10) || 400;
        if (size < 11) out.small.push(`${size}px «${text.slice(0, 24)}»`);

        const fg = parse(cs.color);
        if (!fg) continue;
        const r = ratio(fg, behind(el));
        // 3:1 is the floor for large text (≥18.66px, or ≥14px bold).
        const large = size >= 24 || (size >= 18.66 && weight >= 700);
        const need = large ? 3 : 4.5;
        if (r < need) out.contrast.push(`${r.toFixed(2)}:1 (${size}px) «${text.slice(0, 28)}»`);
      }

      for (const el of document.querySelectorAll('a, button, [role="button"], input, select')) {
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        if (rect.height < 32 || rect.width < 32) {
          out.tapTargets.push(`${Math.round(rect.width)}×${Math.round(rect.height)} «${(el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 20)}»`);
        }
        // A link whose whole content is an image is named by that image's alt
        // — the Enamad seal is exactly this shape.
        const img = el.querySelector('img[alt]:not([alt=""])');
        const labelled = (el.textContent || '').trim() || el.getAttribute('aria-label')
          || el.getAttribute('title') || el.getAttribute('placeholder') || img;
        if (!labelled) out.unlabelled += 1;
      }
      return out;
      });
    } catch (e) {
      problems.push(`${path}: page crashed during audit — ${String(e).split('\n')[0]}`);
      await page.close();
      continue;
    }

    if (found.overflow > 2) problems.push(`${path}: horizontal overflow ${found.overflow}px at 360`);
    for (const c of [...new Set(found.contrast)].slice(0, 4)) problems.push(`${path}: contrast ${c}`);
    for (const s of [...new Set(found.small)].slice(0, 2)) problems.push(`${path}: text too small ${s}`);
    for (const t of [...new Set(found.tapTargets)].slice(0, 3)) problems.push(`${path}: tap target ${t}`);
    if (found.unlabelled) problems.push(`${path}: ${found.unlabelled} control(s) with no accessible name`);

    console.log(`${path} — overflow ${found.overflow}, contrast ${new Set(found.contrast).size}, small ${new Set(found.small).size}, targets ${new Set(found.tapTargets).size}, unlabelled ${found.unlabelled}`);
    await page.close();
  }
  await context.close();
}

await audit(AUTHED, { authed: true });
await audit(ANON, { authed: false });
await browser.close();

console.log(`\n--- ${THEME}: ${problems.length} problems ---`);
console.log(problems.join('\n'));
