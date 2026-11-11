# 技能目录站 — VitePress 设计锁定

## 参考锁定（回退直建）

- Refero MCP：`NO_SUBSCRIPTION`，未做 live styles 研究。
- 视觉 token：`#fafafa` 画布、`#ffffff` 面板、`#e5e5e5` 边框、近黑正文/主按钮；圆角 6–8px；`system-ui`；紧凑、无巨型 hero、无 emoji、无紫色渐变。

## 架构

- **框架**：官方 npm 包 [VitePress](https://vitepress.dev/)（Vue + Vite）。
- **唯一数据源**：`scripts/generate-vitepress.mjs` 读取根目录 `catalog.json` 与各技能 `SKILL.md` / `metadata.json`，生成 `docs/skills/*.md`、`docs/.vitepress/data/skills.json`、侧边栏元数据与 `public/assets` 截图。
- **base**：`/ui-design-skills/`（与 GitHub Pages 项目站一致）。
- **演示**：Vue 组件 + `<ClientOnly>`，浏览器 API 仅在客户端执行。
- **清理**：已移除上一版无框架 `site/` 与静态 `docs/index.html` 站，避免双实现漂移；七技能源树 `ui-design/` 与版权文件保留。

## 命令

```bash
npm ci
npm run docs:gen    # 从 catalog/SKILL 生成页面
npm run docs:dev    # 本地开发
npm run docs:build  # 产出 docs/.vitepress/dist
npm run docs:preview
npm run verify
```

Gitee 仅镜像源码与构建配置；Gitee Pages 暂停，不承诺 `gitee.io`。
