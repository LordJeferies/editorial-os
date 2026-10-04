(function(){
  'use strict';
  var VERSION='12.20';
  var started=Date.now();
  var ios=/iPhone|iPad|iPod/i.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var standalone=false;
  try{standalone=!!navigator.standalone||!!window.matchMedia('(display-mode: standalone)').matches;}catch(e){}

  function q(s,r){return (r||document).querySelector(s)}
  function statusNode(){
    var el=q('#v1220Status');
    if(el)return el;
    el=document.createElement('div');
    el.id='v1220Status';
    el.setAttribute('data-state','ok');
    el.innerHTML='<span class="v1220-dot"></span><span class="v1220-status-text">Local listo</span>';
    document.body.appendChild(el);
    return el;
  }
  function setStatus(state,text){
    var el=statusNode();
    el.setAttribute('data-state',state||'ok');
    var t=q('.v1220-status-text',el);if(t)t.textContent=text||'Local listo';
  }
  function addCss(){
    if(q('#v1220Css'))return;
    var l=document.createElement('link');l.id='v1220Css';l.rel='stylesheet';l.href='./css/v1220.css?v=12.20';document.head.appendChild(l);
  }
  function patchVersion(){
    window.EDITORIAL_OS_VERSION=VERSION;
    document.documentElement.setAttribute('data-editorial-version',VERSION);
    document.documentElement.setAttribute('data-editorial-device',ios?'ios':'web');
    document.documentElement.setAttribute('data-editorial-standalone',standalone?'1':'0');
    document.title=document.title.replace(/V12\.(?:9|10|11|12|13|14|15|16|17|18|19)(?:\.\d+)?/g,'V'+VERSION);
    var brand=q('#brandTitle');if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10|11|12|13|14|15|16|17|18|19)(?:\.\d+)?/g,'V'+VERSION);
  }
  function clearBlockingStartup(){
    var blocker=q('#v1215Blocker.open');if(blocker)blocker.classList.remove('open');
    var old=q('#v1217Recovery');if(old)old.style.display='none';
    if(Date.now()-started>2500){var p=q('#v1215Progress');if(p)p.classList.remove('show');}
  }
  function vendorReady(test){try{return !!test()}catch(e){return false}}
  function loadScript(primary,fallback,test,name){
    return new Promise(function(resolve){
      if(vendorReady(test)){resolve(true);return;}
      var old=document.querySelector('script[data-v1220-vendor="'+name+'"]');
      if(old){
        var tries=0,t=setInterval(function(){tries++;if(vendorReady(test)||tries>40){clearInterval(t);resolve(vendorReady(test));}},100);return;
      }
      function attempt(src,isFallback){
        var s=document.createElement('script');s.src=src;s.async=true;s.setAttribute('data-v1220-vendor',name);s.setAttribute('data-source',isFallback?'cdn':'local');
        s.onload=function(){
          var ok=vendorReady(test);
          if(ok){window.dispatchEvent(new CustomEvent('editorial:vendor-ready',{detail:{name:name,source:isFallback?'cdn':'local'}}));resolve(true);}
          else if(!isFallback)attempt(fallback,true);else resolve(false);
        };
        s.onerror=function(){if(!isFallback)attempt(fallback,true);else resolve(false);};
        document.head.appendChild(s);
      }
      attempt(primary,false);
    });
  }
  function loadVendors(){
    setStatus(navigator.onLine===false?'offline':'sync',navigator.onLine===false?'Local listo · sin conexión':'Local listo · conectando servicios…');
    Promise.allSettled([
      loadScript('./vendor/sortable.min.js?v=12.20','https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js',function(){return !!window.Sortable},'sortable'),
      loadScript('./vendor/supabase.min.js?v=12.20','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',function(){return !!window.supabase},'supabase')
    ]).then(function(){
      if(navigator.onLine===false){setStatus('offline','Local listo · offline');return;}
      if(window.supabase){setStatus('ok','Local listo · nube disponible');}
      else setStatus('warn','Local listo · nube pendiente');
      try{window.EDITORIAL_V123_API&&window.EDITORIAL_V123_API.forceSync&&window.EDITORIAL_V123_API.forceSync();}catch(e){}
      window.dispatchEvent(new CustomEvent('editorial:services-ready',{detail:{supabase:!!window.supabase,sortable:!!window.Sortable}}));
    });
  }
  function scheduleVendors(){
    var run=function(){loadVendors()};
    if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:1400});
    else setTimeout(run,500);
  }
  function registerSW(){
    if(!('serviceWorker' in navigator))return;
    var run=function(){navigator.serviceWorker.register('./sw.js?v=12.20',{scope:'./',updateViaCache:'none'}).then(function(reg){try{reg.update()}catch(e){}}).catch(function(e){console.info('Editorial OS: SW no disponible',e&&e.message);});};
    if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:3500});else setTimeout(run,2200);
  }
  function repairPwa(){
    if(!confirm('¿Reparar la caché técnica de Editorial OS? Tus contenidos locales y los datos de Supabase no se borrarán.'))return;
    setStatus('sync','Reparando caché técnica…');
    Promise.resolve().then(async function(){
      try{
        if('serviceWorker' in navigator){var regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.filter(function(r){return String(r.scope||'').indexOf('/editorial-os/')!==-1;}).map(function(r){return r.unregister();}));}
        if(window.caches&&caches.keys){var keys=await caches.keys();await Promise.all(keys.filter(function(k){return /^editorial-os-/i.test(k);}).map(function(k){return caches.delete(k);}));}
      }catch(e){}
      location.replace('./?v=12.20&repaired='+Date.now());
    });
  }
  function installHelp(){
    var body=q('#v1213Settings .v1213-body');
    if(!body||q('#v1220MobileHelp'))return;
    var box=document.createElement('section');box.id='v1220MobileHelp';box.className='v1220-mobile-help';
    box.innerHTML='<b>iPhone / PWA</b><p>La app abre primero en local y conecta Supabase después. Para instalar: abre Editorial OS en Safari → Compartir → Añadir a pantalla de inicio.</p><div class="v1220-help-actions"><button type="button" class="primary" id="v1220CopyLink">Copiar link iPhone</button><button type="button" id="v1220Repair">Reparar caché técnica</button></div>';
    body.appendChild(box);
    q('#v1220Repair',box).onclick=repairPwa;
    q('#v1220CopyLink',box).onclick=function(){
      var url=location.origin+location.pathname.replace(/[^/]*$/,'')+'?iphone=1&v=12.20';
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(function(){setStatus('ok','Link iPhone copiado');});
      else{var t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();setStatus('ok','Link iPhone copiado');}
    };
  }
  function watchSettings(){
    installHelp();
    new MutationObserver(function(){installHelp();}).observe(document.body,{childList:true,subtree:true});
  }
  function networkState(){
    if(navigator.onLine===false)setStatus('offline','Local listo · offline');
    else if(window.supabase)setStatus('ok','Local listo · nube disponible');
    else setStatus('ok','Local listo');
  }
  function makeInteractive(){
    clearBlockingStartup();
    document.documentElement.setAttribute('data-editorial-boot','interactive');
    setStatus(navigator.onLine===false?'offline':'ok',navigator.onLine===false?'Local listo · offline':'Local listo');
    window.dispatchEvent(new CustomEvent('editorial:interactive',{detail:{version:VERSION,ios:ios,standalone:standalone}}));
  }
  function init(){
    addCss();patchVersion();statusNode();clearBlockingStartup();watchSettings();
    window.addEventListener('online',function(){setStatus('sync','Conexión recuperada · sincronizando…');scheduleVendors();});
    window.addEventListener('offline',networkState);
    window.addEventListener('pageshow',function(){clearBlockingStartup();networkState();});
    setTimeout(makeInteractive,80);
    setTimeout(clearBlockingStartup,900);
    setTimeout(clearBlockingStartup,2600);
    scheduleVendors();
    registerSW();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
