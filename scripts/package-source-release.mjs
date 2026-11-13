#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const OUT = process.env.OUT || '/opt/cursor/artifacts';
const stamp = new Date().toISOString().replace(/[:]/g, '-').replace(/\..+/, '');
const zip = path.join(OUT, `ui-design-skills-source-evidence-c-${stamp}.zip`);

const excludes = [
  'node_modules',
  '.git',
  '.template-staging',
  'docs/.vitepress/dist',
  'docs/.vitepress/cache',
  'private',
  '.env',
];

fs.mkdirSync(OUT, { recursive: true });
const args = ['zip', '-rq', zip, '.', ...excludes.flatMap((e) => ['-x', `*${e}*`])];
execSync(args.join(' '), { cwd: ROOT, stdio: 'inherit' });

const protectedFiles = [
  'ui-design/aggregate/multi-style-ui-design/SKILL.md',
  'benchmarks/task-workbench-v1.json',
  'benchmarks/article-typesetting-v1.json',
  'benchmarks/article-sample.md',
];
const hashes = Object.fromEntries(
  protectedFiles.map((p) => [
    p,
    createHash('sha256').update(fs.readFileSync(path.join(ROOT, p))).digest('hex'),
  ])
);

const manifest = {
  type: 'source-zip-for-gitee-mirror',
  notProductionDeploy: true,
  branch: 'cursor/works-evidence-gallery-b711',
  baseMaster: '08e8485',
  generatedAt: new Date().toISOString(),
  zipSha256: createHash('sha256').update(fs.readFileSync(zip)).digest('hex'),
  protectedFileSha256: hashes,
  note: '方向 C 作品证据厅；未合并 master；Skill 仍为 v1.2',
};
fs.writeFileSync(path.join(OUT, `manifest-source-evidence-c-${stamp}.json`), JSON.stringify(manifest, null, 2));
console.log(zip);
