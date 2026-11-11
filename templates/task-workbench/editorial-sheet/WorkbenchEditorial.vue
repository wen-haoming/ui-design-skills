<script setup lang="ts">
import FacetPanel from '../shared/FacetPanel.vue';
import { useSharedWorkbench } from '../shared/useWorkbench';
import { dueLabel, isOverdue } from '../shared/workbench';

defineProps<{ compact?: boolean }>();
const wb = useSharedWorkbench();
</script>

<template>
  <div class="ed-root" :class="{ 'ed-root--compact': compact }">
    <div class="ed-sheet" role="application" aria-label="编辑纸页工作台（原创示例）">
      <header class="ed-mast">
        <div class="ed-mast-text">
          <p class="ed-kicker">{{ wb.bench.workspace.name }}</p>
          <h2 class="ed-heading">{{ wb.bench.workspace.subtitle }}</h2>
          <p class="ed-asof">基准日 {{ wb.asOf }} · 示例数据</p>
        </div>
        <div class="ed-metrics" aria-live="polite">
          <div class="ed-metric"><span>进行中</span><strong>{{ wb.metrics.inProgress }}</strong></div>
          <div class="ed-metric"><span>评审</span><strong>{{ wb.metrics.review }}</strong></div>
          <div class="ed-metric"><span>已完成</span><strong>{{ wb.metrics.done }}</strong></div>
          <div class="ed-metric ed-metric--warn"><span>过期</span><strong>{{ wb.metrics.overdue }}</strong></div>
        </div>
      </header>
      <p class="ed-live" role="status" aria-live="polite">{{ wb.live }}</p>
      <div class="ed-body">
        <aside class="ed-facets" aria-label="分面筛选">
          <FacetPanel
            :bench="wb.bench"
            :filters="wb.filters"
            :facets="wb.facets"
            :compact="compact"
            class="ed-facet-panel"
            @update:q="wb.filters.q = $event"
            @update:status="wb.filters.status = $event"
            @update:assignee="wb.filters.assignee = $event"
            @update:due="wb.filters.due = $event"
            @clear="wb.clearFilters()"
          />
          <div class="ed-facet-actions">
            <button type="button" class="ed-btn-quiet" @click="wb.resetBenchmark">恢复基准</button>
          </div>
        </aside>
        <section class="ed-index" aria-label="任务索引">
          <div v-if="!wb.filtered.length" class="ed-empty">
            无匹配任务。
            <button type="button" @click="wb.clearFilters">清空筛选</button>
          </div>
          <ul v-else class="ed-rows" role="list">
            <li
              v-for="t in wb.filtered"
              :key="t.id"
              role="listitem"
              class="ed-row"
              :class="{ 'ed-row--sel': t.id === wb.selectedId }"
              tabindex="0"
              @click="wb.selectTask(t.id)"
              @keydown.enter="wb.selectTask(t.id)"
            >
              <span class="ed-row-id">{{ t.id }}</span>
              <span class="ed-row-title">{{ t.title }}</span>
              <span class="ed-row-status" :data-status="t.status">
                {{ wb.statuses.find((s) => s.id === t.status)?.label }}
              </span>
              <span class="ed-row-who">
                {{ t.assignees.map((id) => wb.membersById[id]?.initials).join(', ') }}
              </span>
              <span class="ed-row-due" :class="{ 'ed-row-due--late': isOverdue(t, wb.asOf) }">
                {{ dueLabel(t, wb.asOf) }}
              </span>
            </li>
          </ul>
        </section>
        <article v-if="wb.selected" class="ed-reading" aria-label="任务阅读栏">
          <h3 class="ed-read-title">{{ wb.selected.title }}</h3>
          <div class="ed-meta" role="group" aria-label="任务元数据">
            <p class="ed-meta-row">
              <span class="ed-meta-label">编号</span>
              <span class="ed-meta-val ed-num">{{ wb.selected.id }}</span>
            </p>
            <p class="ed-meta-row">
              <span class="ed-meta-label">优先级</span>
              <span class="ed-meta-val">{{ wb.selected.priority }}</span>
            </p>
            <p class="ed-meta-row">
              <span class="ed-meta-label">负责人</span>
              <span class="ed-meta-val">
                {{
                  wb.selected.assignees
                    .map((id) => wb.membersById[id]?.name)
                    .filter(Boolean)
                    .join('、') || '—'
                }}
              </span>
            </p>
            <p class="ed-meta-row">
              <span class="ed-meta-label">到期</span>
              <span class="ed-meta-val ed-num" :class="{ 'ed-meta--late': isOverdue(wb.selected, wb.asOf) }">
                {{ dueLabel(wb.selected, wb.asOf) }}
              </span>
            </p>
          </div>
          <div class="ed-measure">
            <p class="ed-desc">{{ wb.selected.description }}</p>
            <label class="ed-label" for="ed-status">状态</label>
            <select
              id="ed-status"
              :value="wb.selected.status"
              @change="wb.setStatus(wb.selected.id, ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="s in wb.statuses" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
            <h4 class="ed-activity-head">活动</h4>
            <ul class="ed-activity">
              <li v-for="(a, i) in wb.selected.activity" :key="i">{{ a }}</li>
              <li v-if="!(wb.selected.activity?.length)">暂无活动（示例）</li>
            </ul>
          </div>
        </article>
        <aside v-else class="ed-reading ed-reading--hint" aria-label="任务阅读栏">
          <p>从索引中选择一条任务以阅读详情。</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ed-root {
  --ed-bg: #f4f1ea;
  --ed-panel: #faf8f4;
  --ed-text: #1a1814;
  --ed-muted: #6b6560;
  --ed-border: #d8d3c8;
  --ed-warn: #9a3412;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  color: var(--ed-text);
  line-height: 1.5;
}
.ed-sheet {
  min-height: 420px;
  border: 1px solid var(--ed-border);
  border-radius: 4px;
  background: var(--ed-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  container-type: inline-size;
  container-name: ed-sheet;
}
.ed-root--compact .ed-sheet {
  min-height: 360px;
}
.ed-mast {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: space-between;
  align-items: flex-end;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--ed-border);
  background: var(--ed-panel);
}
.ed-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ed-muted);
}
.ed-heading {
  margin: 4px 0 0;
  font-size: 17px;
  font-weight: 600;
  font-family: Georgia, 'Times New Roman', serif;
}
.ed-asof {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--ed-muted);
}
.ed-metrics {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.ed-metric {
  border: 1px solid var(--ed-border);
  border-radius: 2px;
  padding: 4px 10px;
  font-size: 12px;
  background: var(--ed-bg);
}
.ed-metric strong {
  margin-left: 6px;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}
.ed-metric--warn strong {
  color: var(--ed-warn);
}
.ed-live {
  margin: 0;
  padding: 4px 16px;
  font-size: 12px;
  color: #3d6b4f;
  min-height: 1.2em;
  border-bottom: 1px solid var(--ed-border);
  background: var(--ed-panel);
}
.ed-body {
  display: grid;
  grid-template-columns: minmax(168px, 200px) minmax(0, 1fr) minmax(220px, 320px);
  flex: 1;
  min-height: 0;
}
.ed-facets {
  padding: 12px 12px 14px;
  border-right: 1px solid var(--ed-border);
  background: var(--ed-panel);
  overflow: auto;
}
.ed-facet-panel :deep(input[type='search']) {
  border-color: var(--ed-border);
  background: var(--ed-bg);
  border-radius: 2px;
}
.ed-facet-panel :deep(.wb-facet-result) {
  color: var(--ed-muted);
}
.ed-facet-panel :deep(.wb-facet-group legend) {
  color: var(--ed-muted);
  font-size: 10px;
}
.ed-facet-panel :deep(.wb-facet-clear) {
  border-color: var(--ed-border);
  background: var(--ed-bg);
  border-radius: 2px;
}
.ed-facet-actions {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--ed-border);
}
.ed-btn-quiet {
  padding: 5px 10px;
  border: 1px solid var(--ed-border);
  border-radius: 2px;
  background: var(--ed-bg);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.ed-index {
  border-right: 1px solid var(--ed-border);
  overflow: auto;
  min-width: 0;
}
.ed-rows {
  list-style: none;
  margin: 0;
  padding: 0;
}
.ed-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    'id title status'
    'id who due';
  gap: 2px 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--ed-border);
  cursor: pointer;
}
.ed-row:hover {
  background: rgba(26, 24, 20, 0.03);
}
.ed-row--sel {
  background: #ebe6dc;
  box-shadow: inset 3px 0 0 #1a1814;
}
.ed-row-id {
  grid-area: id;
  font-size: 11px;
  color: var(--ed-muted);
  font-variant-numeric: tabular-nums;
  align-self: start;
}
.ed-row-title {
  grid-area: title;
  font-size: 13px;
  font-weight: 500;
}
.ed-row-status {
  grid-area: status;
  font-size: 11px;
  color: var(--ed-muted);
  justify-self: end;
}
.ed-row-who {
  grid-area: who;
  font-size: 11px;
  color: var(--ed-muted);
}
.ed-row-due {
  grid-area: due;
  font-size: 11px;
  justify-self: end;
  font-variant-numeric: tabular-nums;
}
.ed-row-due--late {
  color: var(--ed-warn);
  font-weight: 600;
}
.ed-reading {
  padding: 16px 18px 20px;
  overflow: auto;
  background: var(--ed-bg);
}
.ed-reading--hint {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ed-muted);
  font-size: 13px;
  text-align: center;
}
.ed-read-title {
  margin: 0 0 12px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 26px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.ed-meta {
  margin: 0 0 18px;
  padding: 0 0 14px;
  border-bottom: 1px solid var(--ed-border);
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
}
.ed-meta-row {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin: 0;
}
.ed-meta-label {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ed-muted);
  font-weight: 500;
}
.ed-meta-val {
  font-size: 12px;
}
.ed-num {
  font-variant-numeric: tabular-nums;
}
.ed-meta--late {
  color: var(--ed-warn);
  font-weight: 600;
}
.ed-measure {
  max-width: 42rem;
}
.ed-desc {
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--ed-text);
}
.ed-label {
  display: block;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ed-muted);
  margin-bottom: 6px;
}
.ed-reading select {
  width: 100%;
  max-width: 16rem;
  height: 32px;
  border: 1px solid var(--ed-border);
  border-radius: 2px;
  background: var(--ed-panel);
  font: inherit;
  padding: 0 8px;
}
.ed-activity-head {
  margin: 18px 0 8px;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ed-muted);
  font-weight: 600;
}
.ed-activity {
  margin: 0;
  padding-left: 1.15em;
  font-size: 14px;
  line-height: 1.6;
  color: #3d3832;
}
.ed-empty {
  padding: 28px 16px;
  text-align: center;
  color: var(--ed-muted);
}
.ed-empty button {
  margin-left: 8px;
  border: none;
  background: none;
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
  color: var(--ed-text);
}
@container ed-sheet (max-width: 860px) {
  .ed-body {
    grid-template-columns: minmax(148px, 180px) minmax(0, 1fr);
  }
  .ed-reading {
    grid-column: 1 / -1;
    border-top: 1px solid var(--ed-border);
  }
}
@container ed-sheet (max-width: 560px) {
  .ed-body {
    grid-template-columns: 1fr;
  }
  .ed-facets {
    border-right: none;
    border-bottom: 1px solid var(--ed-border);
  }
  .ed-index {
    border-right: none;
  }
}
</style>
