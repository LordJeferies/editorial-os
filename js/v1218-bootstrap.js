(function(){
  'use strict';
  var VERSION='12.18';
  var started=Date.now();
  var vendorTimer=null;
  function q(s){return document.querySelector(s)}
  function setVersion(){
    window.EDITORIAL_OS_VERSION=VERSION;
    document.documentElement.setAttribute('data-editorial-version',VERSION);
    document.title=document.title.replace(/V12\.(?:9|10|11|12|13|14|15|16|17)(?:\.\d+)?/g,'V'+VERSION);
    var brand=q('#brandTitle');
    if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10|11|12|13|14|15|16|17)(?:\.\d+)?/g,'V'+VERSION);
  }
  function dismissStaleStartupUi(){
    var blocker=q('#v1215Blocker.open');
    if(blocker)blocker.classList.remove('open');
    var progress=q('#v1215Progress');
    if(progress && Date.now()-started>7000)progress.classList.remove('show');
  }
  function loadAsync(src,test,name){
    if(test())return;
    var existing=document.querySelector('script[data-v1218-vendor="'+name+'"]');
    if(existing)return;
    var s=document.createElement('script');
    s.src=src;
    s.async=true;
    s.setAttribute('data-v1218-vendor',name);
    s.onload=function(){window.dispatchEvent(new CustomEvent('editorial:vendor-ready',{detail:{name:name}}));};
    s.onerror=function(){console.info('Editorial OS: vendor no disponible',name);};
    document.head.appendChild(s);
  }
  function ensureVendors(){
    loadAsync('https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js',function(){return !!window.Sortable},'sortable');
    loadAsync('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',function(){return !!window.supabase},'supabase');
  }
  function makeReady(){
    document.documentElement.setAttribute('data-editorial-boot','ready');
    dismissStaleStartupUi();
    window.dispatchEvent(new CustomEvent('editorial:boot-ready',{detail:{version:VERSION}}));
  }
  function watchCore(){
    var ticks=0;
    var timer=setInterval(function(){
      ticks++;
      dismissStaleStartupUi();
      if(window.EDITORIAL_V123_API){clearInterval(timer);makeReady();return;}
      if(ticks>80){clearInterval(timer);document.documentElement.setAttribute('data-editorial-boot','degraded');}
    },100);
  }
  function init(){
    setVersion();
    ensureVendors();
    vendorTimer=setInterval(ensureVendors,5000);
    setTimeout(function(){clearInterval(vendorTimer);},30000);
    watchCore();
    window.addEventListener('pageshow',function(){setTimeout(dismissStaleStartupUi,50);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
