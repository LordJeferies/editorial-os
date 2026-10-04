(function(){
  'use strict';
  var VERSION='12.20';
  var ua=navigator.userAgent||'';
  var ios=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var standalone=false;
  try{standalone=!!navigator.standalone||!!window.matchMedia('(display-mode: standalone)').matches;}catch(e){}

  document.documentElement.setAttribute('data-editorial-version',VERSION);
  document.documentElement.setAttribute('data-editorial-device',ios?'ios':'web');
  document.documentElement.setAttribute('data-editorial-standalone',standalone?'1':'0');
  window.EDITORIAL_OS_VERSION=VERSION;
  window.EDITORIAL_BOOT={version:VERSION,startedAt:Date.now(),ios:ios,standalone:standalone,phase:'core'};

  // iPhone defaults are applied only once. Existing user choices always win.
  try{
    if(ios&&localStorage.getItem('editorialV1212PlannerView')===null){
      localStorage.setItem('editorialV1212PlannerView','agenda');
    }
    if(ios&&localStorage.getItem('editorialV1212LibraryOpen')===null){
      localStorage.setItem('editorialV1212LibraryOpen','0');
    }
  }catch(e){}

  // V12.20 intentionally does not load Supabase or Sortable here.
  // The local interface must become interactive before optional services start.
  window.dispatchEvent(new CustomEvent('editorial:bootstrap',{detail:{version:VERSION,ios:ios,standalone:standalone}}));
})();
