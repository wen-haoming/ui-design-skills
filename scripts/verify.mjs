#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'docs', '.vitepress', 'dist');
const DATA = path.join(ROOT, 'docs', '.vitepress', 'data', 'skills.json');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function readSkillsData() {
  assert(fs.existsSync(DATA), 'missing docs/.vitepress/data/skills.json — run docs:gen');
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  assert(data.skills.length === 7, `expected 7 skills, got ${data.skills.length}`);
  for (const s of data.skills) {
    assert(s.skillMd?.includes('#'), `skillMd invalid: ${s.name}`);
    const disk = fs.readFileSync(path.join(ROOT, s.path, 'SKILL.md'), 'utf8');
    assert(disk === s.skillMd, `skillMd mismatch: ${s.name}`);
    assert(fs.existsSync(path.join(ROOT, 'docs', 'skills', `${s.name}.md`)), `missing page ${s.name}.md`);
  }
  return data;
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
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.woff2': 'font/woff2',
      };
      res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        port,
        // GitHub Pages 项目站 URL 含 /ui-design-skills/，但 artifact 根目录即站点文件根（VitePress base 只影响产物内链接前缀）
        base: `http://127.0.0.1:${port}/`,
        close: () => server.close(),
      });
    });
  });
}

async function httpCheck(base) {
  const index = await fetch(base);
  assert(index.ok, `index not 200: ${index.status}`);
  const skill = await fetch(`${base}skills/light-ai-workflow-builder.html`);
  assert(skill.ok, `skill page not 200: ${skill.status}`);
  const asset = await fetch(`${base}assets/skills/light-ai-workflow-builder/original.jpg`);
  assert(asset.ok, 'asset not 200');
}

async function main() {
  assert(fs.existsSync(DIST), 'missing dist — run npm run docs:build');
  readSkillsData();
  const srv = await startServer(DIST);
  try {
    await httpCheck(srv.base);
    console.log('verify: HTTP OK', srv.base);
  } finally {
    srv.close();
  }
  console.log('All verification checks passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
