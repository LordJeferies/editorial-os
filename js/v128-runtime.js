/* Editorial OS V12.8 · iOS polish / stable detents / viewport geometry */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const api=()=>window.EDITORIAL_V123_API;
  const isCompact=()=>Math.round(window.visualViewport?.width||window.innerWidth||0)<900;
  let geometryRAF=0;
  let lastFeedViewport=null;

  const ICON={
    back:'<svg viewBox="0 0 24 24" fill="none"><path d="m15 5-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    forward:'<svg viewBox="0 0 24 24" fill="none"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function visual(){
    const vv=window.visualViewport;
    return {w:Math.round(vv?.width||window.innerWidth||0),h:Math.round(vv?.height||window.innerHeight||0),top:Math.max(0,Math.round(vv?.offsetTop||0))};
  }
  function syncGeometry(){
    cancelAnimationFrame(geometryRAF);
    geometryRAF=requestAnimationFrame(()=>{
      const {w,h,top}=visual(),root=document.documentElement;
      root.style.setProperty('--v128-vvh',`${h}px`);root.style.setProperty('--v128-vvw',`${w}px`);root.style.setProperty('--v128-vv-top',`${top}px`);
      root.dataset.v128Width=String(w);root.dataset.v128Height=String(h);root.dataset.editorialVersion='12.8';
      if(!isCompact())return;
      const topbar=$('#v124MobileTopbar'),dock=$('#dockGlassRoot');
      const tr=topbar?.getBoundingClientRect(),dr=dock?.getBoundingClientRect();
      const contentTop=tr?Math.max(0,Math.ceil(tr.bottom)):Math.max(62,top+62);
      const contentBottom=dr?Math.max(64,Math.ceil(h-dr.top)):74;
      root.style.setProperty('--v128-content-top',`${contentTop}px`);root.style.setProperty('--v128-content-bottom',`${contentBottom}px`);
      const openSheet=$('.v124-sheet-layer.open .v124-sheet,.v124-catalog-layer[aria-hidden="false"] .v124-catalog-sheet,#drawerBg.open .drawer');
      if(openSheet)constrainSheet(openSheet);
      fitFeedViewport();
    });
  }

  function installHistoryControls(){
    const top=$('#v124MobileTopbar');if(!top||$('.v128-history-controls',top))return;
    const controls=document.createElement('div');controls.className='v128-history-controls';
    controls.innerHTML=`<button type="button" class="v124-icon-button v128-back v128-liquid-material" aria-label="Atrás">${ICON.back}</button><button type="button" class="v124-icon-button v128-forward v128-liquid-material" aria-label="Adelante">${ICON.forward}</button>`;
    top.insertBefore(controls,top.firstChild);
    const back=$('.v128-back',controls),forward=$('.v128-forward',controls);
    back.addEventListener('click',()=>{if(closeTopModal())return;history.back()});
    forward.addEventListener('click',()=>history.forward());
    const sync=()=>{
      // History API doesn't expose forward length. Keep forward visually available
      // after a popstate and disable it again after a new navigation.
      back.disabled=history.length<=1;
    };
    window.addEventListener('popstate',()=>{forward.disabled=false;setTimeout(sync,0)});
    window.addEventListener('editorial:view',()=>{forward.disabled=true;sync()});
    forward.disabled=true;sync();
  }

  function openLayers(){
    return [
      ...$$('.v124-sheet-layer.open'),
      ...$$('.v124-catalog-layer').filter(x=>x.getAttribute('aria-hidden')==='false'||x.classList.contains('open')),
      ...$$('.drawer-bg.open')
    ];
  }
  function closeTopModal(){
    const layers=openLayers();if(!layers.length)return false;
    const layer=layers.at(-1);
    const close=$('.v124-sheet-close,.v124-sheet-cancel,#drawerClose,.close',layer);
    if(close){close.click()}else{layer.classList.remove('open');layer.setAttribute('aria-hidden','true')}
    setTimeout(cleanModalState,20);return true;
  }
  function cleanModalState(){
    const any=openLayers().length>0;
    if(!any){
      document.documentElement.classList.remove('v124-modal-open','v124-catalog-open','v128-modal-open');
      const sc=$('#appScroller');if(sc){sc.style.removeProperty('overflow');sc.style.removeProperty('pointer-events')}
      $$('.v124-sheet,.v124-catalog-sheet,#drawerBg .drawer').forEach(s=>{s.style.removeProperty('transform');s.classList.remove('v128-dragging')});
    }else document.documentElement.classList.add('v128-modal-open');
  }

  function prepareDrawer(){
    const drawer=$('#drawerBg .drawer');if(!drawer||drawer.dataset.v128Upgraded)return;
    drawer.dataset.v128Upgraded='1';
    const head=$('.drawer-head',drawer),actions=$('.drawer-actions',drawer);
    const grab=document.createElement('div');grab.className='v128-drawer-grabber';grab.setAttribute('role','button');grab.setAttribute('aria-label','Redimensionar ficha');drawer.insertBefore(grab,drawer.firstChild);
    const scroll=document.createElement('div');scroll.className='v128-drawer-scroll';
    const movable=[...drawer.children].filter(n=>n!==grab&&n!==head&&n!==actions);
    movable.forEach(n=>scroll.appendChild(n));drawer.insertBefore(scroll,actions);
    const cards=$$('.drawer-card',scroll);if(cards.length>=2){const summary=document.createElement('div');summary.className='v128-detail-summary';cards[0].parentNode.insertBefore(summary,cards[0]);summary.append(cards[0],cards[1])}
    attachDetents($('#drawerBg'),drawer,grab,{initial:.84,medium:.58,large:.94,close:()=>$('#drawerClose')?.click()});
    const bg=$('#drawerBg');bg.addEventListener('pointerdown',e=>{if(e.target===bg)$('#drawerClose')?.click()});
    $('#drawerClose')?.addEventListener('click',()=>setTimeout(cleanModalState,0));
  }

  function constrainSheet(sheet){
    const {h}=visual();
    const max=Math.max(320,h-Math.max(8,parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--v128-vv-top'))||0)-8);
    sheet.style.maxHeight=`${max}px`;
  }

  function attachDetents(layer,sheet,handle,opts={}){
    if(!layer||!sheet||!handle||sheet.dataset.v128Detents)return;
    sheet.dataset.v128Detents='1';
    let detent=opts.initial||.72,startY=0,lastY=0,lastT=0,moved=false,pid=null;
    const setDetent=(d,animate=true)=>{
      detent=Math.max(.45,Math.min(.96,d));
      const h=Math.round(visual().h*detent);
      sheet.style.transition=animate?'height .28s cubic-bezier(.22,1,.36,1),transform .22s ease':'none';
      sheet.style.setProperty('--v128-sheet-h',`${h}px`);sheet.style.height=`${h}px`;sheet.style.transform='translateY(0)';
      sheet.dataset.detent=detent>.82?'large':'medium';constrainSheet(sheet);
    };
    const close=()=>{opts.close?.();setTimeout(cleanModalState,20)};
    handle.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;pid=e.pointerId;startY=lastY=e.clientY;lastT=performance.now();moved=false;sheet.classList.add('v128-dragging');sheet.style.transition='none';handle.setPointerCapture?.(pid);e.preventDefault();
    });
    handle.addEventListener('pointermove',e=>{
      if(pid!==e.pointerId)return;const dy=e.clientY-startY;lastY=e.clientY;lastT=performance.now();if(Math.abs(dy)>4)moved=true;
      if(dy>=0)sheet.style.transform=`translateY(${Math.min(dy,visual().h*.42)}px)`;
      else{const base=visual().h*detent;sheet.style.height=`${Math.min(visual().h*.96,base-dy)}px`}
    });
    const end=e=>{
      if(pid!==e.pointerId)return;const now=performance.now(),dy=e.clientY-startY,dt=Math.max(16,now-lastT),velocity=(e.clientY-lastY)/dt;pid=null;sheet.classList.remove('v128-dragging');
      if(dy>Math.min(150,visual().h*.18)||velocity>.75){close();return}
      if(dy<-55){setDetent(opts.large||.94);return}
      if(detent>.82&&dy>65){setDetent(opts.medium||.58);return}
      setDetent(detent);
    };
    handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
    handle.addEventListener('click',()=>{if(moved)return;setDetent(detent>.82?(opts.medium||.58):(opts.large||.94))});
    const observer=new MutationObserver(()=>{
      const isOpen=layer.classList.contains('open')||layer.getAttribute('aria-hidden')==='false';
      if(isOpen){setDetent(opts.initial||.72,false);document.documentElement.classList.add('v128-modal-open');syncGeometry()}
      else cleanModalState();
    });
    observer.observe(layer,{attributes:true,attributeFilter:['class','aria-hidden']});
  }

  function upgradeGenericSheets(){
    $$('.v124-sheet-layer,.v124-catalog-layer').forEach(layer=>{
      const sheet=$('.v124-sheet,.v124-catalog-sheet',layer),handle=$('.v124-sheet-grabber',sheet);if(!sheet||!handle)return;
      attachDetents(layer,sheet,handle,{initial:.70,medium:.58,large:.93,close:()=>$('.v124-sheet-close,.v124-sheet-cancel',layer)?.click()});
    });
  }

  function fitFeedViewport(){
    const shell=$('#feedsView .feed-device-shell.device-mobile');if(!shell)return;
    const viewport=$(':scope > .feed-device-viewport',shell);if(!viewport)return;
    if(lastFeedViewport!==viewport){
      lastFeedViewport=viewport;
      viewport.addEventListener('scroll',()=>shell.classList.toggle('v128-feed-scrolled',viewport.scrollTop>18),{passive:true});
    }
    // Defensively neutralize legacy fixed widths inside all mobile simulations.
    shell.style.setProperty('width','min(100%,430px)','important');
    shell.style.setProperty('max-width','430px','important');
    viewport.style.setProperty('width','100%','important');
    $$('.ig-real-grid,.tt-real-grid,.yt-real-content,.fb-layout-real,.li-page-grid',viewport).forEach(n=>{n.style.maxWidth='100%';n.style.minWidth='0'});
    const grid=$('.ig-real-grid',viewport);if(grid){
      grid.style.setProperty('grid-template-columns','repeat(3,minmax(0,1fr))','important');
      $$('.ig-real-tile',grid).forEach(t=>{t.style.setProperty('min-width','0','important');t.style.removeProperty('width')});
    }
  }

  function decorateGlassTargets(){
    $$('.v124-icon-button,.home-primary,.v124-plan-add').forEach(x=>x.classList.add('v128-liquid-material'));
  }

  function observeRuntimeSheets(){
    const mo=new MutationObserver(()=>{upgradeGenericSheets();prepareDrawer();decorateGlassTargets();syncGeometry();cleanModalState()});
    mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-hidden']});
  }

  function boot(){
    installHistoryControls();prepareDrawer();upgradeGenericSheets();decorateGlassTargets();observeRuntimeSheets();syncGeometry();fitFeedViewport();
    document.documentElement.dataset.editorialVersion='12.8';
  }

  window.visualViewport?.addEventListener('resize',syncGeometry,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncGeometry,{passive:true});
  window.addEventListener('resize',syncGeometry,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(syncGeometry,120),{passive:true});
  window.addEventListener('editorial:rendered',()=>requestAnimationFrame(()=>{upgradeGenericSheets();fitFeedViewport();decorateGlassTargets();syncGeometry()}));
  window.addEventListener('editorial:view',()=>requestAnimationFrame(syncGeometry));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&closeTopModal())e.preventDefault()});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.EDITORIAL_V128={syncGeometry,closeTopModal,fitFeedViewport};
})();
