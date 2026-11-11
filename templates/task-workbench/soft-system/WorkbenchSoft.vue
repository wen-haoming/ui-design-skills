<script setup lang="ts">
import { computed } from 'vue';
import { useSharedWorkbench } from '../shared/useWorkbench';
import { dueLabel, isOverdue } from '../shared/workbench';

defineProps<{ compact?: boolean }>();
const wb = useSharedWorkbench();

const groups = computed(() =>
  wb.statuses.map((s) => ({
    ...s,
    items: wb.filtered.filter((t) => t.status === s.id),
  }))
);
</script>

<template>
  <div class="ss-scene">
    <div class="ss-window" role="application" aria-label="浮动系统层（原创示例）">
      <header class="ss-titlebar">
        <span class="ss-dots" aria-hidden="true"><i /><i /><i /></span>
        <span class="ss-win-title">{{ wb.bench.workspace.name }}</span>
        <span class="ss-asof">asOf {{ wb.asOf }}</span>
      </header>
      <div class="ss-body">
        <aside class="ss-groups" aria-label="分组列表">
          <template v-if="wb.view === 'list'">
            <div v-for="g in groups" :key="g.id" class="ss-group">
              <h3>{{ g.label }} <span class="ss-count">{{ g.items.length }}</span></h3>
              <button
                v-for="t in g.items"
                :key="t.id"
                type="button"
                class="ss-row"
                :class="{ 'ss-row--on': t.id === wb.selectedId, 'ss-row--urgent': isOverdue(t, wb.asOf) }"
                @click="wb.selectTask(t.id)"
              >
                <span class="ss-ring" :data-status="t.status" aria-hidden="true" />
                <span class="ss-row-text">
                  <span class="ss-row-title">{{ t.title }}</span>
                  <span class="ss-row-sub">{{ t.id }} · {{ dueLabel(t, wb.asOf) }}</span>
                </span>
              </button>
            </div>
          </template>
          <template v-else>
            <div class="ss-board-cols">
              <div v-for="g in groups" :key="g.id" class="ss-col">
                <h3>{{ g.label }}</h3>
                <button
                  v-for="t in g.items"
                  :key="t.id"
                  type="button"
                  class="ss-row"
                  :class="{ 'ss-row--on': t.id === wb.selectedId }"
                  @click="wb.selectTask(t.id)"
                >
                  {{ t.title }}
                </button>
              </div>
            </div>
          </template>
        </aside>
        <section class="ss-pane">
          <div class="ss-search">
            <input v-model="wb.filters.q" type="search" placeholder="搜索" aria-label="搜索" />
            <select v-model="wb.filters.status" aria-label="状态">
              <option value="">状态</option>
              <option v-for="s in wb.statuses" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
            <select v-model="wb.filters.assignee" aria-label="负责人">
              <option value="">负责人</option>
              <option v-for="m in wb.members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
            <select v-model="wb.filters.due" aria-label="日期">
              <option value="all">日期</option>
              <option value="overdue">过期</option>
              <option value="today">今天</option>
              <option value="week">一周</option>
            </select>
          </div>
          <p v-if="!wb.filtered.length" class="ss-empty">无匹配任务。<button type="button" @click="wb.clearFilters">清空筛选</button></p>
          <template v-else-if="wb.selected">
            <h2 class="ss-detail-title">{{ wb.selected.title }}</h2>
            <p class="ss-detail-desc">{{ wb.selected.description }}</p>
            <div class="ss-chips">
              <span v-for="tag in wb.selected.tags" :key="tag" class="ss-chip">{{ tag }}</span>
            </div>
            <label class="ss-label">状态</label>
            <select :value="wb.selected.status" @change="wb.setStatus(wb.selected!.id, ($event.target as HTMLSelectElement).value)">
              <option v-for="s in wb.statuses" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
            <h4 class="ss-log-head">活动</h4>
            <ul class="ss-log">
              <li v-for="(a, i) in wb.selected.activity" :key="i">{{ a }}</li>
              <li v-if="!(wb.selected.activity?.length)">（示例，暂无记录）</li>
            </ul>
          </template>
          <p v-else class="ss-hint">从左侧选择任务</p>
          <p class="ss-live" role="status" aria-live="polite">{{ wb.live }}</p>
        </section>
      </div>
      <footer class="ss-capsule" role="toolbar" aria-label="视图与重置">
        <button type="button" :class="{ on: wb.view === 'list' }" @click="wb.view = 'list'">列表分组</button>
        <button type="button" :class="{ on: wb.view === 'board' }" @click="wb.view = 'board'">看板列</button>
        <button type="button" @click="wb.clearFilters">清空筛选</button>
        <button type="button" class="ss-capsule-primary" @click="wb.resetBenchmark">恢复基准</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.ss-scene {
  padding: 20px;
  background: radial-gradient(ellipse at 20% 20%, #dbeafe 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, #e9d5ff 0%, transparent 45%), #e8e8ed;
  border-radius: 16px;
  min-height: 440px;
}
.ss-window {
  max-width: 920px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  min-height: 400px;
  font-family: system-ui, sans-serif;
  font-size: 14px;
  color: #171717;
}
.ss-titlebar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #e4e4e7;
}
.ss-dots i {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d4d4d8;
  margin-right: 4px;
}
.ss-win-title {
  font-weight: 600;
}
.ss-asof {
  margin-left: auto;
  font-size: 12px;
  color: #71717a;
}
.ss-body {
  display: grid;
  grid-template-columns: 240px 1fr;
  flex: 1;
  min-height: 0;
}
@media (max-width: 720px) {
  .ss-body {
    grid-template-columns: 1fr;
  }
  .ss-groups {
    max-height: 200px;
    overflow: auto;
  }
}
.ss-groups {
  padding: 10px 12px;
  border-right: 1px solid #e4e4e7;
  overflow: auto;
}
.ss-group h3 {
  margin: 12px 0 6px;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #71717a;
  font-weight: 600;
}
.ss-count {
  font-weight: 400;
}
.ss-board-cols {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.ss-col h3 {
  font-size: 11px;
  color: #71717a;
}
.ss-row {
  display: flex;
  gap: 8px;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: none;
  border-radius: 12px;
  background: transparent;
  font: inherit;
  cursor: pointer;
  margin-bottom: 2px;
}
.ss-row--on {
  background: #f4f4f5;
}
.ss-row--urgent .ss-row-sub {
  color: #c2410c;
}
.ss-ring {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #a1a1aa;
  margin-top: 4px;
  flex-shrink: 0;
}
.ss-ring[data-status='done'] {
  border-color: #22c55e;
  background: #22c55e;
}
.ss-ring[data-status='doing'] {
  border-color: #3b82f6;
}
.ss-row-title {
  display: block;
  font-weight: 600;
  font-size: 13px;
}
.ss-row-sub {
  font-size: 11px;
  color: #71717a;
}
.ss-pane {
  padding: 14px 16px;
  overflow: auto;
}
.ss-search {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.ss-search input,
.ss-search select {
  height: 32px;
  border: 1px solid #e4e4e7;
  border-radius: 999px;
  padding: 0 12px;
  font: inherit;
  background: #fff;
}
.ss-detail-title {
  margin: 0 0 8px;
  font-size: 20px;
  letter-spacing: -0.02em;
}
.ss-detail-desc {
  color: #52525b;
  line-height: 1.5;
}
.ss-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 10px 0;
}
.ss-chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f4f4f5;
}
.ss-label {
  font-size: 12px;
  display: block;
  margin-top: 8px;
}
.ss-pane select {
  width: 100%;
  max-width: 200px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e4e4e7;
}
.ss-log-head {
  margin: 16px 0 6px;
  font-size: 12px;
  color: #71717a;
}
.ss-log {
  margin: 0;
  padding-left: 1.2em;
  font-size: 13px;
  color: #52525b;
}
.ss-capsule {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 14px 14px;
  border-top: 1px solid #e4e4e7;
}
.ss-capsule button {
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid #e4e4e7;
  background: #fff;
  font: inherit;
  cursor: pointer;
}
.ss-capsule button.on {
  background: #171717;
  color: #fff;
  border-color: #171717;
}
.ss-capsule-primary {
  margin-left: auto;
  background: #171717 !important;
  color: #fff !important;
  border-color: #171717 !important;
}
.ss-live {
  font-size: 12px;
  color: #0d7a3e;
  min-height: 1.2em;
}
.ss-empty,
.ss-hint {
  color: #71717a;
  padding: 16px 0;
}
</style>
