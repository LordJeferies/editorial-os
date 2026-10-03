/* Editorial OS V12.8.2 · compatibility shim
   Historical V12.7 runtime attached visualViewport scroll, ResizeObserver and
   MutationObserver handlers. Those duplicated newer work and caused scroll jank.
   Responsive behavior now lives in CSS + v128-runtime.js.
*/
(() => {
  'use strict';
  const viewportWidth=()=>Math.round(window.visualViewport?.width||document.documentElement.clientWidth||window.innerWidth||0);
  function viewportBand(w=viewportWidth()){
    if(w<=399)return 'phone-compact';
    if(w<=432)return 'phone-standard';
    if(w<=480)return 'phone-large';
    if(w<900)return 'tablet-compact';
    return 'desktop';
  }
  function sync(){
    const w=viewportWidth();
    document.documentElement.dataset.v127Width=String(w);
    document.documentElement.dataset.v127Band=viewportBand(w);
    document.documentElement.classList.toggle('v127-phone',w<=480);
  }
  function fitFeed(){try{window.EDITORIAL_V128?.fitFeed?.()}catch(e){console.debug('V127 shim',e)}}
  sync();
  window.EDITORIAL_V127={sync,fitFeed,viewportWidth,viewportBand,compatibilityShim:true};
})();
