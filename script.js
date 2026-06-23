/* ===== 随笔集 - 全局脚本 ===== */

// ===== 文章数据（新增文章只需在这里添加一条） =====
const ESSAYS = [
  {
    title: '雨天与《悉达多》',
    date: '2026-06-22',
    weekday: '星期一',
    url: 'essays/2026-06-22.html',
    excerpt: '大雨一直都在下。一天把《悉达多》看完，久久无法平静。当看到只剩下最后两章时，突然踩住了刹车……',
    tags: ['读书', '感悟', '黑塞'],
  },
  {
    title: '阅读与写作的随想',
    date: '2026-06-17',
    weekday: '星期三',
    url: 'essays/2026-06-17.html',
    excerpt: '真真切切感受到了在阅读写作上的些许成长。虽然距离出口成章还相差甚远，但能切身感受到自己不那么惧怕写作了……',
    tags: ['阅读', '写作', '读书', '感悟'],
  },
];

// ===== 所有标签（按出现频率排序） =====
function getAllTags() {
  const count = {};
  ESSAYS.forEach(e => {
    e.tags.forEach(t => {
      count[t] = (count[t] || 0) + 1;
    });
  });
  return Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

// ===== 阅读时间计算（中文 ~300 字/分钟） =====
function calcReadingTime(text) {
  const chars = text.replace(/\s/g, '').length;
  const minutes = Math.max(1, Math.round(chars / 300));
  return minutes;
}

// ===== 暗色模式 =====
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  // 默认偏好
  const saved = localStorage.getItem('essay-site-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggle.textContent = '☀ 亮色';
  } else {
    toggle.textContent = '☾ 暗色';
  }

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      toggle.textContent = '☾ 暗色';
      localStorage.setItem('essay-site-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      toggle.textContent = '☀ 亮色';
      localStorage.setItem('essay-site-theme', 'dark');
    }
  });
}

// ===== 返回顶部按钮 =====
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== 阅读时间显示（在所有页面上） =====
function initReadingTime() {
  const els = document.querySelectorAll('.reading-time[data-chars]');
  els.forEach(el => {
    const chars = parseInt(el.getAttribute('data-chars'), 10);
    if (chars) {
      const m = Math.max(1, Math.round(chars / 300));
      el.textContent = '阅读约 ' + m + ' 分钟';
    }
  });
}

// ===== 搜索功能（首页） =====
function initSearch() {
  const input = document.getElementById('searchInput');
  const list = document.getElementById('essayList');
  const noResults = document.getElementById('searchNoResults');
  if (!input || !list) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    const items = list.querySelectorAll('li');
    let visible = 0;

    items.forEach(item => {
      const text = (item.getAttribute('data-search') || '').toLowerCase();
      if (!query || text.includes(query)) {
        item.style.display = '';
        visible++;
      } else {
        item.style.display = 'none';
      }
    });

    if (noResults) {
      noResults.style.display = visible === 0 ? 'block' : 'none';
    }
  });
}

// ===== 标签筛选（首页） =====
function initTagFilter() {
  const filter = document.getElementById('tagFilter');
  const list = document.getElementById('essayList');
  if (!filter || !list) return;

  // 动态生成标签按钮
  const allTags = getAllTags();
  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag';
    btn.setAttribute('data-tag', tag);
    btn.textContent = tag;
    filter.appendChild(btn);
  });

  // 绑定点击事件
  filter.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tag')) return;

    const btn = e.target;
    const tag = btn.getAttribute('data-tag');

    // 切换 active 状态
    filter.querySelectorAll('.tag').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 筛选列表
    const items = list.querySelectorAll('li');
    items.forEach(item => {
      const tags = (item.getAttribute('data-tags') || '').split(',');
      if (!tag || tags.includes(tag)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });

    // 隐藏无结果提示
    const noResults = document.getElementById('searchNoResults');
    if (noResults) noResults.style.display = 'none';
  });

  // 初始状态：激活"全部"按钮
  const allBtn = filter.querySelector('.tag-all');
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      filter.querySelectorAll('.tag').forEach(b => b.classList.remove('active'));
      allBtn.classList.add('active');
      const items = list.querySelectorAll('li');
      items.forEach(item => { item.style.display = ''; });
      const noResults = document.getElementById('searchNoResults');
      if (noResults) noResults.style.display = 'none';
    });
  }
}

// ===== 目录生成（文章页） =====
function initTOC() {
  const toc = document.getElementById('toc');
  const body = document.querySelector('article .body');
  if (!toc || !body) return;

  const headings = body.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    toc.style.display = 'none';
    return;
  }

  const list = document.createElement('ul');
  list.className = 'toc-list';

  headings.forEach((h, i) => {
    // 如果没有 id，自动生成
    if (!h.id) {
      h.id = 'section-' + (i + 1);
    }

    const li = document.createElement('li');
    if (h.tagName === 'H3') {
      li.className = 'toc-h3';
    }

    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
  });

  toc.appendChild(list);
}

// ===== 上一篇/下一篇（文章页） =====
function initPrevNext() {
  const container = document.getElementById('prevNext');
  if (!container) return;

  // 从 body 上的 data-essay-date 获取当前文章日期
  const body = document.body;
  const currentDate = body.getAttribute('data-essay-date');
  if (!currentDate) return;

  // 按日期降序排列
  const sorted = [...ESSAYS].sort((a, b) => b.date.localeCompare(a.date));
  const idx = sorted.findIndex(e => e.date === currentDate);
  if (idx === -1) return;

  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  if (prev) {
    const link = document.createElement('a');
    link.href = prev.url;
    link.className = 'prev';
    link.innerHTML = '<span class="label">← 上一篇</span>' + prev.title;
    container.appendChild(link);
  } else {
    const span = document.createElement('span');
    span.className = 'prev';
    container.appendChild(span);
  }

  if (next) {
    const link = document.createElement('a');
    link.href = next.url;
    link.className = 'next';
    link.innerHTML = '<span class="label">下一篇 →</span>' + next.title;
    container.appendChild(link);
  }
}

// ===== 启动 =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBackToTop();
  initReadingTime();
  initSearch();
  initTagFilter();
  initTOC();
  initPrevNext();
});
