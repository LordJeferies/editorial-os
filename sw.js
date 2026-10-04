const CACHE='editorial-os-v12-20';
const SHELL=[
  './js/v1220-bootstrap.js','./js/v1220-runtime.js','./css/v1220.css','./vendor/sortable.min.js','./vendor/supabase.min.js',
  './index.html','./manifest.webmanifest','./supabase-config.js',
  './css/v1220-mobile.css','./js/v1218-bootstrap.js','./js/v1220-mobile.js',
  './icons/icon-192.png','./icons/icon-512.png'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(SHELL.map(async path=>{
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

function fetchWithTimeout(request,ms=3000){
  return Promise.race([
    fetch(request,{cache:'no-store'}),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error('network-timeout')),ms))
  ]);
}

async function navigation(request){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetchWithTimeout(request,3000);
    if(response&&response.ok){
      const type=response.headers.get('content-type')||'';
      if(type.includes('text/html'))cache.put('./index.html',response.clone());
      return response;
    }
  }catch(e){}
  const fallback=await cache.match('./index.html');
  if(fallback)return fallback;
  return new Response('<!doctype html><meta name="viewport" content="width=device-width"><title>Editorial OS</title><body style="font-family:-apple-system;padding:24px"><h1>Editorial OS</h1><p>Sin conexión. Vuelve a intentarlo cuando tengas internet.</p></body>',{headers:{'content-type':'text/html; charset=utf-8'}});
}

async function networkFirst(request){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetchWithTimeout(request,3500);
    if(response&&response.ok)cache.put(request,response.clone());
    return response;
  }catch(e){return cache.match(request)}
}

async function cacheFirst(request){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request);
  if(cached)return cached;
  try{
    const response=await fetch(request);
    if(response&&response.ok)cache.put(request,response.clone());
    return response;
  }catch(e){return undefined}
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;

  if(event.request.mode==='navigate'){
    event.respondWith(navigation(event.request));
    return;
  }

  const path=url.pathname;
  const codeAsset=/\.(?:js|css|json|webmanifest)$/i.test(path);
  if(codeAsset){event.respondWith(networkFirst(event.request));return;}
  event.respondWith(cacheFirst(event.request));
});
