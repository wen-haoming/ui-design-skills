# 相对11/13基线的增量：不要把漏收说成新发布

基线：既有包中20条精选；读取时其目录材料mtime为2026-11-13 20:31（Asia/Shanghai）。本轮只建新目录，旧包未覆盖。精读与收录是两个口径。

## 基线来源的当前核对

|来源|11/13基线|本轮|结论与时间证据（Asia/Shanghai）|
|---|---|---|---|
|vercel-labs/agent-skills|1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62|相同HEAD；skills目录9个（8+writing），5个zip另算发行产物|最近提交2026-10-28 05:40:02；没有相比基线新增/重命名/更新证据|
|vercel/vercel-plugin|0.55.1 / b004b4098274bb1b3a0290623260e23432437b4b / 38项|package与HEAD相同；目录38|最近提交2026-11-13 02:56:37，firewall文档同步；它已在上次基线，不是本轮新增|
|vercel/next.js skills/|已读next-dev-loop@d2defa02；其余只提到部分名字|完整列6个技能；目录最近变更0cf3769051fbc0e09346624f1f5bd26159df5875|目录最后变更2026-11-09 18:38:48，dev-loop正文最近变更仍d2defa02 / 2026-11-04 23:19:30；前提仍16.3+/Turbopack/next dev/agent-browser≥0.31.1|

Next的0cf是`skills/`最后变更commit，不是整个Next仓库HEAD。不能把“上次只钉了某文件”和“本次目录钉选不同”说成昨天发生更新。

**本轮没有证明这三个基线来源在11/13盘点后“又新增很多”。已确认相比基线的新发布=0、新命名/迁出=0、基线内容实质更新=0。**这不是证明整个公司一天内绝对没有发布；其它候选没有全部追溯创建历史。

## 本次真正扩展的内容

- 3个基线来源完整目录共有53入口；React插件包装折叠后52记录。不是原来只有20个官方Skill。
- 再核json-render的32目录；components.build、streamdown、ai-elements各1入口；agent-browser发现stub与skills CLI find-skills各1入口。
- 合计90入口，折叠1个React别名=89条目录记录；包含原精选20，本轮新增索引69。这里的“新”是本次收录，不是新发布，更不意味着69个原创方法。
- 重点18条中15条在原20精选之外；另外cdn-caching、runtime-cache、vercel-storage三条是旧收录、这次补正文深度。18条里14条全文SKILL.md，4条章节精读。next-dev-loop是重核，不重复算新增精读。
- 原创方法候选2份，不是把上游18条翻译重装。父级审核后再决定是否保存。

## 新来源更新日期，不能滥用仓库HEAD

- json-render仓库HEAD：2026-11-13 17:14:23；skills/最后变更：2026-11-13 05:32:27（13c9786164139fae424e6449cd36ecea7641fe4d），都早于上次包mtime。本轮未逐个追创建时间。
- components.build仓库HEAD：2026-11-10 20:50:17；skills/最后变更：2026-02-12 09:04:25（787c75a5ca81167e70825cc3fdcfa2ddb46b23f2）。不是新发布。
- streamdown仓库HEAD：2026-11-14 01:35:10；但skills/streamdown最后变更是2026-11-10 23:57:31（096a06bc965bd4d7420bc770fdb1d44662459cb4）。当天新HEAD不证明Skill当天更新。
- ai-elements HEAD为2026-10-15 01:02:55；本轮没有它相对11/13的新增证据。

## 索引/正文差异与旧名

- skills.sh当前页面写16 skills，但已钉官方目录只有9个Skill目录，另有zip；不能把索引16当官方当前数目。页面仍露出旧vercel-deploy；保留基线的“该旧入口已404”结论，本轮没有再打旧路径；不要推荐旧命令。
- 插件README表当前未列vercel-tracing，目录存在且本文读完正文与performance参考。列目录比只抄README多发现一个入口，**不代表今天才新增**。
- 插件Sandbox README仍写ephemeral，当前正文讲SDK v2默认named/persistent；Streamdown useChat示例仍有旧字段。版本匹配文档优先，不盲抄宣传和示例。
- 本环境实际插件缓存package仍0.53.0；远程0.55.1与可调用目录不是“本机已升级”。本轮没有安装更新。

## 全量发现的限制

官方两个组织的6个代码搜索分页合并去重得到525条公开路径（均核repository.private=false）。其中含mdx误匹配、fixture、仓库贡献工具、模板、重复副本；不是525个Skill。Labs分页total_count在302/356/357间变化，说明索引不稳定，不能承诺组织搜索穷尽。`discovery.json`保留每个路径的处置，额外候选未核许可/正文，不计89条可复现目录记录、不推荐其安装命令。90入口的分母来自直接目录/文件核验，不来自搜索热度。
