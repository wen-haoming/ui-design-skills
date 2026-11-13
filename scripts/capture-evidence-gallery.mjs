#!/usr/bin/env node
import { chromium } from 'playwright';
import path from 'node:path';

const OUT = process.env.OUT || '/opt/cursor/artifacts';
const BASE = process.env.PREVIEW_BASE || 'http://127.0.0.1:4173/ui-design-skills/';

async function snap(page, file, opts = {}) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  if (opts.fullPage) await page.screenshot({ path: path.join(OUT, file), fullPage: true });
  else if (opts.locator) await page.locator(opts.locator).first().screenshot({ path: path.join(OUT, file) });
  else await page.screenshot({ path: path.join(OUT, file) });
  console.log('wrote', file, opts.meta || '');
}

const browser = await chromium.launch();

const desk = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await desk.goto(BASE, { waitUntil: 'networkidle' });
await desk.waitForSelector('.evidence-home');
await snap(desk, 'evidence-home-1280-viewport.png', { meta: '1280x800 viewport' });
await snap(desk, 'evidence-home-1280-fullpage.png', { fullPage: true, meta: 'full' });
await desk.close();

const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto(BASE, { waitUntil: 'networkidle' });
await mob.waitForSelector('.evidence-home');
await snap(mob, 'evidence-home-390-viewport.png', { meta: '390x844 viewport' });
await snap(mob, 'evidence-home-390-fullpage.png', { fullPage: true, meta: 'full' });
await mob.close();

const cat = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await cat.goto(`${BASE}catalog?id=method:skill-1794579952207`, { waitUntil: 'networkidle' });
await cat.waitForSelector('.catalog-detail');
await snap(cat, 'catalog-detail-method-1280.png', { locator: '.catalog-page', meta: 'annotate method' });
await cat.close();

const catMob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await catMob.goto(`${BASE}catalog?id=method:skill-1794579952207`, { waitUntil: 'networkidle' });
await snap(catMob, 'catalog-detail-method-390.png', { locator: '.catalog-detail', meta: '390 detail' });
await catMob.close();

const lic = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await lic.goto(`${BASE}catalog?id=upstream:guizang:guizang-ppt-skill`, { waitUntil: 'networkidle' });
await lic.waitForSelector('.catalog-license-banner');
await snap(lic, 'catalog-license-agpl-1280.png', { locator: '.catalog-page', meta: 'AGPL banner' });
await lic.close();

const empty = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await empty.goto(`${BASE}catalog?task=frontend-engineering&kind=official_upstream&q=zzzznomatch`, {
  waitUntil: 'networkidle',
});
await empty.waitForSelector('.gallery-empty');
await snap(empty, 'catalog-empty-1280.png', { locator: '.catalog-page' });

await browser.close();
