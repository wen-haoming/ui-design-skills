#!/usr/bin/env node
/**
 * 从本地 preview 截取三风格封面（1280 视口 · 作品页 live 区真实渲染）
 * 需先: npm run docs:build && npx vitepress preview docs --port 4173
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const BASE = process.env.PREVIEW_BASE || 'http://127.0.0.1:4173/ui-design-skills/';
const outDir = path.join(ROOT, 'docs/public/covers');

const styles = [
  { slug: 'shallow-precise', file: 'shallow-precise.png' },
  { slug: 'dark-command', file: 'dark-command.png' },
  { slug: 'soft-system', file: 'soft-system.png' },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });

for (const { slug, file } of styles) {
  await page.goto(`${BASE}works/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.gallery-work-preview', { timeout: 30000 });
  const sel =
    slug === 'dark-command' ? '.dc-frame' : slug === 'soft-system' ? '.ss-window' : '.sp-shell';
  await page.waitForSelector(sel, { timeout: 30000 });
  const box = page.locator('.gallery-work-preview');
  await box.screenshot({ path: path.join(outDir, file) });
  console.log('wrote', file);
}

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('.gallery-spotlight-stage img', { timeout: 30000 });
await page.screenshot({ path: path.join(outDir, 'home-desktop.png'), fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: path.join(outDir, 'home-mobile.png'), fullPage: true });

await browser.close();
