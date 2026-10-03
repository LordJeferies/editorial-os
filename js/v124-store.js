/* Editorial OS V12.6 · tiny reactive UI store
   React/Signals-inspired state container for UI-only state. The editorial domain
   remains in app-core.js; this store prevents DOM-only state from leaking back
   into domain persistence and batches subscriber updates in a microtask. */
(() => {
  'use strict';
  function createStore(initial={}){
    let state=Object.freeze({...initial});
    const listeners=new Set();
    let queued=false,previous=state;
    const notify=()=>{
      queued=false;
      const current=state,prev=previous;previous=current;
      listeners.forEach(fn=>{try{fn(current,prev)}catch(e){console.error('[V12.6 store]',e)}});
    };
    const schedule=()=>{if(!queued){queued=true;queueMicrotask(notify)}};
    return {
      get:()=>state,
      set(patch){const next=typeof patch==='function'?patch(state):{...state,...patch};if(next===state)return state;state=Object.freeze(next);schedule();return state},
      subscribe(fn,{immediate=true}={}){listeners.add(fn);if(immediate)fn(state,state);return()=>listeners.delete(fn)},
      select(selector,fn,{equals=Object.is,immediate=true}={}){
        let value=selector(state);
        if(immediate)fn(value,value);
        return this.subscribe((s)=>{const next=selector(s);if(!equals(value,next)){const prev=value;value=next;fn(next,prev)}},{immediate:false});
      }
    };
  }
  window.EDITORIAL_UI_STORE=createStore({
    activeView:'homeView',
    activePlannerDay:1,
    emulatorMode:'plan',
    activeSheet:null,
    online:navigator.onLine,
    keyboardOpen:false
  });
  window.addEventListener('online',()=>window.EDITORIAL_UI_STORE.set({online:true}));
  window.addEventListener('offline',()=>window.EDITORIAL_UI_STORE.set({online:false}));
})();
