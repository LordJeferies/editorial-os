/* Editorial OS V12.4 · progressive desktop glass
   Compact iPhone/iPad mode intentionally uses CSS system blur only. This avoids
   WebGL lifecycle/compositing work during touch, keyboard and drag operations. */
const compactMQ=matchMedia('(max-width:899px)');
let instances=[];
let generation=0;
let resizeTimer=0;
let LiquidGlassCtor=null;

const topConfig={blurAmount:.20,refraction:.46,chromAberration:.006,edgeHighlight:.08,specular:.09,fresnel:.58,distortion:.005,cornerRadius:26,zRadius:18,opacity:.95,saturation:.06,shadowOpacity:.12,shadowSpread:9,shadowOffsetY:2,floating:false,button:false};

async function destroyAll(){
  for(const instance of instances){try{await instance?.destroy?.()}catch(e){console.debug('LiquidGlass destroy',e)}}
  instances=[];window.__liquidGlassInstances=[];
}
async function loadLiquidGlass(){
  if(LiquidGlassCtor)return LiquidGlassCtor;
  const mod=await import('https://cdn.jsdelivr.net/npm/@ybouane/liquidglass/dist/index.js');
  LiquidGlassCtor=mod.LiquidGlass;return LiquidGlassCtor;
}
async function initGlass(){
  const current=++generation;await destroyAll();
  // On compact touch layouts CSS backdrop-filter is deliberately preferred.
  if(compactMQ.matches)return;
  const root=document.getElementById('topGlassRoot'),el=document.getElementById('glassHeader');
  if(!root||!el)return;
  try{
    const LiquidGlass=await loadLiquidGlass();if(current!==generation)return;
    el.dataset.config=JSON.stringify(topConfig);
    const instance=await LiquidGlass.init({root,glassElements:[el]});
    if(current!==generation){await instance?.destroy?.();return}
    instances=[instance];window.__liquidGlassInstances=instances;
  }catch(e){console.info('LiquidGlass: fallback CSS activo.',e)}
}
function scheduleReinit(){clearTimeout(resizeTimer);resizeTimer=setTimeout(initGlass,180)}
compactMQ.addEventListener?.('change',scheduleReinit);
window.addEventListener('orientationchange',()=>setTimeout(initGlass,180),{passive:true});
window.addEventListener('resize',scheduleReinit,{passive:true});
const themeRoot=document.getElementById('glassRoot');
if(themeRoot)new MutationObserver(m=>{if(m.some(x=>x.attributeName==='data-theme'))scheduleReinit()}).observe(themeRoot,{attributes:true,attributeFilter:['data-theme']});
initGlass().catch(e=>console.info('LiquidGlass fallback CSS activo.',e));
