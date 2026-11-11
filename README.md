# UI Design Skills

仓库包含两类内容：

1. **聚合 Skill「多风格界面设计」**（公开展厅主入口）：同一场景、同一 `benchmark.json` 上的三套原创任务工作台（`shallow-precise` / `dark-command` / `soft-system`）。
2. **遗留七单项技能**（`ui-design/`）：版权与第三方参考图说明保留，入口在站内 [/legacy/](https://wen-haoming.github.io/ui-design-skills/legacy/)。

## 在线展厅（VitePress）

```bash
npm ci
npm run docs:gen          # 生成 public 数据与遗留页
npm run docs:build        # 含模板 zip 打包 + VitePress 构建
npm run verify
npm run covers            # 需 docs:preview 在 4173 端口，截取原创封面
npm run docs:preview
```

- **URL**：https://wen-haoming.github.io/ui-design-skills/
- **canonical Skill SHA256**：`41e89eb8c6eda2b16afd9587d47722d39868d4a53e0ffd31e9bb02bc475ab61e`
- **固定基准**：`benchmarks/task-workbench-v1.json`（`asOf=2026-11-18`，`doneThisWeek=2`）

模板可独立运行：下载 `docs/public/downloads/task-workbench-*.zip`，解压后 `npm ci && npm run dev`。

## Gitee

可镜像本仓库源码；Gitee Pages 暂停，不承诺 `gitee.io`。
