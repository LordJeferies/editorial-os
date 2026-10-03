const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const ok=(cond,msg)=>{if(!cond){console.error('FAIL:',msg);process.exit(1)}console.log('PASS:',msg)};
const html=read('index.html'),css=read('css/v125.css'),rt=read('js/v125-runtime.js'),app=read('js/app-core.js'),sw=read('sw.js');
ok(/V12\.5/.test(html),'HTML version V12.5');
ok(html.includes('./css/v125.css'),'V12.5 CSS linked');
ok(html.includes('./js/v125-runtime.js')&&!html.includes('./js/v124-runtime.js'),'V12.5 runtime replaces V12.4 UI runtime');
ok(css.includes('repeat(3,minmax(0,1fr))'),'Instagram grid is exact 3-column shrink-safe');
ok(css.includes('box-sizing:border-box!important')&&css.includes('device-mobile.instagram-sim'),'Instagram phone shell uses border-box');
ok(css.includes('#inventoryView>.library-toolbar{display:none!important}'),'cramped mobile library tab strip hidden');
ok(rt.includes('openLibrarySections')&&rt.includes('openLibraryStrategySheet')&&rt.includes('openLibrarySystemSheet'),'library uses nested sections');
ok(rt.includes('openFeedPlatformSheet')&&rt.includes('openFeedSettingsSheet'),'feed platform/settings moved to menus');
ok(rt.includes('openPlannerMenuSheet')&&rt.includes('openPlanMenu'),'planner actions use contextual menus');
ok(app.includes('function linkedinL2ForDate')&&app.includes('socialRaw(date,opts)')&&app.includes('legacyCore'),'LinkedIn base content preserved and L2 added');
ok(app.includes("linkedinLayer:'base'")&&app.includes("linkedinLayer:'l2'"),'LinkedIn base/L2 layers explicit');
ok(sw.includes('editorial-os-v12-5')&&sw.includes('./css/v125.css')&&sw.includes('./js/v125-runtime.js'),'service worker caches V12.5 UI');

function extractFunction(src,name){
  const start=src.indexOf(`function ${name}(`);if(start<0)throw new Error('missing '+name);
  let i=src.indexOf('{',start),depth=0,quote=null,esc=false;
  for(;i<src.length;i++){
    const c=src[i];if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}
    if(quote){if(c===quote)quote=null;continue}if(c==='"'||c==="'"||c==='`'){quote=c;continue}
    if(c==='{')depth++;else if(c==='}'&&--depth===0)return src.slice(start,i+1);
  }throw new Error('unclosed '+name);
}
const sandbox={console,state:{liMode:'core',mainSource:'webinar'},make:(masterKey,type,title,lot,order,role,note='',surface='Feed')=>({masterKey,type,title,lot,lotRank:{L1:1,L2:2,L3:3,EVENT:4}[lot]||4,order,role,note,surface}),socialRaw:(date)=>[
  {masterKey:'base-li-'+date.getDay(),title:'Base LinkedIn',type:'Carrusel LinkedIn',lot:'L1',lotRank:1,order:10,platforms:['instagram','linkedin']},
  {masterKey:'not-li',title:'Not LinkedIn',type:'Meme',lot:'L2',lotRank:2,order:10,platforms:['instagram']}
]};
vm.createContext(sandbox);
vm.runInContext(extractFunction(app,'linkedinL2ForDate')+'\n'+extractFunction(app,'linkedinRaw'),sandbox);
const mon=sandbox.linkedinRaw(new Date('2026-10-05T12:00:00'),{liMode:'core',mainSource:'webinar'});
ok(mon.some(x=>x.masterKey.startsWith('base-li-')),'LinkedIn keeps pre-existing base publication');
ok(mon.some(x=>x.masterKey==='li-l2-podcast-note-mon'),'LinkedIn core adds L2 publication');
const wedCore=sandbox.linkedinRaw(new Date('2026-10-07T12:00:00'),{liMode:'core',mainSource:'webinar'});
const wedDaily=sandbox.linkedinRaw(new Date('2026-10-07T12:00:00'),{liMode:'daily',mainSource:'webinar'});
ok(wedCore.filter(x=>x.linkedinLayer==='l2').length===0,'LinkedIn core remains 4 L2/week');
ok(wedDaily.some(x=>x.masterKey==='li-l2-authority-note-wed'),'LinkedIn daily expands to 7 L2/week');
console.log('V12.5 UI/editorial tests: OK');
