#!/usr/bin/env node
/** 构建三套可独立运行的 Vite 模板包 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STYLES = [
  { id: 'shallow-precise', component: 'WorkbenchShallow', folder: 'shallow-precise' },
  { id: 'dark-command', component: 'WorkbenchDark', folder: 'dark-command' },
  { id: 'soft-system', component: 'WorkbenchSoft', folder: 'soft-system' },
];

const pkgBase = (name) => ({
  name,
  private: true,
  type: 'module',
  scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview --port 5173' },
  dependencies: { vue: '^3.5.13' },
  devDependencies: { vite: '^5.4.11', '@vitejs/plugin-vue': '^5.2.1' },
});

function viteConfig() {
  return `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
export default defineConfig({
  plugins: [vue()],
  resolve: {
  alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
});
`;
}

function mainTs(component) {
  return `import { createApp } from 'vue';
import App from './App.vue';
createApp(App).mount('#app');
`;
}

function appVue(component) {
  return `<script setup lang="ts">
import ${component} from '../${component.replace('Workbench', '').toLowerCase() ? '' : ''}';
</script>
<template><p>broken</p></template>
`;
}

// fix app.vue imports per style
function writeApp(folder, component, styleFolder) {
  const dir = path.join(ROOT, 'dist-templates', styleFolder);
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'shared'), { recursive: true });
  fs.cpSync(path.join(ROOT, 'templates/task-workbench/shared'), path.join(dir, 'shared'), { recursive: true });
  fs.copyFileSync(
    path.join(ROOT, `templates/task-workbench/${styleFolder}/${component}.vue`),
    path.join(dir, 'src', `${component}.vue`)
  );
  fs.writeFileSync(
    path.join(dir, 'src/App.vue'),
    `<script setup lang="ts">
import { createWorkbench } from '../shared/useWorkbench.ts';
import ${component} from './${component}.vue';
// 独立包使用隔离会话（非站点对比共享）
createWorkbench('isolated-${styleFolder}');
</script>
<template>
  <${component} />
</template>
`.replace(/createWorkbench[^;]+;/, '') // use default export mount only
  );
  // simpler App.vue
  fs.writeFileSync(
    path.join(dir, 'src/App.vue'),
    `<script setup lang="ts">
import ${component} from './${component}.vue';
</script>
<template><${component} /></template>
`
  );
  // patch component to use createWorkbench instead of shared - too invasive; copy symlink approach: import path in vite alias

  fs.writeFileSync(path.join(dir, 'index.html'), `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>task-workbench-${styleFolder}</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>`);
  fs.writeFileSync(path.join(dir, 'src/main.ts'), `import { createApp } from 'vue';\nimport App from './App.vue';\ncreateApp(App).mount('#app');\n`);
  fs.writeFileSync(path.join(dir, 'vite.config.js'), viteConfig().replace('../shared', './shared'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkgBase(`task-workbench-${styleFolder}`), null, 2));
  fs.writeFileSync(
    path.join(dir, 'README.md'),
    `# task-workbench-${styleFolder}\n\n\`\`\`bash\nnpm ci\nnpm run dev\n\`\`\`\n\n固定基准见 shared/benchmark.json；风格：${styleFolder}。\n`
  );
}

function patchComponentImports(styleFolder, component) {
  const p = path.join(ROOT, 'dist-templates', styleFolder, 'src', `${component}.vue`);
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace("from '../shared/", "from '../shared/");
  fs.writeFileSync(p, s);
}

fs.rmSync(path.join(ROOT, 'dist-templates'), { recursive: true, force: true });

for (const st of STYLES) {
  writeApp(st.folder, st.component, st.folder);
  patchComponentImports(st.folder, st.component);
  const dir = path.join(ROOT, 'dist-templates', st.folder);
  console.log('building', st.id);
  execSync('npm install && npm run build', { cwd: dir, stdio: 'inherit' });
}

const out = path.join(ROOT, 'docs/public/downloads');
fs.mkdirSync(out, { recursive: true });
for (const st of STYLES) {
  execSync(`cd "${path.join(ROOT, 'dist-templates', st.folder)}" && zip -rq "${path.join(out, `task-workbench-${st.folder}.zip`)}" . -x node_modules/\\* dist/\\*`, {
    stdio: 'inherit',
  });
}
console.log('Template zips written to docs/public/downloads/');
