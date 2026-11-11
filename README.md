# UI Design Skills

仓库包含两类内容：

1. **聚合 Skill「多风格界面设计」v1.2**（公开展厅主入口）：
   - **任务工作台** `task-workbench-v1`：**8 个可运行组合**（5 风格 × `list-detail` + 3 种 `shallow-precise` 布局变体）。
   - **正文排版** `article-typesetting-v1`：同篇示例文稿 **3 种 typography**（`reading-longform` / `editorial-magazine` / `compact-notes`），入口 [/typography](https://wen-haoming.github.io/ui-design-skills/typography)。
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
- **canonical Skill SHA256（v1.2，当前）**：`00e4aabcd149f55bdf6160d5cc4df57ff7cf9f0591c3221cfcc8f5910f9e3c5f`（与 `ui-design/aggregate/multi-style-ui-design/SKILL.md`、`docs/public/data/skill-canonical.txt` 字节一致）
- **Skill 历史**：v1.1 `9586f8cf47a7ad060a2ed44697de69718f626e277d00baf88315229f38f9b43d` → `docs/public/data/implementation-trace-v1.1.json`；v1.0 → `implementation-trace-v1.0.json`
- **任务基准**：`benchmarks/task-workbench-v1.json`（SHA256 `dc046a826677f98d990fb8afd00b17dee69d81e950f90dfc43b1edcc173e0d89`；`asOf=2026-11-18`；基准 2 条 `done`，UI 显示「已完成」= 当前 `status=done` 计数）
- **文稿基准**：`benchmarks/article-typesetting-v1.json`（SHA256 `8cd7417dd6fc784961dc56843cd0be9022483fe064bf4b8a6f372d1387326179`）

校验文件分工：`benchmarks/task-workbench-v1.sha256` 只核对工作台 JSON；`benchmarks/skill-canonical.sha256` 核对当前 Skill 并注明历史哈希行（注释，不参与 `sha256sum -c`）。

模板可独立运行：下载 `docs/public/downloads/task-workbench-*.zip` 或 `article-typesetting-v1.zip`，解压后 `npm ci && npm run dev`。

## Gitee

可镜像本仓库源码；Gitee Pages 暂停，不承诺 `gitee.io`。增量镜像包以当次交付 manifest 为准（delta 非全站 zip）。
