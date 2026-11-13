#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const pub = JSON.parse(fs.readFileSync(path.join(ROOT, 'benchmarks/catalog-content.json'), 'utf8'));
const skill = fs.readFileSync(path.join(ROOT, 'ui-design/aggregate/multi-style-ui-design/SKILL.md'));
const bench = fs.readFileSync(path.join(ROOT, 'benchmarks/task-workbench-v1.json'));

const SKILL_SHA = '00e4aabcd149f55bdf6160d5cc4df57ff7cf9f0591c3221cfcc8f5910f9e3c5f';
const BENCH_SHA = 'dc046a826677f98d990fb8afd00b17dee69d81e950f90dfc43b1edcc173e0d89';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(createHash('sha256').update(skill).digest('hex') === SKILL_SHA, 'skill v1.2 unchanged');
assert(createHash('sha256').update(bench).digest('hex') === BENCH_SHA, 'task-workbench-v1 unchanged');

const works = pub.items.filter((i) => i.kind === 'experienceable_work');
assert(works.length >= 9, 'experienceable works');

for (const it of pub.items) {
  assert(!it.savedSkillId, 'no savedSkillId in public catalog');
  if (it.callExample) assert(!/sand-workflow|grokbot:/i.test(it.callExample), `sand in ${it.id}`);
}

if (pub.vercelExpansion) {
  assert(pub.vercelExpansion.addedAsNewRows === 69, 'vercel added rows');
  assert(pub.vercelExpansion.mergedIntoExistingSiteRows === 20, 'vercel merged baseline');
  assert(pub.vercelExpansion.siteVercelUpstreamRowsAfterMerge === 89, 'vercel upstream rows');
}
console.log('verify-catalog OK', { items: pub.items.length, works: works.length });
