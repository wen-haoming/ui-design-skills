import type { Benchmark, FilterState, Task, WorkbenchMetrics } from './types';

export function cloneBenchmark(data: Benchmark): Benchmark {
  return JSON.parse(JSON.stringify(data)) as Benchmark;
}

export function computeMetrics(tasks: Task[], asOf: string): WorkbenchMetrics {
  const asOfDate = parseYmd(asOf);
  const weekStart = addDays(asOfDate, -((asOfDate.getUTCDay() + 6) % 7));
  const weekEnd = addDays(weekStart, 6);

  let inProgress = 0;
  let review = 0;
  let doneThisWeek = 0;
  let overdue = 0;
  let openTasks = 0;

  for (const t of tasks) {
    if (t.status === 'doing') inProgress++;
    if (t.status === 'review') review++;
    if (t.status !== 'done') openTasks++;
    const due = parseYmd(t.due);
    if (t.status !== 'done' && due < asOfDate) overdue++;
    if (t.status === 'done') {
      const doneDue = parseYmd(t.due);
      if (doneDue >= weekStart && doneDue <= weekEnd) doneThisWeek++;
    }
  }

  return { openTasks, inProgress, review, doneThisWeek, overdue };
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

export function isOverdue(task: Task, asOf: string): boolean {
  if (task.status === 'done') return false;
  return parseYmd(task.due) < parseYmd(asOf);
}

export function dueLabel(task: Task, asOf: string): string {
  if (isOverdue(task, asOf)) return '已过期';
  if (task.due === asOf) return '今天';
  return task.due;
}

export function filterTasks(tasks: Task[], filters: FilterState, asOf: string): Task[] {
  const q = filters.q.trim().toLowerCase();
  return tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.assignee && !t.assignees.includes(filters.assignee)) return false;
    if (filters.due === 'overdue' && !isOverdue(t, asOf)) return false;
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

export function memberMap(benchmark: Benchmark) {
  return Object.fromEntries(benchmark.members.map((m) => [m.id, m]));
}

export function emptyFilterState(): FilterState {
  return { q: '', status: '', assignee: '', due: 'all' };
}

export function hasActiveFilters(f: FilterState): boolean {
  return !!(f.q || f.status || f.assignee || f.due !== 'all');
}
