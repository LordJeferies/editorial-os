/* Editorial OS V12.4 · mobile-first UI shell
   Native component-island architecture: domain logic remains in app-core.js,
   while this layer owns mobile composition, sheets, menus and touch ergonomics.
*/
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const compact=matchMedia('(max-width:899px)');
  const store=window.EDITORIAL_UI_STORE;
  const api=()=>window.EDITORIAL_V123_API;
  const planner=()=>window.EDITORIAL_PLANNER;
  const DOWS=[1,2,3,4,5,6,0];
  const DOW_LABEL={1:'Lunes',2:'Martes',3:'Miércoles',4:'Jueves',5:'Viernes',6:'Sábado',0:'Domingo'};
  const VIEW_META={
    homeView:{title:'Hoy',sub:'Tu operación editorial'},
    calendarView:{title:'Calendario',sub:'Publicación y producción'},
    lanesView:{title:'Franjas',sub:'Distribución semanal'},
    emulatorView:{title:'Planificador',sub:'Construye y prueba escenarios'},
    agendaView:{title:'Agenda',sub:'Secuencia operativa'},
    feedsView:{title:'Feeds',sub:'Densidad por plataforma'},
    inventoryView:{title:'Biblioteca',sub:'Contenido y configuración'}
  };
  const ICON={
    home:'<svg viewBox="0 0 24 24" fill="none"><path d="M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" stroke-width="1.8"/><path d="M9 21v-6h6v6" stroke-width="1.8"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke-width="1.8"/><path d="M7 3v4M17 3v4M3 10h18" stroke-width="1.8"/></svg>',
    plan:'<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke-width="1.8"/><path d="M8 9h8M8 13h5M8 17h7" stroke-width="1.8"/></svg>',
    feeds:'<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="4" stroke-width="1.8"/><path d="M7 8h10M7 12h6M7 16h8" stroke-width="1.8"/></svg>',
    library:'<svg viewBox="0 0 24 24" fill="none"><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" stroke-width="1.8"/><path d="M7 20V7a3 3 0 0 0-3-3" stroke-width="1.8"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke-width="1.8"/><path d="m16 16 4.5 4.5" stroke-width="1.8"/></svg>',
    more:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    plus:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke-width="2"/></svg>',
    sliders:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" stroke-width="1.8"/></svg>',
    chevron:'<svg viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke-width="2"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4 10-10" stroke-width="2"/></svg>',
    cloud:'<svg viewBox="0 0 24 24" fill="none"><path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 8.7 4.7 4.7 0 0 0 7 18Z" stroke-width="1.8"/></svg>',
    gear:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke-width="1.8"/><path d="M19 12a7 7 0 0 0-.12-1.3l2-1.55-2-3.45-2.47 1a7 7 0 0 0-2.24-1.3L13.8 3h-4l-.38 2.4a7 7 0 0 0-2.24 1.3l-2.47-1-2 3.45 2 1.55A7 7 0 0 0 4.6 12c0 .44.04.87.12 1.3l-2 1.55 2 3.45 2.47-1a7 7 0 0 0 2.24 1.3l.38 2.4h4l.38-2.4a7 7 0 0 0 2.24-1.3l2.47 1 2-3.45-2-1.55c.08-.43.12-.86.12-1.3Z" stroke-width="1.3"/></svg>'
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const isReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const activeView=()=>$('.view.active')?.id||'homeView';
  const toast=msg=>window.v12Toast?window.v12Toast(msg):console.info(msg);
  let sheetReturnFocus=null;

  function iconButton(label,icon,extra=''){
    return `<button type="button" class="v124-icon-button ${extra}" aria-label="${esc(label)}">${icon}</button>`;
  }

  function createSheet({id,title,subtitle='',body='',cancel='Cancelar',onClose=null}){
    let old=$(`#${id}`); if(old)old.remove();
    const layer=document.createElement('div');layer.id=id;layer.className='v124-sheet-layer';layer.setAttribute('aria-hidden','true');
    layer.innerHTML=`<section class="v124-sheet" role="dialog" aria-modal="true" aria-labelledby="${id}Title"><div class="v124-sheet-grabber"></div><div class="v124-sheet-bar"><button class="v124-sheet-cancel" type="button">${esc(cancel)}</button><h3 id="${id}Title">${esc(title)}</h3><button class="v124-icon-button v124-sheet-close" type="button" aria-label="Cerrar">×</button></div>${subtitle?`<p class="v124-sheet-subtitle">${esc(subtitle)}</p>`:''}<div class="v124-sheet-body">${body}</div></section>`;
    document.body.appendChild(layer);
    const close=()=>closeSheet(layer,onClose);
    $('.v124-sheet-close',layer).onclick=close;$('.v124-sheet-cancel',layer).onclick=close;
    layer.addEventListener('pointerdown',e=>{if(e.target===layer)close()});
    layer.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();return}if(e.key!=='Tab')return;const f=$$('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[href],[tabindex]:not([tabindex="-1"])',layer).filter(x=>x.offsetParent!==null);if(!f.length)return;const first=f[0],last=f.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
    return layer;
  }
  function openSheet(layer){sheetReturnFocus=document.activeElement;layer.classList.add('open');layer.setAttribute('aria-hidden','false');document.documentElement.classList.add('v124-modal-open');store?.set({activeSheet:layer.id});requestAnimationFrame(()=>$('.v124-sheet-close,.v124-sheet-cancel,button,input',layer)?.focus({preventScroll:true}))}
  function closeSheet(layer,onClose){if(!layer)return;layer.classList.remove('open');layer.setAttribute('aria-hidden','true');document.documentElement.classList.remove('v124-modal-open');store?.set({activeSheet:null});try{onClose?.()}finally{setTimeout(()=>sheetReturnFocus?.focus?.({preventScroll:true}),0)}}

  function setupMobileTopbar(){
    if($('#v124MobileTopbar'))return;
    const bar=document.createElement('header');bar.id='v124MobileTopbar';bar.className='v124-mobile-topbar';
    bar.innerHTML=`<button type="button" class="v124-brand-button" id="v124BrandButton"><span class="v124-brand-avatar">J</span><span class="v124-brand-copy"><b>JOC</b><small><span class="v124-sync-dot"></span>Editorial OS</small></span></button><div class="v124-toolbar-actions">${iconButton('Buscar',ICON.search,'v124-search-button')}${iconButton('Más opciones',ICON.more,'v124-more-button')}</div>`;
    document.body.appendChild(bar);
    $('#v124BrandButton',bar).onclick=openBrandSheet;
    $('.v124-search-button',bar).onclick=openSearchSheet;
    $('.v124-more-button',bar).onclick=openMoreSheet;
    syncTopbar();
  }

  function syncTopbar(){
    const top=$('#v124MobileTopbar');if(!top)return;
    const data=api()?.getState?.();const brand=data?.appData?.brands?.find(b=>b.id===data.appData.activeBrandId)||data?.appData?.brands?.[0];
    $('.v124-brand-avatar',top).textContent=(brand?.initials||brand?.name?.[0]||'E').slice(0,2).toUpperCase();
    $('.v124-brand-copy b',top).textContent=brand?.name||'Editorial OS';
    const sync=api()?.getSyncState?.()||{};const dot=$('.v124-sync-dot',top);dot.className='v124-sync-dot '+(sync.conflict?'conflict':sync.dirty?'pending':sync.online===false?'':'online');
    const status=sync.conflict?'Conflicto':sync.dirty?'Cambios pendientes':navigator.onLine?'Sincronizado':'Sin conexión';
    const small=$('.v124-brand-copy small',top);small.innerHTML=`<span class="${dot.className}"></span>${esc(status)}`;
  }

  function openBrandSheet(){
    const data=api()?.getState?.();const brands=data?.appData?.brands||[];
    const body=`<div class="v124-group">${brands.map(b=>`<button class="v124-row" type="button" data-brand="${esc(b.id)}"><span class="v124-row-icon" style="background:${esc(b.color||'var(--v124-fill)')};color:#fff">${esc((b.initials||b.name?.[0]||'?').slice(0,2).toUpperCase())}</span><span class="v124-row-copy"><b>${esc(b.name)}</b><small>${b.id===data?.appData?.activeBrandId?'Marca activa':'Cambiar a esta marca'}</small></span>${b.id===data?.appData?.activeBrandId?ICON.check:ICON.chevron}</button>`).join('')}</div>`;
    const layer=createSheet({id:'v124BrandSheet',title:'Marcas',body});
    $('.v124-sheet-body',layer).addEventListener('click',e=>{const row=e.target.closest('[data-brand]');if(!row)return;const select=$('#brandSelect');if(select){select.value=row.dataset.brand;select.dispatchEvent(new Event('change',{bubbles:true}))}closeSheet(layer);setTimeout(syncTopbar,80)});
    openSheet(layer);
  }

  function setupViewHeaders(){
    Object.entries(VIEW_META).forEach(([id,meta])=>{
      const view=$(`#${id}`);if(!view)return;let head=$('.v124-view-header',view);if(!head){head=document.createElement('div');head.className='v124-view-header';head.innerHTML=`<div class="v124-view-title"><small>${esc(meta.sub)}</small><h1>${esc(meta.title)}</h1></div><div class="v124-view-actions"></div>`;view.insertBefore(head,view.firstChild)}
    });
    syncViewHeader(activeView());
  }

  function syncViewHeader(viewId){
    const view=$(`#${viewId}`);const actions=$('.v124-view-actions',view);if(!actions)return;actions.innerHTML='';
    const add=(label,icon,fn,cls='')=>{const wrap=document.createElement('div');wrap.innerHTML=iconButton(label,icon,cls);const b=wrap.firstElementChild;b.onclick=fn;actions.appendChild(b)};
    if(viewId==='homeView'){add('Buscar',ICON.search,openSearchSheet);}
    if(viewId==='calendarView'){add('Ir a hoy',ICON.calendar,()=>$('#todayBtn')?.click());add('Opciones de calendario',ICON.more,openCalendarSheet)}
    if(viewId==='emulatorView'){add('Añadir contenido',ICON.plus,openCatalogSheet,'v124-plan-add');add('Configurar escenario',ICON.sliders,openPlannerSettingsSheet)}
    if(viewId==='feedsView'){add('Ajustes del feed',ICON.sliders,openFeedSettingsSheet)}
    if(viewId==='inventoryView'){add('Añadir',ICON.plus,openLibraryAdd);add('Filtros',ICON.sliders,openLibraryFilters)}
    if(viewId==='agendaView'||viewId==='lanesView')add('Opciones',ICON.sliders,()=>openExistingControls(viewId));
  }

  function setupDock(){
    const dock=$('#mobileDock');if(!dock)return;
    const mapping={homeView:['Hoy','home'],calendarView:['Calendario','calendar'],emulatorView:['Plan','plan'],feedsView:['Feeds','feeds'],inventoryView:['Biblioteca','library']};
    $$('.dockbtn',dock).forEach(btn=>{const m=mapping[btn.dataset.view];if(!m)return;btn.innerHTML=`<span class="v124-tab-icon">${ICON[m[1]]}</span><b>${m[0]}</b>`});
  }

  function openMoreSheet(){
    const rows=[
      ['Buscar','Encuentra contenido, escenarios y marcas',ICON.search,openSearchSheet],
      ['Agenda','Secuencia cronológica','≡',()=>api()?.navigate?.('agendaView')],
      ['Franjas','Distribución por familia','▤',()=>api()?.navigate?.('lanesView')],
      ['Sincronización','Nube y estado de cambios',ICON.cloud,()=>$('#cloudBtn')?.click()],
      ['Apariencia','Claro u oscuro','◐',()=>$('#themeBtn')?.click()],
      ['Ajustes','Preferencias del dispositivo',ICON.gear,()=>clickLegacyMoreAction('Ajustes')],
      ['Diagnóstico','PWA, sync y almacenamiento','◉',()=>clickLegacyMoreAction('Diagnóstico')],
      ['Exportar','Guardar backup JSON','↑',()=>$('#exportBtn')?.click()],
      ['Importar','Restaurar backup JSON','↓',()=>$('#importBtn')?.click()]
    ];
    const body=`<div class="v124-group">${rows.map((r,i)=>`<button class="v124-row ${i===rows.length-1?'':''}" type="button" data-i="${i}"><span class="v124-row-icon">${typeof r[2]==='string'&&r[2].startsWith('<svg')?r[2]:r[2]}</span><span class="v124-row-copy"><b>${r[0]}</b><small>${r[1]}</small></span><span class="v124-chevron">›</span></button>`).join('')}</div>`;
    const layer=createSheet({id:'v124MoreSheet',title:'Más',body});
    $('.v124-sheet-body',layer).onclick=e=>{const row=e.target.closest('[data-i]');if(!row)return;const fn=rows[Number(row.dataset.i)]?.[3];closeSheet(layer);setTimeout(()=>fn?.(),50)};openSheet(layer);
  }
  function clickLegacyMoreAction(label){
    const candidate=$$('#v12MoreSheet button').find(b=>b.textContent.includes(label));if(candidate){candidate.click();return}
    if(label==='Diagnóstico')window.dispatchEvent(new KeyboardEvent('keydown',{key:'d',metaKey:true,shiftKey:true,bubbles:true}));
  }

  function openSearchSheet(){
    const body='<div class="v124-search-shell"><input id="v124SearchInput" class="v124-search-input" type="search" inputmode="search" autocomplete="off" placeholder="Buscar contenido, escenarios o marcas"><div id="v124SearchResults" class="v124-search-results"><div class="v124-empty">Escribe para buscar en Editorial OS.</div></div></div>';
    const layer=createSheet({id:'v124SearchSheet',title:'Buscar',body});const input=$('#v124SearchInput',layer),results=$('#v124SearchResults',layer);
    const render=()=>{const q=input.value.trim();const items=q?api()?.search?.(q)||[]:[];if(!q){results.innerHTML='<div class="v124-empty">Escribe para buscar en Editorial OS.</div>';return}if(!items.length){results.innerHTML='<div class="v124-empty">No hay resultados.</div>';return}results.innerHTML=`<div class="v124-group">${items.map((x,i)=>`<button type="button" class="v124-row" data-i="${i}"><span class="v124-row-copy"><b>${esc(x.title)}</b><small>${esc(x.subtitle||x.kind)}</small></span><span class="v124-chevron">›</span></button>`).join('')}</div>`;results.onclick=e=>{const row=e.target.closest('[data-i]');if(!row)return;const item=items[Number(row.dataset.i)];closeSheet(layer);setTimeout(()=>api()?.openSearchResult?.(item),40)}};
    input.addEventListener('input',render);openSheet(layer);setTimeout(()=>input.focus({preventScroll:true}),120);
  }

  function openCalendarSheet(){
    const state=api()?.getState?.().state||{};const body=`<div class="v124-group"><button class="v124-row" data-mode="week"><span class="v124-row-copy"><b>Semana</b><small>Vista operativa por día</small></span>${state.calendarMode==='week'?ICON.check:''}</button><button class="v124-row" data-mode="month"><span class="v124-row-copy"><b>Mes</b><small>Mapa compacto mensual</small></span>${state.calendarMode==='month'?ICON.check:''}</button></div>`;
    const layer=createSheet({id:'v124CalendarSheet',title:'Vista de calendario',body});$('.v124-sheet-body',layer).onclick=e=>{const m=e.target.closest('[data-mode]')?.dataset.mode;if(!m)return;closeSheet(layer);$('#'+(m==='week'?'weekBtn':'monthBtn'))?.click()};openSheet(layer);
  }

  function moveNodeToSheet(node,{id,title,subtitle=''}){
    if(!node)return;const placeholder=document.createComment(`v124:${id}`);node.parentNode.insertBefore(placeholder,node);const layer=createSheet({id,title,subtitle,onClose:()=>{if(placeholder.parentNode)placeholder.parentNode.insertBefore(node,placeholder);placeholder.remove()}});$('.v124-sheet-body',layer).appendChild(node);openSheet(layer);return layer;
  }
  function openPlannerSettingsSheet(){moveNodeToSheet($('#emulatorView>.emulator-toolbar'),{id:'v124PlannerSettings',title:'Configurar escenario',subtitle:'Nombre, rango y acciones de la emulación.'})}
  function openFeedSettingsSheet(){
    const view=$('#feedsView'),a=view?.querySelector(':scope>.feed-toolbar'),b=view?.querySelector(':scope>.feed-format-controls');if(!a&&!b)return;
    const p1=document.createComment('feed-toolbar'),p2=document.createComment('feed-format');a?.parentNode.insertBefore(p1,a);b?.parentNode.insertBefore(p2,b);
    const layer=createSheet({id:'v124FeedSettings',title:'Ajustes del feed',onClose:()=>{if(p1.parentNode&&a)p1.parentNode.insertBefore(a,p1);if(p2.parentNode&&b)p2.parentNode.insertBefore(b,p2);p1.remove();p2.remove()}});const body=$('.v124-sheet-body',layer);if(a)body.appendChild(a);if(b)body.appendChild(b);openSheet(layer);
  }
  function openExistingControls(viewId){const view=$(`#${viewId}`);const controls=view?.querySelector(':scope>.controls');moveNodeToSheet(controls,{id:`v124${viewId}Options`,title:'Opciones'})}

  function setupEmulatorModes(){
    const view=$('#emulatorView');if(!view||$('#v124EmulatorModes'))return;
    const modes=document.createElement('div');modes.id='v124EmulatorModes';modes.className='v124-emulator-modes';modes.innerHTML='<button class="active" data-mode="plan">Plan</button><button data-mode="preview">Vista previa</button><button data-mode="scenarios">Escenarios</button>';
    const layout=$('.emulator-layout',view);view.insertBefore(modes,layout);view.classList.add('v124-mode-plan');
    modes.onclick=e=>{const b=e.target.closest('[data-mode]');if(!b)return;const mode=b.dataset.mode;store?.set({emulatorMode:mode});$$('button',modes).forEach(x=>x.classList.toggle('active',x===b));view.classList.remove('v124-mode-plan','v124-mode-preview','v124-mode-scenarios');view.classList.add(`v124-mode-${mode}`)};
  }

  function ensureCatalogLayer(){
    let layer=$('#v124CatalogLayer');if(layer)return layer;
    layer=document.createElement('div');layer.id='v124CatalogLayer';layer.className='v124-catalog-layer';layer.setAttribute('aria-hidden','true');layer.innerHTML='<section class="v124-catalog-sheet"><div class="v124-sheet-grabber"></div><div class="v124-sheet-bar"><button class="v124-sheet-cancel" type="button">Cancelar</button><h3>Catálogo</h3><button class="v124-icon-button v124-sheet-close" type="button" aria-label="Cerrar">×</button></div><div class="v124-catalog-body"></div></section>';document.body.appendChild(layer);return layer;
  }
  function openCatalogSheet(){
    const pool=$('#emulatorView .planner-pool');if(!pool)return;const layer=ensureCatalogLayer();const body=$('.v124-catalog-body',layer);const placeholder=document.createComment('planner-pool');pool.parentNode.insertBefore(placeholder,pool);body.appendChild(pool);
    const close=()=>{document.documentElement.classList.remove('v124-catalog-open');layer.setAttribute('aria-hidden','true');if(placeholder.parentNode)placeholder.parentNode.insertBefore(pool,placeholder);placeholder.remove();store?.set({activeSheet:null})};
    $('.v124-sheet-close',layer).onclick=close;$('.v124-sheet-cancel',layer).onclick=close;layer.onpointerdown=e=>{if(e.target===layer)close()};document.documentElement.classList.add('v124-catalog-open');layer.setAttribute('aria-hidden','false');store?.set({activeSheet:'catalog'});setTimeout(()=>$('#plannerSearch')?.focus({preventScroll:true}),120);
  }

  function augmentPlannerCards(){
    const root=$('#plannerWeekGrid');if(!root)return;
    $$('.plan-item',root).forEach(card=>{
      if(card.dataset.v124)return;card.dataset.v124='1';
      const more=document.createElement('button');more.type='button';more.className='plan-more';more.setAttribute('aria-label','Acciones de la ficha');more.textContent='•••';card.appendChild(more);
      more.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openPlanMenu(card.dataset.instance)});
    });
  }
  function setupPlannerCardDelegation(){
    const root=$('#plannerWeekGrid');if(!root||root.dataset.v124delegate)return;root.dataset.v124delegate='1';
    root.addEventListener('click',e=>{const card=e.target.closest('.plan-item');if(!card||e.target.closest('.plan-handle,.plan-more,.plan-remove'))return;e.stopPropagation();e.preventDefault();planner()?.open?.(card.dataset.instance)},true);
    new MutationObserver(()=>augmentPlannerCards()).observe(root,{childList:true,subtree:true});augmentPlannerCards();
  }
  function openPlanMenu(id){
    const found=planner()?.find?.(id);if(!found)return;const snap=api()?.getState?.();const arr=snap?.plannerDraft?.[found.dow]||[];const idx=arr.findIndex(x=>x.instanceId===id);
    const body=`<div class="v124-plan-menu-head"><b>${esc(found.item.title)}</b><small>${esc(DOW_LABEL[found.dow])} · ${esc(found.item.type||'Contenido')}</small></div><div class="v124-group"><button class="v124-row" data-a="open"><span class="v124-row-copy"><b>Ver detalles</b><small>Producción, notas y destinos</small></span><span class="v124-chevron">›</span></button><button class="v124-row" data-a="move"><span class="v124-row-copy"><b>Mover a otro día</b><small>Selecciona el destino</small></span><span class="v124-chevron">›</span></button><button class="v124-row" data-a="up" ${idx<=0?'disabled':''}><span class="v124-row-copy"><b>Subir</b><small>Cambiar orden dentro del día</small></span></button><button class="v124-row" data-a="down" ${idx<0||idx>=arr.length-1?'disabled':''}><span class="v124-row-copy"><b>Bajar</b><small>Cambiar orden dentro del día</small></span></button><button class="v124-row v124-danger" data-a="remove"><span class="v124-row-copy"><b>Quitar del plan</b><small>No borra el contenido del catálogo</small></span></button></div>`;
    const layer=createSheet({id:'v124PlanMenu',title:'Acciones',body});$('.v124-sheet-body',layer).onclick=e=>{const a=e.target.closest('[data-a]')?.dataset.a;if(!a)return;closeSheet(layer);setTimeout(()=>{if(a==='open')planner()?.open?.(id);if(a==='move')window.openPlannerMoveSheet?.(id);if(a==='up')planner()?.move?.(id,found.dow,Math.max(0,idx-1));if(a==='down')planner()?.move?.(id,found.dow,Math.min(arr.length-1,idx+1));if(a==='remove'&&confirm('¿Quitar esta ficha del plan?'))planner()?.remove?.(id)},40)};openSheet(layer);
  }

  function setupFeedPlatforms(){
    const view=$('#feedsView');if(!view||$('#v124FeedPlatforms'))return;const row=document.createElement('div');row.id='v124FeedPlatforms';row.className='v124-feed-platforms';const toolbar=view.querySelector(':scope>.feed-toolbar');view.insertBefore(row,toolbar||view.firstChild);syncFeedPlatforms();
  }
  function syncFeedPlatforms(){
    const row=$('#v124FeedPlatforms');if(!row)return;const buttons=$$('.platformbtn[data-feed]');row.innerHTML=buttons.map(b=>`<button type="button" data-feed="${b.dataset.feed}" class="${b.classList.contains('active')?'active':''}">${esc(b.textContent)}</button>`).join('');row.onclick=e=>{const b=e.target.closest('[data-feed]');if(!b)return;$('.platformbtn[data-feed="'+b.dataset.feed+'"]')?.click()};
  }

  function setupHomeSummary(){
    const home=$('#homeView');if(!home||$('#v124WeekSummary',home))return;const wrap=document.createElement('div');wrap.id='v124WeekSummary';wrap.className='v124-week-summary';const today=$('#v123Today',home);(today?.parentNode||home).insertBefore(wrap,today?.nextSibling||home.firstChild);syncHomeSummary();
  }
  function readText(id,fallback='0'){return $(`#${id}`)?.textContent?.trim()||fallback}
  function syncHomeSummary(){
    const root=$('#v124WeekSummary');if(!root)return;root.innerHTML=`<div class="v124-summary-group"><div class="v124-summary-row"><span class="copy"><b>Producción</b><small>Hechas / planificadas</small></span><span class="metric">${esc(readText('homeDoneCount','0/0'))}</span></div><div class="v124-summary-row"><span class="copy"><b>Piezas maestras</b><small>Semana activa</small></span><span class="metric">${esc(readText('homeWeekMaster','0'))}</span></div><div class="v124-summary-row"><span class="copy"><b>Escenarios</b><small>Guardados en la marca</small></span><span class="metric">${esc(readText('homeScenarioCount','0'))}</span></div></div><div class="v124-home-actions"><button data-go="calendarView">Calendario</button><button data-go="emulatorView">Planificar</button><button data-a="search">Buscar</button><button data-go="inventoryView">Biblioteca</button></div>`;root.onclick=e=>{const g=e.target.closest('[data-go]')?.dataset.go;if(g)api()?.navigate?.(g);if(e.target.closest('[data-a="search"]'))openSearchSheet()};
  }

  function openLibraryFilters(){
    const ids=['inventoryFilter','inventoryFamilyFilter','inventoryPillarFilter'];const originals=ids.map(id=>$(`#${id}`)).filter(Boolean);if(!originals.length)return;
    const body=`<div class="v124-filter-stack">${originals.map(o=>`<label>${esc(o.previousElementSibling?.textContent||o.getAttribute('aria-label')||'Filtro')}<select data-id="${o.id}">${[...o.options].map(opt=>`<option value="${esc(opt.value)}" ${opt.value===o.value?'selected':''}>${esc(opt.textContent)}</option>`).join('')}</select></label>`).join('')}</div><button type="button" class="v124-capsule primary v124-filter-apply">Aplicar filtros</button>`;
    const layer=createSheet({id:'v124LibraryFilters',title:'Filtros',body});$('.v124-filter-apply',layer).onclick=()=>{$$('select[data-id]',layer).forEach(s=>{const o=$(`#${s.dataset.id}`);if(o){o.value=s.value;o.dispatchEvent(new Event('change',{bubbles:true}))}});closeSheet(layer)};openSheet(layer);
  }
  function openLibraryAdd(){
    const state=api()?.getState?.().state||{};const tab=state.libraryTab||'content';if(tab==='content'){const btn=$('#openContentCreatorBtn')||$('#plannerNewContentBtn');btn?.click();return}
    const panel=$(`#library${tab[0]?.toUpperCase()+tab.slice(1)}Panel`);const form=panel?.querySelector('form');if(form){moveNodeToSheet(form,{id:'v124LibraryAddSheet',title:'Añadir'});return}
    toast('En esta sección no hay una acción de creación.')
  }

  function syncView(){const v=activeView();store?.set({activeView:v});syncViewHeader(v);syncTopbar();syncFeedPlatforms();if(v==='homeView'){setupHomeSummary();syncHomeSummary()}if(v==='emulatorView'){setupEmulatorModes();setupPlannerCardDelegation();augmentPlannerCards()}}

  function setupKeyboardViewport(){
    const vv=window.visualViewport;if(!vv)return;const update=()=>{const diff=window.innerHeight-vv.height;const open=diff>120;document.documentElement.style.setProperty('--v124-keyboard',open?`${Math.max(0,diff)}px`:'0px');document.documentElement.classList.toggle('v124-keyboard-open',open);store?.set({keyboardOpen:open})};vv.addEventListener('resize',update,{passive:true});vv.addEventListener('scroll',update,{passive:true});update();
  }
  function setupGlobalShortcuts(){document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearchSheet()}})}

  function patchPlannerApi(){
    const p=planner();if(!p||p.open)return;p.open=id=>{const f=p.find?.(id);if(!f)return false;const drawerApi=api();if(drawerApi?.openItem)return drawerApi.openItem(f.item);return false};
  }

  function boot(){
    if(document.documentElement.dataset.v124Booted)return;document.documentElement.dataset.v124Booted='1';
    setupMobileTopbar();setupViewHeaders();setupDock();setupEmulatorModes();setupFeedPlatforms();setupHomeSummary();setupPlannerCardDelegation();setupKeyboardViewport();setupGlobalShortcuts();patchPlannerApi();syncView();
    window.addEventListener('editorial:view',syncView);window.addEventListener('editorial:rendered',()=>requestAnimationFrame(()=>{patchPlannerApi();syncView()}));window.addEventListener('online',syncTopbar);window.addEventListener('offline',syncTopbar);
    compact.addEventListener?.('change',()=>{if(!compact.matches)document.documentElement.classList.remove('v124-modal-open','v124-catalog-open')});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
