(() => {
  'use strict';

  const compactMQ = window.matchMedia('(max-width:899px)');
  const focusableSelector = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function toast(message){
    let host=document.getElementById('v12ToastHost');
    if(!host){host=document.createElement('div');host.id='v12ToastHost';document.body.appendChild(host)}
    const item=document.createElement('div');item.className='v12-toast';item.textContent=message;host.appendChild(item);
    setTimeout(()=>{item.style.opacity='0';item.style.transform='translateY(6px)';setTimeout(()=>item.remove(),180)},2600);
  }
  window.v12Toast=toast;

  function triggerExisting(id){const el=document.getElementById(id);if(el)el.click()}
  function go(view){
    const target=document.querySelector(`.dockbtn[data-view="${view}"]`)||document.querySelector(`.navbtn[data-view="${view}"]`);
    if(target)target.click();
  }

  function setupMoreSheet(){
    const actions=document.querySelector('#glassHeader .actions');
    if(!actions||document.getElementById('v12MoreBtn'))return;
    const trigger=document.createElement('button');
    trigger.id='v12MoreBtn';trigger.type='button';trigger.className='v12-more-trigger';trigger.setAttribute('aria-label','Más opciones');trigger.setAttribute('aria-haspopup','dialog');trigger.textContent='•••';
    actions.appendChild(trigger);

    const layer=document.createElement('div');
    layer.className='v12-sheet-layer';layer.id='v12MoreSheet';layer.setAttribute('aria-hidden','true');
    layer.innerHTML=`<section class="v12-sheet" role="dialog" aria-modal="true" aria-labelledby="v12SheetTitle">
      <div class="v12-sheet-handle" aria-hidden="true"></div>
      <div class="v12-sheet-head"><div><h3 id="v12SheetTitle">Más herramientas</h3><p>Accesos secundarios sin cargar la barra principal.</p></div><button class="v12-sheet-close" type="button" aria-label="Cerrar">×</button></div>
      <div class="v12-sheet-grid">
        <button class="v12-sheet-action" data-v12-view="agendaView"><span>≡</span><b>Agenda</b><small>Semana cronológica</small></button>
        <button class="v12-sheet-action" data-v12-view="lanesView"><span>▤</span><b>Franjas</b><small>Familias y recursos</small></button>
        <button class="v12-sheet-action" data-v12-action="theme"><span>◐</span><b>Apariencia</b><small>Claro / oscuro</small></button>
        <button class="v12-sheet-action" data-v12-action="cloud"><span>☁</span><b>Nube</b><small>Cuenta y sincronización</small></button>
        <button class="v12-sheet-action" data-v12-action="export"><span>↑</span><b>Exportar</b><small>Backup JSON</small></button>
        <button class="v12-sheet-action" data-v12-action="import"><span>↓</span><b>Importar</b><small>Restaurar backup</small></button>
      </div>
    </section>`;
    document.body.appendChild(layer);
    const sheet=layer.querySelector('.v12-sheet');
    let previousFocus=null;
    const close=()=>{layer.classList.remove('open');layer.setAttribute('aria-hidden','true');setTimeout(()=>previousFocus?.focus(),0)};
    const open=()=>{previousFocus=document.activeElement;layer.classList.add('open');layer.setAttribute('aria-hidden','false');setTimeout(()=>layer.querySelector('.v12-sheet-close')?.focus(),0)};
    trigger.addEventListener('click',open);
    layer.querySelector('.v12-sheet-close').addEventListener('click',close);
    layer.addEventListener('pointerdown',e=>{if(e.target===layer)close()});
    layer.addEventListener('click',e=>{
      const view=e.target.closest('[data-v12-view]')?.dataset.v12View;
      const action=e.target.closest('[data-v12-action]')?.dataset.v12Action;
      if(view){close();go(view);return}
      if(action){close();({theme:'themeBtn',cloud:'cloudBtn',export:'exportBtn',import:'importBtn'}[action])&&triggerExisting({theme:'themeBtn',cloud:'cloudBtn',export:'exportBtn',import:'importBtn'}[action])}
    });
    layer.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();close();return}
      if(e.key!=='Tab')return;
      const f=[...sheet.querySelectorAll(focusableSelector)].filter(x=>x.offsetParent!==null);if(!f.length)return;
      const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    });
  }

  const collapsibleConfig=[
    {view:'calendarView', selector:':scope > .controls', title:'Calendario', eyebrow:'Plan editorial', label:'Filtros'},
    {view:'lanesView', selector:':scope > .controls', title:'Franjas', eyebrow:'Vista de recursos', label:'Filtros'},
    {view:'emulatorView', selector:':scope > .emulator-toolbar', title:'Emulador', eyebrow:'Laboratorio editorial', label:'Configurar'},
    {view:'agendaView', selector:':scope > .controls', title:'Agenda', eyebrow:'Ejecución semanal', label:'Filtros'},
    {view:'feedsView', selectors:[':scope > .feed-toolbar',':scope > .feed-format-controls'], title:'Feeds', eyebrow:'Simulador', label:'Ajustes'}
  ];

  function setupCollapsibles(){
    collapsibleConfig.forEach(cfg=>{
      const view=document.getElementById(cfg.view);if(!view||view.dataset.v12Ready)return;view.dataset.v12Ready='1';
      const surfaces=(cfg.selectors||[cfg.selector]).map(sel=>view.querySelector(sel)).filter(Boolean);
      surfaces.forEach(s=>s.classList.add('v12-collapsible'));
      const bar=document.createElement('div');bar.className='v12-mobile-viewbar';
      bar.innerHTML=`<div class="v12-mobile-viewbar-copy"><small>${cfg.eyebrow}</small><b>${cfg.title}</b></div><button type="button" class="v12-tool-toggle" aria-expanded="false">${cfg.label}</button>`;
      view.insertBefore(bar,view.firstChild);
      const sectionHead=view.querySelector('.section-head');
      if(sectionHead){
        const clone=bar.querySelector('.v12-tool-toggle').cloneNode(true);sectionHead.appendChild(clone);
        bar.querySelector('.v12-tool-toggle').hidden=true;
        wireToggle(clone,surfaces);
      }else wireToggle(bar.querySelector('.v12-tool-toggle'),surfaces);
      applyCompactState(surfaces,false);
    });
  }

  function wireToggle(btn,surfaces){
    btn.addEventListener('click',()=>{
      const open=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',String(open));
      applyCompactState(surfaces,open);
    });
  }
  function applyCompactState(surfaces,open){
    surfaces.forEach(s=>s.classList.toggle('v12-collapsed',compactMQ.matches&&!open));
  }

  function refreshCompact(){
    collapsibleConfig.forEach(cfg=>{
      const view=document.getElementById(cfg.view);if(!view)return;
      const surfaces=(cfg.selectors||[cfg.selector]).map(sel=>view.querySelector(sel)).filter(Boolean);
      const btn=view.querySelector('.section-head .v12-tool-toggle:not([hidden]),.v12-mobile-viewbar .v12-tool-toggle:not([hidden])');
      const open=btn?.getAttribute('aria-expanded')==='true';
      surfaces.forEach(s=>s.classList.toggle('v12-collapsed',compactMQ.matches&&!open));
    });
  }
  compactMQ.addEventListener?.('change',refreshCompact);

  function syncBrandSubtitle(){
    const title=document.getElementById('brandTitle');if(!title)return;
    title.textContent=title.textContent.replace(/V\d+(?:\.\d+)?/i,'V12.1');
    const small=title.parentElement?.querySelector('small');if(small)small.textContent='plan · producción · feeds · biblioteca';
  }

  function observeActiveView(){
    const views=[...document.querySelectorAll('.view')];
    const update=()=>{
      const active=document.querySelector('.view.active');
      document.documentElement.dataset.activeView=active?.id||'homeView';
      const scroller=document.getElementById('appScroller');if(scroller)scroller.setAttribute('aria-label',active?.id||'Vista activa');
    };
    const observer=new MutationObserver(update);views.forEach(v=>observer.observe(v,{attributes:true,attributeFilter:['class']}));update();
  }

  function serviceWorkerUX(){
    if(!('serviceWorker' in navigator))return;
    navigator.serviceWorker.addEventListener('controllerchange',()=>toast('Editorial OS se actualizó. La nueva versión ya está activa.'));
  }

  function boot(){
    document.documentElement.dataset.editorialVersion='12.1';
    syncBrandSubtitle();setupMoreSheet();setupCollapsibles();observeActiveView();serviceWorkerUX();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
