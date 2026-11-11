<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

const { Layout } = DefaultTheme;
const route = useRoute();
const exhibition = computed(() => !route.path.includes('/legacy/'));
</script>

<template>
  <Layout :class="{ 'vp-exhibition': exhibition }" />
</template>
