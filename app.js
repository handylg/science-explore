// ========== 科学探索 - 主应用逻辑 ==========

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavigation();
  initThemeToggle();
  initSearch();
  initCountdown();
  renderFeaturedContent();
  renderArticles();
  renderVideos();
  renderScientists();
  renderTimeline();
  renderFunFacts();
  initQuiz();
  initComments();
  initBackToTop();
  initScrollAnimations();
  updateStats();
});

// ========== 粒子背景 ==========
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 6 + 2;
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(particle);
  }
}

// ========== 导航栏 ==========
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  const links = navLinks.querySelectorAll('a');

  // 滚动效果
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // 移动端菜单
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // 导航链接点击
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      navLinks.classList.remove('active');
    });
  });

  // 滚动时高亮当前区域
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.id;
    });
    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// ========== 主题切换 ==========
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const icon = btn.querySelector('i');
  const saved = localStorage.getItem('theme');

  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    icon.className = 'fas fa-sun';
  }

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      icon.className = 'fas fa-moon';
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      icon.className = 'fas fa-sun';
      localStorage.setItem('theme', 'dark');
    }
  });
}

// ========== 搜索功能 ==========
function initSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchModal = document.getElementById('searchModal');
  const closeSearch = document.getElementById('closeSearch');
  const searchInput = document.getElementById('searchInput');
  const doSearch = document.getElementById('doSearch');
  const resultsContainer = document.getElementById('searchResults');

  searchBtn.addEventListener('click', () => {
    searchModal.classList.add('active');
    setTimeout(() => searchInput.focus(), 100);
  });

  closeSearch.addEventListener('click', () => searchModal.classList.remove('active'));

  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) searchModal.classList.remove('active');
  });

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) { resultsContainer.innerHTML = ''; return; }

    let results = [];

    // 搜索文章
    ScienceDB.articles.forEach(a => {
      if (a.title.toLowerCase().includes(query) ||
          a.summary.toLowerCase().includes(query) ||
          a.tags.some(t => t.includes(query)) ||
          a.category.includes(query)) {
        results.push({ type: '文章', icon: '📖', title: a.title, desc: a.summary, action: () => openArticle(a) });
      }
    });

    // 搜索视频
    ScienceDB.videos.forEach(v => {
      if (v.title.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query)) {
        results.push({ type: '视频', icon: '🎬', title: v.title, desc: v.description, action: () => {} });
      }
    });

    // 搜索科学家
    ScienceDB.scientists.forEach(s => {
      if (s.name.includes(query) || s.field.includes(query) || s.nameEn.toLowerCase().includes(query)) {
        results.push({ type: '人物', icon: '👤', title: s.name, desc: `${s.field} · ${s.years}`, action: () => showScientistDetail(s) });
      }
    });

    // 搜索趣味知识
    ScienceDB.funFacts.forEach(f => {
      if (f.fact.toLowerCase().includes(query) || f.category.includes(query)) {
        results.push({ type: '趣味', icon: '💡', title: f.category, desc: f.fact.substring(0, 60) + '...', action: () => {} });
      }
    });

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem;">😕 没有找到相关内容，试试其他关键词</p>';
      return;
    }

    resultsContainer.innerHTML = results.map((r, i) => `
      <div class="search-result-item" data-index="${i}">
        <span class="search-result-type">${r.icon} ${r.type}</span>
        <h4>${highlightText(r.title, query)}</h4>
        <p>${highlightText(r.desc, query)}</p>
      </div>
    `).join('');

    resultsContainer.querySelectorAll('.search-result-item').forEach((item, i) => {
      item.addEventListener('click', () => {
        searchModal.classList.remove('active');
        results[i].action();
      });
    });
  }

  function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background:var(--accent);color:white;padding:0 2px;border-radius:2px;">$1</mark>');
  }

  searchInput.addEventListener('input', performSearch);
  doSearch.addEventListener('click', performSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
    if (e.key === 'Escape') searchModal.classList.remove('active');
  });
}

// ========== 倒计时 ==========
function initCountdown() {
  const el = document.getElementById('countdown');
  const weekEl = document.getElementById('weekNum');

  weekEl.textContent = ScienceDB.getCurrentWeek();

  function update() {
    const next = ScienceDB.getNextUpdateTime();
    const diff = next - new Date();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${d}天 ${h}时 ${m}分 ${s}秒`;
  }

  update();
  setInterval(update, 1000);
}

// ========== 本周精选 ==========
function renderFeaturedContent() {
  const container = document.getElementById('featuredContent');
  const featured = ScienceDB.getFeaturedContent();
  let html = '';

  if (featured.articles.length > 0) {
    const a = featured.articles[0];
    html += `
      <div class="featured-card fade-in" onclick='openArticle(ScienceDB.articles.find(x=>x.id===${a.id}))'>
        <div class="featured-type">📖 本周推荐文章</div>
        <h3>${a.icon} ${a.title}</h3>
        <p>${a.summary}</p>
      </div>`;
  }

  if (featured.videos.length > 0) {
    const v = featured.videos[0];
    html += `
      <div class="featured-card fade-in">
        <div class="featured-type">🎬 本周推荐视频</div>
        <h3>${v.title}</h3>
        <p>${v.description}</p>
      </div>`;
  }

  if (featured.scientists.length > 0) {
    const s = featured.scientists[0];
    html += `
      <div class="featured-card fade-in" onclick='showScientistDetail(ScienceDB.scientists.find(x=>x.id===${s.id}))'>
        <div class="featured-type">👤 本周科学人物</div>
        <h3>${s.avatar} ${s.name}</h3>
        <p>${s.quote}</p>
      </div>`;
  }

  container.innerHTML = html;
}

// ========== 文章渲染 ==========
function renderArticles(filter = 'all') {
  const grid = document.getElementById('articlesGrid');
  const articles = filter === 'all'
    ? ScienceDB.articles
    : ScienceDB.articles.filter(a => a.category === filter);

  grid.innerHTML = articles.map(a => `
    <div class="article-card fade-in" onclick='openArticle(ScienceDB.articles.find(x=>x.id===${a.id}))'>
      <div class="article-card-header">
        <span class="article-icon">${a.icon}</span>
        <div class="article-meta-top">
          <span class="article-category">${a.category}</span>
          <h3>${a.title}</h3>
        </div>
      </div>
      <div class="article-card-body">
        <p>${a.summary}</p>
      </div>
      <div class="article-card-footer">
        <span><i class="fas fa-user"></i> ${a.author}</span>
        <span><i class="fas fa-clock"></i> ${a.readTime}分钟</span>
        <span><i class="fas fa-eye"></i> ${formatNumber(a.views)}</span>
      </div>
    </div>
  `).join('');

  initScrollAnimations();

  // 筛选按钮事件
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderArticles(btn.dataset.filter);
    });
  });
}

// ==========打开文章详情 ==========
function openArticle(article) {
  const modal = document.getElementById('articleModal');
  const detail = document.getElementById('articleDetail');
  const likes = JSON.parse(localStorage.getItem('likes') || '{}');
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '{}');
  const isLiked = likes[article.id];
  const isBookmarked = bookmarks[article.id];

  detail.innerHTML = `
    <div class="article-detail-header">
      <div class="article-detail-icon">${article.icon}</div>
      <h1>${article.title}</h1>
      <div class="article-detail-meta">
        <span><i class="fas fa-user"></i> ${article.author}</span>
        <span><i class="fas fa-calendar"></i> ${article.date}</span>
        <span><i class="fas fa-clock"></i> ${article.readTime}分钟</span>
        <span><i class="fas fa-eye"></i> ${formatNumber(article.views)}次阅读</span>
      </div>
      <div class="article-detail-tags">
        ${article.tags.map(t => `<span class="article-tag"># ${t}</span>`).join('')}
      </div>
    </div>
    <div class="article-detail-content">${article.content}</div>
    <div class="article-actions">
      <button class="article-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${article.id}, this)">
        <i class="fas fa-heart"></i> <span>${isLiked ? '已喜欢' : '喜欢'}</span>
      </button>
      <button class="article-action-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark(${article.id}, this)">
        <i class="fas fa-bookmark"></i> <span>${isBookmarked ? '已收藏' : '收藏'}</span>
      </button>
      <button class="article-action-btn" onclick="shareArticle('${article.title}')">
        <i class="fas fa-share-alt"></i> <span>分享</span>
      </button>
    </div>
  `;

  modal.classList.add('active');

  document.getElementById('closeArticle').onclick = () => modal.classList.remove('active');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

function toggleLike(id, btn) {
  const likes = JSON.parse(localStorage.getItem('likes') || '{}');
  if (likes[id]) {
    delete likes[id];
    btn.classList.remove('liked');
    btn.querySelector('span').textContent = '喜欢';
  } else {
    likes[id] = true;
    btn.classList.add('liked');
    btn.querySelector('span').textContent = '已喜欢';
  }
  localStorage.setItem('likes', JSON.stringify(likes));
}

function toggleBookmark(id, btn) {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '{}');
  if (bookmarks[id]) {
    delete bookmarks[id];
    btn.classList.remove('bookmarked');
    btn.querySelector('span').textContent = '收藏';
  } else {
    bookmarks[id] = true;
    btn.classList.add('bookmarked');
    btn.querySelector('span').textContent = '已收藏';
  }
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function shareArticle(title) {
  if (navigator.share) {
    navigator.share({ title: `科学探索 - ${title}`, text: `推荐一篇科普文章：${title}`, url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => alert('链接已复制到剪贴板！'));
  }
}

// ========== 视频渲染 ==========
function renderVideos() {
  const grid = document.getElementById('videosGrid');
  grid.innerHTML = ScienceDB.videos.map(v => `
    <div class="video-card fade-in">
      <div class="video-thumb">
        <span class="video-thumb-icon">🎬</span>
        <div class="video-play-btn"><i class="fas fa-play"></i></div>
        <span class="video-duration">${v.duration}</span>
      </div>
      <div class="video-info">
        <span class="video-category-tag">${v.category}</span>
        <h3>${v.title}</h3>
        <p>${v.description}</p>
        <div class="video-meta">
          <span><i class="fas fa-eye"></i> ${formatNumber(v.views)}次观看</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ========== 科学家渲染 ==========
function renderScientists() {
  const grid = document.getElementById('scientistsGrid');
  grid.innerHTML = ScienceDB.scientists.map(s => `
    <div class="scientist-card fade-in" onclick='showScientistDetail(ScienceDB.scientists.find(x=>x.id===${s.id}))'>
      <span class="scientist-avatar">${s.avatar}</span>
      <h3>${s.name}</h3>
      <div class="scientist-en-name">${s.nameEn}</div>
      <span class="scientist-field">${s.field}</span>
      <div class="scientist-quote">${s.quote}</div>
      <div class="scientist-years">${s.years} · ${s.nationality}</div>
    </div>
  `).join('');
}

function showScientistDetail(s) {
  const modal = document.getElementById('articleModal');
  const detail = document.getElementById('articleDetail');
  detail.innerHTML = `
    <div class="article-detail-header" style="text-align:center;">
      <div class="article-detail-icon">${s.avatar}</div>
      <h1>${s.name}</h1>
      <p style="color:var(--text-secondary);margin-bottom:0.5rem;">${s.nameEn} · ${s.years} · ${s.nationality}</p>
      <span class="scientist-field">${s.field}</span>
    </div>
    <div class="article-detail-content">
      <h3>📋简介</h3>
      <p>${s.bio}</p>
      <h3>🏆 主要成就</h3>
      <p>${s.achievements}</p>
      <h3>💬 名言</h3>
      <p style="font-style:italic;color:var(--primary);font-size:1.1rem;">"${s.quote}"</p>
    </div>
  `;
  modal.classList.add('active');
  document.getElementById('closeArticle').onclick = () => modal.classList.remove('active');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

// ========== 时间线渲染 ==========
function renderTimeline() {
  const container = document.getElementById('timeline');
  container.innerHTML = ScienceDB.events.map(e => `
    <div class="timeline-item fade-in">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <span class="timeline-year">${e.year}</span>
        <h3>${e.icon} ${e.title}</h3>
        <p>${e.description}</p>
        <div class="timeline-impact">💡 ${e.impact}</div>
      </div>
    </div>
  `).join('');
}

// ========== 趣味知识渲染 ==========
function renderFunFacts() {
  const grid = document.getElementById('factsGrid');
  const facts = ScienceDB.getDailyFacts(6);
  grid.innerHTML = facts.map(f => `
    <div class="fact-card fade-in">
      <span class="fact-category">${f.category}</span>
      <p>${f.fact}</p>
    </div>
  `).join('');
  initScrollAnimations();
}

document.getElementById('refreshFacts').addEventListener('click', () => {
  const grid = document.getElementById('factsGrid');
  const all = [...ScienceDB.funFacts].sort(() => Math.random() - 0.5).slice(0, 6);
  grid.innerHTML = all.map(f => `
    <div class="fact-card fade-in">
      <span class="fact-category">${f.category}</span>
      <p>${f.fact}</p>
    </div>
  `).join('');
  initScrollAnimations();
});

// ========== 问答系统 ==========
function initQuiz() {
  let questions = [];
  let current = 0;
  let score = 0;

  document.getElementById('startQuiz').addEventListener('click', () => {
    questions = ScienceDB.getQuizQuestions(5);
    current = 0;
    score = 0;
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizQuestions').style.display = 'block';
    renderQuestion();
  });

  function renderQuestion() {
    const q = questions[current];
    const container = document.getElementById('quizQuestions');
    const letters = ['A', 'B', 'C', 'D'];
    const progress = ((current) / questions.length * 100);

    container.innerHTML = `
      <div class="quiz-question">
        <div class="quiz-progress">
          <span>第 ${current + 1}/${questions.length} 题</span>
          <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
          <span>得分: ${score}</span>
        </div>
        <h3>${q.question}</h3>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-option" data-index="${i}">
              <span class="option-letter">${letters[i]}</span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
        <div id="explanation" style="display:none" class="quiz-explanation"></div>
      </div>
    `;

    container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(parseInt(btn.dataset.index), q));
    });
  }

  function handleAnswer(index, q) {
    const options = document.querySelectorAll('.quiz-option');
    const explanation = document.getElementById('explanation');

    options.forEach(opt => opt.classList.add('disabled'));

    if (index === q.correct) {
      score++;
      options[index].classList.add('correct');
 explanation.innerHTML = `✅ <strong>回答正确！</strong> ${q.explanation}`;
    } else {
      options[index].classList.add('wrong');
      options[q.correct].classList.add('correct');
      explanation.innerHTML = `❌ <strong>回答错误。</strong> ${q.explanation}`;
    }

    explanation.style.display = 'block';

    setTimeout(() => {
      current++;
      if (current < questions.length) {
        renderQuestion();
      } else {
        showResult();
      }
    }, 2500);
  }

  function showResult() {
    document.getElementById('quizQuestions').style.display = 'none';
    const result = document.getElementById('quizResult');
    result.style.display = 'block';

    let emoji, text, desc;
    const pct = score / questions.length;
    if (pct === 1) { emoji = '🏆'; text = '满分！你是科学天才！'; desc = '完美的科学素养，继续保持对知识的渴望！'; }
    else if (pct >= 0.8) { emoji = '🌟'; text = '非常优秀！'; desc = '你对科学知识有很好的掌握，离专家只有一步之遥！'; }
    else if (pct >= 0.6) { emoji = '👍'; text = '不错哦！'; desc = '你有扎实的科学基础，继续学习会更棒！'; }
    else if (pct >= 0.4) { emoji = '💪'; text = '还需努力！'; desc = '多看看我们的科普文章，提升你的科学素养！'; }
    else { emoji = '📚'; text = '继续学习！'; desc = '科学的世界无穷无尽，每一点进步都值得鼓励！'; }

    result.innerHTML = `
      <div class="result-emoji">${emoji}</div>
      <div class="result-score">${score}/${questions.length}</div>
      <div class="result-text">${text}</div>
      <div class="result-desc">${desc}</div>
      <button class="btn btn-primary" onclick="document.getElementById('quizStart').style.display='block';document.getElementById('quizResult').style.display='none';">
        <i class="fas fa-redo"></i> 再来一次
      </button>
    `;
  }
}

// ========== 评论系统 ==========
function initComments() {
  renderComments();

  document.getElementById('submitComment').addEventListener('click', () => {
    const name = document.getElementById('commentName').value.trim();
    const text = document.getElementById('commentText').value.trim();

    if (!name) { alert('请输入昵称'); return; }
    if (!text) { alert('请输入评论内容'); return; }

    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.unshift({
      id: Date.now(),
      name,
      text,
      time: new Date().toLocaleString('zh-CN'),
      color: getRandomColor()
    });
    localStorage.setItem('comments', JSON.stringify(comments));

    document.getElementById('commentText').value = '';
    renderComments();
  });
}

function renderComments() {
  const container = document.getElementById('commentsList');
  const comments = JSON.parse(localStorage.getItem('comments') || '[]');

  if (comments.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem;">还没有评论，来发表第一条吧！💬</p>';
    return;
  }

  container.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-header">
        <div class="comment-user">
          <div class="comment-avatar" style="background:${c.color}">${c.name.charAt(0)}</div>
          <div>
            <div class="comment-name">${escapeHtml(c.name)}</div>
            <div class="comment-time">${c.time}</div>
          </div>
        </div>
        <button class="comment-delete" onclick="deleteComment(${c.id})"><i class="fas fa-trash-alt"></i></button>
      </div>
      <div class="comment-text">${escapeHtml(c.text)}</div>
    </div>
  `).join('');
}

function deleteComment(id) {
  let comments = JSON.parse(localStorage.getItem('comments') || '[]');
  comments = comments.filter(c => c.id !== id);
  localStorage.setItem('comments', JSON.stringify(comments));
  renderComments();
}

// ========== 回到顶部 ==========
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ========== 滚动动画 ==========
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

// ========== 更新统计数字 ==========
function updateStats() {
  animateNumber('statArticles', ScienceDB.articles.length);
  animateNumber('statVideos', ScienceDB.videos.length);
  animateNumber('statScientists', ScienceDB.scientists.length);
  animateNumber('statFacts', ScienceDB.funFacts.length);
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 50);
}

// ========== 工具函数 ==========
function formatNumber(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function getRandomColor() {
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
