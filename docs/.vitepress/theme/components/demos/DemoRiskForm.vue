<script setup lang="ts">
import { ref } from 'vue';

const plan = ref('partial');
const amount = ref(120);
const reason = ref('');
const amountErr = ref('');
const reasonErr = ref('');
const result = ref('');

function submit() {
  amountErr.value = '';
  reasonErr.value = '';
  result.value = '';
  const val = Number(amount.value);
  if (Number.isNaN(val) || val <= 0 || val > 5000) {
    amountErr.value = '金额须在 0–5000 元（示例限额）';
    return;
  }
  if (!reason.value.trim()) {
    reasonErr.value = '请填写原因';
    return;
  }
  result.value = `【本地模拟成功】方案：${plan.value === 'full' ? '全额' : '部分'}；金额 ¥${val.toFixed(2)}；凭据：DEMO-${Date.now().toString(36)}`;
}
</script>

<template>
  <form class="demo-panel" @submit.prevent="submit">
    <p><strong>示例动作：</strong>批量退款（虚构商户）</p>
    <fieldset style="border: 1px solid var(--vp-c-border); border-radius: 7px; padding: 8px; margin-bottom: 8px">
      <legend>退款方案</legend>
      <label><input v-model="plan" type="radio" value="partial" /> 部分退款</label>
      <label style="margin-left: 12px"><input v-model="plan" type="radio" value="full" /> 全额退款</label>
    </fieldset>
    <label for="amt">退款金额（元，示例上限 5000）</label>
    <input id="amt" v-model.number="amount" type="number" min="0" step="0.01" style="display: block; width: 100%; margin: 4px 0 8px; padding: 6px; border: 1px solid var(--vp-c-border); border-radius: 6px" />
    <p v-if="amountErr" style="color: #b42318; font-size: 12px">{{ amountErr }}</p>
    <label for="rsn">原因（必填，示例）</label>
    <input id="rsn" v-model="reason" type="text" style="display: block; width: 100%; margin: 4px 0 8px; padding: 6px; border: 1px solid var(--vp-c-border); border-radius: 6px" />
    <p v-if="reasonErr" style="color: #b42318; font-size: 12px">{{ reasonErr }}</p>
    <p class="demo-note">不可恢复：示例订单将进入「已退款」状态（本地模拟，无真实资金操作）。</p>
    <button type="submit" style="padding: 8px 12px; border-radius: 7px; border: 1px solid #141414; background: #141414; color: #fff">确认退款 ¥{{ amount }}</button>
    <p v-if="result" role="status" style="margin-top: 8px; padding: 8px; border-radius: 7px; background: #eef8f1; border: 1px solid #c5e6ce; font-size: 12px">{{ result }}</p>
  </form>
</template>
