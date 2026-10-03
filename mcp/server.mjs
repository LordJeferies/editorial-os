#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createClient } from '@supabase/supabase-js';
import * as z from 'zod/v4';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const VERSION='1.0.0';
const WORKSPACE_DEFAULT='editorial-os';
const TABLE='editorial_state';
const DOWS=[1,2,3,4,5,6,0];
const DAY_NAMES={1:'Lunes',2:'Martes',3:'Miércoles',4:'Jueves',5:'Viernes',6:'Sábado',0:'Domingo'};
const PRODUCTION_STATUSES=['planned','production','editing','review','changes','approved','scheduled','published'];

function loadDotEnv(file=path.join(__dirname,'.env')){
  if(!fs.existsSync(file))return;
  for(const raw of fs.readFileSync(file,'utf8').split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith('#'))continue;
    const i=line.indexOf('=');
    if(i<1)continue;
    const key=line.slice(0,i).trim();
    let value=line.slice(i+1).trim();
    if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
    if(!(key in process.env))process.env[key]=value.replace(/\\n/g,'\n');
  }
}
loadDotEnv();

const env={
  url:process.env.EDITORIAL_SUPABASE_URL||'',
  key:process.env.EDITORIAL_SUPABASE_ANON_KEY||process.env.EDITORIAL_SUPABASE_KEY||'',
  email:process.env.EDITORIAL_SUPABASE_EMAIL||'',
  password:process.env.EDITORIAL_SUPABASE_PASSWORD||'',
  workspace:process.env.EDITORIAL_WORKSPACE_KEY||WORKSPACE_DEFAULT,
  readOnly:/^(1|true|yes)$/i.test(process.env.EDITORIAL_MCP_READ_ONLY||'false')
};

const clone=v=>JSON.parse(JSON.stringify(v));
const now=()=>new Date().toISOString();
const uid=(prefix='mcp')=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
const textResult=value=>({content:[{type:'text',text:typeof value==='string'?value:JSON.stringify(value,null,2)}],...(value&&typeof value==='object'&&!Array.isArray(value)?{structuredContent:value}:{})});
const errorResult=(message,details)=>({content:[{type:'text',text:JSON.stringify({ok:false,error:String(message),...(details?{details}:{})},null,2)}],isError:true});
const mustWrite=()=>{if(env.readOnly)throw new Error('EDITORIAL_MCP_READ_ONLY está activo. Esta operación modifica datos.');};

function blankPlanner(){return {1:[],2:[],3:[],4:[],5:[],6:[],0:[]};}
function normalizePlanner(input){const out=blankPlanner();for(const d of DOWS)out[d]=Array.isArray(input?.[d])?clone(input[d]):[];return out;}
function normalizePayload(input={}){
  const base=(input&&typeof input==='object'&&!Array.isArray(input))?clone(input):{};
  const app=(base.appData&&typeof base.appData==='object'&&!Array.isArray(base.appData))?base.appData:{};
  return {
    ...base,
    version:Number(base.version||9),
    state:(base.state&&typeof base.state==='object'&&!Array.isArray(base.state))?base.state:{},
    appData:{
      ...app,
      brands:Array.isArray(app.brands)?app.brands:[],
      pillars:Array.isArray(app.pillars)?app.pillars:[],
      families:Array.isArray(app.families)?app.families:[],
      customContent:Array.isArray(app.customContent)?app.customContent:[],
      history:Array.isArray(app.history)?app.history:[],
      completion:(app.completion&&typeof app.completion==='object')?app.completion:{},
      production:(app.production&&typeof app.production==='object')?app.production:{},
      contentNotes:(app.contentNotes&&typeof app.contentNotes==='object')?app.contentNotes:{}
    },
    savedScenarios:Array.isArray(base.savedScenarios)?base.savedScenarios:[],
    plannerDraft:normalizePlanner(base.plannerDraft),
    syncMeta:(base.syncMeta&&typeof base.syncMeta==='object')?base.syncMeta:{}
  };
}

let client=null;
let signedIn=false;
async function supabase(){
  if(client&&signedIn)return client;
  if(!env.url||!env.key)throw new Error('Falta EDITORIAL_SUPABASE_URL o EDITORIAL_SUPABASE_ANON_KEY en mcp/.env.');
  if(!env.email||!env.password)throw new Error('Falta EDITORIAL_SUPABASE_EMAIL o EDITORIAL_SUPABASE_PASSWORD en mcp/.env.');
  client=createClient(env.url,env.key,{auth:{persistSession:false,autoRefreshToken:true,detectSessionInUrl:false}});
  const {data,error}=await client.auth.signInWithPassword({email:env.email,password:env.password});
  if(error)throw new Error(`No se pudo iniciar sesión en Supabase: ${error.message}`);
  if(!data?.session)throw new Error('Supabase no devolvió una sesión.');
  signedIn=true;
  return client;
}
async function readRow(){
  const c=await supabase();
  const {data:{user},error:userError}=await c.auth.getUser();
  if(userError||!user)throw new Error(userError?.message||'No hay usuario autenticado.');
  const {data,error}=await c.from(TABLE).select('payload,updated_at').eq('user_id',user.id).eq('workspace_key',env.workspace).maybeSingle();
  if(error)throw new Error(`Error leyendo ${TABLE}: ${error.message}`);
  return {user,payload:normalizePayload(data?.payload||{}),updatedAt:data?.updated_at||null,exists:!!data};
}
function addHistory(payload,action,detail=''){
  const app=payload.appData;
  app.history.unshift({id:uid('hist'),at:now(),brandId:app.activeBrandId||'joc',action,detail,source:'mcp'});
  app.history=app.history.slice(0,300);
}
function nextRevision(payload){const meta=payload.syncMeta||{};return Math.max(Number(meta.revision||0),Number(meta.baseRevision||0))+1;}
async function writePayload(payload,{action='MCP actualizó estado',detail='',expectedRevision}={}){
  mustWrite();
  const c=await supabase();
  const {data:{user},error:userError}=await c.auth.getUser();
  if(userError||!user)throw new Error(userError?.message||'No hay usuario autenticado.');
  const latest=await readRow();
  const currentRevision=Number(latest.payload.syncMeta?.revision||0);
  if(expectedRevision!==undefined&&Number(expectedRevision)!==currentRevision)throw new Error(`Conflicto de revisión: esperado ${expectedRevision}, remoto ${currentRevision}. Vuelve a leer antes de escribir.`);
  const out=normalizePayload(payload);
  addHistory(out,action,detail);
  const revision=Math.max(nextRevision(latest.payload),nextRevision(out));
  out.syncMeta={...(out.syncMeta||{}),revision,baseRevision:revision,deviceId:`mcp-${process.pid}`,productVersion:'12.15-mcp',updatedAt:now()};
  const row={user_id:user.id,workspace_key:env.workspace,payload:out,updated_at:now()};
  const {error}=await c.from(TABLE).upsert(row,{onConflict:'user_id,workspace_key'});
  if(error)throw new Error(`Error guardando ${TABLE}: ${error.message}`);
  return {payload:out,revision,userId:user.id};
}
async function mutate(mutator,meta={}){
  const row=await readRow();const draft=clone(row.payload);const result=await mutator(draft,row);const written=await writePayload(draft,meta);return {result,revision:written.revision,payload:written.payload};
}
function allPlannerItems(payload){const out=[];for(const dow of DOWS)for(const item of payload.plannerDraft[dow]||[])out.push({dow,...item});return out;}
function findPlanner(payload,instanceId){for(const dow of DOWS){const index=(payload.plannerDraft[dow]||[]).findIndex(x=>x.instanceId===instanceId);if(index>=0)return {dow,index,item:payload.plannerDraft[dow][index]};}return null;}
function noteKey(payload,identity,brandId){return `${brandId||payload.appData.activeBrandId||'joc'}|${identity}`;}
function productionKey(payload,{identity,date,scenarioId='auto-plan',brandId}){return `${brandId||payload.appData.activeBrandId||'joc'}|${scenarioId}|${date}|${identity}`;}
function findCustom(payload,id){return payload.appData.customContent.find(x=>x.id===id||x.templateId===id)||null;}
function plannerSummary(payload){const days={};let total=0;for(const d of DOWS){const items=payload.plannerDraft[d]||[];total+=items.length;days[d]={day:DAY_NAMES[d],count:items.length,items:items.map(x=>({instanceId:x.instanceId,title:x.title,type:x.type,lot:x.lot,platforms:x.platforms||[],fixed:!!x.fixed}))};}return {total,days};}

function buildServer(){
  const server=new McpServer({name:'editorial-os',version:VERSION});

  server.registerTool('editorial_status',{title:'Editorial OS status',description:'Comprueba conexión, usuario, workspace, revisión y resumen del plan.'},async()=>{
    try{const row=await readRow();return textResult({ok:true,workspace:env.workspace,user:row.user.email,updatedAt:row.updatedAt,revision:Number(row.payload.syncMeta?.revision||0),readOnly:env.readOnly,planner:plannerSummary(row.payload),brands:row.payload.appData.brands.length,scenarios:row.payload.savedScenarios.length,customContent:row.payload.appData.customContent.length});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('editorial_get_state',{title:'Leer estado editorial',description:'Lee el estado completo o una sección sin modificarla.',inputSchema:z.object({section:z.enum(['all','state','appData','plannerDraft','savedScenarios','syncMeta']).default('all')})},async({section})=>{
    try{const {payload}=await readRow();return textResult(section==='all'?payload:{section,value:payload[section]});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('editorial_search',{title:'Buscar en Editorial OS',description:'Busca en contenido personalizado, plan actual, escenarios y marcas.',inputSchema:z.object({query:z.string().min(1),limit:z.number().int().min(1).max(100).default(30)})},async({query,limit})=>{
    try{const {payload}=await readRow();const q=query.toLowerCase();const results=[];for(const x of payload.appData.customContent)if(JSON.stringify(x).toLowerCase().includes(q))results.push({kind:'content',id:x.id,title:x.title||x.type||x.id,item:x});for(const x of allPlannerItems(payload))if(JSON.stringify(x).toLowerCase().includes(q))results.push({kind:'planner',id:x.instanceId,title:x.title,dow:x.dow,item:x});for(const x of payload.savedScenarios)if(JSON.stringify(x).toLowerCase().includes(q))results.push({kind:'scenario',id:x.id,title:x.name||x.id,item:x});for(const x of payload.appData.brands)if(JSON.stringify(x).toLowerCase().includes(q))results.push({kind:'brand',id:x.id,title:x.name||x.id,item:x});return textResult({query,count:Math.min(results.length,limit),results:results.slice(0,limit)});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('planner_list_week',{title:'Ver plan semanal',description:'Lista los siete días, sus fichas, IDs y cantidades.'},async()=>{try{const {payload}=await readRow();return textResult(plannerSummary(payload));}catch(e){return errorResult(e.message);}});

  server.registerTool('planner_add_content',{title:'Añadir contenido al plan',description:'Añade una ficha al día indicado. Puede partir de un customContent o de datos explícitos.',inputSchema:z.object({dow:z.number().int().min(0).max(6),contentId:z.string().optional(),title:z.string().min(1).optional(),type:z.string().optional(),lot:z.enum(['L1','L2','L3','EVENT']).default('L2'),surface:z.string().default('Feed'),platforms:z.array(z.string()).default([]),familyId:z.string().nullable().optional(),pillarId:z.string().nullable().optional(),note:z.string().default(''),fixed:z.boolean().default(false),expectedRevision:z.number().int().nonnegative().optional()}).refine(v=>!!v.contentId||!!v.title,{message:'Debes enviar contentId o title.'})},async(args)=>{
    try{const {result,revision}=await mutate(payload=>{const base=args.contentId?findCustom(payload,args.contentId):null;if(args.contentId&&!base)throw new Error(`No existe customContent ${args.contentId}.`);const item={...(base?clone(base):{}),instanceId:uid('plan'),templateId:base?.id||args.contentId||null,masterKey:`mcp-${uid('master')}`,title:args.title||base?.title||base?.name||'Contenido',type:args.type||base?.type||'JOC original',lot:args.lot||base?.lot||'L2',lotRank:{L1:1,L2:2,L3:3,EVENT:4}[args.lot||base?.lot]||2,order:10,role:base?.role||'',note:args.note||base?.note||'',surface:args.surface||base?.surface||'Feed',platforms:args.platforms?.length?args.platforms:[...(base?.platforms||[])],fixed:args.fixed,dow:args.dow,familyId:args.familyId??base?.familyId??null,pillarId:args.pillarId??base?.pillarId??null,manualOverride:true,source:'mcp'};payload.plannerDraft[args.dow].push(item);return item;},{action:'MCP agregó contenido',detail:`${args.title||args.contentId} → ${DAY_NAMES[args.dow]}`,expectedRevision:args.expectedRevision});return textResult({ok:true,revision,item:result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('planner_move_content',{title:'Mover contenido',description:'Mueve una ficha entre días o cambia su posición.',inputSchema:z.object({instanceId:z.string().min(1),toDow:z.number().int().min(0).max(6),toIndex:z.number().int().min(0).optional(),expectedRevision:z.number().int().nonnegative().optional()})},async({instanceId,toDow,toIndex,expectedRevision})=>{
    try{const {result,revision}=await mutate(payload=>{const found=findPlanner(payload,instanceId);if(!found)throw new Error(`No existe ${instanceId}.`);payload.plannerDraft[found.dow].splice(found.index,1);const moved={...found.item,dow:toDow,fixed:false,manualOverride:true,source:'mcp'};const dest=payload.plannerDraft[toDow];const i=toIndex===undefined?dest.length:Math.min(toIndex,dest.length);dest.splice(i,0,moved);return {fromDow:found.dow,toDow,index:i,item:moved};},{action:'MCP movió contenido',detail:`${instanceId} → ${DAY_NAMES[toDow]}`,expectedRevision});return textResult({ok:true,revision,...result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('planner_remove_content',{title:'Quitar contenido',description:'Quita una ficha del plan. Las fichas fixed requieren force=true.',inputSchema:z.object({instanceId:z.string().min(1),force:z.boolean().default(false),expectedRevision:z.number().int().nonnegative().optional()})},async({instanceId,force,expectedRevision})=>{
    try{const {result,revision}=await mutate(payload=>{const found=findPlanner(payload,instanceId);if(!found)throw new Error(`No existe ${instanceId}.`);if(found.item.fixed&&!force)throw new Error('La ficha es fixed. Usa force=true sólo si realmente quieres quitarla.');payload.plannerDraft[found.dow].splice(found.index,1);return found.item;},{action:'MCP quitó contenido',detail:instanceId,expectedRevision});return textResult({ok:true,revision,removed:result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('planner_clear_week',{title:'Vaciar plan',description:'Vacía la semana. Por seguridad conserva fixed salvo keepFixed=false.',inputSchema:z.object({keepFixed:z.boolean().default(true),confirm:z.literal(true),expectedRevision:z.number().int().nonnegative().optional()})},async({keepFixed,expectedRevision})=>{
    try{const {result,revision}=await mutate(payload=>{let removed=0;for(const d of DOWS){const before=payload.plannerDraft[d];const after=keepFixed?before.filter(x=>x.fixed):[];removed+=before.length-after.length;payload.plannerDraft[d]=after;}return {removed,keptFixed:keepFixed};},{action:'MCP vació plan',detail:`keepFixed=${keepFixed}`,expectedRevision});return textResult({ok:true,revision,...result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('content_list',{title:'Listar biblioteca personalizada',description:'Lista appData.customContent.'},async()=>{try{const {payload}=await readRow();return textResult({count:payload.appData.customContent.length,items:payload.appData.customContent});}catch(e){return errorResult(e.message);}});

  server.registerTool('content_create',{title:'Crear contenido',description:'Crea una ficha reutilizable en la biblioteca personalizada.',inputSchema:z.object({title:z.string().min(1),type:z.string().default('JOC original'),platforms:z.array(z.string()).default([]),lot:z.enum(['L1','L2','L3','EVENT']).default('L2'),surface:z.string().default('Feed'),familyId:z.string().nullable().optional(),pillarId:z.string().nullable().optional(),role:z.string().default(''),note:z.string().default(''),expectedRevision:z.number().int().nonnegative().optional()})},async(args)=>{
    try{const {result,revision}=await mutate(payload=>{const item={id:uid('content'),title:args.title,type:args.type,platforms:args.platforms,lot:args.lot,surface:args.surface,familyId:args.familyId??null,pillarId:args.pillarId??null,role:args.role,note:args.note,createdAt:now(),updatedAt:now(),source:'mcp'};payload.appData.customContent.unshift(item);return item;},{action:'MCP creó contenido',detail:args.title,expectedRevision:args.expectedRevision});return textResult({ok:true,revision,item:result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('content_update',{title:'Editar contenido',description:'Edita campos de una ficha personalizada sin reemplazar campos desconocidos.',inputSchema:z.object({id:z.string().min(1),title:z.string().min(1).optional(),type:z.string().optional(),platforms:z.array(z.string()).optional(),lot:z.enum(['L1','L2','L3','EVENT']).optional(),surface:z.string().optional(),familyId:z.string().nullable().optional(),pillarId:z.string().nullable().optional(),role:z.string().optional(),note:z.string().optional(),expectedRevision:z.number().int().nonnegative().optional()})},async(args)=>{
    try{const {result,revision}=await mutate(payload=>{const i=payload.appData.customContent.findIndex(x=>x.id===args.id);if(i<0)throw new Error(`No existe ${args.id}.`);const patch={};for(const k of ['title','type','platforms','lot','surface','familyId','pillarId','role','note'])if(args[k]!==undefined)patch[k]=args[k];payload.appData.customContent[i]={...payload.appData.customContent[i],...patch,updatedAt:now(),source:'mcp'};return payload.appData.customContent[i];},{action:'MCP editó contenido',detail:args.id,expectedRevision:args.expectedRevision});return textResult({ok:true,revision,item:result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('content_delete',{title:'Eliminar contenido personalizado',description:'Elimina una ficha customContent. Si está usada en el plan requiere force=true.',inputSchema:z.object({id:z.string().min(1),force:z.boolean().default(false),expectedRevision:z.number().int().nonnegative().optional()})},async({id,force,expectedRevision})=>{
    try{const {result,revision}=await mutate(payload=>{const i=payload.appData.customContent.findIndex(x=>x.id===id);if(i<0)throw new Error(`No existe ${id}.`);const refs=allPlannerItems(payload).filter(x=>x.templateId===id);if(refs.length&&!force)throw new Error(`El contenido está usado ${refs.length} veces en el plan. Usa force=true si procede.`);const [removed]=payload.appData.customContent.splice(i,1);return {removed,plannerReferences:refs.length};},{action:'MCP eliminó contenido',detail:id,expectedRevision});return textResult({ok:true,revision,...result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('content_add_note',{title:'Añadir nota',description:'Añade una corrección/observación a un contenido usando el mismo almacén de notas de Editorial OS.',inputSchema:z.object({identity:z.string().min(1),text:z.string().min(1).max(2000),author:z.string().default('MCP'),brandId:z.string().optional(),expectedRevision:z.number().int().nonnegative().optional()})},async({identity,text,author,brandId,expectedRevision})=>{
    try{const {result,revision}=await mutate(payload=>{const key=noteKey(payload,identity,brandId);const list=Array.isArray(payload.appData.contentNotes[key])?payload.appData.contentNotes[key]:[];const note={id:uid('note'),text,author,createdAt:now(),source:'mcp'};list.push(note);payload.appData.contentNotes[key]=list;return {key,note,count:list.length};},{action:'MCP agregó nota',detail:identity,expectedRevision});return textResult({ok:true,revision,...result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('content_list_notes',{title:'Listar notas',description:'Lista notas por identidad de contenido.',inputSchema:z.object({identity:z.string().min(1),brandId:z.string().optional()})},async({identity,brandId})=>{try{const {payload}=await readRow();const key=noteKey(payload,identity,brandId);return textResult({key,notes:payload.appData.contentNotes[key]||[]});}catch(e){return errorResult(e.message);}});

  server.registerTool('production_get',{title:'Leer estado de producción',description:'Lee el registro de producción por identity + fecha + escenario.',inputSchema:z.object({identity:z.string().min(1),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),scenarioId:z.string().default('auto-plan'),brandId:z.string().optional()})},async(args)=>{try{const {payload}=await readRow();const key=productionKey(payload,args);return textResult({key,record:payload.appData.production[key]||{status:'planned',assignee:'',publishTime:'',notes:'',checklist:{}}});}catch(e){return errorResult(e.message);}});

  server.registerTool('production_set',{title:'Actualizar producción',description:'Cambia estado, responsable, hora, notas o checklist de una pieza.',inputSchema:z.object({identity:z.string().min(1),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),scenarioId:z.string().default('auto-plan'),brandId:z.string().optional(),status:z.enum(PRODUCTION_STATUSES).optional(),assignee:z.string().optional(),publishTime:z.string().optional(),notes:z.string().optional(),checklist:z.record(z.string(),z.boolean()).optional(),expectedRevision:z.number().int().nonnegative().optional()})},async(args)=>{
    try{const {result,revision}=await mutate(payload=>{const key=productionKey(payload,args),prev=payload.appData.production[key]||{status:'planned',assignee:'',publishTime:'',notes:'',checklist:{}};const patch={};for(const k of ['status','assignee','publishTime','notes'])if(args[k]!==undefined)patch[k]=args[k];const record={...prev,...patch,checklist:{...(prev.checklist||{}),...(args.checklist||{})},updatedAt:now(),source:'mcp'};payload.appData.production[key]=record;if(record.status==='published')payload.appData.completion[key]={done:true,at:now(),source:'mcp'};return {key,record};},{action:'MCP actualizó producción',detail:`${args.identity} ${args.status||''}`.trim(),expectedRevision:args.expectedRevision});return textResult({ok:true,revision,...result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('scenario_list',{title:'Listar escenarios',description:'Lista escenarios guardados.'},async()=>{try{const {payload}=await readRow();return textResult({count:payload.savedScenarios.length,scenarios:payload.savedScenarios.map(x=>({id:x.id,name:x.name,brandId:x.brandId,range:x.range,items:DOWS.reduce((n,d)=>n+(x.slots?.[d]?.length||0),0)}))});}catch(e){return errorResult(e.message);}});

  server.registerTool('scenario_save_current',{title:'Guardar escenario actual',description:'Guarda el plannerDraft actual como escenario reutilizable.',inputSchema:z.object({name:z.string().min(1),expectedRevision:z.number().int().nonnegative().optional()})},async({name,expectedRevision})=>{
    try{const {result,revision}=await mutate(payload=>{const scenario={id:uid('scenario'),name,brandId:payload.appData.activeBrandId||'joc',slots:normalizePlanner(payload.plannerDraft),createdAt:now(),updatedAt:now(),source:'mcp'};payload.savedScenarios.unshift(scenario);return scenario;},{action:'MCP guardó escenario',detail:name,expectedRevision});return textResult({ok:true,revision,scenario:result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('scenario_apply',{title:'Aplicar escenario',description:'Reemplaza el plannerDraft con las slots del escenario seleccionado.',inputSchema:z.object({id:z.string().min(1),confirm:z.literal(true),expectedRevision:z.number().int().nonnegative().optional()})},async({id,expectedRevision})=>{
    try{const {result,revision}=await mutate(payload=>{const s=payload.savedScenarios.find(x=>x.id===id);if(!s)throw new Error(`No existe escenario ${id}.`);payload.plannerDraft=normalizePlanner(s.slots);payload.state={...payload.state,activeScenarioId:s.id,activeScenario:clone(s),emulationMode:true};return s;},{action:'MCP aplicó escenario',detail:id,expectedRevision});return textResult({ok:true,revision,scenario:{id:result.id,name:result.name}});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('brand_list',{title:'Listar marcas',description:'Lista marcas y la marca activa.'},async()=>{try{const {payload}=await readRow();return textResult({activeBrandId:payload.appData.activeBrandId||null,brands:payload.appData.brands});}catch(e){return errorResult(e.message);}});

  server.registerTool('brand_create',{title:'Crear marca',description:'Crea una nueva marca sin borrar las existentes.',inputSchema:z.object({name:z.string().min(1),initials:z.string().max(4).optional(),color:z.string().default('#555555'),platforms:z.array(z.string()).default(['instagram','linkedin']),expectedRevision:z.number().int().nonnegative().optional()})},async({name,initials,color,platforms,expectedRevision})=>{
    try{const {result,revision}=await mutate(payload=>{const brand={id:uid('brand'),name,initials:initials||name.slice(0,2).toUpperCase(),color,platforms,enabledContentIds:[],archived:false,createdAt:now(),source:'mcp'};payload.appData.brands.push(brand);return brand;},{action:'MCP creó marca',detail:name,expectedRevision});return textResult({ok:true,revision,brand:result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('brand_update',{title:'Editar marca',description:'Actualiza campos básicos de una marca.',inputSchema:z.object({id:z.string().min(1),name:z.string().min(1).optional(),initials:z.string().max(4).optional(),color:z.string().optional(),platforms:z.array(z.string()).optional(),archived:z.boolean().optional(),expectedRevision:z.number().int().nonnegative().optional()})},async(args)=>{
    try{const {result,revision}=await mutate(payload=>{const i=payload.appData.brands.findIndex(x=>x.id===args.id);if(i<0)throw new Error(`No existe marca ${args.id}.`);const patch={};for(const k of ['name','initials','color','platforms','archived'])if(args[k]!==undefined)patch[k]=args[k];payload.appData.brands[i]={...payload.appData.brands[i],...patch,updatedAt:now(),source:'mcp'};return payload.appData.brands[i];},{action:'MCP editó marca',detail:args.id,expectedRevision:args.expectedRevision});return textResult({ok:true,revision,brand:result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('brand_set_active',{title:'Cambiar marca activa',description:'Selecciona la marca activa del workspace.',inputSchema:z.object({id:z.string().min(1),expectedRevision:z.number().int().nonnegative().optional()})},async({id,expectedRevision})=>{
    try{const {result,revision}=await mutate(payload=>{const brand=payload.appData.brands.find(x=>x.id===id);if(!brand)throw new Error(`No existe marca ${id}.`);payload.appData.activeBrandId=id;return brand;},{action:'MCP cambió marca activa',detail:id,expectedRevision});return textResult({ok:true,revision,brand:result});}catch(e){return errorResult(e.message);}
  });

  server.registerTool('history_recent',{title:'Historial reciente',description:'Lee las últimas acciones registradas en appData.history.',inputSchema:z.object({limit:z.number().int().min(1).max(100).default(30)})},async({limit})=>{try{const {payload}=await readRow();return textResult({items:payload.appData.history.slice(0,limit)});}catch(e){return errorResult(e.message);}});

  server.registerTool('editorial_backup',{title:'Exportar backup lógico',description:'Devuelve el payload completo para respaldo. No incluye contraseñas.'},async()=>{try{const row=await readRow();return textResult({exportedAt:now(),workspace:env.workspace,user:row.user.email,payload:row.payload});}catch(e){return errorResult(e.message);}});

  server.registerResource('editorial-state','editorial://state',{title:'Editorial OS state',description:'Estado compartido completo de Editorial OS',mimeType:'application/json'},async uri=>{const row=await readRow();return {contents:[{uri:uri.href,mimeType:'application/json',text:JSON.stringify(row.payload,null,2)}]};});
  server.registerResource('editorial-planner','editorial://planner',{title:'Editorial OS planner',description:'Plan semanal actual',mimeType:'application/json'},async uri=>{const row=await readRow();return {contents:[{uri:uri.href,mimeType:'application/json',text:JSON.stringify(plannerSummary(row.payload),null,2)}]};});
  server.registerResource('editorial-criteria','editorial://criteria',{title:'Editorial OS MCP criteria',description:'Criterios operativos para usar las herramientas con seguridad',mimeType:'text/markdown'},async uri=>({contents:[{uri:uri.href,mimeType:'text/markdown',text:`# Criterios MCP Editorial OS\n\n- Leer antes de escribir cuando la operación dependa del estado actual.\n- Preferir expectedRevision en secuencias críticas.\n- Preservar campos desconocidos del payload.\n- No eliminar fichas fixed salvo instrucción explícita.\n- No vaciar una semana sin confirmación explícita.\n- Mantener workspace ${env.workspace}.\n- Las notas se agregan; no reemplazar notas anteriores sin motivo.\n- Los estados de producción válidos son: ${PRODUCTION_STATUSES.join(', ')}.\n- El MCP usa Supabase como fuente compartida. La PWA debe estar conectada a la misma cuenta para recibir cambios en tiempo real.\n- Nunca exponer service_role, database passwords ni tokens privados en la web pública.`}]}));

  server.registerPrompt('plan-week',{title:'Planificar una semana',description:'Guía al modelo para construir una semana con cambios pequeños, verificables y reversibles.',argsSchema:z.object({objective:z.string(),constraints:z.string().optional()})},({objective,constraints})=>({messages:[{role:'user',content:{type:'text',text:`Planifica la semana de Editorial OS para este objetivo: ${objective}\nRestricciones: ${constraints||'ninguna adicional'}\n\nPrimero usa editorial_status y planner_list_week. Luego busca o crea contenido. Añade/mueve fichas sin borrar anchors fixed. Al final vuelve a listar la semana y resume los cambios.`}}]}));
  server.registerPrompt('review-week',{title:'Revisar plan semanal',description:'Audita densidad, distribución y pendientes sin modificar nada inicialmente.',argsSchema:z.object({focus:z.string().default('equilibrio, claridad y producción')})},({focus})=>({messages:[{role:'user',content:{type:'text',text:`Revisa el plan semanal de Editorial OS con foco en ${focus}. Empieza sólo leyendo editorial_status, planner_list_week y production_get cuando haga falta. No modifiques nada hasta presentar hallazgos concretos y recibir una instrucción de cambio.`}}]}));
  server.registerPrompt('triage-corrections',{title:'Triage de correcciones',description:'Revisa notas y estados de cambios para organizar prioridades.',argsSchema:z.object({priorityRule:z.string().default('bloqueos primero, luego publicación más cercana')})},({priorityRule})=>({messages:[{role:'user',content:{type:'text',text:`Haz triage de correcciones de Editorial OS. Regla de prioridad: ${priorityRule}. Usa editorial_search, content_list_notes, production_get e history_recent. No borres notas. Devuelve qué requiere acción y qué puede esperar.`}}]}));

  return server;
}

if(process.argv.includes('--self-test')){
  const missing=['EDITORIAL_SUPABASE_URL','EDITORIAL_SUPABASE_ANON_KEY','EDITORIAL_SUPABASE_EMAIL','EDITORIAL_SUPABASE_PASSWORD'].filter(k=>k==='EDITORIAL_SUPABASE_URL'?!env.url:k==='EDITORIAL_SUPABASE_ANON_KEY'?!env.key:k==='EDITORIAL_SUPABASE_EMAIL'?!env.email:!env.password);
  console.log(JSON.stringify({ok:missing.length===0,version:VERSION,workspace:env.workspace,readOnly:env.readOnly,node:process.version,missing},null,2));
  process.exit(missing.length?2:0);
}

serveStdio(()=>buildServer());
