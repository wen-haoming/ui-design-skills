<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { withBase } from 'vitepress';
import {
  publishedWorks,
  filterWorks,
  typographyScene,
  styleMeta,
  layoutMeta,
  type StyleId,
  type LayoutId,
} from '../../works-catalog';
import { filterCatalogItems, type CatalogItem } from '../../catalog/catalog-utils';

const catalogItems = ref<CatalogItem[]>([]);
onMounted(async () => {
  readQuery();
  filtersOpen.value = typeof window !== 'undefined' && window.innerWidth > 640;
  try {
    const res = await fetch(withBase('/data/catalog-content.json'));
    const data = await res.json();
    catalogItems.value = data.items ?? [];
  } catch {
    catalogItems.value = [];
  }
});

const taskF = ref<'all' | 'ui-design' | 'typography'>('all');
const styleF = ref<'all' | StyleId>('all');
const layoutF = ref<'all' | LayoutId>('all');
const capF = ref<'all' | string>('all');
const filtersOpen = ref(false);
const pickedSlug = ref<string | null>(null);

function readQuery() {
  if (typeof window === 'undefined') return;
  const p = new URLSearchParams(window.location.search);
  const t = p.get('task');
  if (t === 'ui-design' || t === 'typography' || t === 'all') taskF.value = t;
  const s = p.get('style') as StyleId | null;
  if (s && s in styleMeta) styleF.value = s;
  const l = p.get('layout') as LayoutId | null;
  if (l && l in layoutMeta) layoutF.value = l;
}

function writeQuery() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const set = (k: string, v: string, drop: string[]) => {
    if (drop.includes(v)) url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  };
  set('task', taskF.value, ['all']);
  set('style', styleF.value, ['all']);
  set('layout', layoutF.value, ['all']);
  window.history.replaceState({}, '', url.pathname + url.search);
}

watch([taskF, styleF, layoutF], writeQuery);

const benchWorks = computed(() =>
  filterWorks({
    style: styleF.value,
    layout: layoutF.value,
    capability: capF.value,
    scene: 'task-workbench-v1',
  })
);

const showBench = computed(() => taskF.value === 'all' || taskF.value === 'ui-design');
const showTypography = computed(() => taskF.value === 'all' || taskF.value === 'typography');

const visibleCount = computed(
  () => (showBench.value ? benchWorks.value.length : 0) + (showTypography.value ? 1 : 0)
);

const pickedWork = computed(() => {
  if (pickedSlug.value === 'typography') return null;
  return benchWorks.value.find((w) => w.slug === pickedSlug.value) ?? benchWorks.value[0] ?? null;
});

const relatedMethods = computed(() => {
  const tasks = taskF.value === 'all' ? ['ui-design', 'typography'] : [taskF.value];
  return filterCatalogItems(catalogItems.value, { task: 'all', kind: 'all', author: 'all' })
    .filter((it) => it.kind === 'self_authored_method' || it.kind === 'official_upstream')
    .filter((it) => it.taskScenarios?.some((t) => tasks.includes(t)))
    .slice(0, 6);
});

function clearFilters() {
  taskF.value = 'all';
  styleF.value = 'all';
  layoutF.value = 'all';
  capF.value = 'all';
}

function pick(slug: string) {
  pickedSlug.value = slug;
}
</script>

<template>
  <div class="evidence-home gallery-home">
    <header class="evidence-head">
      <h1>可体验作品</h1>
      <p class="evidence-site-name">多风格界面设计 · 作品证据厅</p>
      <p class="evidence-lead">
        8 个工作台组合 + 1 个文稿排版场景（三种 typography）。方法目录在第二层。
      </p>
    </header>

    <button
      type="button"
      class="evidence-filter-toggle"
      aria-expanded="filtersOpen"
      @click="filtersOpen = !filtersOpen"
    >
      {{ filtersOpen ? '收起筛选' : '筛选作品' }}
    </button>

    <div class="evidence-filters" :class="{ 'is-mobile-collapsed': !filtersOpen }">
    <div class="gallery-toolbar" role="toolbar" aria-label="任务与分面">
      <span class="gallery-toolbar-label">任务</span>
      <button type="button" :aria-pressed="taskF === 'all'" @click="taskF = 'all'">全部</button>
      <button type="button" :aria-pressed="taskF === 'ui-design'" @click="taskF = 'ui-design'">界面设计</button>
      <button type="button" :aria-pressed="taskF === 'typography'" @click="taskF = 'typography'">文字排版</button>
    </div>

    <div v-show="showBench" class="gallery-toolbar" aria-label="风格布局">
      <span class="gallery-toolbar-label">风格</span>
      <button type="button" :aria-pressed="styleF === 'all'" @click="styleF = 'all'">全部</button>
      <button v-for="(s, id) in styleMeta" :key="id" type="button" :aria-pressed="styleF === id" @click="styleF = id">
        {{ s.title }}
      </button>
    </div>
    <div v-show="showBench" class="gallery-toolbar" aria-label="布局">
      <span class="gallery-toolbar-label">布局</span>
      <button type="button" :aria-pressed="layoutF === 'all'" @click="layoutF = 'all'">全部</button>
      <button v-for="(l, id) in layoutMeta" :key="id" type="button" :aria-pressed="layoutF === id" @click="layoutF = id">
        {{ l.title }}
      </button>
    </div>
    <details v-show="showBench" class="evidence-capability">
      <summary>能力（可选）</summary>
      <div class="gallery-toolbar gallery-toolbar--inline">
        <button type="button" :aria-pressed="capF === 'all'" @click="capF = 'all'">全部能力</button>
        <button type="button" :aria-pressed="capF === 'facet-query-filter'" @click="capF = 'facet-query-filter'">
          分面筛选
        </button>
      </div>
    </details>
    </div>

    <p class="evidence-count" role="status">匹配 {{ visibleCount }} 个可体验项</p>

    <p v-if="visibleCount === 0" class="gallery-empty">
      当前任务与分面无匹配作品。
      <button type="button" @click="clearFilters">清空筛选</button>
    </p>

    <section v-if="visibleCount" class="evidence-grid" aria-label="作品列表">
      <template v-if="showBench">
      <article
        v-for="w in benchWorks"
        :key="w.slug"
        class="evidence-card"
        :class="{ 'is-picked': pickedSlug === w.slug || (!pickedSlug && w === benchWorks[0]) }"
      >
        <a class="evidence-media" :href="withBase(`/works/${w.slug}`)" @click.prevent="pick(w.slug)">
          <img :src="withBase(w.cover)" :alt="w.title" loading="lazy" width="640" height="360" />
        </a>
        <div class="evidence-card-body">
          <p class="evidence-meta">{{ w.styleId }} · {{ w.layoutId }}</p>
          <h2>
            <a :href="withBase(`/works/${w.slug}`)">{{ w.title }}</a>
          </h2>
          <p>{{ w.blurb }}</p>
          <div class="evidence-actions">
            <a class="gallery-cta" :href="withBase(`/works/${w.slug}`)">完整预览</a>
            <a v-if="w.download" class="gallery-cta gallery-cta--ghost" :href="withBase(w.download)" download>下载</a>
          </div>
        </div>
      </article>
      </template>

      <article
        v-if="showTypography"
        class="evidence-card"
        :class="{ 'is-picked': pickedSlug === 'typography' }"
      >
        <a class="evidence-media" :href="withBase('/typography')" @click.prevent="pick('typography')">
          <img :src="withBase(typographyScene.cover)" :alt="typographyScene.title" loading="lazy" width="640" height="360" />
        </a>
        <div class="evidence-card-body">
          <p class="evidence-meta">article-typesetting-v1 · 三预设</p>
          <h2>
            <a :href="withBase('/typography')">{{ typographyScene.title }}</a>
          </h2>
          <p>{{ typographyScene.blurb }}</p>
          <div class="evidence-actions">
            <a class="gallery-cta" :href="withBase('/typography')">打开排版体验</a>
            <a class="gallery-cta gallery-cta--ghost" :href="withBase(typographyScene.download)" download>模板包</a>
          </div>
        </div>
      </article>
    </section>

    <section v-if="pickedWork" class="evidence-related">
      <h2 class="evidence-related-title">当前作品 · {{ pickedWork.title }}</h2>
      <p>{{ pickedWork.blurb }}</p>
      <a class="gallery-cta" :href="withBase(`/works/${pickedWork.slug}`)">进入完整交互</a>
    </section>

    <section class="evidence-related" aria-label="相关方法">
      <h2 class="evidence-related-title">相关方法与官方技能</h2>
      <ul class="evidence-method-list">
        <li v-for="m in relatedMethods" :key="m.id">
          <a :href="withBase(`/catalog?id=${encodeURIComponent(m.id)}`)">{{ m.name }}</a>
          <span class="evidence-kind">{{ m.kind === 'official_upstream' ? '官方' : '自拟' }}</span>
        </li>
      </ul>
      <a class="gallery-cta gallery-cta--ghost" :href="withBase('/catalog')">打开完整方法目录</a>
    </section>
  </div>
</template>
