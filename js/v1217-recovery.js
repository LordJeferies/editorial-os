(()=>{
'use strict';
const VERSION='12.17';
const started=Date.now();
const $=(s,r=document)=>r.querySelector(s);

function setVersion(){
  window.EDITORIAL_OS_VERSION=VERSION;
  document.documentElement.dataset.editorialVersion=VERSION;
  document.title=document.title.replace(/V12\.(?:9|10|11|12|13|14|15|16)(?:\.\d+)?/g,`V${VERSION}`);
  const brand=$('#brandTitle');
  if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10|11|12|13|14|15|16)(?:\.\d+)?/g,`V${VERSION}`);
}

function ensureBanner(){
  if($('#v1217Recovery'))return $('#v1217Recovery');
  const el=document.createElement('div');
  el.id='v1217Recovery';
  el.style.cssText='position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:40000;display:none;gap:10px;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:16px;background:rgba(20,22,28,.94);color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.32);backdrop-filter:blur(18px);font:12px/1.35 -apple-system,BlinkMacSystemFont,SF Pro Text,system-ui,sans-serif';
  el.innerHTML='<div><b style="display:block;font-size:13px">Editorial OS está tardando más de lo normal</b><span style="color:#b8c0cf">La interfaz sigue disponible. Puedes continuar en modo local o recargar la carga segura.</span></div><div style="display:flex;gap:7px;flex:0 0 auto"><button id="v1217Continue" type="button" style="min-height:38px;border:0;border-radius:11px;padding:0 11px;font-weight:800">Continuar</button><button id="v1217Reload" type="button" style="min-height:38px;border:0;border-radius:11px;padding:0 11px;background:#0a84ff;color:#fff;font-weight:800">Recargar</button></div>';
  document.body.appendChild(el);
  $('#v1217Continue').onclick=()=>{el.style.display='none';clearStartupBlockers()};
  $('#v1217Reload').onclick=()=>location.replace('./launch.html?recover=manual&v=12.17');
  return el;
}

function clearStartupBlockers(){
  if(Date.now()-started>15000)return;
  const blocker=$('#v1215Blocker.open');
  if(blocker)blocker.classList.remove('open');
}

function fallbackView(id){
  const target=document.getElementById(id);
  if(!target)return false;
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v===target));
  document.querySelectorAll('.navbtn[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  target.scrollIntoView({block:'start'});
  return true;
}

function installInteractionFallback(){
  document.addEventListener('click',e=>{
    const welcome=e.target.closest?.('#v1215WelcomeStart');
    if(welcome){setTimeout(()=>$('#v1215Welcome')?.classList.remove('open'),0);return;}

    const account=e.target.closest?.('#v1215WelcomeAccount');
    if(account){
      setTimeout(()=>{
        $('#v1215Welcome')?.classList.remove('open');
        const settings=$('#v1213Settings');
        if(settings)settings.classList.add('open');
      },0);
      return;
    }

    const mcp=e.target.closest?.('#v1215WelcomeMcp');
    if(mcp){
      setTimeout(()=>{
        $('#v1215Welcome')?.classList.remove('open');
        const panel=$('#v1215Mcp');
        if(panel)panel.classList.add('open');
        else location.href='./mcp.html';
      },0);
      return;
    }

    if(window.EDITORIAL_V123_API)return;
    const nav=e.target.closest?.('.navbtn[data-view]');
    const home=e.target.closest?.('[data-home-go]');
    const id=nav?.dataset.view||home?.dataset.homeGo;
    if(id&&fallbackView(id)){
      e.preventDefault();
      e.stopPropagation();
    }
  },true);
}

function watchBoot(){
  let ticks=0;
  const timer=setInterval(()=>{
    ticks++;
    setVersion();
    clearStartupBlockers();
    if(window.EDITORIAL_V123_API){
      clearInterval(timer);
      const banner=$('#v1217Recovery');if(banner)banner.style.display='none';
      document.documentElement.dataset.editorialBoot='ready';
      window.dispatchEvent(new CustomEvent('editorial:boot-ready',{detail:{version:VERSION}}));
      return;
    }
    if(ticks===30){
      const banner=ensureBanner();banner.style.display='flex';
      document.documentElement.dataset.editorialBoot='degraded';
    }
    if(ticks>120)clearInterval(timer);
  },200);
}

function init(){
  setVersion();
  installInteractionFallback();
  watchBoot();
  window.addEventListener('pageshow',()=>setTimeout(clearStartupBlockers,50));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
