<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { withBase } from 'vitepress';
import {
  filterCatalogItems,
  kindLabels,
  reviewDepthLabel,
  routeToPath,
  isUpstreamOfficial,
  primaryPreviewPath,
  licenseNeedsConfirm,
  licenseConfirmText,
  type CatalogData,
  type CatalogItem,
} from '../../catalog/catalog-utils';

const data = ref<CatalogData>({ taskScenarios: [], items: [], disclaimer: '' });

const task = ref('all');
const kind = ref('all');
const author = ref('all');
const q = ref('');
const selectedId = ref<string | null>(null);
const live = ref('');
const showNonSkill = ref(false);

function syncFromUrl() {
  if (typeof window === 'undefined') return;
  const p = new URLSearchParams(window.location.search);
  task.value = p.get('task') ?? 'all';
  kind.value = p.get('kind') ?? 'all';
  author.value = p.get('author') ?? 'all';
  q.value = p.get('q') ?? '';
  selectedId.value = p.get('id');
  showNonSkill.value = p.get('appendix') === '1';
}

function syncToUrl() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const put = (k: string, v: string) => {
    if (!v || v === 'all') url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  };
  put('task', task.value);
  put('kind', kind.value);
  put('author', author.value);
  if (q.value) url.searchParams.set('q', q.value);
  else url.searchParams.delete('q');
  if (selectedId.value) url.searchParams.set('id', selectedId.value);
  else url.searchParams.delete('id');
  if (showNonSkill.value) url.searchParams.set('appendix', '1');
  else url.searchParams.delete('appendix');
  window.history.replaceState({}, '', url.pathname + url.search);
}

onMounted(async () => {
  syncFromUrl();
  const res = await fetch(withBase('/data/catalog-content.json'));
  data.value = await res.json();
});
watch([task, kind, author, q, selectedId, showNonSkill], syncToUrl);

const filtered = computed(() =>
  filterCatalogItems(data.value.items, {
    task: task.value,
    kind: kind.value,
    author: author.value,
    q: q.value,
    includeNonSkill: showNonSkill.value,
  })
);

const selected = computed(() => data.value.items.find((i) => i.id === selectedId.value) ?? null);

watch(filtered, (list) => {
  if (selectedId.value && !list.find((i) => i.id === selectedId.value)) {
    selectedId.value = list[0]?.id ?? null;
  }
  if (!selectedId.value && list.length) selectedId.value = list[0].id;
});

watch(selectedId, async (id) => {
  if (!id || typeof document === 'undefined') return;
  await Promise.resolve();
  document.querySelector('.catalog-list li.is-active')?.scrollIntoView({ block: 'nearest' });
});

function clearAll() {
  task.value = 'all';
  kind.value = 'all';
  author.value = 'all';
  q.value = '';
  showNonSkill.value = false;
  selectedId.value = null;
  live.value = '已清空筛选';
}

function previewHref(item: CatalogItem) {
  const p = primaryPreviewPath(item);
  return p ? withBase(p) : null;
}

function previewAbsolute(item: CatalogItem) {
  const p = previewHref(item);
  if (!p || typeof window === 'undefined') return p;
  return new URL(p, window.location.origin).href;
}

async function copyText(text: string, okMsg: string) {
  live.value = '';
  if (!text) {
    live.value = '无内容可复制';
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    live.value = okMsg;
  } catch {
    live.value = '复制失败，请检查浏览器权限';
  }
}

async function copyCallExample(item: CatalogItem) {
  const text =
    item.kind === 'experienceable_work' && item.skillCallExample
      ? item.skillCallExample
      : item.callExample ?? '';
  await copyText(text, `已复制调用说明：${item.name}`);
}

async function copyPreviewLink(item: CatalogItem) {
  const url = previewAbsolute(item);
  if (!url) {
    live.value = '此条目无站内预览链接';
    return;
  }
  await copyText(url, '已复制站内预览链接（非 Skill 调用参数）');
}

function upstreamHref(item: CatalogItem) {
  if (!isUpstreamOfficial(item)) return null;
  return item.officialUrl || item.sourceUrl;
}
</script>

<template>
  <div class="catalog-page">
    <header class="catalog-head">
      <h1>方法与官方技能</h1>
      <p class="catalog-lead">
        第二层目录：搜索与组合筛选。可体验作品请从<a :href="withBase('/')">展厅首页</a>进入。线上聚合 Skill 仍为
        <strong>v1.2</strong>（<a :href="withBase('/skill')">正文</a>）；v1.3 仅作方法归纳参考。
      </p>
      <p class="catalog-disclaimer">{{ data.disclaimer }}</p>
    </header>

    <div class="catalog-filters" role="search">
      <label class="catalog-field">
        关键词
        <input v-model="q" type="search" placeholder="搜索名称或用途" aria-label="搜索" />
      </label>
      <label class="catalog-field">
        任务
        <select v-model="task" aria-label="任务场景">
          <option value="all">全部</option>
          <option v-for="t in data.taskScenarios" :key="t.id" :value="t.id">{{ t.label }}</option>
        </select>
      </label>
      <label class="catalog-field">
        类型
        <select v-model="kind" aria-label="条目类型">
          <option value="all">默认可检索</option>
          <option v-for="(label, k) in kindLabels" :key="k" :value="k">{{ label }}</option>
        </select>
      </label>
      <label class="catalog-field">
        来源
        <select v-model="author" aria-label="作者来源">
          <option value="all">全部</option>
          <option value="self">本站 / 自拟</option>
          <option value="guizang">歸藏</option>
          <option value="antfu">antfu</option>
          <option value="vercel">Vercel</option>
        </select>
      </label>
      <button type="button" class="catalog-clear" @click="clearAll">清空筛选</button>
    </div>

    <p class="catalog-count" role="status">匹配 {{ filtered.length }} 条</p>
    <p v-if="live" class="catalog-live" role="status" aria-live="polite">{{ live }}</p>

    <p v-if="!filtered.length" class="gallery-empty">
      无匹配条目。可放宽类型或清空关键词。
      <button type="button" @click="clearAll">清空筛选</button>
    </p>

    <div v-else class="catalog-layout">
      <ul class="catalog-list" role="listbox" aria-label="目录列表">
        <li
          v-for="item in filtered"
          :key="item.id"
          :class="{ 'is-active': selectedId === item.id }"
          role="option"
          :aria-selected="selectedId === item.id"
          tabindex="0"
          @click="selectedId = item.id"
          @keydown.enter="selectedId = item.id"
        >
          <span class="catalog-kind-tag">{{ kindLabels[item.kind] ?? item.kind }}</span>
          <span class="catalog-list-name">{{ item.name }}</span>
        </li>
      </ul>

      <article v-if="selected" class="catalog-detail" aria-label="详情">
        <h2>{{ selected.name }}</h2>
        <p class="catalog-kind-line">{{ kindLabels[selected.kind] ?? selected.kind }}</p>
        <p v-if="licenseNeedsConfirm(selected)" class="catalog-license-banner" role="alert">
          {{ licenseConfirmText(selected) }}
        </p>
        <section>
          <h3>用途</h3>
          <p>{{ selected.purpose }}</p>
        </section>
        <section v-if="selected.inputOutput">
          <h3>输入 / 输出</h3>
          <p>{{ selected.inputOutput }}</p>
        </section>
        <section v-if="previewHref(selected)">
          <h3>本站体验</h3>
          <a
            class="gallery-cta"
            :href="previewHref(selected)!"
            target="_blank"
            rel="noopener noreferrer"
          >
            打开完整交互预览
          </a>
          <p class="catalog-note">路径 {{ primaryPreviewPath(selected) }}</p>
          <button type="button" class="gallery-cta gallery-cta--ghost" @click="copyPreviewLink(selected)">
            复制预览链接
          </button>
        </section>
        <section v-if="selected.skillCallExample || (selected.callExample && selected.kind !== 'experienceable_work')">
          <h3>{{ selected.kind === 'experienceable_work' ? 'Skill 调用参数' : '调用例' }}</h3>
          <pre class="catalog-call">{{ selected.skillCallExample || selected.callExample }}</pre>
          <button type="button" class="gallery-cta" @click="copyCallExample(selected)">复制调用说明</button>
        </section>
        <section v-else-if="selected.callExample && selected.kind === 'experienceable_work'">
          <h3>调用说明</h3>
          <pre class="catalog-call">{{ selected.callExample }}</pre>
          <button type="button" class="gallery-cta" @click="copyCallExample(selected)">复制调用说明</button>
        </section>
        <section>
          <h3>许可与约束</h3>
          <p :class="{ 'catalog-warn': licenseNeedsConfirm(selected) }">{{ selected.license }}</p>
          <p v-if="selected.licenseNote" class="catalog-note">{{ selected.licenseNote }}</p>
          <ul v-if="selected.knownConstraints?.length">
            <li v-for="(c, i) in selected.knownConstraints" :key="i">{{ c }}</li>
          </ul>
        </section>
        <section>
          <h3>审阅说明</h3>
          <p>{{ reviewDepthLabel(selected.reviewDepth) }}</p>
        </section>
        <section v-if="upstreamHref(selected)">
          <h3>官方上游</h3>
          <a :href="upstreamHref(selected)!" rel="noopener noreferrer" target="_blank">{{ upstreamHref(selected) }}</a>
          <p class="catalog-note">本站不代为安装或执行上游包。</p>
        </section>
      </article>
    </div>

    <footer class="catalog-appendix">
      <label>
        <input v-model="showNonSkill" type="checkbox" />
        显示附录：相关非 Skill 项目
      </label>
    </footer>
  </div>
</template>
