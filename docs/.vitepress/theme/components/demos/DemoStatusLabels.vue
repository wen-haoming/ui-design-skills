<script setup lang="ts">
import { ref, computed } from 'vue';

const items = [
  { id: 1, name: '示例工单 A', status: 'ok', label: '已完成' },
  { id: 2, name: '示例工单 B', status: 'warn', label: '待处理' },
  { id: 3, name: '示例工单 C', status: 'err', label: '失败' },
  { id: 4, name: '示例工单 D', status: 'ok', label: '已完成' },
];
const filter = ref('all');
const btnOn = { padding: '6px 10px', border: '1px solid var(--vp-c-border)', borderRadius: '7px', background: '#141414', color: '#fff' };
const btnOff = { padding: '6px 10px', border: '1px solid var(--vp-c-border)', borderRadius: '7px', background: '#fff', color: 'inherit' };

const visible = computed(() => items.filter((i) => filter.value === 'all' || i.status === filter.value));

const styles: Record<string, { bg: string; icon: string }> = {
  ok: { bg: '#edf7ed', icon: '✓' },
  warn: { bg: '#fff6e6', icon: '!' },
  err: { bg: '#fdecec', icon: '×' },
};
</script>

<template>
  <div class="demo-panel">
    <div role="group" aria-label="按状态筛选" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px">
      <button
        v-for="f in ['all', 'ok', 'warn', 'err']"
        :key="f"
        type="button"
        :aria-pressed="filter === f"
        :style="filter === f ? btnOn : btnOff"
        @click="filter = f"
      >
        {{ f === 'all' ? '全部' : f }}
      </button>
    </div>
    <ul style="margin: 0; padding-left: 1.2em">
      <li v-for="i in visible" :key="i.id">
        {{ i.name }}
        <span :style="{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--vp-c-border)', background: styles[i.status].bg }"><span aria-hidden="true" style="font-weight: 700; font-size: 10px">{{ styles[i.status].icon }}</span>{{ i.label }}</span>
      </li>
    </ul>
    <p v-if="!visible.length" class="demo-note">无匹配示例项</p>
  </div>
</template>
