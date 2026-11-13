#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const OUT = process.env.OUT || '/opt/cursor/artifacts';
const STAMP = process.env.STAMP || '2026-11-13T18-30-00';

const exclude =
  'node_modules/* .git/* docs/.vitepress/dist/* docs/.vitepress/cache/* .template-staging/* aggregate-design-skill/* release-artifacts/* docs/public/downloads/*.zip benchmarks/catalog-content.source.json';

const tmpDir = '/tmp';
const codeZip = path.join(tmpDir, `ui-design-skills-evidence-c-code-${STAMP}.zip`);
const dataZip = path.join(tmpDir, `ui-design-skills-evidence-c-data-${STAMP}.zip`);
const outCode = path.join(OUT, path.basename(codeZip));
const outData = path.join(OUT, path.basename(dataZip));

fs.mkdirSync(OUT, { recursive: true });

execSync(`cd "${ROOT}" && zip -rq "${codeZip}" . -x ${exclude}`, { stdio: 'inherit' });
execSync(
  `cd "${ROOT}" && zip -rq "${dataZip}" benchmarks/catalog-content.source.json benchmarks/catalog-display-enrichment.json`,
  { stdio: 'inherit' }
);

const manifest = {
  type: 'split-source-delivery',
  notDeployed: true,
  branch: 'cursor/works-evidence-gallery-b711',
  stamp: STAMP,
  packages: [
    { file: path.basename(codeZip), sha256: createHash('sha256').update(fs.readFileSync(codeZip)).digest('hex'), note: '运行站点所需源码，不含 node_modules/dist/大包 zip/aggregate-design-skill' },
    { file: path.basename(dataZip), sha256: createHash('sha256').update(fs.readFileSync(dataZip)).digest('hex'), note: '审阅稿与展示增强数据，可单独更新' },
  ],
};
fs.copyFileSync(codeZip, outCode);
fs.copyFileSync(dataZip, outData);
fs.writeFileSync(path.join(OUT, `manifest-evidence-c-split-${STAMP}.json`), JSON.stringify(manifest, null, 2));
console.log('wrote', outCode, outData);
