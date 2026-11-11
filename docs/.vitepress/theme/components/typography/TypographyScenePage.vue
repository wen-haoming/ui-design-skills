<script setup lang="ts">
import { ref, computed } from 'vue';
import { withBase } from 'vitepress';
import ArticleTypesetting from '@templates/article-typesetting/ArticleTypesetting.vue';
import AggregateToolbar from '../AggregateToolbar.vue';
import type { TypographyId } from '@templates/article-typesetting/types';

const tabs: { id: TypographyId; label: string }[] = [
  { id: 'reading-longform', label: '长文阅读' },
  { id: 'editorial-magazine', label: '编辑杂志' },
  { id: 'compact-notes', label: '紧凑知识笔记' },
];

const active = ref<TypographyId>('reading-longform');
const articleUrl = computed(() => withBase('/data/article-sample.md'));
</script>

<template>
  <div class="typo-scene">
    <header class="typo-head">
      <p class="gallery-kicker">场景 · article-typesetting-v1</p>
      <h1>文字排版体验</h1>
      <p class="typo-lead">
        同一篇固定示例文稿（<code>article-typesetting-v1</code>），仅切换
        <strong>typography</strong>。与工作台八组合独立，不共用 task-workbench-v1。
      </p>
      <ul class="gallery-tags">
        <li>排版 · reading-longform</li>
        <li>排版 · editorial-magazine</li>
        <li>排版 · compact-notes</li>
      </ul>
      <div class="typo-toolbars">
        <AggregateToolbar />
        <a class="gallery-cta gallery-cta--ghost" :href="withBase('/data/article-sample.md')" download>下载示例文稿</a>
        <a class="gallery-cta gallery-cta--ghost" :href="withBase('/downloads/article-typesetting-v1.zip')" download
          >排版模板包</a
        >
      </div>
    </header>

    <div class="typo-tabs" role="tablist" aria-label="排版预设">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        role="tab"
        :class="{ 'is-active': active === t.id }"
        :aria-selected="active === t.id"
        @click="active = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <ClientOnly>
      <div class="typo-stage">
        <ArticleTypesetting :typography="active" :article-sample-url="articleUrl" />
      </div>
    </ClientOnly>

    <section class="typo-meta">
      <h2>字体说明</h2>
      <p>
        通过 Google Fonts 加载 <strong>Noto Serif SC</strong> / <strong>Noto Sans SC</strong>（SIL OFL），
        <code>font-display: swap</code>；离线时回退 Songti / 系统无衬线。未捆绑商业字体。
      </p>
      <p>
        文稿 SHA256（markdown）：
        <code>12bb44a66c7b5eaac174e7bf9b53e519fe88f99931896dd835583e88c6e03497</code> · payload
        <code>73a731356fd0f982efaf1365e5a31ee969144237eb02ab735d1cf5ba1a3da86b</code>
      </p>
    </section>
  </div>
</template>

<style scoped>
.typo-scene {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}
.typo-lead {
  color: #52525b;
  line-height: 1.55;
}
.typo-toolbars {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin: 16px 0;
}
.typo-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0 12px;
}
.typo-tabs button {
  padding: 8px 14px;
  border: 1px solid #d4d4d8;
  border-radius: 999px;
  background: #fff;
  font: inherit;
  cursor: pointer;
  min-height: 44px;
}
.typo-tabs button.is-active {
  background: #171717;
  color: #fff;
  border-color: #171717;
}
.typo-stage {
  margin-bottom: 24px;
}
.typo-meta {
  font-size: 14px;
  color: #3f3f46;
  border-top: 1px solid #e5e5e5;
  padding-top: 20px;
}
.typo-meta h2 {
  font-size: 16px;
  margin: 0 0 8px;
}
</style>
