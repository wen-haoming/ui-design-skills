import { renderMarkdown } from './markdown.js';
import { mountDemo } from './demos.js';

const cfg = window.__SITE_CONFIG__ || {};
const live = document.getElementById('live');
const main = document.getElementById('main');
const searchInput = document.getElementById('search-input');
const homeBtn = document.getElementById('home-btn');

let data = null;
let state = parseUrl();

function parseUrl() {
  const u = new URL(window.location.href);
  return {
    q: u.searchParams.get('q') || '',
    category: u.searchParams.get('category') || 'all',
    skill: u.searchParams.get('skill') || '',
    view: u.searchParams.get('view') || 'reference',
  };
}

function pushUrl(next, replace = false) {
  const u = new URL(window.location.href);
  u.searchParams.delete('q');
  u.searchParams.delete('category');
  u.searchParams.delete('skill');
  u.searchParams.delete('view');
  if (next.q) u.searchParams.set('q', next.q);
  if (next.category && next.category !== 'all') u.searchParams.set('category', next.category);
  if (next.skill) u.searchParams.set('skill', next.skill);
  if (next.skill && next.view && next.view !== 'reference') u.searchParams.set('view', next.view);
  const method = replace ? 'replaceState' : 'pushState';
  history[method]({}, '', u.pathname + u.search);
}

function announce(msg, isError = false) {
  live.textContent = '';
  live.classList.toggle('is-error', isError);
  requestAnimationFrame(() => {
    live.textContent = msg;
  });
}

async function loadData() {
  const res = await fetch(cfg.DATA_URL || 'data/skills.json');
  if (!res.ok) throw new Error('无法加载技能数据');
  data = await res.json();
  if (data.repo?.github) {
    const gh = document.getElementById('link-github');
    if (gh) gh.href = data.repo.github;
  }
  if (data.repo?.gitee) {
    const gt = document.getElementById('link-gitee');
    if (gt) gt.href = data.repo.gitee;
  }
}

function categories(skills) {
  const map = new Map();
  for (const s of skills) {
    if (!map.has(s.category)) map.set(s.category, s.categoryLabel);
  }
  return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'zh'));
}

function filterSkills(skills) {
  const q = state.q.trim().toLowerCase();
  return skills.filter((s) => {
    if (state.category !== 'all' && s.category !== state.category) return false;
    if (!q) return true;
    const hay = `${s.title} ${s.description} ${s.categoryLabel}`.toLowerCase();
    return hay.includes(q);
  });
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      announce('已复制到剪贴板');
      return true;
    }
  } catch {
    /* fallback */
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  if (ok) announce('已复制到剪贴板（兼容模式）');
  else announce('复制失败：请手动选择 SKILL 正文', true);
  return ok;
}

function downloadSkill(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  announce(`已触发下载：${filename}`);
}

function renderHome() {
  const skills = filterSkills(data.skills);
  const cats = categories(data.skills);

  main.innerHTML = `
    <section aria-labelledby="catalog-heading">
      <h1 id="catalog-heading" class="visually-hidden">技能目录</h1>
      <div class="filters" role="group" aria-label="分类筛选">
        <button type="button" class="chip" data-cat="all" aria-pressed="${state.category === 'all'}">全部</button>
        ${cats
          .map(
            ([id, label]) =>
              `<button type="button" class="chip" data-cat="${id}" aria-pressed="${state.category === id}">${label}</button>`
          )
          .join('')}
      </div>
      ${
        skills.length
          ? `<div class="card-grid" role="list">${skills.map((s) => cardHtml(s)).join('')}</div>`
          : `<div class="empty-state" role="status">没有匹配的技能。请调整搜索或分类筛选。</div>`
      }
    </section>
  `;

  main.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state = { ...state, category: chip.dataset.cat };
      pushUrl(state);
      render();
    });
  });

  main.querySelectorAll('.skill-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      state = { ...state, skill: btn.dataset.skill, view: 'reference' };
      pushUrl(state);
      render();
    });
  });
}

function cardHtml(s) {
  const thumb = s.screenshots[0];
  const img = thumb
    ? `<img class="skill-card__img" src="${thumb.path}" alt="" loading="lazy" />`
    : `<div class="skill-card__img" role="presentation"></div>`;
  return `<button type="button" class="skill-card" role="listitem" data-skill="${s.name}" aria-label="${s.title}">
    ${img}
    <div class="skill-card__body">
      <div class="skill-card__cat">${s.categoryLabel}</div>
      <h2 class="skill-card__title">${s.title}</h2>
      <p class="skill-card__desc">${s.description}</p>
    </div>
  </button>`;
}

function renderDetail() {
  const skill = data.skills.find((s) => s.name === state.skill);
  if (!skill) {
    state = { ...state, skill: '', view: 'reference' };
    pushUrl(state, true);
    renderHome();
    return;
  }

  const views = [
    ['reference', '参考图'],
    ['demo', '原创演示'],
    ['skill', 'SKILL 正文'],
  ];

  main.innerHTML = `
    <article class="detail" aria-labelledby="detail-title">
      <header class="detail-header">
        <button type="button" class="btn" id="back-list">← 返回目录</button>
        <h1 id="detail-title">${skill.title}</h1>
        <p class="detail-meta">
          <span class="badge-demo">${skill.categoryLabel}</span>
          <span class="badge-demo">原创演示，非原作实现</span>
        </p>
        ${skill.notes ? `<p class="detail-meta">${skill.notes}</p>` : ''}
        ${
          skill.source?.length
            ? `<p class="detail-meta">来源：${skill.source
                .map((u) => `<a href="${u}" rel="noopener noreferrer">链接</a>`)
                .join(' · ')}</p>`
            : ''
        }
      </header>
      <div class="actions">
        <button type="button" class="btn btn--primary" id="copy-skill">复制完整 SKILL 原文</button>
        <button type="button" class="btn" id="download-skill">下载 SKILL.md</button>
      </div>
      <div class="view-tabs" role="tablist" aria-label="预览模式">
        ${views
          .map(
            ([id, label]) =>
              `<button type="button" class="tab" role="tab" data-view="${id}" aria-selected="${state.view === id}">${label}</button>`
          )
          .join('')}
      </div>
      <div class="detail-layout detail-layout--split">
        <div class="panel" id="panel-primary" role="tabpanel"></div>
        <div class="panel" id="panel-secondary" hidden></div>
      </div>
    </article>
  `;

  document.getElementById('back-list').addEventListener('click', () => {
    state = { ...state, skill: '', view: 'reference' };
    pushUrl(state);
    render();
  });

  document.getElementById('copy-skill').addEventListener('click', () => copyText(skill.skillMd));
  document.getElementById('download-skill').addEventListener('click', () =>
    downloadSkill('SKILL.md', skill.skillMd)
  );

  main.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      state = { ...state, view: tab.dataset.view };
      pushUrl(state);
      renderPanel(skill);
      main.querySelectorAll('.tab').forEach((t) => {
        t.setAttribute('aria-selected', String(t.dataset.view === state.view));
      });
    });
  });

  renderPanel(skill);
}

function renderPanel(skill) {
  const primary = document.getElementById('panel-primary');
  const secondary = document.getElementById('panel-secondary');
  if (!primary) return;
  secondary.hidden = true;

  if (state.view === 'reference') {
    primary.innerHTML = `<h2>第三方参考图（非实现效果）</h2>
      <div class="ref-gallery">${skill.screenshots
        .map(
          (sh) =>
            `<figure><img src="${sh.path}" alt="${sh.description}" loading="lazy" />
            <figcaption class="ref-caption">${sh.description}${
              sh.kind === 'third-party-reference' ? ' · 第三方参考图' : ''
            }</figcaption></figure>`
        )
        .join('')}</div>`;
  } else if (state.view === 'demo') {
    primary.innerHTML = `<h2>原创交互演示</h2><div class="demo-root" id="demo-mount"></div>`;
    mountDemo(skill.name, document.getElementById('demo-mount'));
  } else {
    primary.innerHTML = `<h2>SKILL 正文</h2><div class="skill-doc" id="skill-md"></div>`;
    document.getElementById('skill-md').innerHTML = renderMarkdown(skill.skillMd);
  }
}

function render() {
  if (state.skill) renderDetail();
  else renderHome();
  searchInput.value = state.q;
  document.title = state.skill
    ? `${data.skills.find((s) => s.name === state.skill)?.title || state.skill} — UI Design Skills`
    : 'UI Design Skills — 技能组件库';
}

function bindGlobal() {
  homeBtn.addEventListener('click', () => {
    state = { q: '', category: 'all', skill: '', view: 'reference' };
    pushUrl(state);
    render();
  });

  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state = { ...state, q: searchInput.value };
      pushUrl(state);
      render();
    }, 200);
  });

  window.addEventListener('popstate', () => {
    state = parseUrl();
    render();
  });
}

async function init() {
  try {
    await loadData();
    bindGlobal();
    state = parseUrl();
    render();
  } catch (e) {
    main.innerHTML = `<div class="empty-state" role="alert">加载失败：${e.message}</div>`;
  }
}

init();
