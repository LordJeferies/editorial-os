/* Editorial OS V12.1 · Planner UX + safe ports from V1X (official line) */
(() => {
  'use strict';
  const compact=matchMedia('(max-width:899px)');
  const DOWS=[1,2,3,4,5,6,0];
  const LABELS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  let plannerObserver=null;
  let activeDow=Number(document.getElementById('plannerTargetDay')?.value||1);

  function toast(msg){ if(window.v12Toast) return window.v12Toast(msg); console.info(msg) }

  function setupPlannerTabs(){
    const grid=document.getElementById('plannerWeekGrid'); if(!grid)return;
    let tabs=document.getElementById('v121PlannerDayTabs');
    if(!tabs){
      tabs=document.createElement('div');tabs.id='v121PlannerDayTabs';tabs.className='v121-daytabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Día del emulador');
      LABELS.forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.dow=String(DOWS[i]);b.setAttribute('role','tab');tabs.appendChild(b)});
      grid.parentNode.insertBefore(tabs,grid);
      tabs.addEventListener('click',e=>{const b=e.target.closest('button[data-dow]');if(!b)return;selectDow(Number(b.dataset.dow),true)});
    }
    const sel=document.getElementById('plannerTargetDay');
    if(sel&&!sel.dataset.v121){sel.dataset.v121='1';sel.addEventListener('change',()=>{activeDow=Number(sel.value);selectDow(activeDow,true)})}
    observePlannerDays();
    requestAnimationFrame(()=>selectDow(activeDow,false));
  }

  function selectDow(dow,scroll){
    activeDow=dow;
    const grid=document.getElementById('plannerWeekGrid');const tabs=document.getElementById('v121PlannerDayTabs');const sel=document.getElementById('plannerTargetDay');
    if(sel&&sel.value!==String(dow))sel.value=String(dow);
    tabs?.querySelectorAll('button[data-dow]').forEach(b=>{const on=Number(b.dataset.dow)===dow;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));if(on)b.scrollIntoView({block:'nearest',inline:'center'})});
    if(scroll&&compact.matches){const day=grid?.querySelector(`.planner-day[data-dow="${dow}"]`);day?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'nearest',inline:'center'})}
  }

  function observePlannerDays(){
    const grid=document.getElementById('plannerWeekGrid');if(!grid)return;
    plannerObserver?.disconnect();
    if(!compact.matches)return;
    plannerObserver=new IntersectionObserver(entries=>{
      if(document.documentElement.classList.contains('planner-drag-active'))return;
      let best=null;for(const e of entries){if(e.isIntersecting&&(!best||e.intersectionRatio>best.intersectionRatio))best=e}
      if(best&&best.intersectionRatio>.54){const d=Number(best.target.dataset.dow);if(Number.isFinite(d))selectDow(d,false)}
    },{root:grid,threshold:[.55,.7,.9]});
    grid.querySelectorAll('.planner-day').forEach(d=>plannerObserver.observe(d));
  }

  function setupPlannerMutationWatch(){
    const grid=document.getElementById('plannerWeekGrid');if(!grid||grid.dataset.v121watch)return;grid.dataset.v121watch='1';
    new MutationObserver(()=>{observePlannerDays();requestAnimationFrame(()=>selectDow(activeDow,false))}).observe(grid,{childList:true});
  }

  function setupPoolSheet(){
    const view=document.getElementById('emulatorView');const pool=view?.querySelector('.planner-pool');if(!view||!pool||document.getElementById('v121CatalogFab'))return;
    const fab=document.createElement('button');fab.id='v121CatalogFab';fab.type='button';fab.className='v121-fab';fab.textContent='＋ Catálogo';view.appendChild(fab);
    const close=document.createElement('button');close.type='button';close.className='v121-pool-close';close.setAttribute('aria-label','Cerrar catálogo');close.textContent='×';pool.insertBefore(close,pool.firstChild);
    const bd=document.createElement('div');bd.className='v121-pool-backdrop';document.body.appendChild(bd);
    const set=open=>document.documentElement.classList.toggle('v121-pool-open',open);
    fab.onclick=()=>set(true);close.onclick=()=>set(false);bd.onclick=()=>set(false);compact.addEventListener?.('change',()=>{if(!compact.matches)set(false)});
  }

  function ensureMoveSheet(){
    let layer=document.getElementById('v121MoveLayer');if(layer)return layer;
    layer=document.createElement('div');layer.id='v121MoveLayer';layer.className='v121-move-layer';layer.setAttribute('aria-hidden','true');
    layer.innerHTML=`<section class="v121-move-sheet" role="dialog" aria-modal="true" aria-labelledby="v121MoveTitle"><div class="v121-handle"></div><div class="v121-move-head"><div><small>Mover ficha</small><h3 id="v121MoveTitle">Contenido</h3><p id="v121MoveFrom"></p></div><button type="button" class="v121-move-close" aria-label="Cerrar">×</button></div><div class="v121-move-days"></div></section>`;
    document.body.appendChild(layer);
    layer.querySelector('.v121-move-close').onclick=()=>closeMoveSheet();layer.addEventListener('pointerdown',e=>{if(e.target===layer)closeMoveSheet()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&layer.classList.contains('open'))closeMoveSheet()});
    return layer;
  }

  function closeMoveSheet(){const l=document.getElementById('v121MoveLayer');if(!l)return;l.classList.remove('open');l.setAttribute('aria-hidden','true')}
  window.openPlannerMoveSheet=function(instanceId){
    const found=window.EDITORIAL_PLANNER?.find?.(instanceId);if(!found)return;
    const layer=ensureMoveSheet();layer.dataset.instance=instanceId;
    layer.querySelector('#v121MoveTitle').textContent=found.item.title;
    layer.querySelector('#v121MoveFrom').textContent=`Ahora está en ${LABELS[DOWS.indexOf(found.dow)]||''}. Elige un nuevo día.`;
    const days=layer.querySelector('.v121-move-days');days.innerHTML='';
    DOWS.forEach((dow,i)=>{const b=document.createElement('button');b.type='button';b.className='v121-day-dest'+(dow===found.dow?' current':'');b.innerHTML=`<span>${LABELS[i]}</span><small>${dow===found.dow?'Actual':'Mover aquí'}</small>`;b.onclick=()=>{const ok=window.EDITORIAL_PLANNER?.move?.(instanceId,dow);if(ok){activeDow=dow;toast(`Movido a ${LABELS[i]}`);closeMoveSheet();requestAnimationFrame(()=>selectDow(dow,true))}};days.appendChild(b)});
    layer.classList.add('open');layer.setAttribute('aria-hidden','false');requestAnimationFrame(()=>layer.querySelector('.v121-day-dest:not(.current)')?.focus());
  };

  function setupSWUpdate(){
    if(!('serviceWorker' in navigator))return;navigator.serviceWorker.getRegistration().then(reg=>{if(!reg)return;reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)toast('Nueva actualización lista. Cierra y vuelve a abrir la app para aplicarla.')})})}).catch(()=>{});
  }

  function boot(){setupPlannerTabs();setupPlannerMutationWatch();setupPoolSheet();setupSWUpdate();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
