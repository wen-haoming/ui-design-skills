<script setup lang="ts">
import { withBase } from 'vitepress';
import { styles } from '../../gallery-meta';
</script>

<template>
  <div class="gallery-compare">
    <header>
      <h1>共同场景对比</h1>
      <p>同一 <code>benchmark.json</code>、同一会话状态（筛选/选中/改状态联动）。仅 style 参数不同。</p>
      <a :href="withBase('/')">返回展厅</a>
    </header>
    <ClientOnly>
      <div class="gallery-compare-grid">
        <article v-for="s in styles" :key="s.id" class="gallery-compare-col">
          <h2>{{ s.title }}</h2>
          <component :is="s.preview" compact />
          <a :href="withBase(`/works/${s.id}`)">进入详情</a>
        </article>
      </div>
    </ClientOnly>
  </div>
</template>
