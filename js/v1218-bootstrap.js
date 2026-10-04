(function(){
  'use strict';
  var VERSION='12.19';
  var started=Date.now();
  var vendorTimer=null;
  function q(s){return document.querySelector(s)}
  function setVersion(){
    window.EDITORIAL_OS_VERSION=VERSION;
    document.documentElement.setAttribute('data-editorial-version',VERSION);
    document.title=document.title.replace(/V12\.(?:9|10|11|12|13|14|15|16|17|18)(?:\.\d+)?/g,'V'+VERSION);
    var brand=q('#brandTitle');
    if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10|11|12|13|14|15|16|17|18)(?:\.\d+)?/g,'V'+VERSION);
  }
  function dismissStaleStartupUi(){
    var blocker=q('#v1215Blocker.open');
    if(blocker)blocker.classList.remove('open');
    var progress=q('#v1215Progress');
    if(progress && Date.now()-started>4500)progress.classList.remove('show');
  }
  function loadAsync(src,test,name){
    if(test())return;
    var existing=document.querySelector('script[data-v1219-vendor="'+name+'"]');
    if(existing)return;
    var s=document.createElement('script');
    s.src=src;
    s.async=true;
    s.setAttribute('data-v1219-vendor',name);
    s.onload=function(){window.dispatchEvent(new CustomEvent('editorial:vendor-ready',{detail:{name:name}}));};
    s.onerror=function(){console.info('Editorial OS: vendor opcional no disponible',name);};
    document.head.appendChild(s);
  }
  function ensureVendors(){
    loadAsync('https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js',function(){return !!window.Sortable},'sortable');
    loadAsync('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',function(){return !!window.supabase},'supabase');
  }
  function makeReady(){
    setVersion();
    document.documentElement.setAttribute('data-editorial-boot','ready');
    dismissStaleStartupUi();
    window.dispatchEvent(new CustomEvent('editorial:boot-ready',{detail:{version:VERSION}}));
    setTimeout(ensureVendors,250);
  }
  function watchCore(){
    var ticks=0;
    var timer=setInterval(function(){
      ticks++;
      setVersion();
      dismissStaleStartupUi();
      if(window.EDITORIAL_V123_API){clearInterval(timer);makeReady();return;}
      if(ticks===30){
        document.documentElement.setAttribute('data-editorial-boot','degraded');
        var home=q('#homeView');if(home)home.classList.add('active');
      }
      if(ticks>100){clearInterval(timer);}
    },100);
  }
  function refreshServiceWorker(){
    if(!('serviceWorker' in navigator))return;
    navigator.serviceWorker.getRegistrations().then(function(regs){regs.forEach(function(r){try{r.update();}catch(e){}});}).catch(function(){});
  }
  function init(){
    setVersion();
    watchCore();
    refreshServiceWorker();
    setTimeout(ensureVendors,1200);
    vendorTimer=setInterval(ensureVendors,7000);
    setTimeout(function(){clearInterval(vendorTimer);},30000);
    window.addEventListener('pageshow',function(){setTimeout(dismissStaleStartupUi,50);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
