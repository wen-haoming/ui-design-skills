#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'release-artifacts');
const STAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

const INCLUDE = [
  'README.md',
  'COPYRIGHT.md',
  'catalog.json',
  'benchmarks',
  'ui-design',
  'templates',
  'docs',
  'scripts',
  'package.json',
  'package-lock.json',
  '.github',
];

const manifest = {
  generatedAt: new Date().toISOString(),
  purpose: 'gitee-sync-aggregate-gallery',
  added: ['ui-design/aggregate/', 'benchmarks/', 'templates/task-workbench/', 'docs/works/', 'docs/public/data/', 'docs/public/covers/', 'docs/public/downloads/'],
  changed: ['docs/index.md', 'docs/.vitepress/', 'scripts/generate-vitepress.mjs', 'README.md'],
  deleted: ['docs/skills/', 'site/', 'docs/index.html', 'docs/js/', 'docs/css/', 'scripts/build.mjs'],
  includes: INCLUDE,
  excludes: ['node_modules', '.git', 'release-artifacts', '.template-staging', 'dist-templates', 'docs/.vitepress/dist', 'docs/.vitepress/cache'],
};

fs.mkdirSync(OUT, { recursive: true });
const manifestPath = path.join(OUT, `manifest-${STAMP}.json`);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const staging = path.join(OUT, '.staging');
fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(staging, { recursive: true });

function skip(rel) {
  return /node_modules|\.vitepress\/dist|\.vitepress\/cache|\.template-staging|dist-templates/.test(rel);
}

function copyTree(src, dest, relBase = '') {
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const rel = path.join(relBase, ent.name);
    if (skip(rel)) continue;
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyTree(s, d, rel);
    } else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

for (const item of INCLUDE) {
  const s = path.join(ROOT, item);
  if (!fs.existsSync(s)) continue;
  const d = path.join(staging, item);
  if (fs.statSync(s).isDirectory()) {
    fs.mkdirSync(d, { recursive: true });
    copyTree(s, d, item);
  } else {
    fs.mkdirSync(path.dirname(d), { recursive: true });
    fs.copyFileSync(s, d);
  }
}
fs.copyFileSync(manifestPath, path.join(staging, 'SYNC_MANIFEST.json'));

const zip = path.join(OUT, `ui-design-skills-aggregate-${STAMP}.zip`);
execSync(`cd "${staging}" && zip -rq "${zip}" .`, { stdio: 'inherit' });
fs.rmSync(staging, { recursive: true, force: true });
console.log(zip);
console.log(manifestPath);
