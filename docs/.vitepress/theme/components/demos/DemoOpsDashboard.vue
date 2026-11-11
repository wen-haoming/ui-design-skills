<script setup lang="ts">
import { ref, computed } from 'vue';

const DASH_DATA = {
  day: {
    metrics: [
      { k: '转化率', v: '3.2%' },
      { k: '异常', v: '2' },
      { k: '待办', v: '5' },
    ],
    anomalies: ['示例：支付回调延迟（日）', '示例：库存同步失败（日）'],
  },
  week: {
    metrics: [
      { k: '转化率', v: '3.8%' },
      { k: '异常', v: '7' },
      { k: '待办', v: '12' },
    ],
    anomalies: ['示例：周报生成超时', '示例：区域 A 流量尖刺'],
  },
} as const;

const scope = ref<'day' | 'week'>('day');
const btnOn = { padding: '6px 10px', border: '1px solid var(--vp-c-border)', borderRadius: '7px', background: '#141414', color: '#fff' };
const btnOff = { padding: '6px 10px', border: '1px solid var(--vp-c-border)', borderRadius: '7px', background: '#fff', color: 'inherit' };
const data = computed(() => DASH_DATA[scope.value]);
</script>

<template>
  <div class="demo-panel">
    <div role="tablist" aria-label="时间范围（示例）" style="display: flex; gap: 6px; margin-bottom: 8px">
      <button type="button" role="tab" :aria-selected="scope === 'day'" :style="scope === 'day' ? btnOn : btnOff" @click="scope = 'day'">今日</button>
      <button type="button" role="tab" :aria-selected="scope === 'week'" :style="scope === 'week' ? btnOn : btnOff" @click="scope = 'week'">本周</button>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 8px" aria-live="polite">
      <div v-for="m in data.metrics" :key="m.k" style="padding: 8px; border: 1px solid var(--vp-c-border); border-radius: 7px; background: #fff; font-size: 12px"><div>{{ m.k }}</div><strong>{{ m.v }}</strong></div>
    </div>
    <h4 style="margin: 0 0 4px; font-size: 13px">异常列表（示例）</h4>
    <div v-for="a in data.anomalies" :key="a" style="font-size: 12px; padding: 6px 8px; border-left: 3px solid #9a6700; background: #fff; margin-bottom: 4px; border-radius: 0 7px 7px 0">{{ a }}</div>
  </div>
</template>
