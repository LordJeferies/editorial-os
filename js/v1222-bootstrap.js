(function(){
'use strict';

var VERSION='12.22';
var nativeDesktop=/EditorialOSDesktop/i.test(navigator.userAgent||'');
var errors=[];

var CORE=[
  ['./js/v123-data.js','v123-data'],
  ['./js/v123-sync.js','v123-sync'],
  ['./js/v123-storage.js','v123-storage'],
  ['./js/app-core.js','app-core'],
  ['./js/v12-runtime.js','v12-runtime'],
  ['./js/v123-runtime.js','v123-runtime'],
  ['./js/v124-store.js','v124-store'],
  ['./js/v124-runtime.js','v124-runtime'],
  ['./js/v126-runtime.js','v126-runtime'],
  ['./js/v127-runtime.js','v127-runtime'],
  ['./js/v128-runtime.js','v128-runtime'],
  ['./js/v129-runtime.js','v129-runtime'],
  ['./js/v1210-runtime.js','v1210-runtime'],
  ['./js/v1211-runtime.js','v1211-runtime'],
  ['./js/v1212-runtime.js','v1212-runtime'],
  ['./js/v1213-runtime.js','v1213-runtime'],
  ['./js/v1214-runtime.js','v1214-runtime'],
  ['./js/v1215-runtime.js','v1215-runtime']
];

window.EDITORIAL_BOOT={
  version:VERSION,
  phase:'starting',
  startedAt:Date.now(),
  nativeDesktop:nativeDesktop,
  errors:errors
};

function q(selector){
  return document.querySelector(selector);
}

function setVersion(){
  window.EDITORIAL_OS_VERSION=VERSION;

  document.documentElement.dataset.editorialVersion=VERSION;

  document.title=document.title.replace(
    /V12\.\d+(?:\.\d+)?/g,
    'V'+VERSION
  );

  var brand=q('#brandTitle');

  if(brand){
    brand.textContent=brand.textContent.replace(
      /V12\.\d+(?:\.\d+)?/g,
      'V'+VERSION
    );
  }
}

function clearLegacyBootUI(){
  var blocker=q('#v1215Blocker');

  if(blocker){
    blocker.classList.remove('open');
  }

  var recovery=q('#v1217Recovery');

  if(recovery){
    recovery.style.display='none';
  }
}

function ensureWebShell(){
  if(nativeDesktop)return;

  if(!q('#v1221WebCss')){
    var link=document.createElement('link');
    link.id='v1221WebCss';
    link.rel='stylesheet';
    link.href='./css/v1221-web.css?v=12.22';
    document.head.appendChild(link);
  }

  if(!q('script[data-editorial-webshell]')){
    var script=document.createElement('script');
    script.src='./js/v1221-web.js?v=12.22';
    script.async=true;
    script.dataset.editorialWebshell='1';
    document.head.appendChild(script);
  }
}

function loadScript(src,key,options){
  options=options||{};

  return new Promise(function(resolve){
    var existing=q(
      'script[data-editorial-module="'+key+'"]'
    );

    if(existing){
      resolve(true);
      return;
    }

    var script=document.createElement('script');

    script.src=src+'?v=12.22';
    script.async=false;
    script.dataset.editorialModule=key;

    if(options.module){
      script.type='module';
    }

    var finished=false;

    function done(ok){
      if(finished)return;
      finished=true;
      clearTimeout(timer);

      if(!ok){
        errors.push({
          module:key,
          src:src
        });
      }

      resolve(ok);
    }

    var timer=setTimeout(function(){
      console.warn(
        'Editorial OS: timeout cargando',
        key
      );

      done(false);
    },8000);

    script.onload=function(){
      done(true);
    };

    script.onerror=function(){
      console.error(
        'Editorial OS: no se pudo cargar',
        key
      );

      done(false);
    };

    document.body.appendChild(script);
  });
}

async function loadCore(){
  for(var i=0;i<CORE.length;i++){
    var item=CORE[i];

    await loadScript(
      item[0],
      item[1]
    );

    clearLegacyBootUI();
  }
}

function loadVendor(local,cdn,test,key){
  if(test())return Promise.resolve(true);

  return new Promise(function(resolve){
    function attempt(src,isFallback){
      var script=document.createElement('script');

      script.src=src;
      script.async=true;
      script.dataset.editorialVendor=key;

      script.onload=function(){
        if(test()){
          resolve(true);
        }else if(!isFallback){
          attempt(cdn,true);
        }else{
          resolve(false);
        }
      };

      script.onerror=function(){
        if(!isFallback){
          attempt(cdn,true);
        }else{
          resolve(false);
        }
      };

      document.head.appendChild(script);
    }

    attempt(local,false);
  });
}

function loadServices(){
  Promise.allSettled([
    loadVendor(
      './vendor/sortable.min.js?v=12.22',
      'https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js',
      function(){return !!window.Sortable},
      'sortable'
    ),
    loadVendor(
      './vendor/supabase.min.js?v=12.22',
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
      function(){return !!window.supabase},
      'supabase'
    )
  ]).then(function(){
    window.dispatchEvent(
      new CustomEvent(
        'editorial:services-ready',
        {
          detail:{
            sortable:!!window.Sortable,
            supabase:!!window.supabase
          }
        }
      )
    );

    try{
      if(
        window.supabase &&
        window.EDITORIAL_V123_API &&
        typeof window.EDITORIAL_V123_API.forceSync==='function'
      ){
        window.EDITORIAL_V123_API.forceSync();
      }
    }catch(error){
      console.info(
        'Editorial OS: sync diferido',
        error
      );
    }
  });
}

function scheduleServices(){
  if('requestIdleCallback' in window){
    requestIdleCallback(
      loadServices,
      {timeout:1600}
    );
  }else{
    setTimeout(loadServices,600);
  }
}

function registerSW(){
  if(
    nativeDesktop ||
    !('serviceWorker' in navigator)
  ){
    return;
  }

  var run=function(){
    navigator.serviceWorker.register(
      './sw.js?v=12.22',
      {
        scope:'./',
        updateViaCache:'none'
      }
    ).then(function(reg){
      try{
        reg.update();
      }catch(error){}
    }).catch(function(error){
      console.info(
        'Editorial OS: Service Worker no disponible',
        error
      );
    });
  };

  if('requestIdleCallback' in window){
    requestIdleCallback(
      run,
      {timeout:2200}
    );
  }else{
    setTimeout(run,1000);
  }
}

function markReady(){
  setVersion();
  clearLegacyBootUI();

  var apiReady=!!window.EDITORIAL_V123_API;

  window.EDITORIAL_BOOT.phase=
    apiReady ? 'ready' : 'degraded';

  document.documentElement.dataset.editorialBoot=
    apiReady ? 'ready' : 'degraded';

  window.dispatchEvent(
    new CustomEvent(
      apiReady
        ? 'editorial:boot-ready'
        : 'editorial:boot-degraded',
      {
        detail:{
          version:VERSION,
          errors:errors.slice()
        }
      }
    )
  );
}

async function boot(){
  setVersion();
  clearLegacyBootUI();

  document.documentElement.dataset.editorialBoot=
    'interactive';

  window.EDITORIAL_BOOT.phase='interactive';

  ensureWebShell();

  scheduleServices();

  await loadCore();

  await loadScript(
    './js/v12-glass.js',
    'v12-glass',
    {module:true}
  );

  markReady();

  registerSW();
}

window.addEventListener(
  'pageshow',
  function(){
    setVersion();
    clearLegacyBootUI();
  }
);

window.addEventListener(
  'error',
  function(event){
    if(
      window.EDITORIAL_BOOT &&
      window.EDITORIAL_BOOT.phase!=='ready'
    ){
      errors.push({
        type:'runtime',
        message:String(
          event.message||'runtime error'
        )
      });
    }
  }
);

if(document.readyState==='loading'){
  document.addEventListener(
    'DOMContentLoaded',
    boot,
    {once:true}
  );
}else{
  boot();
}

})();
