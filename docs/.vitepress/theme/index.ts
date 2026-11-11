import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './custom.css';
import './exhibition.css';
import ExhibitionLayout from './ExhibitionLayout.vue';
import GalleryHome from './components/gallery/GalleryHome.vue';
import ComparePage from './components/gallery/ComparePage.vue';
import WorkDetail from './components/gallery/WorkDetail.vue';
import AggregateToolbar from './components/AggregateToolbar.vue';
import SkillDoc from './components/SkillDoc.vue';

export default {
  extends: DefaultTheme,
  Layout: ExhibitionLayout,
  enhanceApp({ app }) {
    app.component('GalleryHome', GalleryHome);
    app.component('ComparePage', ComparePage);
    app.component('WorkDetail', WorkDetail);
    app.component('AggregateToolbar', AggregateToolbar);
    app.component('SkillDoc', SkillDoc);
  },
} satisfies Theme;
