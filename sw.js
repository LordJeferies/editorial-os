const CACHE='editorial-os-v12-19';
const ASSETS=[
  './manifest.webmanifest','./supabase-config.js','./mcp.html',
  './css/legacy.css','./css/v12.css','./css/v123.css','./css/v124.css','./css/v126.css','./css/v127.css','./css/v128.css','./css/v129.css','./css/v1210.css','./css/v1211.css','./css/v1212.css','./css/v1213.css','./css/v1214.css','./css/v1215.css',
  './js/v123-data.js','./js/v123-sync.js','./js/v123-storage.js','./js/app-core.js','./js/v12-runtime.js','./js/v123-runtime.js','./js/v124-store.js','./js/v124-runtime.js','./js/v126-runtime.js','./js/v127-runtime.js','./js/v128-runtime.js','./js/v129-runtime.js','./js/v1210-runtime.js','./js/v1211-runtime.js','./js/v1212-runtime.js','./js/v1213-runtime.js','./js/v1214-runtime.js','./js/v1215-runtime.js','./js/v1217-recovery.js','./js/v1218-bootstrap.js','./js/v12-glass.js',
  './icons/icon-192.png','./icons/icon-512.png'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(ASSETS.map(async path=>{
      try{
        const response=await fetch(path,{cache:'no-store'});
        if(response&&response.ok)await cache.put(path,response.clone());
      }catch(e){}
    }));
  })());
});

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE&&/^editorial-os-/i.test(k)).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
  if(event.data?.type==='CLEAR_OLD_CACHES'){
    event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&/^editorial-os-/i.test(k)).map(k=>caches.delete(k)))));
  }
});

async function networkFirst(request){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response&&response.ok)cache.put(request,response.clone());
    return response;
  }catch(e){
    return cache.match(request);
  }
}

async function cacheFirst(request){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request);
  if(cached)return cached;
  const response=await fetch(request);
  if(response&&response.ok)cache.put(request,response.clone());
  return response;
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;

  // V12.19: never intercept document navigations. This prevents a stale
  // service worker from trapping Safari/PWA on an obsolete loading page.
  if(event.request.mode==='navigate')return;

  const path=url.pathname;
  const codeAsset=/\.(?:js|css|json|webmanifest)$/i.test(path);
  if(codeAsset){event.respondWith(networkFirst(event.request));return;}
  event.respondWith(cacheFirst(event.request));
});
