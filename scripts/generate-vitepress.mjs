#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const LEGACY_SKILLS = path.join(DOCS, 'legacy', 'skills');
const OLD_SKILLS = path.join(DOCS, 'skills');
const TRACE_PATH = path.join(DOCS, 'public', 'data', 'implementation-trace.json');
const TRACE_V10_PATH = path.join(DOCS, 'public', 'data', 'implementation-trace-v1.0.json');
const TRACE_V11_PATH = path.join(DOCS, 'public', 'data', 'implementation-trace-v1.1.json');

const CATEGORY_LABELS = {
  'ui-design/workflow-builders': '工作流',
  'ui-design/forms': '表单',
  'ui-design/navigation': '导航',
  'ui-design/typography': '排版',
  'ui-design/components': '组件',
  'ui-design/dashboards': '看板',
  'ui-design/marketing': '营销',
};

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

function ensureWorkPages() {
  const worksDir = path.join(DOCS, 'works');
  fs.mkdirSync(worksDir, { recursive: true });
  for (const slug of WORK_SLUGS) {
    fs.writeFileSync(
      path.join(worksDir, `${slug}.md`),
      `---
layout: page
sidebar: false
title: ${slug}
---

<WorkDetail work-slug="${slug}" />
`
    );
  }
  fs.writeFileSync(
    path.join(worksDir, 'shallow-precise.md'),
    `---
layout: page
sidebar: false
title: 浅色精密工作台
---

<WorkDetail work-slug="shallow-precise-list-detail" />
`
  );
  fs.writeFileSync(
    path.join(worksDir, 'dark-command.md'),
    `---
layout: page
sidebar: false
title: 深色指挥台
---

<WorkDetail work-slug="dark-command-list-detail" />
`
  );
  fs.writeFileSync(
    path.join(worksDir, 'soft-system.md'),
    `---
layout: page
sidebar: false
title: 浮动系统层
---

<WorkDetail work-slug="soft-system-list-detail" />
`
  );
}

function preserveV10Trace() {
  if (fs.existsSync(TRACE_V10_PATH)) return;
  if (fs.existsSync(TRACE_PATH)) {
    fs.copyFileSync(TRACE_PATH, TRACE_V10_PATH);
  }
}

function preserveV11Trace() {
  if (fs.existsSync(TRACE_V11_PATH)) return;
  const prev = JSON.parse(fs.readFileSync(TRACE_PATH, 'utf8'));
  if (prev.skillVersion === '1.1') {
    fs.copyFileSync(TRACE_PATH, TRACE_V11_PATH);
  }
}

function publishStaticData() {
  fs.mkdirSync(path.join(DOCS, 'public', 'data'), { recursive: true });
  preserveV11Trace();
  preserveV10Trace();
  const skillPath = path.join(ROOT, 'ui-design/aggregate/multi-style-ui-design/SKILL.md');
  const skillCanonical = fs.readFileSync(skillPath, 'utf8');
  // 扩展名 .txt 避免 VitePress 将含 <ID> 的正文当 Vue SFC 解析；字节与仓库 SKILL.md 一致。
  fs.writeFileSync(path.join(DOCS, 'public', 'data', 'skill-canonical.txt'), skillCanonical);
  const skillPublic = skillCanonical.replace(/style=<ID>/g, 'style=`ID`').replace(/layout=<ID>/g, 'layout=`ID`');
  fs.writeFileSync(path.join(DOCS, 'public', 'data', 'skill-full.txt'), skillPublic);
  fs.rmSync(path.join(DOCS, 'public', 'data', 'skill-full.md'), { force: true });
  fs.rmSync(path.join(DOCS, 'public', 'data', 'skill-canonical.md'), { force: true });
  fs.copyFileSync(path.join(ROOT, 'benchmarks/task-workbench-v1.json'), path.join(DOCS, 'public', 'data', 'benchmark.json'));
  fs.copyFileSync(
    path.join(ROOT, 'benchmarks/article-typesetting-v1.json'),
    path.join(DOCS, 'public', 'data', 'article-typesetting-v1.json')
  );
  fs.copyFileSync(path.join(ROOT, 'benchmarks/article-sample.md'), path.join(DOCS, 'public', 'data', 'article-sample.md'));
  fs.copyFileSync(
    path.join(ROOT, 'benchmarks/typography-presets.json'),
    path.join(DOCS, 'public', 'data', 'typography-presets.json')
  );
  const selected = path.join(ROOT, 'design-expansion-batch2/selected-catalog.json');
  if (fs.existsSync(selected)) {
    fs.copyFileSync(selected, path.join(DOCS, 'public', 'data', 'selected-catalog.json'));
  }
  const skillBody = fs.readFileSync(path.join(ROOT, 'ui-design/aggregate/multi-style-ui-design/SKILL.md'));
  const skillSha = createHash('sha256').update(skillBody).digest('hex');
  const benchSha = createHash('sha256')
    .update(fs.readFileSync(path.join(ROOT, 'benchmarks/task-workbench-v1.json')))
    .digest('hex');
  const calls = WORK_SLUGS.map((slug) => {
    let styleId = slug;
    let layoutId = 'list-detail';
    if (slug.endsWith('-list-detail')) {
      styleId = slug.replace(/-list-detail$/, '');
    } else if (slug.startsWith('shallow-precise-')) {
      styleId = 'shallow-precise';
      layoutId = slug.replace('shallow-precise-', '');
    }
    return { slug, style: styleId, layout: layoutId, benchmark: 'task-workbench-v1' };
  });
  const articleSha = createHash('sha256')
    .update(fs.readFileSync(path.join(ROOT, 'benchmarks/article-typesetting-v1.json')))
    .digest('hex');
  const trace = {
    skillVersion: '1.2',
    skillName: '多风格界面设计',
    skillSha256: skillSha,
    benchmarkId: 'task-workbench-v1',
    benchmarkSha256: benchSha,
    articleBenchmarkId: 'article-typesetting-v1',
    articleBenchmarkSha256: articleSha,
    generatedAt: new Date().toISOString(),
    implementationSession: 'v1.2: preserve workbench 8 combos + article-typesetting-v1 typography scene',
    publishedMatrixCount: 8,
    articleTypographyCount: 3,
    calls,
    articleCalls: ['reading-longform', 'editorial-magazine', 'compact-notes'].map((t) => ({
      scene: 'article-typesetting-v1',
      typography: t,
    })),
    history: { v1_0: 'implementation-trace-v1.0.json', v1_1: 'implementation-trace-v1.1.json' },
    sharedLogicPath: 'templates/task-workbench/shared/',
    tests: {
      verifyScript: 'scripts/verify.mjs',
      facets: 'scripts/verify-facets.mjs',
      workbenchUi: 'scripts/ui-acceptance-e2e.mjs',
      articleUi: 'scripts/ui-article-acceptance.mjs',
      templateBuild: 'scripts/package-templates.mjs',
    },
  };
  fs.writeFileSync(TRACE_PATH, JSON.stringify(trace, null, 2));
}

function main() {
  if (fs.existsSync(OLD_SKILLS)) {
    fs.rmSync(OLD_SKILLS, { recursive: true, force: true });
  }
  ensureLegacySkillPages();
  ensureWorkPages();
  publishStaticData();
  console.log('Generated legacy skill pages + work pages + public data');
}

main();
