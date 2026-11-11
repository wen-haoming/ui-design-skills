#!/usr/bin/env node
/**
 * 指标口径：已完成 = status=done 计数，不用 due 推断。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';

/** 与 templates/task-workbench/shared/workbench.ts computeMetrics 一致 */
function computeMetrics(tasks, asOf) {
  const parseYmd = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  };
  const asOfDate = parseYmd(asOf);
  let inProgress = 0;
  let review = 0;
  let done = 0;
  let overdue = 0;
  let openTasks = 0;
  for (const t of tasks) {
    if (t.status === 'doing') inProgress++;
    if (t.status === 'review') review++;
    if (t.status === 'done') done++;
    if (t.status !== 'done') openTasks++;
    const due = parseYmd(t.due);
    if (t.status !== 'done' && due < asOfDate) overdue++;
  }
  return { openTasks, inProgress, review, done, overdue };
}

function cloneTasks(bench) {
  return JSON.parse(JSON.stringify(bench.tasks));
}

const bench = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'benchmarks/task-workbench-v1.json'), 'utf8')
);
const asOf = bench.asOf;
let tasks = cloneTasks(bench);

let m = computeMetrics(tasks, asOf);
if (m.done !== 2) throw new Error(`initial done expect 2 got ${m.done}`);
if (m.inProgress !== 3 || m.review !== 2) throw new Error('initial inProgress/review');

const t101 = tasks.find((t) => t.id === 't-101');
t101.status = 'done';
m = computeMetrics(tasks, asOf);
if (m.done !== 3) throw new Error(`after mark done expect 3 got ${m.done}`);

tasks = cloneTasks(bench);
m = computeMetrics(tasks, asOf);
if (m.done !== 2) throw new Error(`after reset tasks expect 2 got ${m.done}`);

console.log('verify-metrics OK');
