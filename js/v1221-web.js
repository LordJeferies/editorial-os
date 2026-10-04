(()=>{
'use strict';
const VERSION='12.21';
const NATIVE_DESKTOP=/EditorialOSDesktop/i.test(navigator.userAgent);
if(NATIVE_DESKTOP)return;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const DAY_NAMES={0:'Dom',1:'Lun',2:'Mar',3:'Mié',4:'Jue',5:'Vie',6:'Sáb'};
const VIEW_META={
 homeView:{label:'Inicio',icon:'⌂'},
 emulatorView:{label:'Plan',icon:'▦'},
 calendarView:{label:'Calendario',icon:'◷'},
 agendaView:{label:'Agenda',icon:'☷'},
 feedsView:{label:'Feeds',icon:'▥'},
 inventoryView:{label:'Biblioteca',icon:'◇'},
 lanesView:{label:'Franjas',icon:'≡'}
};
let renderTimer=null;
let observer=null;
function safeGet(k){try{return localStorage.getItem(k)}catch{return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch{}}
function api(){return window.EDITORIAL_V123_API}
function snapshot(){try{return api()?.getState?.()||null}catch{return null}}
function currentView(){return $('.view.active')?.id||'homeView'}
function syncState(){
  if(!navigator.onLine)return {key:'offline',label:'Sin conexión'};
  const el=$('#syncStatus');const txt=((el?.textContent||'')+' '+(el?.className||'')).toLowerCase();
  if(/error|conflict|fall|offline/.test(txt))return {key:'error',label:'Nube con problema'};
  if(/sync|subiendo|bajando|guardando|conectando/.test(txt))return {key:'sync',label:'Sincronizando'};
  if(/conectado|online|sincronizado|actualizado|cloud/.test(txt))return {key:'ok',label:'Sincronizado'};
  return {key:'idle',label:'Local'};
}
function brandName(){
  const s=$('#brandSelect');
  if(s?.selectedOptions?.[0]?.textContent)return s.selectedOptions[0].textContent.trim();
  const t=$('#brandTitle')?.textContent||'Editorial OS';
  return t.split('·')[0].replace(/EDITORIAL OS.*/i,'').trim()||'Editorial OS';
}
function setVersion(){
  window.EDITORIAL_OS_VERSION=VERSION;
  document.documentElement.dataset.editorialVersion=VERSION;
  document.documentElement.dataset.editorialWebshell='1';
  document.title=document.title.replace(/V12\.\d+(?:\.\d+)?/g,`V${VERSION}`);
}
function ensureCss(){
  if($('#v1221WebCss'))return;
  const l=document.createElement('link');l.id='v1221WebCss';l.rel='stylesheet';l.href='./css/v1221-web.css?v=12.21';document.head.appendChild(l);
}
function navigate(view){
  const legacy=$(`.navbtn[data-view="${view}"]`);
  if(legacy){legacy.click()}else{
    $$('.view').forEach(v=>v.classList.toggle('active',v.id===view));
  }
  if(view==='emulatorView'&&matchMedia('(max-width:899px)').matches){
    safeSet('editorialV1212PlannerView','agenda');
    setTimeout(()=>document.querySelector('[data-v1212-view="agenda"]')?.click(),80);
  }
  setTimeout(()=>{updateActive();renderHome()},50);
}
function openSettings(){
  const b=$('#v1213SettingsTop')||$('#v1213SettingsHome')||$('#v1213SettingsMobile');
  if(b){b.click();return}
  $('#cloudBtn')?.click();
}
function newContent(){
  const b=$('#homeNewContentBtn')||$('#newContentBtn');
  if(b){b.click();return}
  navigate('inventoryView');
}
async function forceSync(){
  const pill=$('#v1221Sync');if(pill){pill.dataset.state='sync';const s=pill.querySelector('span');if(s)s.textContent='Sincronizando'}
  try{await api()?.forceSync?.()}catch{}
  setTimeout(updateStatus,350);
}
function mountChrome(){
  if($('#v1221WebHeader'))return;
  const h=document.createElement('header');h.id='v1221WebHeader';h.innerHTML=`
    <div class="brand"><div class="v1221-mark">J</div><div class="v1221-brandcopy"><b>Editorial OS</b><small>Web · V${VERSION}</small></div></div>
    <div class="v1221-header-center"><div class="v1221-context"><span>Espacio</span><b id="v1221BrandName">${esc(brandName())}</b></div></div>
    <div class="v1221-header-actions"><div id="v1221Sync" class="v1221-sync" data-state="idle"><i></i><span>Local</span></div><button class="labelled" id="v1221SyncBtn">Sincronizar</button><button class="primary" id="v1221NewBtn">＋ Nuevo</button><button id="v1221SettingsBtn" aria-label="Configuración">⚙</button></div>`;
  document.body.appendChild(h);
  const side=document.createElement('aside');side.id='v1221Sidebar';side.innerHTML=`<div class="label">NAVEGACIÓN</div>${['homeView','emulatorView','calendarView','agendaView','feedsView','inventoryView','lanesView'].map(v=>`<button class="v1221-navbtn" data-v1221-view="${v}"><span>${VIEW_META[v].icon}</span><b>${VIEW_META[v].label}</b></button>`).join('')}<div class="v1221-side-footer"><button id="v1221SideSettings">Configuración</button></div>`;document.body.appendChild(side);
  const dock=document.createElement('nav');dock.id='v1221MobileDock';dock.innerHTML=`${[['homeView','⌂','Inicio'],['emulatorView','▦','Plan'],['calendarView','◷','Calendario'],['feedsView','▥','Feeds']].map(([v,i,l])=>`<button class="v1221-dockbtn" data-v1221-view="${v}"><i>${i}</i><b>${l}</b></button>`).join('')}<button class="v1221-dockbtn" id="v1221MoreBtn"><i>•••</i><b>Más</b></button>`;document.body.appendChild(dock);
  const more=document.createElement('div');more.id='v1221MoreSheet';more.innerHTML=`<section class="v1221-more-card"><div class="v1221-more-grab"></div><h3>Más herramientas</h3><div class="v1221-more-grid"><button data-v1221-view="agendaView"><b>Agenda</b><span>Lista operativa</span></button><button data-v1221-view="inventoryView"><b>Biblioteca</b><span>Contenidos y marca</span></button><button data-v1221-view="lanesView"><b>Franjas</b><span>Distribución editorial</span></button><button id="v1221MoreSync"><b>Sincronizar</b><span>Subir / bajar estado</span></button><button id="v1221MoreSettings"><b>Cuenta y nube</b><span>Supabase y acceso</span></button><button id="v1221MoreInstall"><b>Instalar PWA</b><span>Usar como app</span></button></div></section>`;document.body.appendChild(more);
  document.addEventListener('click',e=>{const b=e.target.closest('[data-v1221-view]');if(b){navigate(b.dataset.v1221View);closeMore()}});
  $('#v1221SyncBtn').onclick=forceSync;$('#v1221NewBtn').onclick=newContent;$('#v1221SettingsBtn').onclick=openSettings;$('#v1221SideSettings').onclick=openSettings;$('#v1221MoreBtn').onclick=openMore;$('#v1221MoreSync').onclick=()=>{forceSync();closeMore()};$('#v1221MoreSettings').onclick=()=>{closeMore();openSettings()};$('#v1221MoreInstall').onclick=()=>{closeMore();const b=$('#v1220InstallCard button');if(b)b.click();else alert('Safari → Compartir → Añadir a pantalla de inicio')};
  more.addEventListener('click',e=>{if(e.target===more)closeMore()});
}
function openMore(){$('#v1221MoreSheet')?.classList.add('open')}
function closeMore(){$('#v1221MoreSheet')?.classList.remove('open')}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function plannerData(){
  const s=snapshot();const p=s?.plannerDraft||{};const days=[1,2,3,4,5,6,0];
  const all=days.flatMap(d=>(Array.isArray(p[d])?p[d]:[]).map(item=>({item,dow:d})));
  return {p,days,all};
}
function renderHome(){
  const home=$('#homeView');if(!home)return;
  let hub=$('#v1221HomeHub');if(!hub){hub=document.createElement('section');hub.id='v1221HomeHub';home.prepend(hub)}
  const {p,days,all}=plannerData();const today=new Date().getDay();const todayItems=Array.isArray(p[today])?p[today]:[];const done=all.filter(x=>x.item?.done||x.item?.status==='done'||x.item?.productionStatus==='done').length;const cloud=syncState();
  hub.innerHTML=`
    <section class="v1221-hero"><div><small>EDITORIAL CONTROL CENTER</small><h1>${esc(brandName())}: una semana clara, sin ruido.</h1><p>Planifica, revisa producción y sincroniza desde una interfaz pensada para navegador y PWA. El mismo estado se conserva entre vistas.</p><div class="v1221-hero-actions"><button class="primary" data-v1221-view="emulatorView">Construir semana</button><button data-v1221-view="calendarView">Ver calendario</button><button id="v1221HeroNew">＋ Nuevo contenido</button></div></div><div class="v1221-hero-side"><div class="v1221-metric"><b>${all.length}</b><span>Piezas en el plan</span></div><div class="v1221-metric"><b>${todayItems.length}</b><span>Hoy</span></div><div class="v1221-metric"><b>${done}</b><span>Completadas</span></div><div class="v1221-metric"><b>${cloud.key==='ok'?'✓':'•'}</b><span>${esc(cloud.label)}</span></div></div></section>
    <section class="v1221-grid"><article class="v1221-panel"><div class="v1221-panel-head"><div><small>SEMANA</small><h3>Distribución por día</h3></div><button data-v1221-view="emulatorView">Editar plan</button></div><div class="v1221-days">${days.map(d=>`<button class="v1221-day ${d===today?'today':''}" data-v1221-day="${d}"><span>${DAY_NAMES[d]}</span><b>${Array.isArray(p[d])?p[d].length:0}</b></button>`).join('')}</div></article><article class="v1221-panel"><div class="v1221-panel-head"><div><small>HOY</small><h3>Contenido en cola</h3></div><button data-v1221-view="agendaView">Agenda</button></div><div class="v1221-list">${todayItems.length?todayItems.slice(0,5).map(i=>`<article><b>${esc(i.title||'Contenido')}</b><small>${esc(i.type||i.lot||'Planificado')}</small></article>`).join(''):'<div class="v1221-empty">No hay piezas asignadas a hoy.</div>'}</div></article></section>
    <section class="v1221-panel"><div class="v1221-panel-head"><div><small>ACCIONES</small><h3>Trabajar sin buscar herramientas</h3></div></div><div class="v1221-quick"><button data-v1221-view="emulatorView"><b>Planificar semana</b><span>Agenda, tablero y matriz</span></button><button id="v1221QuickNew"><b>Nuevo contenido</b><span>Añadir a biblioteca</span></button><button id="v1221QuickSync"><b>Sincronizar</b><span>${esc(cloud.label)}</span></button><button id="v1221QuickSettings"><b>Cuenta y nube</b><span>Supabase y acceso</span></button></div></section>`;
  $('#v1221HeroNew').onclick=newContent;$('#v1221QuickNew').onclick=newContent;$('#v1221QuickSync').onclick=forceSync;$('#v1221QuickSettings').onclick=openSettings;
  $$('[data-v1221-day]',hub).forEach(b=>b.onclick=()=>{safeSet('editorialV1212SelectedDay',b.dataset.v1221Day);safeSet('editorialV1212PlannerView','agenda');navigate('emulatorView')});
}
function updateStatus(){
  const s=syncState();const pill=$('#v1221Sync');if(pill){pill.dataset.state=s.key;const label=pill.querySelector('span');if(label)label.textContent=s.label}
  const b=$('#v1221BrandName');if(b)b.textContent=brandName();
}
function updateActive(){
  const v=currentView();$$('[data-v1221-view]').forEach(b=>b.classList.toggle('active',b.dataset.v1221View===v));
}
function bindObservers(){
  if(observer)return;
  observer=new MutationObserver(()=>{clearTimeout(renderTimer);renderTimer=setTimeout(()=>{updateActive();updateStatus();if(currentView()==='homeView')renderHome()},60)});
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  const sync=$('#syncStatus');if(sync)new MutationObserver(updateStatus).observe(sync,{childList:true,subtree:true,attributes:true});
  const brand=$('#brandSelect');if(brand)brand.addEventListener('change',()=>{updateStatus();renderHome()});
  addEventListener('online',updateStatus,{passive:true});addEventListener('offline',updateStatus,{passive:true});
  document.addEventListener('editorial:rendered',()=>{renderHome();updateStatus()});
}
function applyMobilePlanner(){if(matchMedia('(max-width:899px)').matches&&!safeGet('editorialV1221PlannerApplied')){safeSet('editorialV1212PlannerView','agenda');safeSet('editorialV1221PlannerApplied','1')}}
function init(){setVersion();ensureCss();applyMobilePlanner();mountChrome();renderHome();updateActive();updateStatus();bindObservers();setInterval(updateStatus,5000);setTimeout(()=>{renderHome();updateActive()},500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
