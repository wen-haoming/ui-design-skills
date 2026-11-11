#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import http from 'node:http';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'docs', '.vitepress', 'dist');

const SKILL_SHA = '00e4aabcd149f55bdf6160d5cc4df57ff7cf9f0591c3221cfcc8f5910f9e3c5f';

const WORK_SLUGS = [
  'shallow-precise-list-detail',
  'dark-command-list-detail',
  'soft-system-list-detail',
  'editorial-sheet-list-detail',
  'amber-ledger-list-detail',
  'shallow-precise-board-detail',
  'shallow-precise-reading-split',
  'shallow-precise-calendar-agenda',
];

const ZIPS = WORK_SLUGS.map((s) => `downloads/task-workbench-${s}.zip`);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function sha256File(p) {
  return createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function benchChecks() {
  const bench = JSON.parse(fs.readFileSync(path.join(ROOT, 'benchmarks/task-workbench-v1.json'), 'utf8'));
  assert(bench.tasks.length === 10, 'benchmark tasks');
  const counts = { todo: 0, doing: 0, review: 0, done: 0 };
  for (const t of bench.tasks) counts[t.status]++;
  assert(counts.todo === 3 && counts.doing === 3 && counts.review === 2 && counts.done === 2, 'status counts');
  const skillSha = sha256File(path.join(ROOT, 'ui-design/aggregate/multi-style-ui-design/SKILL.md'));
  assert(skillSha === SKILL_SHA, `canonical skill sha ${skillSha}`);
  assert(bench.workspace.metrics.doneThisWeek === 2, 'done baseline doneThisWeek=2');
  const doneFromStatus = bench.tasks.filter((t) => t.status === 'done').length;
  assert(doneFromStatus === 2, 'done status count=2');
  const trace = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/public/data/implementation-trace.json'), 'utf8'));
  assert(trace.skillVersion === '1.2', 'trace v1.2');
  assert(trace.publishedMatrixCount === 8, 'matrix count 8');
  assert(fs.existsSync(path.join(ROOT, 'docs/public/data/implementation-trace-v1.0.json')), 'v1.0 trace preserved');
  assert(fs.existsSync(path.join(ROOT, 'docs/public/data/implementation-trace-v1.1.json')), 'v1.1 trace preserved');
}

function startServer(root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (urlPath.endsWith('/')) urlPath += 'index.html';
      const filePath = path.join(root, urlPath);
      if (!filePath.startsWith(root) || !fs.existsSync(filePath)) {
        res.statusCode = 404;
        res.end('not found');
        return;
      }
      const ext = path.extname(filePath);
      const types = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.zip': 'application/zip',
        '.md': 'text/plain',
      };
      res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({ base: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() });
    });
  });
}

async function httpCheck(base) {
  for (const p of [
    'index.html',
    'compare.html',
    'compare-layout.html',
    'typography.html',
    'data/article-sample.md',
    'legacy/index.html',
    'data/skill-canonical.txt',
    'data/benchmark.json',
    'data/implementation-trace-v1.0.json',
  ]) {
    const r = await fetch(base + p);
    assert(r.ok, `${p} ${r.status}`);
  }
  for (const slug of WORK_SLUGS) {
    const r = await fetch(`${base}works/${slug}.html`);
    assert(r.ok, `works/${slug}.html`);
  }
  for (const z of [...ZIPS, 'downloads/article-typesetting-v1.zip']) {
    const r = await fetch(base + z);
    assert(r.ok, z);
  }
}

async function main() {
  assert(fs.existsSync(DIST), 'run docs:build first');
  benchChecks();
  const srv = await startServer(DIST);
  try {
    await httpCheck(srv.base);
    const skillCanon = sha256File(path.join(DIST, 'data/skill-canonical.txt'));
    assert(skillCanon === SKILL_SHA, 'public skill-canonical md sha');
    console.log('verify OK', srv.base);
  } finally {
    srv.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
