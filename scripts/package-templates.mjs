#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const out = path.join(ROOT, 'docs/public/downloads');

/** slug -> [styleDir, vueFile, exportName] */
const PACKS = {
  'shallow-precise-list-detail': ['shallow-precise', 'WorkbenchShallow.vue', 'WorkbenchShallow'],
  'shallow-precise-board-detail': ['shallow-precise', 'WorkbenchShallowBoard.vue', 'WorkbenchShallowBoard'],
  'shallow-precise-reading-split': ['shallow-precise', 'WorkbenchShallowReading.vue', 'WorkbenchShallowReading'],
  'shallow-precise-calendar-agenda': ['shallow-precise', 'WorkbenchShallowCalendar.vue', 'WorkbenchShallowCalendar'],
  'dark-command-list-detail': ['dark-command', 'WorkbenchDark.vue', 'WorkbenchDark'],
  'soft-system-list-detail': ['soft-system', 'WorkbenchSoft.vue', 'WorkbenchSoft'],
  'editorial-sheet-list-detail': ['editorial-sheet', 'WorkbenchEditorial.vue', 'WorkbenchEditorial'],
  'amber-ledger-list-detail': ['amber-ledger', 'WorkbenchAmber.vue', 'WorkbenchAmber'],
};

fs.mkdirSync(out, { recursive: true });

for (const [slug, [styleDir, vueFile, compName]] of Object.entries(PACKS)) {
  const dir = path.join(ROOT, '.template-staging', slug);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.cpSync(path.join(ROOT, 'templates/task-workbench/shared'), path.join(dir, 'shared'), { recursive: true });
  const stylePath = path.join(ROOT, `templates/task-workbench/${styleDir}`);
  if (styleDir === 'shallow-precise') {
    for (const f of fs.readdirSync(stylePath)) {
      if (f.endsWith('.vue')) {
        fs.copyFileSync(path.join(stylePath, f), path.join(dir, 'src', f));
      }
    }
  } else {
    fs.copyFileSync(path.join(stylePath, vueFile), path.join(dir, 'src', vueFile));
  }
  fs.writeFileSync(
    path.join(dir, 'src/App.vue'),
    `<script setup lang="ts">\nimport ${compName} from './${vueFile}';\n</script>\n<template><${compName} /></template>\n`
  );
  fs.writeFileSync(
    path.join(dir, 'src/main.ts'),
    `import { createApp } from 'vue';\nimport App from './App.vue';\ncreateApp(App).mount('#app');\n`
  );
  fs.writeFileSync(
    path.join(dir, 'vite.config.js'),
    `import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\nimport path from 'node:path';\nexport default defineConfig({\n  plugins: [vue()],\n  resolve: {\n    alias: [{ find: '../shared', replacement: path.resolve(__dirname, 'shared') }],\n  },\n});\n`
  );
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${slug}</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>`
  );
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify(
      {
        name: `task-workbench-${slug}`,
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
  const zipName = `task-workbench-${slug}.zip`;
  console.log('packaging', slug);
  execSync(`cd "${dir}" && zip -rq "${path.join(out, zipName)}" . -x node_modules/\\*`, { stdio: 'inherit' });
  execSync('npm install && npm run build', { cwd: dir, stdio: 'inherit' });
}

console.log('downloads ready');
