import { LiquidGlass } from 'https://cdn.jsdelivr.net/npm/@ybouane/liquidglass/dist/index.js';

const compactMQ=matchMedia('(max-width:899px)');
let instances=[];
let generation=0;
let resizeTimer=0;

const configs={
  top:{blurAmount:.22,refraction:.52,chromAberration:.010,edgeHighlight:.09,specular:.11,fresnel:.62,distortion:.007,cornerRadius:26,zRadius:18,opacity:.95,saturation:.08,shadowOpacity:.14,shadowSpread:10,shadowOffsetY:2,floating:false,button:false},
  dock:{blurAmount:.24,refraction:.58,chromAberration:.009,edgeHighlight:.10,specular:.12,fresnel:.66,distortion:.006,cornerRadius:22,zRadius:17,opacity:.96,saturation:.09,shadowOpacity:.16,shadowSpread:11,shadowOffsetY:2,floating:false,button:false}
};

function destroyAll(){
  for(const instance of instances){try{instance?.destroy?.()}catch(e){console.debug('LiquidGlass destroy',e)}}
  instances=[];window.__liquidGlassInstances=[];
}

async function initGlass(){
  const current=++generation;destroyAll();
  const targets=[
    {root:document.getElementById('topGlassRoot'),el:document.getElementById('glassHeader'),config:configs.top},
    ...(compactMQ.matches?[{root:document.getElementById('dockGlassRoot'),el:document.getElementById('mobileDock'),config:configs.dock}]:[])
  ];
  for(const item of targets){
    if(current!==generation)return;
    if(!item.root||!item.el)continue;
    item.el.dataset.config=JSON.stringify(item.config);
    try{
      const instance=await LiquidGlass.init({root:item.root,glassElements:[item.el]});
      if(current!==generation){instance.destroy?.();return}
      instances.push(instance);
    }catch(e){console.info('LiquidGlass: fallback CSS activo para esta superficie.',e)}
  }
  window.__liquidGlassInstances=instances;
}

function scheduleReinit(){clearTimeout(resizeTimer);resizeTimer=setTimeout(initGlass,180)}
compactMQ.addEventListener?.('change',scheduleReinit);
window.addEventListener('orientationchange',()=>setTimeout(initGlass,180),{passive:true});
window.addEventListener('resize',scheduleReinit,{passive:true});
const themeRoot=document.getElementById('glassRoot');
if(themeRoot)new MutationObserver(m=>{if(m.some(x=>x.attributeName==='data-theme'))scheduleReinit()}).observe(themeRoot,{attributes:true,attributeFilter:['data-theme']});

initGlass().catch(e=>console.info('LiquidGlass fallback CSS activo.',e));
