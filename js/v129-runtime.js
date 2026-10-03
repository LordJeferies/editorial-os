(()=>{
'use strict';
const VERSION='12.9';
const VOLUME_META={
  base:{label:'Base',hint:'0 extras/semana'},
  plus1:{label:'+1/día',hint:'hasta +7/semana'},
  plus12:{label:'+1/+2',hint:'hasta +10/semana'},
  plus2:{label:'+2/día',hint:'hasta +14/semana'},
  plus23:{label:'+2/+3',hint:'hasta +17/semana'},
  max:{label:'Máximo',hint:'sin tope'}
};
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

function currentVolume(){
  return $('.segbtn[data-volume].active')?.dataset.volume||'plus1';
}
function text(id,fallback='0'){
  return document.getElementById(id)?.textContent?.trim()||fallback;
}
function syncPreset(){
  const select=$('#v129WeeklyPreset');
  if(select)select.value=currentVolume();
}
function updateSummary(){
  const master=$('#v129PlanMaster');
  const publications=$('#v129PlanPublications');
  const linkedIn=$('#v129PlanLinkedIn');
  if(master)master.textContent=text('masterCount','0');
  if(publications)publications.textContent=text('publicationCount','0');
  if(linkedIn){
    const mode=$('#liMode')?.value||'core';
    linkedIn.textContent=mode==='daily'?'7':'4';
  }
  syncPreset();
}
function decorateVolumeButtons(controls){
  $$('.segbtn[data-volume]',controls).forEach(btn=>{
    const meta=VOLUME_META[btn.dataset.volume];
    if(!meta||btn.dataset.v129Decorated)return;
    btn.dataset.v129Decorated='1';
    btn.replaceChildren(document.createTextNode(meta.label));
    const small=document.createElement('small');
    small.className='v129-weekly-hint';
    small.textContent=meta.hint;
    btn.appendChild(small);
  });
}
function mount(){
  const controls=$('#calendarView > .controls');
  if(!controls||controls.dataset.v129Mounted)return;
  controls.dataset.v129Mounted='1';
  controls.setAttribute('aria-label','Ajustes generales del plan semanal');

  const rows=$$('.control-row',controls);
  const body=document.createElement('div');
  body.className='v129-plan-body';
  rows.forEach(row=>body.appendChild(row));

  const head=document.createElement('div');
  head.className='v129-plan-head';
  head.innerHTML=`
    <div class="v129-plan-copy">
      <small>Plan semanal</small>
      <strong>Ajusta frecuencia y mezcla sin entrar al Emulador</strong>
    </div>
    <button type="button" class="v129-plan-toggle" id="v129PlanToggle" aria-expanded="true">Ocultar</button>`;

  const summary=document.createElement('div');
  summary.className='v129-plan-summary';
  summary.innerHTML=`
    <div class="v129-plan-metric"><b id="v129PlanMaster">0</b><small>piezas maestras / semana</small></div>
    <div class="v129-plan-metric"><b id="v129PlanPublications">0</b><small>publicaciones / semana</small></div>
    <div class="v129-plan-metric"><b id="v129PlanLinkedIn">4</b><small>LinkedIn L2 / semana</small></div>`;

  const quick=document.createElement('div');
  quick.className='v129-plan-quick';
  quick.innerHTML=`
    <label>Densidad semanal
      <select id="v129WeeklyPreset" aria-label="Densidad semanal">
        <option value="base">Base · sólo anclas</option>
        <option value="plus1">+1/día · hasta +7 extras</option>
        <option value="plus12">+1/+2 · hasta +10 extras</option>
        <option value="plus2">+2/día · hasta +14 extras</option>
        <option value="plus23">+2/+3 · hasta +17 extras</option>
        <option value="max">Máximo · sin tope</option>
      </select>
    </label>
    <div class="v129-plan-quick-note">Se aplica al calendario general</div>`;

  controls.prepend(quick);
  controls.prepend(summary);
  controls.prepend(head);
  controls.appendChild(body);

  decorateVolumeButtons(controls);

  const toggle=$('#v129PlanToggle');
  let open=localStorage.getItem('editorialV129PlanOpen')!=='0';
  const applyOpen=()=>{
    controls.classList.toggle('v129-collapsed',!open);
    toggle.textContent=open?'Ocultar':'Ajustar';
    toggle.setAttribute('aria-expanded',String(open));
  };
  toggle.addEventListener('click',()=>{
    open=!open;
    localStorage.setItem('editorialV129PlanOpen',open?'1':'0');
    applyOpen();
  });
  applyOpen();

  $('#v129WeeklyPreset')?.addEventListener('change',e=>{
    const target=controls.querySelector(`.segbtn[data-volume="${CSS.escape(e.target.value)}"]`);
    target?.click();
    requestAnimationFrame(updateSummary);
  });

  controls.addEventListener('click',()=>setTimeout(updateSummary,0));
  controls.addEventListener('change',()=>setTimeout(updateSummary,0));

  const stats=[document.getElementById('masterCount'),document.getElementById('publicationCount')].filter(Boolean);
  if(stats.length){
    const observer=new MutationObserver(updateSummary);
    stats.forEach(n=>observer.observe(n,{childList:true,subtree:true,characterData:true}));
  }

  updateSummary();
}

function patchVersionLabels(){
  document.title=document.title.replace(/V12\.8(?:\.\d+)?/g,`V${VERSION}`);
  const title=$('#brandTitle');
  if(title)title.textContent=title.textContent.replace(/V12\.8(?:\.\d+)?/g,`V${VERSION}`);
  $$('.kicker').forEach(node=>{
    if(/V12\.6|V12\.7|V12\.8/.test(node.textContent||'')){
      node.textContent='V12.9 · Controles semanales restaurados · Mobile';
    }
  });
}

function init(){
  mount();
  patchVersionLabels();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();


/* V12.10 additive loader */
(()=>{
  if(document.querySelector('script[data-editorial-v1210]'))return;
  const s=document.createElement('script');
  s.src='./js/v1210-runtime.js?v=12.10';
  s.defer=true;
  s.dataset.editorialV1210='1';
  document.head.appendChild(s);
})();


/* V12.11 additive loader */
(()=>{
  if(document.querySelector('script[data-editorial-v1211]'))return;
  const s=document.createElement('script');
  s.src='./js/v1211-runtime.js?v=12.11';
  s.defer=true;
  s.dataset.editorialV1211='1';
  document.head.appendChild(s);
})();
