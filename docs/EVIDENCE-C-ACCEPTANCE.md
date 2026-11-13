# 作品证据厅 · 发布前验收（Direction C + Vercel 索引）

目标站点：https://wen-haoming.github.io/ui-design-skills/（GitHub Pages，`master` 推送触发 `.github/workflows/pages.yml`）。

## 公开 catalog 行数口径（`catalog-content.json` → `items.length`）

| 说明 | 数值 |
| --- | --- |
| **当前公开 catalog 总行数** | **205** |
| 其中可体验作品 | 9 |
| Vercel 官方上游技能行（合并后） | 89 |
| 研究包目录记录（数据溯源） | 89（20 精选 + 69 新收录；React 别名折叠 1 条，≠89 个已安装包） |
| 场景 primary 入口 | 8 |
| 重点精读条目 | 18 |
| 合并时并入既有 Vercel 行 | 20 |
| 合并时新增 Vercel 行 | 69 |
| 本轮自拟通用方法（Vercel 扩展） | 2 |

**不要误读**：205 不是「134 + 69」；134 为整合前一次公开行数快照，已与 Vercel 按 URL/名称去重合并。`items` 含作品、方法、歸藏/antfu/索引/工具等全部类型，不能当作「技能总数」。

## 保护基准（合并前须仍为下列 SHA）

| 对象 | SHA256 |
| --- | --- |
| 聚合 Skill `SKILL.md`（v1.2） | `00e4aabcd149f55bdf6160d5cc4df57ff7cf9f0591c3221cfcc8f5910f9e3c5f` |
| `benchmarks/task-workbench-v1.json` | `dc046a826677f98d990fb8afd00b17dee69d81e950f90dfc43b1edcc173e0d89` |
| `article-sample.md`（剪贴板验收） | `12bb44a66c7b5eaac174e7bf9b53e519fe88f99931896dd835583e88c6e03497` |

## 本地验收（发布准备）

```bash
npm run verify
npm run docs:build
PREVIEW_BASE=http://127.0.0.1:4173/ui-design-skills/ node scripts/ui-clipboard-verify.mjs
PREVIEW_BASE=http://127.0.0.1:4173/ui-design-skills/ node scripts/ui-evidence-acceptance.mjs
npm run verify:ui
```

## 已测 / 未测

- **已测**：`verify` / `docs:build` / 8 工作台 + 排版 E2E / 目录搜索·Vercel 场景·深链·空态·复制·AGPL 横幅
- **未测**：69 条上游 Skill 在目标项目中实跑；研究包 37/37 离线规则 ≠ 上游 SDK 运行通过

## Pages 合并后核验

1. 在 GitHub 合并 PR 至 `master` 后，查看 Actions「Deploy GitHub Pages」对应该 commit 为绿。
2. 打开 `https://wen-haoming.github.io/ui-design-skills/catalog?author=vercel&id=upstream:vercel-exp:ai-gateway`，确认 8 场景条、左侧选中态、详情与下载链接。
3. 可选：对线上 HTML 中 `catalog-content.json` 检查 `items` 长度与 `vercelExpansion` 字段。

## Gitee 镜像（本轮只读）

仓库当前仅配置 `origin` → `github.com/wen-haoming/ui-design-skills`，**无** `gitee` remote。正式发布后需由具备 Gitee 推送权限的一方同步 `https://gitee.com/haomingla/ui-design-skills`（本轮不推、不索要凭据）。

## 截图（viewport 实拍，路径 `/opt/cursor/artifacts/`）

见当轮 Agent 报告文件名：`evidence-home-*-viewport.png`、`catalog-vercel-*-viewport.png`。

## PR

合并由仓库主者在 GitHub 执行；Agent 仅推送 `cursor/works-evidence-gallery-b711` 至合并前 head（见当轮报告的 SHA）。
