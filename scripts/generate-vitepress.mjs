#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const LEGACY_SKILLS = path.join(DOCS, 'legacy', 'skills');
const OLD_SKILLS = path.join(DOCS, 'skills');

const CATEGORY_LABELS = {
  'ui-design/workflow-builders': '工作流',
  'ui-design/forms': '表单',
  'ui-design/navigation': '导航',
  'ui-design/typography': '排版',
  'ui-design/components': '组件',
  'ui-design/dashboards': '看板',
  'ui-design/marketing': '营销',
};

function readCatalog() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));
}

function stripFrontmatter(md) {
  if (md.startsWith('---')) {
    const end = md.indexOf('---', 3);
    if (end !== -1) return md.slice(end + 3).replace(/^\s+/, '');
  }
  return md;
}

function ensureLegacySkillPages() {
  fs.mkdirSync(LEGACY_SKILLS, { recursive: true });
  const catalog = readCatalog();
  for (const entry of catalog) {
    const skillDir = path.join(ROOT, entry.path);
    const skillMdFull = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
    const skillBody = stripFrontmatter(skillMdFull);
    const label = CATEGORY_LABELS[entry.category] || entry.category;
    const page = `---
title: ${entry.title}
description: ${entry.description}
---

# ${entry.title}

> 遗留单项技能（非公开主入口）。见 [展厅首页](/)。

${skillBody}
`;
    fs.writeFileSync(path.join(LEGACY_SKILLS, `${entry.name}.md`), page);
    for (const rel of entry.screenshots || []) {
      const abs = path.join(ROOT, rel);
      if (!fs.existsSync(abs)) continue;
      const dest = path.join(DOCS, 'public', 'assets', 'skills', entry.name, path.basename(rel));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(abs, dest);
    }
  }
}

function publishStaticData() {
  fs.mkdirSync(path.join(DOCS, 'public', 'data'), { recursive: true });
  fs.copyFileSync(
    path.join(ROOT, 'ui-design/aggregate/multi-style-ui-design/SKILL.md'),
    path.join(DOCS, 'public', 'data', 'skill-full.md')
  );
  fs.copyFileSync(path.join(ROOT, 'benchmarks/task-workbench-v1.json'), path.join(DOCS, 'public', 'data', 'benchmark.json'));
  const trace = JSON.parse(fs.readFileSync(path.join(DOCS, 'public', 'data', 'implementation-trace.json'), 'utf8'));
  trace.generatedAt = new Date().toISOString();
  fs.writeFileSync(path.join(DOCS, 'public', 'data', 'implementation-trace.json'), JSON.stringify(trace, null, 2));
}

function main() {
  if (fs.existsSync(OLD_SKILLS)) {
    fs.rmSync(OLD_SKILLS, { recursive: true, force: true });
  }
  ensureLegacySkillPages();
  publishStaticData();
  console.log('Generated legacy skill pages + public data');
}

main();
