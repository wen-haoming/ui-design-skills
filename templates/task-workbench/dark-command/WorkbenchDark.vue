<script setup lang="ts">
import { useSharedWorkbench } from '../shared/useWorkbench';
import { dueLabel, isOverdue } from '../shared/workbench';
import FilterBar from '../shared/FilterBar.vue';

defineProps<{ compact?: boolean }>();
const wb = useSharedWorkbench();
</script>

<template>
  <div class="dc-root">
    <div class="dc-frame" role="application" aria-label="深色指挥台（原创示例）">
      <header class="dc-top">
        <div class="dc-headline">
          <span class="dc-kicker">指挥视图</span>
          <h2>{{ wb.bench.title }}</h2>
          <p>基准 {{ wb.asOf }} · 示例数据</p>
        </div>
        <div class="dc-kpis">
          <div class="dc-kpi"><em>未结</em><strong>{{ wb.metrics.openTasks }}</strong></div>
          <div class="dc-kpi"><em>进行中</em><strong>{{ wb.metrics.inProgress }}</strong></div>
          <div class="dc-kpi"><em>评审</em><strong>{{ wb.metrics.review }}</strong></div>
          <div class="dc-kpi dc-kpi--accent"><em>已完成</em><strong>{{ wb.metrics.done }}</strong></div>
        </div>
      </header>
      <nav class="dc-rail" aria-label="模块">
        <span class="dc-rail-active">队列</span>
        <span>简报</span>
        <span>日志</span>
      </nav>
      <div class="dc-command">
        <section class="dc-queue">
          <FilterBar class="dc-queue-tools" :wb="wb" />
          <p class="dc-live" role="status" aria-live="polite">{{ wb.live }}</p>
          <div v-if="!wb.filtered.length" class="dc-empty">无匹配。<button type="button" @click="wb.clearFilters">清空筛选</button></div>
          <ul v-else-if="wb.view === 'list'" class="dc-rows" role="list">
            <li
              v-for="t in wb.filtered"
              :key="t.id"
              role="listitem"
              :class="{ 'dc-rows--on': t.id === wb.selectedId }"
              tabindex="0"
              @click="wb.selectTask(t.id)"
              @keydown.enter="wb.selectTask(t.id)"
            >
              <span class="dc-row-id">{{ t.id }}</span>
              <span class="dc-status-tag" :data-s="t.status">{{ wb.statuses.find((s) => s.id === t.status)?.label }}</span>
              <span class="dc-row-title">{{ t.title }}</span>
              <span class="dc-row-meta" :class="{ 'dc-row-meta--bad': isOverdue(t, wb.asOf) }">{{ dueLabel(t, wb.asOf) }}</span>
              <span class="dc-row-who">{{ t.assignees.map((id) => wb.membersById[id]?.initials).join(' ') }}</span>
            </li>
          </ul>
          <div v-else class="dc-board">
            <div v-for="s in wb.statuses" :key="s.id" class="dc-col">
              <h4>{{ s.label }}</h4>
              <button
                v-for="t in wb.filtered.filter((x) => x.status === s.id)"
                :key="t.id"
                type="button"
                class="dc-tile"
                :class="{ 'dc-tile--on': t.id === wb.selectedId }"
                @click="wb.selectTask(t.id)"
              >
                {{ t.id }} {{ t.title }}
              </button>
            </div>
          </div>
        </section>
        <aside v-if="wb.selected" class="dc-context" aria-label="上下文">
          <h3>{{ wb.selected.title }}</h3>
          <p class="dc-ctx-line">{{ wb.selected.description }}</p>
          <div class="dc-ctx-controls">
            <label for="dc-st">状态</label>
            <select id="dc-st" :value="wb.selected.status" @change="wb.setStatus(wb.selected!.id, ($event.target as HTMLSelectElement).value)">
              <option v-for="s in wb.statuses" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
          </div>
          <h4>活动</h4>
          <ol class="dc-log">
            <li v-for="(a, i) in wb.selected.activity" :key="i">{{ a }}</li>
          </ol>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dc-root {
  font-family: system-ui, sans-serif;
  font-size: 13px;
  color: #f5f5f5;
}
.dc-frame {
  container-type: inline-size;
  container-name: dc-frame;
  background: #0c0c0d;
  border-radius: 18px;
  border: 1px solid #2a2a2e;
  overflow: hidden;
  min-height: 440px;
  display: flex;
  flex-direction: column;
}
.dc-top {
  padding: 16px 18px 12px;
  border-bottom: 1px solid #2a2a2e;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
}
.dc-kicker {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a1a1aa;
}
.dc-headline h2 {
  margin: 4px 0;
  font-size: 22px;
  font-weight: 700;
}
.dc-headline p {
  margin: 0;
  font-size: 12px;
  color: #a1a1aa;
}
.dc-kpis {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-kpi {
  min-width: 72px;
  padding: 8px 12px;
  border-radius: 12px;
  background: #161618;
  border: 1px solid #303036;
}
.dc-kpi em {
  display: block;
  font-size: 10px;
  font-style: normal;
  color: #a1a1aa;
}
.dc-kpi strong {
  font-size: 20px;
  font-weight: 700;
}
.dc-kpi--accent strong {
  color: #86efac;
}
.dc-rail {
  display: flex;
  gap: 16px;
  padding: 8px 18px;
  font-size: 12px;
  color: #71717a;
  border-bottom: 1px solid #2a2a2e;
}
.dc-rail-active {
  color: #fff;
  font-weight: 600;
}
.dc-command {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(200px, 0.8fr);
  flex: 1;
  min-height: 280px;
}
.dc-context h3,
.dc-context p,
.dc-ctx-line {
  word-break: normal;
  overflow-wrap: break-word;
}
@container dc-frame (max-width: 720px) {
  .dc-command {
    grid-template-columns: 1fr;
  }
  .dc-queue {
    border-right: none;
    border-bottom: 1px solid #2a2a2e;
  }
}
@media (max-width: 720px) {
  .dc-command {
    grid-template-columns: 1fr;
  }
}
.dc-queue {
  padding: 10px 14px;
  border-right: 1px solid #2a2a2e;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.dc-queue-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.dc-queue-tools input,
.dc-queue-tools select {
  background: #161618;
  border: 1px solid #3f3f46;
  color: #f5f5f5;
  border-radius: 8px;
  height: 30px;
  padding: 0 8px;
  font: inherit;
}
.dc-queue-tools button {
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #3f3f46;
  background: #161618;
  color: #e4e4e7;
  font: inherit;
  cursor: pointer;
}
.dc-queue-tools button[aria-pressed='true'] {
  background: #f5f5f5;
  color: #0c0c0d;
}
.dc-link {
  border: none !important;
  background: transparent !important;
  text-decoration: underline;
  color: #a1a1aa !important;
}
.dc-live {
  margin: 6px 0;
  font-size: 11px;
  color: #86efac;
  min-height: 1em;
}
.dc-rows {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: auto;
}
.dc-rows li {
  display: grid;
  grid-template-columns: 64px 1fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 8px 6px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid transparent;
}
.dc-rows--on {
  background: #1f1f23;
  border-color: #3f3f46;
}
.dc-status-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
  background: #27272a;
  border: 1px solid #3f3f46;
}
.dc-row-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dc-row-meta {
  font-size: 11px;
  color: #a1a1aa;
}
.dc-row-meta--bad {
  color: #fca5a5;
}
.dc-row-who {
  font-size: 11px;
  color: #71717a;
}
.dc-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(90px, 1fr));
  gap: 8px;
  overflow: auto;
}
.dc-col h4 {
  margin: 0 0 6px;
  font-size: 11px;
  color: #71717a;
}
.dc-tile {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px;
  font-size: 12px;
  border-radius: 10px;
  border: 1px solid #3f3f46;
  background: #161618;
  color: #e4e4e7;
  cursor: pointer;
  margin-bottom: 6px;
}
.dc-tile--on {
  border-color: #f5f5f5;
  background: #27272a;
}
.dc-context {
  padding: 14px 16px;
  background: #121214;
  overflow: auto;
}
.dc-context h3 {
  margin: 0 0 8px;
  font-size: 17px;
}
.dc-ctx-line {
  color: #d4d4d8;
  line-height: 1.45;
}
.dc-ctx-controls select {
  width: 100%;
  margin-top: 4px;
  height: 34px;
  border-radius: 8px;
  background: #0c0c0d;
  border: 1px solid #3f3f46;
  color: #fff;
}
.dc-log {
  font-size: 12px;
  color: #a1a1aa;
  padding-left: 1.2em;
}
.dc-empty {
  padding: 20px;
  color: #71717a;
  text-align: center;
}
</style>
