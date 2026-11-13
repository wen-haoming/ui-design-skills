# Vercel公开Skills扩展包（非官方整理）

研究开始：2026-11-14 01:57:29 Asia/Shanghai；最终检查时间见validation.json。保留原11/13包未覆盖；未改仓库、站点、正式Skill或记忆，也未创建Page、安装插件、部署或联系第三方。

## 先说结论

没有证据说明基线三个官方来源在隔日又新增很多：agent-skills与plugin HEAD没变，Next skills最后变更也早于基线。价值在于补齐漏收与补读，而不是迎合“最近新出了很多”。

- **90个入口 → 89条去别名目录记录**：agent-skills9、plugin38、Next6、json-render32，另5个指定入口。仅已确认React包装折叠；产品子技能不等于独创方法数，第三方收录不认领为Vercel原创。
- 包含原精选20，本轮新增**69条目录索引**；重点展开**18条**（15条基线20之外、3条旧项补深）。14条全文SKILL.md，4条定向章节，未谎称读完全部references。
- 官方组织检索另合并525个公开路径，逐条分类保留发现线索；含误匹配/模板/维护工具/副本。**不是525个Skill，也不是公司级穷尽清单**；索引分页不稳定，未核候选不推荐安装。
- 原创候选**2份**，不是18条上游翻译换壳；父级审核后决定保存/合并。保留现有vercel轻量路由，只给增补建议。
- 自建离线检查**37/37通过**；没有跑上游平台或真实项目，不声称性能、安全、部署或token节省实测。

## 先用什么

组件工程→building-components；Vue生成式表单→json-render/vue按需补core；React中文流式内容→streamdown；跨平台机器人→chat-sdk；后台扇出/多步审批分别选queues/workflow；缓存排障→cdn-caching；慢服务端链路→vercel-tracing。具体18条均有中文调用、适用/不适用、输入、版本前置、预期输出、验收与来源。

Vue/VitePress/小程序不强塞Next/React。网页useChat和跨Slack等平台Chat SDK不是同一问题。插件远程0.55.1≠本环境已装：本轮只读缓存仍0.53.0。实施前查目标项目installed version和包内docs；本次没有目标项目，不能声称已核安装版本。

## 文件导航

- catalog.md/json：上述核验范围的完整目录、commit、名称映射、逐项阅读深度/调用状态。
- 重点用法.md：18条实际使用方法，含上游示例的版本/安全陷阱（Streamdown旧useChat与域名后缀、缓存指标计量单位等）。
- delta.md：基线/当前、时间证据、新发现vs新发布/更新/未变。
- source-license.md、source-observations.json：公开来源、许可与版本钉选。
- discovery.json：525个公开文件发现及排除/待核理由，不混入主计数。
- dedup.md、路由增补建议.md：一个primary按需补充，不通装、不替换现有路由。
- 原创候选/：可重放任务副作用账本；声明式生成界面能力边界。
- offline/：自建规则源码、运行结果与未测项；validation.json：交付结构/隐私检查。

本包为公共文件材料，未上传/发布到外部。ZIP和SHA256在同级输出；包内不含上游完整实现、私有账户/凭据或图片。不要将任何示例视为生产发布、付款、发消息或安装授权。
