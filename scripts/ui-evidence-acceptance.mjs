#!/usr/bin/env node
import { chromium } from 'playwright';

const BASE = process.env.PREVIEW_BASE || 'http://127.0.0.1:4173/ui-design-skills/';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: '可体验作品' }).waitFor();
  const cards = await page.locator('.evidence-card').count();
  if (cards < 9) throw new Error(`home cards ${cards} expected >=9`);
  await page.locator('[aria-label="任务与分面"]').getByRole('button', { name: '文字排版' }).click();
  const typo = await page.locator('.evidence-grid .evidence-card').count();
  if (typo !== 1) throw new Error(`typography filter cards ${typo}`);
  await page.locator('[aria-label="任务与分面"]').getByRole('button', { name: '全部' }).click();
  await page.goto(`${BASE}catalog?task=frontend-engineering&kind=official_upstream&q=vite`, {
    waitUntil: 'networkidle',
  });
  await page.waitForSelector('.catalog-list');
  const n = await page.locator('.catalog-list li').count();
  if (n < 1) throw new Error('catalog empty for vite');
  const depth = await page.locator('.catalog-detail').innerText();
  if (!depth.includes('审阅')) throw new Error('detail missing review');
  const first = page.locator('.catalog-list li').first();
  await first.click();
  const item = await page.locator('.catalog-detail h2').innerText();
  await page.getByRole('button', { name: '复制调用例' }).click();
  await page.waitForTimeout(500);
  let clip = '';
  try {
    clip = await page.evaluate(() => navigator.clipboard.readText());
  } catch {
    clip = '';
  }
  if (clip && /sand-workflow|grokbot/i.test(clip)) throw new Error('clipboard has internal protocol');
  await page.goto(`${BASE}catalog?task=zzzz&kind=all&q=__no_match__`, { waitUntil: 'networkidle' });
  await page.getByText('无匹配条目').waitFor();
  await browser.close();
  console.log('UI_EVIDENCE_OK', { cards, catalogSample: item, clipLen: clip.length });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
