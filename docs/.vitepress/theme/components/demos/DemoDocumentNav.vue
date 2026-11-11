<script setup lang="ts">
import { ref } from 'vue';

const sections = [
  { id: 's1', title: '1. 概述（示例）' },
  { id: 's2', title: '2. 安装（示例）' },
  { id: 's3', title: '3. 配置（示例）' },
];
const current = ref('s1');
</script>

<template>
  <div class="demo-panel" style="display: grid; grid-template-columns: 120px 1fr; gap: 8px">
    <nav aria-label="章节目录（示例）">
      <button
        v-for="s in sections"
        :key="s.id"
        type="button"
        :aria-current="current === s.id"
        style="display: block; width: 100%; margin-bottom: 4px; padding: 6px 8px; border: 1px solid var(--vp-c-border); border-radius: 6px; background: #fff; text-align: left; font: inherit; cursor: pointer"
        @click="current = s.id"
      >
        {{ s.title }}
      </button>
    </nav>
    <div aria-live="polite" style="padding: 8px; border: 1px solid var(--vp-c-border); border-radius: 7px; background: #fff; min-height: 100px">
      <h4 style="margin: 0 0 6px">{{ sections.find((x) => x.id === current)?.title }}</h4>
      <p style="margin: 0; font-size: 13px">示例正文：模拟长文档锚点跳转。窄屏下目录与正文上下堆叠。</p>
    </div>
  </div>
</template>
