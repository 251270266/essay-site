/* ===== 随笔集 - 全局脚本 ===== */

// ================================================================
// 📝 文章数据 — 添加新文章只需在这里加一条记录
// ================================================================
// 字段说明：
//   title   — 文章标题
//   date    — 日期 (YYYY-MM-DD)
//   url     — 文件路径
//   excerpt — 摘要（用于首页卡片和搜索）
//   chars   — 总字符数（用于估算阅读时间，中文 ~300字/分钟）
//   tags    — 标签数组，用于分类筛选
// ================================================================

const ESSAYS = [
  {
    title: '电影《返老还童》有感',
    date: '2026-06-23',
    url: 'essays/2026-06-23.html',
    excerpt: '今天不写电影评论，只从自身角度谈谈感受。我已记不清看了几遍这部电影，每次看到结尾，泪水止不住地在眼眶打转……',
    chars: 1050,
    tags: ['电影', '感悟', '婚姻', '人生'],
  },
  {
    title: '雨天与《悉达多》',
    date: '2026-06-22',
    url: 'essays/2026-06-22.html',
    excerpt: '大雨一直都在下。一天把《悉达多》看完，久久无法平静。当看到只剩下最后两章时，突然踩住了刹车……',
    chars: 580,
    tags: ['读书', '感悟', '黑塞'],
  },
  {
    title: '阅读与写作的随想',
    date: '2026-06-17',
    url: 'essays/2026-06-17.html',
    excerpt: '真真切切感受到了在阅读写作上的些许成长。虽然距离出口成章还相差甚远，但能切身感受到自己不那么惧怕写作了……',
    chars: 2460,
    tags: ['阅读', '写作', '读书', '感悟'],
  },
];

// ===== 工具函数 =====

function getWeekday(dateStr) {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const d = new Date(dateStr + 'T00:00:00');
  return weekdays[d.getDay()];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
}

function calcReadingTime(chars) {
  return Math.max(1, Math.round(chars / 300));
}

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

// 按日期降序排列（最新的在前）
function getSortedEssays() {
  return [...ESSAYS].sort((a, b) => b.date.localeCompare(a.date));
}

// ===== 渲染首页文章列表 =====
function renderEssayList() {
  const list = document.getElementById('essayList');
  if (!list) return;

  const sorted = getSortedEssays();

  sorted.forEach(essay => {
    const readingMin = calcReadingTime(essay.chars);

    const li = document.createElement('li');
    li.setAttribute('data-search', essay.title + ' ' + essay.excerpt);
    li.setAttribute('data-tags', essay.tags.join(','));

    li.innerHTML =
      '<a href="' + essay.url + '">' +
        '<div class="essay-title">' + essay.title + '</div>' +
        '<div class="essay-meta">' +
          '<span class="essay-date">' + formatDate(essay.date) + '</span>' +
          '<span class="reading-time" data-chars="' + essay.chars + '">阅读约 ' + readingMin + ' 分钟</span>' +
        '</div>' +
        '<div class="essay-tags">' +
          essay.tags.map(t => '<span class="tag">' + t + '</span>').join('') +
        '</div>' +
        '<div class="essay-excerpt">' + essay.excerpt + '</div>' +
      '</a>';

    list.appendChild(li);
  });
}

// ===== 暗色模式 =====
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

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

  // 事件委托
  filter.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tag')) return;

    const btn = e.target;
    const tag = btn.getAttribute('data-tag');

    filter.querySelectorAll('.tag').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const items = list.querySelectorAll('li');
    items.forEach(item => {
      const tags = (item.getAttribute('data-tags') || '').split(',');
      if (!tag || tags.includes(tag)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });

    const noResults = document.getElementById('searchNoResults');
    if (noResults) noResults.style.display = 'none';
  });

  // "全部" 按钮
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

  const currentDate = document.body.getAttribute('data-essay-date');
  if (!currentDate) return;

  const sorted = getSortedEssays();
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
  renderEssayList();   // ← 首页文章列表由 JS 渲染
  initTheme();
  initBackToTop();
  initSearch();
  initTagFilter();
  initTOC();
  initPrevNext();
});
