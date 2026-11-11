#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const BASE = process.env.PREVIEW_BASE || 'https://wen-haoming.github.io/ui-design-skills/';
const ARTICLE_MD_SHA = '12bb44a66c7b5eaac174e7bf9b53e519fe88f99931896dd835583e88c6e03497';

async function textSnapshot(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.at-canvas');
    if (!root) return '';
    const pick = root.querySelectorAll('h1.at-h1, h2.at-h2, p.at-p, li, blockquote.at-quote p');
    return [...pick].map((el) => el.textContent?.trim() ?? '').join('\n');
  });
}

async function run() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}typography`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForSelector('.at-canvas', { timeout: 60000 });
  const long = await textSnapshot(page);
  await page.getByRole('tab', { name: '编辑杂志' }).click();
  await page.waitForTimeout(500);
  const mag = await textSnapshot(page);
  await page.getByRole('tab', { name: '紧凑知识笔记' }).click();
  await page.waitForTimeout(500);
  const compact = await textSnapshot(page);
  if (long !== mag || long !== compact) throw new Error('typography switch changed article text');
  const h1 = await page.locator('h1.at-h1').count();
  const h2 = await page.locator('h2.at-h2').count();
  const bq = await page.locator('blockquote.at-quote').count();
  if (h1 !== 1 || h2 !== 3 || bq !== 1) throw new Error(`semantics h1=${h1} h2=${h2} bq=${bq}`);
  await page.locator('select[aria-label="字号档位"]').waitFor({ state: 'visible' });
  await page.locator('select[aria-label="字号档位"]').selectOption({ label: '较大' });
  await page.getByRole('button', { name: '恢复默认' }).click();
  const latin = await page.locator('.at-latin').innerText();
  if (latin !== 'line-height: 1.75') throw new Error('latin token broken');
  const md = await (await page.request.get(`${BASE}data/article-sample.md`)).text();
  if (createHash('sha256').update(md).digest('hex') !== ARTICLE_MD_SHA) throw new Error('article md sha');
  let clipNote = 'not tested';
  try {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: '复制文稿' }).click();
    await page.waitForTimeout(800);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    if (clip === md) clipNote = 'clipboard equals article-sample.md';
    else clipNote = `clipboard len=${clip.length} md len=${md.length}`;
  } catch (e) {
    clipNote = `clipboard blocked: ${e.message}`;
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  if (overflow) throw new Error('horizontal overflow at 390');
  await browser.close();
  console.log('UI_ARTICLE_OK', { clipNote, textLen: long.length });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
