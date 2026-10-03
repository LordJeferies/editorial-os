(()=>{
'use strict';

const VERSION='12.12';
const DAYS=[
  {dow:1,short:'Lun',name:'Lunes'},
  {dow:2,short:'Mar',name:'Martes'},
  {dow:3,short:'Mié',name:'Miércoles'},
  {dow:4,short:'Jue',name:'Jueves'},
  {dow:5,short:'Vie',name:'Viernes'},
  {dow:6,short:'Sáb',name:'Sábado'},
  {dow:0,short:'Dom',name:'Domingo'}
];
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const cssEscape=s=>window.CSS?.escape?CSS.escape(String(s)):String(s).replace(/["\\]/g,'\\$&');

let view=localStorage.getItem('editorialV1212PlannerView')||'board';
let selectedDay=Number(localStorage.getItem('editorialV1212SelectedDay')||1);
let selectedTemplate=localStorage.getItem('editorialV1212SelectedTemplate')||'';
let renderQueued=false;
let drag=null;
let suppressClickUntil=0;
let observerPool=null;
let observerWeek=null;
let sheetCtx=null;

function api(){return window.EDITORIAL_V123_API}
function planner(){return window.EDITORIAL_PLANNER}
function snapshot(){
  try{return api()?.getState?.()||null}catch(e){console.error(e);return null}
}
function draft(){
  const p=snapshot()?.plannerDraft||{};
  DAYS.forEach(d=>{if(!Array.isArray(p[d.dow]))p[d.dow]=[]});
  return p;
}
function allItems(){
  const p=draft();
  return DAYS.flatMap(d=>(p[d.dow]||[]).map((item,index)=>({item,dow:d.dow,index})));
}
function sameTemplate(item,tpl){return item&&tpl&&item.title===tpl.title&&(!item.type||!tpl.type||item.type===tpl.type)}
function platformDots(item){
  const map={instagram:'IG',facebook:'f',tiktok:'TT',youtube:'▶',linkedin:'in'};
  return (item?.platforms||[]).slice(0,5).map(p=>`<i title="${esc(p)}">${esc(map[p]||p.slice(0,2))}</i>`).join('');
}
function lotClass(lot){return `lot-${String(lot||'L3').toLowerCase().replace(/[^a-z0-9]+/g,'')}`}
function ensureCss(){
  if($('#v1212Css'))return;
  const l=document.createElement('link');
  l.id='v1212Css';
  l.rel='stylesheet';
  l.href='./css/v1212.css?v=12.12';
  document.head.appendChild(l);
}
function toast(text){
  let el=$('#v1212Toast');
  if(!el){
    el=document.createElement('div');
    el.id='v1212Toast';
    el.className='v1212-toast';
    document.body.appendChild(el);
  }
  el.textContent=text;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),1600);
}
function catalog(){
  return $$('#plannerPool .pool-card[data-template]').map(card=>{
    const title=card.querySelector('.pool-card-head b')?.textContent?.trim()||'Contenido';
    const meta=card.querySelector('.pool-card-head small')?.textContent?.trim()||'';
    const lot=card.querySelector('.pool-lot')?.textContent?.trim()||'';
    const [type='']=meta.split(' · ');
    return {id:card.dataset.template,title,meta,type,lot};
  });
}
function setLegacyCatalogFilter(filter,query){
  const f=$('#plannerFilter'),q=$('#plannerSearch');
  if(f&&f.value!==filter){
    f.value=filter;
    f.dispatchEvent(new Event('change',{bubbles:true}));
  }
  if(q&&q.value!==query){
    q.value=query;
    q.dispatchEvent(new Event('input',{bubbles:true}));
  }
}
function findTemplateForItem(item){
  const list=catalog();
  return list.find(t=>sameTemplate(item,t))||list.find(t=>t.title===item?.title)||null;
}
function addTemplate(templateId,dow){
  const day=$('#plannerTargetDay');
  const btn=$(`#plannerPool .pool-card[data-template="${cssEscape(templateId)}"] .pool-add`);
  if(!day||!btn){toast('No encuentro ese contenido en la biblioteca');return false}
  day.value=String(dow);
  day.dispatchEvent(new Event('change',{bubbles:true}));
  btn.click();
  selectedDay=Number(dow);
  localStorage.setItem('editorialV1212SelectedDay',String(selectedDay));
  setTimeout(queueRender,0);
  return true;
}
function moveInstance(instanceId,dow,index=null){
  const ok=planner()?.move?.(instanceId,Number(dow),index);
  setTimeout(queueRender,0);
  return !!ok;
}
function removeInstance(instanceId){
  planner()?.remove?.(instanceId);
  setTimeout(queueRender,0);
}
function duplicateInstance(instanceId){
  const rec=planner()?.find?.(instanceId);
  if(!rec?.item)return;
  const tpl=findTemplateForItem(rec.item);
  if(!tpl){toast('No pude vincular esta ficha con la biblioteca');return}
  addTemplate(tpl.id,rec.dow);
  toast('Ficha duplicada');
}
function clearPlan(){
  const n=allItems().length;
  if(!n){toast('El plan ya está vacío');return}
  if(!confirm(`¿Vaciar las ${n} fichas del plan?\n\nPodrás usar Deshacer inmediatamente después.`))return;
  $('#clearDraftBtn')?.click();
  setTimeout(()=>{queueRender();toast('Plan vacío · Deshacer disponible')},0);
}
function undo(){$('#undoBtn')?.click();setTimeout(queueRender,0)}
function openItem(item){
  if(Date.now()<suppressClickUntil)return;
  api()?.openItem?.(item);
}
function chooseTemplate(id){
  selectedTemplate=id;
  localStorage.setItem('editorialV1212SelectedTemplate',id);
  queueRender();
}
function selectedTpl(){return catalog().find(t=>t.id===selectedTemplate)||catalog()[0]||null}

function mount(){
  const em=$('#emulatorView');
  const toolbar=em?.querySelector('.emulator-toolbar');
  if(!em||!toolbar)return false;
  if($('#v1212Planner'))return true;

  em.classList.add('v1212-planner-enabled');
  const root=document.createElement('section');
  root.id='v1212Planner';
  root.className='v1212-planner';
  root.innerHTML=`
    <div class="v1212-topbar">
      <div class="v1212-title">
        <small>Planificador V12.12</small>
        <strong>Una semana · tres formas de construirla</strong>
      </div>
      <div class="v1212-views" role="tablist" aria-label="Vistas del planificador">
        <button type="button" data-v1212-view="board">Tablero</button>
        <button type="button" data-v1212-view="agenda">Agenda</button>
        <button type="button" data-v1212-view="matrix">Matriz</button>
      </div>
      <div class="v1212-actions">
        <button type="button" id="v1212Undo">↶ <span>Deshacer</span></button>
        <button type="button" id="v1212Clear" class="danger">Vaciar plan</button>
      </div>
    </div>

    <div class="v1212-daybar" id="v1212Daybar">
      ${DAYS.map(d=>`<button type="button" data-day="${d.dow}"><span>${d.short}</span><b data-day-count="${d.dow}">0</b></button>`).join('')}
    </div>

    <div class="v1212-layout">
      <aside class="v1212-library" id="v1212Library">
        <div class="v1212-library-head">
          <div><small>Biblioteca</small><b>Contenido disponible</b></div>
          <button type="button" id="v1212LibraryToggle">Ocultar</button>
        </div>
        <div class="v1212-library-tools">
          <input id="v1212Search" type="search" placeholder="Buscar contenido…" autocomplete="off">
          <select id="v1212Filter" aria-label="Filtro">
            <option value="all">Todos</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="linkedin">LinkedIn L2</option>
          </select>
        </div>
        <div class="v1212-selected" id="v1212Selected"></div>
        <div class="v1212-catalog" id="v1212Catalog"></div>
      </aside>

      <main class="v1212-canvas">
        <div id="v1212BoardView" class="v1212-view"></div>
        <div id="v1212AgendaView" class="v1212-view"></div>
        <div id="v1212MatrixView" class="v1212-view"></div>
      </main>
    </div>`;

  toolbar.insertAdjacentElement('afterend',root);

  root.addEventListener('click',onClick);
  $('#v1212Search')?.addEventListener('input',e=>{
    setLegacyCatalogFilter($('#v1212Filter')?.value||'all',e.target.value||'');
    setTimeout(queueRender,0);
  });
  $('#v1212Filter')?.addEventListener('change',e=>{
    setLegacyCatalogFilter(e.target.value||'all',$('#v1212Search')?.value||'');
    setTimeout(queueRender,0);
  });
  $('#v1212Undo').onclick=undo;
  $('#v1212Clear').onclick=clearPlan;

  const lib=$('#v1212Library');
  let libOpen=localStorage.getItem('editorialV1212LibraryOpen')!=='0';
  const applyLib=()=>{
    lib?.classList.toggle('collapsed',!libOpen);
    const b=$('#v1212LibraryToggle');
    if(b)b.textContent=libOpen?'Ocultar':'Mostrar';
  };
  $('#v1212LibraryToggle').onclick=()=>{
    libOpen=!libOpen;
    localStorage.setItem('editorialV1212LibraryOpen',libOpen?'1':'0');
    applyLib();
  };
  applyLib();

  bindObservers();
  document.addEventListener('editorial:rendered',queueRender);
  window.addEventListener('resize',queueRender,{passive:true});
  patchVersion();
  queueRender();
  return true;
}

function bindObservers(){
  observerPool?.disconnect();
  observerWeek?.disconnect();
  const pool=$('#plannerPool');
  const week=$('#plannerWeekGrid');
  if(pool){
    observerPool=new MutationObserver(()=>queueRender());
    observerPool.observe(pool,{childList:true,subtree:true});
  }
  if(week){
    observerWeek=new MutationObserver(()=>queueRender());
    observerWeek.observe(week,{childList:true,subtree:true});
  }
}

function queueRender(){
  if(renderQueued)return;
  renderQueued=true;
  requestAnimationFrame(()=>{
    renderQueued=false;
    if(!$('#v1212Planner')){mount();return}
    render();
  });
}

function render(){
  const p=draft();
  const list=catalog();
  if(selectedTemplate&&!list.some(t=>t.id===selectedTemplate))selectedTemplate='';
  if(!selectedTemplate&&list[0])selectedTemplate=list[0].id;

  $$('.v1212-views [data-v1212-view]').forEach(b=>{
    const on=b.dataset.v1212View===view;
    b.classList.toggle('active',on);
    b.setAttribute('aria-selected',String(on));
  });
  $$('.v1212-daybar [data-day]').forEach(b=>{
    const d=Number(b.dataset.day);
    b.classList.toggle('active',d===selectedDay);
    const n=b.querySelector('[data-day-count]');
    if(n)n.textContent=(p[d]||[]).length;
  });

  renderCatalog(list);
  renderSelected(list);
  renderBoard(p);
  renderAgenda(p);
  renderMatrix(p,list);

  $('#v1212BoardView')?.classList.toggle('active',view==='board');
  $('#v1212AgendaView')?.classList.toggle('active',view==='agenda');
  $('#v1212MatrixView')?.classList.toggle('active',view==='matrix');
}
function renderCatalog(list){
  const root=$('#v1212Catalog');
  if(!root)return;
  root.innerHTML='';
  list.forEach(t=>{
    const card=document.createElement('article');
    card.className=`v1212-lib-card ${lotClass(t.lot)}${t.id===selectedTemplate?' selected':''}`;
    card.dataset.template=t.id;
    card.innerHTML=`
      <button class="v1212-grip" type="button" data-drag-template="${esc(t.id)}" aria-label="Arrastrar ${esc(t.title)}">⋮⋮</button>
      <div class="v1212-lib-copy" data-select-template="${esc(t.id)}">
        <b>${esc(t.title)}</b>
        <small>${esc(t.meta)}</small>
      </div>
      <span class="v1212-lot">${esc(t.lot||'')}</span>
      <button class="v1212-add" type="button" data-add-template="${esc(t.id)}" title="Añadir a ${esc(DAYS.find(d=>d.dow===selectedDay)?.name||'día')}">＋</button>`;
    root.appendChild(card);
  });
  if(!list.length)root.innerHTML='<div class="v1212-empty">No hay contenidos con ese filtro.</div>';
  bindDragHandles(root);
}
function renderSelected(list){
  const root=$('#v1212Selected');
  if(!root)return;
  const t=list.find(x=>x.id===selectedTemplate);
  if(!t){root.innerHTML='<small>Selecciona una ficha para añadirla por toque.</small>';return}
  root.innerHTML=`<small>Seleccionado</small><b>${esc(t.title)}</b><span>＋ se añadirá a ${esc(DAYS.find(d=>d.dow===selectedDay)?.name||'Lunes')}</span>`;
}
function itemCard(item,dow,index){
  return `<article class="v1212-plan-card ${lotClass(item.lot)}" data-instance="${esc(item.instanceId||'')}" data-dow="${dow}" data-index="${index}">
    <button class="v1212-grip" type="button" data-drag-instance="${esc(item.instanceId||'')}" aria-label="Mover ${esc(item.title)}">⋮⋮</button>
    <div class="v1212-card-copy" data-open-instance="${esc(item.instanceId||'')}">
      <b>${esc(item.title)}</b>
      <small>${esc(item.type||'')}${item.surface?` · ${esc(item.surface)}`:''}</small>
      <div class="v1212-platforms">${platformDots(item)}</div>
    </div>
    <span class="v1212-lot">${esc(item.lot||'')}</span>
    <button class="v1212-more" type="button" data-menu-instance="${esc(item.instanceId||'')}" aria-label="Acciones">•••</button>
  </article>`;
}
function renderBoard(p){
  const root=$('#v1212BoardView');
  if(!root)return;
  root.innerHTML=`<div class="v1212-board-scroll" id="v1212BoardScroll">
    <div class="v1212-board">
      ${DAYS.map(d=>`
        <section class="v1212-column${d.dow===selectedDay?' current':''}" data-column-day="${d.dow}">
          <header>
            <div><b>${d.name}</b><small>${(p[d.dow]||[]).length} ${(p[d.dow]||[]).length===1?'pieza':'piezas'}</small></div>
            <button type="button" data-add-selected="${d.dow}" title="Añadir contenido seleccionado">＋</button>
          </header>
          <div class="v1212-column-list v1212-dropzone" data-drop-day="${d.dow}">
            ${(p[d.dow]||[]).map((item,i)=>itemCard(item,d.dow,i)).join('')}
            ${!(p[d.dow]||[]).length?`<div class="v1212-column-empty"><b>Suelta aquí</b><span>o usa ＋ para añadir</span></div>`:''}
          </div>
        </section>`).join('')}
    </div>
  </div>`;
  bindDragHandles(root);
  if(matchMedia('(max-width:899px)').matches&&!drag){
    requestAnimationFrame(()=>{
      const col=root.querySelector(`[data-column-day="${selectedDay}"]`);
      const sc=$('#v1212BoardScroll');
      if(col&&sc&&!sc.dataset.initialized){
        sc.dataset.initialized='1';
        sc.scrollLeft=Math.max(0,col.offsetLeft-12);
      }
    });
  }
}
function renderAgenda(p){
  const root=$('#v1212AgendaView');
  if(!root)return;
  root.innerHTML=`<div class="v1212-agenda">
    ${DAYS.map(d=>`
      <section class="v1212-agenda-day v1212-dropzone" data-drop-day="${d.dow}">
        <header>
          <div><b>${d.name}</b><small>${(p[d.dow]||[]).length} piezas</small></div>
          <button type="button" data-add-selected="${d.dow}">＋ Añadir aquí</button>
        </header>
        <div class="v1212-agenda-list">
          ${(p[d.dow]||[]).map((item,i)=>itemCard(item,d.dow,i)).join('')}
          ${!(p[d.dow]||[]).length?'<div class="v1212-empty-day">Día vacío</div>':''}
        </div>
      </section>`).join('')}
  </div>`;
  bindDragHandles(root);
}
function renderMatrix(p,list){
  const root=$('#v1212MatrixView');
  if(!root)return;
  const placed=allItems();
  root.innerHTML=`<div class="v1212-matrix-wrap">
    <div class="v1212-matrix">
      <div class="v1212-matrix-head sticky">Contenido</div>
      ${DAYS.map(d=>`<div class="v1212-matrix-head">${d.short}</div>`).join('')}
      ${list.map(t=>{
        const matches=placed.filter(x=>sameTemplate(x.item,t));
        return `<div class="v1212-matrix-label ${t.id===selectedTemplate?'selected':''}" data-select-template="${esc(t.id)}">
          <b>${esc(t.title)}</b><small>${esc(t.type||t.meta)}</small>
        </div>
        ${DAYS.map(d=>{
          const inDay=matches.filter(x=>x.dow===d.dow);
          return `<div class="v1212-matrix-cell${inDay.length?' has':''}" data-matrix-day="${d.dow}" data-matrix-template="${esc(t.id)}">
            ${inDay.length?`<button type="button" class="v1212-count" data-menu-instance="${esc(inDay[0].item.instanceId||'')}">${inDay.length}</button>`:''}
            <button type="button" class="v1212-cell-add" data-add-template-day="${esc(t.id)}|${d.dow}" aria-label="Añadir ${esc(t.title)} a ${d.name}">＋</button>
          </div>`;
        }).join('')}`;
      }).join('')}
    </div>
  </div>`;
}

function onClick(e){
  const viewBtn=e.target.closest('[data-v1212-view]');
  if(viewBtn){
    view=viewBtn.dataset.v1212View;
    localStorage.setItem('editorialV1212PlannerView',view);
    queueRender();
    return;
  }
  const dayBtn=e.target.closest('.v1212-daybar [data-day]');
  if(dayBtn){
    selectedDay=Number(dayBtn.dataset.day);
    localStorage.setItem('editorialV1212SelectedDay',String(selectedDay));
    const legacy=$('#plannerTargetDay');
    if(legacy){legacy.value=String(selectedDay);legacy.dispatchEvent(new Event('change',{bubbles:true}))}
    queueRender();
    if(view==='board'&&matchMedia('(max-width:899px)').matches){
      setTimeout(()=>{
        const col=$(`[data-column-day="${selectedDay}"]`),sc=$('#v1212BoardScroll');
        if(col&&sc)sc.scrollTo({left:Math.max(0,col.offsetLeft-12),behavior:'smooth'});
      },0);
    }
    return;
  }
  const select=e.target.closest('[data-select-template]');
  if(select){chooseTemplate(select.dataset.selectTemplate);return}

  const add=e.target.closest('[data-add-template]');
  if(add){addTemplate(add.dataset.addTemplate,selectedDay);return}

  const addSelected=e.target.closest('[data-add-selected]');
  if(addSelected){
    const t=selectedTpl();
    if(!t){toast('Selecciona un contenido primero');return}
    addTemplate(t.id,Number(addSelected.dataset.addSelected));
    return;
  }

  const addCell=e.target.closest('[data-add-template-day]');
  if(addCell){
    const [tid,d]=addCell.dataset.addTemplateDay.split('|');
    addTemplate(tid,Number(d));
    return;
  }

  const menu=e.target.closest('[data-menu-instance]');
  if(menu){openActionSheet(menu.dataset.menuInstance);return}

  const open=e.target.closest('[data-open-instance]');
  if(open&&Date.now()>=suppressClickUntil){
    const rec=planner()?.find?.(open.dataset.openInstance);
    if(rec?.item)openItem(rec.item);
  }
}

function ensureSheet(){
  if($('#v1212ActionSheet'))return;
  const bg=document.createElement('div');
  bg.id='v1212ActionSheet';
  bg.className='v1212-sheet-bg';
  bg.innerHTML=`<section class="v1212-action-sheet" role="dialog" aria-modal="true">
    <div class="v1212-sheet-grab"></div>
    <header><div><small>Ficha</small><b id="v1212SheetTitle">Acciones</b></div><button type="button" data-sheet-close>×</button></header>
    <div class="v1212-sheet-buttons" id="v1212SheetButtons"></div>
  </section>`;
  document.body.appendChild(bg);
  bg.addEventListener('click',e=>{if(e.target===bg||e.target.closest('[data-sheet-close]'))closeSheet()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&bg.classList.contains('open'))closeSheet()});
}
function openActionSheet(instanceId){
  ensureSheet();
  const rec=planner()?.find?.(instanceId);
  if(!rec?.item)return;
  sheetCtx={instanceId,item:rec.item,dow:rec.dow};
  $('#v1212SheetTitle').textContent=rec.item.title||'Ficha';
  const root=$('#v1212SheetButtons');
  root.innerHTML=`
    <button type="button" data-sheet-open>Ver detalle</button>
    <button type="button" data-sheet-duplicate>Duplicar</button>
    <div class="v1212-move-grid">
      ${DAYS.map(d=>`<button type="button" data-sheet-move="${d.dow}" ${d.dow===rec.dow?'class="current"':''}>${d.short}</button>`).join('')}
    </div>
    <button type="button" class="danger" data-sheet-remove>Quitar del plan</button>`;
  root.onclick=e=>{
    if(!sheetCtx)return;
    if(e.target.closest('[data-sheet-open]')){openItem(sheetCtx.item);closeSheet();return}
    if(e.target.closest('[data-sheet-duplicate]')){duplicateInstance(sheetCtx.instanceId);closeSheet();return}
    const mv=e.target.closest('[data-sheet-move]');
    if(mv){moveInstance(sheetCtx.instanceId,Number(mv.dataset.sheetMove));closeSheet();return}
    if(e.target.closest('[data-sheet-remove]')){removeInstance(sheetCtx.instanceId);closeSheet()}
  };
  $('#v1212ActionSheet').classList.add('open');
}
function closeSheet(){$('#v1212ActionSheet')?.classList.remove('open');sheetCtx=null}

function bindDragHandles(root){
  $$('[data-drag-template],[data-drag-instance]',root).forEach(h=>{
    if(h.dataset.v1212DragBound)return;
    h.dataset.v1212DragBound='1';
    h.addEventListener('pointerdown',startPointerDrag);
  });
}
function startPointerDrag(e){
  if(e.button!==undefined&&e.button!==0)return;
  const handle=e.currentTarget;
  const templateId=handle.dataset.dragTemplate||'';
  const instanceId=handle.dataset.dragInstance||'';
  if(!templateId&&!instanceId)return;
  e.preventDefault();
  e.stopPropagation();

  const source=handle.closest('.v1212-lib-card,.v1212-plan-card');
  const r=source?.getBoundingClientRect();
  const ghost=source?.cloneNode(true);
  if(!source||!r||!ghost)return;
  ghost.classList.add('v1212-drag-ghost');
  ghost.style.width=`${Math.min(r.width,320)}px`;
  ghost.querySelectorAll('button').forEach(b=>b.tabIndex=-1);
  document.body.appendChild(ghost);

  drag={
    pointerId:e.pointerId,
    handle,
    kind:templateId?'template':'instance',
    id:templateId||instanceId,
    source,
    ghost,
    x:e.clientX,
    y:e.clientY,
    targetDay:null,
    targetIndex:null,
    moved:false,
    startX:e.clientX,
    startY:e.clientY,
    raf:0
  };
  try{handle.setPointerCapture(e.pointerId)}catch{}
  document.documentElement.classList.add('v1212-dragging');
  updateGhost(e.clientX,e.clientY);
  showDropTargets(true);

  handle.addEventListener('pointermove',movePointerDrag);
  handle.addEventListener('pointerup',endPointerDrag,{once:true});
  handle.addEventListener('pointercancel',cancelPointerDrag,{once:true});
}
function movePointerDrag(e){
  if(!drag||e.pointerId!==drag.pointerId)return;
  e.preventDefault();
  drag.x=e.clientX;drag.y=e.clientY;
  if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5)drag.moved=true;
  if(drag.raf)return;
  drag.raf=requestAnimationFrame(()=>{
    if(!drag)return;
    drag.raf=0;
    updateGhost(drag.x,drag.y);
    updateDropTarget(drag.x,drag.y);
    autoScroll(drag.x,drag.y);
  });
}
function updateGhost(x,y){
  if(!drag?.ghost)return;
  drag.ghost.style.transform=`translate3d(${Math.round(x+14)}px,${Math.round(y+12)}px,0) rotate(1deg)`;
}
function showDropTargets(on){
  $('#v1212Planner')?.classList.toggle('drag-active',on);
}
function clearDropHighlight(){
  $$('.v1212-drop-hover').forEach(x=>x.classList.remove('v1212-drop-hover'));
  $('.v1212-insert-marker')?.remove();
}
function updateDropTarget(x,y){
  if(!drag)return;
  clearDropHighlight();
  const under=document.elementFromPoint(x,y);
  const target=under?.closest?.('[data-drop-day],.v1212-daybar [data-day]');
  if(!target){drag.targetDay=null;drag.targetIndex=null;return}
  const dow=Number(target.dataset.dropDay??target.dataset.day);
  if(!Number.isFinite(dow)){drag.targetDay=null;return}
  drag.targetDay=dow;
  target.classList.add('v1212-drop-hover');

  const list=target.matches('[data-drop-day]')?target.closest('[data-drop-day]'):null;
  if(!list){drag.targetIndex=null;return}

  const cards=$$('.v1212-plan-card',list).filter(c=>c.dataset.instance!==drag.id);
  let idx=cards.length;
  for(let i=0;i<cards.length;i++){
    const r=cards[i].getBoundingClientRect();
    if(y<r.top+r.height/2){idx=i;break}
  }
  drag.targetIndex=idx;
  const marker=document.createElement('div');
  marker.className='v1212-insert-marker';
  const agendaList=list.querySelector('.v1212-agenda-list');
  const container=agendaList||list;
  const scoped=$$('.v1212-plan-card',container).filter(c=>c.dataset.instance!==drag.id);
  if(idx>=scoped.length)container.appendChild(marker);
  else container.insertBefore(marker,scoped[idx]);
}
function autoScroll(x,y){
  const margin=70;
  const speed=14;
  if(y<margin)window.scrollBy(0,-speed);
  else if(y>window.innerHeight-margin)window.scrollBy(0,speed);

  const sc=$('#v1212BoardScroll');
  if(sc&&view==='board'){
    const r=sc.getBoundingClientRect();
    if(x>r.right-margin&&x<r.right+20)sc.scrollLeft+=18;
    else if(x<r.left+margin&&x>r.left-20)sc.scrollLeft-=18;
  }
}
function endPointerDrag(e){
  if(!drag||e.pointerId!==drag.pointerId)return;
  e.preventDefault();
  const d=drag;
  if(d.targetDay!==null){
    if(d.kind==='template'){
      addTemplate(d.id,d.targetDay);
      toast(`Añadido a ${DAYS.find(x=>x.dow===d.targetDay)?.name||'día'}`);
    }else{
      moveInstance(d.id,d.targetDay,d.targetIndex);
      toast(`Movido a ${DAYS.find(x=>x.dow===d.targetDay)?.name||'día'}`);
    }
  }
  suppressClickUntil=Date.now()+500;
  finishDrag();
}
function cancelPointerDrag(e){
  if(!drag||e.pointerId!==drag.pointerId)return;
  finishDrag();
}
function finishDrag(){
  if(!drag)return;
  const {handle,ghost,pointerId}=drag;
  try{handle.releasePointerCapture(pointerId)}catch{}
  handle.removeEventListener('pointermove',movePointerDrag);
  ghost?.remove();
  drag=null;
  clearDropHighlight();
  showDropTargets(false);
  document.documentElement.classList.remove('v1212-dragging');
  setTimeout(queueRender,0);
}

function patchVersion(){
  document.documentElement.dataset.editorialVersion=VERSION;
  document.title=document.title.replace(/V12\.(?:9|10|11)(?:\.\d+)?/g,`V${VERSION}`);
  const brand=$('#brandTitle');
  if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10|11)(?:\.\d+)?/g,`V${VERSION}`);
  window.EDITORIAL_OS_VERSION=VERSION;
}
function init(){
  ensureCss();
  ensureSheet();
  const wait=()=>{
    if(mount())return;
    setTimeout(wait,80);
  };
  wait();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();