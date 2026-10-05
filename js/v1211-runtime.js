(()=>{
'use strict';
const VERSION='12.11';
const INSTALLER='./INSTALL_EDITORIAL_OS_DESKTOP.command?v=12.11';
const TERMINAL='curl -fL "https://lordjeferies.github.io/editorial-os/INSTALL_EDITORIAL_OS_DESKTOP.command?v=12.11" -o "$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command" && chmod +x "$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command" && "$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command"';
const $=(s,r=document)=>r.querySelector(s);

function ensureCss(){
  if(document.getElementById('v1211Css'))return;
  const l=document.createElement('link');
  l.id='v1211Css';
  l.rel='stylesheet';
  l.href='./css/v1211.css?v=12.11';
  document.head.appendChild(l);
}
function toast(text){
  let el=$('#v1211Toast');
  if(!el){
    el=document.createElement('div');
    el.id='v1211Toast';
    el.className='v1211-toast';
    document.body.appendChild(el);
  }
  el.textContent=text;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),1800);
}
function copyText(text){
  if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);
  const ta=document.createElement('textarea');
  ta.value=text;
  ta.style.position='fixed';
  ta.style.opacity='0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return Promise.resolve();
}
function downloadInstaller(){
  const a=document.createElement('a');
  a.href=INSTALLER;
  a.download='INSTALL_EDITORIAL_OS_DESKTOP.command';
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast('Instalador Desktop descargado');
}
function closeSheet(){
  $('#v1211DesktopSheet')?.classList.remove('open');
}
function ensureSheet(){
  if($('#v1211DesktopSheet'))return;
  const wrap=document.createElement('div');
  wrap.id='v1211DesktopSheet';
  wrap.className='v1211-sheet';
  wrap.innerHTML=`
    <section class="v1211-sheet-card" role="dialog" aria-modal="true" aria-labelledby="v1211DesktopTitle">
      <div class="v1211-sheet-grab" aria-hidden="true"></div>
      <header>
        <div>
          <small>Editorial OS · macOS</small>
          <h2 id="v1211DesktopTitle">Versión Desktop</h2>
        </div>
        <button type="button" id="v1211DesktopClose" aria-label="Cerrar">×</button>
      </header>
      <div class="v1211-sheet-body">
        <div class="v1211-desktop-icon">J</div>
        <div class="v1211-desktop-copy">
          <strong>Una app real, sin abrir Safari ni Chrome.</strong>
          <p>Instala <b>Editorial OS.app</b> en tu Mac. La ventana usa WKWebView y carga esta misma GitHub Page, así que las actualizaciones publicadas aquí aparecen también en la app Desktop sin reinstalarla.</p>
        </div>
        <div class="v1211-desktop-facts">
          <span>✓ Ventana propia</span>
          <span>✓ Icono en Aplicaciones</span>
          <span>✓ Alias en Escritorio</span>
          <span>✓ Mismo Supabase</span>
        </div>
        <button class="v1211-primary" id="v1211DownloadDesktop" type="button">Descargar instalador para Mac</button>
        <button class="v1211-secondary" id="v1211CopyDesktop" type="button">Copiar comando de instalación</button>
        <details>
          <summary>Instalación por Terminal</summary>
          <code id="v1211TerminalCode"></code>
        </details>
        <p class="v1211-note">Requiere macOS y las Command Line Tools de Apple para compilar el pequeño wrapper nativo. El instalador las detecta y explica qué hacer si faltan.</p>
      </div>
    </section>`;
  document.body.appendChild(wrap);
  $('#v1211TerminalCode').textContent=TERMINAL;
  wrap.addEventListener('click',e=>{if(e.target===wrap)closeSheet()});
  $('#v1211DesktopClose').addEventListener('click',closeSheet);
  $('#v1211DownloadDesktop').addEventListener('click',downloadInstaller);
  $('#v1211CopyDesktop').addEventListener('click',async()=>{
    await copyText(TERMINAL);
    toast('Comando copiado');
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&wrap.classList.contains('open'))closeSheet();
  });
}
function openSheet(){
  ensureSheet();
  $('#v1211DesktopSheet').classList.add('open');
}
function mountButton(){
  const actions=$('#homeView .home-quick-actions');
  if(actions&&!$('#v1211DesktopBtn')){
    const b=document.createElement('button');
    b.id='v1211DesktopBtn';
    b.type='button';
    b.innerHTML='<span>▣</span><b>Desktop macOS</b><small>Instalar como app</small>';
    b.addEventListener('click',openSheet);
    actions.appendChild(b);
  }
  const hero=$('#homeView .home-hero-actions');
  if(hero&&!$('#v1211HeroDesktop')){
    const b=document.createElement('button');
    b.id='v1211HeroDesktop';
    b.type='button';
    b.className='home-secondary v1211-hero-desktop';
    b.textContent='Descargar Desktop';
    b.addEventListener('click',openSheet);
    hero.appendChild(b);
  }
}
function patchVersion(){
  document.documentElement.dataset.editorialVersion=VERSION;
  document.title=document.title.replace(/V12\.(?:9|10)(?:\.\d+)?/g,`V${VERSION}`);
  const brand=$('#brandTitle');
  if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10)(?:\.\d+)?/g,`V${VERSION}`);
  window.EDITORIAL_OS_VERSION=VERSION;
  const api=window.EDITORIAL_OS_DIAGNOSTICS?.api;
  if(api?.diagnostics&&!api.diagnostics.__v1211){
    const previous=api.diagnostics.bind(api);
    const wrapped=async()=>({...await previous(),version:VERSION});
    wrapped.__v1211=true;
    api.diagnostics=wrapped;
  }
}
function init(){
  ensureCss();
  ensureSheet();
  mountButton();
  patchVersion();
  const home=$('#homeView');
  if(home){
    const mo=new MutationObserver(()=>mountButton());
    mo.observe(home,{childList:true,subtree:true});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();

/* V12.22: carga controlada por v1222-bootstrap.js. */
