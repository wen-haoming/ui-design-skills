import { defineConfig } from 'vitepress';
import skillsMeta from './skills-meta.json';

const sidebar = skillsMeta.sidebar as {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: { text: string; link: string }[];
}[];

export default defineConfig({
  base: '/ui-design-skills/',
  lang: 'zh-CN',
  title: 'UI Design Skills',
  description: '七个可复用 UI 设计技能：参考图、原创演示与完整 SKILL 一键复制',
  cleanUrls: true,
  head: [['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }]],
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: '技能目录', link: '/' },
      { text: '版权说明', link: '/copyright' },
      {
        text: '源码',
        items: [
          { text: 'GitHub', link: 'https://github.com/wen-haoming/ui-design-skills' },
          { text: 'Gitee', link: 'https://gitee.com/haomingla/ui-design-skills' },
        ],
      },
    ],
    sidebar,
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/wen-haoming/ui-design-skills' }],
    footer: {
      message: '参考图为第三方素材；站内演示均为示例数据。',
      copyright: '见 COPYRIGHT 与各技能来源说明',
    },
  },
  markdown: {
    lineNumbers: false,
  },
});
