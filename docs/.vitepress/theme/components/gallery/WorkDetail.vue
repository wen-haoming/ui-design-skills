<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import { styles, type StyleId } from '../../gallery-meta';
import AggregateToolbar from '../AggregateToolbar.vue';

const props = defineProps<{ styleId: StyleId }>();

const entry = computed(() => styles.find((s) => s.id === props.styleId)!);
</script>

<template>
  <div class="gallery-work" v-if="entry">
    <header class="gallery-work-head">
      <p class="gallery-kicker">{{ entry.subtitle }} · 任务管理工作台</p>
      <h1>{{ entry.title }}</h1>
      <p>{{ entry.blurb }}</p>
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
      <pre><code>style={{ entry.id }}
layout=list-detail
benchmark=task-workbench-v1</code></pre>
      <p>源码路径：<code>templates/task-workbench/{{ entry.id }}/</code>，共享逻辑 <code>templates/task-workbench/shared/</code>。</p>
    </section>
  </div>
</template>
