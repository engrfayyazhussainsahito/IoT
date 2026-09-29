(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function inferRootPath(){
    const path = location.pathname;
    if(/\/weeks\/week-[\w-]+\//.test(path)) return '../../';
    return '';
  }
  const rootPath = document.body.dataset.root || inferRootPath() || '';
  function abs(url){
    if(!url || url.startsWith('http') || url.startsWith('#')) return url;
    return rootPath + url;
  }
  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  /* ---- Theme ---- */
  function initTheme(){
    const saved = localStorage.getItem('theme');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = saved || preferred;
    const label = () => document.documentElement.dataset.theme === 'dark' ? '☀ Light' : '● Dark';
    $$('.theme-toggle').forEach(btn => {
      btn.textContent = label();
      btn.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('theme', next);
        $$('.theme-toggle').forEach(b => b.textContent = label());
        if(window.mermaid) location.reload();
      });
    });
  }

  /* ---- Sidebar ---- */
  function initSidebar(){
    const sidebar = $('#sidebar');
    const nav = $('#courseNav');
    const open = $('#openSidebar');
    const close = $('#closeSidebar');
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
    const openSidebar = () => { sidebar?.classList.add('open'); backdrop.classList.add('visible'); };
    const closeSidebar = () => { sidebar?.classList.remove('open'); backdrop.classList.remove('visible'); };
    if(open) open.addEventListener('click', openSidebar);
    if(close) close.addEventListener('click', closeSidebar);
    backdrop.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeSidebar(); });
    if(!nav || !window.COURSE_NAV) return;
    const path = location.pathname.replace(/\/+$/,'');
    const matchesUrl = (url) => {
      if(!url || url === '#') return false;
      if(url === 'index.html') return /\/index\.html$/.test(path) && !path.includes('/weeks/');
      return path.endsWith('/' + url.replace(/^\.\.\//,''));
    };
    nav.innerHTML = window.COURSE_NAV.map(group => `
      <section class="nav-group" aria-labelledby="nav-${slug(group.group)}">
        <div class="nav-group-title" id="nav-${slug(group.group)}">${escapeHtml(group.group)}</div>
        <ul class="nav-list">
          ${group.items.map(item => {
            const isCurrent = matchesUrl(item.url);
            const href = item.url === '#' ? '#' : abs(item.url);
            return `<li><a href="${href}" ${isCurrent?'aria-current="page"':''}>${escapeHtml(item.title)} <span class="status">${escapeHtml(item.status||'')}</span></a></li>`;
          }).join('')}
        </ul>
      </section>`).join('');
  }

  /* ---- Reading progress ---- */
  function initProgressBar(){
    const bar = $('#readingProgress');
    if(!bar) return;
    const update = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (height > 0 ? (scrollTop/height)*100 : 0) + '%';
    };
    update();
    window.addEventListener('scroll', update, {passive:true});
  }

  /* ---- TOC ---- */
  function initTOC(){
    const toc = $('#tocList');
    const article = $('.article');
    if(!toc || !article) return;
    const headings = $$('h2, h3', article).filter(h => !h.classList.contains('no-toc'));
    if(!headings.length){ toc.innerHTML = '<li class="small">No sections found.</li>'; return; }
    headings.forEach(h => { if(!h.id) h.id = slug(h.textContent); });
    toc.innerHTML = headings.map(h => {
      const indent = h.tagName === 'H3' ? ' style="padding-left:1rem;font-size:.78rem"' : '';
      return `<li${indent}><a href="#${h.id}">${escapeHtml(h.textContent)}</a></li>`;
    }).join('');
    const links = $$('a', toc);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          links.forEach(a => a.style.borderLeftColor = 'transparent');
          const link = toc.querySelector(`a[href="#${entry.target.id}"]`);
          if(link) link.style.borderLeftColor = 'var(--accent)';
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    headings.forEach(h => observer.observe(h));
  }

  /* ---- Copy buttons on code blocks ---- */
  function initCopyButtons(){
    $$('pre').forEach(pre => {
      if(pre.querySelector('.copy-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(pre.innerText.replace(/Copy$/,'').trim());
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1400);
      });
      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  /* ---- Bookmarks & completion ---- */
  function initTracking(){
    const pageId = document.body.dataset.pageId;
    if(!pageId) return;
    const bmKey = 'bookmarks', cmKey = 'completed';
    const getSet = k => new Set(JSON.parse(localStorage.getItem(k) || '[]'));
    const saveSet = (k,s) => localStorage.setItem(k, JSON.stringify([...s]));
    const bmBtn = $('#bookmarkBtn'), cmBtn = $('#completeBtn');
    if(bmBtn){
      const refresh = () => bmBtn.textContent = getSet(bmKey).has(pageId) ? '★ Bookmarked' : '☆ Bookmark lesson';
      refresh();
      bmBtn.addEventListener('click', () => {
        const s = getSet(bmKey);
        s.has(pageId) ? s.delete(pageId) : s.add(pageId);
        saveSet(bmKey, s); refresh();
      });
    }
    if(cmBtn){
      const refresh = () => { const done = getSet(cmKey).has(pageId); cmBtn.textContent = done ? '✓ Completed' : 'Mark complete'; cmBtn.classList.toggle('active', done); };
      refresh();
      cmBtn.addEventListener('click', () => {
        const s = getSet(cmKey);
        s.has(pageId) ? s.delete(pageId) : s.add(pageId);
        saveSet(cmKey, s); refresh();
      });
    }
    // recently viewed
    const recent = JSON.parse(localStorage.getItem('recent') || '[]').filter(p => p !== pageId);
    recent.unshift(pageId);
    localStorage.setItem('recent', JSON.stringify(recent.slice(0,8)));
  }

  /* ---- Quiz mode: turn quiz card options into interactive checks ---- */
  function initQuiz(){
    $$('.quiz-q').forEach(q => {
      const opts = $$('.quiz-opt', q);
      const explain = $('.quiz-explain', q);
      opts.forEach(opt => {
        opt.addEventListener('click', () => {
          if(opt.dataset.locked) return;
          opts.forEach(o => o.dataset.locked = '1');
          opts.forEach(o => o.classList.add(o.dataset.correct === 'true' ? 'correct' : (o === opt ? 'incorrect' : '')));
          if(explain) explain.classList.add('show');
        });
      });
    });
  }

  /* ---- Print ---- */
  function initPrint(){
    $$('.print-page').forEach(btn => btn.addEventListener('click', () => window.print()));
  }

  /* ---- Mini nav search ---- */
  function initSearch(){
    const input = $('#navSearch');
    const results = $('.mini-results');
    if(!input || !window.SEARCH_INDEX) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if(q.length < 2){ results.innerHTML=''; return; }
      const hits = window.SEARCH_INDEX.filter(e =>
        e.title.toLowerCase().includes(q) || (e.tags||'').toLowerCase().includes(q) || (e.summary||'').toLowerCase().includes(q)
      ).slice(0,8);
      results.innerHTML = hits.map(h => `<a href="${abs(h.url)}">${escapeHtml(h.title)}</a>`).join('') || '<div class="small" style="padding:.4rem .5rem;color:var(--ink-faint)">No matches</div>';
    });
  }

  /* ---- Mermaid ---- */
  function initMermaid(){
    if(!window.mermaid) return;
    mermaid.initialize({ startOnLoad:true, securityLevel:'strict', theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default', fontFamily:'Inter' });
  }

  /* ---- Glossary tooltips: dfn.term[data-def] ---- */
  function initGlossaryTooltips(){
    $$('dfn.term[data-def]').forEach(el => {
      el.setAttribute('title', el.dataset.def);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme(); initSidebar(); initProgressBar(); initTOC(); initCopyButtons();
    initTracking(); initQuiz(); initPrint(); initSearch(); initMermaid(); initGlossaryTooltips();
  });
})();
