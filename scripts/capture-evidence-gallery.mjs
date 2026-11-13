#!/usr/bin/env node
import { chromium } from 'playwright';
import path from 'node:path';

const OUT = process.env.OUT || '/opt/cursor/artifacts';
const BASE = process.env.PREVIEW_BASE || 'http://127.0.0.1:4173/ui-design-skills/';

const shots = [
  { name: 'evidence-home-1280-full.png', url: '', full: true, w: 1280, h: 900 },
  { name: 'evidence-home-390-viewport.png', url: '', full: false, w: 390, h: 844 },
  { name: 'catalog-list-1280.png', url: 'catalog', full: false, w: 1280, h: 900 },
  { name: 'catalog-detail-1280.png', url: 'catalog?id=method:skill-1794579952207', full: false, w: 1280, h: 900 },
  { name: 'catalog-empty-1280.png', url: 'catalog?task=zzzz&q=__none__', full: false, w: 1280, h: 900 },
  { name: 'catalog-warn-1280.png', url: 'catalog?kind=install_warning', full: false, w: 1280, h: 900 },
  { name: 'typography-cover-card-1280.png', url: '?task=typography', full: false, w: 1280, h: 900, sel: '.evidence-media img' },
  { name: 'compare-regression-1280.png', url: 'compare', full: false, w: 1280, h: 900 },
];

const browser = await chromium.launch();
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  await page.goto(`${BASE}${s.url}`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(400);
  const target = s.sel ? page.locator(s.sel).first() : page;
  if (s.full) await page.screenshot({ path: path.join(OUT, s.name), fullPage: true });
  else if (s.sel) await target.screenshot({ path: path.join(OUT, s.name) });
  else await page.locator('.evidence-home, .catalog-page, .gallery-compare').first().screenshot({ path: path.join(OUT, s.name) });
  await page.close();
  console.log('wrote', s.name);
}
await browser.close();
