<script setup lang="ts">
import { ref } from 'vue';

const selected = ref<'trigger' | 'ai' | 'publish'>('trigger');
const draft = ref(true);
const proposalApplied = ref(false);
const hasProposal = ref(false);
const statusNote = ref('版本：草稿 · 提案：无');

const nodes = ref({
  trigger: { title: '示例：新工单触发', summary: '来源：客服系统（示例）' },
  ai: { title: '示例：AI 分类', summary: '模型：通用分类（示例）' },
  publish: { title: '示例：通知团队', summary: '渠道：站内信（示例）' },
});

function select(id: typeof selected.value) {
  selected.value = id;
}
function genProposal() {
  hasProposal.value = true;
  proposalApplied.value = false;
  statusNote.value = '版本：草稿 · 提案：待审阅（示例：新增校验节点）';
}
function applyProposal() {
  if (!hasProposal.value) return;
  proposalApplied.value = true;
  draft.value = true;
  statusNote.value = '版本：草稿 · 提案：已应用至草稿';
}
function doPublish() {
  draft.value = false;
  statusNote.value = proposalApplied.value ? '版本：已发布 · 提案：已应用至草稿' : '版本：已发布 · 提案：无';
}
</script>

<template>
  <div class="demo-panel">
    <div class="demo-workflow" style="display: grid; grid-template-columns: 1fr 160px; gap: 8px">
      <div role="list" aria-label="流程节点（示例）" style="display: flex; flex-direction: column; gap: 8px; align-items: center">
        <button
          v-for="(n, id) in nodes"
          :key="id"
          type="button"
          :aria-current="selected === id"
          style="width: 100%; max-width: 240px; padding: 8px 10px; border: 1px solid var(--vp-c-border); border-radius: 7px; background: #fff; text-align: left; cursor: pointer"
          :style="selected === id ? { borderColor: '#1a5cff', boxShadow: '0 0 0 1px #1a5cff' } : {}"
          @click="select(id as typeof selected)"
        >
          {{ n.title }}<br /><small>{{ n.summary }}</small>
        </button>
      </div>
      <aside aria-label="节点配置（示例）" style="border: 1px solid var(--vp-c-border); border-radius: 7px; padding: 8px; background: #fff">
        <strong>Inspector</strong>
        <label style="display: block; font-size: 11px; margin-top: 6px">业务标题</label>
        <input v-model="nodes[selected].title" style="width: 100%; font: inherit; padding: 4px 6px; border: 1px solid var(--vp-c-border); border-radius: 6px" />
        <label style="display: block; font-size: 11px; margin-top: 6px">配置摘要</label>
        <input v-model="nodes[selected].summary" style="width: 100%; font: inherit; padding: 4px 6px; border: 1px solid var(--vp-c-border); border-radius: 6px" />
        <p style="font-size: 11px; color: var(--vp-c-text-2); margin-top: 8px">{{ statusNote }}</p>
      </aside>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px">
      <button type="button" class="skill-toolbar button" style="padding: 6px 10px; border: 1px solid var(--vp-c-border); border-radius: 7px; background: #fff" @click="genProposal">生成 AI 提案（示例）</button>
      <button type="button" :disabled="!hasProposal || proposalApplied" style="padding: 6px 10px; border: 1px solid var(--vp-c-border); border-radius: 7px; background: #fff" @click="applyProposal">应用提案到草稿</button>
      <button type="button" style="padding: 6px 10px; border: 1px solid #141414; border-radius: 7px; background: #141414; color: #fff" @click="doPublish">发布（独立于应用）</button>
    </div>
  </div>
</template>
