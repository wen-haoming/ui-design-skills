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
};

export type CatalogData = {
  taskScenarios: { id: string; label: string; when: string }[];
  items: CatalogItem[];
  countingMethodology?: Record<string, string>;
  disclaimer?: string;
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
    .sort((a, b) => (kindSort[a.kind] ?? 99) - (kindSort[b.kind] ?? 99) || a.name.localeCompare(b.name, 'zh'));
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
