<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import benchmarkData from './benchmark.json';
import type { ArticleBenchmark, ArticleBlock, TypographyId } from './types';

const props = withDefaults(
  defineProps<{ typography: TypographyId; compact?: boolean; articleSampleUrl?: string }>(),
  { typography: 'reading-longform' }
);

const bench = benchmarkData as ArticleBenchmark;

const fontStep = ref(0);
const lhStep = ref(0);
const live = ref('');

const defaults = computed(() => {
  const m: Record<TypographyId, { fs: number; lh: number; title: number; h2: number; measure: string }> = {
    'reading-longform': { fs: 17, lh: 1.8, title: 30, h2: 21, measure: 'min(36rem, 38em)' },
    'editorial-magazine': { fs: 16, lh: 1.7, title: 40, h2: 24, measure: 'min(34rem, 36em)' },
    'compact-notes': { fs: 14, lh: 1.55, title: 21, h2: 16, measure: 'min(32rem, 46em)' },
  };
  return m[props.typography];
});

const scaleFs = computed(() => defaults.value.fs * (fontStep.value === -1 ? 0.94 : fontStep.value === 1 ? 1.06 : 1));
const scaleLh = computed(() =>
  defaults.value.lh + (lhStep.value === -1 ? -0.08 : lhStep.value === 1 ? 0.08 : 0)
);

watch(
  () => props.typography,
  () => {
    fontStep.value = 0;
    lhStep.value = 0;
    live.value = '';
  }
);

function resetControls() {
  fontStep.value = 0;
  lhStep.value = 0;
  live.value = '已恢复本排版预设的默认字号与行距';
}

async function copyArticle() {
  live.value = '';
  const url = props.articleSampleUrl;
  const text = url ? await (await fetch(url)).text() : bench.article.title;
  try {
    await navigator.clipboard.writeText(text);
    live.value = '已复制示例文稿正文（非 Skill 正文）';
  } catch {
    live.value = '复制失败，请检查浏览器权限';
  }
}

function paragraphHtml(block: ArticleBlock): string {
  if (block.type !== 'paragraph') return '';
  const token = 'line-height: 1.75';
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const idx = block.text.indexOf(token);
  if (idx === -1) return esc(block.text);
  return (
    esc(block.text.slice(0, idx)) +
    `<span class="at-latin" lang="en">${esc(token)}</span>` +
    esc(block.text.slice(idx + token.length))
  );
}

const rootClass = computed(() => `at-root at-${props.typography.replace(/-/g, '_')}`);
</script>

<template>
  <article
    :class="rootClass"
    lang="zh-CN"
    :style="{
      '--at-fs': `${scaleFs}px`,
      '--at-lh': String(scaleLh),
      '--at-title': `${defaults.title}px`,
      '--at-h2': `${defaults.h2}px`,
      '--at-measure': defaults.measure,
    }"
  >
    <header class="at-chrome" aria-label="排版控制">
      <p class="at-scene">场景 article-typesetting-v1 · typography={{ typography }}</p>
      <div class="at-controls" role="group" aria-label="可选调节">
        <label>
          字号
          <select v-model.number="fontStep" aria-label="字号档位">
            <option :value="-1">较小</option>
            <option :value="0">默认</option>
            <option :value="1">较大</option>
          </select>
        </label>
        <label>
          行距
          <select v-model.number="lhStep" aria-label="行距档位">
            <option :value="-1">较紧</option>
            <option :value="0">默认</option>
            <option :value="1">较松</option>
          </select>
        </label>
        <button type="button" @click="resetControls">恢复默认</button>
        <button type="button" class="at-copy" @click="copyArticle">复制文稿</button>
      </div>
      <p class="at-live" role="status" aria-live="polite">{{ live }}</p>
      <p class="at-note">{{ bench.disclaimer }}</p>
    </header>

    <div class="at-canvas">
      <p v-if="typography === 'editorial-magazine'" class="at-kicker">示例文稿</p>
      <template v-for="block in bench.article.blocks" :key="block.id">
        <h1 v-if="block.type === 'title'" class="at-h1">{{ block.text }}</h1>
        <h2 v-else-if="block.type === 'heading'" class="at-h2">{{ block.text }}</h2>
        <p v-else-if="block.type === 'paragraph'" class="at-p" v-html="paragraphHtml(block)" />
        <ul v-else-if="block.type === 'list'" class="at-ul">
          <li v-for="(item, i) in block.items" :key="i">{{ item }}</li>
        </ul>
        <blockquote v-else-if="block.type === 'quote'" class="at-quote">
          <p>{{ block.text }}</p>
        </blockquote>
      </template>
    </div>
  </article>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap');

.at-root {
  --at-pad: clamp(16px, 4vw, 32px);
  font-size: var(--at-fs);
  line-height: var(--at-lh);
  color: #171717;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  overflow: hidden;
  line-break: strict;
  word-break: normal;
  overflow-wrap: break-word;
  hanging-punctuation: allow-end;
}
.at-chrome {
  padding: 12px var(--at-pad);
  border-bottom: 1px solid #e5e5e5;
  background: #fafafa;
  font-size: 13px;
}
.at-scene {
  margin: 0 0 8px;
  font-size: 12px;
  color: #52525b;
}
.at-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.at-controls label {
  display: flex;
  gap: 6px;
  align-items: center;
}
.at-controls select,
.at-controls button {
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  font: inherit;
  background: #fff;
  cursor: pointer;
}
.at-controls button:focus-visible,
.at-controls select:focus-visible {
  outline: 2px solid #171717;
  outline-offset: 2px;
}
.at-copy {
  background: #171717;
  color: #fff;
  border-color: #171717;
}
.at-live {
  margin: 8px 0 0;
  font-size: 12px;
  color: #0d7a3e;
  min-height: 1.2em;
}
.at-note {
  margin: 8px 0 0;
  font-size: 11px;
  color: #71717a;
}
.at-canvas {
  padding: var(--at-pad);
  max-width: 100%;
}
.at-h1 {
  font-size: var(--at-title);
  line-height: 1.25;
  font-weight: 650;
  margin: 0 0 0.6em;
  max-width: var(--at-measure);
}
.at-h2 {
  font-size: var(--at-h2);
  line-height: 1.35;
  font-weight: 600;
  margin: 1.4em 0 0.5em;
  max-width: var(--at-measure);
}
.at-p {
  margin: 0 0 calc(var(--at-lh) * 0.45em);
  max-width: var(--at-measure);
  text-align: justify;
  text-justify: inter-ideograph;
}
.at-ul {
  margin: 0 0 calc(var(--at-lh) * 0.45em);
  padding-left: 1.35em;
  max-width: var(--at-measure);
  list-style: disc;
}
.at-ul li {
  margin-bottom: 0.35em;
}
.at-quote {
  margin: 1em 0;
  padding: 0.75em 1em;
  border-left: 3px solid #a1a1aa;
  max-width: var(--at-measure);
  color: #3f3f46;
  background: rgba(0, 0, 0, 0.03);
}
.at-quote p {
  margin: 0;
}
:deep(.at-latin) {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* —— reading-longform —— */
.at-reading_longform {
  background: #f9f8f5;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', 'SimSun', Georgia, serif;
}
.at-reading_longform .at-canvas {
  padding-top: 28px;
}

/* —— editorial-magazine —— */
.at-editorial_magazine {
  background: #f2f0e8;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', 'SimSun', Georgia, serif;
}
.at-editorial_magazine .at-kicker {
  font-family: 'Noto Sans SC', system-ui, sans-serif;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #71717a;
  margin: 0 0 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 8px;
  max-width: var(--at-measure);
}
.at-editorial_magazine .at-h1 {
  font-size: calc(var(--at-title) * 1.05);
  letter-spacing: -0.02em;
  line-height: 1.18;
  margin-bottom: 0.85em;
}
.at-editorial_magazine .at-h2 {
  margin-top: 1.8em;
  padding-top: 0.6em;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* —— compact-notes —— */
.at-compact_notes {
  background: #f4f4f5;
  font-family: 'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
}
.at-compact_notes .at-h1 {
  font-weight: 600;
  border-left: 4px solid #171717;
  padding-left: 10px;
}
.at-compact_notes .at-h2 {
  font-weight: 600;
  color: #27272a;
}
.at-compact_notes .at-quote {
  border-left-width: 2px;
  padding: 0.5em 0.75em;
  background: #fff;
  font-size: 0.96em;
}

@media (max-width: 390px) {
  .at-root {
    border-radius: 10px;
  }
  .at-h1,
  .at-h2,
  .at-p,
  .at-ul,
  .at-quote {
    max-width: 100%;
  }
}
</style>
