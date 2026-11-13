# 第一方来源、版本钉选与许可

研究起点由box时钟证明：2026-11-14 01:57:29 Asia/Shanghai；下表元数据记录于source-observations.json的recorded_at。读取跨越本轮各次工具调用，未伪造逐文件精确读取秒。文件最终生成/检查时间另见README与validation.json。

使用已连接GitHub只读源工具（commit、directory、file、code-search），没有clone、gh/raw API绕路或云代理修改。WebFetch只用于官方Next文档与skills.sh活页；没有网络错误或重试绕过。远程repo commit时间均已换算Asia/Shanghai。

|来源范围|固定commit与类型|提交时间 Asia/Shanghai|源码许可证据|
|---|---|---|---|
|[vercel/vercel-plugin](https://github.com/vercel/vercel-plugin)|[`b004b4098274bb1b3a0290623260e23432437b4b`](https://github.com/vercel/vercel-plugin/commit/b004b4098274bb1b3a0290623260e23432437b4b)；HEAD|2026-11-13T02:56:37+08:00|[Apache-2.0](https://github.com/vercel/vercel-plugin/blob/b004b4098274bb1b3a0290623260e23432437b4b/LICENSE)|
|[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)|[`1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62`](https://github.com/vercel-labs/agent-skills/commit/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62)；HEAD|2026-10-28T05:40:02+08:00|[MIT（README 声明；根 LICENSE 未在本轮重查）](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/README.md)|
|[vercel/next.js](https://github.com/vercel/next.js)|[`0cf3769051fbc0e09346624f1f5bd26159df5875`](https://github.com/vercel/next.js/commit/0cf3769051fbc0e09346624f1f5bd26159df5875)；canary 的 skills/ 最近变更提交，非整个仓库 HEAD|2026-11-09T18:38:48+08:00|[MIT](https://github.com/vercel/next.js/blob/0cf3769051fbc0e09346624f1f5bd26159df5875/license.md)|
|[vercel-labs/json-render](https://github.com/vercel-labs/json-render)|[`f5c12405a19c45be5e0e90778ef888ed541b208f`](https://github.com/vercel-labs/json-render/commit/f5c12405a19c45be5e0e90778ef888ed541b208f)；HEAD|2026-11-13T17:14:23+08:00|[Apache-2.0](https://github.com/vercel-labs/json-render/blob/f5c12405a19c45be5e0e90778ef888ed541b208f/LICENSE)|
|[vercel/components.build](https://github.com/vercel/components.build)|[`0861fbcfe4f78c50eaafc202f5fb7661d641ddff`](https://github.com/vercel/components.build/commit/0861fbcfe4f78c50eaafc202f5fb7661d641ddff)；HEAD|2026-11-10T20:50:17+08:00|[Apache-2.0](https://github.com/vercel/components.build/blob/0861fbcfe4f78c50eaafc202f5fb7661d641ddff/LICENSE)|
|[vercel/streamdown](https://github.com/vercel/streamdown)|[`db1a468ac81ba7b440a2ea31fe2294bba8cae276`](https://github.com/vercel/streamdown/commit/db1a468ac81ba7b440a2ea31fe2294bba8cae276)；HEAD|2026-11-14T01:35:10+08:00|[Apache-2.0](https://github.com/vercel/streamdown/blob/db1a468ac81ba7b440a2ea31fe2294bba8cae276/LICENSE)|
|[vercel/ai-elements](https://github.com/vercel/ai-elements)|[`ca8be600bfd01b3131f9bf6134b51602a71f4374`](https://github.com/vercel/ai-elements/commit/ca8be600bfd01b3131f9bf6134b51602a71f4374)；HEAD|2026-10-15T01:02:55+08:00|[Apache-2.0](https://github.com/vercel/ai-elements/blob/ca8be600bfd01b3131f9bf6134b51602a71f4374/LICENSE)|
|[vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)|[`4720bc3dd73f2c8f7c84f415adfa560330b924c4`](https://github.com/vercel-labs/agent-browser/commit/4720bc3dd73f2c8f7c84f415adfa560330b924c4)；HEAD|2026-11-13T14:09:22+08:00|[Apache-2.0](https://github.com/vercel-labs/agent-browser/blob/4720bc3dd73f2c8f7c84f415adfa560330b924c4/LICENSE)|
|[vercel-labs/skills](https://github.com/vercel-labs/skills)|[`b716f9dc2ba36b6aa8f0080615e5a3a6caeac63b`](https://github.com/vercel-labs/skills/commit/b716f9dc2ba36b6aa8f0080615e5a3a6caeac63b)；HEAD|2026-11-13T07:25:22+08:00|[MIT](https://github.com/vercel-labs/skills/blob/b716f9dc2ba36b6aa8f0080615e5a3a6caeac63b/LICENSE)|

## 阅读与溯源层级
- 逐条入口URL与commit见catalog.json；重点14全文/4章节，以及references具体范围见重点用法.md。不能以“拿到了整个文件”冒充读完所有正文；4个大文件明确只精读列出的段落。
- components.build是官方组织仓库中的组件工程指南，正文内容大量用React示例；跨框架迁移的是原则，不是其React代码。
- 官方plugin的README上游表确认AI SDK、Chat SDK、Workflow、Eve、Flags、CLI、Sandbox发源。其它仓库的维护技能、迁移脚本或测试fixture只在discovery留线索；“属于官方组织”和“官方原创且适合普通应用开发者”不等同。
- json-render32条中存在Remotion最佳实践、skill-creator等可能收录/通用工具条目。没有逐个原创审计；不将这32条宣称为32个Vercel独创方法。Remotion副本的独立许可未审，不重新分发其正文。
- agent-browser和skills CLI是工具与技能载体：这里只收录一个公开stub和一个find-skills入口；不把所有模块或CLI子命令算成多个独创Skill。

## URL核验与旧名
- 本轮重点SKILL.md与已列参考由GitHub文件工具实际返回正文，不是凭搜索生成链接。目录-only项仅验证所在目录/索引，未逐项抓取SKILL；这点已逐条记录。
- Next官方AI agents活页实际读取成功，列出6个工作流技能与bundle optimizer v16.4.0加入的Version History：https://nextjs.org/docs/app/guides/ai-agents
- skills.sh活页实际读取成功：https://skills.sh/vercel-labs/agent-skills 。其“16 skills”不等于所钉官方目录9项，不能以安装量或热度判有效。
- 旧vercel-deploy的404是既有基线证据，本轮未重复请求，不能写成本轮新发现；不推荐旧命令。没有新观察到的迁出/改名。
- discovery.json来自本轮实时官方组织code-search；525路径只作发现，不逐个验证当前文件URL，也不提供这些未核候选的安装命令。索引的分页total_count变化使其不能作为穷尽分母。

## 许可与再使用
- plugin、json-render、components.build、streamdown、ai-elements、agent-browser：本轮实际读取根LICENSE，为Apache-2.0；Next与skills CLI根许可为MIT。agent-skills仅README标MIT，根LICENSE此前404，本轮未重查。
- 仓库许可不自动覆盖第三方vendored规则、依赖、商标、截图/图片或付费平台条款；不因Skill建议就获资源创建/计费/发布权限。
- 本公开包只包含独立中文摘要、原创方法草稿、少量名称/事实与自建测试，未打包完整上游SKILL/reference实现、图片或真实凭据。源码需从原仓库取，复制时保留其license/notice等义务。
- 两份原创方法不是Vercel官方出品；通用账本/outbox/能力白名单思想不声称由Vercel首创。父级审读后决定是否并入既有Skill。
