#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const out = path.join(ROOT, 'docs/public/downloads');
const slug = 'article-typesetting-v1';
const dir = path.join(ROOT, '.template-staging', slug);

fs.mkdirSync(out, { recursive: true });
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
fs.mkdirSync(path.join(dir, 'public'), { recursive: true });
fs.cpSync(path.join(ROOT, 'templates/article-typesetting'), path.join(dir, 'src/article-typesetting'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'benchmarks/article-sample.md'), path.join(dir, 'public/article-sample.md'));

fs.writeFileSync(
  path.join(dir, 'src/App.vue'),
  `<script setup lang="ts">
import { ref } from 'vue';
import ArticleTypesetting from './article-typesetting/ArticleTypesetting.vue';
import type { TypographyId } from './article-typesetting/types';
const typo = ref<TypographyId>('reading-longform');
</script>
<template>
  <div style="padding:16px;font-family:system-ui">
    <label>typography <select v-model="typo">
      <option value="reading-longform">reading-longform</option>
      <option value="editorial-magazine">editorial-magazine</option>
      <option value="compact-notes">compact-notes</option>
    </select></label>
    <ArticleTypesetting :typography="typo" article-sample-url="/article-sample.md" />
  </div>
</template>
`
);
fs.writeFileSync(
  path.join(dir, 'src/main.ts'),
  `import { createApp } from 'vue';\nimport App from './App.vue';\ncreateApp(App).mount('#app');\n`
);
fs.writeFileSync(
  path.join(dir, 'index.html'),
  `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${slug}</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>`
);
fs.writeFileSync(
  path.join(dir, 'vite.config.js'),
  `import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\nexport default defineConfig({ plugins: [vue()] });\n`
);
fs.writeFileSync(
  path.join(dir, 'package.json'),
  JSON.stringify(
    {
      name: slug,
      private: true,
      type: 'module',
      scripts: { dev: 'vite', build: 'vite build' },
      dependencies: { vue: '^3.5.13' },
      devDependencies: { vite: '^5.4.11', '@vitejs/plugin-vue': '^5.2.1' },
    },
    null,
    2
  )
);

const zip = path.join(out, `${slug}.zip`);
execSync(`cd "${dir}" && zip -rq "${zip}" . -x node_modules/\\*`, { stdio: 'inherit' });
execSync('npm install && npm run build', { cwd: dir, stdio: 'inherit' });
console.log('article-typesetting-v1.zip ready');
