const fs=require('fs');
function read(p){return fs.readFileSync(p,'utf8')}
const css=read('css/v127.css');
const js=read('js/v127-runtime.js');
const app=read('js/app-core.js');
const html=read('index.html');
const manifest=JSON.parse(read('manifest.webmanifest'));
function ok(v,msg){if(!v)throw new Error(msg)}
ok(html.includes('./css/v127.css'),'index no carga v127.css');
ok(html.includes('./js/v127-runtime.js'),'index no carga v127-runtime.js');
ok(manifest.name.includes('V12.7'),'manifest no es V12.7');
ok(css.includes('repeat(3,minmax(0,1fr))'),'falta grid Instagram de 3 tracks');
ok(css.includes('@media(max-width:399px)'),'falta banda <=399');
ok(css.includes('@media(min-width:400px) and (max-width:432px)'),'falta banda 400-432');
ok(css.includes('@media(min-width:433px) and (max-width:480px)'),'falta banda 433-480');
ok(css.includes('font-size:16px!important'),'falta prevención de Safari focus zoom');
ok(css.includes('--studio-tap: 44px'),'falta touch target 44');
ok(js.includes('window.visualViewport?.width'),'runtime no usa visualViewport');
ok(js.includes("if(w<=399)return 'phone-compact'"),'falta phone-compact');
ok(js.includes("if(w<=432)return 'phone-standard'"),'falta phone-standard');
ok(js.includes("if(w<=480)return 'phone-large'"),'falta phone-large');
ok(js.includes("state?.feedDevice==='desktop'"),'falta migración de preferencia desktop obsoleta');
ok(js.includes("grid.style.setProperty('grid-template-columns','repeat(3,minmax(0,1fr))'"),'runtime no fuerza 3 columnas');
ok(!html.includes('./css/v125.css'),'v125.css no debe cargarse');
ok(!html.includes('./js/v125-runtime.js'),'v125-runtime.js no debe cargarse');
ok(app.includes('function linkedinL2ForDate'),'falta LinkedIn L2');
ok(app.includes("linkedinLayer:'base'")&&app.includes("linkedinLayer:'l2'"),'LinkedIn base + L2 no está explícito');
ok(app.includes("window.EDITORIAL_OS_VERSION='12.7'"),'app-core no reporta V12.7');
console.log('test_v127_ui: OK');
