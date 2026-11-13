# 去重、primary与候选边界

## 保留既有轻量路由，不平行造总入口

父级已有id=vercel的“Vercel技能选用”。本执行环境加载该id时正文缺失；本轮以既有文件包作为去重基线，没有改正式Skill或记忆。建议父级只增补下表路由，不把本包全文塞入默认上下文。

|任务|一个primary|只有需要时补充|
|---|---|---|
|组件API、受控状态和键盘/焦点|building-components|现有Refero设计研究；web-design-guidelines审成品|
|Vue生成式UI|json-render/vue（仓库限定）|core定义catalog；现有Vue规范，不换React|
|React流式中文Markdown|streamdown|ai-sdk处理消息协议；现有文字排版技能处理视觉|
|网页AI聊天界面|ai-elements或ai-sdk，按当前问题选一|工具状态或传输具体缺项再补另一条|
|跨平台消息机器人|chat-sdk|模型循环ai-sdk；长等待workflow|
|异步扇出/缓冲|queues|多步暂停/审批才换workflow|
|持久多步任务|workflow|平台适配器/数据库技能按需|
|不可信代码隔离|vercel-sandbox|目标不是Vercel就用该平台的sandbox技能|
|缓存旧内容/命中率|cdn-caching|函数内数据缓存runtime-cache|
|慢服务端链路|vercel-tracing|数值聚合custom-metrics；浏览器问题仍需profiling|
|第三方短期凭据|vercel-connect|实际provider/API skill；不能代替业务审批|
|Next首载bundle|next-bundle-optimizer|next-dev-loop验行为；Vue不用这条|

## 同族不重复统计、不重复安装

- 官方vercel-react-best-practices与插件react-best-practices折叠为1记录。
- 插件README明确上游：ai-sdk→vercel/ai；chat-sdk→vercel/chat；eve→vercel/eve；workflow→vercel/workflow；flags-sdk/vercel-flags→vercel/flags；vercel-cli→vercel/vercel；vercel-sandbox→agent-browser的版本化模块。它们在discovery里出现的副本不增加主目录统计。
- 上游路径可能与插件名不同，例如vercel/ai的use-ai-sdk、vercel/chat的chat；不把相似目录猜成已安装名。包内docs随installed version走，远程commit供本次资料复现，不强迫旧项目升级到remote。
- agent-browser/skills/agent-browser是hidden discovery stub，不是完整操作手册；按需`skills get core`，不要默认`--full`。其偏好CLI、登录状态或HAR派生的建议不能覆盖宿主优先connector、凭据与审批规则。未执行CLI，也不声称节省百分比。
- json-render/core和vue是同产品不同职责，并非两套泛前端规范；其32目录包含renderer/store/工具细分，不等于32个独立方法。Remotion实践集不据此认定Vercel原创，已有Remotion技能继续用上游。
- Next/.agents里的维护、回迁、内部PR技能与examples/fixture不是面向应用开发者的官方通用技能包；不通装。

## 不重写已有通用方法

来源核验、证据闭环、工程约定、PR证据说明、消融验证、多角色协作、视觉参考聚合、文字排版都已有覆盖。因此不再保存“优化要有证据”“设计要好看”“先看版本”等同义新Skill，也不把Vercel API改名包装成自研。

候选仅2项：
1. **可重放任务的副作用账本**：新增的是至少一次交付/恢复/审批重放下的业务幂等、原子边界和未知结果处理，不是普通任务清单。
2. **声明式生成界面的能力边界**：新增的是catalog白名单、树约束、可丢失修复和动作服务端授权分离，不是视觉生成或排版。

两份均是原创通用草稿，非官方Skill，未安装。只通过自建离线模型示例；真实存储并发、外部API和浏览器交互仍需项目实测。若父级已有同样覆盖，合并现有方法，不新增同义入口。

补充：find-skills上游把安装量/星标当推荐信号，本包只取发现入口；安装量不是验证结果，不能以此替代源码/许可/安全与项目实测，也未执行其全局-y安装命令。
