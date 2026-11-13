# 作品证据厅 · 验收记录（含 Vercel 扩展整合）

## 去重与计数口径

| 口径 | 数值 |
| --- | --- |
| 整合前公开 catalog 行数 | 134 |
| 研究包目录记录 | 89（精选 20 + 新收录 69，React 别名折叠 1） |
| 并入既有 Vercel 行（按 URL/名称） | 20 |
| 新增 Vercel 上游行 | 69 |
| 整合后 items 总行数 | **205**（+69 Vercel 行 +2 自拟通用方法；**不是** 134+69 无去重） |
| 站点 Vercel「官方上游技能」行 | **89** |

## 测试

- `npm run verify` / `npm run docs:build`：通过
- `npm run verify:ui`、`ui-evidence-acceptance.mjs`、`ui-clipboard-verify.mjs`：通过（Skill / 文稿 SHA 未变）
- 未测：上游 69 条 Skill 实跑、研究包 37/37 离线规则在目标项目 SDK 中的运行

## 截图（`/opt/cursor/artifacts/`）

- `evidence-home-1280-viewport.png`、`evidence-home-390-viewport.png`（viewport 实拍）
- `catalog-vercel-1280-viewport.png`、`catalog-vercel-390-viewport.png`（含 8 场景入口与 ai-gateway 详情）

## PR

仅更新 [PR #1](https://github.com/wen-haoming/ui-design-skills/pull/1) 分支 `cursor/works-evidence-gallery-b711`，不合并、不部署。
