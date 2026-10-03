/* Editorial OS V12.7 · Studio Responsive runtime
   UI-only compatibility layer. Domain/data contracts remain in app-core.js.
   Uses the actual visual viewport (CSS points), not hardware pixels or UA names.
*/
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  let fitRAF=0;
  let feedObserver=null;
  let homeObserver=null;

  const viewportWidth=()=>Math.round(window.visualViewport?.width||document.documentElement.clientWidth||window.innerWidth||0);
  const isPhone=()=>viewportWidth()<=480;
  const api=()=>window.EDITORIAL_V123_API;

  function viewportBand(w=viewportWidth()){
    if(w<=399)return 'phone-compact';       // iPhone 14 Pro class ~393 CSS px
    if(w<=432)return 'phone-standard';      // iPhone 15 Plus class ~430 CSS px
    if(w<=480)return 'phone-large';         // iPhone 16 Pro Max class ~440 CSS px
    if(w<900)return 'tablet-compact';
    return 'desktop';
  }

  function syncViewport(){
    const w=viewportWidth();
    document.documentElement.dataset.v127Width=String(w);
    document.documentElement.dataset.v127Band=viewportBand(w);
    document.documentElement.style.setProperty('--v127-vw',`${w}px`);
    document.documentElement.classList.toggle('v127-phone',w<=480);
  }

  function resetLegacyFeedInline(shell){
    if(!shell)return;
    ['width','max-width','min-width','inline-size','max-inline-size','min-inline-size','transform','transform-origin'].forEach(p=>shell.style.removeProperty(p));
    if(shell.classList.contains('instagram-sim')){
      const grid=$('.ig-real-grid',shell);
      if(grid){
        ['width','max-width','min-width','grid-template-columns','grid-auto-columns','gap'].forEach(p=>grid.style.removeProperty(p));
        grid.style.setProperty('grid-template-columns','repeat(3,minmax(0,1fr))','important');
        grid.style.setProperty('grid-auto-columns','minmax(0,1fr)','important');
        grid.style.setProperty('gap','1px','important');
        $$('.ig-real-tile',grid).forEach(tile=>{
          ['width','max-width','min-width'].forEach(p=>tile.style.removeProperty(p));
          tile.style.setProperty('width','100%','important');
          tile.style.setProperty('max-width','100%','important');
          tile.style.setProperty('min-width','0','important');
        });
      }
    }
  }

  function unwrapDesktopStage(shell){
    const stage=shell?.parentElement;
    if(!stage?.classList?.contains('v127-desktop-preview-stage'))return;
    stage.parentNode.insertBefore(shell,stage);
    stage.remove();
    shell.style.removeProperty('transform');
    shell.style.removeProperty('transform-origin');
  }

  function fitDesktopPreview(shell,wrap){
    if(!shell||!wrap)return;
    let stage=shell.parentElement;
    if(!stage?.classList?.contains('v127-desktop-preview-stage')){
      stage=document.createElement('div');stage.className='v127-desktop-preview-stage';
      shell.parentNode.insertBefore(stage,shell);stage.appendChild(shell);
    }
    shell.style.setProperty('width','1050px','important');
    shell.style.setProperty('min-width','1050px','important');
    shell.style.setProperty('max-width','none','important');
    shell.style.setProperty('transform','none','important');
    const rawW=Math.max(1050,shell.scrollWidth||0,shell.getBoundingClientRect().width||0);
    const rawH=Math.max(1,shell.scrollHeight||0,shell.getBoundingClientRect().height||1);
    const available=Math.max(1,wrap.clientWidth);
    const scale=Math.min(1,available/rawW);
    shell.style.setProperty('transform-origin','top left','important');
    shell.style.setProperty('transform',`scale(${scale})`,'important');
    stage.style.height=`${Math.ceil(rawH*scale)}px`;
  }

  function fitFeed(){
    cancelAnimationFrame(fitRAF);
    fitRAF=requestAnimationFrame(()=>{
      syncViewport();
      const wrap=$('#feedsView .feed-sim-wrap');
      const shell=$('#feedsView .feed-device-shell');
      if(!wrap||!shell)return;
      const w=viewportWidth();
      if(w<=899){
        if(shell.classList.contains('device-desktop')){
          fitDesktopPreview(shell,wrap);
        }else{
          unwrapDesktopStage(shell);
          resetLegacyFeedInline(shell);
          shell.style.setProperty('width','100%','important');
          shell.style.setProperty('max-width','100%','important');
          shell.style.setProperty('min-width','0','important');
        }
      }else{
        unwrapDesktopStage(shell);
      }
      if(shell.classList.contains('instagram-sim')&&shell.classList.contains('device-mobile')){
        const grid=$('.ig-real-grid',shell);
        if(grid){
          grid.dataset.v127Viewport=String(w);
          grid.dataset.v127Client=String(grid.clientWidth);
          grid.style.setProperty('grid-template-columns','repeat(3,minmax(0,1fr))','important');
          grid.style.setProperty('grid-auto-columns','minmax(0,1fr)','important');
          const tiles=$$('.ig-real-tile',grid);
          tiles.forEach(tile=>{
            tile.style.setProperty('width','100%','important');
            tile.style.setProperty('min-width','0','important');
            tile.style.setProperty('max-width','100%','important');
          });
        }
      }
    });
  }

  function migrateStalePhoneFeedPreference(){
    if(!isPhone())return;
    const key='editorialV127FeedDeviceMigration';
    try{
      if(localStorage.getItem(key)==='1')return;
      const state=api()?.getState?.()?.state;
      if(state?.feedDevice==='desktop'){
        const auto=$('[data-feed-device="auto"]');
        if(auto){auto.click();window.v12Toast?.('Feed ajustado a Auto para iPhone. Puedes cambiarlo en Ajustes.');}
      }
      localStorage.setItem(key,'1');
    }catch(e){console.debug('V12.7 feed preference migration skipped',e)}
  }

  function labelDock(){
    const map={homeView:'Inicio',calendarView:'Calendario',emulatorView:'Plan',feedsView:'Feeds',inventoryView:'Biblioteca'};
    $$('#mobileDock .dockbtn[data-view]').forEach(btn=>{const b=$('b',btn);if(b&&map[btn.dataset.view])b.textContent=map[btn.dataset.view]});
  }

  function markStudioSlots(){
    $$('.home-kpi,.home-panel,.home-mini-card,.home-hero-card,.drawer-card').forEach(n=>n.dataset.slot=n.classList.contains('home-kpi')?'metric-card':'card');
    $$('.btn,.segbtn,.platformbtn,.v124-icon-button').forEach(n=>n.dataset.slot='button');
    $$('.v124-sheet,.v124-catalog-sheet').forEach(n=>n.dataset.slot='sheet');
  }

  function reorderHome(){
    if(viewportWidth()>899)return;
    const home=$('#homeView');if(!home)return;
    const header=$('.v124-view-header',home);
    const welcome=$('.home-welcome',home);
    const kpis=$('.home-kpis',home);
    const today=$('#v123Today',home);
    const dash=$('.home-dashboard-grid',home);
    const quick=$('.home-quick',home);
    const summary=$('#v124WeekSummary',home);
    // The original dashboard is the mobile home again. Remove only the duplicate
    // V12.4 summary block from the visual flow; no data or feature is removed.
    if(summary)summary.hidden=true;
    const nodes=[welcome,kpis,today,dash,quick].filter(Boolean);
    let cursor=header||home.firstElementChild;
    nodes.forEach(node=>{
      if(cursor?.nextSibling!==node)cursor?.parentNode?.insertBefore(node,cursor.nextSibling);
      cursor=node;
    });
  }

  function setupHomeObserver(){
    const home=$('#homeView');if(!home||homeObserver)return;
    homeObserver=new MutationObserver(()=>requestAnimationFrame(()=>{reorderHome();markStudioSlots()}));
    homeObserver.observe(home,{childList:true,subtree:false});
  }

  function setupFeedObserver(){
    feedObserver?.disconnect?.();
    const root=$('#feedRoot');
    if(root&&'ResizeObserver' in window){feedObserver=new ResizeObserver(fitFeed);feedObserver.observe(root)}
  }

  function sync(){
    syncViewport();labelDock();markStudioSlots();reorderHome();setupHomeObserver();setupFeedObserver();fitFeed();
    document.documentElement.dataset.editorialVersion='12.7';
  }

  function onViewportChange(){syncViewport();fitFeed();reorderHome()}
  window.visualViewport?.addEventListener('resize',onViewportChange,{passive:true});
  window.visualViewport?.addEventListener('scroll',fitFeed,{passive:true});
  window.addEventListener('resize',onViewportChange,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(onViewportChange,120),{passive:true});
  window.addEventListener('editorial:rendered',()=>requestAnimationFrame(sync));
  window.addEventListener('editorial:view',()=>requestAnimationFrame(sync));

  function boot(){
    migrateStalePhoneFeedPreference();sync();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

  window.EDITORIAL_V127={sync,fitFeed,viewportWidth,viewportBand};
})();
