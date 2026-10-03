/* Editorial OS V12.3 · IndexedDB shadow state + durable outbox */
(() => {
  'use strict';
  const DB_NAME='editorial-os-v123';
  const DB_VERSION=1;
  const DEVICE_KEY='editorialV123DeviceId';
  const deviceId=localStorage.getItem(DEVICE_KEY)||`dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
  localStorage.setItem(DEVICE_KEY,deviceId);
  let dbPromise=null;

  function open(){
    if(!('indexedDB' in window))return Promise.resolve(null);
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots');
        if(!db.objectStoreNames.contains('outbox'))db.createObjectStore('outbox');
        if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta');
      };
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    }).catch(err=>{console.warn('IndexedDB no disponible',err);return null});
    return dbPromise;
  }
  async function put(store,key,value){const db=await open();if(!db)return false;return new Promise(resolve=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value,key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false)})}
  async function get(store,key){const db=await open();if(!db)return null;return new Promise(resolve=>{const tx=db.transaction(store,'readonly');const r=tx.objectStore(store).get(key);r.onsuccess=()=>resolve(r.result??null);r.onerror=()=>resolve(null)})}
  async function del(store,key){const db=await open();if(!db)return false;return new Promise(resolve=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false)})}
  async function clear(){const db=await open();if(!db)return;for(const store of ['snapshots','outbox','meta'])await new Promise(resolve=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).clear();tx.oncomplete=resolve;tx.onerror=resolve})}
  async function persistSnapshot(snapshot){return put('snapshots','latest',{...snapshot,productVersion:'12.3',savedAt:new Date().toISOString()})}
  async function latestSnapshot(){return get('snapshots','latest')}
  async function queueOutbox(payload){return put('outbox','latest',{payload,queuedAt:new Date().toISOString()})}
  async function pendingOutbox(){return get('outbox','latest')}
  async function clearOutbox(){return del('outbox','latest')}
  async function saveConflict(payload){return put('meta','conflict',{payload,at:new Date().toISOString()})}
  async function getConflict(){return get('meta','conflict')}
  async function clearConflict(){return del('meta','conflict')}
  async function diagnostics(){
    const est=await navigator.storage?.estimate?.().catch?.(()=>null);
    return {db:!!(await open()),deviceId,pending:!!(await pendingOutbox()),conflict:!!(await getConflict()),usage:est?.usage||0,quota:est?.quota||0};
  }
  navigator.storage?.persist?.().catch?.(()=>{});
  window.EDITORIAL_STORAGE={deviceId,open,persistSnapshot,latestSnapshot,queueOutbox,pendingOutbox,clearOutbox,saveConflict,getConflict,clearConflict,clearAll:clear,diagnostics};
})();
