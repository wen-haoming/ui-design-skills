import { ref, computed, watch, reactive } from 'vue';
import benchmarkData from './benchmark.json';
import type { Benchmark, FilterState, Task } from './types';
import {
  cloneBenchmark,
  computeMetrics,
  emptyFilterState,
  filterTasks,
  hasActiveFilters,
  memberMap,
} from './workbench';

const bench = cloneBenchmark(benchmarkData as Benchmark);

function normalizeTasks(tasks: Task[]): Task[] {
  return tasks.map((t) => ({
    ...t,
    assignees: t.assignees ?? [],
    tags: t.tags ?? [],
    activity: t.activity ?? [],
  }));
}

const seedTasks = () => normalizeTasks(cloneBenchmark(benchmarkData as Benchmark).tasks);

export function createWorkbench(sharedKey = 'default') {
  const tasks = ref<Task[]>(seedTasks());
  const selectedId = ref(bench.defaultSelection);
  const view = ref<'list' | 'board'>(bench.workspace.defaultView as 'list' | 'board');
  const filters = ref<FilterState>(emptyFilterState());
  const live = ref('');

  const members = bench.members;
  const statuses = bench.statuses;
  const asOf = bench.asOf;

  const filtered = computed(() => filterTasks(tasks.value, filters.value, asOf));
  const metrics = computed(() => computeMetrics(tasks.value, asOf));
  const membersById = computed(() => memberMap(bench));

  const selected = computed(() => tasks.value.find((t) => t.id === selectedId.value) ?? null);

  watch(filtered, (list) => {
    if (list.length && selectedId.value && !list.some((t) => t.id === selectedId.value)) {
      selectedId.value = list[0]?.id ?? '';
    }
    if (!list.length) selectedId.value = '';
  });

  function selectTask(id: string) {
    selectedId.value = id;
  }

  function setStatus(id: string, status: string) {
    const t = tasks.value.find((x) => x.id === id);
    if (!t) return;
    t.status = status;
    live.value = `已更新 ${id} 状态（本地会话，重置可恢复）`;
  }

  function resetBenchmark() {
    tasks.value = seedTasks();
    filters.value = emptyFilterState();
    selectedId.value = bench.defaultSelection;
    view.value = bench.workspace.defaultView as 'list' | 'board';
    live.value = '已恢复为本基准的固定数据与筛选';
  }

  function clearFilters() {
    filters.value = emptyFilterState();
    live.value = '已清空筛选条件';
  }

  const filterActive = computed(() => hasActiveFilters(filters.value));

  return reactive({
    bench,
    tasks,
    filtered,
    metrics,
    members,
    membersById,
    statuses,
    asOf,
    selectedId,
    selected,
    view,
    filters,
    filterActive,
    live,
    selectTask,
    setStatus,
    resetBenchmark,
    clearFilters,
    sharedKey,
  });
}

let sharedInstance: ReturnType<typeof createWorkbench> | null = null;

/** 对比页三风格共享同一会话状态 */
export function useSharedWorkbench() {
  if (!sharedInstance) sharedInstance = createWorkbench('shared');
  return sharedInstance;
}

export function resetSharedWorkbench() {
  sharedInstance?.resetBenchmark();
}
