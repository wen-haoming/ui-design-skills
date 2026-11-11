<script setup lang="ts">
import type { createWorkbench } from './useWorkbench';

type Wb = ReturnType<typeof createWorkbench>;

defineProps<{ wb: Wb; showViewToggle?: boolean }>();
</script>

<template>
  <div class="wb-bar" role="search">
    <input v-model="wb.filters.q" type="search" placeholder="搜索标题、描述、标签" aria-label="搜索" />
    <span class="wb-bar-count" role="status" aria-live="polite">{{ wb.facets.resultCount }}/{{ wb.bench.tasks.length }}</span>
    <select v-model="wb.filters.status" aria-label="状态">
      <option value="">全部状态 ({{ wb.facets.statusPoolSize }})</option>
      <option v-for="s in wb.statuses" :key="s.id" :value="s.id">{{ s.label }} ({{ wb.facets.status[s.id] }})</option>
    </select>
    <select v-model="wb.filters.assignee" aria-label="负责人">
      <option value="">全部负责人</option>
      <option v-for="m in wb.members" :key="m.id" :value="m.id">{{ m.name }} ({{ wb.facets.assignee[m.id] }})</option>
    </select>
    <select v-model="wb.filters.due" aria-label="日期">
      <option value="all">全部日期 ({{ wb.facets.due.all }})</option>
      <option value="overdue">已过期 ({{ wb.facets.due.overdue }})</option>
      <option value="today">今天 ({{ wb.facets.due.today }})</option>
      <option value="week">一周内 ({{ wb.facets.due.week }})</option>
    </select>
    <div v-if="showViewToggle !== false" class="wb-bar-views" role="group" aria-label="视图">
      <button type="button" :aria-pressed="wb.view === 'list'" @click="wb.view = 'list'">列表</button>
      <button type="button" :aria-pressed="wb.view === 'board'" @click="wb.view = 'board'">看板</button>
    </div>
    <button type="button" @click="wb.clearFilters">清空筛选</button>
    <button type="button" @click="wb.resetBenchmark">恢复基准</button>
  </div>
</template>

<style scoped>
.wb-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-size: 13px;
}
.wb-bar input,
.wb-bar select {
  height: 30px;
  border-radius: 6px;
  border: 1px solid #d4d4d8;
  padding: 0 8px;
  font: inherit;
}
.wb-bar input {
  min-width: 140px;
  flex: 1;
}
.wb-bar-count {
  font-size: 12px;
  color: #52525b;
  font-variant-numeric: tabular-nums;
}
.wb-bar-views button,
.wb-bar > button {
  height: 30px;
  padding: 0 10px;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  cursor: pointer;
}
.wb-bar-views button[aria-pressed='true'] {
  background: #171717;
  color: #fff;
}
</style>
