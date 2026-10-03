const CACHE='editorial-os-v12-1';
const CORE=[
  './','./index.html','./manifest.webmanifest',
  './css/legacy.css','./css/v12.css','./css/v121.css',
  './js/app-core.js','./js/v12-runtime.js','./js/v121-runtime.js','./js/v12-glass.js',
  './icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);if(url.origin!==location.origin)return;
  event.respondWith(fetch(event.request).then(resp=>{
    if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});}return resp;
  }).catch(()=>caches.match(event.request).then(r=>r||(event.request.mode==='navigate'?caches.match('./index.html'):undefined))));
});
