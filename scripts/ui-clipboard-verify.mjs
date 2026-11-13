#!/usr/bin/env node
/**
 * 真实 clipboard 读回验证（需 playwright + grantPermissions）。
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const BASE = process.env.PREVIEW_BASE || 'http://127.0.0.1:4173/ui-design-skills/';
const SKILL_SHA = '00e4aabcd149f55bdf6160d5cc4df57ff7cf9f0591c3221cfcc8f5910f9e3c5f';
const ARTICLE = fs.readFileSync(path.join(ROOT, 'benchmarks/article-sample.md'), 'utf8');

function sha(s) {
  return createHash('sha256').update(s).digest('hex');
}

async function readClip(page) {
  try {
    return await page.evaluate(() => navigator.clipboard.readText());
  } catch (e) {
    return { error: String(e) };
  }
}

const browser = await chromium.launch();
const context = await browser.newContext();
await context.grantPermissions(['clipboard-read', 'clipboard-write']);
const page = await context.newPage();

const results = [];

await page.goto(`${BASE}catalog?id=method:skill-1794579952207`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: '复制调用说明' }).click();
await page.waitForTimeout(400);
let clip = await readClip(page);
const methodOk = typeof clip === 'string' && clip.includes('标注驱动保真排版') && clip.includes('article.md');
results.push({ test: 'catalog-method-call', ok: methodOk, len: typeof clip === 'string' ? clip.length : 0, sha: typeof clip === 'string' ? sha(clip) : null, err: clip.error });

await page.goto(`${BASE}skill`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /复制.*Skill/i }).first().click();
await page.waitForTimeout(500);
clip = await readClip(page);
const skillBody = fs.readFileSync(path.join(ROOT, 'ui-design/aggregate/multi-style-ui-design/SKILL.md'), 'utf8');
const skillOk = typeof clip === 'string' && sha(clip) === SKILL_SHA;
results.push({ test: 'skill-canonical', ok: skillOk, len: typeof clip === 'string' ? clip.length : 0, sha: typeof clip === 'string' ? sha(clip) : null, expectedSha: SKILL_SHA });

await page.goto(`${BASE}typography`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: '复制文稿' }).click();
await page.waitForTimeout(500);
clip = await readClip(page);
const articleOk = typeof clip === 'string' && clip === ARTICLE;
results.push({ test: 'article-sample', ok: articleOk, len: typeof clip === 'string' ? clip.length : 0, sha: typeof clip === 'string' ? sha(clip) : null, expectedSha: sha(ARTICLE) });

await browser.close();

const failed = results.filter((r) => !r.ok);
fs.writeFileSync('/tmp/clipboard-verify.json', JSON.stringify(results, null, 2));
if (failed.length) {
  console.error('CLIPBOARD_VERIFY_FAIL', failed);
  process.exit(1);
}
console.log('CLIPBOARD_VERIFY_OK', results);
