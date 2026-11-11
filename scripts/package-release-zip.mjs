#!/usr/bin/env node
/**
 * 生成可同步 Gitee 的源码包（排除 node_modules / .git / 秘密）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'release-artifacts');
const STAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

const INCLUDE_TOP = [
  'README.md',
  'COPYRIGHT.md',
  'catalog.json',
  'ui-design',
  'site',
  'scripts',
  'docs',
  '.github',
];

const manifest = {
  generatedAt: new Date().toISOString(),
  purpose: 'gitee-sync-static-site',
  includes: INCLUDE_TOP,
  excludes: ['node_modules', '.git', 'release-artifacts', 'uploads', '*.zip'],
  notes: 'Gitee Pages 入口当前不可用；此包含 docs 构建产物与源码，供官方 API 同步。',
};

fs.mkdirSync(OUT_DIR, { recursive: true });
const manifestPath = path.join(OUT_DIR, `manifest-${STAMP}.json`);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const zipName = `ui-design-skills-site-${STAMP}.zip`;
const zipPath = path.join(OUT_DIR, zipName);

const staging = path.join(OUT_DIR, '.staging');
fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(staging, { recursive: true });

for (const item of INCLUDE_TOP) {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(staging, item), { recursive: true });
}
fs.copyFileSync(manifestPath, path.join(staging, 'SYNC_MANIFEST.json'));

execSync(`cd "${staging}" && zip -rq "${zipPath}" .`, { stdio: 'inherit' });
fs.rmSync(staging, { recursive: true, force: true });

console.log('Wrote', zipPath);
console.log('Wrote', manifestPath);
