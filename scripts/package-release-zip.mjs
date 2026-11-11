#!/usr/bin/env node
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
  'docs',
  'scripts',
  'package.json',
  'package-lock.json',
  '.github',
];

const manifest = {
  generatedAt: new Date().toISOString(),
  purpose: 'gitee-sync-vitepress',
  added: [
    'package.json',
    'package-lock.json',
    'docs/.vitepress/**',
    'docs/index.md',
    'docs/copyright.md',
    'docs/skills/*.md (generated)',
    'scripts/generate-vitepress.mjs',
  ],
  changed: ['README.md', 'docs/DESIGN.md', '.github/workflows/pages.yml', 'scripts/verify.mjs'],
  deleted: ['site/**', 'docs/index.html', 'docs/js/**', 'docs/css/**', 'scripts/build.mjs'],
  includes: INCLUDE_TOP,
  excludes: ['node_modules', '.git', 'release-artifacts', 'uploads', '.env', 'docs/.vitepress/dist', 'docs/.vitepress/cache'],
  notes: 'Gitee Pages 暂停；同步后执行 npm ci && npm run docs:build。勿包含 node_modules/.git。',
};

fs.mkdirSync(OUT_DIR, { recursive: true });
const manifestPath = path.join(OUT_DIR, `manifest-${STAMP}.json`);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const zipName = `ui-design-skills-vitepress-${STAMP}.zip`;
const zipPath = path.join(OUT_DIR, zipName);
const staging = path.join(OUT_DIR, '.staging');
fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(staging, { recursive: true });

function shouldSkip(rel) {
  if (rel.includes('node_modules')) return true;
  if (rel.includes('.vitepress/dist')) return true;
  if (rel.includes('.vitepress/cache')) return true;
  return false;
}

function copyFiltered(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const ent of fs.readdirSync(src)) {
      const rel = path.join(src, ent);
      const sub = path.relative(ROOT, rel);
      if (shouldSkip(sub)) continue;
      copyFiltered(rel, path.join(dest, ent));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

for (const item of INCLUDE_TOP) {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) continue;
  copyFiltered(src, path.join(staging, item));
}
fs.copyFileSync(manifestPath, path.join(staging, 'SYNC_MANIFEST.json'));

execSync(`cd "${staging}" && zip -rq "${zipPath}" .`, { stdio: 'inherit' });
fs.rmSync(staging, { recursive: true, force: true });
console.log('Wrote', zipPath);
console.log('Wrote', manifestPath);
