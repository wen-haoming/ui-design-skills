<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { withBase } from 'vitepress';

const live = ref('');
const err = ref(false);
const skillText = ref('');

onMounted(async () => {
  live.value = '';
  const res = await fetch(withBase('/data/skill-full.md'));
  skillText.value = await res.text();
});

async function copySkill() {
  err.value = false;
  if (!skillText.value) {
    err.value = true;
    live.value = '技能正文尚未加载';
    return;
  }
  try {
    await navigator.clipboard.writeText(skillText.value);
    live.value = '已复制完整 SKILL 原文';
  } catch {
    err.value = true;
    live.value = '复制失败，请手动选择正文';
  }
}

function download() {
  if (!skillText.value) return;
  const blob = new Blob([skillText.value], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'SKILL.md';
  a.click();
  URL.revokeObjectURL(a.href);
  live.value = '已触发下载 SKILL.md';
}
</script>

<template>
  <div class="skill-toolbar" role="region" aria-label="聚合 Skill">
    <button type="button" class="primary" @click="copySkill">复制完整 SKILL 原文</button>
    <button type="button" @click="download">下载 SKILL.md</button>
    <span class="live" :class="{ error: err }" role="status" aria-live="polite">{{ live }}</span>
  </div>
</template>
