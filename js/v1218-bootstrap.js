(function(){
  'use strict';
  var VERSION='12.21';
  var started=Date.now();
  var vendorTimer=null;
  var nativeDesktop=/EditorialOSDesktop/i.test(navigator.userAgent);
  function q(s){return document.querySelector(s)}
  function setVersion(){
    window.EDITORIAL_OS_VERSION=VERSION;
    document.documentElement.setAttribute('data-editorial-version',VERSION);
    document.title=document.title.replace(/V12\.(?:9|10|11|12|13|14|15|16|17|18|19|20)(?:\.\d+)?/g,'V'+VERSION);
    var brand=q('#brandTitle');
    if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10|11|12|13|14|15|16|17|18|19|20)(?:\.\d+)?/g,'V'+VERSION);
  }
  function loadWebShell(){
    if(nativeDesktop||q('script[data-editorial-v1221-web]'))return;
    if(!q('#v1221WebCss')){
      var l=document.createElement('link');l.id='v1221WebCss';l.rel='stylesheet';l.href='./css/v1221-web.css?v=12.21';document.head.appendChild(l);
    }
    var s=document.createElement('script');s.src='./js/v1221-web.js?v=12.21';s.defer=true;s.setAttribute('data-editorial-v1221-web','1');document.head.appendChild(s);
  }
  function dismissStaleStartupUi(){
    var blocker=q('#v1215Blocker.open');
    if(blocker)blocker.classList.remove('open');
    var progress=q('#v1215Progress');
    if(progress && Date.now()-started>3000)progress.classList.remove('show');
  }
  function loadAsync(src,test,name){
    if(test())return;
    var existing=q('script[data-v1221-vendor="'+name+'"]');
    if(existing)return;
    var s=document.createElement('script');s.src=src;s.async=true;s.setAttribute('data-v1221-vendor',name);
    s.onload=function(){window.dispatchEvent(new CustomEvent('editorial:vendor-ready',{detail:{name:name}}));};
    s.onerror=function(){console.info('Editorial OS: servicio opcional no disponible',name);};
    document.head.appendChild(s);
  }
  function ensureVendors(){
    loadAsync('./vendor/sortable.min.js?v=12.21',function(){return !!window.Sortable},'sortable');
    loadAsync('./vendor/supabase.min.js?v=12.21',function(){return !!window.supabase},'supabase');
  }
  function makeReady(){
    setVersion();
    document.documentElement.setAttribute('data-editorial-boot','ready');
    dismissStaleStartupUi();
    window.dispatchEvent(new CustomEvent('editorial:boot-ready',{detail:{version:VERSION}}));
    setTimeout(ensureVendors,650);
  }
  function watchCore(){
    var ticks=0;
    var timer=setInterval(function(){
      ticks++;setVersion();dismissStaleStartupUi();
      if(window.EDITORIAL_V123_API){clearInterval(timer);makeReady();return;}
      if(ticks===25){document.documentElement.setAttribute('data-editorial-boot','degraded');var home=q('#homeView');if(home)home.classList.add('active')}
      if(ticks>100)clearInterval(timer);
    },100);
  }
  function registerServiceWorker(){
    if(nativeDesktop||!('serviceWorker' in navigator))return;
    window.addEventListener('load',function(){setTimeout(function(){navigator.serviceWorker.register('./sw.js?v=12.21',{scope:'./'}).catch(function(){});},900);},{once:true});
  }
  function init(){
    setVersion();loadWebShell();watchCore();dismissStaleStartupUi();registerServiceWorker();
    window.addEventListener('editorial:need-vendors',ensureVendors);
    setTimeout(ensureVendors,1500);
    vendorTimer=setInterval(ensureVendors,9000);
    setTimeout(function(){clearInterval(vendorTimer);},30000);
    window.addEventListener('pageshow',function(){setTimeout(function(){dismissStaleStartupUi();loadWebShell();},50);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
