(() => {
const COLORS={
 'Podcast · Episodio':'#244b6b','Podcast · Intro':'#d08617','Podcast · Vertical':'#b79220',
 'Podcast · Vertical secundario':'#2f8b83','Podcast · Horizontal':'#536a98','Podcast · Anterior':'#6d6870',
 'Podcast · Carrusel':'#8a5d92','Webinar':'#8b1e3f','Reacción':'#6d4cc2','Testimonio':'#3f8f58',
 'Meme · Humor':'#e57a1f','Meme · Emotivo':'#c84778','Mindset':'#e14f47','Famoso / Quote':'#55606e',
 'Presión vs Foco':'#d21f26','Tip gráfico':'#238b86','Filosofando':'#5b2b53',
 'Carrusel LinkedIn':'#2f69b3','LinkedIn · Nota':'#7c3aed','LinkedIn · Carrusel':'#0f766e','LinkedIn · Video':'#c2410c',
 'Lifestyle':'#3d8392','Voiceover':'#343a40','Evento':'#b86f12','JOC original':'#15171a'
};
const PNAME={instagram:'Instagram',facebook:'Facebook',tiktok:'TikTok',youtube:'YouTube',linkedin:'LinkedIn'};
const PICON={instagram:['IG','ig'],facebook:['f','fb'],tiktok:['TT','tt'],youtube:['▶','yt'],linkedin:['in','li']};
const DAY_NAMES=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const DAY_SHORT=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const LOT_RANK={L1:1,L2:2,L3:3,EVENT:4};
const LOT_COLORS={L1:'#ff3b30',L2:'#0a84ff',L3:'#30b86a',EVENT:'#ff9f0a'};
const VOLUME={
 base:[0,0,0,0,0,0,0],
 plus1:[1,1,1,1,1,1,1],
 plus12:[1,2,1,2,1,2,1],
 plus2:[2,2,2,2,2,2,2],
 plus23:[2,3,2,3,2,3,2],
 max:[99,99,99,99,99,99,99]
};
const TYPE_FAMILY={
 'Presión vs Foco':'Memes','Famoso / Quote':'Memes','Meme · Humor':'Memes','Meme · Emotivo':'Memes','Mindset':'Memes','Tip gráfico':'Memes',
 'Podcast · Episodio':'Podcast','Podcast · Intro':'Podcast','Podcast · Vertical':'Podcast','Podcast · Vertical secundario':'Podcast','Podcast · Horizontal':'Podcast','Podcast · Anterior':'Podcast','Podcast · Carrusel':'Podcast',
 'Webinar':'Webinar','Testimonio':'Testimonios','Reacción':'Reacciones','Carrusel LinkedIn':'Carruseles',
 'LinkedIn · Nota':'LinkedIn L2','LinkedIn · Carrusel':'LinkedIn L2','LinkedIn · Video':'LinkedIn L2',
 'Filosofando':'Filosofando','Lifestyle':'Lifestyle / Voiceover','Voiceover':'Lifestyle / Voiceover','Evento':'Eventos','JOC original':'Video importante'
};

const FAMILY_ORDER=['Memes','Podcast','Webinar','Testimonios','Reacciones','Carruseles','LinkedIn L2','Filosofando','Lifestyle / Voiceover','YouTube','Eventos','Video importante'];
const FORMAT_COMPAT={
 'Presión vs Foco':['Estático','Reel/motion'],
 'Famoso / Quote':['Estático','Reel/motion'],
 'Meme · Humor':['Estático','Reel/motion'],
 'Meme · Emotivo':['Estático','Reel/motion'],
 'Mindset':['Estático','Reel/motion'],
 'Tip gráfico':['Estático','Reel/motion'],
 'Podcast · Vertical':['Reel/Short'],
 'Podcast · Vertical secundario':['Reel/Short'],
 'Podcast · Horizontal':['Horizontal'],
 'Podcast · Episodio':['Horizontal'],
 'Podcast · Carrusel':['Carrusel/Documento'],
 'Podcast · Intro':['Reel/Short'],
 'Webinar':['Reel/Video'],
 'Reacción':['Reel/Video'],
 'Testimonio':['Reel/Video'],
 'Carrusel LinkedIn':['Carrusel/Documento'],
 'LinkedIn · Nota':['Nota'],
 'LinkedIn · Carrusel':['Carrusel/Documento'],
 'LinkedIn · Video':['Video'],
 'Filosofando':['Reel'],
 'Lifestyle':['Estático','Reel'],
 'Voiceover':['Reel/Video'],
 'Evento':['Reel/Video','Carrusel']
};
function contentFamily(a){
 if(a?.familyId){const f=familyById?.(a.familyId);if(f?.name)return f.name}
 if(a.platforms?.length===1&&a.platforms[0]==='youtube'&&['Podcast · Episodio','Podcast · Horizontal','Podcast · Anterior'].includes(a.type))return 'YouTube';
 return TYPE_FAMILY[a.type]||'Otros';
}
function familySlug(name){return 'family-'+String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}

const TARGETS=[
 {key:'podcast',label:'Podcast',min:7,test:items=>items.filter(a=>String(a.type).startsWith('Podcast ·')).length},
 {key:'webinar',label:'Webinar',min:3,max:4,test:items=>items.filter(a=>a.type==='Webinar').length},
 {key:'reaction',label:'Reacciones',min:3,max:4,test:items=>items.filter(a=>a.type==='Reacción').length},
 {key:'testimonial',label:'Testimonios',min:2,max:2,test:items=>items.filter(a=>a.type==='Testimonio').length},
 {key:'memes',label:'Memes',min:5,max:5,test:items=>items.filter(a=>['Presión vs Foco','Famoso / Quote','Meme · Humor','Meme · Emotivo','Tip gráfico'].includes(a.type)).length}
];

function todayLocal(){const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate(),12)}
function dateParts(d){return {y:d.getFullYear(),m:d.getMonth(),day:d.getDate()}}
function cloneDate(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate(),12)}
function addDays(d,n){const x=cloneDate(d);x.setDate(x.getDate()+n);return x}
function startOfWeek(d){const x=cloneDate(d);const diff=(x.getDay()+6)%7;x.setDate(x.getDate()-diff);return x}
function startOfMonth(d){return new Date(d.getFullYear(),d.getMonth(),1,12)}
function keyDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDateKey(s){const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d,12)}
function monthName(d){return d.toLocaleDateString('es-ES',{month:'long',year:'numeric'})}
function weekTitle(d){const s=startOfWeek(d),e=addDays(s,6);return `${s.getDate()} ${s.toLocaleDateString('es-ES',{month:'short'})} – ${e.getDate()} ${e.toLocaleDateString('es-ES',{month:'short',year:'numeric'})}`}
function weekIndex(d){const epoch=new Date(2026,0,5,12);return Math.floor((startOfWeek(d)-epoch)/(7*86400000))}
function dayIndexMonday(dow){return dow===0?6:dow-1}
function iconHtml(p){const [txt,cls]=PICON[p];return `<span class="platform-icon ${cls}" title="${PNAME[p]}" aria-label="${PNAME[p]}">${txt}</span>`}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function make(masterKey,type,title,lot,order,role,note='',surface='Feed',family=null){
 return {masterKey,type,title,lot,lotRank:LOT_RANK[lot]||4,order,role,note,surface,family};
}

let state={
 platform:'all',calendarMode:'week',anchorDate:keyDate(todayLocal()),volume:'plus1',l2Mix:'podcast',
 ytMode:'base',liMode:'core',eventWeek:false,mainSource:'webinar',theme:'light',
 lanePlatform:'master',agendaPlatform:'all',feedPlatform:'instagram',feedHorizon:'week',feedView:'realistic',feedDevice:'auto',libraryTab:'content',
 execution:{meme:'mixed',tip:'static',pressure:'static',famous:'static'},
 moves:{},hidden:{},tentative:{}
};
try{state={...state,...JSON.parse(localStorage.getItem('jocEditorialV9')||'{}')}}catch(e){}
function save(){localStorage.setItem('jocEditorialV9',JSON.stringify(state));scheduleCloudSync()}
let savedScenarios=[];
let plannerDraft={1:[],2:[],3:[],4:[],5:[],6:[],0:[]};
try{savedScenarios=JSON.parse(localStorage.getItem('jocEditorialV9Scenarios')||'[]')}catch(e){savedScenarios=[]}
function saveScenarios(){localStorage.setItem('jocEditorialV9Scenarios',JSON.stringify(savedScenarios));scheduleCloudSync()}
function uid(prefix='item'){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`}
function anchor(){return parseDateKey(state.anchorDate)}

function l1Social(dow){
 const mainType=state.mainSource==='webinar'?'Webinar':'JOC original';
 const map={
  1:make('pressure-mon','Presión vs Foco','Presión vs Foco','L1',10,'Ancla semanal','Lunes fijo.'),
  2:make('main-carousel-tue','Carrusel LinkedIn','Carrusel principal de la semana','L1',10,'Carrusel principal','LinkedIn primero; adaptación IG/FB tentativo.','Carrusel'),
  3:make('main-video-wed',mainType,'Video importante de la semana','L1',10,'Reel principal',state.mainSource==='webinar'?'Fuente: Webinar; cuenta dentro del target Webinar.':'Fuente: guionado JOC.','Video'),
  4:make('pod-intro-thu','Podcast · Intro','Intro / trailer del episodio','L1',10,'Lanzamiento podcast','Jueves fijo.','Short'),
  5:make('philo-fri','Filosofando','Filosofando con Gigantes','L1',10,'Serie fija','Viernes fijo.','Reel'),
  6:make('reaction-sat','Reacción','Reacción JOC','L1',10,'Reacción fija','Cuenta dentro del objetivo 3–4/semana.','Reel'),
  0:make('famous-sun','Famoso / Quote','Famoso + frase / principio','L1',10,'Serie cultural','Domingo fijo.')
 };
 return map[dow];
}

function memeRotation(date){
 const parity=Math.abs(weekIndex(date))%2;
 if(date.getDay()===3){
   return parity===0
    ? make('meme-wed','Meme · Humor','Meme rotativo · humor','L2',15,'Meme semanal','Miércoles: alterna Humor y Emotivo/Mindset.')
    : make('meme-wed','Meme · Emotivo','Meme rotativo · emotivo/mindset','L2',15,'Meme semanal','Miércoles: alterna Humor y Emotivo/Mindset.');
 }
 if(date.getDay()===5){
   return parity===0
    ? make('meme-fri','Meme · Emotivo','Meme rotativo · emotivo/mindset','L2',15,'Meme semanal','Viernes: opuesto al miércoles.')
    : make('meme-fri','Meme · Humor','Meme rotativo · humor','L2',15,'Meme semanal','Viernes: opuesto al miércoles.');
 }
 return null;
}

function socialExtraPool(date){
 const d=date.getDay(), meme=memeRotation(date);
 const pool={
  1:[
   {...make('pod-main-mon','Podcast · Vertical','Podcast · clip vertical principal','L2',10,'Episodio actual','','Vertical','podcast')},
   {...make('web-mon','Webinar','Webinar · clip','L2',20,'Distribución Webinar','','Vertical','webinar')},
   make('pod-carousel-mon','Podcast · Carrusel','Carrusel del podcast','L3',30,'Documento podcast','LinkedIn prioritario; IG/FB tentativo.','Carrusel'),
   make('react-mon','Reacción','Reacción extra','L3',40,'Reacción adicional','','Reel'),
   make('voice-mon','Voiceover','Voiceover de JOC','L3',50,'Extra audiovisual','','Video')
  ],
  2:[
   {...make('pod-main-tue','Podcast · Vertical','Podcast · clip vertical principal','L2',10,'Episodio actual','','Vertical','podcast')},
   make('tip-tue','Tip gráfico','Tip gráfico fijo','L3',20,'Tip semanal fijo','Martes fijo.'),
   make('test-tue','Testimonio','Testimonio','L3',30,'Prueba social','Testimonio #1 semanal.'),
   make('react-tue','Reacción','Reacción extra','L3',40,'Reacción adicional','','Reel'),
   {...make('web-tue','Webinar','Webinar · clip tentativo','L2',90,'Webinar','Con testimonio, queda tentativo salvo volumen máximo.','Vertical','webinar')}
  ],
  3:[
   {...make('pod-main-wed','Podcast · Vertical','Podcast · clip vertical principal','L2',10,'Episodio actual','','Vertical','podcast')},
   meme,
   {...make('web-wed','Webinar','Webinar · clip','L2',20,'Webinar','Se evita si el video importante ya sale de Webinar, salvo volumen máximo.','Vertical','webinar')},
   make('react-wed','Reacción','Reacción extra','L3',30,'Reacción adicional','','Reel')
  ].filter(Boolean),
  4:[
   {...make('guest-carousel-thu','Podcast · Carrusel','Carrusel del invitado / lanzamiento','L2',10,'Podcast / networking','En YouTube aparece como Community.','Carrusel','podcast')},
   {...make('pod-main-thu','Podcast · Vertical secundario','Podcast · clip vertical secundario','L2',20,'Episodio actual','Segundo Short de YouTube.','Vertical','podcast')},
   {...make('web-thu','Webinar','Webinar · clip','L2',30,'Webinar','','Vertical','webinar')},
   make('react-thu','Reacción','Reacción extra','L3',40,'Reacción adicional','','Reel'),
   make('life-thu','Lifestyle','Lifestyle / backstage podcast','L3',50,'Lifestyle')
  ],
  5:[
   {...make('pod-main-fri','Podcast · Vertical','Podcast · clip vertical principal','L2',10,'Episodio actual','','Vertical','podcast')},
   meme,
   make('test-fri','Testimonio','Testimonio','L3',20,'Prueba social','Testimonio #2 semanal.'),
   make('react-fri','Reacción','Reacción extra','L3',30,'Reacción adicional','','Reel'),
   {...make('web-fri','Webinar','Webinar · clip tentativo','L2',90,'Webinar','Con testimonio, queda tentativo salvo volumen máximo.','Vertical','webinar')}
  ].filter(Boolean),
  6:[
   {...make('pod-main-sat','Podcast · Vertical','Podcast · clip vertical principal','L2',10,'Episodio actual','','Vertical','podcast')},
   {...make('web-sat','Webinar','Webinar · clip','L2',20,'Webinar','','Vertical','webinar')},
   make('life-sat','Lifestyle','Lifestyle','L3',30,'Lifestyle')
  ],
  0:[
   {...make('pod-main-sun','Podcast · Vertical','Podcast · clip vertical principal','L2',10,'Episodio actual','','Vertical','podcast')},
   {...make('web-sun','Webinar','Webinar · clip','L2',20,'Webinar','','Vertical','webinar')},
   make('voice-sun','Voiceover','Voiceover de JOC','L3',30,'Extra audiovisual','','Video'),
   make('react-sun','Reacción','Reacción extra','L3',40,'Reacción adicional','','Reel')
  ]
 };
 return pool[d]||[];
}

function l2Allowed(item,dow,opts=state){
 if(!item.family)return true;
 if(opts.l2Mix==='full')return true;
 if(opts.l2Mix==='podcast')return item.family==='podcast';
 const alternate={1:'podcast',2:'webinar',3:'podcast',4:'podcast',5:'webinar',6:'podcast',0:'webinar'};
 return item.family===alternate[dow];
}
function socialRaw(date,opts=state){
 const dow=date.getDay();
 const first={...l1Social(dow)};
 let firstPlatforms=['instagram','facebook','tiktok'];
 if(first.masterKey==='main-carousel-tue')firstPlatforms=['instagram','facebook','linkedin'];
 if(first.masterKey==='main-video-wed')firstPlatforms=['instagram','facebook','tiktok','linkedin'];
 if(first.masterKey==='pod-intro-thu')firstPlatforms=['instagram','facebook','tiktok','youtube'];
 let out=[{...first,platforms:firstPlatforms}];

 let extras=socialExtraPool(date).filter(x=>l2Allowed(x,dow,opts));
 if(dow===3 && opts.mainSource==='webinar' && opts.volume!=='max') extras=extras.filter(x=>x.masterKey!=='web-wed');
 extras.sort((a,b)=>a.lotRank-b.lotRank||a.order-b.order);
 const cap=VOLUME[opts.volume][dayIndexMonday(dow)];
 extras.slice(0,cap).forEach(x=>{
   let platforms=['instagram','facebook','tiktok'];
   if(x.masterKey==='pod-carousel-mon')platforms=['instagram','facebook','linkedin'];
   if(x.masterKey==='guest-carousel-thu')platforms=['instagram','facebook','youtube','linkedin'];
   if(x.type==='Testimonio')platforms=['instagram','facebook','tiktok','linkedin'];
   out.push({...x,platforms});
 });

 if(opts.eventWeek){
   const ev={
    1:make('event-c2','Evento','Evento · carrusel 2','EVENT',10,'Event Pack','','Carrusel'),
    3:make('event-v1','Evento','Evento · video 1','EVENT',10,'Event Pack','','Video'),
    5:make('event-c1','Evento','Evento · carrusel 1','EVENT',10,'Event Pack','','Carrusel'),
    6:make('event-v2','Evento','Evento · video 2','EVENT',10,'Event Pack','','Video')
   }[dow];
   if(ev){
     const platforms=ev.surface==='Carrusel'?['instagram','facebook','linkedin']:['instagram','facebook','tiktok','linkedin'];
     out.push({...ev,platforms});
   }
 }
 return out;
}

function youtubeRaw(date,opts=state){
 const d=date.getDay(),a=[];
 if(d===4)a.push({...make('pod-episode-thu','Podcast · Episodio','Episodio completo del podcast','L1',1,'Horizontal principal','Jueves fijo.','Horizontal'),platforms:['youtube']});
 if([2,6,0].includes(d))a.push({...make(`pod-horizontal-${d}`,'Podcast · Horizontal','Clip horizontal del episodio','L1',2,'Clip horizontal','Martes, sábado y domingo.','Horizontal'),platforms:['youtube']});

 if(d===4){
   a.push({...make('pod-intro-thu','Podcast · Intro','Intro / trailer del episodio','L1',5,'Short principal','Mismo asset maestro del trailer social.','Short'),platforms:['youtube']});
 }else{
   const n={0:'sun',1:'mon',2:'tue',3:'wed',5:'fri',6:'sat'}[d];
   a.push({...make(`pod-main-${n}`,'Podcast · Vertical','Podcast · Short principal','L1',5,'Short principal','Mismo master del vertical principal social.','Short'),platforms:['youtube']});
 }

 if([2,3].includes(d)){
   a.push({...make(`pod-old-${d}`,'Podcast · Anterior','Short flexible · episodio actual / anterior','L2',10,'Flexible','Puede reemplazarse por más episodio actual o Webinar.','Short'),platforms:['youtube']});
 }else{
   a.push({...make(`pod-secondary-${d}`,'Podcast · Vertical secundario','Podcast · Short secundario','L2',10,'Episodio actual','','Short'),platforms:['youtube']});
 }
 if(d===4)a.push({...make('guest-carousel-thu','Podcast · Carrusel','Carrusel del invitado / lanzamiento','L2',20,'Community','Mismo asset maestro del carrusel invitado.','Community'),platforms:['youtube']});

 if(opts.ytMode==='expanded'){
   const third={
    1:make('web-mon','Webinar','Webinar · Short','L3',10,'Webinar','','Short'),
    2:make('test-tue','Testimonio','Testimonio · Short','L3',10,'Testimonio','','Short'),
    3:make('yt-old-wed','Podcast · Anterior','Episodio anterior · Short','L3',10,'Anterior / flexible','','Short'),
    4:make('web-thu','Webinar','Webinar · Short','L3',10,'Webinar','','Short'),
    5:make('test-fri','Testimonio','Testimonio · Short','L3',10,'Testimonio','','Short'),
    6:make('web-sat','Webinar','Webinar · Short','L3',10,'Webinar','','Short'),
    0:make('yt-old-sun','Podcast · Anterior','Episodio anterior · Short','L3',10,'Anterior / flexible','','Short')
   }[d];
   a.push({...third,platforms:['youtube']});
 }
 return a.sort((x,y)=>x.lotRank-y.lotRank||x.order-y.order);
}

function linkedinRaw(date,opts=state){
 const d=date.getDay(),a=[];
 const core={
  1:make('pod-carousel-mon','Podcast · Carrusel','Carrusel del podcast','L1',10,'Documento podcast','','Documento'),
  2:make('main-carousel-tue','Carrusel LinkedIn','Carrusel principal JOC','L1',10,'Thought leadership','','Documento'),
  3:make('main-video-wed',opts.mainSource==='webinar'?'Webinar':'JOC original','Video importante de la semana','L1',10,'Video profesional','','Video'),
  4:make('guest-carousel-thu','Podcast · Carrusel','Carrusel del invitado + lanzamiento','L1',10,'Podcast / networking','','Documento')
 }[d];
 if(core)a.push({...core,platforms:['linkedin']});
 if(opts.liMode==='daily'){
   const daily={
    5:make('li-note-fri','LinkedIn · Nota','Nota de tesis contraria / aprendizaje operativo','L2',10,'Texto nativo compartible','Una tesis fuerte + 3 razones + cierre abierto para conversación.','Nota'),
    6:make('li-doc-sat','LinkedIn · Carrusel','Carrusel diagnóstico / checklist','L2',10,'Documento nativo guardable','Marco visual: señales, errores, diagnóstico o checklist aplicable.','Documento'),
    0:make('li-video-sun','LinkedIn · Video','Video de tesis / caso','L2',10,'Video nativo compartible','45–90 s: problema, criterio, ejemplo y conclusión accionable.','Video')
   }[d];
   if(daily)a.push({...daily,platforms:['linkedin']});
 }
 if(opts.eventWeek){
   const ev={
    1:make('event-c2','Evento','Evento · carrusel 2','EVENT',10,'Evento','','Documento'),
    3:make('event-v1','Evento','Evento · video 1','EVENT',10,'Evento','','Video'),
    5:make('event-c1','Evento','Evento · carrusel 1','EVENT',10,'Evento','','Documento')
   }[d];
   if(ev)a.push({...ev,platforms:['linkedin']});
 }
 return a.sort((x,y)=>x.lotRank-y.lotRank||x.order-y.order);
}

function baseRawForPlatform(date,p,opts=state){
 if(p==='youtube')return youtubeRaw(date,opts);
 if(p==='linkedin')return linkedinRaw(date,opts);
 return socialRaw(date,opts).filter(a=>a.platforms.includes(p)).map(a=>({...a,platforms:[p]}));
}
function sameWeekDate(date,dow){
 const s=startOfWeek(date);const offset=dow===0?6:dow-1;return addDays(s,offset);
}
function applyOverrides(date,p,opts=state){
 const targetDow=date.getDay();
 const current=baseRawForPlatform(date,p,opts).filter(a=>{
   const moved=state.moves[a.masterKey];
   return moved===undefined || Number(moved)===targetDow;
 });
 for(const sourceDow of [0,1,2,3,4,5,6]){
   if(sourceDow===targetDow)continue;
   const sourceDate=sameWeekDate(date,sourceDow);
   baseRawForPlatform(sourceDate,p,opts).forEach(a=>{
     if(Number(state.moves[a.masterKey])===targetDow)current.push(a);
   });
 }
 const seen=new Set();
 return current
   .filter(a=>!state.hidden[a.masterKey])
   .map(a=>({...a,tentative:!!state.tentative[a.masterKey]}))
   .filter(a=>{if(seen.has(a.masterKey))return false;seen.add(a.masterKey);return true})
   .sort((a,b)=>a.lotRank-b.lotRank||a.order-b.order||a.title.localeCompare(b.title));
}
function platformAssets(date,p,opts=state){return applyOverrides(date,p,opts)}
function allAssets(date,opts=state){
 const raw=[];
 ['instagram','facebook','tiktok','youtube','linkedin'].forEach(p=>{
   platformAssets(date,p,opts).forEach(a=>raw.push({...a,platforms:[p]}));
 });
 const groups=new Map();
 raw.forEach(a=>{
   if(!groups.has(a.masterKey))groups.set(a.masterKey,{...a,platforms:[],surfaces:[],lotByPlatform:{},surfaceByPlatform:{}});
   const g=groups.get(a.masterKey);
   a.platforms.forEach(p=>{
     if(!g.platforms.includes(p))g.platforms.push(p);
     g.lotByPlatform[p]=a.lot;
     g.surfaceByPlatform[p]=a.surface||'Feed';
   });
   if(a.surface&&!g.surfaces.includes(a.surface))g.surfaces.push(a.surface);
   if(a.lotRank<g.lotRank){g.lot=a.lot;g.lotRank=a.lotRank}
   if(a.tentative)g.tentative=true;
 });
 return [...groups.values()].sort((a,b)=>a.lotRank-b.lotRank||a.order-b.order||a.title.localeCompare(b.title));
}
const v12DerivedCache=new Map();
function clearV12DerivedCache(){v12DerivedCache.clear()}
function assetsForDate(date,platform=state.platform,opts=state){
 const cacheable=opts===state;
 const dkey=typeof date==='string'?date:keyDate(date);
 const ckey=cacheable?`${dkey}|${platform}`:null;
 if(cacheable&&v12DerivedCache.has(ckey))return v12DerivedCache.get(ckey);
 const scenario=scenarioAssetsForDate(date,platform);
 if(scenario){if(cacheable)v12DerivedCache.set(ckey,scenario);return scenario}
 const items=platform==='all'?allAssets(date,opts):platformAssets(date,platform,opts);
 const result=withOccurrenceMeta(items,date,'auto-plan');
 if(cacheable)v12DerivedCache.set(ckey,result);
 return result;
}
function fullPlanAssets(date,platform='all'){
 const opts={...state,volume:'max',l2Mix:'full',ytMode:'expanded',liMode:'daily'};
 return platform==='all'?allAssets(date,opts):platformAssets(date,platform,opts);
}

const PLANNER_TEMPLATES=[
 {id:'pressure',title:'Presión vs Foco',type:'Presión vs Foco',lot:'L1',surface:'Feed',platforms:['instagram','facebook','tiktok'],fixed:true,defaultDow:1,role:'Ancla semanal'},
 {id:'main-carousel',title:'Carrusel principal de la semana',type:'Carrusel LinkedIn',lot:'L1',surface:'Carrusel',platforms:['instagram','facebook','linkedin'],fixed:true,defaultDow:2,role:'Carrusel principal'},
 {id:'main-video',title:'Video importante de la semana',type:'JOC original',lot:'L1',surface:'Video',platforms:['instagram','facebook','tiktok','linkedin'],fixed:true,defaultDow:3,role:'Video principal'},
 {id:'pod-intro',title:'Intro / trailer del episodio',type:'Podcast · Intro',lot:'L1',surface:'Short',platforms:['instagram','facebook','tiktok','youtube'],fixed:true,defaultDow:4,role:'Lanzamiento podcast'},
 {id:'philo',title:'Filosofando con Gigantes',type:'Filosofando',lot:'L1',surface:'Reel',platforms:['instagram','facebook','tiktok'],fixed:true,defaultDow:5,role:'Serie fija'},
 {id:'reaction-fixed',title:'Reacción JOC',type:'Reacción',lot:'L1',surface:'Reel',platforms:['instagram','facebook','tiktok'],fixed:true,defaultDow:6,role:'Reacción fija'},
 {id:'famous',title:'Famoso + frase / principio',type:'Famoso / Quote',lot:'L1',surface:'Feed',platforms:['instagram','facebook','tiktok'],fixed:true,defaultDow:0,role:'Serie cultural'},

 {id:'pod-main',title:'Podcast · clip vertical principal',type:'Podcast · Vertical',lot:'L2',surface:'Vertical',platforms:['instagram','facebook','tiktok','youtube'],role:'Episodio actual'},
 {id:'pod-secondary',title:'Podcast · clip vertical secundario',type:'Podcast · Vertical secundario',lot:'L2',surface:'Short',platforms:['youtube'],role:'Episodio actual'},
 {id:'pod-carousel',title:'Carrusel del podcast',type:'Podcast · Carrusel',lot:'L2',surface:'Carrusel',platforms:['instagram','facebook','linkedin'],role:'Documento podcast'},
 {id:'guest-carousel',title:'Carrusel del invitado / lanzamiento',type:'Podcast · Carrusel',lot:'L2',surface:'Carrusel',platforms:['instagram','facebook','youtube','linkedin'],role:'Podcast / networking'},
 {id:'webinar',title:'Webinar · clip',type:'Webinar',lot:'L2',surface:'Vertical',platforms:['instagram','facebook','tiktok','youtube','linkedin'],role:'Insight de Webinar'},
 {id:'meme-humor',title:'Meme rotativo · humor',type:'Meme · Humor',lot:'L2',surface:'Feed',platforms:['instagram','facebook','tiktok'],role:'Shareability'},
 {id:'meme-emotional',title:'Meme rotativo · emotivo/mindset',type:'Meme · Emotivo',lot:'L2',surface:'Feed',platforms:['instagram','facebook','tiktok'],role:'Afinidad / mindset'},

 {id:'li-note',title:'Nota de tesis contraria / aprendizaje operativo',type:'LinkedIn · Nota',lot:'L2',surface:'Nota',platforms:['linkedin'],role:'Texto nativo compartible'},
 {id:'li-doc',title:'Carrusel diagnóstico / checklist',type:'LinkedIn · Carrusel',lot:'L2',surface:'Documento',platforms:['linkedin'],role:'Documento guardable'},
 {id:'li-video',title:'Video de tesis / caso',type:'LinkedIn · Video',lot:'L2',surface:'Video',platforms:['linkedin'],role:'Video nativo 45–90 s'},

 {id:'tip',title:'Tip gráfico fijo',type:'Tip gráfico',lot:'L3',surface:'Feed',platforms:['instagram','facebook','tiktok'],role:'Tip visual'},
 {id:'testimonial',title:'Testimonio',type:'Testimonio',lot:'L3',surface:'Video',platforms:['instagram','facebook','tiktok','linkedin','youtube'],role:'Prueba social'},
 {id:'reaction-extra',title:'Reacción extra',type:'Reacción',lot:'L3',surface:'Reel',platforms:['instagram','facebook','tiktok'],role:'Reacción adicional'},
 {id:'lifestyle',title:'Lifestyle / backstage',type:'Lifestyle',lot:'L3',surface:'Feed',platforms:['instagram','facebook','tiktok'],role:'Marca personal'},
 {id:'voiceover',title:'Voiceover de JOC',type:'Voiceover',lot:'L3',surface:'Video',platforms:['instagram','facebook','tiktok'],role:'Reflexión audiovisual'},
 {id:'yt-episode',title:'Episodio completo del podcast',type:'Podcast · Episodio',lot:'L1',surface:'Horizontal',platforms:['youtube'],fixed:false,role:'YouTube horizontal'},
 {id:'yt-horizontal',title:'Clip horizontal del episodio',type:'Podcast · Horizontal',lot:'L2',surface:'Horizontal',platforms:['youtube'],role:'YouTube horizontal'},
 {id:'yt-old',title:'Short de episodio anterior / flexible',type:'Podcast · Anterior',lot:'L3',surface:'Short',platforms:['youtube'],role:'Flexible'}
];

const DEFAULT_PILLARS=[
 {id:'negocio',name:'Negocio',description:'Criterio empresarial, ejecución y decisiones.',archived:false},
 {id:'ventas',name:'Ventas',description:'Ventas, seguimiento, fricción y decisión.',archived:false},
 {id:'podcast',name:'Podcast',description:'Episodios, invitados, clips y distribución.',archived:false},
 {id:'autoridad',name:'Autoridad / Educación',description:'Webinars, frameworks, casos y enseñanza.',archived:false},
 {id:'marca-personal',name:'Marca personal',description:'Lifestyle, voz, perspectiva y presencia.',archived:false},
 {id:'prueba',name:'Prueba social',description:'Testimonios, casos y resultados.',archived:false}
];
const DEFAULT_FAMILIES=[
 {id:'memes',name:'Memes',pillarId:'negocio',description:'Shareability, criterio, emoción y humor.',archived:false},
 {id:'podcast',name:'Podcast',pillarId:'podcast',description:'Episodio, clips, horizontales y carruseles.',archived:false},
 {id:'webinar',name:'Webinar',pillarId:'autoridad',description:'Clips educativos y tesis.',archived:false},
 {id:'testimonios',name:'Testimonios',pillarId:'prueba',description:'Prueba social y casos.',archived:false},
 {id:'reacciones',name:'Reacciones',pillarId:'marca-personal',description:'Reacciones y postura.',archived:false},
 {id:'carruseles',name:'Carruseles',pillarId:'autoridad',description:'Documentos, frameworks y piezas guardables.',archived:false},
 {id:'linkedin-l2',name:'LinkedIn L2',pillarId:'autoridad',description:'Notas, documentos y videos nativos viralizables.',archived:false},
 {id:'filosofando',name:'Filosofando',pillarId:'marca-personal',description:'Filosofando con Gigantes.',archived:false},
 {id:'lifestyle',name:'Lifestyle / Voiceover',pillarId:'marca-personal',description:'Vida, backstage, voz y presencia.',archived:false},
 {id:'youtube',name:'YouTube',pillarId:'podcast',description:'Formatos específicos de YouTube.',archived:false},
 {id:'eventos',name:'Eventos',pillarId:'marca-personal',description:'Cobertura y resumen de eventos.',archived:false}
];
const BUILTIN_META={
 pressure:{familyId:'memes',pillarId:'negocio'}, famous:{familyId:'memes',pillarId:'negocio'},
 'meme-humor':{familyId:'memes',pillarId:'negocio'}, 'meme-emotional':{familyId:'memes',pillarId:'negocio'}, tip:{familyId:'memes',pillarId:'negocio'},
 'pod-intro':{familyId:'podcast',pillarId:'podcast'}, 'pod-main':{familyId:'podcast',pillarId:'podcast'}, 'pod-secondary':{familyId:'podcast',pillarId:'podcast'},
 'pod-carousel':{familyId:'podcast',pillarId:'podcast'}, 'guest-carousel':{familyId:'podcast',pillarId:'podcast'},
 webinar:{familyId:'webinar',pillarId:'autoridad'}, testimonial:{familyId:'testimonios',pillarId:'prueba'},
 'reaction-fixed':{familyId:'reacciones',pillarId:'marca-personal'}, 'reaction-extra':{familyId:'reacciones',pillarId:'marca-personal'},
 'main-carousel':{familyId:'carruseles',pillarId:'autoridad'}, 'main-video':{familyId:'carruseles',pillarId:'autoridad'},
 'li-note':{familyId:'linkedin-l2',pillarId:'autoridad'}, 'li-doc':{familyId:'linkedin-l2',pillarId:'autoridad'}, 'li-video':{familyId:'linkedin-l2',pillarId:'autoridad'},
 philo:{familyId:'filosofando',pillarId:'marca-personal'}, lifestyle:{familyId:'lifestyle',pillarId:'marca-personal'}, voiceover:{familyId:'lifestyle',pillarId:'marca-personal'},
 'yt-episode':{familyId:'youtube',pillarId:'podcast'}, 'yt-horizontal':{familyId:'youtube',pillarId:'podcast'}, 'yt-old':{familyId:'youtube',pillarId:'podcast'}
};
PLANNER_TEMPLATES.forEach(t=>Object.assign(t,BUILTIN_META[t.id]||{}));

const defaultJocIds=PLANNER_TEMPLATES.map(t=>t.id);
let appData={
 activeBrandId:'joc',
 brands:[{id:'joc',name:'JOC',initials:'J',color:'#A91616',platforms:['instagram','facebook','tiktok','youtube','linkedin'],enabledContentIds:[...defaultJocIds],archived:false}],
 pillars:DEFAULT_PILLARS.map(x=>({...x})),
 families:DEFAULT_FAMILIES.map(x=>({...x})),
 customContent:[],
 history:[],
 completion:{}
};
try{
 const stored=JSON.parse(localStorage.getItem('jocEditorialV9AppData')||'null');
 if(stored)appData={...appData,...stored,brands:stored.brands||appData.brands,pillars:stored.pillars||appData.pillars,families:stored.families||appData.families,customContent:stored.customContent||[],history:stored.history||[],completion:stored.completion||{}};
}catch(e){}
function saveAppData(){localStorage.setItem('jocEditorialV9AppData',JSON.stringify(appData));scheduleCloudSync()}

function activeScenarioIdForCompletion(scenarioId=null){
 return scenarioId||((state.emulationMode&&state.activeScenario?.id)?state.activeScenario.id:'auto-plan');
}
function completionKey(a,date,scenarioId=null){
 const d=date instanceof Date?keyDate(date):String(date||a.date||keyDate(anchor()));
 const identity=a.masterKey||a.instanceId||a.templateId||a.id||a.title;
 return `${appData.activeBrandId}|${activeScenarioIdForCompletion(scenarioId)}|${d}|${identity}`;
}
function isAssetDone(a,date=a.date,scenarioId=null){
 return !!appData.completion?.[completionKey(a,date,scenarioId)];
}
function setAssetDone(a,date=a.date,done=true,scenarioId=null){
 if(!appData.completion)appData.completion={};
 const key=completionKey(a,date,scenarioId);
 if(done)appData.completion[key]={done:true,at:new Date().toISOString()};
 else delete appData.completion[key];
 logAction(done?'Marcó contenido hecho':'Marcó contenido pendiente',`${a.title} · ${date?new Date(date).toLocaleDateString('es-ES'):''}`);
 saveAppData();
}
function migrateCompletionScenario(fromId,toId){
 if(!fromId||!toId||fromId===toId||!appData.completion)return;
 const copies={};
 Object.entries(appData.completion).forEach(([k,v])=>{
   const token=`|${fromId}|`;
   if(k.includes(token))copies[k.replace(token,`|${toId}|`)]=v;
 });
 Object.assign(appData.completion,copies);
}
function withOccurrenceMeta(items,date,scenarioId=null){
 return (items||[]).map(a=>({...a,date,done:isAssetDone(a,date,scenarioId)}));
}

function activeBrand(){return appData.brands.find(b=>b.id===appData.activeBrandId)||appData.brands[0]}
function pillarById(id){return appData.pillars.find(x=>x.id===id)}
function familyById(id){return appData.families.find(x=>x.id===id)}
function allPlannerTemplates(includeArchived=false){return [...PLANNER_TEMPLATES,...appData.customContent].filter(t=>includeArchived||!t.archived)}
function templateById(id){return allPlannerTemplates().find(t=>t.id===id)}
function enabledTemplates(){
 const brand=activeBrand();const ids=new Set(brand?.enabledContentIds||[]);
 return allPlannerTemplates().filter(t=>ids.has(t.id));
}
function metaText(t){
 const fam=familyById(t.familyId)?.name||contentFamily(t),pill=pillarById(t.pillarId)?.name||'';
 return [t.title,t.type,fam,pill,t.lot,t.surface,...(t.platforms||[]),...(t.compatibleFormats||FORMAT_COMPAT[t.type]||[])].join(' ').toLowerCase();
}
function logAction(action,detail=''){
 appData.history.unshift({id:uid('hist'),at:new Date().toISOString(),brandId:appData.activeBrandId,action,detail});
 appData.history=appData.history.slice(0,300);saveAppData();
}

let undoStack=[],redoStack=[],restoringSnapshot=false;
function snapshotApp(label=''){
 return {label,state:JSON.parse(JSON.stringify(state)),plannerDraft:cloneSlots(plannerDraft),savedScenarios:JSON.parse(JSON.stringify(savedScenarios)),appData:JSON.parse(JSON.stringify(appData))};
}
function checkpoint(label){
 if(restoringSnapshot)return;
 undoStack.push(snapshotApp(label));if(undoStack.length>60)undoStack.shift();redoStack=[];updateUndoButtons();
}
function restoreSnapshot(snap){
 if(!snap)return;restoringSnapshot=true;
 state=snap.state;plannerDraft=cloneSlots(snap.plannerDraft);savedScenarios=snap.savedScenarios;appData=snap.appData;
 localStorage.setItem('jocEditorialV9',JSON.stringify(state));localStorage.setItem('jocEditorialV9Scenarios',JSON.stringify(savedScenarios));localStorage.setItem('jocEditorialV9AppData',JSON.stringify(appData));
 restoringSnapshot=false;renderAll();scheduleCloudSync();
}
function undo(){if(!undoStack.length)return;redoStack.push(snapshotApp('redo'));restoreSnapshot(undoStack.pop());updateUndoButtons()}
function redo(){if(!redoStack.length)return;undoStack.push(snapshotApp('undo'));restoreSnapshot(redoStack.pop());updateUndoButtons()}
function updateUndoButtons(){
 const u=document.getElementById('undoBtn'),r=document.getElementById('redoBtn');if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length;
}

function templateById_legacy(id){return PLANNER_TEMPLATES.find(t=>t.id===id)}
function cloneTemplate(t,dow,overrides={}){
 return {
   instanceId:uid('plan'),
   templateId:t.id,
   masterKey:`scenario-${t.id}-${uid('m')}`,
   title:t.title,type:t.type,lot:t.lot,lotRank:LOT_RANK[t.lot]||4,
   order:10,role:t.role||'',note:t.note||'',surface:t.surface||'Feed',
   platforms:[...(t.platforms||[])],fixed:!!t.fixed,dow:Number(dow),
   familyId:t.familyId||null,pillarId:t.pillarId||null,compatibleFormats:[...(t.compatibleFormats||FORMAT_COMPAT[t.type]||[])],
   description:t.description||'',color:t.color||null,...overrides
 };
}
function emptyDraft(){return {1:[],2:[],3:[],4:[],5:[],6:[],0:[]}}
function cloneSlots(slots){
 const out=emptyDraft();
 [1,2,3,4,5,6,0].forEach(d=>out[d]=(slots?.[d]||slots?.[String(d)]||[]).map(x=>({...x,platforms:[...(x.platforms||[])]})));
 return out;
}
function loadL1Draft(){
 plannerDraft=emptyDraft();
 enabledTemplates().filter(t=>t.fixed&&t.defaultDow!==undefined).forEach(t=>plannerDraft[t.defaultDow].push(cloneTemplate(t,t.defaultDow,{masterKey:`scenario-fixed-${t.id}`})));
 renderPlanner();
}
function loadCurrentDraft(){
 plannerDraft=emptyDraft();
 const start=startOfWeek(anchor());
 for(let i=0;i<7;i++){
   const d=addDays(start,i),dow=d.getDay();
   assetsForDate(d,'all').forEach(a=>{
     plannerDraft[dow].push({
       instanceId:uid('plan'),templateId:null,masterKey:`scenario-copy-${uid('m')}`,
       title:a.title,type:a.type,lot:a.lot,lotRank:a.lotRank||LOT_RANK[a.lot]||4,order:a.order||10,
       role:a.role||'',note:a.note||'',surface:(a.surfaces&&a.surfaces[0])||a.surface||'Feed',
       platforms:[...(a.platforms||[])],fixed:a.lot==='L1',dow
     });
   });
 }
 renderPlanner();
}
function scenarioAssetsForDate(date,platform='all'){
 const sc=state.activeScenario;
 if(!state.emulationMode||!sc||!sc.slots)return null;
 return scenarioItemsForDate(sc,date,platform);
}

function platformIconRow(platforms){return (platforms||[]).map(iconHtml).join('')}
function eventColor(a){return a?.color||COLORS[a.type]||'#555'}
function lotLabel(a){
 if(a.lotByPlatform){
   const uniq=[...new Set(Object.values(a.lotByPlatform))].sort((x,y)=>(LOT_RANK[x]||9)-(LOT_RANK[y]||9));
   return uniq.join('/');
 }
 return a.lot;
}
function setTitle(){
 const d=anchor();
 document.getElementById('calendarTitle').textContent=state.calendarMode==='week'?weekTitle(d):monthName(d);
}
function eventCardHtml(a){
 const surfaces=a.surfaces&&a.surfaces.length?a.surfaces.join(' / '):(a.surface||'Feed');
 return `<div class="event-card${a.done?' done':''}" style="--c:${eventColor(a)}" data-master="${esc(a.masterKey)}">
   <b>${a.done?'✓ ':''}${esc(a.title)}</b>
   ${a.tentative?'<span class="tentative">TENTATIVO</span>':''}
   <div class="event-meta"><span class="event-type">${esc(a.type)} · ${esc(surfaces)}${a.done?' · HECHO':''}</span><span class="event-icons">${platformIconRow(a.platforms)}</span></div>
 </div>`;
}
function isCompactUI(){return window.matchMedia('(max-width:899px)').matches}
function buildMobileDayPage(date){
 const page=document.createElement('section');page.className='mobile-day-page';
 const items=assetsForDate(date);
 page.innerHTML=`<div class="mobile-day-page-head"><div><h3>${DAY_NAMES[date.getDay()]} ${date.getDate()}</h3><p>${date.toLocaleDateString('es-ES',{month:'long',year:'numeric'})}</p></div><span class="mobile-day-count">${items.length} ${items.length===1?'pieza':'piezas'}</span></div>`;
 ['L1','L2','L3','EVENT'].forEach(lot=>{
   const list=items.filter(a=>a.lot===lot);
   if(!list.length)return;
   const group=document.createElement('div');group.className='lot-group';
   group.innerHTML=`<div class="lot-header"><strong>${lot==='EVENT'?'EVENTOS':lot}</strong><span>${list.length}</span></div>`;
   list.forEach(a=>{const wrap=document.createElement('div');wrap.innerHTML=eventCardHtml(a);const card=wrap.firstElementChild;card.addEventListener('click',()=>openDrawer(a));group.appendChild(card)});
   page.appendChild(group);
 });
 if(!items.length)page.insertAdjacentHTML('beforeend','<div class="callout">No hay contenido planificado para este día.</div>');
 return page;
}
function renderWeekMobile(){
 const root=document.getElementById('calendarRoot');root.innerHTML='';
 const start=startOfWeek(anchor()),dates=Array.from({length:7},(_,i)=>addDays(start,i));
 let selected=dates.findIndex(d=>keyDate(d)===state.anchorDate);if(selected<0)selected=0;
 const tabs=document.createElement('div');tabs.className='mobile-day-tabs';
 const pages=document.createElement('div');pages.className='mobile-week-pages';
 dates.forEach((d,i)=>{
   const count=assetsForDate(d).length,tab=document.createElement('button');
   tab.className='mobile-day-tab'+(i===selected?' active':'');tab.dataset.index=String(i);
   tab.innerHTML=`<span>${DAY_SHORT[d.getDay()]}</span><b>${d.getDate()}</b><small>${count}</small>`;
   tab.addEventListener('click',()=>{pages.scrollTo({left:i*pages.clientWidth,behavior:'smooth'});tabs.querySelectorAll('.mobile-day-tab').forEach((x,j)=>x.classList.toggle('active',j===i));state.anchorDate=keyDate(d);setTitle();saveLocalOnly()});
   tabs.appendChild(tab);pages.appendChild(buildMobileDayPage(d));
 });
 root.append(tabs,pages);requestAnimationFrame(()=>pages.scrollLeft=selected*pages.clientWidth);
 let raf=0;
 pages.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const i=Math.max(0,Math.min(6,Math.round(pages.scrollLeft/Math.max(1,pages.clientWidth))));tabs.querySelectorAll('.mobile-day-tab').forEach((x,j)=>x.classList.toggle('active',j===i));state.anchorDate=keyDate(dates[i]);setTitle();saveLocalOnly();tabs.children[i]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})})},{passive:true});
}
function renderMonthMobile(){
 const root=document.getElementById('calendarRoot');root.innerHTML='';
 const d=anchor(),first=startOfMonth(d),gridStart=startOfWeek(first),grid=document.createElement('div');grid.className='mobile-month-grid';
 ['L','M','X','J','V','S','D'].forEach(n=>{const h=document.createElement('div');h.className='mobile-month-head';h.textContent=n;grid.appendChild(h)});
 for(let i=0;i<42;i++){
   const day=addDays(gridStart,i),items=assetsForDate(day),cell=document.createElement('button'),today=keyDate(day)===keyDate(todayLocal());
   cell.className='mobile-month-cell'+(day.getMonth()!==d.getMonth()?' out':'')+(today?' today':'');
   cell.innerHTML=`<b>${day.getDate()}</b><small>${items.length||''}</small><span class="mobile-month-dots"></span>`;
   const dots=cell.lastElementChild;items.slice(0,3).forEach(a=>{const dot=document.createElement('i');dot.style.setProperty('--dot',eventColor(a));dots.appendChild(dot)});
   cell.addEventListener('click',()=>{state.anchorDate=keyDate(day);state.calendarMode='week';save();renderCalendar();syncControls()});grid.appendChild(cell);
 }
 root.appendChild(grid);
}
function renderWeek(){
 if(isCompactUI()){renderWeekMobile();return}
 const root=document.getElementById('calendarRoot');root.innerHTML='';
 const start=startOfWeek(anchor()),grid=document.createElement('div');grid.className='week-grid';
 for(let i=0;i<7;i++){
   const d=addDays(start,i),col=document.createElement('section');col.className='day-column',isToday=keyDate(d)===keyDate(todayLocal());
   col.innerHTML=`<div class="day-title ${isToday?'today':''}"><span>${DAY_SHORT[d.getDay()]} ${d.getDate()}</span><span>${assetsForDate(d).length}</span></div>`;
   const items=assetsForDate(d);
   ['L1','L2','L3','EVENT'].forEach(lot=>{const list=items.filter(a=>a.lot===lot || (a.lotByPlatform && Object.values(a.lotByPlatform).includes(lot) && a.lot===lot));if(!list.length)return;const group=document.createElement('div');group.className='lot-group';group.innerHTML=`<div class="lot-header"><strong>${lot==='EVENT'?'EVENTOS':lot}</strong><span>${list.length}</span></div>`;list.forEach(a=>{const wrap=document.createElement('div');wrap.innerHTML=eventCardHtml(a);const card=wrap.firstElementChild;card.addEventListener('click',()=>openDrawer(a));group.appendChild(card)});col.appendChild(group)});
   grid.appendChild(col);
 }
 root.appendChild(grid);
}
function renderMonth(){
 if(isCompactUI()){renderMonthMobile();return}
 const root=document.getElementById('calendarRoot');root.innerHTML='';
 const d=anchor(),first=startOfMonth(d),gridStart=startOfWeek(first),grid=document.createElement('div');grid.className='month-grid';
 ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].forEach(n=>{const h=document.createElement('div');h.className='month-head';h.textContent=n;grid.appendChild(h)});
 for(let i=0;i<42;i++){
   const day=addDays(gridStart,i),cell=document.createElement('div');cell.className='month-day'+(day.getMonth()!==d.getMonth()?' out':'');const today=keyDate(day)===keyDate(todayLocal());
   cell.innerHTML=`<div class="month-date ${today?'today':''}">${day.getDate()}</div>`;const dayAssets=assetsForDate(day),items=dayAssets.slice(0,4);
   items.forEach(a=>{const e=document.createElement('div');e.className='month-event'+(a.done?' done':'');e.style.setProperty('--c',eventColor(a));e.textContent=`${a.done?'✓ ':''}${lotLabel(a)} · ${a.title}`;e.addEventListener('click',()=>openDrawer(a));cell.appendChild(e)});
   if(dayAssets.length>4){const m=document.createElement('div');m.className='more';m.textContent=`+${dayAssets.length-4} más`;cell.appendChild(m)}grid.appendChild(cell);
 }
 root.appendChild(grid);
}
function renderCalendar(){setTitle();state.calendarMode==='week'?renderWeek():renderMonth()}

const LANE_GROUPS=[
 {name:'Memes',sub:'L1 lun/dom · L2 mié/vie · L3 tip mar',match:a=>['Presión vs Foco','Famoso / Quote','Meme · Humor','Meme · Emotivo','Mindset','Tip gráfico'].includes(a.type)},
 {name:'Podcast',sub:'Episodio · intro · verticales · horizontales · anteriores · carruseles',match:a=>String(a.type).startsWith('Podcast ·')},
 {name:'Webinar',sub:'3–4/semana; puede alimentar el video importante',match:a=>a.type==='Webinar'},
 {name:'Testimonios',sub:'2/semana',match:a=>a.type==='Testimonio'},
 {name:'Reacciones',sub:'3 mínimo / 4 máximo',match:a=>a.type==='Reacción'},
 {name:'Carruseles',sub:'Principal JOC + podcast/invitado + evento',match:a=>a.type==='Carrusel LinkedIn'||a.type==='Podcast · Carrusel'||(a.type==='Evento'&&/carrusel/i.test(a.title))},
 {name:'Filosofando',sub:'Viernes L1',match:a=>a.type==='Filosofando'},
 {name:'Lifestyle / Voiceover',sub:'Extras de marca personal',match:a=>['Lifestyle','Voiceover'].includes(a.type)},
 {name:'Eventos',sub:'Capa aditiva',match:a=>a.type==='Evento'}
];
let dragMaster=null;
function laneSourceAssets(date){
 const p=state.lanePlatform;
 if(state.emulationMode&&state.activeScenario)return assetsForDate(date,p==='master'?'all':p);
 return p==='master'?fullPlanAssets(date,'all'):assetsForDate(date,p);
}
function renderLanes(){
 const root=document.getElementById('contentLanes');root.innerHTML='';
 const days=Array.from({length:7},(_,i)=>addDays(startOfWeek(anchor()),i));
 const scroll=document.createElement('div');scroll.className='resource-scroll';
 const grid=document.createElement('div');grid.className='resource-grid';

 const corner=document.createElement('div');corner.className='resource-corner';corner.textContent='Familia';grid.appendChild(corner);
 days.forEach(d=>{
   const h=document.createElement('div');h.className='resource-day'+(keyDate(d)===keyDate(todayLocal())?' today':'');
   h.textContent=`${DAY_SHORT[d.getDay()]} ${d.getDate()}`;grid.appendChild(h);
 });

 LANE_GROUPS.forEach(group=>{
   const name=document.createElement('div');name.className='resource-name';
   name.innerHTML=`<b>${esc(group.name)}</b><small>${esc(group.sub)}</small>`;grid.appendChild(name);

   days.forEach(d=>{
     const cell=document.createElement('div');cell.className='resource-cell';cell.dataset.dow=String(d.getDay());
     const list=laneSourceAssets(d).filter(group.match).sort((a,b)=>a.lotRank-b.lotRank||a.order-b.order);
     if(!list.length)cell.classList.add('empty');

     list.forEach(a=>{
       const ev=document.createElement('div');ev.className='lane-event'+(a.done?' done':'');ev.style.setProperty('--c',eventColor(a));ev.dataset.master=a.masterKey;
       const movable=a.lot!=='L1';ev.draggable=movable;
       ev.innerHTML=`<b>${a.done?'✓ ':''}${esc(a.title)}</b><small>${esc(a.type)} · ${esc(a.surface||'Feed')}${a.done?' · HECHO':''}</small><span class="lot-pill">${esc(lotLabel(a))}</span><div class="event-icons">${platformIconRow(a.platforms)}</div>${a.tentative?'<span class="tentative">TENTATIVO</span>':''}`;
       ev.addEventListener('click',()=>openDrawer(a));
       if(movable)ev.addEventListener('dragstart',e=>{dragMaster=a.masterKey;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',a.masterKey)});
       cell.appendChild(ev);
     });

     cell.addEventListener('dragover',e=>{if(!dragMaster)return;e.preventDefault();cell.classList.add('dragover')});
     cell.addEventListener('dragleave',()=>cell.classList.remove('dragover'));
     cell.addEventListener('drop',e=>{
       e.preventDefault();cell.classList.remove('dragover');
       const master=e.dataTransfer.getData('text/plain')||dragMaster;if(!master)return;
       state.moves[master]=Number(cell.dataset.dow);dragMaster=null;save();renderAll();
     });
     grid.appendChild(cell);
   });
 });
 scroll.appendChild(grid);root.appendChild(scroll);
}
function renderAgenda(){
 const root=document.getElementById('agendaRoot');root.innerHTML='';
 const start=startOfWeek(anchor()),platform=state.agendaPlatform;
 for(let i=0;i<7;i++){
   const d=addDays(start,i),items=assetsForDate(d,platform);
   const day=document.createElement('section');day.className='agenda-day';
   day.innerHTML=`<div class="agenda-date">${DAY_NAMES[d.getDay()]}<br><strong>${d.getDate()} ${d.toLocaleDateString('es-ES',{month:'short'})}</strong></div><div class="agenda-items"></div>`;
   const list=day.querySelector('.agenda-items');
   items.forEach(a=>{
     const row=document.createElement('div');row.className='agenda-row'+(a.done?' done':'');row.style.setProperty('--c',eventColor(a));
     row.innerHTML=`<div class="agenda-lot">${esc(lotLabel(a))}</div><div class="agenda-color"></div><div><b>${a.done?'✓ ':''}${esc(a.title)}</b><small>${esc(a.type)} · ${esc(a.surface||'Feed')}${a.done?' · HECHO':''}</small></div><div class="agenda-icons">${platformIconRow(a.platforms)} <span class="production-check ${a.done?'done':''}">✓</span></div>`;
     row.addEventListener('click',()=>openDrawer(a));list.appendChild(row);
   });
   root.appendChild(day);
 }
}


function executionSurface(a,index=0){
 const e=state.execution||{};
 if(a.type==='Tip gráfico')return e.tip==='reel'?'Reel':'Feed';
 if(a.type==='Presión vs Foco')return e.pressure==='reel'?'Reel':'Feed';
 if(a.type==='Famoso / Quote')return e.famous==='reel'?'Reel':'Feed';
 if(['Meme · Humor','Meme · Emotivo','Mindset'].includes(a.type)){
   if(e.meme==='static')return 'Feed';
   if(e.meme==='reel')return 'Reel';
   return index%2===0?'Feed':'Reel';
 }
 return a.surface||'Feed';
}
function applyExecution(items){
 return items.map((a,i)=>({...a,surface:executionSurface(a,i)}));
}
function formatBucket(a,p){
 const s=String(a.surface||'').toLowerCase(),t=String(a.type||'');
 if(/reel|short|vertical/.test(s))return 'Reel/Short';
 if(/horizontal/.test(s)||t==='Podcast · Episodio'||t==='Podcast · Horizontal')return 'Horizontal';
 if(/carrusel|documento/.test(s)||t.includes('Carrusel'))return 'Carrusel';
 if(/nota/.test(s)||t==='LinkedIn · Nota')return 'Nota';
 if(/video/.test(s)||['Webinar','Reacción','Testimonio','Voiceover','JOC original','LinkedIn · Video'].includes(t))return 'Video';
 return 'Estático';
}
function feedMetricsData(items,p){
 const formatted=applyExecution(items);
 const counts={total:formatted.length,reels:0,static:0,carousel:0,video:0,horizontal:0,notes:0,memes:0};
 formatted.forEach(a=>{
   const b=formatBucket(a,p);
   if(b==='Reel/Short')counts.reels++;
   else if(b==='Estático')counts.static++;
   else if(b==='Carrusel')counts.carousel++;
   else if(b==='Horizontal')counts.horizontal++;
   else if(b==='Nota')counts.notes++;
   else if(b==='Video')counts.video++;
   if(contentFamily(a)==='Memes')counts.memes++;
 });
 return counts;
}
function renderFeedMetrics(){
 const root=document.getElementById('feedMetrics');if(!root)return;
 const items=feedItems(state.feedPlatform),m=feedMetricsData(items,state.feedPlatform);
 const cards=[
   ['Total',m.total,''],
   ['Reels / Shorts',m.reels,m.reels>Math.ceil(m.total*.65)?'warn':'ok'],
   ['Estáticos',m.static,''],
   ['Carruseles',m.carousel,''],
   ['Video',m.video,''],
   ['Horizontal',m.horizontal,''],
   ['Notas',m.notes,''],
   ['Memes',m.memes,'']
 ];
 root.innerHTML=cards.map(([l,v,c])=>`<div class="metric-card ${c}"><b>${v}</b><span>${l}</span></div>`).join('');
}
function renderFeedOverview(){
 const root=document.getElementById('feedRoot'),p=state.feedPlatform,items=applyExecution(feedItems(p));
 root.innerHTML='';
 const wrap=document.createElement('div');wrap.className='feed-sim-wrap';
 wrap.innerHTML=`<div class="feed-disclaimer">Vista miniatura: permite ver de una vez la afluencia semanal/mensual. Color = tipo; marco = lote; etiqueta = formato de ejecución.</div>`;
 const legend=document.createElement('div');legend.className='feed-overview-legend';
 const famCounts={};items.forEach(a=>famCounts[contentFamily(a)]=(famCounts[contentFamily(a)]||0)+1);
 legend.innerHTML=Object.entries(famCounts).sort((a,b)=>b[1]-a[1]).map(([f,n])=>`<span class="summary-chip">${esc(f)} · ${n}</span>`).join('');
 wrap.appendChild(legend);
 const days=feedDates(),grid=document.createElement('div');grid.className='feed-overview';
 days.forEach(d=>{
   const col=document.createElement('section');col.className='overview-day';col.innerHTML=`<div class="overview-day-head">${DAY_SHORT[d.getDay()]} ${d.getDate()}</div><div class="overview-day-list"></div>`;
   const list=col.lastElementChild;
   applyExecution(assetsForDate(d,p)).forEach(a=>{
     const it=document.createElement('div');it.className='overview-item';it.style.setProperty('--typec',eventColor(a));it.style.setProperty('--lotc',LOT_COLORS[a.lot]||'#888');
     it.classList.toggle('done',!!a.done);it.innerHTML=`<span class="overview-format">${esc(formatBucket(a,p))}</span><b>${a.done?'✓ ':''}${esc(a.title)}</b><small>${esc(contentFamily(a))} · ${esc(a.lot)}${a.done?' · HECHO':''}</small>`;
     it.addEventListener('click',()=>openDrawer(a));list.appendChild(it);
   });
   grid.appendChild(col);
 });
 wrap.appendChild(grid);root.appendChild(wrap);
}

function feedDatesRaw(){
 const a=anchor();
 if(state.feedHorizon==='scenario'&&state.emulationMode&&state.activeScenario?.range)return datesForScenarioRange(state.activeScenario.range,366);
 if(state.feedHorizon==='week')return Array.from({length:7},(_,i)=>addDays(startOfWeek(a),i));
 const start=startOfWeek(a);return Array.from({length:28},(_,i)=>addDays(start,i));
}
let v12FeedExpanded=false;
const V12_FEED_DAY_CAP=42;
function feedDates(){
 const dates=feedDatesRaw();
 if(state.feedHorizon==='scenario'&&!v12FeedExpanded&&dates.length>V12_FEED_DAY_CAP)return dates.slice(0,V12_FEED_DAY_CAP);
 return dates;
}

function feedItems(platform){return feedDates().flatMap(d=>assetsForDate(d,platform).map(a=>({...a,date:d})))}
function feedSummary(items){
 const counts={};
 items.forEach(a=>{const fam=TYPE_FAMILY[a.type]||a.type;counts[fam]=(counts[fam]||0)+1});
 return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>`<span class="summary-chip">${esc(k)} · ${v}</span>`).join('');
}
function simHash(str){
 let h=2166136261;for(let i=0;i<String(str).length;i++){h^=String(str).charCodeAt(i);h=Math.imul(h,16777619)}return Math.abs(h>>>0);
}
function demoMetric(a,min,max){
 const n=min+(simHash(a.masterKey+a.title)%(max-min+1));
 return n>=1000?`${(n/1000).toFixed(n>=10000?0:1)} mil`:String(n);
}
function lotColor(a){return LOT_COLORS[a.lot]||'#888'}
function simMedia(a,label=''){
 return `<div class="sim-media${a.done?' done':''}" style="--media:${eventColor(a)};--lotc:${lotColor(a)}">
   <span class="sim-lot-badge">${esc(a.lot||'')}</span>
   <span class="sim-type-badge">${esc(label||a.surface||a.type)}</span>
   ${a.done?'<span class="sim-done-badge">✓ HECHO</span>':''}
   <div class="sim-media-label"><b>${esc(a.title)}</b><small>${esc(a.type)} · ${esc(a.surface||'Feed')}${a.done?' · HECHO':''}</small></div>
 </div>`;
}
function feedKind(a,p){
 const s=String(a.surface||'').toLowerCase(),t=String(a.type||'');
 if(p==='instagram'){
   if(/carrusel|documento/.test(s)||t.includes('Carrusel'))return 'carousel';
   if(/reel|video|vertical|short/.test(s)||['Webinar','Reacción','Testimonio','Voiceover','JOC original'].includes(t))return 'reel';
   return 'image';
 }
 if(p==='facebook'){
   if(/reel|video|vertical|short/.test(s))return 'reel';
   if(/carrusel|documento/.test(s)||t.includes('Carrusel'))return 'carousel';
   return 'post';
 }
 if(p==='tiktok'){
   if(t.startsWith('Podcast ·'))return 'podcast';
   if(t==='Webinar')return 'webinar';
   if(t==='Reacción')return 'reaction';
   return 'other';
 }
 if(p==='youtube'){
   if(s==='short')return 'shorts';
   if(s==='community'||/carrusel/.test(s))return 'community';
   return 'videos';
 }
 if(p==='linkedin'){
   if(t==='LinkedIn · Nota'||s==='nota')return 'notes';
   if(t==='LinkedIn · Carrusel'||/documento|carrusel/.test(s)||t.includes('Carrusel'))return 'documents';
   return 'videos';
 }
 return 'all';
}
function attachFeedTabs(container,p,options){
 const bar=document.createElement('div');bar.className='feed-inner-tabs';
 const current=state.feedSubView?.[p]||options[0][0];
 options.forEach(([key,label])=>{
   const b=document.createElement('button');b.type='button';b.textContent=label;b.classList.toggle('active',current===key);
   b.addEventListener('click',()=>{state.feedSubView={...(state.feedSubView||{}),[p]:key};save();renderFeed()});
   bar.appendChild(b);
 });
 container.appendChild(bar);
 return current;
}

function resolvedFeedDevice(){
 if(state.feedDevice==='mobile'||state.feedDevice==='desktop')return state.feedDevice;
 return window.innerWidth<900?'mobile':'desktop';
}
function finalizeFeedStage(sim){
 if(!sim)return;
 const device=resolvedFeedDevice();
 sim.classList.add('feed-device-shell',device==='mobile'?'device-mobile':'device-desktop');
 if(state.feedView!=='zoomout')return;
 const parent=sim.parentElement;if(!parent)return;
 const stage=document.createElement('div');stage.className='feed-zoom-stage';
 parent.insertBefore(stage,sim);stage.appendChild(sim);sim.classList.add('feed-zoom-inner');
 const note=document.createElement('div');note.className='feed-zoom-note';note.textContent=`Zoom-out · ${device==='mobile'?'Mobile':'Desktop'}`;stage.appendChild(note);
 requestAnimationFrame(()=>{
   sim.style.transform='none';
   const rawW=Math.max(sim.scrollWidth,sim.getBoundingClientRect().width||1);
   const rawH=Math.max(sim.scrollHeight,sim.getBoundingClientRect().height||1);
   const availW=Math.max(280,stage.clientWidth-8);
   const availH=Math.max(420,Math.min(window.innerHeight-190,820));
   const scale=Math.min(1,availW/rawW,availH/rawH);
   sim.style.transform=`scale(${scale})`;
   stage.style.height=`${Math.ceil(rawH*scale)}px`;
   stage.style.minHeight=`${Math.ceil(Math.min(rawH*scale,180))}px`;
 });
}
function renderFeed(){
 renderFeedMetrics();
 if(state.feedView==='overview'){renderFeedOverview();return}
 const root=document.getElementById('feedRoot'),p=state.feedPlatform,allItems=applyExecution(feedItems(p));
 const doneCount=allItems.filter(a=>a.done).length;
 root.innerHTML=`<div class="feed-summary"><span class="summary-chip">${allItems.length} publicaciones planificadas</span><span class="summary-chip">✓ ${doneCount}/${allItems.length} hechas</span>${feedSummary(allItems)}<span class="summary-chip">marco = lote · color = tipo</span></div>`;
 const fullScenarioDates=state.feedHorizon==='scenario'?feedDatesRaw():[];
 if(fullScenarioDates.length>V12_FEED_DAY_CAP&&!v12FeedExpanded){
   const notice=document.createElement('div');notice.className='v12-feed-window-notice';
   notice.innerHTML=`<div><b>Vista optimizada</b><small>Mostrando ${V12_FEED_DAY_CAP} de ${fullScenarioDates.length} días para mantener el feed fluido.</small></div><button type="button" class="btn" id="v12ExpandFeed">Cargar rango completo</button>`;
   root.appendChild(notice);
   notice.querySelector('#v12ExpandFeed').addEventListener('click',()=>{v12FeedExpanded=true;renderFeed()});
 }

 const wrap=document.createElement('div');wrap.className='feed-sim-wrap';
 wrap.innerHTML=`<div class="feed-disclaimer">La estructura visual imita la plataforma para evaluar densidad y secuencia. Cada pieza muestra siempre su nombre, tipo y lote. Las imágenes son placeholders editoriales y las métricas son solo demo visual.</div>`;
 root.appendChild(wrap);

 if(p==='instagram'){
   const sim=document.createElement('div');sim.className='instagram-sim';
   const view=attachFeedTabs(sim,p,[['all','Publicaciones'],['reel','Reels'],['carousel','Carruseles'],['image','Imágenes']]);
   const items=view==='all'?allItems:allItems.filter(a=>feedKind(a,p)===view);
   sim.insertAdjacentHTML('beforeend',`<div class="ig-topline"><span class="ig-wordmark">Instagram</span><div class="ig-topicons">⌂ ♡ ⊕</div></div>
   <div class="ig-profile-real"><div class="ig-avatar-real">J</div><div><div class="ig-line1"><b>joclopez</b><button class="ig-profile-btn">Editar perfil</button><button class="ig-profile-btn">Ver archivo</button><span>•••</span></div><div class="ig-stats"><span><b>${allItems.length}</b> publicaciones del período</span><span><b>—</b> seguidores</span><span><b>—</b> seguidos</span></div><div class="ig-bio"><b>JOC López</b><br>Negocio · ventas · criterio · podcast<br><span class="sim-muted">${state.emulationMode?'Emulación activa':'Vista previa editorial'}</span></div></div></div>
   <div class="ig-highlights"><div class="ig-highlight"><i></i><b>Podcast</b></div><div class="ig-highlight"><i></i><b>Webinars</b></div><div class="ig-highlight"><i></i><b>Trabajo</b></div><div class="ig-highlight"><i></i><b>Ideas</b></div></div>
   <div class="ig-tabs"><span>▦ ${view==='all'?'PUBLICACIONES':view.toUpperCase()}</span><span>▷ REELS</span><span>♙ ETIQUETADAS</span></div><div class="ig-real-grid"></div>`);
   const grid=sim.querySelector('.ig-real-grid');
   items.forEach(a=>{const t=document.createElement('div');t.className='ig-real-tile';t.innerHTML=simMedia(a,feedKind(a,p)==='reel'?'REEL':feedKind(a,p)==='carousel'?'CARRUSEL':'POST');t.addEventListener('click',()=>openDrawer(a));grid.appendChild(t)});
   wrap.appendChild(sim);finalizeFeedStage(sim);return;
 }

 if(p==='facebook'){
   const sim=document.createElement('div');sim.className='facebook-sim';
   const view=attachFeedTabs(sim,p,[['all','Inicio'],['reel','Reels'],['carousel','Carruseles'],['post','Publicaciones']]);
   const items=view==='all'?allItems:allItems.filter(a=>feedKind(a,p)===view);
   sim.insertAdjacentHTML('beforeend',`<div class="fb-cover"></div><div class="fb-page-head"><div class="fb-profile-row"><div class="fb-avatar-real">J</div><div class="fb-title"><h3>JOC López</h3><small>Marca personal · ${allItems.length} publicaciones planificadas</small></div><div class="fb-actions"><button class="fb-blue">Seguir</button><button class="fb-grey">Mensaje</button></div></div><div class="fb-tabs-real"><b>${view==='all'?'Publicaciones':view}</b><span>Información</span><span>Reels</span><span>Fotos</span><span>Más</span></div></div><div class="fb-layout-real"><aside class="fb-sidecard"><h4>Información</h4><p>Contenido sobre negocio, ventas, criterio, podcast y trabajo real.</p><p>Color = tipo de contenido. Marco = lote.</p></aside><main class="fb-posts-real"></main></div>`);
   const posts=sim.querySelector('.fb-posts-real');
   items.forEach(a=>{const post=document.createElement('article');post.className='fb-post-real';post.innerHTML=`<div class="fb-post-head"><div class="sim-avatar sm">J</div><div><b>JOC López</b><small>${DAY_NAMES[a.date.getDay()]} · 🌐</small></div><span style="margin-left:auto">•••</span></div><div class="fb-post-copy">${esc(a.role||a.title)}</div>${simMedia(a,feedKind(a,p).toUpperCase())}<div class="fb-engagement"><span>👍 ❤️ ${demoMetric(a,18,680)}</span><span>${demoMetric({...a,masterKey:a.masterKey+'c'},2,48)} comentarios · ${demoMetric({...a,masterKey:a.masterKey+'s'},1,22)} compartidos</span></div><div class="fb-actions-row"><span>👍 Me gusta</span><span>💬 Comentar</span><span>↗ Compartir</span></div>`;post.addEventListener('click',()=>openDrawer(a));posts.appendChild(post)});
   wrap.appendChild(sim);finalizeFeedStage(sim);return;
 }

 if(p==='tiktok'){
   const sim=document.createElement('div');sim.className='tiktok-sim';
   const view=attachFeedTabs(sim,p,[['all','Videos'],['podcast','Podcast'],['webinar','Webinar'],['reaction','Reacciones'],['other','Otros']]);
   const items=view==='all'?allItems:allItems.filter(a=>feedKind(a,p)===view);
   sim.insertAdjacentHTML('beforeend',`<div class="tt-real-top"><b class="tt-logo-real">♪ TikTok</b><div class="tt-search">Buscar</div><div class="tt-actions-real"><span>+ Cargar</span><span>Mensajes</span><span>Perfil</span></div></div><div class="tt-profile-real"><div class="tt-profile-info"><div class="tt-avatar-real">J</div><div class="tt-name"><h3>@joc</h3><p>JOC López</p><button class="tt-follow">Seguir</button></div></div><div class="tt-stats-real"><span><b>—</b> Siguiendo</span><span><b>—</b> Seguidores</span><span><b>—</b> Me gusta</span></div><div class="tt-bio-real">Negocio · ventas · podcast · criterio aplicado</div><div class="tt-tabs-real"><span>${view==='all'?'Videos':view}</span><span>Favoritos</span><span>Me gusta</span></div><div class="tt-real-grid"></div></div>`);
   const grid=sim.querySelector('.tt-real-grid');
   items.forEach(a=>{const t=document.createElement('div');t.className='tt-real-tile';t.innerHTML=`${simMedia(a,'▶ '+a.lot)}<span class="tt-playcount">▶ ${demoMetric(a,1200,48000)}</span>`;t.addEventListener('click',()=>openDrawer(a));grid.appendChild(t)});
   wrap.appendChild(sim);finalizeFeedStage(sim);return;
 }

 if(p==='youtube'){
   const sim=document.createElement('div');sim.className='youtube-sim';
   const view=attachFeedTabs(sim,p,[['home','Inicio'],['videos','Videos'],['shorts','Shorts'],['community','Comunidad']]);
   const videos=allItems.filter(a=>feedKind(a,p)==='videos'),shorts=allItems.filter(a=>feedKind(a,p)==='shorts'),community=allItems.filter(a=>feedKind(a,p)==='community');
   sim.insertAdjacentHTML('beforeend',`<div class="yt-real-top"><b class="yt-logo-real">▶ YouTube</b><div class="yt-search-real"><span>Buscar</span><b>⌕</b></div><div class="yt-top-actions">⊕ 🔔 ◉</div></div><div class="yt-banner-real"></div><div class="yt-channel-head"><div class="yt-avatar-real">J</div><div class="yt-channel-copy"><h3>JOC</h3><p>@joc · canal de podcast, negocio y criterio</p><p>${allItems.length} publicaciones planificadas</p></div><button class="yt-subscribe">Suscribirse</button></div><div class="yt-tabs-real"><span>${view==='home'?'INICIO':view.toUpperCase()}</span><span>VIDEOS</span><span>SHORTS</span><span>LISTAS</span><span>COMUNIDAD</span></div><div class="yt-real-content"></div>`);
   const content=sim.querySelector('.yt-real-content');
   const section=(title,cls,data,builder)=>{if(!data.length)return;const s=document.createElement('section');s.className='yt-real-section';s.innerHTML=`<h4>${title} · ${data.length}</h4><div class="${cls}"></div>`;const c=s.lastElementChild;data.forEach(a=>c.appendChild(builder(a)));content.appendChild(s)};
   const renderVideos=()=>section('Videos','yt-real-videos',videos,a=>{const c=document.createElement('div');c.className='yt-real-video';c.innerHTML=`${simMedia(a,'VIDEO')}<b>${esc(a.title)}</b><small>${demoMetric(a,450,18000)} visualizaciones · ${DAY_SHORT[a.date.getDay()]}</small>`;c.addEventListener('click',()=>openDrawer(a));return c});
   const renderShorts=()=>section('Shorts','yt-real-shorts',shorts,a=>{const c=document.createElement('div');c.className='yt-real-short';c.innerHTML=`${simMedia(a,'SHORT')}<b>${esc(a.title)}</b><small>${demoMetric(a,900,42000)} visualizaciones</small>`;c.addEventListener('click',()=>openDrawer(a));return c});
   const renderCommunity=()=>section('Comunidad','yt-community-real',community,a=>{const c=document.createElement('div');c.className='yt-community-post'+(a.done?' done':'');c.innerHTML=`<b>${a.done?'✓ ':''}JOC</b><p>${esc(a.title)}</p><p class="sim-muted">${DAY_NAMES[a.date.getDay()]} · ${esc(a.type)} · ${esc(a.lot)}${a.done?' · HECHO':''}</p>`;c.addEventListener('click',()=>openDrawer(a));return c});
   if(view==='home'){renderVideos();renderShorts();renderCommunity()}else if(view==='videos')renderVideos();else if(view==='shorts')renderShorts();else renderCommunity();
   wrap.appendChild(sim);finalizeFeedStage(sim);return;
 }

 if(p==='linkedin'){
   const sim=document.createElement('div');sim.className='linkedin-sim';
   const view=attachFeedTabs(sim,p,[['all','Inicio'],['notes','Notas'],['documents','Documentos'],['videos','Videos']]);
   const items=view==='all'?allItems:allItems.filter(a=>feedKind(a,p)===view);
   sim.insertAdjacentHTML('beforeend',`<div class="li-real-top"><div class="li-logo-real">in</div><div class="li-search-real">Buscar</div><div class="li-nav-real"><span>Inicio</span><span>Mi red</span><span>Empleos</span><span>Mensajes</span><span>Notificaciones</span><span>Yo</span></div></div><div class="li-page-grid"><aside class="li-profile-card"><div class="li-cover-real"></div><div class="li-profile-body"><div class="li-avatar-real">J</div><b>JOC López</b><p>Negocio · ventas · liderazgo · podcast</p><p>${allItems.length} publicaciones planificadas</p></div></aside><main class="li-posts-real"></main><aside class="li-side-real"><h4>L2 LinkedIn propuesto</h4><p>Viernes: nota de tesis contraria / aprendizaje operativo.</p><p>Sábado: carrusel diagnóstico / checklist.</p><p>Domingo: video de tesis / caso 45–90 s.</p><h4>Cadencia</h4><p>${state.liMode==='daily'?'Publicación diaria':'Core de 4 publicaciones semanales'}</p></aside></div>`);
   const posts=sim.querySelector('.li-posts-real');
   items.forEach(a=>{const post=document.createElement('article');post.className='li-post-real';post.innerHTML=`<div class="li-post-head-real"><div class="sim-avatar sm">J</div><div><b>JOC López</b><small>Negocio · Podcast · ${DAY_NAMES[a.date.getDay()]}</small><small>🌐</small></div><span style="margin-left:auto">•••</span></div><div class="li-post-copy-real">${esc(a.role||'Idea aplicada de JOC.')}</div>${simMedia(a,feedKind(a,p).toUpperCase())}<div class="li-reactions-real">👍 ❤️ 👏 ${demoMetric(a,25,420)} · ${demoMetric({...a,masterKey:a.masterKey+'lc'},2,38)} comentarios</div><div class="li-actions-real"><span>Recomendar</span><span>Comentar</span><span>Compartir</span><span>Enviar</span></div>`;post.addEventListener('click',()=>openDrawer(a));posts.appendChild(post)});
   wrap.appendChild(sim);finalizeFeedStage(sim);
 }
}
const INVENTORY=[
 ['Podcast · Episodio','Episodio completo','YouTube horizontal del jueves.'],
 ['Podcast · Intro','Intro / trailer','L1 social del jueves y Short principal de lanzamiento en YouTube.'],
 ['Podcast · Vertical','Vertical principal','Clips principales del episodio; el mismo master puede distribuirse en varias redes.'],
 ['Podcast · Vertical secundario','Vertical secundario','Segundo Short diario de YouTube y clip adicional cuando corresponda.'],
 ['Podcast · Horizontal','Clip horizontal','Martes, sábado y domingo en YouTube.'],
 ['Podcast · Anterior','Episodio anterior / flexible','Dos slots flexibles por semana; se pueden sustituir por más episodio actual o Webinar.'],
 ['Podcast · Carrusel','Carruseles podcast/invitado','LinkedIn/IG/FB y Community de YouTube cuando corresponde.'],
 ['Webinar','Webinar','Objetivo 3–4/semana; puede alimentar el video importante.'],
 ['Reacción','Reacción','3 mínimo / 4 máximo contando sábado L1.'],
 ['Testimonio','Testimonio','2/semana. Webinar queda tentativo ese día salvo volumen máximo.'],
 ['Presión vs Foco','Presión vs Foco','Lunes L1 fijo.'],
 ['Tip gráfico','Tip gráfico fijo','Martes L3 fijo.'],
 ['Meme · Humor','Meme rotativo','Miércoles o viernes L2 según rotación.'],
 ['Meme · Emotivo','Meme rotativo','Miércoles o viernes L2 según rotación.'],
 ['Famoso / Quote','Famoso + frase','Domingo L1 fijo.'],
 ['Filosofando','Filosofando con Gigantes','Viernes L1 fijo; prioritariamente Reel.'],
 ['LinkedIn · Nota','L2 LinkedIn · Nota','Tesis contraria, aprendizaje operativo o opinión defendible en texto nativo.'],
 ['LinkedIn · Carrusel','L2 LinkedIn · Carrusel','Diagnóstico, checklist, framework o antes/después diseñado como documento guardable.'],
 ['LinkedIn · Video','L2 LinkedIn · Video','Video nativo 45–90 s con problema, criterio, caso y conclusión.'],
 ['Lifestyle','Lifestyle','Feed selectivo. Stories no cuentan.'],
 ['Voiceover','Voiceover','Ejecución audiovisual sobre footage real.'],
 ['Evento','Event Pack','2 videos + 2 carruseles, aditivos.']
];
/* V12: legacy renderInventory removed; canonical implementation lives later. */
function renderLegend(){
 const order=['Podcast · Episodio','Podcast · Intro','Podcast · Vertical','Podcast · Vertical secundario','Podcast · Horizontal','Podcast · Anterior','Podcast · Carrusel','Webinar','Reacción','Testimonio','Presión vs Foco','Filosofando','Carrusel LinkedIn','Meme · Humor','Meme · Emotivo','Tip gráfico','Famoso / Quote'];
 const r=document.getElementById('legend');r.innerHTML='';order.forEach(t=>{const s=document.createElement('span');s.innerHTML=`<i class="sw" style="background:${COLORS[t]}"></i>${esc(t)}`;r.appendChild(s)});
}
function coverageData(){
 const days=Array.from({length:7},(_,i)=>addDays(startOfWeek(anchor()),i));
 const dayItems=days.map(d=>assetsForDate(d,'all'));
 const all=dayItems.flat();
 const uniqueCount=predicate=>new Set(all.filter(predicate).map(a=>a.masterKey)).size;
 const podcastDays=dayItems.filter(items=>items.some(a=>String(a.type).startsWith('Podcast ·'))).length;
 return [
   {label:'Podcast',n:podcastDays,min:7,max:7,unit:'días con presencia'},
   {label:'Webinar',n:uniqueCount(a=>a.type==='Webinar'),min:3,max:4,unit:'piezas únicas'},
   {label:'Reacciones',n:uniqueCount(a=>a.type==='Reacción'),min:3,max:4,unit:'piezas únicas'},
   {label:'Testimonios',n:uniqueCount(a=>a.type==='Testimonio'),min:2,max:2,unit:'piezas únicas'},
   {label:'Memes',n:uniqueCount(a=>['Presión vs Foco','Famoso / Quote','Meme · Humor','Meme · Emotivo','Tip gráfico'].includes(a.type)),min:5,max:5,unit:'piezas únicas'}
 ].map(x=>({...x,ok:x.n>=x.min,high:x.n>x.max}));
}
function renderCoverage(){
 const data=coverageData(),r=document.getElementById('coverageList');r.innerHTML='';
 data.forEach(x=>{
   const status=x.n<x.min?'low':x.high?'high':'good';
   const text=x.n<x.min?'faltan':x.high?'por encima del target':'en target';
   const row=document.createElement('div');row.className=`coverage-row ${status}`;
   row.innerHTML=`<b>${esc(x.label)}</b><strong>${x.n} / ${x.min}${x.max!==x.min?`–${x.max}`:''}</strong><small>${esc(x.unit)} · ${text}</small>`;
   r.appendChild(row);
 });
 const score=Math.round(data.filter(x=>x.ok).length/data.length*100);
 document.getElementById('coverageScore').textContent=`${score}%`;
}
function renderStats(){
 const days=Array.from({length:7},(_,i)=>addDays(startOfWeek(anchor()),i)),raw=[];
 days.forEach(d=>['instagram','facebook','tiktok','youtube','linkedin'].forEach(p=>assetsForDate(d,p).forEach(a=>raw.push({...a,p,date:keyDate(d)}))));
 const masters=new Set(raw.map(x=>`${x.date}|${x.masterKey}`));
 document.getElementById('masterCount').textContent=masters.size;
 document.getElementById('publicationCount').textContent=raw.length;
 document.getElementById('ytShortCount').textContent=days.flatMap(d=>assetsForDate(d,'youtube')).filter(a=>a.surface==='Short').length;
}


function addTemplateToDraft(templateId,dow,toIndex=null){
 const t=templateById(templateId);if(!t)return;
 checkpoint('Agregar contenido');
 const item=cloneTemplate(t,Number(dow),{masterKey:t.fixed?`scenario-fixed-${t.id}`:`scenario-${t.id}-${uid('m')}`});
 const arr=plannerDraft[Number(dow)]||(plannerDraft[Number(dow)]=[]);
 if(toIndex===null||toIndex===undefined||toIndex<0||toIndex>arr.length)arr.push(item);else arr.splice(toIndex,0,item);
 logAction('Agregó contenido',`${t.title} → ${DAY_NAMES[Number(dow)]}`);
 renderPlanner();
}
function removePlanItem(instanceId){
 let found=null,dow=null;
 [1,2,3,4,5,6,0].forEach(d=>{const a=plannerDraft[d].find(x=>x.instanceId===instanceId);if(a){found=a;dow=d}});
 if(!found||found.fixed)return;
 checkpoint('Eliminar contenido');
 plannerDraft[dow]=plannerDraft[dow].filter(x=>x.instanceId!==instanceId);
 logAction('Quitó contenido',`${found.title} de ${DAY_NAMES[dow]}`);
 renderPlanner();
}
function movePlanInstance(instanceId,toDow,toIndex=null){
 let found=null,from=null;
 [1,2,3,4,5,6,0].forEach(d=>{const idx=plannerDraft[d].findIndex(x=>x.instanceId===instanceId);if(idx>=0){found=plannerDraft[d][idx];from=d}});
 if(!found||found.fixed)return;
 checkpoint('Mover contenido');
 plannerDraft[from]=plannerDraft[from].filter(x=>x.instanceId!==instanceId);
 found={...found,dow:Number(toDow)};
 const dest=plannerDraft[Number(toDow)]||(plannerDraft[Number(toDow)]=[]);
 const fixedCount=dest.filter(x=>x.fixed).length;
 const idx=toIndex===null||toIndex===undefined?dest.length:Math.max(fixedCount,Math.min(dest.length,Number(toIndex)));
 dest.splice(idx,0,found);
 logAction('Movió contenido',`${found.title}: ${DAY_NAMES[from]} → ${DAY_NAMES[Number(toDow)]}`);
 renderPlanner();
}
function dropIndexForList(list,clientY){
 const cards=[...list.querySelectorAll('.plan-item:not(.fixed):not(.dragging)')];
 for(let i=0;i<cards.length;i++){const r=cards[i].getBoundingClientRect();if(clientY<r.top+r.height/2)return i}
 return cards.length;
}
function plannerCounts(){
 const all=[1,2,3,4,5,6,0].flatMap(d=>plannerDraft[d]);
 return {
   total:all.length,
   l1:all.filter(x=>x.lot==='L1').length,
   l2:all.filter(x=>x.lot==='L2').length,
   l3:all.filter(x=>x.lot==='L3').length,
   platforms:Object.fromEntries(Object.keys(PNAME).map(p=>[p,all.filter(x=>x.platforms.includes(p)).length]))
 };
}
function renderPlannerPool(){
 const root=document.getElementById('plannerPool');if(!root)return;root.innerHTML='';
 const f=document.getElementById('plannerFilter').value;
 const q=(document.getElementById('plannerSearch')?.value||'').trim().toLowerCase();
 let templates=enabledTemplates().filter(t=>{
   if(f!=='all'){
     if(f==='linkedin'&&!String(t.type).startsWith('LinkedIn ·'))return false;
     if(f!=='linkedin'&&t.lot!==f)return false;
   }
   if(q&&!metaText(t).includes(q))return false;
   return true;
 });
 const grouped={};
 templates.forEach(t=>{
   let family=contentFamily(t);
   if(t.type.startsWith('LinkedIn ·'))family='LinkedIn L2';
   if((t.platforms||[]).length===1&&t.platforms[0]==='youtube'&&!String(t.type).startsWith('LinkedIn'))family='YouTube';
   (grouped[family]||(grouped[family]=[])).push(t);
 });
 const order=FAMILY_ORDER.filter(f=>grouped[f]?.length).concat(Object.keys(grouped).filter(f=>!FAMILY_ORDER.includes(f)).sort());
 if(!order.length){
   root.innerHTML='<div class="callout">No hay contenidos activos que coincidan con la búsqueda en esta marca.</div>';
   return;
 }
 order.forEach(family=>{
   const group=document.createElement('section');group.className=`family-group ${familySlug(family)}`;
   group.innerHTML=`<div class="family-group-head"><b>${esc(family)}</b><small>${grouped[family].length} tipos</small></div><div class="family-group-list"></div>`;
   const list=group.lastElementChild;
   grouped[family].forEach(t=>{
     const c=document.createElement('div');c.className='pool-card';c.dataset.template=t.id;c.draggable=!window.Sortable;
     c.style.setProperty('--typec',eventColor(t));c.style.setProperty('--lotc',LOT_COLORS[t.lot]||'#888');
     const compat=(t.compatibleFormats||FORMAT_COMPAT[t.type]||[t.surface||'Feed']).map(x=>`<span>${esc(x)}</span>`).join('');
     const fam=familyById(t.familyId)?.name||family,pill=pillarById(t.pillarId)?.name||'';
     c.innerHTML=`<div class="pool-card-head"><div><b>${esc(t.title)}</b><small>${esc(t.type)} · ${esc(fam)}${pill?` · ${esc(pill)}`:''}</small></div><span class="pool-lot">${esc(t.lot)}</span></div><div class="format-compat">${compat}</div><div class="pool-card-actions"><span class="event-icons">${platformIconRow(t.platforms)}</span><button class="pool-add" type="button" title="Agregar al día seleccionado">+</button></div>`;
     if(!window.Sortable)c.addEventListener('dragstart',e=>{e.dataTransfer.effectAllowed='copy';e.dataTransfer.setData('text/plain',`template:${t.id}`)});
     c.querySelector('.pool-add').addEventListener('click',e=>{e.stopPropagation();addTemplateToDraft(t.id,Number(document.getElementById('plannerTargetDay').value))});
     list.appendChild(c);
   });
   root.appendChild(group);
 });
 initPoolSortables(root);
}
let poolSortables=[],weekSortables=[];
function destroySortables(list){list.splice(0).forEach(s=>{try{s.destroy()}catch(e){}})}
function initPoolSortables(root){
 destroySortables(poolSortables);if(!window.Sortable)return;
 root.querySelectorAll('.family-group-list').forEach(list=>poolSortables.push(Sortable.create(list,{group:{name:'editorial-planner',pull:'clone',put:false},sort:false,animation:150,delay:140,delayOnTouchOnly:true,touchStartThreshold:4,forceFallback:true,fallbackOnBody:true,fallbackTolerance:4,ghostClass:'sortable-ghost',chosenClass:'sortable-chosen',dragClass:'sortable-drag'})));
}
function initWeekSortables(root){
 destroySortables(weekSortables);if(!window.Sortable)return;
 root.querySelectorAll('.planner-day-list').forEach(list=>weekSortables.push(Sortable.create(list,{
   group:{name:'editorial-planner',pull:true,put:true},animation:180,handle:'.plan-handle',draggable:'.plan-item:not(.fixed),.pool-card',
   delay:160,delayOnTouchOnly:true,touchStartThreshold:4,forceFallback:true,fallbackOnBody:true,fallbackTolerance:4,swapThreshold:.65,
   ghostClass:'sortable-ghost',chosenClass:'sortable-chosen',dragClass:'sortable-drag',
   onAdd(evt){const dow=Number(evt.to.closest('.planner-day')?.dataset.dow);if(!Number.isFinite(dow))return;if(evt.item.classList.contains('pool-card')){const templateId=evt.item.dataset.template;evt.item.remove();const fixed=(plannerDraft[dow]||[]).filter(x=>x.fixed).length;addTemplateToDraft(templateId,dow,fixed+(evt.newDraggableIndex??0))}},
   onEnd(evt){if(evt.item.classList.contains('pool-card'))return;const id=evt.item.dataset.instance;if(!id)return;const dow=Number(evt.to.closest('.planner-day')?.dataset.dow);if(!Number.isFinite(dow))return;const fixed=(plannerDraft[dow]||[]).filter(x=>x.fixed).length;movePlanInstance(id,dow,fixed+(evt.newDraggableIndex??0))}
 })));
}
function renderPlannerWeek(){
 const root=document.getElementById('plannerWeekGrid');if(!root)return;root.innerHTML='';
 [1,2,3,4,5,6,0].forEach(dow=>{
   const day=document.createElement('section');day.className='planner-day';day.dataset.dow=String(dow);
   const source=[...(plannerDraft[dow]||[])],items=[...source.filter(x=>x.fixed),...source.filter(x=>!x.fixed)];
   day.innerHTML=`<div class="planner-day-head"><span>${DAY_NAMES[dow]}</span><span>${items.length}</span></div><div class="planner-day-list"></div>`;
   const list=day.querySelector('.planner-day-list');
   items.forEach(a=>{
     const c=document.createElement('div');c.className='plan-item'+(a.fixed?' fixed':'');c.draggable=!a.fixed&&!window.Sortable;c.dataset.instance=a.instanceId;
     c.style.setProperty('--typec',eventColor(a));c.style.setProperty('--lotc',LOT_COLORS[a.lot]||'#888');
     c.innerHTML=`<button class="plan-remove" type="button" title="Quitar">×</button><div class="plan-handle">${a.fixed?'●':'⋮⋮'}</div><b>${esc(a.title)}</b><small>${esc(a.type)} · ${esc(a.surface||'Feed')}</small><span class="lot-pill" style="background:${LOT_COLORS[a.lot]||'#888'};color:#fff">${esc(a.lot)}</span><div class="plan-icons">${platformIconRow(a.platforms)}</div>`;
     if(!window.Sortable)c.addEventListener('dragstart',e=>{if(a.fixed)return;c.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',`instance:${a.instanceId}`)});
     if(!window.Sortable)c.addEventListener('dragend',()=>{c.classList.remove('dragging');document.querySelectorAll('.kanban-placeholder').forEach(x=>x.remove());document.querySelectorAll('.planner-day').forEach(x=>x.classList.remove('dragover'))});
     c.querySelector('.plan-remove').addEventListener('click',e=>{e.stopPropagation();removePlanItem(a.instanceId)});
     c.addEventListener('click',()=>openDrawer(a));list.appendChild(c);
   });
   if(!window.Sortable)day.addEventListener('dragover',e=>{
     e.preventDefault();day.classList.add('dragover');
     const payload=e.dataTransfer.types.includes('text/plain');
     if(!payload)return;
     document.querySelectorAll('.kanban-placeholder').forEach(x=>x.remove());
     const ph=document.createElement('div');ph.className='kanban-placeholder';
     const movable=[...list.querySelectorAll('.plan-item:not(.fixed):not(.dragging)')];
     const idx=dropIndexForList(list,e.clientY);
     if(idx>=movable.length)list.appendChild(ph);else list.insertBefore(ph,movable[idx]);
   });
   if(!window.Sortable)day.addEventListener('dragleave',e=>{if(!day.contains(e.relatedTarget)){day.classList.remove('dragover');document.querySelectorAll('.kanban-placeholder').forEach(x=>x.remove())}});
   if(!window.Sortable)day.addEventListener('drop',e=>{
     e.preventDefault();day.classList.remove('dragover');
     const payload=e.dataTransfer.getData('text/plain');const idx=dropIndexForList(list,e.clientY);
     document.querySelectorAll('.kanban-placeholder').forEach(x=>x.remove());
     if(payload.startsWith('template:'))addTemplateToDraft(payload.slice(9),dow,idx+items.filter(x=>x.fixed).length);
     if(payload.startsWith('instance:'))movePlanInstance(payload.slice(9),dow,idx+items.filter(x=>x.fixed).length);
   });
   root.appendChild(day);
 });
 initWeekSortables(root);
}
function renderPlannerSummary(){
 const c=plannerCounts(),r=document.getElementById('plannerSummary');if(!r)return;
 r.innerHTML=`<span class="summary-chip">${c.total} piezas</span><span class="summary-chip">L1 ${c.l1}</span><span class="summary-chip">L2 ${c.l2}</span><span class="summary-chip">L3 ${c.l3}</span><span class="summary-chip">IG ${c.platforms.instagram}</span><span class="summary-chip">YT ${c.platforms.youtube}</span><span class="summary-chip">LI ${c.platforms.linkedin}</span>`;
}
function renderPlanner(){renderPlannerPool();renderPlannerWeek();renderPlannerSummary()}

function currentScenarioSlots(){
 return cloneSlots(plannerDraft);
}

function defaultScenarioRange(){
 const start=keyDate(startOfWeek(anchor()));
 const end=keyDate(addDays(parseDateKey(start),27));
 return {mode:'weeks',start,end,weeks:4};
}
function normalizeScenarioRange(range){
 const fallback=defaultScenarioRange();
 if(!range||!range.start)return fallback;
 let start=String(range.start),mode=range.mode==='end'?'end':'weeks';
 let weeks=Math.max(1,Math.min(52,Number(range.weeks)||1));
 let end=range.end?String(range.end):keyDate(addDays(parseDateKey(start),weeks*7-1));
 if(mode==='weeks')end=keyDate(addDays(parseDateKey(start),weeks*7-1));
 if(parseDateKey(end)<parseDateKey(start))end=start;
 const days=Math.round((parseDateKey(end)-parseDateKey(start))/86400000)+1;
 weeks=Math.max(1,Math.ceil(days/7));
 return {mode,start,end,weeks};
}
function scenarioRangeFromControls(){
 const start=document.getElementById('scenarioStartDate')?.value||keyDate(startOfWeek(anchor()));
 const mode=document.getElementById('scenarioRangeMode')?.value||'weeks';
 const weeks=Math.max(1,Math.min(52,Number(document.getElementById('scenarioWeeks')?.value)||1));
 const endInput=document.getElementById('scenarioEndDate')?.value||start;
 return normalizeScenarioRange({mode,start,weeks,end:endInput});
}
function applyScenarioRangeControls(range){
 const r=normalizeScenarioRange(range);
 const start=document.getElementById('scenarioStartDate'),mode=document.getElementById('scenarioRangeMode'),weeks=document.getElementById('scenarioWeeks'),end=document.getElementById('scenarioEndDate');
 if(start)start.value=r.start;if(mode)mode.value=r.mode;if(weeks)weeks.value=r.weeks;if(end)end.value=r.end;
 updateScenarioRangeControls();
}
function updateScenarioRangeControls(){
 const r=scenarioRangeFromControls();
 const mode=document.getElementById('scenarioRangeMode')?.value||'weeks';
 const ww=document.getElementById('scenarioWeeksWrap'),ew=document.getElementById('scenarioEndWrap');
 if(ww)ww.style.opacity=mode==='weeks'?'1':'.45';
 if(ww)ww.querySelector('input').disabled=mode!=='weeks';
 if(ew)ew.querySelector('input').disabled=mode==='weeks';
 const end=document.getElementById('scenarioEndDate');if(end)end.value=r.end;
 const summary=document.getElementById('scenarioRangeSummary');
 if(summary)summary.textContent=`${new Date(r.start+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})} → ${new Date(r.end+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})} · ${r.weeks} ${r.weeks===1?'semana':'semanas'}`;
 return r;
}
function dateInScenarioRange(date,range){
 const r=normalizeScenarioRange(range),k=keyDate(date);
 return k>=r.start&&k<=r.end;
}
function datesForScenarioRange(range,maxDays=366){
 const r=normalizeScenarioRange(range),out=[],start=parseDateKey(r.start),end=parseDateKey(r.end);
 for(let d=cloneDate(start),i=0;d<=end&&i<maxDays;d=addDays(d,1),i++)out.push(cloneDate(d));
 return out;
}
function scenarioItemsForDate(sc,date,platform='all'){
 if(!sc?.slots)return [];
 if(sc.range&&!dateInScenarioRange(date,sc.range))return [];
 const dow=date.getDay(),scenarioId=sc.id||'preview';
 let items=(sc.slots[dow]||sc.slots[String(dow)]||[]).map(x=>({...x,platforms:[...(x.platforms||[])],date}));
 items=items.filter(x=>!state.hidden[x.masterKey]);
 if(platform!=='all')items=items.filter(x=>(x.platforms||[]).includes(platform)).map(x=>({...x,platforms:[platform]}));
 return withOccurrenceMeta(items,date,scenarioId).sort((a,b)=>(LOT_RANK[a.lot]||9)-(LOT_RANK[b.lot]||9)||(a.order||10)-(b.order||10));
}
function scenarioOccurrenceStats(sc){
 if(!sc)return {total:0,done:0};
 const dates=datesForScenarioRange(sc.range||defaultScenarioRange(),366);
 let total=0,done=0;
 dates.forEach(date=>{
   const items=scenarioItemsForDate(sc,date,'all');
   total+=items.length;done+=items.filter(a=>a.done).length;
 });
 return {total,done};
}

function activateScenario(sc){
 const range=normalizeScenarioRange(sc.range||scenarioRangeFromControls());
 state.activeScenario={id:sc.id||uid('scenario'),name:sc.name||'Emulación',brandId:sc.brandId||appData.activeBrandId,slots:cloneSlots(sc.slots),range,createdAt:sc.createdAt||new Date().toISOString()};
 state.activeScenarioId=state.activeScenario.id;state.emulationMode=true;
 const brand=activeBrand();if(brand)brand.activeScenarioId=state.activeScenario.id;
 plannerDraft=cloneSlots(state.activeScenario.slots);
 state.anchorDate=range.start;
 if(document.getElementById('feedHorizon'))state.feedHorizon='scenario';
 applyScenarioRangeControls(range);
 saveAppData();save();renderAll();renderScenarioPreview();
}
function emulateDraft(){
 const name=document.getElementById('scenarioName').value.trim()||'Prueba editorial';
 activateScenario({id:'draft-'+uid('sc'),name,slots:currentScenarioSlots(),range:scenarioRangeFromControls(),createdAt:new Date().toISOString()});
}
function saveDraftScenario(){
 const name=document.getElementById('scenarioName').value.trim()||`Escenario ${savedScenarios.length+1}`;
 checkpoint('Guardar escenario');
 const sc={id:uid('saved'),name,brandId:appData.activeBrandId,createdAt:new Date().toISOString(),range:scenarioRangeFromControls(),slots:currentScenarioSlots()};
 migrateCompletionScenario(state.activeScenario?.id,sc.id);
 savedScenarios.unshift(sc);saveScenarios();saveAppData();logAction('Guardó emulación',`${name} · ${sc.range.start} → ${sc.range.end}`);activateScenario(sc);renderSavedScenarios();
}
function duplicateScenario(id){
 const s=savedScenarios.find(x=>x.id===id);if(!s)return;
 const copy={id:uid('saved'),name:`${s.name} · copia`,brandId:s.brandId||appData.activeBrandId,createdAt:new Date().toISOString(),range:normalizeScenarioRange(s.range||defaultScenarioRange()),slots:cloneSlots(s.slots)};
 savedScenarios.unshift(copy);saveScenarios();renderSavedScenarios();
}
function deleteScenario(id){
 checkpoint('Eliminar emulación');
 savedScenarios=savedScenarios.filter(x=>x.id!==id);saveScenarios();
 if(appData.completion){Object.keys(appData.completion).filter(k=>k.includes(`|${id}|`)).forEach(k=>delete appData.completion[k]);saveAppData()}
 if(state.activeScenarioId===id){state.activeScenarioId=null;state.activeScenario=null;state.emulationMode=false;state.feedHorizon='week'}
 logAction('Eliminó emulación',id);renderSavedScenarios();renderAll();
}
function exportScenario(sc=state.activeScenario){
 if(!sc){alert('Primero emula o carga un escenario.');return}
 const completion=Object.fromEntries(Object.entries(appData.completion||{}).filter(([k])=>k.includes(`|${sc.id}|`)));
 const blob=new Blob([JSON.stringify({version:'11.0-scenario',scenario:sc,completion},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${String(activeBrand()?.name||'MARCA').replace(/[^a-z0-9]+/gi,'_')}_${String(sc.name||'ESCENARIO').replace(/[^a-z0-9]+/gi,'_')}.json`;a.click();URL.revokeObjectURL(a.href);
}
function renderSavedScenarios(){
 const root=document.getElementById('savedScenarioList');if(!root)return;root.innerHTML='';
 const visible=savedScenarios.filter(sc=>(sc.brandId||'joc')===appData.activeBrandId);
 if(!visible.length){root.innerHTML='<div class="callout">Todavía no hay emulaciones guardadas para esta marca. Arma una semana y usa “Guardar emulación”.</div>';return}
 visible.forEach(sc=>{
   const perWeek=[1,2,3,4,5,6,0].reduce((n,d)=>n+(sc.slots[d]?.length||0),0);
   const r=normalizeScenarioRange(sc.range||defaultScenarioRange());
   const stats=scenarioOccurrenceStats({...sc,range:r});
   const pct=stats.total?Math.round(stats.done/stats.total*100):0;
   const c=document.createElement('article');c.className='saved-card';
   c.innerHTML=`<b>${esc(sc.name)}</b>
     <small>${perWeek} piezas/semana · ${stats.done}/${stats.total} hechas</small>
     <span class="saved-range">${new Date(r.start+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})} → ${new Date(r.end+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})} · ${r.weeks} sem.</span>
     <div class="saved-progress"><i style="width:${pct}%"></i></div>
     <div class="saved-actions"><button data-act="load">Ver / cargar</button><button data-act="dup">Duplicar</button><button data-act="exp">Exportar</button><button data-act="del">Eliminar</button></div>`;
   c.querySelector('[data-act="load"]').addEventListener('click',()=>activateScenario(sc));
   c.querySelector('[data-act="dup"]').addEventListener('click',()=>duplicateScenario(sc.id));
   c.querySelector('[data-act="exp"]').addEventListener('click',()=>exportScenario(sc));
   c.querySelector('[data-act="del"]').addEventListener('click',()=>{if(confirm(`¿Eliminar "${sc.name}"?`))deleteScenario(sc.id)});
   root.appendChild(c);
 });
}
function scenarioPreviewSlots(){return state.activeScenario?.slots||plannerDraft}
function renderScenarioPreview(){
 const root=document.getElementById('scenarioPreviewRoot');if(!root)return;
 const active=state.activeScenario;
 const draftScenario={id:'preview-draft',name:document.getElementById('scenarioName')?.value||'Borrador actual',brandId:appData.activeBrandId,slots:cloneSlots(plannerDraft),range:scenarioRangeFromControls()};
 const sc=active||draftScenario;
 const r=normalizeScenarioRange(sc.range||defaultScenarioRange());
 document.getElementById('scenarioPreviewTitle').textContent=`${sc.name} · ${new Date(r.start+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})} → ${new Date(r.end+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})}`;
 const mode=state.scenarioPreview||'week';
 document.querySelectorAll('[data-scenario-preview]').forEach(b=>b.classList.toggle('active',b.dataset.scenarioPreview===mode));
 root.innerHTML='';

 if(mode==='week'){
   const grid=document.createElement('div');grid.className='scenario-week-preview';
   const dates=datesForScenarioRange(r,7);
   dates.forEach(date=>{
     const day=document.createElement('div');day.className='scenario-preview-day';
     day.innerHTML=`<h4>${DAY_SHORT[date.getDay()]} ${date.getDate()} ${date.toLocaleDateString('es-ES',{month:'short'})}</h4><div class="scenario-preview-list"></div>`;
     const list=day.lastElementChild;
     scenarioItemsForDate(sc,date,'all').forEach(a=>{
       const c=document.createElement('div');c.className='preview-chip'+(a.done?' done':'');c.style.setProperty('--typec',eventColor(a));c.style.setProperty('--lotc',LOT_COLORS[a.lot]||'#888');
       c.innerHTML=`<b>${esc(a.title)}</b>${esc(a.lot)} · ${esc(a.type)}${a.done?' · HECHO':''}`;
       c.addEventListener('click',()=>openDrawer(a));list.appendChild(c);
     });
     grid.appendChild(day);
   });
   root.appendChild(grid);return;
 }

 if(mode==='month'){
   const g=document.createElement('div');g.className='scenario-month-preview';
   ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].forEach(x=>{const h=document.createElement('div');h.className='scenario-month-head';h.textContent=x;g.appendChild(h)});
   const first=startOfWeek(parseDateKey(r.start)),last=parseDateKey(r.end);
   const total=Math.min(84,Math.max(28,Math.ceil(((last-first)/86400000+1)/7)*7));
   for(let i=0;i<total;i++){
     const date=addDays(first,i),inside=dateInScenarioRange(date,r),cell=document.createElement('div');
     cell.className='scenario-month-day'+(inside?'':' scenario-outside');
     cell.innerHTML=`<div class="scenario-month-date">${date.getDate()} ${date.toLocaleDateString('es-ES',{month:'short'})}</div>`;
     if(inside){
       const items=scenarioItemsForDate(sc,date,'all');
       items.slice(0,7).forEach(a=>{const m=document.createElement('div');m.className='month-mini'+(a.done?' done':'');m.style.setProperty('--typec',eventColor(a));m.style.setProperty('--lotc',LOT_COLORS[a.lot]||'#888');m.textContent=`${a.done?'✓ ':''}${a.lot} · ${a.title}`;m.addEventListener('click',()=>openDrawer(a));cell.appendChild(m)});
       if(items.length>7){const more=document.createElement('div');more.className='more';more.textContent=`+${items.length-7} más`;cell.appendChild(more)}
     }
     g.appendChild(cell);
   }
   root.appendChild(g);return;
 }

 const dates=datesForScenarioRange(r,366);
 const counts=Object.fromEntries(Object.keys(PNAME).map(p=>[p,dates.reduce((n,date)=>n+scenarioItemsForDate(sc,date,p).length,0)]));
 const stats=scenarioOccurrenceStats(sc);
 root.innerHTML=`<div class="scenario-feed-jump"><h4>Emulación lista para los feeds</h4><p>La parrilla se repetirá únicamente entre las fechas seleccionadas. Estado de producción: ${stats.done}/${stats.total} contenidos hechos.</p><div class="planner-summary">${Object.entries(counts).map(([p,n])=>`<span class="summary-chip">${PNAME[p]} · ${n}</span>`).join('')}</div><div style="margin-top:12px"><button id="openFeedsFromScenario" class="btn accent">Abrir simuladores de feed</button></div></div>`;
 document.getElementById('openFeedsFromScenario').addEventListener('click',()=>{state.feedHorizon='scenario';save();switchView('feedsView')});
}
function renderScenarioBadge(){
 const b=document.getElementById('activeScenarioBadge');if(!b)return;
 if(state.emulationMode&&state.activeScenario){
   const r=normalizeScenarioRange(state.activeScenario.range||defaultScenarioRange());
   b.hidden=false;b.textContent=`Emulación: ${state.activeScenario.name} · ${r.start} → ${r.end} · clic para salir`;b.title='Volver al calendario automático';
 } else b.hidden=true;
}

function descriptionForTemplate(t){
 const row=INVENTORY.find(x=>x[0]===t.type||x[1]===t.title);
 return t.description||row?.[2]||t.role||'Tipo editorial reutilizable.';
}
function renderBrandSwitcher(){
 const sel=document.getElementById('brandSelect');if(!sel)return;
 const current=appData.activeBrandId;sel.innerHTML='';
 appData.brands.filter(b=>!b.archived).forEach(b=>{const o=document.createElement('option');o.value=b.id;o.textContent=b.name;sel.appendChild(o)});
 sel.value=current;
 const brand=activeBrand();
 if(brand){
   document.getElementById('brandMark').textContent=(brand.initials||brand.name.slice(0,2)).slice(0,2).toUpperCase();
   document.getElementById('brandMark').style.boxShadow=`inset 3px 0 ${brand.color||'#A91616'},inset 0 1px 0 rgba(255,255,255,.18)`;
   document.getElementById('brandTitle').textContent=`${brand.name.toUpperCase()} · EDITORIAL OS V11`;
 }
}
function switchBrand(id){
 if(id===appData.activeBrandId)return;
 checkpoint('Cambiar marca');
 const prev=activeBrand();if(prev)prev.lastDraft=cloneSlots(plannerDraft);
 appData.activeBrandId=id;
 const brand=activeBrand();
 const sc=savedScenarios.find(s=>s.id===brand?.activeScenarioId&&((s.brandId||'joc')===id));
 if(sc){state.activeScenario={...sc,range:normalizeScenarioRange(sc.range||defaultScenarioRange())};state.activeScenarioId=sc.id;state.emulationMode=true;plannerDraft=cloneSlots(sc.slots);applyScenarioRangeControls(state.activeScenario.range)}
 else if(id==='joc'){state.activeScenario=null;state.activeScenarioId=null;state.emulationMode=false;plannerDraft=brand?.lastDraft?cloneSlots(brand.lastDraft):emptyDraft();applyScenarioRangeControls(defaultScenarioRange())}
 else{plannerDraft=brand?.lastDraft?cloneSlots(brand.lastDraft):emptyDraft();const range=defaultScenarioRange();state.activeScenario={id:`brand-empty-${id}`,name:`${brand?.name||'Marca'} · borrador`,brandId:id,slots:cloneSlots(plannerDraft),range};state.activeScenarioId=state.activeScenario.id;state.emulationMode=true;applyScenarioRangeControls(range)}
 logAction('Cambió de marca',brand?.name||id);saveAppData();save();renderAll();
}
function toggleBrandContent(templateId,enabled){
 checkpoint('Cambiar contenido de marca');
 const brand=activeBrand();if(!brand)return;
 const set=new Set(brand.enabledContentIds||[]);
 enabled?set.add(templateId):set.delete(templateId);brand.enabledContentIds=[...set];
 logAction(enabled?'Activó contenido':'Desactivó contenido',templateById(templateId)?.title||templateId);
 saveAppData();renderAll();
}
function renderInventory(){
 const q=(document.getElementById('inventorySearch')?.value||'').toLowerCase().trim();
 const typeF=document.getElementById('inventoryFilter')?.value||'all';
 const famF=document.getElementById('inventoryFamilyFilter')?.value||'all';
 const pillF=document.getElementById('inventoryPillarFilter')?.value||'all';
 const root=document.getElementById('inventoryRoot');if(!root)return;root.innerHTML='';
 const brand=activeBrand(),enabled=new Set(brand?.enabledContentIds||[]);
 const rows=allPlannerTemplates(true).filter(t=>{
   if(typeF!=='all'&&t.type!==typeF)return false;
   if(famF!=='all'&&t.familyId!==famF)return false;
   if(pillF!=='all'&&t.pillarId!==pillF)return false;
   return !q||metaText(t).includes(q);
 });
 const grouped={};rows.forEach(t=>{const fam=familyById(t.familyId)?.name||contentFamily(t);(grouped[fam]||(grouped[fam]=[])).push(t)});
 Object.keys(grouped).sort((a,b)=>FAMILY_ORDER.indexOf(a)-FAMILY_ORDER.indexOf(b)||a.localeCompare(b)).forEach(fam=>{
   const section=document.createElement('section');section.className=`family-group ${familySlug(fam)}`;section.style.gridColumn='1/-1';
   section.innerHTML=`<div class="family-group-head"><b>${esc(fam)}</b><small>${grouped[fam].length} tipos · marca: ${esc(brand?.name||'')}</small></div><div class="inventory family-group-list"></div>`;
   const list=section.lastElementChild;
   grouped[fam].forEach(t=>{
     const c=document.createElement('article');c.className='card glass';c.style.setProperty('--c',COLORS[t.type]||'#555');
     const compat=(t.compatibleFormats||FORMAT_COMPAT[t.type]||[t.surface]).map(x=>`<span>${esc(x)}</span>`).join('');
     const pill=pillarById(t.pillarId)?.name||'';
     c.innerHTML=`<div class="inv-head"><div class="inv-icon">${esc(t.type.split(' ')[0].slice(0,4).toUpperCase())}</div><div><h3>${esc(t.title)}</h3><small>${esc(t.type)} · ${esc(pill)} · ${esc(t.lot)}</small></div></div><p>${esc(descriptionForTemplate(t))}</p><div class="format-compat">${compat}</div><label class="brand-membership"><input type="checkbox" ${enabled.has(t.id)?'checked':''}> Usar en ${esc(brand?.name||'marca')}</label><div class="manager-actions" style="margin-top:7px">${t.custom?`<button data-edit>Editar</button><button data-archive>${t.archived?'Reactivar':'Archivar'}</button>`:''}</div>`;
     c.querySelector('.brand-membership input').addEventListener('change',e=>toggleBrandContent(t.id,e.target.checked));
     c.querySelector('[data-edit]')?.addEventListener('click',()=>editCustomContent(t.id));
     c.querySelector('[data-archive]')?.addEventListener('click',()=>archiveCustomContent(t.id));
     list.appendChild(c);
   });root.appendChild(section);
 });
 if(!rows.length)root.innerHTML='<div class="callout">No hay contenidos que coincidan con los filtros.</div>';
}
function renderLibraryFilters(){
 const type=document.getElementById('inventoryFilter'),fam=document.getElementById('inventoryFamilyFilter'),pill=document.getElementById('inventoryPillarFilter');
 if(type){const v=type.value;type.innerHTML='<option value="all">Todos los tipos</option>';[...new Set(allPlannerTemplates().map(t=>t.type))].sort().forEach(x=>type.add(new Option(x,x)));type.value=[...type.options].some(o=>o.value===v)?v:'all'}
 if(fam){const v=fam.value;fam.innerHTML='<option value="all">Todas las familias</option>';appData.families.filter(x=>!x.archived).forEach(x=>fam.add(new Option(x.name,x.id)));fam.value=[...fam.options].some(o=>o.value===v)?v:'all'}
 if(pill){const v=pill.value;pill.innerHTML='<option value="all">Todos los pilares</option>';appData.pillars.filter(x=>!x.archived).forEach(x=>pill.add(new Option(x.name,x.id)));pill.value=[...pill.options].some(o=>o.value===v)?v:'all'}
 const selectors=['familyPillar','ccPillar'];selectors.forEach(id=>{const el=document.getElementById(id);if(!el)return;const v=el.value;el.innerHTML='';appData.pillars.filter(x=>!x.archived).forEach(x=>el.add(new Option(x.name,x.id)));if([...el.options].some(o=>o.value===v))el.value=v});
 const cf=document.getElementById('ccFamily');if(cf){const v=cf.value;cf.innerHTML='';appData.families.filter(x=>!x.archived).forEach(x=>cf.add(new Option(x.name,x.id)));if([...cf.options].some(o=>o.value===v))cf.value=v}
}
function renderPillars(){
 const root=document.getElementById('pillarList');if(!root)return;root.innerHTML='';
 appData.pillars.forEach(x=>{const item=document.createElement('div');item.className='manager-item'+(x.archived?' archived':'');item.innerHTML=`<div><b>${esc(x.name)}</b><small>${esc(x.description||'')}</small></div><div class="manager-actions"><button data-edit>Editar</button><button data-archive>${x.archived?'Reactivar':'Archivar'}</button></div>`;item.querySelector('[data-edit]').onclick=()=>{const name=prompt('Nombre del pilar',x.name);if(!name)return;checkpoint('Editar pilar');x.name=name;saveAppData();logAction('Editó pilar',name);renderAll()};item.querySelector('[data-archive]').onclick=()=>{checkpoint('Archivar pilar');x.archived=!x.archived;saveAppData();logAction(x.archived?'Archivó pilar':'Reactivó pilar',x.name);renderAll()};root.appendChild(item)});
}
function renderFamilies(){
 const root=document.getElementById('familyList');if(!root)return;root.innerHTML='';
 appData.families.forEach(x=>{const item=document.createElement('div');item.className='manager-item'+(x.archived?' archived':'');item.innerHTML=`<div><b>${esc(x.name)}</b><small>${esc(pillarById(x.pillarId)?.name||'')} · ${esc(x.description||'')}</small></div><div class="manager-actions"><button data-edit>Editar</button><button data-archive>${x.archived?'Reactivar':'Archivar'}</button></div>`;item.querySelector('[data-edit]').onclick=()=>{const name=prompt('Nombre de la familia',x.name);if(!name)return;checkpoint('Editar familia');x.name=name;saveAppData();logAction('Editó familia',name);renderAll()};item.querySelector('[data-archive]').onclick=()=>{checkpoint('Archivar familia');x.archived=!x.archived;saveAppData();logAction(x.archived?'Archivó familia':'Reactivó familia',x.name);renderAll()};root.appendChild(item)});
}
function renderBrands(){
 const root=document.getElementById('brandList');if(!root)return;root.innerHTML='';
 appData.brands.forEach(b=>{const item=document.createElement('div');item.className='manager-item'+(b.archived?' archived':'');item.innerHTML=`<div><b>${esc(b.name)}</b><small>${(b.platforms||[]).map(p=>PNAME[p]).join(' · ')} · ${(b.enabledContentIds||[]).length} tipos activos</small></div><div class="manager-actions"><button data-open>Abrir</button><button data-rename>Renombrar</button>${b.id!=='joc'?`<button data-archive>${b.archived?'Reactivar':'Archivar'}</button>`:''}</div>`;item.querySelector('[data-open]').onclick=()=>switchBrand(b.id);item.querySelector('[data-rename]').onclick=()=>{const name=prompt('Nombre de la marca',b.name);if(!name)return;checkpoint('Renombrar marca');b.name=name;saveAppData();logAction('Renombró marca',name);renderAll()};item.querySelector('[data-archive]')?.addEventListener('click',()=>{checkpoint('Archivar marca');b.archived=!b.archived;if(b.archived&&appData.activeBrandId===b.id)appData.activeBrandId='joc';saveAppData();renderAll()});root.appendChild(item)});
}
function renderHistory(){
 const root=document.getElementById('historyList');if(!root)return;root.innerHTML='';
 const rows=appData.history.filter(h=>!h.brandId||h.brandId===appData.activeBrandId).slice(0,120);
 if(!rows.length){root.innerHTML='<div class="callout">Todavía no hay acciones registradas para esta marca.</div>';return}
 rows.forEach(h=>{const item=document.createElement('div');item.className='history-item';item.innerHTML=`<div><b>${esc(h.action)}</b><small>${esc(h.detail||'')}</small></div><small>${new Date(h.at).toLocaleString('es-ES',{dateStyle:'short',timeStyle:'short'})}</small>`;root.appendChild(item)});
}
function showLibraryTab(tab){
 state.libraryTab=tab;document.querySelectorAll('[data-library-tab]').forEach(b=>b.classList.toggle('active',b.dataset.libraryTab===tab));
 const map={content:'libraryContentPanel',pillars:'libraryPillarsPanel',families:'libraryFamiliesPanel',brands:'libraryBrandsPanel',history:'libraryHistoryPanel',cloud:'libraryCloudPanel'};
 Object.values(map).forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=id!==map[tab]});
 if(tab==='cloud')renderCloudState();
}
function openContentCreator(){
 renderLibraryFilters();document.getElementById('contentCreatorBg').classList.add('open');
}
function createCustomContentFromForm(){
 const title=document.getElementById('ccTitle').value.trim(),type=document.getElementById('ccType').value.trim();if(!title||!type)return;
 checkpoint('Crear contenido');
 const id=uid('custom');
 const t={id,title,type,lot:document.getElementById('ccLot').value,surface:document.getElementById('ccSurface').value,platforms:[...document.querySelectorAll('[name="ccPlatform"]:checked')].map(x=>x.value),compatibleFormats:[...document.querySelectorAll('[name="ccFormat"]:checked')].map(x=>x.value),pillarId:document.getElementById('ccPillar').value,familyId:document.getElementById('ccFamily').value,description:document.getElementById('ccDescription').value.trim(),color:document.getElementById('ccColor').value,role:'Contenido personalizado',custom:true,archived:false};
 appData.customContent.push(t);if(document.getElementById('ccAddToBrand').checked){const b=activeBrand();b.enabledContentIds=[...new Set([...(b.enabledContentIds||[]),id])]}
 saveAppData();logAction('Creó contenido',title);document.getElementById('contentCreatorForm').reset();document.getElementById('contentCreatorBg').classList.remove('open');renderAll();
}
function editCustomContent(id){
 const t=appData.customContent.find(x=>x.id===id);if(!t)return;const title=prompt('Título',t.title);if(!title)return;checkpoint('Editar contenido');t.title=title;const desc=prompt('Descripción',t.description||'');if(desc!==null)t.description=desc;saveAppData();logAction('Editó contenido',title);renderAll();
}
function archiveCustomContent(id){
 const t=appData.customContent.find(x=>x.id===id);if(!t)return;checkpoint('Archivar contenido');t.archived=!t.archived;saveAppData();logAction(t.archived?'Archivó contenido':'Reactivó contenido',t.title);renderAll();
}

let supabaseClient=null,cloudSession=null,cloudChannel=null,cloudTimer=null,cloudApplying=false;
let cloudConfig={url:window.EDITORIAL_SUPABASE?.url||'',key:window.EDITORIAL_SUPABASE?.key||''};
try{cloudConfig={...cloudConfig,...JSON.parse(localStorage.getItem('jocEditorialV9Cloud')||'{}')}}catch(e){}
function setSyncStatus(text,cls='local'){const el=document.getElementById('syncStatus');if(!el)return;el.textContent=text;el.className=`sync-status ${cls}`}
function connectCloudClient(){
 if(!cloudConfig.url||!cloudConfig.key||!window.supabase){supabaseClient=null;return null}
 try{supabaseClient=window.supabase.createClient(cloudConfig.url,cloudConfig.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return supabaseClient}catch(e){console.error(e);supabaseClient=null;return null}
}
function cloudPayload(){return {version:9,state,appData,savedScenarios,plannerDraft}}
function applyCloudPayload(payload){
 if(!payload)return;cloudApplying=true;
 if(payload.state)state={...state,...payload.state};
 if(payload.appData)appData={...appData,...payload.appData};
 if(Array.isArray(payload.savedScenarios))savedScenarios=payload.savedScenarios;
 if(payload.plannerDraft)plannerDraft=cloneSlots(payload.plannerDraft);
 localStorage.setItem('jocEditorialV9',JSON.stringify(state));localStorage.setItem('jocEditorialV9AppData',JSON.stringify(appData));localStorage.setItem('jocEditorialV9Scenarios',JSON.stringify(savedScenarios));
 renderAll();cloudApplying=false;
}
async function refreshCloudSession(){
 if(!supabaseClient)return null;const {data}=await supabaseClient.auth.getSession();cloudSession=data?.session||null;renderCloudState();return cloudSession;
}
async function cloudPush(silent=false){
 if(cloudApplying||!supabaseClient)return;
 const session=cloudSession||await refreshCloudSession();if(!session){if(!silent)alert('Inicia sesión en Supabase primero.');return}
 setSyncStatus('Sincronizando…','syncing');
 const row={user_id:session.user.id,workspace_key:'editorial-os',payload:cloudPayload(),updated_at:new Date().toISOString()};
 const {error}=await supabaseClient.from('editorial_state').upsert(row,{onConflict:'user_id,workspace_key'});
 if(error){console.error(error);setSyncStatus('Error nube','offline');if(!silent)alert(error.message);return}
 setSyncStatus('Sincronizado','synced');
}
async function cloudPull(silent=false){
 if(!supabaseClient)return;const session=cloudSession||await refreshCloudSession();if(!session){if(!silent)alert('Inicia sesión primero.');return}
 setSyncStatus('Bajando…','syncing');const {data,error}=await supabaseClient.from('editorial_state').select('payload,updated_at').eq('user_id',session.user.id).eq('workspace_key','editorial-os').maybeSingle();
 if(error){setSyncStatus('Error nube','offline');if(!silent)alert(error.message);return}
 if(data?.payload)applyCloudPayload(data.payload);setSyncStatus('Sincronizado','synced');
}
function scheduleCloudSync(){
 if(cloudApplying||!supabaseClient||!cloudSession)return;clearTimeout(cloudTimer);cloudTimer=setTimeout(()=>cloudPush(true),1000);
}
async function cloudSignIn(){
 if(!supabaseClient&& !connectCloudClient()){alert('Configura Project URL y publishable/anon key.');return}
 const email=document.getElementById('cloudEmail').value.trim(),password=document.getElementById('cloudPassword').value;const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});if(error){alert(error.message);return}cloudSession=data.session;await subscribeCloud();await cloudPull(true);renderCloudState();
}
async function cloudSignUp(){
 if(!supabaseClient&& !connectCloudClient()){alert('Configura Supabase primero.');return}
 const email=document.getElementById('cloudEmail').value.trim(),password=document.getElementById('cloudPassword').value;const {data,error}=await supabaseClient.auth.signUp({email,password});if(error){alert(error.message);return}cloudSession=data.session||null;alert(data.session?'Cuenta creada y sesión iniciada.':'Cuenta creada. Revisa el email si tu proyecto exige confirmación.');renderCloudState();
}
async function cloudSignOut(){if(supabaseClient)await supabaseClient.auth.signOut();cloudSession=null;if(cloudChannel&&supabaseClient)supabaseClient.removeChannel(cloudChannel);cloudChannel=null;setSyncStatus('Local','local');renderCloudState()}
async function subscribeCloud(){
 if(!supabaseClient||!cloudSession)return;if(cloudChannel)supabaseClient.removeChannel(cloudChannel);
 cloudChannel=supabaseClient.channel(`editorial-${cloudSession.user.id}`).on('postgres_changes',{event:'UPDATE',schema:'public',table:'editorial_state',filter:`user_id=eq.${cloudSession.user.id}`},payload=>{if(payload.new?.payload)applyCloudPayload(payload.new.payload)}).subscribe();
}
function renderCloudState(){
 const acct=document.getElementById('cloudAccountState');if(acct)acct.textContent=cloudSession?`Conectado como ${cloudSession.user.email}`:'No conectado.';
 const q=document.getElementById('cloudQuickContent');if(q)q.innerHTML=`<div class="cloud-state"><div class="status-line"><b>${cloudSession?'Supabase conectado':'Modo local'}</b><br>${cloudSession?esc(cloudSession.user.email):'Los cambios se guardan en este navegador hasta que configures la nube.'}</div><div class="status-line">Marca activa: <b>${esc(activeBrand()?.name||'')}</b></div></div>`;
 if(document.getElementById('supabaseUrl'))document.getElementById('supabaseUrl').value=cloudConfig.url||'';
 if(document.getElementById('supabaseKey'))document.getElementById('supabaseKey').value=cloudConfig.key||'';
}
async function exportCurrentHtml(){
 try{
   const resp=await fetch(location.href,{cache:'no-store'});if(!resp.ok)throw new Error('No se pudo leer la página');
   const html=await resp.text(),blob=new Blob([html],{type:'text/html'}),a=document.createElement('a');
   a.href=URL.createObjectURL(blob);a.download='EDITORIAL_OS_V9_index.html';a.click();URL.revokeObjectURL(a.href);
 }catch(e){alert('Abre la app desde GitHub Pages o un servidor HTTP para exportar el HTML desplegado.')}
}

async function initCloud(){
 if(!cloudConfig.url||!cloudConfig.key){setSyncStatus(navigator.onLine?'Local':'Offline',navigator.onLine?'local':'offline');return}
 connectCloudClient();if(!supabaseClient)return;await refreshCloudSession();if(cloudSession){setSyncStatus('Nube','synced');await subscribeCloud()}else setSyncStatus('Local','local');
}

let drawerAsset=null;
function openDrawer(a){
 drawerAsset=a;
 const hasDate=!!a.date;
 const done=hasDate?isAssetDone(a,a.date):false;
 drawerAsset.done=done;
 document.getElementById('drawerKicker').textContent=`${a.type} · ${lotLabel(a)}`;
 document.getElementById('drawerTitle').textContent=a.title;
 document.getElementById('drawerDesc').textContent=a.role||'';
 document.getElementById('drawerPlatforms').innerHTML=platformIconRow(a.platforms)+' '+(a.platforms||[]).map(p=>PNAME[p]).join(' · ');
 const priority=a.lotByPlatform?Object.entries(a.lotByPlatform).map(([p,l])=>`${PNAME[p]}: ${l}${a.surfaceByPlatform&&a.surfaceByPlatform[p]?` · ${a.surfaceByPlatform[p]}`:''}`).join(' | '):`${a.lot} · ${a.surface||'Feed'}`;
 document.getElementById('drawerPriority').textContent=priority;
 document.getElementById('drawerNote').textContent=a.note||a.description||'';
 document.getElementById('drawerProductionStatus').textContent=hasDate?(done?'Hecho':'Pendiente'):'Sin fecha todavía';
 document.getElementById('drawerProductionDate').textContent=hasDate?new Date(a.date).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'Emula o abre el contenido desde calendario/feed para llevar este registro.';
 const doneBtn=document.getElementById('doneBtn');doneBtn.disabled=!hasDate;doneBtn.classList.toggle('is-done',done);doneBtn.textContent=done?'↶ Marcar pendiente':'✓ Marcar hecho';
 const fixed=a.lot==='L1';
 document.getElementById('movePrev').disabled=fixed;document.getElementById('moveNext').disabled=fixed;document.getElementById('restoreMoveBtn').disabled=fixed||state.moves[a.masterKey]===undefined;
 document.getElementById('tentativeBtn').textContent=state.tentative[a.masterKey]?'Quitar tentativo':'Tentativo';
 document.getElementById('hideBtn').disabled=fixed;
 document.getElementById('drawerBg').classList.add('open');
}
function shiftDrawerAsset(delta){
 if(!drawerAsset||drawerAsset.lot==='L1')return;
 let current=state.moves[drawerAsset.masterKey];
 if(current===undefined){
   for(let dow=0;dow<7;dow++){
     const d=sameWeekDate(anchor(),dow);
     if(fullPlanAssets(d,'all').some(a=>a.masterKey===drawerAsset.masterKey)){current=dow;break}
   }
 }
 if(current===undefined)return;
 state.moves[drawerAsset.masterKey]=(Number(current)+delta+7)%7;save();document.getElementById('drawerBg').classList.remove('open');renderAll();
}

function homeWeekData(){
 const days=Array.from({length:7},(_,i)=>addDays(startOfWeek(anchor()),i));
 const master=days.flatMap(d=>assetsForDate(d,'all'));
 const dedup=[...new Map(master.map(a=>[a.masterKey||`${a.title}-${a.date||''}`,a])).values()];
 const publications=days.reduce((sum,d)=>sum+['instagram','facebook','tiktok','youtube','linkedin'].reduce((n,p)=>n+assetsForDate(d,p).length,0),0);
 return {days,master,dedup,publications};
}
function homeFormatLabel(a){
 const b=formatBucket(a,'all');
 return b==='Reel/Short'?'Reel / Short':b;
}
function renderHome(){
 const root=document.getElementById('homeView');if(!root)return;
 const brand=activeBrand(),data=homeWeekData(),today=todayLocal(),todayKey=keyDate(today);
 const coverage=coverageData(),score=Math.round(coverage.filter(x=>x.ok).length/Math.max(coverage.length,1)*100);
 const weekStart=data.days[0],weekEnd=data.days[6];

 document.getElementById('homeGreeting').textContent=`Esta es la semana de ${brand?.name||'la marca'}.`;
 document.getElementById('homeWeekCopy').textContent=`${weekStart.toLocaleDateString('es-ES',{day:'numeric',month:'short'})} — ${weekEnd.toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})} · ${state.emulationMode&&state.activeScenario?`Emulación: ${state.activeScenario.name}`:'Plan editorial activo'}.`;
 document.getElementById('homeOrbitCore').textContent=(brand?.initials||brand?.name?.slice(0,2)||'J').slice(0,2).toUpperCase();
 document.getElementById('homeCoverageText').textContent=`${score}%`;
 document.getElementById('homeCoverageRing').style.background=`conic-gradient(var(--home-lime) ${score*3.6}deg,#383a3f 0)`;

 document.getElementById('homeMasterCount').textContent=data.dedup.length;
 document.getElementById('homePublicationCount').textContent=data.publications;
 document.getElementById('homeReelCount').textContent=data.master.filter(a=>['Reel/Short','Video'].includes(formatBucket(a,'all'))).length;
 document.getElementById('homeScenarioCount').textContent=savedScenarios.filter(s=>(s.brandId||'joc')===appData.activeBrandId).length;
 document.getElementById('homeDoneCount').textContent=`${data.master.filter(a=>a.done).length}/${data.master.length}`;

 document.getElementById('homeBrandTitle').textContent=brand?.name||'Marca';
 document.getElementById('homeBrandPlatforms').textContent=`${brand?.platforms?.length||0} redes`;
 document.getElementById('homeBrandCopy').textContent=`${(brand?.enabledContentIds||[]).length} tipos activos · ${appData.pillars.filter(x=>!x.archived).length} pilares disponibles.`;

 const syncPill=document.getElementById('homeSyncPill'),syncTitle=document.getElementById('homeSyncTitle'),syncCopy=document.getElementById('homeSyncCopy');
 if(!navigator.onLine){syncPill.textContent='Offline';syncTitle.textContent='Trabajo sin conexión';syncCopy.textContent='Los cambios permanecen locales hasta recuperar internet.'}
 else if(cloudSession){syncPill.textContent='Sincronizado';syncTitle.textContent='Supabase conectado';syncCopy.textContent=`${cloudSession.user.email} · Mac y iPhone pueden compartir estado.`}
 else{syncPill.textContent='Local';syncTitle.textContent='Trabajo local';syncCopy.textContent='Conecta Supabase para mantener Mac y iPhone alineados.'}

 const strip=document.getElementById('homeDayStrip');strip.innerHTML='';
 data.days.forEach(d=>{
   const count=assetsForDate(d,'all').length,btn=document.createElement('button');
   btn.className='home-day'+(keyDate(d)===todayKey?' today':'')+(keyDate(d)===state.anchorDate?' selected':'');
   btn.innerHTML=`<span>${DAY_SHORT[d.getDay()]}</span><b>${d.getDate()}</b><small>${count} ${count===1?'pieza':'piezas'}</small>`;
   btn.addEventListener('click',()=>{state.anchorDate=keyDate(d);save();switchView('calendarView');renderCalendar()});
   strip.appendChild(btn);
 });

 // Today/next queue.
 let queue=[];
 const todayIndex=data.days.findIndex(d=>keyDate(d)===todayKey);
 const startIndex=todayIndex>=0?todayIndex:0;
 for(let i=startIndex;i<data.days.length&&queue.length<5;i++){
   assetsForDate(data.days[i],'all').forEach(a=>{if(queue.length<5)queue.push({...a,_homeDate:data.days[i]})});
 }
 if(!queue.length)data.days.forEach(d=>assetsForDate(d,'all').slice(0,1).forEach(a=>queue.push({...a,_homeDate:d})));
 const qroot=document.getElementById('homeNextList');qroot.innerHTML='';
 queue.slice(0,5).forEach(a=>{
   const row=document.createElement('div');row.className='home-next-item';row.style.setProperty('--item-color',eventColor(a));row.style.setProperty('--lot-color',LOT_COLORS[a.lot]||'#777');
   row.innerHTML=`<span class="home-next-swatch"></span><div><b>${a.done?'✓ ':''}${esc(a.title)}</b><small>${DAY_NAMES[a._homeDate.getDay()]} · ${esc(contentFamily(a))} · ${esc(homeFormatLabel(a))}${a.done?' · HECHO':''}</small></div><span class="production-check ${a.done?'done':''}">✓</span>`;
   row.addEventListener('click',()=>openDrawer({...a,date:a._homeDate}));qroot.appendChild(row);
 });
 if(!qroot.children.length)qroot.innerHTML='<div class="callout">No hay contenido en la semana activa.</div>';

 // Families.
 const famCounts={};data.dedup.forEach(a=>{const f=contentFamily(a);famCounts[f]=(famCounts[f]||0)+1});
 const famColors={'Podcast':'#c9a52d','Memes':'#e57a1f','Webinar':'#8b1e3f','Reacciones':'#6d4cc2','Testimonios':'#3f8f58','Carruseles':'#2f69b3','LinkedIn L2':'#7c3aed','Filosofando':'#5b2b53','Lifestyle / Voiceover':'#3d8392','YouTube':'#e12626'};
 const froot=document.getElementById('homeFamilyMix');froot.innerHTML='';
 Object.entries(famCounts).sort((a,b)=>b[1]-a[1]).slice(0,6).forEach(([name,n])=>{
   const c=document.createElement('div');c.className='home-family-card';c.style.setProperty('--family-color',famColors[name]||'#777');c.innerHTML=`<b>${n}</b><span>${esc(name)}</span>`;froot.appendChild(c);
 });
 if(!froot.children.length)froot.innerHTML='<div class="callout">Añade contenidos para ver el mix.</div>';

 // Platforms.
 const proot=document.getElementById('homePlatformGrid');proot.innerHTML='';
 const pdefs=[['instagram','ig','Instagram'],['facebook','fb','Facebook'],['tiktok','tt','TikTok'],['youtube','yt','YouTube'],['linkedin','li','LinkedIn']];
 pdefs.filter(([p])=>(brand?.platforms||[]).includes(p)).forEach(([p,cls,label])=>{
   const count=data.days.reduce((n,d)=>n+assetsForDate(d,p).length,0),c=document.createElement('div');c.className=`home-platform-card ${cls}`;c.innerHTML=`<small>${label}</small><b>${count}</b><small>publicaciones / semana</small>`;c.addEventListener('click',()=>{state.feedPlatform=p;save();switchView('feedsView');renderFeed()});proot.appendChild(c);
 });

 // Lots.
 const lotCounts={L1:0,L2:0,L3:0,EVENT:0};data.dedup.forEach(a=>lotCounts[a.lot]=(lotCounts[a.lot]||0)+1);
 const maxLot=Math.max(1,...Object.values(lotCounts)),lroot=document.getElementById('homeLotFlow');lroot.innerHTML='';
 [['L1','#ff3b30'],['L2','#0a84ff'],['L3','#30b86a'],['EVENT','#ff9f0a']].forEach(([lot,color])=>{
   const n=lotCounts[lot]||0,row=document.createElement('div');row.className='home-flow-row';row.innerHTML=`<b>${lot==='EVENT'?'EVT':lot}</b><div class="home-flow-track"><div class="home-flow-fill" style="--flow-color:${color};width:${Math.round(n/maxLot*100)}%"></div></div><strong>${n}</strong>`;lroot.appendChild(row);
 });
 document.getElementById('homeFlowTotal').textContent=`${data.dedup.length} piezas`;

 // Scenarios.
 const sroot=document.getElementById('homeScenarioList');sroot.innerHTML='';
 const scenarios=savedScenarios.filter(s=>(s.brandId||'joc')===appData.activeBrandId).slice(0,4);
 scenarios.forEach(sc=>{
   const r=normalizeScenarioRange(sc.range||defaultScenarioRange()),stats=scenarioOccurrenceStats({...sc,range:r}),row=document.createElement('div');row.className='home-scenario-item';
   row.innerHTML=`<div><b>${esc(sc.name)}</b><small>${stats.done}/${stats.total} hechas · ${new Date(r.start+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})} → ${new Date(r.end+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</small></div><button>Ver</button>`;
   row.querySelector('button').addEventListener('click',()=>{activateScenario(sc);switchView('emulatorView')});sroot.appendChild(row);
 });
 if(!sroot.children.length)sroot.innerHTML='<div class="callout">Aún no hay escenarios guardados para esta marca.</div>';

 // Activity.
 const aroot=document.getElementById('homeActivityList');aroot.innerHTML='';
 appData.history.filter(h=>!h.brandId||h.brandId===appData.activeBrandId).slice(0,5).forEach(h=>{
   const row=document.createElement('div');row.className='home-activity-item';row.innerHTML=`<div><b>${esc(h.action)}</b><small>${esc(h.detail||'')}</small></div><time>${new Date(h.at).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</time>`;aroot.appendChild(row);
 });
 if(!aroot.children.length)aroot.innerHTML='<div class="callout">Las próximas acciones aparecerán aquí.</div>';
}

function saveLocalOnly(){try{localStorage.setItem('jocEditorialV9',JSON.stringify(state))}catch(e){}}
function activeView(){return document.querySelector('.view.active')?.id||'homeView'}
function renderShared(){renderBrandSwitcher();renderScenarioBadge();syncControls();updateUndoButtons();renderCloudState()}
function renderActiveView(id=activeView()){
 clearV12DerivedCache();
 if(id==='homeView'){renderHome();return}
 if(id==='calendarView'){renderCalendar();renderStats();renderCoverage();return}
 if(id==='lanesView'){renderLanes();return}
 if(id==='emulatorView'){renderPlanner();renderScenarioPreview();renderSavedScenarios();return}
 if(id==='agendaView'){renderAgenda();return}
 if(id==='feedsView'){renderFeed();return}
 if(id==='inventoryView'){renderLibraryFilters();renderInventory();renderPillars();renderFamilies();renderBrands();renderHistory();showLibraryTab(state.libraryTab||'content');return}
}
let renderQueued=false;
function renderAll(){
 if(renderQueued)return;
 renderQueued=true;
 requestAnimationFrame(()=>{renderQueued=false;renderShared();renderActiveView()});
}

function syncControls(){
 document.documentElement.dataset.theme=state.theme;
 document.getElementById('glassRoot').dataset.theme=state.theme;
 document.getElementById('themeBtn').textContent=state.theme==='dark'?'Modo claro':'Modo oscuro';
 document.querySelectorAll('.platformbtn[data-p]').forEach(b=>b.classList.toggle('active',b.dataset.p===state.platform));
 document.querySelectorAll('.segbtn[data-volume]').forEach(b=>b.classList.toggle('active',b.dataset.volume===state.volume));
 document.getElementById('eventWeek').checked=state.eventWeek;
 document.getElementById('l2Mix').value=state.l2Mix;
 document.getElementById('ytMode').value=state.ytMode;
 document.getElementById('liMode').value=state.liMode;
 document.getElementById('mainSource').value=state.mainSource;
 document.getElementById('weekBtn').classList.toggle('active',state.calendarMode==='week');
 document.getElementById('monthBtn').classList.toggle('active',state.calendarMode==='month');
 document.getElementById('lanePlatform').value=state.lanePlatform;
 document.getElementById('agendaPlatform').value=state.agendaPlatform;
 document.getElementById('feedHorizon').value=state.feedHorizon;
 document.getElementById('memeExecution').value=state.execution?.meme||'mixed';
 document.getElementById('tipExecution').value=state.execution?.tip||'static';
 document.getElementById('pressureExecution').value=state.execution?.pressure||'static';
 document.getElementById('famousExecution').value=state.execution?.famous||'static';
 document.querySelectorAll('[data-feed-view]').forEach(b=>b.classList.toggle('active',b.dataset.feedView===state.feedView));
 document.querySelectorAll('[data-feed-device]').forEach(b=>b.classList.toggle('active',b.dataset.feedDevice===state.feedDevice));
 document.querySelectorAll('.platformbtn[data-feed]').forEach(b=>b.classList.toggle('active',b.dataset.feed===state.feedPlatform));
 document.querySelectorAll('[data-scenario-preview]').forEach(b=>b.classList.toggle('active',b.dataset.scenarioPreview===state.scenarioPreview));
 renderScenarioBadge();
}
function goto(delta){
 const d=anchor();
 if(state.calendarMode==='week')state.anchorDate=keyDate(addDays(d,delta*7));
 else{const x=cloneDate(d);x.setMonth(x.getMonth()+delta);state.anchorDate=keyDate(x)}
 renderAll();
}
function switchView(id){
 document.querySelectorAll('.navbtn,.dockbtn').forEach(x=>x.classList.toggle('active',x.dataset.view===id));
 document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
 renderShared();renderActiveView(id);
 const scroller=document.getElementById('appScroller');if(scroller)scroller.scrollTo({top:0,behavior:'auto'});
}

/* Navigation and calendar controls */
document.querySelectorAll('.navbtn').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
document.querySelectorAll('.dockbtn').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
document.querySelectorAll('[data-home-go]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.homeGo)));
document.getElementById('homeCloudShortcut').addEventListener('click',()=>{renderCloudState();document.getElementById('cloudQuickBg').classList.add('open')});
document.getElementById('homeNewContentBtn').addEventListener('click',openContentCreator);
document.getElementById('homeHistoryShortcut').addEventListener('click',()=>{switchView('inventoryView');showLibraryTab('history')});

document.querySelectorAll('.platformbtn[data-p]').forEach(b=>b.addEventListener('click',()=>{state.platform=b.dataset.p;renderAll()}));
document.querySelectorAll('.segbtn[data-volume]').forEach(b=>b.addEventListener('click',()=>{checkpoint('Cambiar volumen');state.volume=b.dataset.volume;renderAll()}));
document.querySelectorAll('.platformbtn[data-feed]').forEach(b=>b.addEventListener('click',()=>{state.feedPlatform=b.dataset.feed;renderAll()}));
document.getElementById('eventWeek').addEventListener('change',e=>{checkpoint('Semana con evento');state.eventWeek=e.target.checked;renderAll()});
document.getElementById('l2Mix').addEventListener('change',e=>{checkpoint('Cambiar mix L2');state.l2Mix=e.target.value;renderAll()});
document.getElementById('ytMode').addEventListener('change',e=>{state.ytMode=e.target.value;renderAll()});
document.getElementById('liMode').addEventListener('change',e=>{state.liMode=e.target.value;renderAll()});
document.getElementById('mainSource').addEventListener('change',e=>{state.mainSource=e.target.value;renderAll()});
document.getElementById('lanePlatform').addEventListener('change',e=>{state.lanePlatform=e.target.value;renderLanes();save()});
document.getElementById('agendaPlatform').addEventListener('change',e=>{state.agendaPlatform=e.target.value;renderAgenda();save()});
document.querySelectorAll('[data-feed-view]').forEach(b=>b.addEventListener('click',()=>{state.feedView=b.dataset.feedView;renderFeed();syncControls();save()}));
document.querySelectorAll('[data-feed-device]').forEach(b=>b.addEventListener('click',()=>{state.feedDevice=b.dataset.feedDevice;renderFeed();syncControls();save()}));
document.getElementById('memeExecution').addEventListener('change',e=>{state.execution={...(state.execution||{}),meme:e.target.value};renderFeed();save()});
document.getElementById('tipExecution').addEventListener('change',e=>{state.execution={...(state.execution||{}),tip:e.target.value};renderFeed();save()});
document.getElementById('pressureExecution').addEventListener('change',e=>{state.execution={...(state.execution||{}),pressure:e.target.value};renderFeed();save()});
document.getElementById('famousExecution').addEventListener('change',e=>{state.execution={...(state.execution||{}),famous:e.target.value};renderFeed();save()});
document.getElementById('resetExecutionBtn').addEventListener('click',()=>{state.execution={meme:'mixed',tip:'static',pressure:'static',famous:'static'};renderFeed();syncControls();save()});
document.getElementById('feedHorizon').addEventListener('change',e=>{state.feedHorizon=e.target.value;v12FeedExpanded=false;renderFeed();save()});
document.getElementById('themeBtn').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';renderAll()});
document.getElementById('prevBtn').addEventListener('click',()=>goto(-1));
document.getElementById('nextBtn').addEventListener('click',()=>goto(1));
document.getElementById('todayBtn').addEventListener('click',()=>{state.anchorDate=keyDate(todayLocal());renderAll()});
document.getElementById('weekBtn').addEventListener('click',()=>{state.calendarMode='week';renderAll()});
document.getElementById('monthBtn').addEventListener('click',()=>{state.calendarMode='month';renderAll()});

/* Emulator / kanban */
document.getElementById('scenarioRangeMode').addEventListener('change',()=>{updateScenarioRangeControls();renderScenarioPreview()});
document.getElementById('scenarioStartDate').addEventListener('change',()=>{updateScenarioRangeControls();renderScenarioPreview()});
document.getElementById('scenarioWeeks').addEventListener('input',()=>{updateScenarioRangeControls();renderScenarioPreview()});
document.getElementById('scenarioEndDate').addEventListener('change',()=>{updateScenarioRangeControls();renderScenarioPreview()});
document.getElementById('scenarioTodayBtn').addEventListener('click',()=>{document.getElementById('scenarioStartDate').value=keyDate(todayLocal());updateScenarioRangeControls();renderScenarioPreview()});
document.getElementById('plannerFilter').addEventListener('change',renderPlannerPool);
document.getElementById('plannerSearch').addEventListener('input',renderPlannerPool);
document.getElementById('plannerNewContentBtn').addEventListener('click',openContentCreator);
document.getElementById('loadL1Btn').addEventListener('click',()=>{checkpoint('Cargar L1');loadL1Draft();logAction('Cargó preset','L1 fijo')});
document.getElementById('loadCurrentBtn').addEventListener('click',()=>{checkpoint('Cargar calendario');loadCurrentDraft();logAction('Cargó calendario activo','al emulador')});
document.getElementById('clearDraftBtn').addEventListener('click',()=>{checkpoint('Vaciar emulador');plannerDraft=emptyDraft();logAction('Vació emulador');renderPlanner();renderScenarioPreview()});
document.getElementById('emulateBtn').addEventListener('click',emulateDraft);
document.getElementById('saveScenarioBtn').addEventListener('click',saveDraftScenario);
document.getElementById('exportScenarioBtn').addEventListener('click',()=>exportScenario());
document.querySelectorAll('[data-scenario-preview]').forEach(b=>b.addEventListener('click',()=>{state.scenarioPreview=b.dataset.scenarioPreview;save();renderScenarioPreview()}));
document.getElementById('activeScenarioBadge').addEventListener('click',()=>{state.emulationMode=false;state.activeScenarioId=null;state.activeScenario=null;state.feedHorizon='week';const b=activeBrand();if(b)b.activeScenarioId=null;applyScenarioRangeControls(defaultScenarioRange());saveAppData();save();renderAll()});

/* Multi-brand */
document.getElementById('brandSelect').addEventListener('change',e=>switchBrand(e.target.value));
document.getElementById('newBrandBtn').addEventListener('click',()=>{switchView('inventoryView');showLibraryTab('brands');document.getElementById('brandName').focus()});
document.getElementById('brandForm').addEventListener('submit',e=>{
 e.preventDefault();const name=document.getElementById('brandName').value.trim();if(!name)return;
 checkpoint('Crear marca');const id=uid('brand'),initials=(document.getElementById('brandInitials').value.trim()||name.slice(0,2)).toUpperCase();
 const platforms=[...document.querySelectorAll('[name="brandPlatform"]:checked')].map(x=>x.value);
 appData.brands.push({id,name,initials,color:document.getElementById('brandColor').value,platforms,enabledContentIds:[],archived:false,lastDraft:emptyDraft()});
 appData.activeBrandId=id;saveAppData();logAction('Creó marca',name);e.target.reset();const range=defaultScenarioRange();state.emulationMode=true;state.activeScenario={id:`brand-empty-${id}`,name:`${name} · borrador`,brandId:id,slots:emptyDraft(),range};plannerDraft=emptyDraft();applyScenarioRangeControls(range);renderAll();
});
document.querySelectorAll('[data-library-tab]').forEach(b=>b.addEventListener('click',()=>{showLibraryTab(b.dataset.libraryTab);saveLocalOnly()}));

/* Library manager */
document.getElementById('inventorySearch').addEventListener('input',renderInventory);
document.getElementById('inventoryFilter').addEventListener('change',renderInventory);
document.getElementById('inventoryFamilyFilter').addEventListener('change',renderInventory);
document.getElementById('inventoryPillarFilter').addEventListener('change',renderInventory);
document.getElementById('openContentCreatorBtn').addEventListener('click',openContentCreator);
document.getElementById('contentCreatorClose').addEventListener('click',()=>document.getElementById('contentCreatorBg').classList.remove('open'));
document.getElementById('contentCreatorBg').addEventListener('click',e=>{if(e.target.id==='contentCreatorBg')e.currentTarget.classList.remove('open')});
document.getElementById('contentCreatorForm').addEventListener('submit',e=>{e.preventDefault();createCustomContentFromForm()});
document.getElementById('pillarForm').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('pillarName').value.trim();if(!name)return;checkpoint('Crear pilar');appData.pillars.push({id:uid('pillar'),name,description:document.getElementById('pillarDescription').value.trim(),archived:false});saveAppData();logAction('Creó pilar',name);e.target.reset();renderAll()});
document.getElementById('familyForm').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('familyName').value.trim();if(!name)return;checkpoint('Crear familia');appData.families.push({id:uid('family'),name,pillarId:document.getElementById('familyPillar').value,description:document.getElementById('familyDescription').value.trim(),archived:false});saveAppData();logAction('Creó familia',name);e.target.reset();renderAll()});
document.getElementById('clearHistoryBtn').addEventListener('click',()=>{if(!confirm('¿Limpiar el historial local de la marca activa?'))return;checkpoint('Limpiar historial');appData.history=appData.history.filter(h=>h.brandId!==appData.activeBrandId);saveAppData();renderHistory()});

/* Undo / redo */
document.getElementById('undoBtn').addEventListener('click',undo);document.getElementById('redoBtn').addEventListener('click',redo);
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}});
window.addEventListener('online',()=>{setSyncStatus(cloudSession?'Nube':'Local',cloudSession?'synced':'local');if(cloudSession)cloudPush(true)});
window.addEventListener('offline',()=>setSyncStatus('Offline','offline'));

/* Content drawer */
document.getElementById('drawerClose').addEventListener('click',()=>document.getElementById('drawerBg').classList.remove('open'));
document.getElementById('drawerBg').addEventListener('click',e=>{if(e.target.id==='drawerBg')e.currentTarget.classList.remove('open')});
document.getElementById('doneBtn').addEventListener('click',()=>{
 if(!drawerAsset?.date)return;
 checkpoint('Estado de producción');
 const done=!isAssetDone(drawerAsset,drawerAsset.date);
 setAssetDone(drawerAsset,drawerAsset.date,done);
 drawerAsset.done=done;
 renderAll();
 openDrawer(drawerAsset);
});
document.getElementById('movePrev').addEventListener('click',()=>shiftDrawerAsset(-1));
document.getElementById('moveNext').addEventListener('click',()=>shiftDrawerAsset(1));
document.getElementById('restoreMoveBtn').addEventListener('click',()=>{if(!drawerAsset)return;checkpoint('Restaurar día');delete state.moves[drawerAsset.masterKey];save();document.getElementById('drawerBg').classList.remove('open');renderAll()});
document.getElementById('tentativeBtn').addEventListener('click',()=>{if(!drawerAsset)return;checkpoint('Tentativo');state.tentative[drawerAsset.masterKey]=!state.tentative[drawerAsset.masterKey];save();document.getElementById('drawerBg').classList.remove('open');renderAll()});
document.getElementById('hideBtn').addEventListener('click',()=>{if(!drawerAsset||drawerAsset.lot==='L1')return;checkpoint('Ocultar');state.hidden[drawerAsset.masterKey]=true;save();document.getElementById('drawerBg').classList.remove('open');renderAll()});

/* Cloud */
document.getElementById('cloudBtn').addEventListener('click',()=>{renderCloudState();document.getElementById('cloudQuickBg').classList.add('open')});
document.getElementById('cloudQuickClose').addEventListener('click',()=>document.getElementById('cloudQuickBg').classList.remove('open'));
document.getElementById('cloudQuickBg').addEventListener('click',e=>{if(e.target.id==='cloudQuickBg')e.currentTarget.classList.remove('open')});
document.getElementById('openCloudSettingsBtn').addEventListener('click',()=>{document.getElementById('cloudQuickBg').classList.remove('open');switchView('inventoryView');showLibraryTab('cloud')});
document.getElementById('exportCurrentHtmlBtn').addEventListener('click',exportCurrentHtml);
document.getElementById('cloudConfigForm').addEventListener('submit',async e=>{e.preventDefault();cloudConfig={url:document.getElementById('supabaseUrl').value.trim(),key:document.getElementById('supabaseKey').value.trim()};localStorage.setItem('jocEditorialV9Cloud',JSON.stringify(cloudConfig));connectCloudClient();await refreshCloudSession();renderCloudState();alert('Configuración guardada.')});
document.getElementById('cloudSignInBtn').addEventListener('click',cloudSignIn);
document.getElementById('cloudSignUpBtn').addEventListener('click',cloudSignUp);
document.getElementById('cloudSignOutBtn').addEventListener('click',cloudSignOut);
document.getElementById('cloudPushBtn').addEventListener('click',()=>cloudPush(false));
document.getElementById('cloudPullBtn').addEventListener('click',()=>cloudPull(false));

/* Export / import */
document.getElementById('exportBtn').addEventListener('click',()=>{
 const days=Array.from({length:7},(_,i)=>addDays(startOfWeek(anchor()),i));
 const payload={version:'11.0',exportedAt:new Date().toISOString(),state,appData,savedScenarios,plannerDraft,week:days.map(d=>({date:keyDate(d),assets:assetsForDate(d,'all')})),notes:{memeCadence:'Lun L1 Presión vs Foco · Mar L3 Tip · Mié L2 meme rotativo · Vie L2 meme rotativo · Dom L1 Famoso + frase',facebook:'Replica Instagram por defecto',stories:'No incluidas en los conteos'}};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`EDITORIAL_OS_${String(activeBrand()?.name||'MARCA').replace(/[^a-z0-9]+/gi,'_')}_V9.json`;a.click();URL.revokeObjectURL(a.href);
});
document.getElementById('importBtn').addEventListener('click',()=>document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data||typeof data!=='object')throw new Error('JSON inválido');checkpoint('Importar');if(data.state)state={...state,...data.state};if(data.appData)appData={...appData,...data.appData};if(Array.isArray(data.savedScenarios))savedScenarios=data.savedScenarios;if(data.plannerDraft)plannerDraft=cloneSlots(data.plannerDraft);localStorage.setItem('jocEditorialV9',JSON.stringify(state));localStorage.setItem('jocEditorialV9AppData',JSON.stringify(appData));localStorage.setItem('jocEditorialV9Scenarios',JSON.stringify(savedScenarios));renderAll()}catch(err){alert('No se pudo importar: '+err.message)}e.target.value=''});

/* Reset */
document.getElementById('resetBtn').addEventListener('click',()=>{if(!confirm('¿Restablecer V9? Se borrarán marcas, biblioteca personalizada, escenarios e historial local. La configuración de Supabase se conserva.'))return;['jocEditorialV9','jocEditorialV9AppData','jocEditorialV9Scenarios'].forEach(k=>localStorage.removeItem(k));location.reload()});

function syncViewportHeight(){
 const h=Math.round(window.visualViewport?.height||window.innerHeight||document.documentElement.clientHeight);
 document.documentElement.style.setProperty('--app-height',`${h}px`);
}
let viewportRaf=0;
function queueViewportSync(){if(viewportRaf)return;viewportRaf=requestAnimationFrame(()=>{viewportRaf=0;syncViewportHeight()})}
syncViewportHeight();
window.visualViewport?.addEventListener('resize',queueViewportSync,{passive:true});
window.addEventListener('resize',queueViewportSync,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(()=>{syncViewportHeight();renderActiveView()},120),{passive:true});

/* Start */
renderLegend();
renderLibraryFilters();
applyScenarioRangeControls(state.activeScenario?.range||defaultScenarioRange());
if(state.activeScenario?.slots){state.activeScenario.range=normalizeScenarioRange(state.activeScenario.range||defaultScenarioRange());plannerDraft=cloneSlots(state.activeScenario.slots)}
else if(activeBrand()?.lastDraft){plannerDraft=cloneSlots(activeBrand().lastDraft)}
else if(activeBrand()?.id==='joc'){loadCurrentDraft()}
else{plannerDraft=emptyDraft();enabledTemplates().filter(t=>t.fixed&&t.defaultDow!==undefined).forEach(t=>plannerDraft[t.defaultDow].push(cloneTemplate(t,t.defaultDow,{masterKey:`scenario-fixed-${t.id}`})))}
if(activeBrand()?.id!=='joc'&&!state.activeScenario){
 const range=defaultScenarioRange();state.activeScenario={id:`brand-empty-${activeBrand()?.id}`,name:`${activeBrand()?.name||'Marca'} · borrador`,brandId:activeBrand()?.id,slots:cloneSlots(plannerDraft),range};
 state.activeScenarioId=state.activeScenario.id;state.emulationMode=true;applyScenarioRangeControls(range);
}
renderAll();switchView('homeView');initCloud();
window.EDITORIAL_OS_VERSION='12';
window.EDITORIAL_OS_DIAGNOSTICS={clearDerivedCache:clearV12DerivedCache};
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.info('SW no registrado',err)));
})();
