(function(){
  'use strict';
  var VERSION='12.21';
  var ua=navigator.userAgent||'';
  var nativeDesktop=/EditorialOSDesktop/i.test(ua);
  var started=Date.now();

  function q(s,r){return (r||document).querySelector(s)}
  function patchVersion(){
    window.EDITORIAL_OS_VERSION=VERSION;
    document.documentElement.setAttribute('data-editorial-version',VERSION);
    document.title=document.title.replace(/V12\.(?:9|10|11|12|13|14|15|16|17|18|19|20)(?:\.\d+)?/g,'V'+VERSION);
    var brand=q('#brandTitle');if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10|11|12|13|14|15|16|17|18|19|20)(?:\.\d+)?/g,'V'+VERSION);
  }
  function clearBlockingStartup(){
    var blocker=q('#v1215Blocker.open');if(blocker)blocker.classList.remove('open');
    var old=q('#v1217Recovery');if(old)old.style.display='none';
    if(Date.now()-started>1800){var p=q('#v1215Progress');if(p)p.classList.remove('show');}
  }
  function ready(test){try{return !!test()}catch(e){return false}}
  function loadScript(primary,fallback,test,name){
    return new Promise(function(resolve){
      if(ready(test)){resolve(true);return;}
      var existing=document.querySelector('script[data-v1221-vendor="'+name+'"]');
      if(existing){var ticks=0,t=setInterval(function(){ticks++;if(ready(test)||ticks>50){clearInterval(t);resolve(ready(test));}},100);return;}
      function attempt(src,isFallback){
        var s=document.createElement('script');s.src=src;s.async=true;s.setAttribute('data-v1221-vendor',name);s.setAttribute('data-source',isFallback?'cdn':'local');
        s.onload=function(){if(ready(test)){window.dispatchEvent(new CustomEvent('editorial:vendor-ready',{detail:{name:name,source:isFallback?'cdn':'local'}}));resolve(true)}else if(!isFallback)attempt(fallback,true);else resolve(false)};
        s.onerror=function(){if(!isFallback)attempt(fallback,true);else resolve(false)};
        document.head.appendChild(s);
      }
      attempt(primary,false);
    });
  }
  function loadVendors(){
    Promise.allSettled([
      loadScript('./vendor/sortable.min.js?v=12.21','https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js',function(){return !!window.Sortable},'sortable'),
      loadScript('./vendor/supabase.min.js?v=12.21','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',function(){return !!window.supabase},'supabase')
    ]).then(function(){
      try{if(window.supabase&&window.EDITORIAL_V123_API&&window.EDITORIAL_V123_API.forceSync)window.EDITORIAL_V123_API.forceSync()}catch(e){}
      window.dispatchEvent(new CustomEvent('editorial:services-ready',{detail:{supabase:!!window.supabase,sortable:!!window.Sortable}}));
    });
  }
  function scheduleVendors(){var run=loadVendors;if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:1200});else setTimeout(run,450)}
  function registerSW(){
    if(nativeDesktop||!('serviceWorker' in navigator))return;
    var run=function(){navigator.serviceWorker.register('./sw.js?v=12.21',{scope:'./',updateViaCache:'none'}).then(function(reg){try{reg.update()}catch(e){}}).catch(function(){})};
    if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:2500});else setTimeout(run,1400);
  }
  function init(){
    patchVersion();clearBlockingStartup();
    document.documentElement.setAttribute('data-editorial-boot','interactive');
    window.dispatchEvent(new CustomEvent('editorial:interactive',{detail:{version:VERSION,nativeDesktop:nativeDesktop}}));
    window.addEventListener('pageshow',clearBlockingStartup);
    window.addEventListener('online',scheduleVendors);
    setTimeout(clearBlockingStartup,800);setTimeout(clearBlockingStartup,2200);
    scheduleVendors();registerSW();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
