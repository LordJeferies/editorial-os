/* Editorial OS V12.6 · UX Recovery runtime
   Small compatibility layer over the V12.4 mobile shell.
   Responsibilities: exact feed geometry, richer planner context and resilient
   post-render fitting. Domain state remains in app-core.js.
*/
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const compact=matchMedia('(max-width:899px)');
  let feedRO=null;
  let fitRAF=0;

  function innerWidth(el){
    if(!el)return 0;
    const cs=getComputedStyle(el);
    return Math.max(0,el.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0));
  }

  function fitFeedShell(){
    if(window.EDITORIAL_V127)return;
    cancelAnimationFrame(fitRAF);
    fitRAF=requestAnimationFrame(()=>{
      const wrap=$('#feedsView .feed-sim-wrap');
      const shell=$('#feedsView .feed-device-shell.device-mobile');
      if(!wrap||!shell)return;
      const available=Math.floor(Math.min(390,Math.max(250,innerWidth(wrap))));
      shell.style.setProperty('width',`${available}px`,'important');
      shell.style.setProperty('max-width','100%','important');
      shell.style.setProperty('min-width','0','important');
      shell.style.setProperty('box-sizing','border-box','important');
      if(shell.classList.contains('instagram-sim')){
        const grid=$('.ig-real-grid',shell);
        if(grid){
          const gridWidth=Math.floor(grid.getBoundingClientRect().width);
          grid.dataset.v126Width=String(gridWidth);
          grid.style.setProperty('width','100%','important');
          grid.style.setProperty('max-width','100%','important');
          grid.style.setProperty('min-width','0','important');
          const gap=1;
          const track=Math.max(1,(grid.clientWidth-(gap*2))/3);
          grid.style.setProperty('gap',`${gap}px`,'important');
          grid.style.setProperty('grid-template-columns',`${track}px ${track}px ${track}px`,'important');
          grid.style.setProperty('grid-auto-columns',`${track}px`,'important');
          $$('.ig-real-tile',grid).forEach(tile=>{
            tile.style.setProperty('position','relative','important');
            tile.style.setProperty('min-width','0','important');
            tile.style.setProperty('max-width',`${track}px`,'important');
            tile.style.setProperty('width',`${track}px`,'important');
          });
        }
      }
    });
  }

  function watchFeed(){
    feedRO?.disconnect?.();
    const stage=$('#feedsView .feed-sim-wrap');
    if(stage&&'ResizeObserver' in window){feedRO=new ResizeObserver(fitFeedShell);feedRO.observe(stage)}
    fitFeedShell();
  }

  function enhancePlannerContext(){
    if(!compact.matches)return;
    const view=$('#emulatorView');
    if(!view)return;
    const modes=$('#v124EmulatorModes',view);
    if(!modes)return;
    let context=$('#v126PlannerContext',view);
    if(!context){
      context=document.createElement('div');context.id='v126PlannerContext';context.className='v126-planner-context';
      modes.insertAdjacentElement('afterend',context);
    }
    const state=window.EDITORIAL_V123_API?.getState?.();
    const tabs=$('.v123-daytabs button.active',view);
    const day=tabs?.textContent?.trim()||'Día';
    const visible=$('#plannerWeekGrid .planner-day:not([hidden])',view)||$('#plannerWeekGrid .planner-day',view);
    const count=visible?$$('.plan-item',visible).length:0;
    const scenario=state?.state?.activeScenario?.name||state?.state?.activeScenarioId||'Borrador de escenario';
    context.innerHTML=`<div><small>${escapeHtml(scenario)}</small><b>${escapeHtml(day)}</b></div><span>${count} ${count===1?'pieza':'piezas'}</span>`;
  }

  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

  function enrichPlannerCards(){
    if(!compact.matches)return;
    $$('#plannerWeekGrid .plan-item').forEach(card=>{
      if(card.dataset.v126==='1')return;card.dataset.v126='1';
      const id=card.dataset.instance;
      const found=window.EDITORIAL_PLANNER?.find?.(id);
      const item=found?.item;if(!item)return;
      const meta=document.createElement('div');meta.className='v126-plan-meta';
      const platforms=(item.platforms||[]).slice(0,3).map(p=>String(p).slice(0,2).toUpperCase()).join(' · ');
      const status=item.linkedinLayer==='l2'?'LinkedIn L2':item.lot||'';
      meta.innerHTML=`<span>${escapeHtml(status)}</span>${platforms?`<span>${escapeHtml(platforms)}</span>`:''}`;
      const small=card.querySelector('small');
      if(small)small.insertAdjacentElement('afterend',meta);else card.appendChild(meta);
    });
  }

  function recoverV124UI(){
    document.documentElement.dataset.editorialVersion='12.6';
    document.documentElement.classList.add('v126-recovery');
    // If old V12.5 DOM helpers are present from cached markup/runtime, hide/remove
    // only those helpers, never domain content.
    ['#v125FeedControlBar','#v125LibrarySectionBar'].forEach(sel=>$$(sel).forEach(n=>n.remove()));
  }

  function sync(){recoverV124UI();watchFeed();enhancePlannerContext();enrichPlannerCards()}

  window.addEventListener('editorial:rendered',()=>requestAnimationFrame(sync));
  window.addEventListener('editorial:view',()=>requestAnimationFrame(sync));
  window.addEventListener('resize',fitFeedShell,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(fitFeedShell,160),{passive:true});
  compact.addEventListener?.('change',sync);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,0),{once:true});else setTimeout(sync,0);

  window.EDITORIAL_V126={fitFeedShell,sync};
})();
