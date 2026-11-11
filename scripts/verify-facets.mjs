#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bench = JSON.parse(fs.readFileSync(path.join(ROOT, 'benchmarks/task-workbench-v1.json'), 'utf8'));
const tasks = bench.tasks;
const asOf = bench.asOf;

function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(d, n) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function isOverdue(task) {
  if (task.status === 'done') return false;
  return parseYmd(task.due) < parseYmd(asOf);
}

function filterTasks(list, filters) {
  const q = (filters.q || '').trim().toLowerCase();
  return list.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.assignee && !t.assignees.includes(filters.assignee)) return false;
    if (filters.due === 'overdue' && !isOverdue(t)) return false;
    if (filters.due === 'today' && t.due !== asOf) return false;
    if (filters.due === 'week') {
      const due = parseYmd(t.due);
      const asOfDate = parseYmd(asOf);
      const weekEnd = addDays(asOfDate, 7);
      if (due < asOfDate || due > weekEnd) return false;
    }
    if (!q) return true;
    const hay = [t.title, t.description, ...t.tags].join(' ').toLowerCase();
    return hay.includes(q);
  });
}

function filtersWithout(filters, omit) {
  const f = { ...filters };
  if (omit === 'status') f.status = '';
  if (omit === 'assignee') f.assignee = '';
  if (omit === 'due') f.due = 'all';
  return f;
}

function computeFacetCounts(filters) {
  const resultCount = filterTasks(tasks, filters).length;
  const poolStatus = filterTasks(tasks, filtersWithout(filters, 'status'));
  const status = {};
  for (const s of bench.statuses) status[s.id] = poolStatus.filter((t) => t.status === s.id).length;
  return { status, resultCount };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const base = computeFacetCounts({ q: '', status: '', assignee: '', due: 'all' });
assert(base.status.todo === 3, `todo=${base.status.todo}`);
assert(base.status.doing === 3, `doing=${base.status.doing}`);
assert(base.status.done === 2, `done=${base.status.done}`);
assert(base.resultCount === 10, `resultCount=${base.resultCount}`);

const doingOnly = computeFacetCounts({ q: '', status: 'doing', assignee: '', due: 'all' });
assert(doingOnly.status.todo === 3, 'with status=doing, todo facet still 3');
assert(doingOnly.status.done === 2, 'with status=doing, done facet still 2');
assert(doingOnly.resultCount === 3, 'filtered results 3');

console.log('verify-facets OK');
