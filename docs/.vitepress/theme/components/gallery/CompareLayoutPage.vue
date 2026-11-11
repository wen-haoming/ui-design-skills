<script setup lang="ts">
import { ref, computed } from 'vue';
import { withBase } from 'vitepress';
import { layoutCompareWorks, layoutMeta } from '../../works-catalog';

const activeSlug = ref(layoutCompareWorks[0]?.slug ?? '');
const active = computed(() => layoutCompareWorks.find((w) => w.slug === activeSlug.value));
</script>

<template>
  <div class="gallery-compare">
    <header class="gallery-compare-head">
      <p class="gallery-kicker">布局对照</p>
      <h1>固定 shallow-precise · 仅改 layout</h1>
      <p>同一风格壳层，仅改变主从结构；数据与分面能力不变。</p>
      <a class="gallery-cta gallery-cta--ghost" :href="withBase('/compare')">风格对照</a>
    </header>
    <div class="gallery-compare-tabs" role="tablist">
      <button
        v-for="w in layoutCompareWorks"
        :key="w.slug"
        type="button"
        role="tab"
        :class="{ 'is-active': activeSlug === w.slug }"
        @click="activeSlug = w.slug"
      >
        {{ layoutMeta[w.layoutId].title }}
      </button>
    </div>
    <ClientOnly v-if="active">
      <article class="gallery-compare-stage">
        <div class="gallery-compare-stage-head">
          <h2>{{ active.title }}</h2>
          <a :href="withBase(`/works/${active.slug}`)">作品详情</a>
        </div>
        <div class="gallery-compare-live">
          <component :is="active.preview" />
        </div>
      </article>
    </ClientOnly>
  </div>
</template>
