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
  const measureGlobal  = document.getElementById('measure-global');
  const focusAlways    = document.getElementById('focus-always');

  const hero = document.getElementById('hero');
  const tickerTrack = document.getElementById('ticker-track');

  /* TTS controls */
  const heroTTS   = document.getElementById('hero-tts');
  const ttsVoice  = document.getElementById('tts-voice');
  const ttsRate   = document.getElementById('tts-rate');
  const ttsSample = document.getElementById('tts-sample');

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
    root.style.setProperty('--letter-space', (s.letterspace ?? 0) + 'em');

    setThemeClass(s.theme ?? 'default');
    root.style.setProperty('--font', (s.fontfam === 'hyperlegible') ? 'var(--font-hyper)' : 'var(--font-system)');

    document.documentElement.classList.toggle('reduce-motion', !!s.reduceMotion);
    document.body.classList.toggle('underline-links', !!s.underlineLinks);
    document.body.classList.toggle('focus-thick', !!s.thickFocus);
    document.body.classList.toggle('measure-all', !!s.measureGlobal);
    document.body.classList.toggle('focus-always', !!s.focusAlways);

    if (tickerTrack) tickerTrack.style.animationPlayState = s.reduceMotion ? 'paused' : 'running';
  }

  function uiToState(){
    const theme = document.querySelector('input[name="theme"]:checked')?.value || 'default';
    const fontfam = document.querySelector('input[name="fontfam"]:checked')?.value || 'system';
    return {
      fontScale: Number(fontScale.value),
      lineHeight: Number(lineHeight.value),
      measure: Number(measure.value),
      letterspace: Number(letterspace.value),
      theme, fontfam,
      reduceMotion: reduceMotion.checked,
      underlineLinks: underlineLinks.checked,
      thickFocus: thickFocus.checked,
      measureGlobal: measureGlobal?.checked ?? true,
      focusAlways:   focusAlways?.checked ?? false,
      ttsVoice: ttsVoice?.value || '',
      ttsRate:  Number(ttsRate?.value || 1)
    };
  }

  function stateToUI(s){
    if(s.fontScale) fontScale.value = s.fontScale;
    if(s.lineHeight) lineHeight.value = s.lineHeight;
    if(s.measure) measure.value = s.measure;
    if(typeof s.letterspace === 'number') letterspace.value = s.letterspace;
    if(s.theme){ document.querySelector(`input[name="theme"][value="${s.theme}"]`)?.setAttribute('checked',''); }
    if(s.fontfam){ document.querySelector(`input[name="fontfam"][value="${s.fontfam}"]`)?.setAttribute('checked',''); }

    if(measureGlobal) measureGlobal.checked = !!s.measureGlobal;
    if(focusAlways)   focusAlways.checked   = !!s.focusAlways;

    if(ttsRate)  ttsRate.value  = s.ttsRate ?? 1;
    if(ttsVoice && s.ttsVoice) ttsVoice.value = s.ttsVoice;
  }

  const init = read(); apply(init); stateToUI(init);

  panel.querySelectorAll('input, select').forEach(el=>{
    const handler = () => { const s = uiToState(); apply(s); save(s); };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  });

  /* Open/close panel */
  function openPanel(){ panel.hidden=false; backdrop.hidden=false; toggle.setAttribute('aria-expanded','true'); panel.querySelector('h2').focus(); document.addEventListener('keydown', trapTab); }
  function closePanel(){ panel.hidden=true; backdrop.hidden=true; toggle.setAttribute('aria-expanded','false'); document.removeEventListener('keydown', trapTab); toggle.focus(); }
  toggle.addEventListener('click', ()=> panel.hidden ? openPanel() : closePanel());
  closeBtn.addEventListener('click', closePanel);
  closeBtn2.addEventListener('click', closePanel);
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

  /* Reset */
  document.getElementById('reset').addEventListener('click', ()=>{
    const def = { fontScale:100, lineHeight:1.6, measure:68, letterspace:0, theme:'default', fontfam:'system', reduceMotion:false, underlineLinks:false, thickFocus:false, measureGlobal:true, focusAlways:false, ttsVoice:'', ttsRate:1 };
    apply(def); stateToUI(def); save(def); announce('Параметри скинуто до стандартних.');
  });

  /* ===== Фільтр + приховати HERO ===== */
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
    if (hero) hero.style.display = (f==='all') ? '' : 'none';
    announce(`Показано категорію: ${f==='all'?'усі':f}.`);
  }
  function onNavClick(e){
    const a = e.target.closest('a[data-filter]'); if(!a) return;
    e.preventDefault(); const f=a.dataset.filter; localStorage.setItem(FILTER_KEY, f); applyFilter(f);
  }
  navDesktop.addEventListener('click', onNavClick);
  navMobile.addEventListener('click', onNavClick);
  applyFilter(localStorage.getItem(FILTER_KEY) || 'all');

  /* Бургер */
  const burger = document.getElementById('menu-toggle');
  const navMobileEl  = document.getElementById('mobile-menu');
  burger.addEventListener('click', ()=>{
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!expanded));
    navMobileEl.hidden = expanded;
    if(!expanded) navMobileEl.querySelector('a').focus();
  });

  /* Back-to-top */
  const toTop = document.getElementById('back-to-top');
  const showAfter = 400;
  function onScroll(){ toTop.hidden = window.scrollY <= showAfter; }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  toTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

  /* ===== TTS (Web Speech API) ===== */
  let VOICES = [];
  function loadVoices(){
    if(!('speechSynthesis' in window)) return;
    VOICES = window.speechSynthesis.getVoices()
      .filter(v => v.lang.startsWith('uk') || v.lang.startsWith('ru') || v.lang.startsWith('en'));
    if(ttsVoice && !ttsVoice.options.length){
      VOICES.forEach(v => {
        const o = document.createElement('option');
        o.value = v.name; o.textContent = `${v.name} (${v.lang})`;
        ttsVoice.appendChild(o);
      });
      const saved = read().ttsVoice;
      if(saved){ ttsVoice.value = saved; }
    }
  }
  if('speechSynthesis' in window){
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }

  function speak(text){
    if(!('speechSynthesis' in window)){ alert('Озвучка не підтримується цим браузером'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = VOICES.find(v => v.name === (ttsVoice?.value || '')) || VOICES[0];
    if(v) u.voice = v;
    u.rate = Number(ttsRate?.value || 1);
    window.speechSynthesis.speak(u);
  }

  function extractCardText(card){
    const h = card.querySelector('h3')?.textContent?.trim() || '';
    const p = card.querySelector('p')?.textContent?.trim() || '';
    return `${h}. ${p}`;
  }
  function speakCard(card){ speak(extractCardText(card)); }
  function speakHero(){
    const h = document.querySelector('.hero h1')?.textContent?.trim() || '';
    const m = document.querySelector('.hero .meta')?.textContent?.trim() || '';
    speak(`${h}. ${m}`);
  }

  function injectTTSButtons(){
    document.querySelectorAll('.card').forEach(card => {
      if(card.querySelector('.tts-btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'tts-btn'; btn.setAttribute('aria-label','Прослухати новину');
      btn.textContent = '🔊';
      btn.addEventListener('click', () => speakCard(card));
      card.appendChild(btn);
    });
  }
  injectTTSButtons();

  ttsSample?.addEventListener('click', () => speak('Це приклад озвучки. Ви можете змінити голос і швидкість читання.'));
  heroTTS?.addEventListener('click', speakHero);

  [ttsVoice, ttsRate].forEach(el=>{
    el?.addEventListener('change', ()=>{ const s = uiToState(); save(s); });
  });
})();
