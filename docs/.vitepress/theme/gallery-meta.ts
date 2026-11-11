import WorkbenchShallow from '@templates/task-workbench/shallow-precise/WorkbenchShallow.vue';
import WorkbenchDark from '@templates/task-workbench/dark-command/WorkbenchDark.vue';
import WorkbenchSoft from '@templates/task-workbench/soft-system/WorkbenchSoft.vue';

export const styles = [
  {
    id: 'shallow-precise',
    title: '浅色精密工作台',
    subtitle: 'shallow-precise',
    blurb: '窄侧栏、工具条与表格列表 + 右栏详情；细边框分区。',
    cover: '/covers/shallow-precise.png',
    preview: WorkbenchShallow,
    download: '/downloads/task-workbench-shallow-precise.zip',
  },
  {
    id: 'dark-command',
    title: '深色指挥台',
    subtitle: 'dark-command',
    blurb: '指挥标题与 KPI 在上，高密度任务队列与上下文对开。',
    cover: '/covers/dark-command.png',
    preview: WorkbenchDark,
    download: '/downloads/task-workbench-dark-command.zip',
  },
  {
    id: 'soft-system',
    title: '浮动系统层',
    subtitle: 'soft-system',
    blurb: '氛围底上的圆角系统窗；分组列表、日志式详情、胶囊工具。',
    cover: '/covers/soft-system.png',
    preview: WorkbenchSoft,
    download: '/downloads/task-workbench-soft-system.zip',
  },
] as const;

export type StyleId = (typeof styles)[number]['id'];
