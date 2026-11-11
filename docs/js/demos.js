const DEMO_NOTE =
  '原创演示，非原作实现。数据为示例，不代表第三方产品或真实业务结果。';

function note() {
  return `<p class="demo-note">${DEMO_NOTE}</p>`;
}

function mountWorkflow(root) {
  root.innerHTML = `${note()}<div class="demo-workflow" id="wf"></div>`;
  const wrap = root.querySelector('#wf');
  let selected = 'trigger';
  let draft = true;
  let proposalApplied = false;
  const nodes = {
    trigger: { title: '示例：新工单触发', summary: '来源：客服系统（示例）' },
    ai: { title: '示例：AI 分类', summary: '模型：通用分类（示例）' },
    publish: { title: '示例：通知团队', summary: '渠道：站内信（示例）' },
  };

  const render = () => {
    wrap.innerHTML = `
      <div class="wf-canvas" role="list" aria-label="流程节点（示例）">
        ${Object.entries(nodes)
          .map(
            ([id, n]) =>
              `<button type="button" class="wf-node" data-id="${id}" aria-current="${selected === id}">${n.title}<br><small>${n.summary}</small></button>`
          )
          .join('<span aria-hidden="true">↓</span>')}
      </div>
      <aside class="wf-inspector panel" aria-label="节点配置（示例）">
        <strong>Inspector</strong>
        <label for="wf-title">业务标题</label>
        <input id="wf-title" value="${nodes[selected].title}" />
        <label for="wf-sum">配置摘要</label>
        <input id="wf-sum" value="${nodes[selected].summary}" />
        <p class="wf-status">版本：${draft ? '草稿' : '已发布'} · 提案：${
      proposalApplied ? '已应用至草稿' : '无'
    }</p>
      </aside>
      <div class="wf-toolbar">
        <button type="button" class="btn" id="wf-proposal">生成 AI 提案（示例）</button>
        <button type="button" class="btn" id="wf-apply" ${proposalApplied ? '' : 'disabled'}>应用提案到草稿</button>
        <button type="button" class="btn btn--primary" id="wf-publish">发布（独立于应用）</button>
      </div>
    `;
    wrap.querySelectorAll('.wf-node').forEach((btn) => {
      btn.addEventListener('click', () => {
        selected = btn.dataset.id;
        render();
      });
    });
    wrap.querySelector('#wf-title').addEventListener('input', (e) => {
      nodes[selected].title = e.target.value;
    });
    wrap.querySelector('#wf-sum').addEventListener('input', (e) => {
      nodes[selected].summary = e.target.value;
    });
    let hasProposal = proposalApplied;
    wrap.querySelector('#wf-proposal').addEventListener('click', () => {
      hasProposal = true;
      proposalApplied = false;
      wrap.querySelector('#wf-apply').disabled = false;
      wrap.querySelector('.wf-status').textContent =
        '版本：草稿 · 提案：待审阅（示例：新增校验节点）';
    });
    wrap.querySelector('#wf-apply').addEventListener('click', () => {
      if (!hasProposal) return;
      proposalApplied = true;
      draft = true;
      render();
    });
    wrap.querySelector('#wf-publish').addEventListener('click', () => {
      draft = false;
      render();
    });
  };
  render();
}

function mountRiskForm(root) {
  root.innerHTML = `${note()}<form class="demo-form" id="risk-form" novalidate>
    <p><strong>示例动作：</strong>批量退款（虚构商户）</p>
    <fieldset>
      <legend>退款方案</legend>
      <label><input type="radio" name="plan" value="partial" checked /> 部分退款</label>
      <label><input type="radio" name="plan" value="full" /> 全额退款</label>
    </fieldset>
    <div class="field">
      <label for="amount">退款金额（元，示例上限 5000）</label>
      <input id="amount" name="amount" type="number" min="0" step="0.01" value="120" />
      <div class="error" id="amount-err" hidden></div>
    </div>
    <div class="field">
      <label for="reason">原因（必填，示例）</label>
      <input id="reason" name="reason" type="text" value="" />
      <div class="error" id="reason-err" hidden></div>
    </div>
    <p class="demo-note">不可恢复：示例订单将进入「已退款」状态（本地模拟，无真实资金操作）。</p>
    <div class="actions">
      <button type="button" class="btn" id="risk-cancel">取消</button>
      <button type="submit" class="btn btn--primary" id="risk-submit">确认退款 ¥<span id="amt-label">120</span></button>
    </div>
    <div class="result" id="risk-result" hidden role="status"></div>
  </form>`;

  const form = root.querySelector('#risk-form');
  const amount = root.querySelector('#amount');
  const amtLabel = root.querySelector('#amt-label');
  const result = root.querySelector('#risk-result');

  amount.addEventListener('input', () => {
    amtLabel.textContent = amount.value || '0';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errAmt = root.querySelector('#amount-err');
    const errReason = root.querySelector('#reason-err');
    errAmt.hidden = true;
    errReason.hidden = true;
    const val = parseFloat(amount.value, 10);
    const reason = root.querySelector('#reason').value.trim();
    let ok = true;
    if (Number.isNaN(val) || val <= 0 || val > 5000) {
      errAmt.textContent = '金额须在 0–5000 元（示例限额）';
      errAmt.hidden = false;
      ok = false;
    }
    if (!reason) {
      errReason.textContent = '请填写原因';
      errReason.hidden = false;
      ok = false;
    }
    if (!ok) return;
    const plan = form.querySelector('input[name="plan"]:checked').value;
    result.hidden = false;
    result.textContent = `【本地模拟成功】方案：${
      plan === 'full' ? '全额' : '部分'
    }；金额 ¥${val.toFixed(2)}；凭据：DEMO-${Date.now().toString(36)}`;
  });

  root.querySelector('#risk-cancel').addEventListener('click', () => {
    result.hidden = true;
    form.reset();
    amount.value = '120';
    amtLabel.textContent = '120';
  });
}

function mountNav(root) {
  const sections = [
    { id: 's1', title: '1. 概述（示例）' },
    { id: 's2', title: '2. 安装（示例）' },
    { id: 's3', title: '3. 配置（示例）' },
  ];
  let current = 's1';
  root.innerHTML = `${note()}<div class="demo-nav">
    <nav aria-label="章节目录（示例）" id="nav-toc"></nav>
    <div class="doc-section" tabindex="-1" id="nav-section" aria-live="polite"></div>
  </div>`;

  const toc = root.querySelector('#nav-toc');
  const panel = root.querySelector('#nav-section');

  const render = () => {
    toc.innerHTML = sections
      .map(
        (s) =>
          `<button type="button" data-id="${s.id}" aria-current="${current === s.id}">${s.title}</button>`
      )
      .join('');
    const sec = sections.find((s) => s.id === current);
    panel.innerHTML = `<h3>${sec.title}</h3><p>示例正文：此处模拟长文档锚点跳转。窄屏下目录与正文上下堆叠。</p>`;
    panel.focus({ preventScroll: true });
    toc.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => {
        current = b.dataset.id;
        render();
      });
    });
  };
  render();
}

function mountOptical(root) {
  let mode = 'container';
  root.innerHTML = `${note()}<div class="demo-optical mode-container" id="opt">
    <h3 class="visually-hidden">对齐模式对比</h3>
    <div class="actions">
      <button type="button" class="chip" data-mode="container" aria-pressed="true">容器垂直居中</button>
      <button type="button" class="chip" data-mode="text" aria-pressed="false">文字基线对齐</button>
    </div>
    <div class="row"><span class="tag">12px 标签</span><span>示例状态名称</span><span class="tag">操作</span></div>
    <div class="row"><span class="tag">12px 标签</span><span>另一行较长示例文案</span><span class="tag">操作</span></div>
  </div>`;
  const box = root.querySelector('#opt');
  box.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      mode = chip.dataset.mode;
      box.classList.toggle('mode-container', mode === 'container');
      box.classList.toggle('mode-text', mode === 'text');
      box.querySelectorAll('.chip').forEach((c) => {
        c.setAttribute('aria-pressed', String(c.dataset.mode === mode));
      });
    });
  });
}

function mountStatus(root) {
  const items = [
    { id: 1, name: '示例工单 A', status: 'ok', label: '已完成' },
    { id: 2, name: '示例工单 B', status: 'warn', label: '待处理' },
    { id: 3, name: '示例工单 C', status: 'err', label: '失败' },
    { id: 4, name: '示例工单 D', status: 'ok', label: '已完成' },
  ];
  let filter = 'all';

  const pill = (status, label) => {
    const icons = { ok: '✓', warn: '!', err: '×' };
    return `<span class="status-pill status-pill--${status}"><span class="ico" aria-hidden="true">${icons[status]}</span>${label}</span>`;
  };

  const render = () => {
    const list = items.filter((i) => filter === 'all' || i.status === filter);
    root.innerHTML = `${note()}
      <div class="demo-status">
        <div class="filters-inline" role="group" aria-label="按状态筛选（示例）">
          ${['all', 'ok', 'warn', 'err']
            .map(
              (f) =>
                `<button type="button" class="chip" data-f="${f}" aria-pressed="${filter === f}">${
                  f === 'all' ? '全部' : f
                }</button>`
            )
            .join('')}
        </div>
        <ul style="margin:0;padding-left:1.2em">
          ${list.map((i) => `<li>${i.name} ${pill(i.status, i.label)}</li>`).join('')}
        </ul>
        ${list.length === 0 ? '<p class="empty-state">无匹配示例项</p>' : ''}
      </div>`;
    root.querySelectorAll('.chip').forEach((c) => {
      c.addEventListener('click', () => {
        filter = c.dataset.f;
        render();
      });
    });
  };
  render();
}

const DASH_DATA = {
  day: {
    metrics: [
      { k: '转化率', v: '3.2%' },
      { k: '异常', v: '2' },
      { k: '待办', v: '5' },
    ],
    anomalies: ['示例：支付回调延迟（日）', '示例：库存同步失败（日）'],
  },
  week: {
    metrics: [
      { k: '转化率', v: '3.8%' },
      { k: '异常', v: '7' },
      { k: '待办', v: '12' },
    ],
    anomalies: ['示例：周报生成超时', '示例：区域 A 流量尖刺'],
  },
};

function mountDash(root) {
  let scope = 'day';
  const render = () => {
    const d = DASH_DATA[scope];
    root.innerHTML = `${note()}
      <div class="demo-dash">
        <div class="scope-tabs" role="tablist" aria-label="时间范围（示例）">
          <button type="button" class="tab" role="tab" data-s="day" aria-selected="${scope === 'day'}">今日</button>
          <button type="button" class="tab" role="tab" data-s="week" aria-selected="${scope === 'week'}">本周</button>
        </div>
        <div class="metrics" aria-live="polite">
          ${d.metrics.map((m) => `<div class="metric"><div>${m.k}</div><strong>${m.v}</strong></div>`).join('')}
        </div>
        <h4 style="margin:8px 0 4px;font-size:13px">异常列表（示例）</h4>
        ${d.anomalies.map((a) => `<div class="anomaly">${a}</div>`).join('')}
      </div>`;
    root.querySelectorAll('[data-s]').forEach((btn) => {
      btn.addEventListener('click', () => {
        scope = btn.dataset.s;
        render();
      });
    });
  };
  render();
}

function mountMarketing(root) {
  let crop = 20;
  let focal = 50;
  const render = () => {
    root.innerHTML = `${note()}
      <div class="demo-marketing">
        <p class="demo-note">裁切与主体占比为演示控件，非真实导出功能。</p>
        <div class="controls">
          <label>裁切强度（示例） <input type="range" id="crop" min="0" max="40" value="${crop}" /></label>
          <label>主体水平位置（%） <input type="range" id="focal" min="10" max="90" value="${focal}" /></label>
        </div>
        <div class="frame" aria-label="静帧预览（示例）">
          <div class="frame-inner" id="inner"></div>
        </div>
      </div>`;
    const inner = root.querySelector('#inner');
    const apply = () => {
      const w = 70 - crop / 2;
      const left = focal - w / 2;
      inner.style.width = `${w}%`;
      inner.style.height = `${60 - crop / 3}%`;
      inner.style.left = `${left}%`;
      inner.style.top = '20%';
    };
    apply();
    root.querySelector('#crop').addEventListener('input', (e) => {
      crop = Number(e.target.value);
      apply();
    });
    root.querySelector('#focal').addEventListener('input', (e) => {
      focal = Number(e.target.value);
      apply();
    });
  };
  render();
}

const MOUNTERS = {
  'light-ai-workflow-builder': mountWorkflow,
  'risk-action-confirmation': mountRiskForm,
  'responsive-document-navigation': mountNav,
  'optical-text-label-alignment': mountOptical,
  'status-label-encoding': mountStatus,
  'ops-command-center-hierarchy': mountDash,
  'marketing-product-ui-stills': mountMarketing,
};

export function mountDemo(skillName, container) {
  container.innerHTML = '';
  const fn = MOUNTERS[skillName];
  if (!fn) {
    container.innerHTML = `<p class="demo-note">暂无演示（示例）。</p>`;
    return;
  }
  fn(container);
}
