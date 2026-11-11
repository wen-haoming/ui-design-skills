#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const VP = path.join(DOCS, '.vitepress');
const PUBLIC = path.join(DOCS, 'public');
const SKILLS_MD = path.join(DOCS, 'skills');

const CATEGORY_LABELS = {
  'ui-design/workflow-builders': '工作流',
  'ui-design/forms': '表单',
  'ui-design/navigation': '导航',
  'ui-design/typography': '排版',
  'ui-design/components': '组件',
  'ui-design/dashboards': '看板',
  'ui-design/marketing': '营销',
};

const DEMO_COMPONENTS = {
  'light-ai-workflow-builder': 'DemoWorkflow',
  'risk-action-confirmation': 'DemoRiskForm',
  'responsive-document-navigation': 'DemoDocumentNav',
  'optical-text-label-alignment': 'DemoOpticalAlign',
  'status-label-encoding': 'DemoStatusLabels',
  'ops-command-center-hierarchy': 'DemoOpsDashboard',
  'marketing-product-ui-stills': 'DemoMarketingStill',
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

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function cleanGenerated() {
  rmrf(path.join(PUBLIC, 'assets', 'skills'));
  rmrf(SKILLS_MD);
  fs.mkdirSync(SKILLS_MD, { recursive: true });
  fs.mkdirSync(path.join(VP, 'data'), { recursive: true });
}

function main() {
  cleanGenerated();
  const catalog = readCatalog();
  const skills = [];
  const sidebarGroups = new Map();

  for (const entry of catalog) {
    const skillDir = path.join(ROOT, entry.path);
    const skillMdFull = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
    const skillBody = stripFrontmatter(skillMdFull);
    const readme = fs.readFileSync(path.join(skillDir, 'README.md'), 'utf8');
    const metadata = JSON.parse(fs.readFileSync(path.join(skillDir, 'metadata.json'), 'utf8'));
    const label = CATEGORY_LABELS[entry.category] || entry.category;

    const shots = [];
    const allShotPaths = new Set(entry.screenshots || []);
    for (const s of metadata.screenshots || []) {
      allShotPaths.add(path.join(entry.path, s.path).replace(/\\/g, '/'));
    }
    for (const rel of allShotPaths) {
      const abs = path.join(ROOT, rel);
      if (!fs.existsSync(abs)) continue;
      const baseName = path.basename(rel);
      const publicPath = `/assets/skills/${entry.name}/${baseName}`;
      copyFile(abs, path.join(PUBLIC, 'assets/skills', entry.name, baseName));
      const metaShot = (metadata.screenshots || []).find((x) => x.path?.endsWith(baseName));
      shots.push({
        src: publicPath,
        description: metaShot?.description || '第三方参考图，非实现效果',
        kind: metaShot?.kind || 'third-party-reference',
      });
    }

    const sources = Array.isArray(entry.source) ? entry.source : entry.source ? [entry.source] : [];
    const notes = entry.notes || '';

    const refMd = shots
      .map(
        (sh) =>
          `![${sh.description}](${sh.src})\n\n*${sh.description}${sh.kind === 'third-party-reference' ? ' · 第三方参考图，非实现效果' : ''}*`
      )
      .join('\n\n');

    const sourcesMd = sources.length
      ? `**来源：** ${sources.map((u) => `[链接](${u})`).join(' · ')}\n\n`
      : '';
    const notesMd = notes ? `> ${notes}\n\n` : '';

    const demo = DEMO_COMPONENTS[entry.name] || null;
    const demoBlock = demo
      ? `<ClientOnly>\n  <${demo} />\n</ClientOnly>\n\n`
      : '';

    const page = `---
title: ${entry.title}
description: ${entry.description}
category: ${label}
skillName: ${entry.name}
---

# ${entry.title}

<span class="badge">原创演示，非原作实现</span> <span class="badge">${label}</span>

${entry.description}

${sourcesMd}${notesMd}

## 第三方参考图

${refMd || '_无可用截图（未伪造）。_'}

## 原创交互演示

<p class="demo-note">原创演示，非原作实现。数据为示例，不代表第三方产品或真实业务结果。</p>

${demoBlock}

<SkillToolbar skill-name="${entry.name}" />

## SKILL 原文

${skillBody}
`;

    fs.writeFileSync(path.join(SKILLS_MD, `${entry.name}.md`), page, 'utf8');

    const skillRecord = {
      name: entry.name,
      title: entry.title,
      description: entry.description,
      category: entry.category,
      categoryLabel: label,
      path: entry.path,
      source: sources,
      notes,
      screenshots: shots,
      readme,
      skillMd: skillMdFull,
      skillBody,
      metadata,
      link: `/skills/${entry.name}`,
    };
    skills.push(skillRecord);

    if (!sidebarGroups.has(label)) sidebarGroups.set(label, []);
    sidebarGroups.get(label).push({ text: entry.title, link: `/skills/${entry.name}` });
  }

  fs.writeFileSync(path.join(VP, 'data', 'skills.json'), JSON.stringify({ skills }, null, 2));

  const sidebar = [{ text: '概览', link: '/' }, ...[...sidebarGroups.entries()].map(([text, items]) => ({ text, collapsed: false, items }))];

  fs.writeFileSync(
    path.join(VP, 'skills-meta.json'),
    JSON.stringify({ skills, sidebar }, null, 2)
  );

  console.log(`Generated ${skills.length} VitePress skill pages`);
}

main();
