<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import skillsPack from '../../data/skills.json';

const props = defineProps<{ skillName: string }>();

const live = ref('');
const liveError = ref(false);
const skill = computed(() => skillsPack.skills.find((s) => s.name === props.skillName));

async function copySkill() {
  if (!skill.value) return;
  liveError.value = false;
  const text = skill.value.skillMd;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      live.value = '已复制完整 SKILL 原文到剪贴板';
      return;
    }
  } catch {
    /* fallback */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (ok) live.value = '已复制完整 SKILL 原文（兼容模式）';
    else throw new Error('copy failed');
  } catch {
    liveError.value = true;
    live.value = '复制失败：请手动选择下方 SKILL 正文';
  }
}

function downloadSkill() {
  if (!skill.value || typeof document === 'undefined') return;
  liveError.value = false;
  const blob = new Blob([skill.value.skillMd], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'SKILL.md';
  a.click();
  URL.revokeObjectURL(a.href);
  live.value = '已触发下载 SKILL.md';
}

onMounted(() => {
  live.value = '';
});
</script>

<template>
  <div class="skill-toolbar" role="region" aria-label="SKILL 操作">
    <button type="button" class="primary" @click="copySkill">复制完整 SKILL 原文</button>
    <button type="button" @click="downloadSkill">下载 SKILL.md</button>
    <div class="live" :class="{ error: liveError }" role="status" aria-live="polite">{{ live }}</div>
  </div>
</template>
