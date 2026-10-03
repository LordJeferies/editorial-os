const CACHE='editorial-os-v12-3';
const CORE=[
  './','./index.html','./manifest.webmanifest',
  './css/legacy.css','./css/v12.css','./css/v123.css',
  './js/v123-data.js','./js/v123-sync.js','./js/v123-storage.js',
  './js/app-core.js','./js/v12-runtime.js','./js/v123-runtime.js','./js/v12-glass.js',
  './icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});
async function networkFirst(request){
  const cache=await caches.open(CACHE);
  try{const resp=await fetch(request);if(resp&&resp.ok)cache.put(request,resp.clone());return resp}catch(e){return (await cache.match(request))||(request.mode==='navigate'?cache.match('./index.html'):undefined)}
}
async function staleWhileRevalidate(request){
  const cache=await caches.open(CACHE),cached=await cache.match(request);
  const fresh=fetch(request).then(resp=>{if(resp&&resp.ok)cache.put(request,resp.clone());return resp}).catch(()=>null);
  return cached||(await fresh)||(request.mode==='navigate'?cache.match('./index.html'):undefined);
}
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'||url.pathname.endsWith('/index.html'))event.respondWith(networkFirst(event.request));
  else event.respondWith(staleWhileRevalidate(event.request));
});
