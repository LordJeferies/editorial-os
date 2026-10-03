/* Editorial OS V12.8 · progressive LiquidGlass integration
   Uses @ybouane/liquidglass for compact navigation chrome and buttons when
   WebGL is healthy. CSS material remains the deterministic fallback.
*/
const compactMQ=matchMedia('(max-width:899px)');
const reduceMQ=matchMedia('(prefers-reduced-motion: reduce)');
let instances=[];
let generation=0;
let resizeTimer=0;
let fpsTimer=0;
let LiquidGlassCtor=null;

const desktopConfig={blurAmount:.20,refraction:.46,chromAberration:.006,edgeHighlight:.08,specular:.09,fresnel:.58,distortion:.005,cornerRadius:26,zRadius:18,opacity:.95,saturation:.06,shadowOpacity:.12,shadowSpread:9,shadowOffsetY:2,floating:false,button:false};
const chromeConfig={blurAmount:.16,refraction:.34,chromAberration:.0035,edgeHighlight:.10,specular:.10,fresnel:.54,distortion:.003,cornerRadius:20,zRadius:14,opacity:.91,saturation:.08,shadowOpacity:.10,shadowSpread:8,shadowOffsetY:2,floating:false,button:false};
const buttonConfig={blurAmount:.10,refraction:.27,chromAberration:.0025,edgeHighlight:.11,specular:.12,fresnel:.50,distortion:.0025,cornerRadius:13,zRadius:10,opacity:.90,saturation:.06,shadowOpacity:.07,shadowSpread:5,shadowOffsetY:1,floating:false,button:true};

async function destroyAll(){
  clearTimeout(fpsTimer);
  for(const instance of instances){try{await instance?.destroy?.()}catch(e){console.debug('LiquidGlass destroy',e)}}
  instances=[];window.__liquidGlassInstances=[];document.documentElement.classList.remove('liquidglass-live');
}
async function loadLiquidGlass(){
  if(LiquidGlassCtor)return LiquidGlassCtor;
  const mod=await import('https://cdn.jsdelivr.net/npm/@ybouane/liquidglass/dist/index.js');
  LiquidGlassCtor=mod.LiquidGlass;return LiquidGlassCtor;
}
function reducedByPreference(){
  try{return reduceMQ.matches||localStorage.getItem('editorialV123Prefs')?.includes('"reduceEffects":true')}catch{return reduceMQ.matches}
}
async function addInstance(LiquidGlass,root,elements,defaults){
  if(!root||!elements?.length)return null;
  elements.forEach(el=>{el.dataset.config=JSON.stringify(defaults)});
  const instance=await LiquidGlass.init({root,glassElements:elements,defaults});
  instances.push(instance);return instance;
}
async function initDesktop(LiquidGlass){
  const root=document.getElementById('topGlassRoot'),el=document.getElementById('glassHeader');
  if(root&&el)await addInstance(LiquidGlass,root,[el],desktopConfig);
}
async function initCompact(LiquidGlass){
  const topbar=document.getElementById('v124MobileTopbar');
  const actions=topbar?.querySelector('.v124-toolbar-actions');
  const history=topbar?.querySelector('.v128-history-controls');
  const dock=document.getElementById('mobileDock');
  if(topbar&&topbar.parentElement===document.body)await addInstance(LiquidGlass,document.body,[topbar],chromeConfig);
  if(actions){const buttons=[...actions.children].filter(x=>x instanceof HTMLElement);if(buttons.length)await addInstance(LiquidGlass,actions,buttons,buttonConfig)}
  if(history){const buttons=[...history.children].filter(x=>x instanceof HTMLElement);if(buttons.length)await addInstance(LiquidGlass,history,buttons,buttonConfig)}
  if(dock){const buttons=[...dock.children].filter(x=>x instanceof HTMLElement);if(buttons.length)await addInstance(LiquidGlass,dock,buttons,buttonConfig)}
}
function performanceGuard(){
  clearTimeout(fpsTimer);
  fpsTimer=setTimeout(async()=>{
    const samples=instances.map(x=>Number(x?.fps)||60).filter(Number.isFinite);
    const min=samples.length?Math.min(...samples):60;
    if(compactMQ.matches&&min>0&&min<24){
      console.info('LiquidGlass: rendimiento bajo, usando material CSS estable.');
      await destroyAll();
    }
  },2600);
}
async function initGlass(){
  const current=++generation;await destroyAll();
  if(reducedByPreference())return;
  try{
    const LiquidGlass=await loadLiquidGlass();if(current!==generation)return;
    if(compactMQ.matches)await initCompact(LiquidGlass);else await initDesktop(LiquidGlass);
    if(current!==generation){await destroyAll();return}
    if(instances.length){document.documentElement.classList.add('liquidglass-live');window.__liquidGlassInstances=instances;performanceGuard()}
  }catch(e){console.info('LiquidGlass: fallback CSS activo.',e)}
}
function markChanged(){for(const i of instances){try{i?.markChanged?.()}catch{}}}
function scheduleReinit(){clearTimeout(resizeTimer);resizeTimer=setTimeout(initGlass,220)}
compactMQ.addEventListener?.('change',scheduleReinit);reduceMQ.addEventListener?.('change',scheduleReinit);
window.addEventListener('orientationchange',()=>setTimeout(initGlass,220),{passive:true});
window.addEventListener('resize',scheduleReinit,{passive:true});
window.addEventListener('editorial:view',()=>setTimeout(markChanged,60));
window.addEventListener('editorial:rendered',()=>setTimeout(markChanged,60));
const themeRoot=document.getElementById('glassRoot');
if(themeRoot)new MutationObserver(m=>{if(m.some(x=>x.attributeName==='data-theme'))scheduleReinit()}).observe(themeRoot,{attributes:true,attributeFilter:['data-theme']});
const boot=()=>setTimeout(()=>initGlass().catch(e=>console.info('LiquidGlass fallback CSS activo.',e)),90);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
