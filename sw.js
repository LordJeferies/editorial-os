const CACHE='editorial-os-v12-22-runtime';

const SHELL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './supabase-config.js',

  './css/legacy.css',
  './css/v12.css',
  './css/v123.css',
  './css/v124.css',
  './css/v126.css',
  './css/v127.css',
  './css/v128.css',
  './css/v129.css',
  './css/v1210.css',
  './css/v1211.css',
  './css/v1212.css',
  './css/v1213.css',
  './css/v1214.css',
  './css/v1215.css',
  './css/v1220.css',
  './css/v1221-web.css',

  './js/v1222-bootstrap.js',
  './js/v123-data.js',
  './js/v123-sync.js',
  './js/v123-storage.js',
  './js/app-core.js',
  './js/v12-runtime.js',
  './js/v123-runtime.js',
  './js/v124-store.js',
  './js/v124-runtime.js',
  './js/v126-runtime.js',
  './js/v127-runtime.js',
  './js/v128-runtime.js',
  './js/v129-runtime.js',
  './js/v1210-runtime.js',
  './js/v1211-runtime.js',
  './js/v1212-runtime.js',
  './js/v1213-runtime.js',
  './js/v1214-runtime.js',
  './js/v1215-runtime.js',
  './js/v1221-web.js',
  './js/v12-glass.js',

  './vendor/sortable.min.js',
  './vendor/supabase.min.js',

  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener(
  'install',
  event=>{
    self.skipWaiting();

    event.waitUntil(
      (async()=>{
        const cache=await caches.open(CACHE);

        await Promise.allSettled(
          SHELL.map(async path=>{
            try{
              const response=await fetch(
                path,
                {cache:'no-store'}
              );

              if(response && response.ok){
                await cache.put(
                  path,
                  response.clone()
                );
              }
            }catch(error){}
          })
        );
      })()
    );
  }
);

self.addEventListener(
  'activate',
  event=>event.waitUntil(
    (async()=>{
      const keys=await caches.keys();

      await Promise.all(
        keys
          .filter(
            key=>
              key!==CACHE &&
              /^editorial-os-/i.test(key)
          )
          .map(key=>caches.delete(key))
      );

      await self.clients.claim();
    })()
  )
);

self.addEventListener(
  'message',
  event=>{
    if(event.data?.type==='SKIP_WAITING'){
      self.skipWaiting();
    }
  }
);

function fetchWithTimeout(
  request,
  ms=2600
){
  return Promise.race([
    fetch(
      request,
      {cache:'no-store'}
    ),
    new Promise(
      (_,reject)=>
        setTimeout(
          ()=>reject(
            new Error('network-timeout')
          ),
          ms
        )
    )
  ]);
}

async function navigation(request){
  const cache=await caches.open(CACHE);

  try{
    const response=await fetchWithTimeout(
      request,
      2600
    );

    if(response && response.ok){
      cache.put(
        './index.html',
        response.clone()
      );

      return response;
    }
  }catch(error){}

  const fallback=
    await cache.match('./index.html');

  if(fallback){
    return fallback;
  }

  return new Response(
    '<!doctype html>' +
    '<meta name="viewport" content="width=device-width">' +
    '<title>Editorial OS</title>' +
    '<body style="font-family:-apple-system;padding:24px">' +
    '<h1>Editorial OS</h1>' +
    '<p>Sin conexión. La app volverá a sincronizar cuando recuperes internet.</p>' +
    '</body>',
    {
      headers:{
        'content-type':
          'text/html; charset=utf-8'
      }
    }
  );
}

async function networkFirst(request){
  const cache=await caches.open(CACHE);

  try{
    const response=await fetchWithTimeout(
      request,
      2800
    );

    if(response && response.ok){
      cache.put(
        request,
        response.clone()
      );
    }

    return response;
  }catch(error){
    const cached=
      await cache.match(request);

    return cached || Response.error();
  }
}

async function cacheFirst(request){
  const cache=await caches.open(CACHE);

  const cached=
    await cache.match(request);

  if(cached){
    return cached;
  }

  try{
    const response=await fetch(request);

    if(response && response.ok){
      cache.put(
        request,
        response.clone()
      );
    }

    return response;
  }catch(error){
    return Response.error();
  }
}

self.addEventListener(
  'fetch',
  event=>{
    if(event.request.method!=='GET'){
      return;
    }

    const url=new URL(
      event.request.url
    );

    if(url.origin!==location.origin){
      return;
    }

    if(event.request.mode==='navigate'){
      event.respondWith(
        navigation(event.request)
      );
      return;
    }

    if(
      /\.(?:js|css|json|webmanifest)$/i
        .test(url.pathname)
    ){
      event.respondWith(
        networkFirst(event.request)
      );
      return;
    }

    event.respondWith(
      cacheFirst(event.request)
    );
  }
);
