<script setup lang="ts">
import { ref, computed } from 'vue';
import { withBase } from 'vitepress';
import { styles } from '../../gallery-meta';

const styleFilter = ref('all');
const visible = computed(() => (styleFilter.value === 'all' ? styles : styles.filter((s) => s.id === styleFilter.value)));
</script>

<template>
  <div class="gallery-home">
    <header class="gallery-hero">
      <p class="gallery-kicker">技能作品展厅 · 原创示例界面</p>
      <h1>多风格界面设计</h1>
      <p class="gallery-lead">
        同一固定基准（任务管理工作台 · 10 条示例任务）上的三套原创壳层对比。封面来自本站真实渲染，不是第三方帖图。
      </p>
      <p class="gallery-scene-tag">共同场景：<strong>任务管理工作台</strong></p>
    </header>
    <div class="gallery-toolbar" role="toolbar" aria-label="筛选">
      <span>风格</span>
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
      <a class="gallery-cta" :href="withBase('/compare')">并排对比</a>
      <a class="gallery-cta gallery-cta--ghost" :href="withBase('/skill')">Skill 正文</a>
    </div>
    <section class="gallery-triptych" aria-label="三风格首屏预览">
      <ClientOnly>
        <div v-for="s in styles" :key="s.id" class="gallery-frame">
          <p class="gallery-frame-label">{{ s.title }}</p>
          <component :is="s.preview" compact />
        </div>
      </ClientOnly>
    </section>
    <section class="gallery-grid" aria-label="作品卡片">
      <a v-for="s in visible" :key="s.id" class="gallery-card" :href="withBase(`/works/${s.id}`)">
        <div class="gallery-card-frame">
          <img v-if="s.cover" :src="withBase(s.cover)" :alt="`${s.title} 原创预览`" loading="lazy" />
        </div>
        <div class="gallery-card-body">
          <span class="gallery-card-style">{{ s.title }}</span>
          <h2>{{ s.subtitle }}</h2>
          <p>{{ s.blurb }}</p>
        </div>
      </a>
    </section>
    <p class="gallery-note">
      <a :href="withBase('/legacy/')">遗留单项技能</a>
      仍保留在仓库；公开首页不再以七个独立 X 来源技能为主入口。
    </p>
  </div>
</template>
