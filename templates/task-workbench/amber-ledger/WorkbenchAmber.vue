<script setup lang="ts">
import FacetPanel from '../shared/FacetPanel.vue';
import { useSharedWorkbench } from '../shared/useWorkbench';
import { dueLabel, isOverdue } from '../shared/workbench';

defineProps<{ compact?: boolean }>();
const wb = useSharedWorkbench();
</script>

<template>
  <div class="am-root" :class="{ 'am-root--compact': compact }">
    <div class="am-ledger" role="application" aria-label="琥珀台账（原创示例）">
      <header class="am-head">
        <div class="am-brand">
          <h2 class="am-title">{{ wb.bench.workspace.name }}</h2>
          <p class="am-sub">基准 {{ wb.asOf }} · 示例数据</p>
        </div>
        <div class="am-kpi" aria-live="polite">
          <div class="am-kpi-cell"><em>进行中</em><strong>{{ wb.metrics.inProgress }}</strong></div>
          <div class="am-kpi-cell"><em>评审</em><strong>{{ wb.metrics.review }}</strong></div>
          <div class="am-kpi-cell"><em>已完成</em><strong>{{ wb.metrics.done }}</strong></div>
          <div class="am-kpi-cell am-kpi-cell--overdue"><em>过期</em><strong>{{ wb.metrics.overdue }}</strong></div>
        </div>
      </header>
      <nav class="am-tabs" aria-label="主导航">
        <button type="button" class="am-tab am-tab--on" aria-current="page">队列</button>
        <button type="button" class="am-tab" disabled>简报</button>
      </nav>
      <p class="am-live" role="status" aria-live="polite">{{ wb.live }}</p>
      <div class="am-workspace">
        <aside class="am-facets" aria-label="分面筛选">
          <FacetPanel
            :bench="wb.bench"
            :filters="wb.filters"
            :facets="wb.facets"
            :compact="compact"
            class="am-facet-panel"
            @update:q="wb.filters.q = $event"
            @update:status="wb.filters.status = $event"
            @update:assignee="wb.filters.assignee = $event"
            @update:due="wb.filters.due = $event"
            @clear="wb.clearFilters()"
          />
          <div class="am-facet-foot">
            <button type="button" class="am-link" @click="wb.resetBenchmark">恢复基准</button>
          </div>
        </aside>
        <section class="am-queue" aria-label="任务队列">
          <div v-if="!wb.filtered.length" class="am-empty">
            无匹配任务。
            <button type="button" @click="wb.clearFilters">清空筛选</button>
          </div>
          <table v-else class="am-table">
            <thead>
              <tr>
                <th>编号</th>
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
                :class="{ 'am-row--sel': t.id === wb.selectedId }"
                tabindex="0"
                @click="wb.selectTask(t.id)"
                @keydown.enter="wb.selectTask(t.id)"
              >
                <td class="am-num">{{ t.id }}</td>
                <td class="am-cell-title">{{ t.title }}</td>
                <td>
                  <span class="am-status" :data-status="t.status">
                    {{ wb.statuses.find((s) => s.id === t.status)?.label }}
                  </span>
                </td>
                <td class="am-num">
                  {{ t.assignees.map((id) => wb.membersById[id]?.initials).join(' ') }}
                </td>
                <td class="am-num" :class="{ 'am-late': isOverdue(t, wb.asOf) }">{{ dueLabel(t, wb.asOf) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <aside v-if="wb.selected" class="am-detail" aria-label="任务详情">
          <h3>{{ wb.selected.title }}</h3>
          <p class="am-meta">
            <span class="am-num">{{ wb.selected.id }}</span>
            · {{ wb.selected.priority }} 优先级
          </p>
          <p class="am-desc">{{ wb.selected.description }}</p>
          <label class="am-label" for="am-st">状态</label>
          <select
            id="am-st"
            :value="wb.selected.status"
            @change="wb.setStatus(wb.selected.id, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="s in wb.statuses" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
          <h4 class="am-log-head">活动</h4>
          <ul class="am-log">
            <li v-for="(a, i) in wb.selected.activity" :key="i">{{ a }}</li>
            <li v-if="!(wb.selected.activity?.length)">暂无活动（示例）</li>
          </ul>
        </aside>
        <aside v-else class="am-detail am-detail--empty" aria-label="任务详情">
          <p>选择队列中的一行以查看详情。</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.am-root {
  --am-bg: #12100e;
  --am-panel: #181614;
  --am-text: #f3efe8;
  --am-muted: #9c958c;
  --am-line: rgba(166, 124, 53, 0.35);
  --am-amber: #a67c35;
  --am-magenta: #e879f9;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 12px;
  color: var(--am-text);
  font-variant-numeric: tabular-nums;
}
.am-ledger {
  min-height: 420px;
  background: var(--am-bg);
  border: 1px solid var(--am-line);
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  container-type: inline-size;
  container-name: am-ledger;
}
.am-root--compact .am-ledger {
  min-height: 360px;
}
.am-head {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  align-items: flex-end;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--am-line);
}
.am-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.am-sub {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--am-muted);
}
.am-kpi {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.am-kpi-cell {
  padding: 4px 8px;
  border: 1px solid var(--am-line);
  min-width: 56px;
  text-align: center;
}
.am-kpi-cell em {
  display: block;
  font-style: normal;
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--am-muted);
}
.am-kpi-cell strong {
  display: block;
  font-size: 15px;
  font-weight: 600;
  margin-top: 2px;
}
.am-kpi-cell--overdue strong {
  color: var(--am-magenta);
}
.am-tabs {
  display: flex;
  gap: 0;
  padding: 0 14px;
  border-bottom: 1px solid var(--am-line);
}
.am-tab {
  padding: 8px 14px;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  color: var(--am-muted);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.am-tab--on {
  color: var(--am-text);
  border-bottom-color: var(--am-amber);
  font-weight: 600;
}
.am-tab:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.am-live {
  margin: 0;
  padding: 3px 14px;
  font-size: 11px;
  color: #86c9a0;
  min-height: 1.1em;
  border-bottom: 1px solid var(--am-line);
}
.am-workspace {
  display: grid;
  grid-template-columns: minmax(160px, 188px) minmax(0, 1fr) minmax(200px, 260px);
  flex: 1;
  min-height: 0;
}
.am-facets {
  padding: 10px 10px 12px;
  border-right: 1px solid var(--am-line);
  background: var(--am-panel);
  overflow: auto;
}
.am-facet-panel :deep(input[type='search']) {
  background: var(--am-bg);
  border: 1px solid var(--am-line);
  color: var(--am-text);
  border-radius: 0;
}
.am-facet-panel :deep(.wb-facet-result) {
  color: var(--am-muted);
}
.am-facet-panel :deep(.wb-facet-group legend) {
  color: var(--am-muted);
}
.am-facet-panel :deep(.wb-facet-opt) {
  color: var(--am-text);
}
.am-facet-panel :deep(.wb-facet-opt em) {
  color: var(--am-muted);
}
.am-facet-panel :deep(.wb-facet-clear) {
  background: var(--am-bg);
  border: 1px solid var(--am-line);
  color: var(--am-text);
  border-radius: 0;
}
.am-facet-foot {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--am-line);
}
.am-link {
  padding: 0;
  border: none;
  background: none;
  color: var(--am-muted);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.am-queue {
  overflow: auto;
  min-width: 0;
}
.am-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.am-table th,
.am-table td {
  text-align: left;
  padding: 5px 10px;
  border-bottom: 1px solid var(--am-line);
  vertical-align: top;
}
.am-table th {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--am-muted);
  background: var(--am-panel);
  position: sticky;
  top: 0;
  z-index: 1;
}
.am-num {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}
.am-cell-title {
  font-variant-numeric: normal;
  max-width: 28ch;
  overflow-wrap: break-word;
}
.am-row--sel {
  background: rgba(166, 124, 53, 0.12);
  box-shadow: inset 0 0 0 1px rgba(166, 124, 53, 0.45);
}
.am-status {
  font-size: 11px;
  color: var(--am-muted);
}
.am-late {
  color: #f0a8b8;
  font-weight: 600;
}
.am-detail {
  border-left: 1px solid var(--am-line);
  padding: 12px 12px 16px;
  overflow: auto;
  background: var(--am-panel);
}
.am-detail--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--am-muted);
  text-align: center;
}
.am-detail h3 {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  word-break: normal;
  overflow-wrap: break-word;
}
.am-meta {
  margin: 0 0 10px;
  font-size: 11px;
  color: var(--am-muted);
}
.am-desc {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.55;
  color: #ddd8cf;
  font-variant-numeric: normal;
  overflow-wrap: break-word;
}
.am-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--am-muted);
  margin-bottom: 4px;
}
.am-detail select {
  width: 100%;
  height: 28px;
  border: 1px solid var(--am-line);
  background: var(--am-bg);
  color: var(--am-text);
  font: inherit;
  padding: 0 6px;
}
.am-log-head {
  margin: 12px 0 6px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--am-muted);
  font-weight: 600;
}
.am-log {
  margin: 0;
  padding-left: 1.1em;
  font-size: 11px;
  line-height: 1.5;
  color: var(--am-muted);
  font-variant-numeric: normal;
}
.am-empty {
  padding: 24px 14px;
  text-align: center;
  color: var(--am-muted);
}
.am-empty button {
  margin-left: 6px;
  border: none;
  background: none;
  color: var(--am-text);
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
}
@container am-ledger (max-width: 820px) {
  .am-workspace {
    grid-template-columns: minmax(148px, 176px) minmax(0, 1fr);
  }
  .am-detail {
    grid-column: 1 / -1;
    border-left: none;
    border-top: 1px solid var(--am-line);
  }
}
@container am-ledger (max-width: 520px) {
  .am-workspace {
    grid-template-columns: 1fr;
  }
  .am-facets {
    border-right: none;
    border-bottom: 1px solid var(--am-line);
  }
  .am-queue {
    max-height: 240px;
  }
}
</style>
