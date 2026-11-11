#!/usr/bin/env node
/**
 * 使用 Playwright 从本地 preview 截取三风格封面（原创渲染）
 * 需先: npm run docs:build && npm run docs:preview (4173)
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const BASE = process.env.PREVIEW_BASE || 'http://127.0.0.1:4173/ui-design-skills/';
const outDir = path.join(ROOT, 'docs/public/covers');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(BASE + 'compare', { waitUntil: 'networkidle' });
await page.waitForSelector('.gallery-compare-col', { timeout: 30000 });
const cols = page.locator('.gallery-compare-col');
const names = ['shallow-precise.png', 'dark-command.png', 'soft-system.png'];
for (let i = 0; i < 3; i++) {
  await cols.nth(i).screenshot({ path: path.join(outDir, names[i]) });
  console.log('wrote', names[i]);
}
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('.gallery-frame', { timeout: 30000 });
const frames = page.locator('.gallery-frame');
const frameNames = ['shallow-precise.png', 'dark-command.png', 'soft-system.png'];
for (let i = 0; i < 3; i++) {
  await frames.nth(i).screenshot({ path: path.join(outDir, frameNames[i]) });
}
await page.screenshot({ path: path.join(outDir, 'home-desktop.png'), fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: path.join(outDir, 'home-mobile.png'), fullPage: true });
await browser.close();
