#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import http from 'node:http';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'docs', '.vitepress', 'dist');

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
  assert(skillSha.startsWith('41e89eb8'), 'canonical skill sha');
  assert(bench.workspace.metrics.doneThisWeek === 2, 'done baseline doneThisWeek=2');
  const doneFromStatus = bench.tasks.filter((t) => t.status === 'done').length;
  assert(doneFromStatus === 2, 'done status count=2 (t-104,t-109)');
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
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.zip': 'application/zip', '.md': 'text/plain' };
      res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({ base: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() });
    });
  });
}

async function httpCheck(base) {
  for (const p of ['index.html', 'compare.html', 'works/shallow-precise.html', 'legacy/index.html', 'data/skill-full.md', 'data/benchmark.json']) {
    const r = await fetch(base + p);
    assert(r.ok, `${p} ${r.status}`);
  }
  for (const z of ['downloads/task-workbench-shallow-precise.zip', 'downloads/task-workbench-dark-command.zip', 'downloads/task-workbench-soft-system.zip']) {
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
    console.log('verify OK', srv.base);
  } finally {
    srv.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
