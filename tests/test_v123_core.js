const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;
function load(name){vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..','js',name),'utf8'),{filename:name})}
load('v123-data.js');load('v123-sync.js');
const assert=(cond,msg)=>{if(!cond)throw new Error(msg)};
const valid={state:{theme:'light'},appData:{brands:[],pillars:[],families:[],customContent:[],history:[],completion:{}},savedScenarios:[],plannerDraft:{1:[],2:[],3:[],4:[],5:[],6:[],0:[]}};
let r=EDITORIAL_DATA.validateBackup(valid);assert(r.ok,'valid backup rejected');
r=EDITORIAL_DATA.validateBackup({...valid,plannerDraft:{1:'bad'}});assert(!r.ok,'invalid slots accepted');
const migrated=EDITORIAL_DATA.migrateBackup(valid);assert(migrated.productVersion==='12.5','migration productVersion');assert(migrated.appData.production&&typeof migrated.appData.production==='object','production migration');
assert(EDITORIAL_SYNC_CORE.nextRevision(2,5,3)===6,'nextRevision');
assert(EDITORIAL_SYNC_CORE.shouldConflict({dirty:true,baseRevision:4,remoteRevision:5,remoteDeviceId:'b',deviceId:'a'})===true,'conflict expected');
assert(EDITORIAL_SYNC_CORE.shouldConflict({dirty:true,baseRevision:4,remoteRevision:5,remoteDeviceId:'a',deviceId:'a'})===false,'same-device false conflict');
console.log('V12.5 core compatibility tests: OK');
