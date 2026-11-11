<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import { getWork, layoutMeta, styleMeta } from '../../works-catalog';
import AggregateToolbar from '../AggregateToolbar.vue';

const props = defineProps<{ workSlug: string }>();

const entry = computed(() => getWork(props.workSlug));
const style = computed(() => (entry.value ? styleMeta[entry.value.styleId] : null));
const layout = computed(() => (entry.value ? layoutMeta[entry.value.layoutId] : null));
</script>

<template>
  <div class="gallery-work" v-if="entry && style && layout">
    <header class="gallery-work-head">
      <p class="gallery-kicker">
        {{ style.subtitle }} · {{ layout.subtitle }} · {{ entry.scene }}
      </p>
      <h1>{{ entry.title }}</h1>
      <p>{{ entry.blurb }}</p>
      <ul class="gallery-tags">
        <li v-for="t in entry.typography" :key="t">排版 · {{ t }}</li>
        <li v-for="c in entry.capabilities" :key="c">能力 · {{ c }}</li>
      </ul>
      <div class="gallery-work-actions">
        <AggregateToolbar />
        <a class="gallery-dl" :href="withBase(entry.download)" download>下载可运行模板包</a>
      </div>
    </header>
    <ClientOnly>
      <div class="gallery-work-preview">
        <component :is="entry.preview" />
      </div>
    </ClientOnly>
    <section class="gallery-code-note">
      <h2>调用参数</h2>
      <pre><code>style={{ entry.styleId }}
layout={{ entry.layoutId }}
typography=measure-hierarchy
benchmark=task-workbench-v1
capabilities=facet-query-filter</code></pre>
    </section>
  </div>
  <p v-else>未找到该作品组合（请检查筛选或 slug）。</p>
</template>
