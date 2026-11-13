import { defineConfig } from 'vitepress';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: '/ui-design-skills/',
  lang: 'zh-CN',
  title: '多风格界面设计',
  description: '聚合 Skill v1.2：工作台八组合 + 正文排版三预设 · article-typesetting-v1',
  cleanUrls: true,
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: '展厅', link: '/' },
      { text: '方法目录', link: '/catalog' },
      { text: '风格对照', link: '/compare' },
      { text: '布局对照', link: '/compare-layout' },
      { text: '文字排版', link: '/typography' },
      { text: 'Skill', link: '/skill' },
      { text: '来源附录', link: '/sources-attribution' },
      { text: '遗留', link: '/legacy/' },
    ],
    sidebar: {
      '/legacy/': [
        { text: '遗留目录', link: '/legacy/' },
        { text: '浅色工作流', link: '/legacy/skills/light-ai-workflow-builder' },
        { text: '确认表单', link: '/legacy/skills/risk-action-confirmation' },
        { text: '文档导航', link: '/legacy/skills/responsive-document-navigation' },
        { text: '光学对齐', link: '/legacy/skills/optical-text-label-alignment' },
        { text: '状态标签', link: '/legacy/skills/status-label-encoding' },
        { text: '指挥中心', link: '/legacy/skills/ops-command-center-hierarchy' },
        { text: '营销静帧', link: '/legacy/skills/marketing-product-ui-stills' },
      ],
    },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/wen-haoming/ui-design-skills' }],
    footer: {
      message: '站内预览均为原创示例数据；第三方参考见来源附录。',
      copyright: 'COPYRIGHT 与各帖来源说明',
    },
  },
  vite: {
    resolve: {
      alias: {
        '@templates': resolve(dir, '../../templates'),
      },
    },
  },
});
