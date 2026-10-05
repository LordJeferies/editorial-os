(function(){
'use strict';

var VERSION='12.23';
var nativeDesktop=/EditorialOSDesktop/i.test(navigator.userAgent||'');
var errors=[];
var CORE=[
  ['./js/v123-data.js','v123-data'],
  ['./js/v123-sync.js','v123-sync'],
  ['./js/v123-storage.js','v123-storage'],
  ['./js/app-core.js','app-core'],
  ['./js/v12-runtime.js','v12-runtime'],
  ['./js/v124-store.js','v124-store'],
  ['./js/v124-runtime.js','v124-runtime'],
  ['./js/v126-runtime.js','v126-runtime'],
  ['./js/v127-runtime.js','v127-runtime'],
  ['./js/v128-runtime.js','v128-runtime'],
  ['./js/v129-runtime.js','v129-runtime'],
  ['./js/v1212-runtime.js','v1212-runtime']
];

window.EDITORIAL_BOOT={version:VERSION,phase:'starting',startedAt:Date.now(),nativeDesktop:nativeDesktop,errors:errors};

function q(s,r){return (r||document).querySelector(s)}
function setVersion(){
  window.EDITORIAL_OS_VERSION=VERSION;
  document.documentElement.dataset.editorialVersion=VERSION;
  document.title=document.title.replace(/V12\.\d+(?:\.\d+)?/g,'V'+VERSION);
  var brand=q('#brandTitle');
  if(brand)brand.textContent=brand.textContent.replace(/V12\.\d+(?:\.\d+)?/g,'V'+VERSION);
}
function clearLegacyBootUI(){
  q('#v1215Blocker')?.classList.remove('open');
  q('#v1215Progress')?.classList.remove('show','error');
  var recovery=q('#v1217Recovery');if(recovery)recovery.style.display='none';
}
function loadScript(src,key,opts){
  opts=opts||{};
  return new Promise(function(resolve){
    if(q('script[data-editorial-module="'+key+'"]')){resolve(true);return}
    var s=document.createElement('script');s.src=src+'?v=12.23';s.async=false;s.dataset.editorialModule=key;if(opts.module)s.type='module';
    var done=false;
    function finish(ok){if(done)return;done=true;clearTimeout(timer);if(!ok)errors.push({module:key,src:src});resolve(ok)}
    var timer=setTimeout(function(){console.warn('Editorial OS: timeout',key);finish(false)},7000);
    s.onload=function(){finish(true)};s.onerror=function(){console.error('Editorial OS: fallo cargando',key);finish(false)};
    document.body.appendChild(s);
  });
}
async function cleanDesktopCaches(){
  if(!nativeDesktop)return false;
  try{
    var regs=await navigator.serviceWorker?.getRegistrations?.()||[];
    if(regs.length)await Promise.all(regs.map(function(r){return r.unregister()}));
    if(window.caches){var keys=await caches.keys();await Promise.all(keys.filter(function(k){return /^editorial-os-/i.test(k)}).map(function(k){return caches.delete(k)}))}
    if((regs.length||sessionStorage.getItem('editorialOsDesktopCacheClean')!=='1')&&!sessionStorage.getItem('editorialOsDesktopReloaded1223')){
      sessionStorage.setItem('editorialOsDesktopCacheClean','1');
      sessionStorage.setItem('editorialOsDesktopReloaded1223','1');
      location.reload();
      return true;
    }
  }catch(e){console.info('Editorial OS: limpieza Desktop no disponible',e)}
  return false;
}
function ensureWebShell(){
  if(nativeDesktop)return Promise.resolve(true);
  if(!q('#v1221WebCss')){var l=document.createElement('link');l.id='v1221WebCss';l.rel='stylesheet';l.href='./css/v1221-web.css?v=12.23';document.head.appendChild(l)}
  return loadScript('./js/v1221-web.js','v1221-web');
}
function loadVendor(local,cdn,test,key){
  if(test())return Promise.resolve(true);
  return new Promise(function(resolve){
    function attempt(src,fallback){var s=document.createElement('script');s.src=src;s.async=true;s.dataset.editorialVendor=key;s.onload=function(){if(test())resolve(true);else if(!fallback)attempt(cdn,true);else resolve(false)};s.onerror=function(){if(!fallback)attempt(cdn,true);else resolve(false)};document.head.appendChild(s)}
    attempt(local,false);
  });
}
function loadServices(){
  Promise.allSettled([
    loadVendor('./vendor/sortable.min.js?v=12.23','https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js',function(){return !!window.Sortable},'sortable'),
    loadVendor('./vendor/supabase.min.js?v=12.23','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',function(){return !!window.supabase},'supabase')
  ]).then(function(){
    window.dispatchEvent(new CustomEvent('editorial:services-ready',{detail:{sortable:!!window.Sortable,supabase:!!window.supabase}}));
    try{if(window.supabase&&window.EDITORIAL_V123_API?.forceSync)window.EDITORIAL_V123_API.forceSync()}catch(e){}
  });
}
function scheduleServices(){if('requestIdleCallback'in window)requestIdleCallback(loadServices,{timeout:1800});else setTimeout(loadServices,700)}
async function registerSW(){
  if(nativeDesktop||!('serviceWorker'in navigator))return;
  try{var reg=await navigator.serviceWorker.register('./sw.js?v=12.23',{scope:'./',updateViaCache:'none'});reg.update?.()}catch(e){console.info('Editorial OS: Service Worker no disponible',e)}
}
function markReady(){
  setVersion();clearLegacyBootUI();
  var ok=!!window.EDITORIAL_V123_API;
  window.EDITORIAL_BOOT.phase=ok?'ready':'degraded';document.documentElement.dataset.editorialBoot=ok?'ready':'degraded';
  window.dispatchEvent(new CustomEvent(ok?'editorial:boot-ready':'editorial:boot-degraded',{detail:{version:VERSION,errors:errors.slice()}}));
}
async function boot(){
  setVersion();clearLegacyBootUI();document.documentElement.dataset.editorialBoot='interactive';window.EDITORIAL_BOOT.phase='interactive';
  if(await cleanDesktopCaches())return;
  for(var i=0;i<CORE.length;i++){await loadScript(CORE[i][0],CORE[i][1]);clearLegacyBootUI()}
  if(!window.EDITORIAL_V123_API){errors.push({module:'app-core',reason:'EDITORIAL_V123_API missing'});markReady();return}
  await ensureWebShell();setVersion();
  loadScript('./js/v12-glass.js','v12-glass',{module:true});
  scheduleServices();markReady();registerSW();
  if(nativeDesktop){window.addEventListener('load',function(){setTimeout(function(){navigator.serviceWorker?.getRegistrations?.().then(function(rs){rs.forEach(function(r){r.unregister()})})},800)},{once:true})}
}
window.addEventListener('pageshow',function(){setVersion();clearLegacyBootUI()});
window.addEventListener('error',function(e){if(window.EDITORIAL_BOOT?.phase!=='ready')errors.push({type:'runtime',message:String(e.message||'runtime error')})});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
