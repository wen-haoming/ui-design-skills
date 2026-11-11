<script setup lang="ts">
import { ref, computed } from 'vue';
import { withBase } from 'vitepress';
import skillsMeta from '../../skills-meta.json';

const skills = skillsMeta.skills;
const filter = ref('all');

const categories = computed(() => {
  const map = new Map<string, string>();
  for (const s of skills) map.set(s.category, s.categoryLabel);
  return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'zh'));
});

const visible = computed(() => {
  if (filter.value === 'all') return skills;
  return skills.filter((s) => s.category === filter.value);
});
</script>

<template>
  <section class="home-skills" aria-labelledby="skills-heading">
    <h2 id="skills-heading">七个技能</h2>
    <p class="lead">
      分类浏览、第三方参考图与原创交互演示。复制/下载内容为仓库内完整 <code>SKILL.md</code>，非摘要。
      演示数据均为示例，标注「原创演示，非原作实现」。
    </p>
    <div class="home-filters" role="group" aria-label="分类筛选">
      <button type="button" :aria-pressed="filter === 'all'" @click="filter = 'all'">全部</button>
      <button
        v-for="[id, label] in categories"
        :key="id"
        type="button"
        :aria-pressed="filter === id"
        @click="filter = id"
      >
        {{ label }}
      </button>
    </div>
    <div v-if="visible.length" class="skill-grid" role="list">
      <a
        v-for="s in visible"
        :key="s.name"
        class="skill-card"
        role="listitem"
        :href="withBase(`/skills/${s.name}`)"
      >
        <img
          v-if="s.screenshots[0]"
          :src="s.screenshots[0].src"
          :alt="s.screenshots[0].description"
          loading="lazy"
        />
        <div v-else class="body" style="min-height: 80px" />
        <div class="body">
          <div class="cat">{{ s.categoryLabel }}</div>
          <div class="title">{{ s.title }}</div>
          <p class="desc">{{ s.description }}</p>
        </div>
      </a>
    </div>
    <p v-else class="demo-note">没有匹配的技能。</p>
  </section>
</template>
