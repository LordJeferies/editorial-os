(()=>{
'use strict';
const VERSION='12.13';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
let statusTimer=null;

function ensureCss(){
  if($('#v1213Css'))return;
  const l=document.createElement('link');
  l.id='v1213Css';l.rel='stylesheet';l.href='./css/v1213.css?v=12.13';
  document.head.appendChild(l);
}
function config(){
  let local={};
  try{local=JSON.parse(localStorage.getItem('jocEditorialV9Cloud')||'{}')||{}}catch{}
  return {...(window.EDITORIAL_SUPABASE||{}),...local};
}
function official(){return window.EDITORIAL_SUPABASE||{url:'',key:''}}
function accountText(){return $('#cloudAccountState')?.textContent?.trim()||'No conectado.'}
function connected(){return /^Conectado como\s+/i.test(accountText())}
function emailFromState(){const m=accountText().match(/^Conectado como\s+(.+)/i);return m?.[1]?.trim()||''}
function maskKey(k){
  k=String(k||'');if(!k)return 'No configurada';
  if(k.length<24)return k;
  return `${k.slice(0,12)}••••••••${k.slice(-10)}`;
}
function msg(text,type='info'){
  const e=$('#v1213Message');if(!e)return;
  e.textContent=text||'';e.dataset.type=type;e.hidden=!text;
}
async function copy(text,label='Copiado'){
  try{
    if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);
    else{
      const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();
    }
    msg(label,'ok');
  }catch{msg('No se pudo copiar. Mantén pulsado sobre el valor para copiarlo.','error')}
}
function update(){
  const c=config(),off=official(),isConnected=connected(),email=emailFromState();
  const pill=$('#v1213ConnPill');if(pill){pill.textContent=isConnected?'Conectado':'Falta iniciar sesión';pill.dataset.state=isConnected?'ok':'warn'}
  const acct=$('#v1213AccountState');if(acct)acct.textContent=isConnected?`Sesión activa: ${email}`:'El proyecto ya está configurado. Inicia sesión con tu usuario de Supabase para sincronizar.';
  const sync=$('#v1213SyncState');if(sync)sync.textContent=$('#syncStatus')?.textContent?.trim()||'Local';
  const url=$('#v1213ProjectUrl');if(url)url.value=c.url||off.url||'';
  const key=$('#v1213ProjectKey');if(key){key.value=c.key||off.key||'';key.type=key.dataset.revealed==='1'?'text':'password'}
  const keyPreview=$('#v1213KeyPreview');if(keyPreview)keyPreview.textContent=maskKey(c.key||off.key||'');
  const emailInput=$('#v1213Email');if(emailInput&&!emailInput.matches(':focus')&&!emailInput.value&&email)emailInput.value=email;
  const pre=$('#v1213Preconfigured');if(pre)pre.hidden=!(off.url&&off.key);
}
function forwardAuth(kind){
  const email=$('#v1213Email')?.value.trim()||'';
  const pass=$('#v1213Password')?.value||'';
  if((kind==='in'||kind==='up')&&(!email||!pass)){
    msg('Escribe email y contraseña. Las claves del proyecto ya están preconfiguradas.','error');
    (!email?$('#v1213Email'):$('#v1213Password'))?.focus();return;
  }
  const oe=$('#cloudEmail'),op=$('#cloudPassword');
  if(oe)oe.value=email;if(op)op.value=pass;
  const id=kind==='in'?'cloudSignInBtn':kind==='up'?'cloudSignUpBtn':'cloudSignOutBtn';
  const btn=document.getElementById(id);
  if(!btn){msg('No encuentro el módulo de Supabase. Recarga la app.','error');return}
  msg(kind==='out'?'Cerrando sesión…':kind==='up'?'Creando cuenta…':'Iniciando sesión…');
  btn.click();
  clearInterval(statusTimer);
  let ticks=0;
  statusTimer=setInterval(()=>{
    update();ticks++;
    if(connected()){
      clearInterval(statusTimer);$('#v1213Password').value='';msg('Supabase conectado. La sincronización ya puede funcionar.','ok');
    }else if(ticks>12){clearInterval(statusTimer);msg('Si no conectó, revisa email/contraseña o crea la cuenta desde aquí.','error')}
  },500);
}
function sync(kind){
  update();
  if(!connected()){
    msg('Primero inicia sesión. El Project URL y la anon key ya están cargados.','error');
    $('#v1213Email')?.focus();return;
  }
  const btn=document.getElementById(kind==='push'?'cloudPushBtn':'cloudPullBtn');
  if(!btn)return msg('No encuentro el control de sincronización.','error');
  btn.click();msg(kind==='push'?'Subiendo cambios…':'Bajando cambios…');
  setTimeout(update,700);
}
function openAdvanced(){
  close();
  window.EDITORIAL_V123_API?.navigate?.('inventoryView');
  setTimeout(()=>document.querySelector('[data-library-tab="cloud"]')?.click(),40);
}
function restoreOfficial(){
  const off=official();
  if(!off.url||!off.key)return msg('La configuración oficial no está disponible en esta carga.','error');
  localStorage.removeItem('jocEditorialV9Cloud');
  msg('Configuración oficial restaurada. Recargando…','ok');
  setTimeout(()=>location.reload(),450);
}
function close(){document.getElementById('v1213Settings')?.classList.remove('open')}
function open(){ensureSheet();update();document.getElementById('v1213Settings')?.classList.add('open');setTimeout(update,50)}
function ensureSheet(){
  if($('#v1213Settings'))return;
  const w=document.createElement('div');w.id='v1213Settings';w.className='v1213-settings';
  w.innerHTML=`<section class="v1213-card" role="dialog" aria-modal="true" aria-labelledby="v1213Title">
    <div class="v1213-grab"></div>
    <header class="v1213-head">
      <div><small>Editorial OS · Configuración</small><h2 id="v1213Title">Cuenta y Supabase</h2></div>
      <button id="v1213Close" type="button" aria-label="Cerrar">×</button>
    </header>
    <div class="v1213-body">
      <div class="v1213-status-row"><span id="v1213ConnPill" class="v1213-pill">Comprobando…</span><span>Sync: <b id="v1213SyncState">Local</b></span></div>
      <div id="v1213Preconfigured" class="v1213-callout ok">✓ Este proyecto de Supabase ya viene preconfigurado en Editorial OS. Normalmente sólo tienes que iniciar sesión una vez en cada navegador/PWA/app Desktop.</div>
      <div id="v1213Message" class="v1213-callout" hidden></div>

      <section class="v1213-section">
        <div class="v1213-section-head"><div><small>1 · Cuenta</small><h3>Iniciar sesión</h3></div></div>
        <p id="v1213AccountState" class="v1213-muted"></p>
        <label>Email<input id="v1213Email" type="email" autocomplete="username" placeholder="tu@email.com"></label>
        <label>Contraseña<input id="v1213Password" type="password" autocomplete="current-password" placeholder="••••••••"></label>
        <div class="v1213-actions"><button id="v1213SignIn" class="primary" type="button">Entrar</button><button id="v1213SignUp" type="button">Crear cuenta</button><button id="v1213SignOut" type="button">Salir</button></div>
      </section>

      <section class="v1213-section">
        <div class="v1213-section-head"><div><small>2 · Sincronización</small><h3>Estado compartido</h3></div><span class="v1213-tag">editorial-os</span></div>
        <div class="v1213-facts"><span><b>Tabla</b> public.editorial_state</span><span><b>Workspace</b> editorial-os</span><span><b>Payload</b> version 9</span></div>
        <div class="v1213-actions"><button id="v1213Push" type="button">Subir ahora</button><button id="v1213Pull" type="button">Bajar ahora</button></div>
      </section>

      <details class="v1213-section v1213-advanced">
        <summary><div><small>3 · Proyecto</small><h3>Claves públicas y conexión</h3></div><span>Mostrar</span></summary>
        <p class="v1213-muted">Estas son credenciales públicas de cliente. Nunca coloques aquí una service_role key.</p>
        <label>Project URL<div class="v1213-copy-row"><input id="v1213ProjectUrl" readonly><button id="v1213CopyUrl" type="button">Copiar</button></div></label>
        <label>Publishable / anon key<div class="v1213-copy-row"><input id="v1213ProjectKey" type="password" readonly><button id="v1213RevealKey" type="button">Ver</button><button id="v1213CopyKey" type="button">Copiar</button></div><small id="v1213KeyPreview" class="v1213-code"></small></label>
        <div class="v1213-actions"><button id="v1213Restore" type="button">Restaurar configuración oficial</button><button id="v1213Advanced" type="button">Configuración avanzada</button></div>
      </details>
    </div>
  </section>`;
  document.body.appendChild(w);
  w.addEventListener('click',e=>{if(e.target===w)close()});
  $('#v1213Close').onclick=close;
  $('#v1213SignIn').onclick=()=>forwardAuth('in');
  $('#v1213SignUp').onclick=()=>forwardAuth('up');
  $('#v1213SignOut').onclick=()=>forwardAuth('out');
  $('#v1213Push').onclick=()=>sync('push');
  $('#v1213Pull').onclick=()=>sync('pull');
  $('#v1213CopyUrl').onclick=()=>copy(config().url||official().url||'','Project URL copiada');
  $('#v1213CopyKey').onclick=()=>copy(config().key||official().key||'','Anon key copiada');
  $('#v1213RevealKey').onclick=()=>{const i=$('#v1213ProjectKey');const show=i.dataset.revealed!=='1';i.dataset.revealed=show?'1':'0';i.type=show?'text':'password';$('#v1213RevealKey').textContent=show?'Ocultar':'Ver'};
  $('#v1213Restore').onclick=restoreOfficial;
  $('#v1213Advanced').onclick=openAdvanced;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&w.classList.contains('open'))close()});
  const acct=$('#cloudAccountState');if(acct)new MutationObserver(update).observe(acct,{childList:true,subtree:true,characterData:true});
  const syncState=$('#syncStatus');if(syncState)new MutationObserver(update).observe(syncState,{childList:true,subtree:true,characterData:true});
}
function mountTriggers(){
  const quick=$('#homeView .home-quick-actions');
  if(quick&&!$('#v1213SettingsHome')){
    const b=document.createElement('button');b.id='v1213SettingsHome';b.type='button';b.innerHTML='<span>⚙</span><b>Configuración</b><small>Cuenta · Supabase · sync</small>';b.onclick=open;quick.appendChild(b);
  }
  const desktop=$('#topGlassRoot .actions');
  if(desktop&&!$('#v1213SettingsTop')){
    const b=document.createElement('button');b.id='v1213SettingsTop';b.type='button';b.className='btn';b.textContent='Configuración';b.onclick=open;desktop.appendChild(b);
  }
  const mobile=$('.v124-toolbar-actions');
  if(mobile&&!$('#v1213SettingsMobile')){
    const b=document.createElement('button');b.id='v1213SettingsMobile';b.type='button';b.className='v124-icon-button v1213-gear';b.setAttribute('aria-label','Configuración');b.textContent='⚙';b.onclick=open;mobile.appendChild(b);
  }
  const cloudBtn=$('#openCloudSettingsBtn');
  if(cloudBtn&&!cloudBtn.dataset.v1213){cloudBtn.dataset.v1213='1';cloudBtn.textContent='Cuenta y configuración';cloudBtn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();$('#cloudQuickBg')?.classList.remove('open');open()},true)}
}
function patchVersion(){
  document.documentElement.dataset.editorialVersion=VERSION;
  document.title=document.title.replace(/V12\.(?:9|10|11|12)(?:\.\d+)?/g,`V${VERSION}`);
  const brand=$('#brandTitle');if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10|11|12)(?:\.\d+)?/g,`V${VERSION}`);
  window.EDITORIAL_OS_VERSION=VERSION;
}
function init(){
  ensureCss();ensureSheet();patchVersion();mountTriggers();update();
  new MutationObserver(()=>mountTriggers()).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* V12.14 additive loader */
(()=>{
  if(document.querySelector('script[data-editorial-v1214]'))return;
  const s=document.createElement('script');
  s.src='./js/v1214-runtime.js?v=12.14';
  s.defer=true;
  s.dataset.editorialV1214='1';
  document.head.appendChild(s);
})();
