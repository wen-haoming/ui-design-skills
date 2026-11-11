<script setup lang="ts">
import { ref, computed } from 'vue';
import { withBase } from 'vitepress';
import { styles, type StyleId } from '../../gallery-meta';

const activeId = ref<StyleId>('shallow-precise');
const active = computed(() => styles.find((s) => s.id === activeId.value)!);
</script>

<template>
  <div class="gallery-compare">
    <header class="gallery-compare-head">
      <p class="gallery-kicker">共同场景</p>
      <h1>三风格交互对比</h1>
      <p>
        同一 <code>benchmark.json</code>、同一会话（筛选 / 选中 / 改状态在三风格间联动）。桌面一次只展示一种壳层，保证可读宽度；窄屏纵向切换。
      </p>
      <a class="gallery-cta gallery-cta--ghost" :href="withBase('/')">返回展厅</a>
    </header>

    <div class="gallery-compare-tabs" role="tablist" aria-label="风格">
      <button
        v-for="s in styles"
        :key="s.id"
        type="button"
        role="tab"
        :aria-selected="activeId === s.id"
        :class="{ 'is-active': activeId === s.id }"
        @click="activeId = s.id"
      >
        {{ s.title }}
      </button>
    </div>

    <ClientOnly>
      <article class="gallery-compare-stage" :aria-label="active.title">
        <div class="gallery-compare-stage-head">
          <h2>{{ active.title }}</h2>
          <a :href="withBase(`/works/${active.id}`)">独立全屏页</a>
        </div>
        <div class="gallery-compare-live">
          <component :is="active.preview" />
        </div>
      </article>
    </ClientOnly>

    <aside class="gallery-compare-rail" aria-label="三风格封面">
      <a v-for="s in styles" :key="s.id" class="gallery-compare-thumb" :href="withBase(`/works/${s.id}`)">
        <img :src="withBase(s.cover)" :alt="s.title" loading="lazy" />
        <span>{{ s.subtitle }}</span>
      </a>
    </aside>
  </div>
</template>
