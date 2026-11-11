import type { Component } from 'vue';
import WorkbenchShallow from '@templates/task-workbench/shallow-precise/WorkbenchShallow.vue';
import WorkbenchShallowBoard from '@templates/task-workbench/shallow-precise/WorkbenchShallowBoard.vue';
import WorkbenchShallowReading from '@templates/task-workbench/shallow-precise/WorkbenchShallowReading.vue';
import WorkbenchShallowCalendar from '@templates/task-workbench/shallow-precise/WorkbenchShallowCalendar.vue';
import WorkbenchDark from '@templates/task-workbench/dark-command/WorkbenchDark.vue';
import WorkbenchSoft from '@templates/task-workbench/soft-system/WorkbenchSoft.vue';
import WorkbenchEditorial from '@templates/task-workbench/editorial-sheet/WorkbenchEditorial.vue';
import WorkbenchAmber from '@templates/task-workbench/amber-ledger/WorkbenchAmber.vue';

export const styleMeta = {
  'shallow-precise': { title: '浅色精密工作台', subtitle: 'shallow-precise' },
  'dark-command': { title: '深色指挥台', subtitle: 'dark-command' },
  'soft-system': { title: '浮动系统层', subtitle: 'soft-system' },
  'editorial-sheet': { title: '编辑纸页', subtitle: 'editorial-sheet' },
  'amber-ledger': { title: '琥珀台账', subtitle: 'amber-ledger' },
} as const;

export const layoutMeta = {
  'list-detail': { title: '列表详情', subtitle: 'list-detail' },
  'board-detail': { title: '看板详情', subtitle: 'board-detail' },
  'reading-split': { title: '阅读分栏', subtitle: 'reading-split' },
  'calendar-agenda': { title: '日程议程', subtitle: 'calendar-agenda' },
} as const;

export type StyleId = keyof typeof styleMeta;
export type LayoutId = keyof typeof layoutMeta;

export type WorkEntry = {
  slug: string;
  styleId: StyleId;
  layoutId: LayoutId;
  title: string;
  blurb: string;
  typography: string[];
  capabilities: string[];
  scene: string;
  preview: Component;
  cover: string;
  download: string;
};

export const publishedWorks: WorkEntry[] = [
  {
    slug: 'shallow-precise-list-detail',
    styleId: 'shallow-precise',
    layoutId: 'list-detail',
    title: '浅色精密 · 列表详情',
    blurb: '窄侧栏、分面筛选与表格列表 + 详情。',
    typography: ['measure-hierarchy'],
    capabilities: ['facet-query-filter'],
    scene: 'task-workbench-v1',
    preview: WorkbenchShallow,
    cover: '/covers/shallow-precise-list-detail.png',
    download: '/downloads/task-workbench-shallow-precise-list-detail.zip',
  },
  {
    slug: 'dark-command-list-detail',
    styleId: 'dark-command',
    layoutId: 'list-detail',
    title: '深色指挥台 · 列表详情',
    blurb: '指挥 KPI、任务队列与上下文分栏。',
    typography: ['measure-hierarchy'],
    capabilities: ['facet-query-filter'],
    scene: 'task-workbench-v1',
    preview: WorkbenchDark,
    cover: '/covers/dark-command-list-detail.png',
    download: '/downloads/task-workbench-dark-command-list-detail.zip',
  },
  {
    slug: 'soft-system-list-detail',
    styleId: 'soft-system',
    layoutId: 'list-detail',
    title: '浮动系统层 · 列表详情',
    blurb: '系统窗 + 分组索引与会话详情。',
    typography: ['measure-hierarchy'],
    capabilities: ['facet-query-filter'],
    scene: 'task-workbench-v1',
    preview: WorkbenchSoft,
    cover: '/covers/soft-system-list-detail.png',
    download: '/downloads/task-workbench-soft-system-list-detail.zip',
  },
  {
    slug: 'editorial-sheet-list-detail',
    styleId: 'editorial-sheet',
    layoutId: 'list-detail',
    title: '编辑纸页 · 列表详情',
    blurb: '纸色发丝线、阅读行长与元数据分层。',
    typography: ['measure-hierarchy'],
    capabilities: ['facet-query-filter'],
    scene: 'task-workbench-v1',
    preview: WorkbenchEditorial,
    cover: '/covers/editorial-sheet-list-detail.png',
    download: '/downloads/task-workbench-editorial-sheet-list-detail.zip',
  },
  {
    slug: 'amber-ledger-list-detail',
    styleId: 'amber-ledger',
    layoutId: 'list-detail',
    title: '琥珀台账 · 列表详情',
    blurb: '暖黑发丝格、密表数字对位与分面栏。',
    typography: ['measure-hierarchy'],
    capabilities: ['facet-query-filter'],
    scene: 'task-workbench-v1',
    preview: WorkbenchAmber,
    cover: '/covers/amber-ledger-list-detail.png',
    download: '/downloads/task-workbench-amber-ledger-list-detail.zip',
  },
  {
    slug: 'shallow-precise-board-detail',
    styleId: 'shallow-precise',
    layoutId: 'board-detail',
    title: '浅色精密 · 看板详情',
    blurb: '默认看板列 + 共享详情与会话。',
    typography: ['measure-hierarchy'],
    capabilities: ['facet-query-filter'],
    scene: 'task-workbench-v1',
    preview: WorkbenchShallowBoard,
    cover: '/covers/shallow-precise-board-detail.png',
    download: '/downloads/task-workbench-shallow-precise-board-detail.zip',
  },
  {
    slug: 'shallow-precise-reading-split',
    styleId: 'shallow-precise',
    layoutId: 'reading-split',
    title: '浅色精密 · 阅读分栏',
    blurb: '索引 | 阅读栏，正文最大 42rem。',
    typography: ['measure-hierarchy'],
    capabilities: ['facet-query-filter'],
    scene: 'task-workbench-v1',
    preview: WorkbenchShallowReading,
    cover: '/covers/shallow-precise-reading-split.png',
    download: '/downloads/task-workbench-shallow-precise-reading-split.zip',
  },
  {
    slug: 'shallow-precise-calendar-agenda',
    styleId: 'shallow-precise',
    layoutId: 'calendar-agenda',
    title: '浅色精密 · 日程议程',
    blurb: '月份芯片 + 周行议程（仅 due），空槽保留。',
    typography: ['measure-hierarchy'],
    capabilities: ['facet-query-filter'],
    scene: 'task-workbench-v1',
    preview: WorkbenchShallowCalendar,
    cover: '/covers/shallow-precise-calendar-agenda.png',
  },
];

// Fix last entry download
publishedWorks[7].download = '/downloads/task-workbench-shallow-precise-calendar-agenda.zip';

export function getWork(slug: string) {
  return publishedWorks.find((w) => w.slug === slug);
}

export function filterWorks(opts: {
  style?: string;
  layout?: string;
  capability?: string;
  scene?: string;
}) {
  return publishedWorks.filter((w) => {
    if (opts.style && opts.style !== 'all' && w.styleId !== opts.style) return false;
    if (opts.layout && opts.layout !== 'all' && w.layoutId !== opts.layout) return false;
    if (opts.capability && opts.capability !== 'all' && !w.capabilities.includes(opts.capability))
      return false;
    if (opts.scene && opts.scene !== 'all' && w.scene !== opts.scene) return false;
    return true;
  });
}

/** 风格对照：layout 固定 list-detail */
export const styleCompareWorks = publishedWorks.filter((w) => w.layoutId === 'list-detail');

/** 布局对照：style 固定 shallow-precise */
export const layoutCompareWorks = publishedWorks.filter((w) => w.styleId === 'shallow-precise');
