import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import './custom.css';
import HomeSkills from './components/HomeSkills.vue';
import SkillToolbar from './components/SkillToolbar.vue';
import DemoWorkflow from './components/demos/DemoWorkflow.vue';
import DemoRiskForm from './components/demos/DemoRiskForm.vue';
import DemoDocumentNav from './components/demos/DemoDocumentNav.vue';
import DemoOpticalAlign from './components/demos/DemoOpticalAlign.vue';
import DemoStatusLabels from './components/demos/DemoStatusLabels.vue';
import DemoOpsDashboard from './components/demos/DemoOpsDashboard.vue';
import DemoMarketingStill from './components/demos/DemoMarketingStill.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeSkills', HomeSkills);
    app.component('SkillToolbar', SkillToolbar);
    app.component('DemoWorkflow', DemoWorkflow);
    app.component('DemoRiskForm', DemoRiskForm);
    app.component('DemoDocumentNav', DemoDocumentNav);
    app.component('DemoOpticalAlign', DemoOpticalAlign);
    app.component('DemoStatusLabels', DemoStatusLabels);
    app.component('DemoOpsDashboard', DemoOpsDashboard);
    app.component('DemoMarketingStill', DemoMarketingStill);
  },
} satisfies Theme;
