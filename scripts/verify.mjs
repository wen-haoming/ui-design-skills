#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function readSkillsJson() {
  const p = path.join(DOCS, 'data', 'skills.json');
  assert(fs.existsSync(p), 'missing docs/data/skills.json — run build first');
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  assert(data.skills.length === 7, `expected 7 skills, got ${data.skills.length}`);
  for (const s of data.skills) {
    assert(s.skillMd && s.skillMd.includes('---'), `skillMd missing front matter: ${s.name}`);
    assert(s.skillMd.length > 200, `skillMd too short: ${s.name}`);
    for (const sh of s.screenshots) {
      const abs = path.join(DOCS, sh.path);
      assert(fs.existsSync(abs), `missing screenshot ${sh.path}`);
    }
  }
  return data;
}

function countFiles(dir) {
  let n = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) n += countFiles(p);
    else n++;
  }
  return n;
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
      };
      res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        port,
        base: `http://127.0.0.1:${port}/ui-design-skills/`,
        close: () => server.close(),
      });
    });
  });
}

async function httpCheck(base) {
  const index = await fetch(base);
  assert(index.ok, `index not 200: ${index.status}`);
  const data = await fetch(base + 'data/skills.json');
  assert(data.ok, 'skills.json not 200');
  const css = await fetch(base + 'css/site.css');
  assert(css.ok, 'css not 200');
  const js = await fetch(base + 'js/app.js');
  assert(js.ok, 'app.js not 200');
  const json = await data.json();
  const firstShot = json.skills[0].screenshots[0].path;
  const img = await fetch(base + firstShot);
  assert(img.ok, `image not 200: ${firstShot}`);
}

async function main() {
  console.log('verify: static assets');
  const data = readSkillsJson();
  const skillNames = data.skills.map((s) => s.name);
  assert(new Set(skillNames).size === 7, 'duplicate skill names');

  const staging = path.join(ROOT, '.verify-root');
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(path.join(staging, 'ui-design-skills'), { recursive: true });
  fs.cpSync(DOCS, path.join(staging, 'ui-design-skills'), { recursive: true });

  const srv = await startServer(staging);
  try {
    await httpCheck(srv.base);
    const q = await fetch(`${srv.base}?q=工作流`);
    assert(q.ok, 'search url failed');
    const skill = await fetch(`${srv.base}?skill=${skillNames[0]}&view=demo`);
    assert(skill.ok, 'skill detail url failed');
    console.log('verify: HTTP checks OK on', srv.base);
  } finally {
    srv.close();
  }

  console.log('verify: file count in docs/', countFiles(DOCS));
  console.log('All verification checks passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
