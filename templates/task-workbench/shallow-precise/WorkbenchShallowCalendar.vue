<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSharedWorkbench } from '../shared/useWorkbench';
import { dueLabel, isOverdue } from '../shared/workbench';
import FilterBar from '../shared/FilterBar.vue';
import { buildAgendaWeeks, asOfMonth, MONTH_CHIPS } from '../shared/calendar';

const wb = useSharedWorkbench();
const month = ref(asOfMonth(wb.asOf));

const weeks = computed(() => buildAgendaWeeks(wb.filtered, wb.asOf, month.value));

const upcoming = computed(() =>
  [...wb.filtered]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5)
);
</script>

<template>
  <div class="ca-root" role="application" aria-label="日程议程（浅色精密）">
    <header class="ca-head">
      <h2>按到期组织 · {{ wb.bench.workspace.name }}</h2>
      <p>基准 {{ wb.asOf }}（{{ wb.bench.timezone }}）· 仅展示过滤后的 10 条任务</p>
    </header>
    <FilterBar class="ca-bar" :wb="wb" :show-view-toggle="false" />
    <div class="ca-chips" role="tablist" aria-label="月份">
      <button
        v-for="m in MONTH_CHIPS"
        :key="m"
        type="button"
        role="tab"
        :aria-selected="month === m"
        :class="{ 'is-on': month === m }"
        @click="month = m"
      >
        {{ m }}
      </button>
    </div>
    <div class="ca-body">
      <section class="ca-agenda" aria-label="周行议程">
        <div v-for="w in weeks" :key="w.id" class="ca-week">
          <div class="ca-week-head">
            <strong>{{ w.label }}</strong>
            <span>{{ w.range }}</span>
          </div>
          <p v-if="w.empty" class="ca-week-empty">本周无任务（空槽保留）</p>
          <button
            v-for="t in w.tasks"
            :key="t.id"
            type="button"
            class="ca-tile"
            :class="{ 'ca-tile--on': t.id === wb.selectedId, 'ca-tile--over': isOverdue(t, wb.asOf) }"
            @click="wb.selectTask(t.id)"
          >
            <span>{{ t.id }}</span>
            <span>{{ t.title }}</span>
            <span>{{ dueLabel(t, wb.asOf) }}</span>
          </button>
        </div>
      </section>
      <aside class="ca-side">
        <h3>即将到期</h3>
        <ul>
          <li v-for="t in upcoming" :key="t.id">
            {{ t.due }} · {{ t.title }}
          </li>
        </ul>
        <template v-if="wb.selected">
          <h3>选中详情</h3>
          <p class="ca-detail-title">{{ wb.selected.title }}</p>
          <p class="ca-detail-meta">{{ wb.selected.id }} · {{ wb.selected.status }}</p>
          <p class="ca-detail-desc">{{ wb.selected.description }}</p>
          <label>状态</label>
          <select
            :value="wb.selected.status"
            @change="wb.setStatus(wb.selected!.id, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="s in wb.statuses" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
        </template>
      </aside>
    </div>
    <p class="ca-live" role="status" aria-live="polite">{{ wb.live }}</p>
  </div>
</template>

<style scoped>
.ca-root {
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  padding: 12px;
  background: #fafafa;
  font-size: 13px;
}
.ca-head h2 {
  margin: 0;
  font-size: 18px;
}
.ca-head p {
  margin: 4px 0;
  font-size: 12px;
  color: #52525b;
}
.ca-chips {
  display: flex;
  gap: 8px;
  margin: 10px 0;
  flex-wrap: wrap;
}
.ca-chips button {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #e5e5e5;
  background: #fff;
  font: inherit;
  cursor: pointer;
}
.ca-chips button.is-on {
  background: #171717;
  color: #fff;
}
.ca-body {
  display: grid;
  grid-template-columns: 1fr minmax(200px, 260px);
  gap: 12px;
}
@media (max-width: 720px) {
  .ca-body {
    grid-template-columns: 1fr;
  }
}
.ca-week {
  border-bottom: 1px solid #e5e5e5;
  padding: 8px 0;
}
.ca-week-head {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #52525b;
  margin-bottom: 6px;
}
.ca-tile {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  width: 100%;
  text-align: left;
  padding: 8px;
  margin-bottom: 4px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: #fff;
  font: inherit;
  cursor: pointer;
}
.ca-tile--on {
  border-color: #171717;
}
.ca-tile--over span:last-child {
  color: #b42318;
  font-weight: 600;
}
.ca-week-empty {
  color: #71717a;
  font-size: 12px;
  margin: 0;
}
.ca-side {
  border-left: 1px solid #e5e5e5;
  padding-left: 12px;
}
.ca-side ul {
  margin: 0 0 12px;
  padding-left: 1.2em;
  font-size: 12px;
}
.ca-detail-desc {
  max-width: 36ch;
  line-height: 1.45;
}
.ca-live {
  font-size: 12px;
  color: #0d7a3e;
  margin-top: 8px;
}
</style>
