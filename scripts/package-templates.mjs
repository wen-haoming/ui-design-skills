#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const out = path.join(ROOT, 'docs/public/downloads');
const styles = ['shallow-precise', 'dark-command', 'soft-system'];
const component = {
  'shallow-precise': 'WorkbenchShallow',
  'dark-command': 'WorkbenchDark',
  'soft-system': 'WorkbenchSoft',
};

fs.mkdirSync(out, { recursive: true });

for (const id of styles) {
  const dir = path.join(ROOT, '.template-staging', id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.cpSync(path.join(ROOT, 'templates/task-workbench/shared'), path.join(dir, 'shared'), { recursive: true });
  fs.copyFileSync(
    path.join(ROOT, `templates/task-workbench/${id}/${component[id]}.vue`),
    path.join(dir, 'src', `${component[id]}.vue`)
  );
  const vue = fs.readFileSync(path.join(dir, 'src', `${component[id]}.vue`), 'utf8').replace(
    "'../shared/",
    "'../shared/"
  );
  fs.writeFileSync(path.join(dir, 'src', `${component[id]}.vue`), vue);
  fs.writeFileSync(
    path.join(dir, 'src/App.vue'),
    `<script setup lang="ts">\nimport ${component[id]} from './${component[id]}.vue';\n</script>\n<template><${component[id]} /></template>\n`
  );
  fs.writeFileSync(path.join(dir, 'src/main.ts'), `import { createApp } from 'vue';\nimport App from './App.vue';\ncreateApp(App).mount('#app');\n`);
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${id}</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>`
  );
  fs.writeFileSync(
    path.join(dir, 'vite.config.js'),
    `import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\nexport default defineConfig({ plugins: [vue()] });\n`
  );
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify(
      {
        name: `task-workbench-${id}`,
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
  fs.writeFileSync(path.join(dir, 'README.md'), `# task-workbench-${id}\n\n\`\`\`bash\nnpm ci\nnpm run dev\n\`\`\`\n`);
  console.log('packaging', id);
  execSync(`cd "${dir}" && zip -rq "${path.join(out, `task-workbench-${id}.zip`)}" . -x node_modules/\\*`, { stdio: 'inherit' });
  execSync('npm install && npm run build', { cwd: dir, stdio: 'inherit' });
}

console.log('downloads ready');
