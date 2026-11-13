#!/usr/bin/env node
/**
 * 将 Vercel 扩展研究包并入公开 catalog（与站点既有 20 条按 source_url 去重，不重复加旧项）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const EXP_DIR = path.join(ROOT, 'benchmarks/vercel-expansion/vercel-skills-expansion-2026-11-14');
const EXP_CATALOG = path.join(EXP_DIR, 'catalog.json');

export const VERCEL_SCENARIO_IDS = [
  'building-components',
  'json-render/vue',
  'streamdown',
  'chat-sdk',
  'queues',
  'workflow',
  'cdn-caching',
  'vercel-tracing',
];

function normUrl(u) {
  if (!u) return '';
  return u.replace(/\/+$/, '').toLowerCase();
}

function userReadDepth(exp) {
  if (exp.tested_upstream) return '上游已在本环境尝试过（见条目说明）';
  const d = exp.read_depth || '';
  if (/SKILL\.md全文/.test(d)) return '已阅读上游 SKILL.md 正文（本数据集标注，非本站实跑）';
  if (/定向章节|references/.test(d)) return '已阅读 SKILL.md 加部分章节（非全文逐字）';
  if (/目录|索引|frontmatter/.test(d)) return '仅目录或 README 索引，未读 SKILL 正文';
  return '未在本站安装或运行上游';
}

function expansionToItem(exp) {
  const use = exp.use;
  const name = exp.frontmatter_name || exp.id;
  let purpose = use?.applicable || exp.baseline_use_notes || '';
  if (!purpose && exp.description) purpose = String(exp.description).slice(0, 280);
  if (!purpose) purpose = exp.recommendation || '见官方 SKILL 与仓库说明';

  const inputs = use?.inputs || (use?.prerequisites ? `前置：${use.prerequisites}` : '');
  const notApp = use?.not_applicable || '';
  const inputOutput = [notApp && `不适用：${notApp}`, inputs && `输入：${inputs}`].filter(Boolean).join('\n');

  const callExample =
    use?.chinese_prompt ||
    (exp.environment_call_name
      ? `请在上游仓库阅读「${name}」SKILL.md 后再调用；本站不代为安装。\nnpx skills add <官方仓库URL> --skill ${exp.environment_call_name || name}`
      : `请阅读上游 SKILL 后再按项目配置调用「${name}」。本站不代为安装或执行。`);

  const constraints = [];
  if (use?.rules?.length) constraints.push(...use.rules.map((r) => `规则：${r}`));
  if (use?.observable_acceptance?.length)
    constraints.push(...use.observable_acceptance.map((a) => `验收参考：${a}`));
  if (!exp.tested_upstream) constraints.push('上游未在本站实跑；公开包内离线规则检查不等于 SDK 运行通过。');
  if (exp.installed_version_checked?.includes('未检查'))
    constraints.push('调用前请核对目标项目 package.json / lockfile 中的实际版本。');

  const taskScenarios = [];
  if (/排版|stream|markdown|中文/i.test(purpose + callExample)) taskScenarios.push('content-creation', 'typography');
  if (/组件|界面|web-design|composition/i.test(purpose)) taskScenarios.push('ui-design');
  if (/ai|chat|workflow|queue|gateway/i.test(name + purpose)) taskScenarios.push('tool-efficiency', 'frontend-engineering');
  if (!taskScenarios.length) taskScenarios.push('frontend-engineering');

  return {
    id: `upstream:vercel-exp:${exp.id}`,
    name,
    kind: 'official_upstream',
    category: 'vercel-expansion-2026-11-14',
    taskScenarios: [...new Set(taskScenarios)],
    purpose,
    inputOutput: inputOutput || undefined,
    callExample,
    sourceUrl: exp.source_url,
    officialUrl: exp.source_url?.split('/blob/')[0] ? exp.source_url.replace(/\/blob\/[^/]+\/.*/, '') : exp.source_url,
    license: exp.source_license || '见上游仓库 LICENSE',
    licenseNote: exp.license_scope,
    knownConstraints: constraints.slice(0, 8),
    reviewDepth: userReadDepth(exp),
    demoRoutes: [],
    authorFilter: 'vercel',
    vercelCatalogId: exp.id,
    vercelScenarioPick: VERCEL_SCENARIO_IDS.includes(exp.id),
    vercelFocus: Boolean(exp.focus),
    vercelNewlyIndexed: Boolean(exp.newly_cataloged),
    vercelCommit: exp.commit,
    vercelRepository: exp.repository,
  };
}

function mergeTwo(siteItem, fromExp) {
  const out = { ...siteItem };
  if (fromExp.purpose && fromExp.purpose.length > (out.purpose?.length || 0)) out.purpose = fromExp.purpose;
  if (fromExp.inputOutput) out.inputOutput = fromExp.inputOutput;
  if (fromExp.callExample && !/打开站内作品页/.test(out.callExample || '')) {
    out.callExample = fromExp.callExample;
  }
  out.vercelCatalogId = fromExp.vercelCatalogId;
  out.vercelScenarioPick = fromExp.vercelScenarioPick;
  out.vercelFocus = fromExp.vercelFocus;
  out.vercelNewlyIndexed = fromExp.vercelNewlyIndexed;
  out.vercelCommit = fromExp.vercelCommit;
  out.vercelRepository = fromExp.vercelRepository;
  if (fromExp.licenseNote && !out.licenseNote) out.licenseNote = fromExp.licenseNote;
  if (fromExp.sourceUrl && (!out.sourceUrl || out.sourceUrl.length < fromExp.sourceUrl.length)) {
    out.sourceUrl = fromExp.sourceUrl;
  }
  if (fromExp.officialUrl && !out.officialUrl) out.officialUrl = fromExp.officialUrl;
  const merged = new Set([...(out.knownConstraints || []), ...(fromExp.knownConstraints || [])]);
  out.knownConstraints = [...merged].slice(0, 10);
  out.reviewDepth = fromExp.reviewDepth || out.reviewDepth;
  out.category = out.category || 'vercel-expansion-merged';
  return out;
}

export const EXP_ID_TO_SITE = {
  'react-best-practices': 'upstream:vercel:vercel-react-best-practices',
  'composition-patterns': 'upstream:vercel:vercel-composition-patterns',
  'react-view-transitions': 'upstream:vercel:vercel-react-view-transitions',
};

function siteIdForExp(exp) {
  if (EXP_ID_TO_SITE[exp.id]) return EXP_ID_TO_SITE[exp.id];
  const slug = exp.id.replace(/\//g, '-');
  return `upstream:vercel:${slug}`;
}

function findExistingVercel(pub, maps, exp) {
  const urlKey = normUrl(exp.source_url);
  if (maps.byUrl.has(urlKey)) return maps.byUrl.get(urlKey);
  const siteId = siteIdForExp(exp);
  if (maps.byId.has(siteId)) return maps.byId.get(siteId);
  const call = (exp.environment_call_name || '').toLowerCase();
  if (call && maps.byName.has(call)) return maps.byName.get(call);
  if (maps.byName.has(exp.id.toLowerCase())) return maps.byName.get(exp.id.toLowerCase());
  const fname = (exp.frontmatter_name || '').toLowerCase();
  if (fname && maps.byName.has(fname)) return maps.byName.get(fname);
  return null;
}

function addSelfAuthoredFromExpansion(pub) {
  const defs = [
    {
      id: 'method:vercel-expansion:replay-safe-effects-ledger',
      name: '可重放任务的副作用账本',
      purpose:
        '用于消息重复投递、工作流恢复或审批回调可能重放的任务，设计副作用幂等与未知结果恢复；不授予发送、支付、发布或资源变更权限。',
      inputOutput:
        '不适用：无副作用纯计算、或没有远端/存储配合却要求“恰好一次”。输入：业务操作与对象版本、外部副作用步骤、重试来源、持久存储与幂等能力、审批边界。',
      callExample:
        '审查这个任务的重复交付与崩溃窗口，只给幂等账本和反例，不执行外部副作用。尤其覆盖远端成功、checkpoint 失败的 unknown 状态。',
      license: '本站通用方法草稿（非官方 Skill，未安装）',
      licenseNote: '综合公开 workflow、queues 等思路整理的原创归纳；不含可下载正式 canonical，不冒充上游包。',
      knownConstraints: [
        '纯 Python 离线示例仅验证自建规则，不是平台 SDK 认证。',
        '不能在没有远端幂等与原子存储时保证恰好一次。',
      ],
      reviewDepth: '基于公开材料整理的通用草稿，未在本站安装运行',
    },
    {
      id: 'method:vercel-expansion:constrained-generated-ui-boundary',
      name: '声明式生成界面的能力边界',
      purpose:
        '用于模型生成 JSON 表单、组件树或仪表盘规格时，在渲染前限制结构和可用能力，并将动作授权留在服务端；不代替设计研究、业务审批或安全审计。',
      inputOutput:
        '不适用：直接可信的静态页面；不把“合法 JSON”当安全代码。输入：组件目录、树约束、状态路径、动作白名单、服务端权限与回退方案。',
      callExample:
        '让 AI 只能在这四个组件内组合表单，先给 catalog、树约束、状态路径与动作权限表，列出越权与有损修复反例，不调用模型或执行提交。',
      license: '本站通用方法草稿（非官方 Skill，未安装）',
      licenseNote: '参考 json-render、Streamdown 安全说明的原创归纳；上游 Apache-2.0 仅适用于其仓库，本草稿不复制实现。',
      knownConstraints: [
        '自建离线 schema 示例不是 json-render / Streamdown 库实现或安全认证。',
        '未跑浏览器、生成器、生产权限或平台 API。',
      ],
      reviewDepth: '基于公开 SKILL 与参考章节整理的通用草稿，未在本站安装运行',
    },
  ];
  for (const d of defs) {
    if (pub.items.some((i) => i.id === d.id)) continue;
    pub.items.push({
      ...d,
      kind: 'self_authored_method',
      category: 'vercel-expansion-general-methods',
      taskScenarios: ['frontend-engineering', 'tool-efficiency'],
      authorFilter: 'self',
      demoRoutes: [],
    });
  }
}

export function mergeVercelExpansion(pub) {
  if (!fs.existsSync(EXP_CATALOG)) return pub;
  const expansion = JSON.parse(fs.readFileSync(EXP_CATALOG, 'utf8'));
  const expItems = expansion.items || [];

  const maps = { byUrl: new Map(), byId: new Map(), byName: new Map() };
  for (const it of pub.items) {
    maps.byId.set(it.id, it);
    if (it.authorFilter === 'vercel' || it.id?.includes('vercel')) {
      const u = normUrl(it.officialUrl || it.sourceUrl);
      if (u) maps.byUrl.set(u, it);
      maps.byName.set((it.name || '').toLowerCase(), it);
      if (it.id.startsWith('upstream:vercel:')) {
        maps.byName.set(it.id.replace('upstream:vercel:', '').toLowerCase(), it);
      }
    }
  }

  let mergedCount = 0;
  let addedCount = 0;
  let skippedBaselineDuplicate = 0;
  const seenExpIds = new Set();

  for (const exp of expItems) {
    if (exp.id === 'react-best-practices' && exp.aliases?.length) continue;
    const converted = expansionToItem(exp);
    let existing = findExistingVercel(pub, maps, exp);

    if (existing) {
      const idx = pub.items.indexOf(existing);
      if (idx >= 0) {
        pub.items[idx] = mergeTwo(existing, converted);
        mergedCount++;
      }
      continue;
    }

    if (exp.baseline_selected) {
      skippedBaselineDuplicate++;
      continue;
    }

    if (!seenExpIds.has(converted.id)) {
      pub.items.push(converted);
      maps.byId.set(converted.id, converted);
      seenExpIds.add(converted.id);
      addedCount++;
    }
  }

  addSelfAuthoredFromExpansion(pub);

  const vercelOfficial = pub.items.filter(
    (i) => i.authorFilter === 'vercel' && i.kind === 'official_upstream'
  );
  pub.vercelExpansion = {
    package: 'vercel-skills-expansion-2026-11-14',
    catalogRecordsInPackage: expansion.counts?.catalog_records ?? 89,
    baselineSelectedInPackage: 20,
    newlyIndexedInPackage: expansion.counts?.newly_indexed_beyond_baseline ?? 69,
    scenarioPicks: VERCEL_SCENARIO_IDS.length,
    focusInPackage: expansion.counts?.focus ?? 18,
    mergedIntoExistingSiteRows: mergedCount,
    skippedBaselineWithoutSiteRow: skippedBaselineDuplicate,
    addedAsNewRows: addedCount,
    siteVercelUpstreamRowsAfterMerge: vercelOfficial.length,
    note: '89 条为研究包目录记录（含 React 别名折叠），不是 89 个已安装技能；3 个基线源在 11/13 无证实新发布；未把收录当发布。',
    downloadPath: '/downloads/vercel-skills-expansion-2026-11-14.zip',
    notAnInstaller: true,
  };

  pub.countingMethodology = {
    ...pub.countingMethodology,
    vercelExpansion20261114:
      '研究包 89 catalog 记录 = 原精选 20 + 新收录 69（去 React 包装别名重复）；与站点条目按 URL/名称合并，站点总行数不是简单 134+69。',
    siteCatalogRows: 'items 数组长度含作品/方法/上游/索引等全部类型；不要用单行总数代表「技能个数」。',
  };

  return pub;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const pub = JSON.parse(fs.readFileSync(path.join(ROOT, 'benchmarks/catalog-content.json'), 'utf8'));
  mergeVercelExpansion(pub);
  fs.writeFileSync(path.join(ROOT, 'benchmarks/catalog-content.json'), JSON.stringify(pub, null, 2));
  console.log('merge vercel', pub.vercelExpansion);
}
