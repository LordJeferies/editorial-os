/* Editorial OS V12.8.2 · stability-first LiquidGlass
   Mobile WebGL is intentionally disabled until device QA proves it does not
   degrade scrolling/input. Mobile keeps the CSS liquid material. Desktop keeps
   one isolated LiquidGlass root (#topGlassRoot -> #glassHeader).
*/
const compactMQ=matchMedia('(max-width:899px)');
const reduceMQ=matchMedia('(prefers-reduced-motion: reduce)');
let instance=null;
let LiquidGlassCtor=null;
let resizeTimer=0;

const desktopConfig={blurAmount:.18,refraction:.40,chromAberration:.004,edgeHighlight:.08,specular:.08,fresnel:.54,distortion:.003,cornerRadius:24,zRadius:16,opacity:.94,saturation:.05,shadowOpacity:.10,shadowSpread:7,shadowOffsetY:2,floating:false,button:false};

async function destroy(){
  if(instance){try{await instance.destroy?.()}catch(e){console.debug('LiquidGlass destroy',e)}}
  instance=null;
  window.__liquidGlassInstances=[];
  document.documentElement.classList.remove('liquidglass-live');
}
async function load(){
  if(LiquidGlassCtor)return LiquidGlassCtor;
  const mod=await import('https://cdn.jsdelivr.net/npm/@ybouane/liquidglass/dist/index.js');
  LiquidGlassCtor=mod.LiquidGlass;
  return LiquidGlassCtor;
}
function reduced(){return reduceMQ.matches}
async function init(){
  await destroy();
  if(compactMQ.matches||reduced()){
    document.documentElement.dataset.liquidGlassMode='css-mobile';
    return;
  }
  const root=document.getElementById('topGlassRoot');
  const header=document.getElementById('glassHeader');
  if(!root||!header||header.parentElement!==root)return;
  try{
    const LiquidGlass=await load();
    header.dataset.config=JSON.stringify(desktopConfig);
    instance=await LiquidGlass.init({root,glassElements:[header],defaults:desktopConfig});
    window.__liquidGlassInstances=[instance];
    document.documentElement.classList.add('liquidglass-live');
    document.documentElement.dataset.liquidGlassMode='desktop-header';
  }catch(e){
    console.info('LiquidGlass: CSS fallback activo.',e);
    await destroy();
  }
}
function schedule(){clearTimeout(resizeTimer);resizeTimer=setTimeout(init,300)}
compactMQ.addEventListener?.('change',schedule);
reduceMQ.addEventListener?.('change',schedule);
window.addEventListener('orientationchange',schedule,{passive:true});
window.addEventListener('resize',()=>{if(!compactMQ.matches)schedule()},{passive:true});
window.addEventListener('editorial:view',()=>{try{instance?.markChanged?.()}catch{}});

function boot(){
  if('requestIdleCallback' in window)requestIdleCallback(()=>init(),{timeout:1600});
  else setTimeout(init,700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
