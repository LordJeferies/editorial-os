const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const ok=(cond,msg)=>{if(!cond){console.error('FAIL:',msg);process.exit(1)}console.log('PASS:',msg)};
const html=read('index.html'),css=read('css/v126.css'),rt=read('js/v126-runtime.js'),app=read('js/app-core.js'),sw=read('sw.js');
ok(/V12\.6/.test(html),'HTML version V12.6');
ok(html.includes('./css/v124.css')&&html.includes('./css/v126.css'),'V12.4 visual layer + V12.6 recovery layer linked');
ok(!html.includes('./css/v125.css'),'V12.5 simplification CSS not active');
ok(html.includes('./js/v124-runtime.js')&&html.includes('./js/v126-runtime.js'),'V12.4 mobile shell + V12.6 runtime active');
ok(!html.includes('./js/v125-runtime.js'),'V12.5 simplified runtime not active');
ok(css.includes('grid-template-columns:repeat(3,calc((100% - (2 * var(--ig-gap)))/3))')||css.includes('grid-template-columns:repeat(3,calc((100% - 2px)/3))'),'Instagram exact 3-column grid rule');
ok(css.includes('contain:layout paint')&&css.includes('device-mobile.instagram-sim'),'Instagram contained internal viewport');
ok(rt.includes('innerWidth(wrap)')&&rt.includes("Math.min(390"),'feed shell fitted to real available width');
ok(rt.includes("const track=Math.max(1,(grid.clientWidth-(gap*2))/3)")&&rt.includes("grid.style.setProperty('grid-template-columns',`${track}px ${track}px ${track}px`"),'runtime enforces exact Instagram pixel tracks from real grid width');
ok(app.includes('function linkedinL2ForDate')&&app.includes('socialRaw(date,opts)')&&app.includes('legacyCore'),'LinkedIn base content + additive L2 preserved');
ok(app.includes("linkedinLayer:'base'")&&app.includes("linkedinLayer:'l2'"),'LinkedIn layers explicit');
ok(app.includes("window.EDITORIAL_OS_VERSION='12.6'"),'domain runtime version V12.6');
ok(sw.includes("editorial-os-v12-6")&&sw.includes('./css/v126.css')&&sw.includes('./js/v126-runtime.js'),'service worker caches V12.6 active UI');

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
ok(mon.some(x=>x.masterKey==='li-l2-podcast-note-mon'),'LinkedIn adds L2 publication');
console.log('V12.6 UI/editorial tests: OK');
