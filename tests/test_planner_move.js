const fs=require('fs'),vm=require('vm'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','js','app-core.js'),'utf8');
const start=src.indexOf('function movePlanInstance('),end=src.indexOf('function dropIndexForList(',start);
if(start<0||end<0)throw new Error('No pude extraer movePlanInstance');
const fn=src.slice(start,end);
global.plannerDraft={1:[{instanceId:'a',title:'A',fixed:true,dow:1},{instanceId:'b',title:'B',fixed:false,dow:1}],2:[],3:[],4:[{instanceId:'c',title:'C',fixed:false,dow:4}],5:[],6:[],0:[]};
global.DAY_NAMES=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
global.checkpoint=()=>{};global.logAction=()=>{};global.renderPlanner=()=>{};
vm.runInThisContext(fn);
function assert(c,m){if(!c)throw new Error(m)}
assert(movePlanInstance('a',4,1)===true,'fixed item should be movable in emulator');
assert(plannerDraft[1].map(x=>x.instanceId).join(',')==='b','source day cleanup');
assert(plannerDraft[4].map(x=>x.instanceId).join(',')==='c,a','cross-day insert order');
assert(plannerDraft[4][1].fixed===false&&plannerDraft[4][1].manualOverride===true,'manual override conversion');
assert(movePlanInstance('a',4,0)===true,'same-day reorder');
assert(plannerDraft[4].map(x=>x.instanceId).join(',')==='a,c','same-day order');
console.log('V12.3 planner move tests: OK');
