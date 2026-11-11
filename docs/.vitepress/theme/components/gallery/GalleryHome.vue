<script setup lang="ts">
import { ref, computed } from 'vue';
import { withBase } from 'vitepress';
import { publishedWorks, filterWorks, styleMeta, layoutMeta, type StyleId, type LayoutId } from '../../works-catalog';

const styleF = ref<'all' | StyleId>('all');
const layoutF = ref<'all' | LayoutId>('all');
const capF = ref<'all' | string>('all');

const visible = computed(() =>
  filterWorks({
    style: styleF.value,
    layout: layoutF.value,
    capability: capF.value,
    scene: 'task-workbench-v1',
  })
);

const spotlightSlug = ref(publishedWorks[0].slug);
const spotlight = computed(() => publishedWorks.find((w) => w.slug === spotlightSlug.value) ?? publishedWorks[0]);
</script>

<template>
  <div class="gallery-home">
    <header class="gallery-hero">
      <p class="gallery-kicker">技能作品展厅 v1.1 · 原创示例界面</p>
      <h1>多风格界面设计</h1>
      <p class="gallery-lead">
        固定基准 <strong>task-workbench-v1</strong> 上已发布
        <strong>{{ publishedWorks.length }}</strong>
        个可运行组合（5 风格 list-detail + 3 种 shallow 布局变体）。首屏为真实渲染封面，live 交互见各作品页。
      </p>
      <p class="gallery-scene-tag">场景：<strong>任务管理工作台</strong></p>
    </header>

    <div class="gallery-toolbar" role="toolbar" aria-label="筛选">
      <span class="gallery-toolbar-label">风格</span>
      <button type="button" :aria-pressed="styleF === 'all'" @click="styleF = 'all'">全部</button>
      <button
        v-for="(s, id) in styleMeta"
        :key="id"
        type="button"
        :aria-pressed="styleF === id"
        @click="styleF = id"
      >
        {{ s.title }}
      </button>
    </div>
    <div class="gallery-toolbar">
      <span class="gallery-toolbar-label">布局</span>
      <button type="button" :aria-pressed="layoutF === 'all'" @click="layoutF = 'all'">全部</button>
      <button
        v-for="(l, id) in layoutMeta"
        :key="id"
        type="button"
        :aria-pressed="layoutF === id"
        @click="layoutF = id"
      >
        {{ l.title }}
      </button>
      <button type="button" :aria-pressed="capF === 'all'" @click="capF = 'all'">能力</button>
      <button type="button" :aria-pressed="capF === 'facet-query-filter'" @click="capF = 'facet-query-filter'">
        分面筛选
      </button>
    </div>
    <div class="gallery-toolbar gallery-toolbar--links">
      <a class="gallery-cta" :href="withBase('/compare')">风格对照</a>
      <a class="gallery-cta gallery-cta--ghost" :href="withBase('/compare-layout')">布局对照</a>
      <a class="gallery-cta gallery-cta--ghost" :href="withBase('/skill')">Skill 正文</a>
    </div>

    <p v-if="!visible.length" class="gallery-empty">
      无匹配作品（未实现的组合不会显示）。
      <button type="button" @click="styleF = 'all'; layoutF = 'all'; capF = 'all'">清空筛选</button>
    </p>

    <section v-if="visible.length" class="gallery-spotlight" aria-label="主预览">
      <div class="gallery-spotlight-tabs" role="tablist">
        <button
          v-for="w in visible"
          :key="w.slug"
          type="button"
          role="tab"
          :class="{ 'is-active': spotlightSlug === w.slug }"
          @click="spotlightSlug = w.slug"
        >
          {{ w.title }}
        </button>
      </div>
      <figure class="gallery-spotlight-stage">
        <img :src="withBase(spotlight.cover)" :alt="spotlight.title" width="1280" height="720" />
      </figure>
      <div class="gallery-spotlight-actions">
        <a class="gallery-cta" :href="withBase(`/works/${spotlight.slug}`)">打开完整交互预览</a>
      </div>
    </section>

    <section class="gallery-grid" aria-label="作品卡">
      <a v-for="w in visible" :key="w.slug" class="gallery-card" :href="withBase(`/works/${w.slug}`)">
        <div class="gallery-card-frame">
          <img :src="withBase(w.cover)" :alt="w.title" loading="lazy" />
        </div>
        <div class="gallery-card-body">
          <span class="gallery-card-style">{{ w.styleId }} · {{ w.layoutId }}</span>
          <h2>{{ w.title }}</h2>
          <p>{{ w.blurb }}</p>
        </div>
      </a>
    </section>
  </div>
</template>
