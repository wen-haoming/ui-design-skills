<script setup lang="ts">
import { ref, computed } from 'vue';
import { withBase } from 'vitepress';
import { styles, type StyleId } from '../../gallery-meta';

const styleFilter = ref<'all' | StyleId>('all');
const spotlightId = ref<StyleId>('shallow-precise');

const spotlight = computed(() => styles.find((s) => s.id === spotlightId.value)!);
const visible = computed(() =>
  styleFilter.value === 'all' ? styles : styles.filter((s) => s.id === styleFilter.value)
);
</script>

<template>
  <div class="gallery-home">
    <header class="gallery-hero">
      <p class="gallery-kicker">技能作品展厅 · 原创示例界面</p>
      <h1>多风格界面设计</h1>
      <p class="gallery-lead">
        同一固定基准上的三套任务工作台壳层。首屏为<strong>真实渲染截图</strong>（1280×720 视口）；完整筛选、列表/看板与状态联动请进入各风格独立页。
      </p>
      <p class="gallery-scene-tag">共同场景：<strong>任务管理工作台</strong> · 10 条示例任务</p>
    </header>

    <div class="gallery-toolbar" role="toolbar" aria-label="筛选">
      <span class="gallery-toolbar-label">作品</span>
      <button type="button" :aria-pressed="styleFilter === 'all'" @click="styleFilter = 'all'">全部</button>
      <button
        v-for="s in styles"
        :key="s.id"
        type="button"
        :aria-pressed="styleFilter === s.id"
        @click="styleFilter = s.id"
      >
        {{ s.title }}
      </button>
      <a class="gallery-cta" :href="withBase('/compare')">交互对比</a>
      <a class="gallery-cta gallery-cta--ghost" :href="withBase('/skill')">Skill 正文</a>
    </div>

    <section class="gallery-spotlight" aria-label="风格主预览">
      <div class="gallery-spotlight-tabs" role="tablist" aria-label="三风格切换">
        <button
          v-for="s in styles"
          :key="s.id"
          type="button"
          role="tab"
          :aria-selected="spotlightId === s.id"
          :class="{ 'is-active': spotlightId === s.id }"
          @click="spotlightId = s.id"
        >
          <span class="gallery-spotlight-tab-title">{{ s.title }}</span>
          <span class="gallery-spotlight-tab-sub">{{ s.subtitle }}</span>
        </button>
      </div>
      <figure class="gallery-spotlight-stage">
        <img
          :src="withBase(spotlight.cover)"
          :alt="`${spotlight.title} 原创工作台预览（真实渲染）`"
          width="1280"
          height="720"
          loading="eager"
          fetchpriority="high"
        />
      </figure>
      <p class="gallery-spotlight-blurb">{{ spotlight.blurb }}</p>
      <div class="gallery-spotlight-actions">
        <a class="gallery-cta" :href="withBase(`/works/${spotlight.id}`)">打开完整交互预览</a>
        <a class="gallery-cta gallery-cta--ghost" :href="withBase('/compare')">切换风格对比（共享状态）</a>
      </div>
    </section>

  <section class="gallery-strip" aria-label="三风格缩略图">
      <button
        v-for="s in styles"
        :key="s.id"
        type="button"
        class="gallery-strip-item"
        :class="{ 'is-active': spotlightId === s.id }"
        :aria-pressed="spotlightId === s.id"
        @click="spotlightId = s.id"
      >
        <img :src="withBase(s.cover)" :alt="s.title" loading="lazy" />
        <span>{{ s.subtitle }}</span>
      </button>
    </section>

    <section class="gallery-grid" aria-label="作品卡片">
      <a v-for="s in visible" :key="s.id" class="gallery-card" :href="withBase(`/works/${s.id}`)">
        <div class="gallery-card-frame">
          <img v-if="s.cover" :src="withBase(s.cover)" :alt="`${s.title} 原创预览`" loading="lazy" />
        </div>
        <div class="gallery-card-body">
          <span class="gallery-card-style">{{ s.subtitle }}</span>
          <h2>{{ s.title }}</h2>
          <p>{{ s.blurb }}</p>
          <span class="gallery-card-link">进入 live 预览</span>
        </div>
      </a>
    </section>

    <p class="gallery-note">
      <a :href="withBase('/legacy/')">遗留单项技能</a>
      仍保留在仓库；公开首页不再以七个独立来源技能目录为主入口。
    </p>
  </div>
</template>
