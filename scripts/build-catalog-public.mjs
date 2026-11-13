#!/usr/bin/env node
/**
 * 从审阅稿生成公开 catalog-content.json（去掉内部字段与聊天协议）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const SRC =
  process.env.CATALOG_SRC ||
  path.join(ROOT, 'benchmarks/catalog-content.source.json');
const OUT = path.join(ROOT, 'benchmarks/catalog-content.json');
const PUBLIC = path.join(ROOT, 'docs/public/data/catalog-content.json');
const THEME = path.join(ROOT, 'docs/.vitepress/theme/data/catalog-content.json');

const STRIP_ITEM = ['savedSkillId', 'methodReferenceId', 'sourcePackage'];

function scrubCall(text) {
  if (!text || typeof text !== 'string') return text;
  if (/sand-workflow|grokbot:/i.test(text)) return '（内部协议已剥离；请使用方法名与公开说明。）';
  return text;
}

function scrubItem(item) {
  const out = { ...item };
  for (const k of STRIP_ITEM) delete out[k];
  out.callExample = scrubCall(out.callExample);
  if (out.knownConstraints) {
    out.knownConstraints = out.knownConstraints.filter(
      (c) => !/sand-workflow|grokbot/i.test(c)
    );
  }
  return out;
}

const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const pub = {
  title: raw.title,
  asOf: raw.asOf,
  disclaimer:
    '公开目录数据。条目审阅深度见各条 reviewDepth；未运行不得标为已验证。聚合 Skill 线上仍为 v1.2。',
  taskScenarios: raw.taskScenarios,
  countingMethodology: raw.countingMethodology,
  shareableUrlConvention: raw.shareableUrlConvention,
  items: raw.items.map(scrubItem),
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(pub, null, 2));
fs.mkdirSync(path.dirname(PUBLIC), { recursive: true });
fs.writeFileSync(PUBLIC, JSON.stringify(pub, null, 2));
fs.mkdirSync(path.dirname(THEME), { recursive: true });
fs.writeFileSync(THEME, JSON.stringify(pub, null, 2));
console.log('catalog-content.json', pub.items.length, 'items');
