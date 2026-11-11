import type { Benchmark, FilterState, Task } from './types';
import { filterTasks } from './workbench';

export interface FacetCounts {
  status: Record<string, number>;
  assignee: Record<string, number>;
  due: Record<string, number>;
  statusPoolSize: number;
  assigneePoolSize: number;
  /** 当前全套筛选后的结果数 */
  resultCount: number;
}

type OmitFacet = 'status' | 'assignee' | 'due';

function filtersWithout(filters: FilterState, omit: OmitFacet): FilterState {
  const f = { ...filters };
  if (omit === 'status') f.status = '';
  if (omit === 'assignee') f.assignee = '';
  if (omit === 'due') f.due = 'all';
  return f;
}

/**
 * 分面计数：计算某一维选项时，应用其余有效筛选，不因该维当前选中而把其它选项误归零。
 */
export function computeFacetCounts(
  tasks: Task[],
  filters: FilterState,
  asOf: string,
  bench: Benchmark
): FacetCounts {
  const resultCount = filterTasks(tasks, filters, asOf).length;

  const poolStatus = filterTasks(tasks, filtersWithout(filters, 'status'), asOf);
  const status: Record<string, number> = {};
  for (const s of bench.statuses) {
    status[s.id] = poolStatus.filter((t) => t.status === s.id).length;
  }

  const poolAssignee = filterTasks(tasks, filtersWithout(filters, 'assignee'), asOf);
  const assignee: Record<string, number> = {};
  for (const m of bench.members) {
    assignee[m.id] = poolAssignee.filter((t) => t.assignees.includes(m.id)).length;
  }

  const poolDue = filterTasks(tasks, filtersWithout(filters, 'due'), asOf);
  const due: Record<string, number> = {
    all: poolDue.length,
    overdue: poolDue.filter((t) => {
      if (t.status === 'done') return false;
      const [y, m, d] = t.due.split('-').map(Number);
      const dueD = Date.UTC(y, m - 1, d);
      const [ay, am, ad] = asOf.split('-').map(Number);
      return dueD < Date.UTC(ay, am - 1, ad);
    }).length,
    today: poolDue.filter((t) => t.due === asOf).length,
    week: poolDue.filter((t) => {
      const [y, m, d] = t.due.split('-').map(Number);
      const dueD = Date.UTC(y, m - 1, d);
      const [ay, am, ad] = asOf.split('-').map(Number);
      const asOfD = Date.UTC(ay, am - 1, ad);
      const weekEnd = asOfD + 7 * 86400000;
      return dueD >= asOfD && dueD <= weekEnd;
    }).length,
  };

  return {
    status,
    assignee,
    due,
    statusPoolSize: poolStatus.length,
    assigneePoolSize: poolAssignee.length,
    resultCount,
  };
}
