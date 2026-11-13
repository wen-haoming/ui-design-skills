export type CatalogKind =
  | 'experienceable_work'
  | 'self_authored_method'
  | 'official_upstream'
  | 'design_method_summarized'
  | 'legacy_skill_page'
  | 'site_tool'
  | 'index_only'
  | 'install_warning'
  | 'removed_upstream_index'
  | 'related_non_skill'
  | string;

export type CatalogItem = {
  id: string;
  name: string;
  kind: CatalogKind;
  category?: string;
  taskScenarios?: string[];
  purpose?: string;
  inputOutput?: string;
  callExample?: string;
  sourceUrl?: string | null;
  officialUrl?: string | null;
  license?: string;
  knownConstraints?: string[];
  reviewDepth?: string;
  demoRoutes?: string[];
  authorFilter?: string;
  skillCallExample?: string;
  licenseNote?: string;
  vercelCatalogId?: string;
  vercelScenarioPick?: boolean;
  vercelFocus?: boolean;
  vercelNewlyIndexed?: boolean;
  vercelCommit?: string;
  vercelRepository?: string;
};

export type VercelExpansionMeta = {
  package?: string;
  catalogRecordsInPackage?: number;
  newlyIndexedInPackage?: number;
  scenarioPicks?: number;
  focusInPackage?: number;
  mergedIntoExistingSiteRows?: number;
  addedAsNewRows?: number;
  siteVercelUpstreamRowsAfterMerge?: number;
  note?: string;
  downloadPath?: string;
  notAnInstaller?: boolean;
};

export type CatalogData = {
  taskScenarios: { id: string; label: string; when: string }[];
  items: CatalogItem[];
  countingMethodology?: Record<string, string>;
  disclaimer?: string;
  vercelExpansion?: VercelExpansionMeta;
};

export const kindLabels: Record<string, string> = {
  experienceable_work: '可体验作品',
  self_authored_method: '自拟通用方法',
  official_upstream: '官方上游技能',
  design_method_summarized: '已归纳·展厅未实现',
  saved_method_not_implemented_in_hall: 'v1.3 归纳·未在展厅实现',
  legacy_skill_page: '遗留技能页',
  site_tool: '站点工具',
  index_only: '仅索引',
  install_warning: '使用警告',
  do_not_install_here: '勿从此入口安装',
  catalog_index_only: '仅索引',
  removed_upstream_index: '已移除·请用原上游',
  related_non_skill: '相关非 Skill 项目',
};

export const kindSort: Record<string, number> = {
  experienceable_work: 0,
  self_authored_method: 1,
  official_upstream: 2,
  design_method_summarized: 3,
  saved_method_not_implemented_in_hall: 3,
  legacy_skill_page: 4,
  site_tool: 5,
  index_only: 6,
  install_warning: 7,
  removed_upstream_index: 8,
  related_non_skill: 9,
};

export const defaultCatalogKinds = new Set([
  'experienceable_work',
  'self_authored_method',
  'official_upstream',
  'design_method_summarized',
  'legacy_skill_page',
  'index_only',
  'install_warning',
  'removed_upstream_index',
  'saved_method_not_implemented_in_hall',
  'do_not_install_here',
  'catalog_index_only',
]);

export function filterCatalogItems(
  items: CatalogItem[],
  opts: {
    task?: string;
    kind?: string;
    author?: string;
    q?: string;
    includeNonSkill?: boolean;
  }
) {
  const q = (opts.q ?? '').trim().toLowerCase();
  return items
    .filter((it) => {
      if (!opts.includeNonSkill && it.kind === 'related_non_skill') return false;
      if (opts.kind && opts.kind !== 'all') {
        if (it.kind !== opts.kind) return false;
      } else if (!defaultCatalogKinds.has(it.kind)) {
        return false;
      }
      if (opts.task && opts.task !== 'all') {
        if (!it.taskScenarios?.includes(opts.task)) return false;
      }
      if (opts.author && opts.author !== 'all') {
        if ((it.authorFilter ?? 'other') !== opts.author) return false;
      }
      if (q) {
        const hay = `${it.name} ${it.purpose ?? ''} ${it.callExample ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const vercelBoost =
        opts.author === 'vercel'
          ? (b.vercelFocus ? 1 : 0) - (a.vercelFocus ? 1 : 0) ||
            (b.vercelScenarioPick ? 1 : 0) - (a.vercelScenarioPick ? 1 : 0)
          : 0;
      if (vercelBoost) return vercelBoost;
      return (kindSort[a.kind] ?? 99) - (kindSort[b.kind] ?? 99) || a.name.localeCompare(b.name, 'zh');
    });
}

export function publicConstraints(item: CatalogItem) {
  const lic = `${item.license ?? ''} ${item.licenseNote ?? ''}`.trim();
  return (item.knownConstraints ?? []).filter((c) => {
    const t = (c || '').trim();
    if (!t) return false;
    if (item.licenseNote && t === item.licenseNote) return false;
    if (lic && t === lic) return false;
    return true;
  });
}

export const vercelScenarioLabels: Record<string, string> = {
  'building-components': '组件 API 与键盘焦点',
  'json-render/vue': 'Vue 生成式 UI',
  streamdown: 'React 流式中文 Markdown',
  'chat-sdk': '跨平台聊天机器人',
  queues: '异步扇出与缓冲',
  workflow: '持久多步任务',
  'cdn-caching': 'CDN 缓存旧内容',
  'vercel-tracing': '慢服务端链路追踪',
};

export function itemIdForSelect(item: CatalogItem) {
  return item.id;
}

export function findVercelItem(items: CatalogItem[], catalogId: string) {
  return (
    items.find((i) => i.vercelCatalogId === catalogId) ??
    items.find((i) => i.id === `upstream:vercel-exp:${catalogId}`) ??
    items.find((i) => i.id === `upstream:vercel:${catalogId.replace(/\//g, '-')}`)
  );
}

export function reviewDepthLabel(depth?: string) {
  if (!depth) return '未注明审阅深度';
  if (/live-site|observed/i.test(depth)) return '已在现网站点观察';
  if (/method-reference/i.test(depth)) return '基于公开方法参考，非逐字 canonical';
  if (/skill-md-body-read/i.test(depth)) return '已读 SKILL 正文（数据集标注）';
  if (/frontmatter|index|catalog/i.test(depth)) return '仅目录或 frontmatter，非全文精读';
  return depth;
}

export function routeToPath(route: string) {
  return route.replace(/^\/ui-design-skills/, '') || '/';
}

export function isUpstreamOfficial(item: CatalogItem) {
  if (item.kind !== 'official_upstream' && item.kind !== 'do_not_install_here') return false;
  const u = item.officialUrl || item.sourceUrl;
  return Boolean(u && /^https:\/\//.test(u) && !/wen-haoming\.github\.io/i.test(u));
}

export function primaryPreviewPath(item: CatalogItem) {
  if (item.demoRoutes?.length) return routeToPath(item.demoRoutes[0]);
  return null;
}

export function licenseNeedsConfirm(item: CatalogItem) {
  const lic = `${item.license ?? ''} ${item.licenseNote ?? ''}`.toLowerCase();
  return /agpl|gpl|bsl|non.?commercial|待确认|readme.*mit.*(?!license file)/i.test(lic);
}

export function licenseConfirmText(item: CatalogItem) {
  return '上游许可可能影响你是否能把实现并入自有仓库。使用前请阅读仓库 LICENSE 并向作者确认；本站不复制实现、不代为安装，也不提供法律意见。';
}
