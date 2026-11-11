<script setup lang="ts">
import { ref, computed } from 'vue';

const crop = ref(20);
const focal = ref(50);

const innerStyle = computed(() => {
  const w = 70 - crop.value / 2;
  const left = focal.value - w / 2;
  return {
    position: 'absolute' as const,
    width: `${w}%`,
    height: `${60 - crop.value / 3}%`,
    left: `${left}%`,
    top: '20%',
    background: 'linear-gradient(135deg, #f5f5f5, #ddd)',
    border: '1px solid var(--vp-c-border)',
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  };
});
</script>

<template>
  <div class="demo-panel">
    <p class="demo-note">裁切与主体占比为演示控件，非真实导出功能。</p>
    <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; align-items: center">
      <label>裁切强度（示例） <input v-model.number="crop" type="range" min="0" max="40" /></label>
      <label>主体水平位置（%） <input v-model.number="focal" type="range" min="10" max="90" /></label>
    </div>
    <div aria-label="静帧预览（示例）" style="border: 1px solid var(--vp-c-border); border-radius: 7px; overflow: hidden; background: #e8e8e8; height: 140px; position: relative">
      <div :style="innerStyle" />
    </div>
  </div>
</template>
