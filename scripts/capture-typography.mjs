#!/usr/bin/env node
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const OUT = process.env.OUT || '/opt/cursor/artifacts';
const BASE = process.env.PREVIEW_BASE || 'https://wen-haoming.github.io/ui-design-skills/';

const tabs = [
  { name: 'longform', label: '长文阅读', fileD: 'typography-longform-1280.png', fileM: 'typography-longform-390.png' },
  { name: 'magazine', label: '编辑杂志', fileD: 'typography-magazine-1280.png', fileM: 'typography-magazine-390.png' },
  { name: 'notes', label: '紧凑知识笔记', fileD: 'typography-notes-1280.png', fileM: 'typography-notes-390.png' },
];

const browser = await chromium.launch();
for (const t of tabs) {
  const desk = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desk.goto(`${BASE}typography`, { waitUntil: 'networkidle' });
  if (t.label !== '长文阅读') await desk.getByRole('tab', { name: t.label }).click();
  await desk.waitForSelector('.at-canvas');
  await desk.locator('.typo-stage').screenshot({ path: path.join(OUT, t.fileD) });
  await desk.close();
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mob.goto(`${BASE}typography`, { waitUntil: 'networkidle' });
  if (t.label !== '长文阅读') await mob.getByRole('tab', { name: t.label }).click();
  await mob.waitForSelector('.at-canvas');
  await mob.locator('.typo-stage').screenshot({ path: path.join(OUT, t.fileM) });
  await mob.close();
  console.log('wrote', t.fileD, t.fileM);
}
await browser.close();
