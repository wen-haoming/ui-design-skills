<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { withBase } from 'vitepress';

const html = ref('');
onMounted(async () => {
  const text = await (await fetch(withBase('/data/skill-full.md'))).text();
  html.value = text;
});
</script>

<template>
  <pre class="skill-doc-raw" aria-label="SKILL 正文">{{ html }}</pre>
</template>

<style scoped>
.skill-doc-raw {
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.5;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  overflow: auto;
  max-height: 80vh;
  background: var(--vp-c-bg-soft);
}
</style>
