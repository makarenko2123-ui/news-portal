<<<<<<< HEAD
(() => {
  const panel = document.getElementById('a11y-panel');
  const backdrop = document.getElementById('backdrop');
  const toggle = document.getElementById('a11y-toggle');
  const closeBtn = document.getElementById('close');
  const closeBtn2 = document.getElementById('close2');

  const fontScale = document.getElementById('font-scale');
  const lineHeight = document.getElementById('line-height');
  const reduceMotion = document.getElementById('reduce-motion');

  const STORAGE_KEY = 'news_a11y_v1';

  const read = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } };
  const save = (s) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

  function apply(s){
    const root = document.documentElement;
    root.style.setProperty('--font-size', (s.fontScale ?? 100) + '%');
    root.style.setProperty('--line', s.lineHeight ?? 1.6);

    document.body.className = document.body.className
      .replace(/\btheme-(default|dark|high-contrast)\b/g, '')
      .trim();
    document.body.classList.add('theme-' + (s.theme ?? 'default'));

    document.documentElement.classList.toggle('reduce-motion', !!s.reduceMotion);
  }
  function uiToState(){
    const theme = document.querySelector('input[name="theme"]:checked')?.value || 'default';
    return { fontScale: Number(fontScale.value), lineHeight: Number(lineHeight.value), theme, reduceMotion: reduceMotion.checked };
  }
  function stateToUI(s){
    if(s.fontScale) fontScale.value = s.fontScale;
    if(s.lineHeight) lineHeight.value = s.lineHeight;
    if(s.theme){
      const el = document.querySelector(`input[name="theme"][value="${s.theme}"]`);
      if(el) el.checked = true;
    }
    reduceMotion.checked = !!s.reduceMotion;
  }

  // init
  const init = read();
  apply(init); stateToUI(init);

  // live update + save
  document.querySelectorAll('#a11y-panel input').forEach(el=>{
    el.addEventListener('input', () => { const s = uiToState(); apply(s); save(s); });
    el.addEventListener('change', () => { const s = uiToState(); apply(s); save(s); });
  });

  // open/close panel + focus trap
  function openPanel(){
    panel.hidden = false; backdrop.hidden = false;
    toggle.setAttribute('aria-expanded','true');
    panel.querySelector('h2').focus();
    document.addEventListener('keydown', trapTab);
  }
  function closePanel(){
    panel.hidden = true; backdrop.hidden = true;
    toggle.setAttribute('aria-expanded','false');
    document.removeEventListener('keydown', trapTab);
    toggle.focus();
  }
  toggle.addEventListener('click', ()=> panel.hidden ? openPanel() : closePanel());
  closeBtn.addEventListener('click', closePanel);
  closeBtn2.addEventListener('click', closePanel);
  backdrop.addEventListener('click', closePanel);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !panel.hidden) closePanel(); if(e.altKey && e.key==='/') openPanel(); });

  function trapTab(e){
    if(e.key!=='Tab') return;
    const f = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if(!f.length) return;
    const first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }

  // reset
  document.getElementById('reset').addEventListener('click', ()=>{
    const def = { fontScale:100, lineHeight:1.6, theme:'default', reduceMotion:false };
    apply(def); stateToUI(def); save(def);
  });

  /* ===== ФІЛЬТРАЦІЯ КАРТОК ===== */
  const navDesktop = document.getElementById('nav-filters');
  const navMobile  = document.getElementById('mobile-menu');
  const cardsWrap  = document.getElementById('cards');
  const FILTER_KEY = 'news_filter';

  function setActive(nav, f){
    nav.querySelectorAll('a').forEach(a=> a.classList.toggle('active', a.dataset.filter===f || (f==='all' && a.dataset.filter==='all')));
  }
  function applyFilter(f){
    setActive(navDesktop, f); setActive(navMobile, f);
    cardsWrap.querySelectorAll('.card').forEach(card=>{
      const cat = card.dataset.category;
      card.style.display = (f==='all' || f===cat) ? '' : 'none';
    });
  }
  function onNavClick(e){
    const a = e.target.closest('a[data-filter]'); if(!a) return;
    e.preventDefault(); const f = a.dataset.filter;
    localStorage.setItem(FILTER_KEY, f); applyFilter(f);
  }
  navDesktop.addEventListener('click', onNavClick);
  navMobile.addEventListener('click', onNavClick);
  applyFilter(localStorage.getItem(FILTER_KEY) || 'all');

  /* ===== Бургер-меню ===== */
  const burger = document.getElementById('menu-toggle');
  burger.addEventListener('click', ()=>{
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!expanded));
    navMobile.hidden = expanded;  // якщо було відкрите — сховаємо
    if(!expanded) navMobile.querySelector('a').focus();
  });

  /* ===== Кнопка НАВЕРХ ===== */
  const toTop = document.getElementById('back-to-top');
  const showAfter = 400;
  function onScroll(){
    if(window.scrollY > showAfter) toTop.hidden = false;
    else toTop.hidden = true;
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  toTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
})();
=======
(() => {
  const panel = document.getElementById('a11y-panel');
  const backdrop = document.getElementById('backdrop');
  const toggle = document.getElementById('a11y-toggle');
  const closeBtn = document.getElementById('close');
  const closeBtn2 = document.getElementById('close2');
  const live = document.getElementById('a11y-live');

  const fontScale   = document.getElementById('font-scale');
  const lineHeight  = document.getElementById('line-height');
  const measure     = document.getElementById('measure');
  const letterspace = document.getElementById('letterspace');
  const reduceMotion   = document.getElementById('reduce-motion');
  const underlineLinks = document.getElementById('underline-links');
  const thickFocus     = document.getElementById('thick-focus');

  const STORAGE_KEY = 'news_a11y_v2';
  const read = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } };
  const save = (s) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  const announce = (msg) => { if(live){ live.textContent=''; setTimeout(()=> live.textContent = msg, 0); } };

  function setThemeClass(name){
    document.body.className = document.body.className
      .replace(/\btheme-(default|dark|high-contrast|cb-safe|sepia)\b/g,'')
      .trim();
    document.body.classList.add('theme-' + name);
  }

  function apply(s){
    const root = document.documentElement;
    root.style.setProperty('--font-size', (s.fontScale ?? 100) + '%');
    root.style.setProperty('--line', s.lineHeight ?? 1.6);
    root.style.setProperty('--measure', (s.measure ?? 68) + 'ch');
    root.style.setProperty('--letter-space', (s.letterspace ?? 0));
    setThemeClass(s.theme ?? 'default');
    root.style.setProperty('--font', s.fontfam==='hyperlegible' ? 'var(--font-hyper)' : 'var(--font-system)');
    document.documentElement.classList.toggle('reduce-motion', !!s.reduceMotion);
    document.body.classList.toggle('underline-links', !!s.underlineLinks);
    document.body.classList.toggle('focus-thick', !!s.thickFocus);
  }

  function uiToState(){
    const theme = document.querySelector('input[name="theme"]:checked')?.value || 'default';
    const fontfam = document.querySelector('input[name="fontfam"]:checked')?.value || 'system';
    return {
      fontScale:Number(fontScale.value),
      lineHeight:Number(lineHeight.value),
      measure:Number(measure.value),
      letterspace:Number(letterspace.value),
      theme, fontfam,
      reduceMotion:reduceMotion.checked,
      underlineLinks:underlineLinks.checked,
      thickFocus:thickFocus.checked
    };
  }
  function stateToUI(s){
    if(s.fontScale) fontScale.value = s.fontScale;
    if(s.lineHeight) lineHeight.value = s.lineHeight;
    if(s.measure) measure.value = s.measure;
    if(typeof s.letterspace === 'number') letterspace.value = s.letterspace;
    if(s.theme){ const el=document.querySelector(`input[name="theme"][value="${s.theme}"]`); if(el) el.checked=true; }
    if(s.fontfam){ const el=document.querySelector(`input[name="fontfam"][value="${s.fontfam}"]`); if(el) el.checked=true; }
    reduceMotion.checked   = !!s.reduceMotion;
    underlineLinks.checked = !!s.underlineLinks;
    thickFocus.checked     = !!s.thickFocus;
  }

  // init
  const init = read(); apply(init); stateToUI(init);
  panel.querySelectorAll('input').forEach(el=>{
    const handler = () => { const s = uiToState(); apply(s); save(s); };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  });

  // open/close
  function openPanel(){ panel.hidden=false; backdrop.hidden=false; toggle.setAttribute('aria-expanded','true'); panel.querySelector('h2').focus(); document.addEventListener('keydown', trapTab); }
  function closePanel(){ panel.hidden=true; backdrop.hidden=true; toggle.setAttribute('aria-expanded','false'); document.removeEventListener('keydown', trapTab); toggle.focus(); }
  toggle.addEventListener('click', ()=> panel.hidden ? openPanel() : closePanel());
  closeBtn.addEventListener('click', closePanel);
  closeBtn2?.addEventListener('click', closePanel);
  backdrop.addEventListener('click', closePanel);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !panel.hidden) closePanel(); if(e.altKey && e.key==='/') openPanel(); });

  function trapTab(e){
    if(e.key!=='Tab') return;
    const f = panel.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if(!f.length) return;
    const first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }

  // reset
  document.getElementById('reset').addEventListener('click', ()=>{
    const def = { fontScale:100, lineHeight:1.6, measure:68, letterspace:0, theme:'default', fontfam:'system', reduceMotion:false, underlineLinks:false, thickFocus:false };
    apply(def); stateToUI(def); save(def); announce('Параметри скинуто до стандартних.');
  });

  /* ===== Фільтрація карток ===== */
  const navDesktop = document.getElementById('nav-filters');
  const navMobile  = document.getElementById('mobile-menu');
  const cardsWrap  = document.getElementById('cards');
  const FILTER_KEY = 'news_filter';

  function setActive(nav, f){
    nav.querySelectorAll('a').forEach(a=> a.classList.toggle('active', a.dataset.filter===f || (f==='all' && a.dataset.filter==='all')));
  }
  function applyFilter(f){
    setActive(navDesktop, f); setActive(navMobile, f);
    cardsWrap.querySelectorAll('.card').forEach(card=>{
      const cat = card.dataset.category;
      card.style.display = (f==='all' || f===cat) ? '' : 'none';
    });
    announce(`Показано категорію: ${f==='all'?'усі':f}.`);
  }
  function onNavClick(e){
    const a = e.target.closest('a[data-filter]'); if(!a) return;
    e.preventDefault(); const f=a.dataset.filter; localStorage.setItem(FILTER_KEY, f); applyFilter(f);
  }
  navDesktop.addEventListener('click', onNavClick);
  navMobile.addEventListener('click', onNavClick);
  applyFilter(localStorage.getItem(FILTER_KEY) || 'all');

  /* ===== Бургер ===== */
  const burger = document.getElementById('menu-toggle');
  burger.addEventListener('click', ()=>{
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!expanded));
    navMobile.hidden = expanded;
    if(!expanded) navMobile.querySelector('a').focus();
  });

  /* ===== Наверх ===== */
  const toTop = document.getElementById('back-to-top');
  const showAfter = 400;
  function onScroll(){ toTop.hidden = window.scrollY <= showAfter; }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  toTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
})();
>>>>>>> 26cc497 (A11y panel + FAB + layout fixes)
