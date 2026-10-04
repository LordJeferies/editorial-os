(function(){
  'use strict';
  var VERSION='12.21';
  var ua=navigator.userAgent||'';
  var nativeDesktop=/EditorialOSDesktop/i.test(ua);
  var ios=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var standalone=false;
  try{standalone=!!navigator.standalone||!!window.matchMedia('(display-mode: standalone)').matches;}catch(e){}

  document.documentElement.setAttribute('data-editorial-version',VERSION);
  document.documentElement.setAttribute('data-editorial-device',nativeDesktop?'desktop-app':(ios?'ios':'web'));
  document.documentElement.setAttribute('data-editorial-standalone',standalone?'1':'0');
  if(!nativeDesktop)document.documentElement.setAttribute('data-editorial-webshell','1');
  window.EDITORIAL_OS_VERSION=VERSION;
  window.EDITORIAL_BOOT={version:VERSION,startedAt:Date.now(),ios:ios,standalone:standalone,nativeDesktop:nativeDesktop,phase:'core'};

  try{
    var manifest=document.querySelector('link[rel="manifest"]');
    if(manifest)manifest.href='./manifest.webmanifest?v=12.21';
    var theme=document.querySelector('meta[name="theme-color"]');
    if(theme&&!nativeDesktop)theme.setAttribute('content','#f4f5f7');
    if(ios&&localStorage.getItem('editorialV1212PlannerView')===null)localStorage.setItem('editorialV1212PlannerView','agenda');
    if(ios&&localStorage.getItem('editorialV1212LibraryOpen')===null)localStorage.setItem('editorialV1212LibraryOpen','0');
  }catch(e){}

  if(!nativeDesktop){
    if(!document.getElementById('v1221WebCss')){
      var l=document.createElement('link');l.id='v1221WebCss';l.rel='stylesheet';l.href='./css/v1221-web.css?v=12.21';document.head.appendChild(l);
    }
    if(!document.querySelector('script[data-editorial-v1221-web]')){
      var s=document.createElement('script');s.src='./js/v1221-web.js?v=12.21';s.defer=true;s.setAttribute('data-editorial-v1221-web','1');document.head.appendChild(s);
    }
  }

  window.dispatchEvent(new CustomEvent('editorial:bootstrap',{detail:{version:VERSION,ios:ios,standalone:standalone,nativeDesktop:nativeDesktop}}));
})();
