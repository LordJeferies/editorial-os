/* Editorial OS V12.3 · pure sync revision helpers */
(() => {
  'use strict';
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  function nextRevision(localRevision,baseRevision,remoteRevision=0){return Math.max(n(localRevision),n(baseRevision),n(remoteRevision))+1}
  function shouldConflict({dirty=false,baseRevision=0,remoteRevision=0,remoteDeviceId='',deviceId=''}){
    if(!dirty)return false;
    if(!remoteDeviceId||!deviceId||remoteDeviceId===deviceId)return false;
    return n(remoteRevision)>n(baseRevision);
  }
  window.EDITORIAL_SYNC_CORE={nextRevision,shouldConflict};
})();
