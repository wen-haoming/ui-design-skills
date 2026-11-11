#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const DOCS = path.join(ROOT, 'docs');

const CATEGORY_LABELS = {
  'ui-design/workflow-builders': '工作流',
  'ui-design/forms': '表单',
  'ui-design/navigation': '导航',
  'ui-design/typography': '排版',
  'ui-design/components': '组件',
  'ui-design/dashboards': '看板',
  'ui-design/marketing': '营销',
};

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function readCatalog() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));
}

function normalizeSource(source) {
  if (Array.isArray(source)) return source;
  return source ? [source] : [];
}

function build() {
  rmrf(DOCS);
  fs.mkdirSync(DOCS, { recursive: true });

  const catalog = readCatalog();
  const copyright = fs.readFileSync(path.join(ROOT, 'COPYRIGHT.md'), 'utf8');
  const skills = [];

  for (const entry of catalog) {
    const skillDir = path.join(ROOT, entry.path);
    const skillMd = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
    const readme = fs.readFileSync(path.join(skillDir, 'README.md'), 'utf8');
    const metadata = JSON.parse(fs.readFileSync(path.join(skillDir, 'metadata.json'), 'utf8'));

    const shots = [];
    const shotList = entry.screenshots || [];
    for (const rel of shotList) {
      const abs = path.join(ROOT, rel);
      const baseName = path.basename(rel);
      const outRel = path.posix.join('assets', 'skills', entry.name, baseName);
      copyFile(abs, path.join(DOCS, outRel));
      const metaShot = (metadata.screenshots || []).find((s) => s.path?.endsWith(baseName));
      shots.push({
        path: outRel,
        kind: metaShot?.kind || 'third-party-reference',
        description: metaShot?.description || '第三方参考图，非实现效果',
      });
    }

    const extraShots = (metadata.screenshots || []).map((s) => s.path);
    for (const relShot of extraShots) {
      const abs = path.join(skillDir, relShot);
      if (!fs.existsSync(abs)) continue;
      const baseName = path.basename(relShot);
      const outRel = path.posix.join('assets', 'skills', entry.name, baseName);
      if (!shots.some((x) => x.path === outRel)) {
        copyFile(abs, path.join(DOCS, outRel));
        const metaShot = metadata.screenshots.find((s) => s.path === relShot);
        shots.push({
          path: outRel,
          kind: metaShot?.kind || 'third-party-reference',
          description: metaShot?.description || '第三方参考图，非实现效果',
        });
      }
    }

    skills.push({
      name: entry.name,
      title: entry.title,
      description: entry.description,
      category: entry.category,
      categoryLabel: CATEGORY_LABELS[entry.category] || entry.category,
      path: entry.path,
      source: normalizeSource(entry.source),
      notes: entry.notes || metadata.notes || '',
      screenshots: shots,
      readme,
      skillMd,
      metadata,
    });
  }

  const data = {
    generatedAt: new Date().toISOString(),
    repo: {
      github: 'https://github.com/wen-haoming/ui-design-skills',
      gitee: 'https://gitee.com/haomingla/ui-design-skills',
    },
    copyright,
    skills,
  };

  fs.mkdirSync(path.join(DOCS, 'data'), { recursive: true });
  fs.writeFileSync(path.join(DOCS, 'data', 'skills.json'), JSON.stringify(data, null, 2));

  for (const file of ['index.html', 'config.js']) {
    copyFile(path.join(SITE, file), path.join(DOCS, file));
  }
  copyFile(path.join(SITE, 'css', 'site.css'), path.join(DOCS, 'css', 'site.css'));
  for (const js of ['app.js', 'demos.js', 'markdown.js']) {
    copyFile(path.join(SITE, 'js', js), path.join(DOCS, 'js', js));
  }

  copyFile(path.join(ROOT, 'COPYRIGHT.md'), path.join(DOCS, 'COPYRIGHT.md'));
  copyFile(path.join(SITE, 'DESIGN.md'), path.join(DOCS, 'DESIGN.md'));

  console.log(`Built ${skills.length} skills → ${DOCS}`);
}

build();
