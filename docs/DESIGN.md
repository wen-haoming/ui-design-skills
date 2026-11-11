# 技能目录站 — 设计锁定与实现决策

## 参考锁定（回退直建）

- Refero MCP：`NO_SUBSCRIPTION`，未做 live styles 研究；不声称 Refero 检索结果。
- 方向来源：Refero 技能中的 **craft** 原则（紧凑 B2B、截图证据边界、反 AI 同质化）+ 仓库现有 7 张第三方参考图 + 用户给定视觉 token。
- 视觉 token：`#fafafa` 画布、`#ffffff` 面板、`#e5e5e5` 1px 边框、近黑正文/主按钮、少量语义色；圆角 6–8px；`system-ui` 单栈；无巨型 hero、无 emoji、无紫色渐变、无衬线营销换词。

## 架构

- **唯一数据源**：构建时读取根目录 `catalog.json`、各技能 `SKILL.md` / `README.md` / `metadata.json` 与 `screenshots/`，生成 `docs/data/skills.json` 与静态资源拷贝；站内不手写第二套文案。
- **运行时**：无框架依赖的静态 HTML/CSS/JS；`History API` + `URLSearchParams` 同步 `q` / `category` / `skill` / `view`（`reference` | `demo` | `skill`）。
- **子路径**：`<base href="/ui-design-skills/">`，构建注入 `config.js` 中的 `BASE_PATH`；资源与路由均相对 base。
- **演示**：七段原创 HTML/CSS/JS 交互，页内标注「原创演示，非原作实现」；参考图标注 metadata 中的 `third-party-reference` 说明。
- **部署**：GitHub Actions `build` → `upload-pages-artifact` → `deploy-pages`（仅 `master`）；PR 工作流只构建 + 校验，不部署。
- **Gitee Pages**：同套 `docs/` 产物可镜像；官方 Pages 入口当前不可用，不承诺 `gitee.io` 可达，仅交付可同步源码与 manifest。

## 可访问性

- `focus-visible`、跳过链接、读屏标题/landmark、`aria-live` 反馈复制结果；`prefers-reduced-motion` 关闭动效；移动端单列/详情堆叠。
