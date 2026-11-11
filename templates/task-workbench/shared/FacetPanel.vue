<script setup lang="ts">
import type { Benchmark, FilterState } from './types';
import type { FacetCounts } from './facets';

defineProps<{
  bench: Benchmark;
  filters: FilterState;
  facets: FacetCounts;
  compact?: boolean;
}>();

const emit = defineEmits<{
  'update:q': [string];
  'update:status': [string];
  'update:assignee': [string];
  'update:due': [FilterState['due']];
  clear: [];
}>();
</script>

<template>
  <div class="wb-facet" :class="{ 'wb-facet--compact': compact }" role="search">
    <input
      :value="filters.q"
      type="search"
      placeholder="搜索标题、描述、标签"
      aria-label="搜索"
      @input="emit('update:q', ($event.target as HTMLInputElement).value)"
    />
    <p class="wb-facet-result" role="status" aria-live="polite">
      匹配 {{ facets.resultCount }} / {{ bench.tasks.length }} 条
    </p>
    <fieldset class="wb-facet-group">
      <legend>状态</legend>
      <label v-for="s in bench.statuses" :key="s.id" class="wb-facet-opt">
        <input
          type="radio"
          name="status"
          :value="s.id"
          :checked="filters.status === s.id"
          @change="emit('update:status', s.id)"
        />
        <span>{{ s.label }}</span>
        <em>{{ facets.status[s.id] ?? 0 }}</em>
      </label>
      <label class="wb-facet-opt">
        <input
          type="radio"
          name="status"
          value=""
          :checked="!filters.status"
          @change="emit('update:status', '')"
        />
        <span>全部</span>
        <em>{{ facets.statusPoolSize }}</em>
      </label>
    </fieldset>
    <fieldset class="wb-facet-group">
      <legend>负责人</legend>
      <label v-for="m in bench.members" :key="m.id" class="wb-facet-opt">
        <input
          type="radio"
          name="assignee"
          :value="m.id"
          :checked="filters.assignee === m.id"
          @change="emit('update:assignee', m.id)"
        />
        <span>{{ m.name }}</span>
        <em>{{ facets.assignee[m.id] ?? 0 }}</em>
      </label>
      <label class="wb-facet-opt">
        <input
          type="radio"
          name="assignee"
          value=""
          :checked="!filters.assignee"
          @change="emit('update:assignee', '')"
        />
        <span>全部</span>
      </label>
    </fieldset>
    <fieldset class="wb-facet-group">
      <legend>到期</legend>
      <label class="wb-facet-opt">
        <input type="radio" name="due" value="all" :checked="filters.due === 'all'" @change="emit('update:due', 'all')" />
        <span>全部</span>
        <em>{{ facets.due.all }}</em>
      </label>
      <label class="wb-facet-opt">
        <input type="radio" name="due" value="overdue" :checked="filters.due === 'overdue'" @change="emit('update:due', 'overdue')" />
        <span>已过期</span>
        <em>{{ facets.due.overdue }}</em>
      </label>
      <label class="wb-facet-opt">
        <input type="radio" name="due" value="today" :checked="filters.due === 'today'" @change="emit('update:due', 'today')" />
        <span>今天</span>
        <em>{{ facets.due.today }}</em>
      </label>
      <label class="wb-facet-opt">
        <input type="radio" name="due" value="week" :checked="filters.due === 'week'" @change="emit('update:due', 'week')" />
        <span>一周内</span>
        <em>{{ facets.due.week }}</em>
      </label>
    </fieldset>
    <button type="button" class="wb-facet-clear" @click="emit('clear')">清空筛选</button>
  </div>
</template>

<style scoped>
.wb-facet {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
}
.wb-facet input[type='search'] {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  font: inherit;
}
.wb-facet-result {
  margin: 0;
  font-size: 12px;
  color: #52525b;
}
.wb-facet-group {
  border: none;
  margin: 0;
  padding: 0;
}
.wb-facet-group legend {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #71717a;
  margin-bottom: 6px;
}
.wb-facet-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  cursor: pointer;
}
.wb-facet-opt em {
  margin-left: auto;
  font-style: normal;
  font-variant-numeric: tabular-nums;
  color: #71717a;
  font-size: 12px;
}
.wb-facet-clear {
  align-self: flex-start;
  padding: 6px 12px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font: inherit;
}
</style>
