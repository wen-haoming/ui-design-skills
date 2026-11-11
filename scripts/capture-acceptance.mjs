#!/usr/bin/env node
/**
 * 验收截图：首页 / 三风格 desktop+mobile 关键帧
 * 环境变量 PREVIEW_BASE、OUT_DIR
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const BASE = process.env.PREVIEW_BASE || 'http://127.0.0.1:4173/ui-design-skills/';
const OUT = process.env.OUT_DIR || path.join(ROOT, 'aggregate-design-skill/acceptance');
fs.mkdirSync(OUT, { recursive: true });

const styles = ['shallow-precise', 'dark-command', 'soft-system'];

const browser = await chromium.launch();
const page = await browser.newPage();

async function shot(name, viewport, fullPage = false) {
  await page.setViewportSize(viewport);
  await page.screenshot({ path: path.join(OUT, name), fullPage });
  console.log('wrote', name);
}

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('.gallery-spotlight-stage img');
await shot('home-1440-viewport.png', { width: 1440, height: 900 });
await shot('home-1440-fullpage.png', { width: 1440, height: 900 }, true);

await shot('home-390-viewport.png', { width: 390, height: 844 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await shot('home-390-fullpage.png', { width: 390, height: 844 }, true);

for (const s of styles) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}works/${s}`, { waitUntil: 'networkidle' });
  const sel = s === 'dark-command' ? '.dc-frame' : s === 'soft-system' ? '.ss-window' : '.sp-shell';
  await page.waitForSelector(sel, { timeout: 30000 });
  await shot(`workbench-${s}-desktop.png`, { width: 1440, height: 900 });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}works/${s}`, { waitUntil: 'networkidle' });
  await page.waitForSelector(sel, { timeout: 30000 });
  const status = page.locator('select').first();
  if (await status.count()) {
    await status.selectOption({ index: 1 });
    await page.waitForTimeout(400);
  }
  await shot(`workbench-${s}-mobile-status.png`, { width: 390, height: 844 });
}

await browser.close();
