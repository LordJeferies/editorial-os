/* Editorial OS V12.3 · mobile-first operating shell */
(() => {
  'use strict';
  const compact=matchMedia('(max-width:899px)');
  const DOWS=[1,2,3,4,5,6,0],LABELS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const ROUTES={homeView:'home',calendarView:'calendar',lanesView:'lanes',emulatorView:'emulator',agendaView:'agenda',feedsView:'feeds',inventoryView:'library'};
  let routing=false,activeDow=Number(document.getElementById('plannerTargetDay')?.value||1),lastFocus=null;
  const $=(s,r=document)=>r.querySelector(s);
  const api=()=>window.EDITORIAL_V123_API;
  const toast=msg=>window.v12Toast?window.v12Toast(msg):console.info(msg);

  function makeLayer(id,title,subtitle=''){
    let layer=document.getElementById(id);if(layer)return layer;
    layer=document.createElement('div');layer.id=id;layer.className='v123-layer';layer.setAttribute('aria-hidden','true');
    layer.innerHTML=`<section class="v123-sheet" role="dialog" aria-modal="true"><div class="v123-handle"></div><div class="v123-sheet-head"><div><h3>${title}</h3><p>${subtitle}</p></div><button class="v123-close" type="button" aria-label="Cerrar">×</button></div><div class="v123-sheet-body"></div></section>`;
    document.body.appendChild(layer);layer.querySelector('.v123-close').onclick=()=>closeLayer(layer);layer.addEventListener('pointerdown',e=>{if(e.target===layer)closeLayer(layer)});return layer;
  }
  function openLayer(layer){lastFocus=document.activeElement;layer.classList.add('open');layer.setAttribute('aria-hidden','false');document.documentElement.classList.add('v123-modal-open')}
  function closeLayer(layer){layer?.classList.remove('open');layer?.setAttribute('aria-hidden','true');document.documentElement.classList.remove('v123-modal-open');setTimeout(()=>lastFocus?.focus?.(),0)}
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.v123-layer.open').forEach(closeLayer)});

  /* Planner: mobile renders only the selected day. */
  function setupPlannerTabs(){
    const grid=$('#plannerWeekGrid');if(!grid)return;
    let tabs=$('#v123PlannerDayTabs');
    if(!tabs){tabs=document.createElement('div');tabs.id='v123PlannerDayTabs';tabs.className='v123-daytabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Día del emulador');
      DOWS.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.dataset.dow=String(d);b.textContent=LABELS[i];b.onclick=()=>selectDow(d);tabs.appendChild(b)});grid.parentNode.insertBefore(tabs,grid)}
    const sel=$('#plannerTargetDay');if(sel&&!sel.dataset.v123){sel.dataset.v123='1';sel.addEventListener('change',()=>{activeDow=Number(sel.value);syncPlannerTabs()})}
    syncPlannerTabs();
  }
  function selectDow(dow){activeDow=Number(dow);const sel=$('#plannerTargetDay');if(sel&&sel.value!==String(activeDow)){sel.value=String(activeDow);sel.dispatchEvent(new Event('change',{bubbles:true}))}else api()?.navigate?.('emulatorView');syncPlannerTabs();window.EDITORIAL_PLANNER?.render?.()}
  function syncPlannerTabs(){$('#v123PlannerDayTabs')?.querySelectorAll('button').forEach(b=>{const on=Number(b.dataset.dow)===activeDow;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))})}

  function setupPoolSheet(){
    const view=$('#emulatorView'),pool=view?.querySelector('.planner-pool');if(!view||!pool||$('#v123CatalogFab'))return;
    const fab=document.createElement('button');fab.id='v123CatalogFab';fab.className='v123-catalog-fab';fab.type='button';fab.textContent='＋ Catálogo';document.body.appendChild(fab);
    const close=document.createElement('button');close.className='v123-pool-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','Cerrar catálogo');pool.insertBefore(close,pool.firstChild);
    const bd=document.createElement('div');bd.className='v123-pool-backdrop';document.body.appendChild(bd);
    const set=o=>document.documentElement.classList.toggle('v123-pool-open',o);fab.onclick=()=>set(true);close.onclick=()=>set(false);bd.onclick=()=>set(false);compact.addEventListener?.('change',()=>{if(!compact.matches)set(false)});
  }

  function openMoveSheet(instanceId){
    const found=window.EDITORIAL_PLANNER?.find?.(instanceId);if(!found)return;
    const layer=makeLayer('v123MoveLayer','Mover ficha','Elige el día de destino. El orden se puede ajustar después.');
    const body=layer.querySelector('.v123-sheet-body');body.innerHTML=`<div style="font-weight:800;margin:0 0 10px">${escapeHtml(found.item.title)}</div><div class="v123-grid-actions"></div>`;const grid=body.lastElementChild;
    DOWS.forEach((dow,i)=>{const b=document.createElement('button');b.className='v123-action';b.type='button';b.innerHTML=`<b>${LABELS[i]}</b><small>${dow===found.dow?'Día actual':'Mover aquí'}</small>`;b.disabled=dow===found.dow;b.onclick=()=>{if(window.EDITORIAL_PLANNER?.move?.(instanceId,dow)){activeDow=dow;const sel=$('#plannerTargetDay');if(sel)sel.value=String(dow);closeLayer(layer);window.EDITORIAL_PLANNER.render();syncPlannerTabs();toast(`Movido a ${LABELS[i]}`)}};grid.appendChild(b)});
    openLayer(layer);
  }
  window.openPlannerMoveSheet=openMoveSheet;


  /* Offline/touch fallback when SortableJS CDN is unavailable. */
  function setupPointerReorderFallback(){
    if(window.Sortable||!compact.matches||document.documentElement.dataset.v123PointerReorder)return;document.documentElement.dataset.v123PointerReorder='1';
    let session=null,timer=null;
    document.addEventListener('pointerdown',e=>{const handle=e.target.closest('.plan-handle');if(!handle)return;const card=handle.closest('.plan-item'),list=card?.closest('.planner-day-list');if(!card||!list)return;const id=card.dataset.instance;if(!id)return;timer=setTimeout(()=>{session={id,card,list,pointerId:e.pointerId};card.classList.add('sortable-chosen');try{handle.setPointerCapture(e.pointerId)}catch{}},180)},{passive:true});
    document.addEventListener('pointermove',e=>{if(!session||e.pointerId!==session.pointerId)return;e.preventDefault();const cards=[...session.list.querySelectorAll('.plan-item')].filter(x=>x!==session.card);let before=null;for(const c of cards){const r=c.getBoundingClientRect();if(e.clientY<r.top+r.height/2){before=c;break}}session.list.insertBefore(session.card,before)},{passive:false});
    const finish=e=>{clearTimeout(timer);timer=null;if(!session)return;const {id,card,list,pointerId}=session;session=null;card.classList.remove('sortable-chosen');if(e&&e.pointerId!==pointerId)return;const idx=[...list.querySelectorAll('.plan-item')].findIndex(x=>x.dataset.instance===id);window.EDITORIAL_PLANNER?.move?.(id,activeDow,Math.max(0,idx));};
    document.addEventListener('pointerup',finish);document.addEventListener('pointercancel',finish);
  }

  /* Universal search */
  function setupSearch(){
    const actions=$('#glassHeader .actions');if(actions&&!$('#v123SearchBtn')){const b=document.createElement('button');b.id='v123SearchBtn';b.className='v123-search-trigger';b.type='button';b.setAttribute('aria-label','Buscar');b.textContent='⌕';actions.appendChild(b);b.onclick=openSearch}
    document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}});
  }
  function openSearch(){
    const layer=makeLayer('v123SearchLayer','Buscar','Contenido, escenarios y marcas · ⌘K');const body=layer.querySelector('.v123-sheet-body');body.innerHTML='<input class="v123-search-input" type="search" placeholder="Buscar en Editorial OS…" autocomplete="off"><div class="v123-results"></div>';
    const input=body.querySelector('input'),results=body.querySelector('.v123-results');
    const render=()=>{const items=api()?.search?.(input.value)||[];results.innerHTML='';if(!input.value.trim())results.innerHTML='<div class="callout">Escribe para buscar contenido, escenarios o marcas.</div>';else if(!items.length)results.innerHTML='<div class="callout">Sin resultados.</div>';items.forEach(item=>{const b=document.createElement('button');b.className='v123-result';b.type='button';b.innerHTML=`<b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.subtitle||item.kind)}</small>`;b.onclick=()=>{closeLayer(layer);api()?.openSearchResult?.(item)};results.appendChild(b)})};
    input.addEventListener('input',render);render();openLayer(layer);setTimeout(()=>input.focus(),30);
  }

  /* Quick add */
  function setupQuickAdd(){if($('#v123QuickFab'))return;const b=document.createElement('button');b.id='v123QuickFab';b.className='v123-quick-fab';b.type='button';b.setAttribute('aria-label','Crear o añadir');b.textContent='+';document.body.appendChild(b);b.onclick=openQuickAdd}
  function openQuickAdd(){const layer=makeLayer('v123QuickLayer','Crear','Acciones rápidas');const body=layer.querySelector('.v123-sheet-body');body.innerHTML=`<div class="v123-grid-actions"><button class="v123-action" data-a="content"><b>Nuevo contenido</b><small>Crear ficha personalizada</small></button><button class="v123-action" data-a="day"><b>Añadir al día</b><small>Abrir catálogo del Emulador</small></button><button class="v123-action" data-a="scenario"><b>Nuevo escenario</b><small>Abrir laboratorio editorial</small></button><button class="v123-action" data-a="brand"><b>Nueva marca</b><small>Configurar otra marca</small></button></div>`;body.onclick=e=>{const a=e.target.closest('[data-a]')?.dataset.a;if(!a)return;closeLayer(layer);if(a==='content')$('#homeNewContentBtn')?.click();if(a==='scenario')api()?.navigate?.('emulatorView');if(a==='brand')$('#newBrandBtn')?.click();if(a==='day'){api()?.navigate?.('emulatorView');setTimeout(()=>$('#v123CatalogFab')?.click(),50)}};openLayer(layer)}


  /* Lightweight device preferences. */
  function prefs(){try{return JSON.parse(localStorage.getItem('editorialV123Prefs')||'{}')}catch{return {}}}
  function savePrefs(v){localStorage.setItem('editorialV123Prefs',JSON.stringify({...prefs(),...v}));applyPrefs()}
  function applyPrefs(){const p=prefs();document.documentElement.classList.toggle('v123-reduce-effects',!!p.reduceEffects)}
  function openSettings(){
    const layer=makeLayer('v123SettingsLayer','Ajustes','Preferencias de este dispositivo.');const p=prefs(),body=layer.querySelector('.v123-sheet-body');
    body.innerHTML=`<div class="v123-field"><label>Vista inicial</label><select id="v123DefaultView"><option value="homeView">Hoy</option><option value="calendarView">Calendario</option><option value="emulatorView">Emulador</option><option value="agendaView">Agenda</option><option value="feedsView">Feeds</option><option value="inventoryView">Biblioteca</option></select></div><div class="v123-checklist" style="margin-top:10px"><label><input id="v123ReduceEffects" type="checkbox"> Reducir efectos</label></div><div class="v123-diag" style="margin-top:10px"><span>Zona horaria</span><b>${escapeHtml(Intl.DateTimeFormat().resolvedOptions().timeZone||'Sistema')}</b></div><div class="drawer-actions" style="margin-top:12px"><button class="btn danger" id="v123ClearDevice">Cerrar sesión y borrar datos de este dispositivo</button></div>`;
    const sel=$('#v123DefaultView',body);sel.value=p.defaultView||'homeView';sel.onchange=()=>savePrefs({defaultView:sel.value});const reduce=$('#v123ReduceEffects',body);reduce.checked=!!p.reduceEffects;reduce.onchange=()=>savePrefs({reduceEffects:reduce.checked});
    $('#v123ClearDevice',body).onclick=async()=>{if(!confirm('Esto cerrará la sesión y borrará datos locales de ESTE dispositivo. La nube no se elimina.'))return;$('#cloudSignOutBtn')?.click();['jocEditorialV9','jocEditorialV9AppData','jocEditorialV9Scenarios','editorialV123Revision','editorialV123BaseRevision','editorialV123Errors'].forEach(k=>localStorage.removeItem(k));await window.EDITORIAL_STORAGE?.clearAll?.();location.reload()};
    openLayer(layer);
  }

  /* Diagnostics + recovery */
  async function openDiagnostics(){
    const layer=makeLayer('v123DiagLayer','Diagnóstico','Estado real del PWA, storage y sincronización.');const body=layer.querySelector('.v123-sheet-body');body.innerHTML='<div class="callout">Leyendo diagnóstico…</div>';openLayer(layer);
    const d=await api()?.diagnostics?.()||{},reg=await navigator.serviceWorker?.getRegistration?.().catch(()=>null),cacheNames=await window.caches?.keys?.().catch(()=>[]),vv=window.visualViewport;
    const entries={Versión:d.version||'12.3',Vista:d.view||'',Marca:d.brand||'',Escenario:d.scenario||'Plan automático','Viewport':`${innerWidth}×${innerHeight}`,'Visual viewport':vv?`${Math.round(vv.width)}×${Math.round(vv.height)}`:'n/a',DPR:devicePixelRatio,'Modo':matchMedia('(display-mode: standalone)').matches?'PWA standalone':'Safari/browser','Online':navigator.onLine?'Sí':'No','Service Worker':reg?.active?.state||'No activo','Caches':cacheNames.join(', ')||'ninguno','Sync':d.sync?.conflict?'Conflicto':(d.sync?.dirty?'Cambios pendientes':(d.sync?.connected?'Conectado':'Local')),'Revision':`${d.sync?.revision||0} / base ${d.sync?.baseRevision||0}`,'Device ID':d.storage?.deviceId||d.sync?.deviceId||'',IndexedDB:d.storage?.db?'OK':'No disponible','Outbox':d.storage?.pending?'Pendiente':'Vacío','LocalStorage':formatBytes(d.localStorageBytes||0)};
    body.innerHTML=`<div class="v123-diagnostics">${Object.entries(entries).map(([k,v])=>`<div class="v123-diag"><span>${escapeHtml(k)}</span><b>${escapeHtml(String(v))}</b></div>`).join('')}</div><div class="drawer-actions" style="margin-top:10px"><button class="btn" id="v123CopyDiag">Copiar diagnóstico</button><button class="btn" id="v123Recover">Recuperar copia local</button><button class="btn accent" id="v123ForceSync">Sincronizar ahora</button></div>`;
    $('#v123CopyDiag',body).onclick=async()=>{await navigator.clipboard?.writeText?.(JSON.stringify(entries,null,2));toast('Diagnóstico copiado')};
    $('#v123ForceSync',body).onclick=()=>api()?.forceSync?.();
    $('#v123Recover',body).onclick=async()=>{const snap=await window.EDITORIAL_STORAGE?.latestSnapshot?.();if(!snap){toast('No hay copia local de recuperación');return}if(!confirm('¿Restaurar la última copia IndexedDB de este dispositivo?'))return;localStorage.setItem('jocEditorialV9',JSON.stringify(snap.state||{}));localStorage.setItem('jocEditorialV9AppData',JSON.stringify(snap.appData||{}));localStorage.setItem('jocEditorialV9Scenarios',JSON.stringify(snap.savedScenarios||[]));location.reload()};
  }

  /* More tools gets Search and Diagnostics without crowding primary navigation. */
  function augmentMore(){const grid=$('#v12MoreSheet .v12-sheet-grid');if(!grid||grid.dataset.v123)return;grid.dataset.v123='1';const add=(icon,title,sub,fn)=>{const b=document.createElement('button');b.className='v12-sheet-action';b.type='button';b.innerHTML=`<span>${icon}</span><b>${title}</b><small>${sub}</small>`;b.onclick=()=>{$('#v12MoreSheet .v12-sheet-close')?.click();setTimeout(fn,30)};grid.appendChild(b)};add('⌕','Buscar','Contenido y escenarios',openSearch);add('⚙','Ajustes','Preferencias del dispositivo',openSettings);add('◉','Diagnóstico','PWA, sync y storage',openDiagnostics)}

  /* Today surface */
  function renderToday(){const home=$('#homeView');if(!home)return;let panel=$('#v123Today',home);if(!panel){panel=document.createElement('section');panel.id='v123Today';panel.className='v123-today';home.insertBefore(panel,home.firstChild)}const items=api()?.todayItems?.()||[],date=new Date();panel.innerHTML=`<div class="v123-today-head"><div><small>HOY · ${date.toLocaleDateString('es-ES',{weekday:'long'}).toUpperCase()}</small><h2>${date.toLocaleDateString('es-ES',{day:'numeric',month:'long'})}</h2></div><div class="v123-today-count">${items.length}</div></div><div class="v123-today-list"></div>`;const list=panel.lastElementChild;items.slice(0,6).forEach(a=>{const prod=a.production||api()?.getProduction?.(a,a.date)||{status:'planned'};const b=document.createElement('button');b.className='v123-today-item';b.type='button';b.innerHTML=`<i class="dot" style="--dot:${escapeHtml(a.color||'#777')}"></i><span class="copy"><b>${escapeHtml(a.title)}</b><small>${escapeHtml(a.type)}${prod.publishTime?` · ${escapeHtml(prod.publishTime)}`:''}</small></span><span class="v123-status-pill">${statusLabel(prod.status)}</span>`;b.onclick=()=>api()?.setCalendarDate?.(a.date||toDateKey(date));list.appendChild(b)});if(!items.length)list.innerHTML='<div class="callout">No hay piezas planificadas para hoy.</div>'}

  /* Hash router */
  function routeForView(view){return '#/'+(ROUTES[view]||'home')}
  function viewForRoute(route){const name=String(route||'').replace(/^#\//,'').split('/')[0];return Object.keys(ROUTES).find(k=>ROUTES[k]===name)||'homeView'}
  function applyRoute(){const parts=location.hash.replace(/^#\//,'').split('/');const view=viewForRoute(location.hash);routing=true;api()?.navigate?.(view);if(view==='calendarView'&&/^\d{4}-\d{2}-\d{2}$/.test(parts[1]||''))api()?.setCalendarDate?.(parts[1]);setTimeout(()=>routing=false,0)}
  window.addEventListener('popstate',applyRoute);window.addEventListener('editorial:view',e=>{if(routing)return;const route=routeForView(e.detail?.view);if(location.hash!==route)history.pushState({view:e.detail?.view},'',route)});

  /* Conflict resolution */
  function ensureConflictBanner(){let b=$('#v123ConflictBanner');if(b)return b;b=document.createElement('div');b.id='v123ConflictBanner';b.className='v123-banner';b.innerHTML='<div class="copy"><b>Cambios de otro dispositivo</b><small>Hay cambios locales sin subir y una revisión más nueva en la nube.</small></div><button data-a="remote">Usar nube</button><button data-a="local">Mantener aquí</button>';document.body.appendChild(b);b.onclick=async e=>{const a=e.target.closest('[data-a]')?.dataset.a;if(a==='remote'){api()?.acceptRemote?.();b.classList.remove('show');toast('Se cargó la revisión de la nube')}if(a==='local'){await api()?.keepLocal?.();b.classList.remove('show');toast('Se conservó esta versión y se sincronizó')}};return b}
  window.addEventListener('editorial:cloud-conflict',()=>ensureConflictBanner().classList.add('show'));

  /* Controlled PWA update */
  async function setupPWAUpdate(){if(!('serviceWorker' in navigator))return;const reg=await navigator.serviceWorker.getRegistration().catch(()=>null);if(!reg)return;const show=worker=>{let b=$('#v123UpdateBanner');if(!b){b=document.createElement('div');b.id='v123UpdateBanner';b.className='v123-banner';b.innerHTML='<div class="copy"><b>Nueva versión disponible</b><small>Actualiza cuando hayas terminado la acción actual.</small></div><button>Actualizar</button>';document.body.appendChild(b)}b.classList.add('show');b.querySelector('button').onclick=()=>worker?.postMessage?.({type:'SKIP_WAITING'})};if(reg.waiting)show(reg.waiting);reg.addEventListener('updatefound',()=>{const w=reg.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)show(w)})});let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});reg.update().catch(()=>{})}

  /* Local crash log and recovery UI */
  function logError(kind,error){try{const key='editorialV123Errors',arr=JSON.parse(localStorage.getItem(key)||'[]');arr.unshift({at:new Date().toISOString(),kind,message:String(error?.message||error),stack:String(error?.stack||'').slice(0,3000)});localStorage.setItem(key,JSON.stringify(arr.slice(0,100)))}catch{}let b=$('#v123ErrorBanner');if(!b){b=document.createElement('div');b.id='v123ErrorBanner';b.className='v123-banner danger';b.innerHTML='<div class="copy"><b>Algo falló</b><small>Tus datos locales siguen guardados. Puedes abrir Diagnóstico para copiar información.</small></div><button>Diagnóstico</button>';document.body.appendChild(b);b.querySelector('button').onclick=openDiagnostics}b.classList.add('show');setTimeout(()=>b.classList.remove('show'),8000)}
  window.addEventListener('error',e=>logError('error',e.error||e.message));window.addEventListener('unhandledrejection',e=>logError('promise',e.reason));

  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function formatBytes(n){if(!n)return '0 KB';return n>1024*1024?`${(n/1024/1024).toFixed(1)} MB`:`${Math.round(n/1024)} KB`}
  function statusLabel(s){return ({planned:'Planificada',production:'Producción',editing:'Editando',review:'Revisión',changes:'Cambios',approved:'Aprobada',scheduled:'Programada',published:'Publicada'})[s]||'Planificada'}
  function toDateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}

  function boot(){
    document.documentElement.dataset.editorialVersion='12.3';applyPrefs();
    const title=$('#brandTitle');if(title)title.textContent=title.textContent.replace(/V\d+(?:\.\d+)?/i,'V12.3');
    setupPlannerTabs();setupPoolSheet();setupPointerReorderFallback();setupSearch();setupQuickAdd();augmentMore();renderToday();setupPWAUpdate();window.EDITORIAL_STORAGE?.getConflict?.().then(c=>{if(c?.payload)ensureConflictBanner().classList.add('show')});
    window.addEventListener('editorial:rendered',e=>{if(e.detail?.view==='homeView')renderToday();if(e.detail?.view==='emulatorView'){setupPlannerTabs();syncPlannerTabs()}});
    if(location.hash&&location.hash!=='#/home')applyRoute();else if(!location.hash){const v=prefs().defaultView||'homeView';api()?.navigate?.(v);history.replaceState({view:v},'',routeForView(v))}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
