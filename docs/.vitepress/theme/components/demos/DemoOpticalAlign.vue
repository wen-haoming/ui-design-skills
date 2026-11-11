<script setup lang="ts">
import { ref, computed } from 'vue';

const mode = ref<'container' | 'text'>('container');
const btnOn = { padding: '6px 10px', border: '1px solid var(--vp-c-border)', borderRadius: '7px', background: '#141414', color: '#fff' };
const btnOff = { padding: '6px 10px', border: '1px solid var(--vp-c-border)', borderRadius: '7px', background: '#fff', color: 'inherit' };
const rowStyle = computed(() => ({
  display: 'flex',
  gap: '8px',
  padding: '6px 8px',
  border: '1px solid var(--vp-c-border)',
  borderRadius: '7px',
  background: '#fff',
  marginBottom: '6px',
  alignItems: mode.value === 'container' ? 'center' : 'baseline',
}));
</script>

<template>
  <div class="demo-panel">
    <div role="group" aria-label="对齐模式" style="display: flex; gap: 6px; margin-bottom: 8px">
      <button
        type="button"
        :aria-pressed="mode === 'container'"
        :style="mode === 'container' ? btnOn : btnOff"
        @click="mode = 'container'"
      >
        容器垂直居中
      </button>
      <button type="button" :aria-pressed="mode === 'text'" :style="mode === 'text' ? btnOn : btnOff" @click="mode = 'text'">
        文字基线对齐
      </button>
    </div>
    <div :style="rowStyle"><span style="font-size: 11px; padding: 2px 6px; border-radius: 6px; background: #eee">12px 标签</span><span>示例状态名称</span><span style="font-size: 11px; padding: 2px 6px; border-radius: 6px; background: #eee">操作</span></div>
    <div :style="rowStyle"><span style="font-size: 11px; padding: 2px 6px; border-radius: 6px; background: #eee">12px 标签</span><span>另一行较长示例文案</span><span style="font-size: 11px; padding: 2px 6px; border-radius: 6px; background: #eee">操作</span></div>
  </div>
</template>
