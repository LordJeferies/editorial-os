/* Editorial OS V12.8.1 · stable LiquidGlass hotfix
   IMPORTANT: never use document.body or #glassRoot as a LiquidGlass root.
   LiquidGlass rasterises non-glass children of its root, so a full-app root can
   stall Safari/iPhone. Compact mode therefore uses exactly one small root:
   #dockGlassRoot -> #mobileDock. The mobile topbar/buttons keep the deterministic
   CSS liquid material from v128.css. Desktop keeps the isolated #topGlassRoot.
*/
const compactMQ=matchMedia('(max-width:899px)');
const reduceMQ=matchMedia('(prefers-reduced-motion: reduce)');
let instances=[];
let generation=0;
let resizeTimer=0;
let fpsTimer=0;
let LiquidGlassCtor=null;

const desktopConfig={blurAmount:.20,refraction:.46,chromAberration:.006,edgeHighlight:.08,specular:.09,fresnel:.58,distortion:.005,cornerRadius:26,zRadius:18,opacity:.95,saturation:.06,shadowOpacity:.12,shadowSpread:9,shadowOffsetY:2,floating:false,button:false};
const dockConfig={blurAmount:.12,refraction:.28,chromAberration:.0025,edgeHighlight:.09,specular:.08,fresnel:.48,distortion:.002,cornerRadius:19,zRadius:12,opacity:.90,saturation:.06,shadowOpacity:.08,shadowSpread:6,shadowOffsetY:1,floating:false,button:false};

async function destroyAll(){
  clearTimeout(fpsTimer);
  for(const instance of instances){try{await instance?.destroy?.()}catch(e){console.debug('LiquidGlass destroy',e)}}
  instances=[];
  window.__liquidGlassInstances=[];
  document.documentElement.classList.remove('liquidglass-live');
}
async function loadLiquidGlass(){
  if(LiquidGlassCtor)return LiquidGlassCtor;
  const mod=await import('https://cdn.jsdelivr.net/npm/@ybouane/liquidglass/dist/index.js');
  LiquidGlassCtor=mod.LiquidGlass;
  return LiquidGlassCtor;
}
function reducedByPreference(){
  try{return reduceMQ.matches||localStorage.getItem('editorialV123Prefs')?.includes('"reduceEffects":true')}catch{return reduceMQ.matches}
}
async function addInstance(LiquidGlass,root,elements,defaults){
  if(!root||!elements?.length)return null;
  const direct=elements.filter(el=>el&&el.parentElement===root);
  if(!direct.length)return null;
  direct.forEach(el=>{el.dataset.config=JSON.stringify(defaults)});
  const instance=await LiquidGlass.init({root,glassElements:direct,defaults});
  instances.push(instance);
  return instance;
}
async function initDesktop(LiquidGlass){
  const root=document.getElementById('topGlassRoot');
  const el=document.getElementById('glassHeader');
  if(root&&el&&el.parentElement===root)await addInstance(LiquidGlass,root,[el],desktopConfig);
}
async function initCompact(LiquidGlass){
  /* One isolated, shallow WebGL root only. Never rasterise the whole app. */
  const root=document.getElementById('dockGlassRoot');
  const dock=document.getElementById('mobileDock');
  if(root&&dock&&dock.parentElement===root)await addInstance(LiquidGlass,root,[dock],dockConfig);
}
function performanceGuard(){
  clearTimeout(fpsTimer);
  fpsTimer=setTimeout(async()=>{
    const samples=instances.map(x=>Number(x?.fps)||60).filter(Number.isFinite);
    const min=samples.length?Math.min(...samples):60;
    if(compactMQ.matches&&min>0&&min<28){
      console.info('LiquidGlass: rendimiento móvil bajo; material CSS estable activado.');
      await destroyAll();
    }
  },2200);
}
async function initGlass(){
  const current=++generation;
  await destroyAll();
  if(reducedByPreference())return;
  try{
    const LiquidGlass=await loadLiquidGlass();
    if(current!==generation)return;
    if(compactMQ.matches)await initCompact(LiquidGlass);else await initDesktop(LiquidGlass);
    if(current!==generation){await destroyAll();return}
    if(instances.length){
      document.documentElement.classList.add('liquidglass-live');
      document.documentElement.dataset.liquidGlassRoot=compactMQ.matches?'dock-only':'desktop-header';
      window.__liquidGlassInstances=instances;
      performanceGuard();
    }
  }catch(e){
    console.info('LiquidGlass: fallback CSS activo.',e);
    await destroyAll();
  }
}
function markChanged(){for(const i of instances){try{i?.markChanged?.()}catch{}}}
function scheduleReinit(delay=260){clearTimeout(resizeTimer);resizeTimer=setTimeout(initGlass,delay)}

compactMQ.addEventListener?.('change',()=>scheduleReinit(180));
reduceMQ.addEventListener?.('change',()=>scheduleReinit(180));
window.addEventListener('orientationchange',()=>scheduleReinit(320),{passive:true});
/* Mobile Safari emits resize events while browser chrome/keyboard changes.
   Re-initialising WebGL on every one of those events caused stalls. */
window.addEventListener('resize',()=>{if(!compactMQ.matches)scheduleReinit(320)},{passive:true});
window.addEventListener('editorial:view',()=>setTimeout(markChanged,80));
window.addEventListener('editorial:rendered',()=>setTimeout(markChanged,80));
const themeRoot=document.getElementById('glassRoot');
if(themeRoot)new MutationObserver(m=>{if(m.some(x=>x.attributeName==='data-theme'))scheduleReinit(220)}).observe(themeRoot,{attributes:true,attributeFilter:['data-theme']});

function boot(){
  const run=()=>initGlass().catch(e=>console.info('LiquidGlass fallback CSS activo.',e));
  if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:1200});
  else setTimeout(run,500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
