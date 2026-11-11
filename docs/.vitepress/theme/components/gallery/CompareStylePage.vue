<script setup lang="ts">
import { ref, computed } from 'vue';
import { withBase } from 'vitepress';
import { styleCompareWorks, styleMeta } from '../../works-catalog';

const activeSlug = ref(styleCompareWorks[0]?.slug ?? '');
const active = computed(() => styleCompareWorks.find((w) => w.slug === activeSlug.value));
</script>

<template>
  <div class="gallery-compare">
    <header class="gallery-compare-head">
      <p class="gallery-kicker">风格对照</p>
      <h1>固定 list-detail · 仅改 style</h1>
      <p>同一 benchmark、同一会话与分面筛选；布局恒为 <code>list-detail</code>。</p>
      <a class="gallery-cta gallery-cta--ghost" :href="withBase('/compare-layout')">布局对照</a>
    </header>
    <div class="gallery-compare-tabs" role="tablist">
      <button
        v-for="w in styleCompareWorks"
        :key="w.slug"
        type="button"
        role="tab"
        :class="{ 'is-active': activeSlug === w.slug }"
        @click="activeSlug = w.slug"
      >
        {{ styleMeta[w.styleId].title }}
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
