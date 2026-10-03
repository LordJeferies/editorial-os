/* Editorial OS V12.8.2 · compatibility shim
   Historical V12.6 runtime used ResizeObserver + repeated feed fitting.
   V12.8.2 centralizes UI fitting in v128-runtime.js to avoid duplicate observers.
*/
(() => {
  'use strict';
  function fitFeedShell(){
    try{window.EDITORIAL_V128?.fitFeed?.()}catch(e){console.debug('V126 shim',e)}
  }
  function sync(){fitFeedShell()}
  window.EDITORIAL_V126={fitFeedShell,sync,compatibilityShim:true};
})();
