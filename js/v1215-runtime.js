(()=>{
'use strict';
const VERSION='12.15';
const WELCOME_KEY='editorialV1215WelcomeSeen';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const tasks=new Map();
let seq=0,autoTimer=null,syncToken=null,authToken=null;

function ensureCss(){
  if($('#v1215Css'))return;
  const l=document.createElement('link');
  l.id='v1215Css';l.rel='stylesheet';l.href='./css/v1215.css?v=12.15';
  document.head.appendChild(l);
}
function mountProgress(){
  if($('#v1215Progress'))return;
  const bar=document.createElement('div');
  bar.id='v1215Progress';bar.className='v1215-progress';bar.setAttribute('aria-live','polite');
  bar.innerHTML='<div class="v1215-progress-line"><i></i></div><div class="v1215-progress-meta"><span id="v1215ProgressLabel">Preparando…</span><b id="v1215ProgressPct">0%</b></div>';
  document.body.appendChild(bar);
  const blocker=document.createElement('div');
  blocker.id='v1215Blocker';blocker.className='v1215-blocker';
  blocker.innerHTML='<section><div class="v1215-spinner"></div><h3 id="v1215BlockTitle">Procesando…</h3><p id="v1215BlockCopy">Esta operación necesita terminar antes de continuar.</p><strong id="v1215BlockPct">0%</strong></section>';
  document.body.appendChild(blocker);
}
function activeTask(){
  const arr=[...tasks.values()];
  return arr.findLast?.(x=>x.blocking)||arr[arr.length-1]||null;
}
function renderProgress(){
  mountProgress();
  const t=activeTask(),root=$('#v1215Progress'),block=$('#v1215Blocker');
  if(!t){root?.classList.remove('show','error');block?.classList.remove('open');return;}
  const pct=Math.max(0,Math.min(100,Math.round(t.percent||0)));
  root?.classList.add('show');root?.classList.toggle('error',!!t.error);
  const line=$('#v1215Progress .v1215-progress-line i');if(line)line.style.width=`${pct}%`;
  if($('#v1215ProgressLabel'))$('#v1215ProgressLabel').textContent=t.label||'Procesando…';
  if($('#v1215ProgressPct'))$('#v1215ProgressPct').textContent=`${pct}%`;
  if(t.blocking){
    block?.classList.add('open');
    if($('#v1215BlockTitle'))$('#v1215BlockTitle').textContent=t.label||'Procesando…';
    if($('#v1215BlockCopy'))$('#v1215BlockCopy').textContent=t.blockReason||'Esta operación necesita terminar antes de continuar.';
    if($('#v1215BlockPct'))$('#v1215BlockPct').textContent=`${pct}%`;
  }else block?.classList.remove('open');
}
function startProgress(label,{blocking=false,blockReason='',estimated=true}={}){
  const token=`p-${++seq}-${Date.now()}`;
  tasks.set(token,{token,label,percent:3,blocking,blockReason,error:false,estimated,createdAt:Date.now()});
  renderProgress();if(estimated)startAutoTick();return token;
}
function setProgress(token,percent,label){const t=tasks.get(token);if(!t)return;t.percent=Math.max(t.percent||0,Math.min(99,Number(percent)||0));if(label)t.label=label;renderProgress();}
function doneProgress(token,label){const t=tasks.get(token);if(!t)return;t.percent=100;if(label)t.label=label;renderProgress();setTimeout(()=>{tasks.delete(token);renderProgress();stopAutoTickIfIdle()},420);}
function failProgress(token,message){const t=tasks.get(token);if(!t)return;t.error=true;t.percent=100;t.label=message||'Ocurrió un error';renderProgress();setTimeout(()=>{tasks.delete(token);renderProgress();stopAutoTickIfIdle()},2200);}
function startAutoTick(){if(autoTimer)return;autoTimer=setInterval(()=>{let changed=false;for(const t of tasks.values()){if(!t.estimated||t.error||t.percent>=92)continue;const jump=t.percent<30?4:t.percent<70?2:1;t.percent=Math.min(92,t.percent+jump);changed=true;}if(changed)renderProgress();else stopAutoTickIfIdle();},420);}
function stopAutoTickIfIdle(){if([...tasks.values()].some(t=>t.estimated&&t.percent<92))return;clearInterval(autoTimer);autoTimer=null;}
async function runProgress(label,fn,opts={}){const token=startProgress(label,opts);try{const out=await fn({token,set:(p,l)=>setProgress(token,p,l)});doneProgress(token,opts.doneLabel||'Listo');return out;}catch(err){failProgress(token,err?.message||'Error');throw err;}}
window.EDITORIAL_PROGRESS={start:startProgress,set:setProgress,done:doneProgress,fail:failProgress,run:runProgress,tasks};

function showStartupProgress(){
  const t=startProgress('Cargando Editorial OS…',{estimated:false});
  setProgress(t,18,'Preparando interfaz…');
  requestAnimationFrame(()=>setProgress(t,42,'Cargando datos locales…'));
  const wait=()=>{if(window.EDITORIAL_V123_API){setProgress(t,72,'Conectando herramientas…');setTimeout(()=>{setProgress(t,92,'Finalizando…');setTimeout(()=>doneProgress(t,'Editorial OS listo'),100)},120);}else setTimeout(wait,60);};
  wait();
}
function connected(){return /^Conectado como\s+/i.test($('#cloudAccountState')?.textContent?.trim()||'');}
function wrapAsyncApi(){
  const api=window.EDITORIAL_V123_API;if(!api||api.__v1215)return false;api.__v1215=true;
  if(typeof api.forceSync==='function'){const previous=api.forceSync.bind(api);api.forceSync=()=>runProgress('Sincronizando con Supabase…',async({set})=>{set(18,'Preparando cambios…');const out=await previous();set(88,'Confirmando sincronización…');return out;},{blocking:false,doneLabel:'Sincronizado'});}
  if(typeof api.keepLocal==='function'){const previous=api.keepLocal.bind(api);api.keepLocal=()=>runProgress('Conservando cambios locales…',()=>previous(),{blocking:true,blockReason:'Se está resolviendo un conflicto de sincronización. Espera a que termine.'});}
  if(typeof api.acceptRemote==='function'){const previous=api.acceptRemote.bind(api);api.acceptRemote=()=>runProgress('Aplicando versión remota…',()=>Promise.resolve(previous()),{blocking:true,blockReason:'Se está reemplazando el estado local por la versión remota seleccionada.'});}
  return true;
}
function observeSync(){
  const el=$('#syncStatus');if(!el||el.dataset.v1215)return;el.dataset.v1215='1';
  const read=()=>{const s=el.textContent?.trim()||'';if(/sincronizando|bajando|subiendo/i.test(s)){if(!syncToken)syncToken=startProgress(s,{estimated:true});else {const t=tasks.get(syncToken);if(t)t.label=s;renderProgress();}}else if(/sincronizado/i.test(s)){if(syncToken){doneProgress(syncToken,'Sincronizado');syncToken=null}}else if(/error|pendiente/i.test(s)){if(syncToken){failProgress(syncToken,s);syncToken=null}}};
  new MutationObserver(read).observe(el,{childList:true,subtree:true,characterData:true});read();
}
function observeAuth(){
  const inBtn=$('#cloudSignInBtn'),upBtn=$('#cloudSignUpBtn');
  [inBtn,upBtn].forEach(btn=>{if(!btn||btn.dataset.v1215)return;btn.dataset.v1215='1';btn.addEventListener('click',()=>{if(authToken)return;authToken=startProgress(btn===upBtn?'Creando cuenta…':'Iniciando sesión…',{estimated:true});let ticks=0;const timer=setInterval(()=>{ticks++;if(connected()){clearInterval(timer);doneProgress(authToken,'Sesión iniciada');authToken=null}else if(ticks>24){clearInterval(timer);failProgress(authToken,'No se pudo confirmar la sesión');authToken=null}},300);},true);});
}
function closeWelcome(markSeen=true){if(markSeen)localStorage.setItem(WELCOME_KEY,'1');$('#v1215Welcome')?.classList.remove('open');}
function openWelcome(force=false){ensureWelcome();if(!force&&localStorage.getItem(WELCOME_KEY)==='1')return;$('#v1215Welcome')?.classList.add('open');}
function ensureWelcome(){
  if($('#v1215Welcome'))return;
  const w=document.createElement('div');w.id='v1215Welcome';w.className='v1215-welcome';
  w.innerHTML=`<section class="v1215-welcome-card" role="dialog" aria-modal="true" aria-labelledby="v1215WelcomeTitle"><div class="v1215-welcome-mark">J</div><small>EDITORIAL OS · V${VERSION}</small><h1 id="v1215WelcomeTitle">Todo tu plan editorial en un solo lugar.</h1><p>Planifica la semana, revisa contenidos, sincroniza dispositivos y conecta asistentes de IA mediante MCP.</p><div class="v1215-welcome-grid"><article><b>Planifica</b><span>Tablero, Agenda y Matriz editan la misma semana.</span></article><article><b>Sincroniza</b><span>Web, PWA, Mac y MCP usan el mismo Supabase.</span></article><article><b>IA / MCP</b><span>Permite que un asistente lea y actualice el plan con herramientas controladas.</span></article></div><div class="v1215-welcome-actions"><button id="v1215WelcomeStart" class="primary" type="button">Entrar a Editorial OS</button><button id="v1215WelcomeAccount" type="button">Configurar cuenta</button><button id="v1215WelcomeMcp" type="button">Ver MCP</button></div><p class="v1215-welcome-note">Las cargas normales no bloquean la app. Si una operación necesita bloquearla, Editorial OS lo indicará claramente.</p></section>`;
  document.body.appendChild(w);
  $('#v1215WelcomeStart').onclick=()=>closeWelcome(true);
  $('#v1215WelcomeAccount').onclick=()=>{closeWelcome(true);setTimeout(()=>$('#v1213SettingsHome,#v1213SettingsMobile,#v1213SettingsTop')?.click(),30)};
  $('#v1215WelcomeMcp').onclick=()=>{closeWelcome(true);openMcp()};
}
function mcpInstallCommand(){return 'curl -fL "https://lordjeferies.github.io/editorial-os/INSTALL_EDITORIAL_MCP.command" -o "$HOME/Downloads/INSTALL_EDITORIAL_MCP.command" && chmod +x "$HOME/Downloads/INSTALL_EDITORIAL_MCP.command" && "$HOME/Downloads/INSTALL_EDITORIAL_MCP.command"';}
async function copyText(text){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();}
function ensureMcp(){
  if($('#v1215Mcp'))return;
  const w=document.createElement('div');w.id='v1215Mcp';w.className='v1215-mcp';
  w.innerHTML=`<section class="v1215-mcp-card" role="dialog" aria-modal="true" aria-labelledby="v1215McpTitle"><header><div><small>Editorial OS · IA</small><h2 id="v1215McpTitle">MCP Control Center</h2></div><button id="v1215McpClose" type="button" aria-label="Cerrar">×</button></header><div class="v1215-mcp-body"><div class="v1215-mcp-status"><span id="v1215McpDot"></span><div><b id="v1215McpState">Comprobando…</b><small>Workspace: editorial-os · Supabase compartido</small></div></div><p>El MCP permite que un asistente compatible consulte y modifique Planner, biblioteca, notas, producción, escenarios y marcas usando la misma fuente de datos de la app.</p><div class="v1215-mcp-facts"><span>✓ Planner</span><span>✓ Contenidos</span><span>✓ Notas</span><span>✓ Producción</span><span>✓ Escenarios</span><span>✓ Marcas</span><span>✓ Backup</span><span>✓ Diagnóstico</span></div><div class="v1215-mcp-actions"><a class="primary" href="./INSTALL_EDITORIAL_MCP.command" download>Descargar instalador MCP</a><a href="./mcp.html" target="_blank" rel="noopener">Guía MCP</a><button id="v1215CopyMcp" type="button">Copiar comando</button></div><div class="v1215-mcp-callout">El MCP corre localmente en tu Mac y se autentica con un usuario real de Supabase. No necesita ni debe usar una <code>service_role</code>.</div></div></section>`;
  document.body.appendChild(w);w.addEventListener('click',e=>{if(e.target===w)closeMcp()});$('#v1215McpClose').onclick=closeMcp;$('#v1215CopyMcp').onclick=async()=>{await copyText(mcpInstallCommand());const b=$('#v1215CopyMcp');if(b){b.textContent='Copiado';setTimeout(()=>b.textContent='Copiar comando',1200)}};
}
function updateMcp(){const ok=connected(),dot=$('#v1215McpDot'),state=$('#v1215McpState');if(dot)dot.dataset.ok=ok?'1':'0';if(state)state.textContent=ok?'App conectada a Supabase':'App en modo local';}
function openMcp(){ensureMcp();updateMcp();$('#v1215Mcp')?.classList.add('open')}
function closeMcp(){$('#v1215Mcp')?.classList.remove('open')}
function mountMcpTriggers(){
  const quick=$('#homeView .home-quick-actions');if(quick&&!$('#v1215McpHome')){const b=document.createElement('button');b.id='v1215McpHome';b.type='button';b.innerHTML='<span>⌘</span><b>MCP / IA</b><small>Controlar Editorial OS con asistentes</small>';b.onclick=openMcp;quick.appendChild(b);}
  const settingsBody=$('#v1213Settings .v1213-body');if(settingsBody&&!$('#v1215SettingsSection')){const s=document.createElement('section');s.id='v1215SettingsSection';s.className='v1213-section v1215-settings-section';s.innerHTML='<div class="v1213-section-head"><div><small>4 · IA</small><h3>MCP</h3></div><span class="v1213-tag">Local</span></div><p class="v1213-muted">Conecta asistentes compatibles a las herramientas de Editorial OS sin exponer secretos administrativos.</p><div class="v1213-actions"><button id="v1215OpenMcpSettings" type="button">Abrir MCP</button><button id="v1215OpenWelcome" type="button">Ver bienvenida</button></div>';settingsBody.appendChild(s);$('#v1215OpenMcpSettings').onclick=()=>{document.getElementById('v1213Settings')?.classList.remove('open');openMcp()};$('#v1215OpenWelcome').onclick=()=>{document.getElementById('v1213Settings')?.classList.remove('open');openWelcome(true)};}
}
function deepLinks(){const p=new URLSearchParams(location.search);if(p.get('welcome')==='1')setTimeout(()=>openWelcome(true),150);if(p.get('mcp')==='1')setTimeout(openMcp,180);}
function patchVersion(){
  document.documentElement.dataset.editorialVersion=VERSION;
  document.title=document.title.replace(/V12\.(?:9|10|11|12|13|14)(?:\.\d+)?/g,`V${VERSION}`);
  const brand=$('#brandTitle');if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10|11|12|13|14)(?:\.\d+)?/g,`V${VERSION}`);
  window.EDITORIAL_OS_VERSION=VERSION;
  const api=window.EDITORIAL_OS_DIAGNOSTICS?.api;if(api?.diagnostics&&!api.diagnostics.__v1215){const previous=api.diagnostics.bind(api);const wrapped=async()=>({...await previous(),version:VERSION,progressTasks:tasks.size,mcp:{workspace:'editorial-os',supabaseConnected:connected()}});wrapped.__v1215=true;api.diagnostics=wrapped;}
}
function init(){
  ensureCss();mountProgress();ensureWelcome();ensureMcp();patchVersion();
  let tries=0;const timer=setInterval(()=>{tries++;wrapAsyncApi();observeSync();observeAuth();mountMcpTriggers();updateMcp();if(tries>120)clearInterval(timer)},100);
  new MutationObserver(()=>{mountMcpTriggers();observeSync();observeAuth();updateMcp()}).observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>openWelcome(false),420);deepLinks();
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMcp();if($('#v1215Welcome')?.classList.contains('open'))closeWelcome(false)}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
