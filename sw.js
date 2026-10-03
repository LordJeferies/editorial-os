const CACHE='editorial-os-v12-9';
const CORE=[
  './','./index.html','./manifest.webmanifest',
  './css/legacy.css','./css/v12.css','./css/v123.css','./css/v124.css','./css/v126.css','./css/v127.css','./css/v128.css','./css/v129.css',
  './js/v123-data.js','./js/v123-sync.js','./js/v123-storage.js',
  './js/app-core.js','./js/v12-runtime.js','./js/v123-runtime.js','./js/v124-store.js','./js/v124-runtime.js','./js/v126-runtime.js','./js/v127-runtime.js','./js/v128-runtime.js','./js/v129-runtime.js','./js/v12-glass.js',
  './icons/icon-192.png','./icons/icon-512.png'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
});

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
));

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

async function networkFirst(request){
  const cache=await caches.open(CACHE);
  try{
    const resp=await fetch(request,{cache:'no-store'});
    if(resp&&resp.ok)cache.put(request,resp.clone());
    return resp;
  }catch(e){
    return (await cache.match(request))||(request.mode==='navigate'?cache.match('./index.html'):undefined);
  }
}

async function cacheFirst(request){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request);
  if(cached)return cached;
  const resp=await fetch(request);
  if(resp&&resp.ok)cache.put(request,resp.clone());
  return resp;
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  const pathname=url.pathname;
  const codeAsset=/\.(?:js|css|json|webmanifest)$/i.test(pathname);
  const htmlNav=event.request.mode==='navigate'||pathname.endsWith('/index.html')||pathname.endsWith('/editorial-os/');
  if(htmlNav||codeAsset){
    event.respondWith(networkFirst(event.request));
    return;
  }
  event.respondWith(cacheFirst(event.request));
});
