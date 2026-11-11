<script setup lang="ts">
import { useSharedWorkbench } from '../shared/useWorkbench';
import { dueLabel, isOverdue } from '../shared/workbench';
import FilterBar from '../shared/FilterBar.vue';

import { onMounted } from 'vue';

const props = defineProps<{ compact?: boolean; boardDetail?: boolean }>();
const wb = useSharedWorkbench();
if (props.boardDetail) wb.view = 'board';
onMounted(() => {
  if (props.boardDetail) wb.view = 'board';
});
</script>

<template>
  <div class="sp-root" :class="{ 'sp-root--compact': compact }">
    <div class="sp-shell" role="application" aria-label="浅色精密工作台（原创示例）">
      <aside class="sp-nav" aria-label="导航（示例）">
        <div class="sp-nav-brand">{{ wb.bench.workspace.name }}</div>
        <nav>
          <button type="button" class="sp-nav-item sp-nav-item--active">任务</button>
          <button type="button" class="sp-nav-item" disabled>日历</button>
          <button type="button" class="sp-nav-item" disabled>设置</button>
        </nav>
      </aside>
      <div class="sp-main">
        <header class="sp-toolbar">
          <div>
            <h2 class="sp-title">{{ wb.bench.workspace.subtitle }}</h2>
            <p class="sp-asof">基准日 {{ wb.asOf }} · 示例数据</p>
          </div>
          <div class="sp-metrics" aria-live="polite">
            <div class="sp-metric"><span>进行中</span><strong>{{ wb.metrics.inProgress }}</strong></div>
            <div class="sp-metric"><span>评审</span><strong>{{ wb.metrics.review }}</strong></div>
            <div class="sp-metric"><span>已完成</span><strong>{{ wb.metrics.done }}</strong></div>
            <div class="sp-metric sp-metric--warn"><span>过期</span><strong>{{ wb.metrics.overdue }}</strong></div>
          </div>
        </header>
        <FilterBar class="sp-filters" :wb="wb" :show-view-toggle="!props.boardDetail" />
        <p class="sp-live" role="status" aria-live="polite">{{ wb.live }}</p>
        <div class="sp-split">
          <section class="sp-list" :aria-label="wb.view === 'list' ? '任务列表' : '看板'">
            <div v-if="!wb.filtered.length" class="sp-empty">
              无匹配任务。
              <button type="button" @click="wb.clearFilters">清空筛选</button>
            </div>
            <table v-else-if="wb.view === 'list'" class="sp-table">
              <thead>
                <tr>
                  <th>任务</th>
                  <th>状态</th>
                  <th>负责人</th>
                  <th>到期</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="t in wb.filtered"
                  :key="t.id"
                  :class="{ 'sp-row--sel': t.id === wb.selectedId }"
                  tabindex="0"
                  @click="wb.selectTask(t.id)"
                  @keydown.enter="wb.selectTask(t.id)"
                >
                  <td>
                    <span class="sp-task-id">{{ t.id }}</span>
                    {{ t.title }}
                  </td>
                  <td><span class="sp-status" :data-status="t.status">{{ wb.statuses.find((s) => s.id === t.status)?.label }}</span></td>
                  <td>{{ t.assignees.map((id) => wb.membersById[id]?.initials).join(', ') }}</td>
                  <td :class="{ 'sp-overdue': isOverdue(t, wb.asOf) }">{{ dueLabel(t, wb.asOf) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="sp-board">
              <div v-for="s in wb.statuses" :key="s.id" class="sp-col">
                <h3>{{ s.label }}</h3>
                <button
                  v-for="t in wb.filtered.filter((x) => x.status === s.id)"
                  :key="t.id"
                  type="button"
                  class="sp-card"
                  :class="{ 'sp-card--sel': t.id === wb.selectedId }"
                  @click="wb.selectTask(t.id)"
                >
                  <span class="sp-task-id">{{ t.id }}</span>
                  {{ t.title }}
                </button>
              </div>
            </div>
          </section>
          <aside v-if="wb.selected" class="sp-detail" aria-label="任务详情">
            <h3>{{ wb.selected.title }}</h3>
            <p class="sp-meta">{{ wb.selected.id }} · {{ wb.selected.priority }} 优先级</p>
            <p>{{ wb.selected.description }}</p>
            <label class="sp-label">状态</label>
            <select :value="wb.selected.status" @change="wb.setStatus(wb.selected.id, ($event.target as HTMLSelectElement).value)">
              <option v-for="s in wb.statuses" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
            <ul class="sp-activity">
              <li v-for="(a, i) in wb.selected.activity" :key="i">{{ a }}</li>
              <li v-if="!(wb.selected.activity?.length)">暂无活动（示例）</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sp-root {
  --sp-bg: #fafafa;
  --sp-panel: #fff;
  --sp-text: #171717;
  --sp-muted: #737373;
  --sp-border: #e5e5e5;
  font-family: system-ui, sans-serif;
  font-size: 13px;
  color: var(--sp-text);
}
.sp-shell {
  display: grid;
  grid-template-columns: 148px 1fr;
  min-height: 420px;
  border: 1px solid var(--sp-border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--sp-bg);
  container-type: inline-size;
  container-name: sp-shell;
}
.sp-root--compact .sp-shell {
  min-height: 360px;
}
.sp-nav {
  background: var(--sp-panel);
  border-right: 1px solid var(--sp-border);
  padding: 12px 10px;
}
.sp-nav-brand {
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 12px;
}
.sp-nav-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font: inherit;
  cursor: pointer;
  margin-bottom: 4px;
}
.sp-nav-item--active {
  background: #171717;
  color: #fff;
}
.sp-nav-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.sp-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.sp-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--sp-border);
  background: var(--sp-panel);
}
.sp-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.sp-asof {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--sp-muted);
}
.sp-metrics {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.sp-metric {
  border: 1px solid var(--sp-border);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  background: var(--sp-bg);
}
.sp-metric strong {
  margin-left: 6px;
  font-size: 16px;
}
.sp-metric--warn strong {
  color: #b45309;
}
.sp-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 14px;
  align-items: center;
  background: var(--sp-panel);
  border-bottom: 1px solid var(--sp-border);
}
.sp-filters input,
.sp-filters select {
  height: 28px;
  border: 1px solid var(--sp-border);
  border-radius: 6px;
  padding: 0 8px;
  font: inherit;
  background: var(--sp-bg);
}
.sp-filters input {
  min-width: 140px;
  flex: 1;
}
.sp-view-toggle button {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--sp-border);
  background: var(--sp-panel);
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
}
.sp-view-toggle button[aria-pressed='true'] {
  background: #171717;
  color: #fff;
}
.sp-btn-ghost {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--sp-border);
  border-radius: 6px;
  background: var(--sp-panel);
  font: inherit;
  cursor: pointer;
}
.sp-live {
  margin: 0;
  padding: 4px 14px;
  font-size: 12px;
  color: #0d7a3e;
  min-height: 1.2em;
}
.sp-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(200px, 260px);
  flex: 1;
  min-height: 0;
}
.sp-detail h3,
.sp-detail p,
.sp-table td,
.sp-card {
  word-break: normal;
  overflow-wrap: break-word;
}
@container sp-shell (max-width: 720px) {
  .sp-shell {
    grid-template-columns: 1fr;
  }
  .sp-nav {
    display: none;
  }
  .sp-split {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .sp-shell {
    grid-template-columns: 1fr;
  }
  .sp-nav {
    display: none;
  }
  .sp-split {
    grid-template-columns: 1fr;
  }
}
.sp-list {
  overflow: auto;
  padding: 8px 10px;
}
.sp-table {
  width: 100%;
  border-collapse: collapse;
}
.sp-table th,
.sp-table td {
  text-align: left;
  padding: 6px 8px;
  border-bottom: 1px solid var(--sp-border);
}
.sp-row--sel {
  background: #f0f0f0;
}
.sp-task-id {
  font-size: 11px;
  color: var(--sp-muted);
  margin-right: 6px;
}
.sp-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--sp-border);
  background: #fff;
}
.sp-overdue {
  color: #b42318;
  font-weight: 600;
}
.sp-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(100px, 1fr));
  gap: 8px;
}
.sp-col h3 {
  font-size: 12px;
  margin: 0 0 6px;
  color: var(--sp-muted);
}
.sp-card {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px;
  margin-bottom: 6px;
  border: 1px solid var(--sp-border);
  border-radius: 10px;
  background: var(--sp-panel);
  font: inherit;
  cursor: pointer;
}
.sp-card--sel {
  border-color: #171717;
  box-shadow: 0 0 0 1px #171717;
}
.sp-detail {
  border-left: 1px solid var(--sp-border);
  background: var(--sp-panel);
  padding: 12px;
  overflow: auto;
}
.sp-detail h3 {
  margin: 0 0 6px;
  font-size: 15px;
}
.sp-meta {
  font-size: 12px;
  color: var(--sp-muted);
}
.sp-label {
  display: block;
  font-size: 12px;
  margin-top: 10px;
}
.sp-detail select {
  width: 100%;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--sp-border);
}
.sp-activity {
  margin: 12px 0 0;
  padding-left: 1.2em;
  font-size: 12px;
  color: var(--sp-muted);
}
.sp-empty {
  padding: 24px;
  text-align: center;
  color: var(--sp-muted);
  border: 1px dashed var(--sp-border);
  border-radius: 10px;
}
.sp-empty button {
  margin-left: 8px;
}
</style>
