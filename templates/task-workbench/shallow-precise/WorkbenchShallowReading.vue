<script setup lang="ts">
import { computed } from 'vue';
import { useSharedWorkbench } from '../shared/useWorkbench';
import { dueLabel, isOverdue } from '../shared/workbench';
import FilterBar from '../shared/FilterBar.vue';

const wb = useSharedWorkbench();

const tags = computed(() => wb.selected?.tags ?? []);
</script>

<template>
  <div class="rs-root" role="application" aria-label="阅读分栏（浅色精密）">
    <header class="rs-head">
      <h2>{{ wb.bench.workspace.subtitle }}</h2>
      <p>基准 {{ wb.asOf }} · 已完成 {{ wb.metrics.done }}</p>
    </header>
    <FilterBar class="rs-bar" :wb="wb" :show-view-toggle="false" />
    <p class="rs-live" role="status" aria-live="polite">{{ wb.live }}</p>
    <div class="rs-split">
      <nav class="rs-index" aria-label="任务索引">
        <p v-if="!wb.filtered.length" class="rs-empty">
          无匹配任务。
          <button type="button" @click="wb.clearFilters">清空筛选</button>
        </p>
        <button
          v-for="t in wb.filtered"
          :key="t.id"
          type="button"
          class="rs-row"
          :class="{ 'rs-row--on': t.id === wb.selectedId, 'rs-row--urgent': isOverdue(t, wb.asOf) }"
          @click="wb.selectTask(t.id)"
        >
          <span class="rs-row-id">{{ t.id }}</span>
          <span class="rs-row-title">{{ t.title }}</span>
          <span class="rs-row-due">{{ dueLabel(t, wb.asOf) }}</span>
        </button>
      </nav>
      <article v-if="wb.selected" class="rs-read" aria-label="阅读详情">
        <h3 class="rs-title">{{ wb.selected.title }}</h3>
        <p class="rs-meta">
          <span>{{ wb.selected.id }}</span>
          <span>{{ wb.statuses.find((s) => s.id === wb.selected!.status)?.label }}</span>
          <span v-for="id in wb.selected.assignees" :key="id">{{ wb.membersById[id]?.name }}</span>
          <span>到期 {{ dueLabel(wb.selected, wb.asOf) }}</span>
        </p>
        <p class="rs-tags">
          <span v-for="tag in tags" :key="tag" class="rs-tag">{{ tag }}</span>
        </p>
        <div class="rs-prose">
          <p>{{ wb.selected.description }}</p>
          <h4>活动</h4>
          <ul>
            <li v-for="(a, i) in wb.selected.activity" :key="i">{{ a }}</li>
            <li v-if="!(wb.selected.activity?.length)">（示例，暂无记录）</li>
          </ul>
        </div>
        <label class="rs-label">状态</label>
        <select
          :value="wb.selected.status"
          @change="wb.setStatus(wb.selected!.id, ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="s in wb.statuses" :key="s.id" :value="s.id">{{ s.label }}</option>
        </select>
      </article>
      <p v-else class="rs-hint">从左侧选择任务</p>
    </div>
  </div>
</template>

<style scoped>
.rs-root {
  --rs-bg: #fafafa;
  --rs-border: #e5e5e5;
  font-size: 14px;
  color: #171717;
  border: 1px solid var(--rs-border);
  border-radius: 14px;
  padding: 12px;
  background: var(--rs-bg);
}
.rs-head h2 {
  margin: 0;
  font-size: 18px;
}
.rs-head p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #52525b;
}
.rs-bar {
  margin: 10px 0;
}
.rs-split {
  display: grid;
  grid-template-columns: minmax(160px, 240px) minmax(0, 1fr);
  gap: 12px;
  min-height: 360px;
  border-top: 1px solid var(--rs-border);
  padding-top: 10px;
}
@media (max-width: 720px) {
  .rs-split {
    grid-template-columns: 1fr;
  }
}
.rs-index {
  border-right: 1px solid var(--rs-border);
  overflow: auto;
  max-height: 480px;
}
@media (max-width: 720px) {
  .rs-index {
    border-right: none;
    border-bottom: 1px solid var(--rs-border);
    max-height: 200px;
  }
}
.rs-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 6px;
  width: 100%;
  text-align: left;
  padding: 8px;
  border: none;
  border-bottom: 1px solid var(--rs-border);
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.rs-row--on {
  background: #fff;
  box-shadow: inset 2px 0 0 #171717;
}
.rs-row-id {
  font-size: 11px;
  color: #71717a;
}
.rs-read {
  min-width: 0;
}
.rs-title {
  margin: 0 0 8px;
  font-size: 22px;
  line-height: 1.2;
}
.rs-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #52525b;
  margin: 0 0 12px;
}
.rs-tag {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid var(--rs-border);
  border-radius: 6px;
}
.rs-prose {
  max-width: 42rem;
  line-height: 1.55;
}
.rs-prose h4 {
  font-size: 13px;
  margin: 16px 0 6px;
}
.rs-label {
  display: block;
  margin-top: 14px;
  font-size: 12px;
}
.rs-empty,
.rs-hint {
  color: #71717a;
  padding: 12px;
}
.rs-live {
  font-size: 12px;
  color: #0d7a3e;
  min-height: 1.2em;
  margin: 0 0 6px;
}
</style>
