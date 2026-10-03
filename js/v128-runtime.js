/* Editorial OS V12.8.2 · Stability Core
   Goals: predictable navigation, native document scrolling, lightweight sheets,
   and zero observer/resize loops. Domain/data logic remains in app-core.js.
*/
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const api=()=>window.EDITORIAL_V123_API;
  const compact=()=>Math.round(window.visualViewport?.width||window.innerWidth||0)<900;
  let resizeTimer=0;
  let lastFeedViewport=null;

  const ICON={
    back:'<svg viewBox="0 0 24 24" fill="none"><path d="m15 5-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    forward:'<svg viewBox="0 0 24 24" fill="none"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function syncViewport(){
    const vv=window.visualViewport;
    const w=Math.round(vv?.width||window.innerWidth||0);
    const h=Math.round(vv?.height||window.innerHeight||0);
    document.documentElement.style.setProperty('--v128-vvw',`${w}px`);
    document.documentElement.style.setProperty('--v128-vvh',`${h}px`);
    document.documentElement.dataset.v128Width=String(w);
    document.documentElement.dataset.v128Height=String(h);
    document.documentElement.dataset.editorialVersion='12.8.2';
  }

  function installHistoryControls(){
    if(!compact())return;
    const top=$('#v124MobileTopbar');
    if(!top||$('.v128-history-controls',top))return;
    const controls=document.createElement('div');
    controls.className='v128-history-controls';
    controls.innerHTML=`<button type="button" class="v124-icon-button v128-back v128-liquid-material" aria-label="Atrás">${ICON.back}</button><button type="button" class="v124-icon-button v128-forward v128-liquid-material" aria-label="Adelante">${ICON.forward}</button>`;
    top.insertBefore(controls,top.firstChild);
    $('.v128-back',controls)?.addEventListener('click',()=>{
      if(closeTopModal())return;
      if(history.length>1)history.back();
    });
    $('.v128-forward',controls)?.addEventListener('click',()=>history.forward());
  }

  function openLayers(){
    return [
      ...$$('.v124-sheet-layer.open'),
      ...$$('.v124-catalog-layer').filter(x=>x.getAttribute('aria-hidden')==='false'||x.classList.contains('open')),
      ...$$('.drawer-bg.open')
    ];
  }

  function cleanModalState(){
    if(openLayers().length)return;
    document.documentElement.classList.remove('v124-modal-open','v124-catalog-open','v128-modal-open');
    document.body.classList.remove('v128-modal-open');
    const sc=$('#appScroller');
    if(sc){
      sc.style.removeProperty('overflow');
      sc.style.removeProperty('pointer-events');
      sc.style.removeProperty('touch-action');
    }
  }

  function closeTopModal(){
    const layers=openLayers();
    if(!layers.length)return false;
    const layer=layers.at(-1);
    const close=$('.v124-sheet-close,.v124-sheet-cancel,#drawerClose,.close',layer);
    if(close)close.click();
    else{
      layer.classList.remove('open');
      layer.setAttribute('aria-hidden','true');
    }
    setTimeout(cleanModalState,0);
    return true;
  }

  function installModalSafety(){
    document.addEventListener('click',e=>{
      if(e.target.matches?.('.v124-sheet-layer,.v124-catalog-layer,#drawerBg')){
        const layer=e.target;
        const close=$('.v124-sheet-close,.v124-sheet-cancel,#drawerClose,.close',layer);
        close?.click();
        setTimeout(cleanModalState,0);
      }
    });
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&closeTopModal())e.preventDefault();
    });
  }

  function installNavigationFallback(){
    document.addEventListener('click',e=>{
      const el=e.target.closest?.('.dockbtn[data-view],.navbtn[data-view],[data-home-go]');
      if(!el)return;
      const view=el.dataset.view||el.dataset.homeGo;
      if(!view)return;
      setTimeout(()=>{
        const target=document.getElementById(view);
        if(target?.classList.contains('active'))return;
        try{api()?.navigate?.(view)}catch(err){console.error('Editorial navigation fallback',err)}
      },0);
    });
  }

  function fitFeed(){
    const shell=$('#feedsView .feed-device-shell.device-mobile');
    if(!shell)return;
    shell.style.setProperty('width','min(100%,430px)','important');
    shell.style.setProperty('max-width','430px','important');
    shell.style.setProperty('min-width','0','important');
    const viewport=$(':scope > .feed-device-viewport',shell);
    if(viewport){
      viewport.style.setProperty('width','100%','important');
      viewport.style.setProperty('max-width','100%','important');
      if(lastFeedViewport!==viewport){
        lastFeedViewport=viewport;
        viewport.addEventListener('scroll',()=>{
          shell.classList.toggle('v128-feed-scrolled',viewport.scrollTop>16);
        },{passive:true});
      }
    }
    const grid=$('.ig-real-grid',shell);
    if(grid){
      grid.style.setProperty('display','grid','important');
      grid.style.setProperty('grid-template-columns','repeat(3,minmax(0,1fr))','important');
      grid.style.setProperty('grid-auto-columns','minmax(0,1fr)','important');
      grid.style.setProperty('gap','1px','important');
      grid.style.setProperty('width','100%','important');
      grid.style.setProperty('max-width','100%','important');
      grid.style.setProperty('min-width','0','important');
      $$('.ig-real-tile',grid).forEach(tile=>{
        tile.style.setProperty('width','auto','important');
        tile.style.setProperty('min-width','0','important');
        tile.style.setProperty('max-width','none','important');
      });
    }
  }

  function decorateStableGlass(){
    $$('.v124-icon-button,.home-primary,.v124-plan-add,#mobileDock').forEach(x=>x.classList.add('v128-liquid-material'));
  }

  function repairStaleModalLocks(){
    setTimeout(cleanModalState,0);
  }

  function syncLightweight(){
    syncViewport();
    fitFeed();
    decorateStableGlass();
    repairStaleModalLocks();
  }

  function onResize(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(syncLightweight,120);
  }

  function boot(){
    syncViewport();
    installHistoryControls();
    installModalSafety();
    installNavigationFallback();
    decorateStableGlass();
    fitFeed();
    cleanModalState();
    document.documentElement.classList.add('editorial-interactive','v128-stable');
  }

  window.addEventListener('resize',onResize,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(syncLightweight,180),{passive:true});
  window.addEventListener('editorial:view',()=>requestAnimationFrame(()=>{fitFeed();cleanModalState()}));
  window.addEventListener('editorial:rendered',()=>requestAnimationFrame(fitFeed));

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.EDITORIAL_V128={
    sync:syncLightweight,
    syncGeometry:syncLightweight,
    closeTopModal,
    cleanModalState,
    fitFeed
  };
})();
