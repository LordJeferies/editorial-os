(()=>{
'use strict';
const VERSION='12.14';
const KEY='editorialV1214AuthProfiles';
const SELECTED='editorialV1214SelectedProfile';
const $=(s,r=document)=>r.querySelector(s);

function ensureCss(){
  if($('#v1214Css'))return;
  const l=document.createElement('link');l.id='v1214Css';l.rel='stylesheet';l.href='./css/v1214.css?v=12.14';document.head.appendChild(l);
}
function readProfiles(){
  try{return JSON.parse(localStorage.getItem(KEY)||'[]').filter(x=>x&&x.email)}catch{return []}
}
function saveProfiles(list){localStorage.setItem(KEY,JSON.stringify(list.slice(0,12)))}
function setMessage(text,type='info'){
  const el=$('#v1213Message');if(!el)return;el.textContent=text;el.dataset.type=type;el.hidden=!text;
}
function currentConnectedEmail(){
  const text=$('#cloudAccountState')?.textContent?.trim()||'';
  return text.match(/^Conectado como\s+(.+)/i)?.[1]?.trim()||'';
}
function normalizeLabel(email,label=''){
  return (label||String(email).split('@')[0]||'Perfil').trim().slice(0,32);
}
function upsertProfile(email,label=''){
  email=String(email||'').trim().toLowerCase();if(!email)return;
  const list=readProfiles();const i=list.findIndex(x=>x.email.toLowerCase()===email);
  const item={email,label:normalizeLabel(email,label),updatedAt:new Date().toISOString()};
  if(i>=0)list[i]={...list[i],...item};else list.unshift(item);
  saveProfiles(list);localStorage.setItem(SELECTED,email);renderProfiles();
}
function removeProfile(email){
  const list=readProfiles().filter(x=>x.email!==email);saveProfiles(list);
  if(localStorage.getItem(SELECTED)===email)localStorage.removeItem(SELECTED);
  renderProfiles();
}
function chooseProfile(email){
  const input=$('#v1213Email');if(input)input.value=email;
  localStorage.setItem(SELECTED,email);
  renderProfiles();
  setMessage('Perfil seleccionado. Escribe tu contraseña y pulsa Entrar.','ok');
  setTimeout(()=>$('#v1213Password')?.focus(),30);
}
function renderProfiles(){
  const root=$('#v1214ProfileList');if(!root)return;
  const list=readProfiles(),selected=localStorage.getItem(SELECTED)||'';
  root.innerHTML='';
  if(!list.length){
    root.innerHTML='<div class="v1214-empty">Todavía no hay perfiles guardados en este dispositivo. Escribe un email y pulsa “Guardar perfil”.</div>';
    return;
  }
  list.forEach(p=>{
    const row=document.createElement('div');row.className='v1214-profile'+(p.email===selected?' selected':'');
    row.innerHTML=`<button type="button" class="v1214-profile-main"><span class="v1214-avatar">${(p.label||p.email).slice(0,1).toUpperCase()}</span><span><b>${escapeHtml(p.label||p.email)}</b><small>${escapeHtml(p.email)}</small></span></button><button type="button" class="v1214-remove" aria-label="Eliminar perfil">×</button>`;
    row.querySelector('.v1214-profile-main').onclick=()=>chooseProfile(p.email);
    row.querySelector('.v1214-remove').onclick=()=>removeProfile(p.email);
    root.appendChild(row);
  });
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function mount(){
  const settings=$('#v1213Settings');if(!settings)return false;
  const accountSection=$('#v1213Email')?.closest('.v1213-section');if(!accountSection)return false;
  if(!$('#v1214Profiles')){
    const box=document.createElement('div');box.id='v1214Profiles';box.className='v1214-profiles';
    box.innerHTML=`<div class="v1214-head"><div><small>Perfiles rápidos</small><strong>Elige usuario y escribe sólo la contraseña</strong></div><button id="v1214SaveProfile" type="button">Guardar perfil</button></div><div id="v1214ProfileList" class="v1214-list"></div><p class="v1214-note">Se guardan sólo el nombre y el email en este dispositivo. La contraseña no se guarda en la repo ni en localStorage. Supabase mantiene la sesión iniciada para que normalmente no tengas que escribirla de nuevo.</p>`;
    const emailLabel=$('#v1213Email')?.closest('label');accountSection.insertBefore(box,emailLabel||accountSection.firstChild);
    $('#v1214SaveProfile').onclick=()=>{
      const email=$('#v1213Email')?.value.trim()||currentConnectedEmail();
      if(!email){setMessage('Escribe primero el email que quieres guardar.','error');$('#v1213Email')?.focus();return}
      const existing=readProfiles().find(x=>x.email===email);
      const label=prompt('Nombre para este perfil',existing?.label||normalizeLabel(email));
      if(label===null)return;upsertProfile(email,label);setMessage('Perfil guardado en este dispositivo.','ok');
    };
    $('#v1213SignIn')?.addEventListener('click',()=>{const email=$('#v1213Email')?.value.trim();if(email)upsertProfile(email)},true);
  }
  const connected=currentConnectedEmail();if(connected&&!readProfiles().some(x=>x.email===connected))upsertProfile(connected);
  const selected=localStorage.getItem(SELECTED)||readProfiles()[0]?.email||'';
  if(selected&&!$('#v1213Email')?.value)$('#v1213Email').value=selected;
  renderProfiles();
  return true;
}
function patchVersion(){
  document.documentElement.dataset.editorialVersion=VERSION;
  document.title=document.title.replace(/V12\.(?:9|10|11|12|13)(?:\.\d+)?/g,`V${VERSION}`);
  const brand=$('#brandTitle');if(brand)brand.textContent=brand.textContent.replace(/V12\.(?:9|10|11|12|13)(?:\.\d+)?/g,`V${VERSION}`);
  window.EDITORIAL_OS_VERSION=VERSION;
}
function init(){
  ensureCss();patchVersion();
  let tries=0;const timer=setInterval(()=>{tries++;if(mount()||tries>100)clearInterval(timer)},80);
  new MutationObserver(()=>mount()).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
