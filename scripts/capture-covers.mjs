#!/usr/bin/env node
/**
 * 从本地 preview 截取作品封面（1280 视口 · 作品页 live 区真实渲染）
 * 需先: npm run docs:build && npx vitepress preview docs --port 4173
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const BASE = process.env.PREVIEW_BASE || 'http://127.0.0.1:4173/ui-design-skills/';
const outDir = path.join(ROOT, 'docs/public/covers');

const WORKS = [
  { slug: 'shallow-precise-list-detail', sel: '.sp-shell' },
  { slug: 'dark-command-list-detail', sel: '.dc-frame' },
  { slug: 'soft-system-list-detail', sel: '.ss-window' },
  { slug: 'editorial-sheet-list-detail', sel: '.ed-sheet' },
  { slug: 'amber-ledger-list-detail', sel: '.am-ledger' },
  { slug: 'shallow-precise-board-detail', sel: '.sp-shell' },
  { slug: 'shallow-precise-reading-split', sel: '.rs-root' },
  { slug: 'shallow-precise-calendar-agenda', sel: '.ca-root' },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });

for (const { slug, sel } of WORKS) {
  const file = `${slug}.png`;
  await page.goto(`${BASE}works/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForSelector(sel, { timeout: 90000, state: 'visible' });
  const box = page.locator('.gallery-work-preview');
  const hasPreview = (await box.count()) > 0;
  const target = hasPreview ? box : page.locator(sel).first();
  await target.screenshot({ path: path.join(outDir, file) });
  console.log('wrote', file);
}

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.setViewportSize({ width: 1280, height: 900 });
await page.waitForSelector('.gallery-spotlight-stage img', { timeout: 30000 });
await page.screenshot({ path: path.join(outDir, 'home-desktop.png'), fullPage: true });

await page.goto(`${BASE}works/editorial-sheet-list-detail`, { waitUntil: 'networkidle' });
await page.waitForSelector('.ed-sheet', { timeout: 60000 });
await page.screenshot({ path: path.join(outDir, 'editorial-desktop.png'), fullPage: false });

await page.goto(`${BASE}works/amber-ledger-list-detail`, { waitUntil: 'networkidle' });
await page.waitForSelector('.am-ledger', { timeout: 60000 });
await page.screenshot({ path: path.join(outDir, 'amber-desktop.png'), fullPage: false });

await page.goto(`${BASE}works/shallow-precise-reading-split`, { waitUntil: 'networkidle' });
await page.waitForSelector('.rs-root', { timeout: 60000 });
await page.screenshot({ path: path.join(outDir, 'reading-desktop.png'), fullPage: false });

await page.goto(`${BASE}works/shallow-precise-calendar-agenda`, { waitUntil: 'networkidle' });
await page.waitForSelector('.ca-root', { timeout: 60000 });
await page.screenshot({ path: path.join(outDir, 'calendar-desktop.png'), fullPage: false });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(outDir, 'home-mobile.png'), fullPage: true });
await page.goto(`${BASE}works/shallow-precise-reading-split`, { waitUntil: 'networkidle' });
await page.waitForSelector('.rs-root', { timeout: 60000 });
await page.screenshot({ path: path.join(outDir, 'reading-mobile.png'), fullPage: true });

await browser.close();
