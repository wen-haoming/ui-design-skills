<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
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
  publicConstraints,
  vercelScenarioLabels,
  findVercelItem,
  type CatalogData,
  type CatalogItem,
} from '../../catalog/catalog-utils';

// scenario ids exported from build script mirror — keep in sync
const SCENARIO_IDS = [
  'building-components',
  'json-render/vue',
  'streamdown',
  'chat-sdk',
  'queues',
  'workflow',
  'cdn-caching',
  'vercel-tracing',
];

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
  const wantId = selectedId.value;
  const res = await fetch(withBase('/data/catalog-content.json'));
  data.value = await res.json();
  const it = wantId ? data.value.items.find((i) => i.id === wantId) : null;
  if (it) {
    selectedId.value = wantId;
    await nextTick();
    const inList = filterCatalogItems(data.value.items, {
      task: task.value,
      kind: kind.value,
      author: author.value,
      q: q.value,
      includeNonSkill: showNonSkill.value,
    }).some((i) => i.id === wantId);
    if (!inList) {
      task.value = 'all';
      kind.value = 'all';
      q.value = '';
      if (it.authorFilter && it.authorFilter !== 'other') author.value = it.authorFilter;
    }
    await nextTick();
    document
      .querySelector(`.catalog-list li[data-entry-id="${CSS.escape(wantId)}"]`)
      ?.scrollIntoView({ block: 'center' });
  }
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
  if (!list.length) return;
  if (selectedId.value && list.some((i) => i.id === selectedId.value)) return;
  if (selectedId.value && !list.find((i) => i.id === selectedId.value)) {
    selectedId.value = list[0]?.id ?? null;
  } else if (!selectedId.value) {
    selectedId.value = list[0].id;
  }
});

watch(selectedId, async (id) => {
  if (!id || typeof document === 'undefined') return;
  await Promise.resolve();
  const el = document.querySelector(`.catalog-list li[data-entry-id="${CSS.escape(id)}"]`);
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
});

const vercelFocusItems = computed(() =>
  data.value.items.filter((i) => i.authorFilter === 'vercel' && i.vercelFocus)
);

const showVercelPanel = computed(
  () => author.value === 'vercel' || author.value === 'all'
);

function pickScenario(catalogId: string) {
  const it = findVercelItem(data.value.items, catalogId);
  if (it) selectedId.value = it.id;
  author.value = 'vercel';
}

function pickFocus(id: string) {
  selectedId.value = id;
  author.value = 'vercel';
}

const vercelDownloadHref = computed(() => {
  const p = data.value.vercelExpansion?.downloadPath;
  return p ? withBase(p) : null;
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
        第二层目录：搜索与组合筛选。可体验作品请从<a :href="withBase('/')">展厅首页</a>进入；聚合 Skill
        <a :href="withBase('/skill')">v1.2 正文</a>未改版本。
      </p>
      <p class="catalog-disclaimer catalog-disclaimer--short">{{ data.disclaimer }}</p>
    </header>

    <section
      v-if="showVercelPanel && data.vercelExpansion"
      class="catalog-vercel-hub"
      aria-label="Vercel 场景推荐"
    >
      <h2 class="catalog-vercel-title">Vercel 技能索引</h2>
      <p class="catalog-vercel-lead">
        官方上游索引 <strong>{{ data.vercelExpansion.siteVercelUpstreamRowsAfterMerge }}</strong> 条 ·
        <strong>8</strong> 个场景入口 · <strong>{{ data.vercelExpansion.focusInPackage }}</strong>
        条重点精读；其余请用下方搜索与「来源 → Vercel」。本站不自动安装上游。
      </p>
      <details v-if="data.vercelExpansion" class="catalog-vercel-meta">
        <summary>合并与计数口径（折叠）</summary>
        <p class="catalog-note">
          研究包 {{ data.vercelExpansion.catalogRecordsInPackage }} 条目录记录（≠已安装技能数）；并入既有
          {{ data.vercelExpansion.mergedIntoExistingSiteRows }} 行、新增
          {{ data.vercelExpansion.addedAsNewRows }} 行。全站 catalog 共
          {{ data.items.length }} 行（含作品、方法、歸藏/antfu 等，不是技能个数）。{{
            data.vercelExpansion.note
          }}
        </p>
      </details>
      <div class="catalog-vercel-chips">
        <button
          v-for="sid in SCENARIO_IDS"
          :key="sid"
          type="button"
          class="catalog-vercel-chip"
          @click="pickScenario(sid)"
        >
          {{ vercelScenarioLabels[sid] ?? sid }}
        </button>
      </div>
      <details class="catalog-vercel-focus">
        <summary>18 条重点调用与验收（点击展开）</summary>
        <ul class="catalog-vercel-focus-list">
          <li v-for="it in vercelFocusItems" :key="it.id">
            <button type="button" @click="pickFocus(it.id)">{{ it.name }}</button>
          </li>
        </ul>
      </details>
      <p v-if="vercelDownloadHref" class="catalog-note">
        <a :href="vercelDownloadHref" download rel="noopener">下载公开研究包（zip）</a>
        — 仅供查阅与复核，不是安装包，不含自动运行。
      </p>
    </section>

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
          :data-entry-id="item.id"
          :class="{
            'is-active': selectedId === item.id,
            'is-vercel-focus': item.vercelFocus,
          }"
          role="option"
          :aria-selected="selectedId === item.id"
          tabindex="0"
          @click="selectedId = item.id"
          @keydown.enter="selectedId = item.id"
        >
          <span class="catalog-kind-tag">{{ kindLabels[item.kind] ?? item.kind }}</span>
          <span v-if="item.vercelScenarioPick" class="catalog-vercel-tag">场景</span>
          <span v-else-if="item.vercelFocus" class="catalog-vercel-tag">重点</span>
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
          <p
            v-if="selected.licenseNote && selected.licenseNote !== selected.license"
            class="catalog-note"
          >
            {{ selected.licenseNote }}
          </p>
          <ul v-if="publicConstraints(selected).length">
            <li v-for="(c, i) in publicConstraints(selected)" :key="i">{{ c }}</li>
          </ul>
        </section>
        <section v-if="selected.vercelCommit || selected.vercelRepository">
          <h3>版本与来源</h3>
          <p class="catalog-note">
            研究包快照 commit：{{ selected.vercelCommit?.slice(0, 7) ?? '未钉' }} · 仓库
            {{ selected.vercelRepository ?? '见下方链接' }}
          </p>
        </section>
        <section>
          <h3>阅读与验证说明</h3>
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
