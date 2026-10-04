(()=>{
'use strict';
const VERSION='12.20';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent)||((navigator.platform==='MacIntel'||navigator.platform==='MacPPC')&&navigator.maxTouchPoints>1);
const mobile=matchMedia('(max-width:899px)').matches;
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const APP_URL='https://lordjeferies.github.io/editorial-os/';
let syncObserver=null;

function safeGet(k){try{return localStorage.getItem(k)}catch{return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch{}}
function setVersion(){
  window.EDITORIAL_OS_VERSION=VERSION;
  document.documentElement.dataset.editorialVersion=VERSION;
  document.title=document.title.replace(/V12\.(?:9|10|11|12|13|14|15|16|17|18|19)(?:\.\d+)?/g,`V${VERSION}`);
  const brand=$('#brandTitle');
  if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10|11|12|13|14|15|16|17|18|19)(?:\.\d+)?/g,`V${VERSION}`);
}
function forceNonBlocking(){
  const blocker=$('#v1215Blocker');
  if(blocker){blocker.classList.remove('open');blocker.setAttribute('aria-hidden','true')}
  const progress=$('#v1215Progress');
  if(progress&&Date.now()-(window.__editorialBootStarted||Date.now())>8000)progress.classList.remove('show');
}
function installMobileDefaults(){
  if(!mobile)return;
  document.documentElement.dataset.editorialMobile='1';
  if(ios)document.documentElement.dataset.editorialIos='1';
  if(standalone)document.documentElement.dataset.editorialStandalone='1';
  if(!safeGet('editorialV1220PlannerDefaultApplied')){
    safeSet('editorialV1212PlannerView','agenda');
    safeSet('editorialV1220PlannerDefaultApplied','1');
  }
}
function cloudState(){
  if(!navigator.onLine)return {key:'offline',label:'Sin internet'};
  const sync=$('#syncStatus');
  const txt=(sync?.textContent||'').trim().toLowerCase();
  const cls=sync?.className||'';
  if(/error|fall|conflict|offline/.test(txt+' '+cls))return {key:'error',label:'Nube con problema'};
  if(/sync|subiendo|bajando|guardando|conectando/.test(txt+' '+cls))return {key:'sync',label:'Nube sincronizando'};
  if(/conect|online|sincronizado|actualizado|cloud/.test(txt+' '+cls))return {key:'ok',label:'Nube lista'};
  if(window.supabase)return {key:'sync',label:'Nube disponible'};
  return {key:'idle',label:'Local listo'};
}
function updateSystemStrip(){
  const strip=$('#v1220SystemStrip');
  if(!strip)return;
  const cloud=cloudState();
  strip.dataset.cloud=cloud.key;
  const cloudLabel=$('#v1220CloudLabel');if(cloudLabel)cloudLabel.textContent=cloud.label;
  const mode=$('#v1220ModeLabel');if(mode)mode.textContent=standalone?'App iPhone':'Safari';
}
function mountSystemStrip(){
  if(!mobile||$('#v1220SystemStrip'))return;
  const strip=document.createElement('div');
  strip.id='v1220SystemStrip';
  strip.innerHTML=`<div class="v1220-statuses"><span class="v1220-pill"><i class="v1220-dot"></i><span>Local listo</span></span><span class="v1220-pill"><i class="v1220-dot cloud"></i><span id="v1220CloudLabel">Comprobando nube…</span></span><span class="v1220-pill"><span id="v1220ModeLabel">${standalone?'App iPhone':'Safari'}</span></span></div><button type="button" id="v1220StatusBtn">Estado</button>`;
  const root=$('#glassRoot')||document.body;
  root.insertBefore(strip,root.firstChild);
  $('#v1220StatusBtn').addEventListener('click',()=>openSheet('status'));
  updateSystemStrip();
  const sync=$('#syncStatus');
  if(sync){syncObserver=new MutationObserver(updateSystemStrip);syncObserver.observe(sync,{childList:true,subtree:true,attributes:true})}
  addEventListener('online',updateSystemStrip,{passive:true});
  addEventListener('offline',updateSystemStrip,{passive:true});
  addEventListener('editorial:vendor-ready',updateSystemStrip);
  setInterval(updateSystemStrip,5000);
}
function ensureSheet(){
  if($('#v1220MobileSheet'))return $('#v1220MobileSheet');
  const wrap=document.createElement('div');
  wrap.id='v1220MobileSheet';
  wrap.innerHTML=`<section class="v1220-sheet" role="dialog" aria-modal="true"><div class="v1220-grab"></div><div id="v1220SheetBody"></div></section>`;
  document.body.appendChild(wrap);
  wrap.addEventListener('click',e=>{if(e.target===wrap)closeSheet()});
  return wrap;
}
function closeSheet(){ensureSheet().classList.remove('open')}
async function copyLink(){
  try{await navigator.clipboard.writeText(APP_URL);toast('Link copiado')}catch{const t=document.createElement('textarea');t.value=APP_URL;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();toast('Link copiado')}
}
async function shareLink(){
  if(navigator.share){try{await navigator.share({title:'Editorial OS',url:APP_URL});return}catch(e){if(e?.name==='AbortError')return}}
  await copyLink();
}
function openSheet(type){
  const wrap=ensureSheet(),body=$('#v1220SheetBody');
  const cloud=cloudState();
  if(type==='install'){
    body.innerHTML=`<h2>Instalar en iPhone</h2><p>Editorial OS funciona mejor desde el icono de la pantalla de inicio. Safari debe añadir la app una sola vez.</p><div class="v1220-sheet-actions"><button class="primary" id="v1220Share">Compartir / instalar</button><button class="secondary" id="v1220Copy">Copiar link</button><button class="secondary" id="v1220Close">Cerrar</button></div><p style="margin-top:14px"><b>Safari → Compartir → Añadir a pantalla de inicio.</b><br>Si Compartir no responde, copia el link, abre una pestaña nueva en Safari y vuelve a intentarlo desde ahí.</p>`;
    $('#v1220Share').onclick=shareLink;$('#v1220Copy').onclick=copyLink;$('#v1220Close').onclick=closeSheet;
  }else{
    body.innerHTML=`<h2>Estado de Editorial OS</h2><p><b>Local:</b> listo.<br><b>Nube:</b> ${cloud.label}.<br><b>Modo:</b> ${standalone?'PWA instalada':'Safari'}.</p><div class="v1220-sheet-actions"><button class="primary" id="v1220RetryCloud">Reintentar nube</button><button class="secondary" id="v1220Copy">Copiar link</button><a class="danger-soft" href="./repair.html?v=12.20">Reparar caché técnica</a><button class="secondary" id="v1220Close">Cerrar</button></div><p style="margin-top:14px">La reparación sólo limpia caché/Service Worker. No borra tu plan editorial ni tus datos de Supabase.</p>`;
    $('#v1220RetryCloud').onclick=()=>{window.dispatchEvent(new CustomEvent('editorial:need-vendors'));window.EDITORIAL_V123_API?.forceSync?.();updateSystemStrip();toast('Reintentando nube')};
    $('#v1220Copy').onclick=copyLink;$('#v1220Close').onclick=closeSheet;
  }
  wrap.classList.add('open');
}
function toast(text){
  let el=$('#v1220Toast');
  if(!el){el=document.createElement('div');el.id='v1220Toast';el.style.cssText='position:fixed;left:50%;bottom:calc(92px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(12px);z-index:40000;background:rgba(20,22,28,.92);color:#fff;padding:10px 14px;border-radius:999px;font:700 12px/1 -apple-system,BlinkMacSystemFont,system-ui;opacity:0;transition:.18s ease;pointer-events:none;white-space:nowrap';document.body.appendChild(el)}
  el.textContent=text;el.style.opacity='1';el.style.transform='translateX(-50%) translateY(0)';clearTimeout(el._t);el._t=setTimeout(()=>{el.style.opacity='0';el.style.transform='translateX(-50%) translateY(12px)'},1500)
}
function mountInstallCard(){
  if(!mobile||standalone||$('#v1220InstallCard'))return;
  const quick=$('#homeView .home-quick-actions');
  if(quick){
    const card=document.createElement('div');card.id='v1220InstallCard';card.className='v1220-install-card';card.innerHTML='<b>Usar como app en iPhone</b><small>Más estable y cómoda desde la pantalla de inicio. La app abre primero en local y sincroniza después.</small><button type="button">Instalar / instrucciones</button>';card.querySelector('button').onclick=()=>openSheet('install');quick.parentElement?.appendChild(card);return;
  }
}
function applyPlannerMobileDefault(){
  if(!mobile)return;
  const desired=safeGet('editorialV1212PlannerView');
  if(desired!=='agenda')return;
  const btn=$('[data-v1212-view="agenda"]');
  if(btn&&!btn.classList.contains('active'))btn.click();
}
function routeFromQuery(){
  const p=new URLSearchParams(location.search);const go=p.get('go');
  if(!go)return;
  const map={home:'homeView',calendar:'calendarView',emulator:'emulatorView',agenda:'agendaView',feeds:'feedsView',library:'inventoryView'};
  const id=map[go];if(!id)return;
  const b=$(`[data-view="${id}"]`)||$(`[data-home-go="${id}"]`);if(b)setTimeout(()=>b.click(),250);
}
function registerServiceWorker(){
  if(!('serviceWorker' in navigator))return;
  addEventListener('load',()=>setTimeout(()=>navigator.serviceWorker.register('./sw.js?v=12.20',{scope:'./'}).catch(()=>{}),1400),{once:true});
}
function progressiveEnhance(){
  let tries=0;const t=setInterval(()=>{
    tries++;forceNonBlocking();mountSystemStrip();mountInstallCard();applyPlannerMobileDefault();setVersion();
    if(tries>80)clearInterval(t);
  },150);
}
function init(){
  window.__editorialBootStarted=window.__editorialBootStarted||Date.now();
  setVersion();installMobileDefaults();forceNonBlocking();mountSystemStrip();mountInstallCard();applyPlannerMobileDefault();routeFromQuery();registerServiceWorker();progressiveEnhance();
  new MutationObserver(()=>{forceNonBlocking();mountSystemStrip();mountInstallCard();applyPlannerMobileDefault();updateSystemStrip()}).observe(document.body,{childList:true,subtree:true});
  addEventListener('pageshow',()=>{forceNonBlocking();updateSystemStrip()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
