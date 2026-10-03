/* Editorial OS V12.5 · schema validation + non-destructive migrations */
(() => {
  'use strict';
  const PRODUCT_VERSION='12.5';
  const LEGACY_SCHEMA_VERSION=9;
  const DOWS=['0','1','2','3','4','5','6'];
  const isObj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const clone=v=>JSON.parse(JSON.stringify(v));

  function validateSlots(slots,path='plannerDraft'){
    const errors=[];
    if(!isObj(slots)){errors.push(`${path} debe ser un objeto`);return errors}
    DOWS.forEach(k=>{if(slots[k]!==undefined&&!Array.isArray(slots[k]))errors.push(`${path}.${k} debe ser un array`)});
    return errors;
  }
  function validateBackup(input){
    const errors=[];
    if(!isObj(input)) return {ok:false,errors:['El backup debe ser un objeto JSON.']};
    if(input.state!==undefined&&!isObj(input.state))errors.push('state debe ser un objeto');
    if(input.appData!==undefined&&!isObj(input.appData))errors.push('appData debe ser un objeto');
    if(input.savedScenarios!==undefined&&!Array.isArray(input.savedScenarios))errors.push('savedScenarios debe ser un array');
    if(input.plannerDraft!==undefined)errors.push(...validateSlots(input.plannerDraft));
    if(isObj(input.appData)){
      ['brands','pillars','families','customContent','history'].forEach(k=>{if(input.appData[k]!==undefined&&!Array.isArray(input.appData[k]))errors.push(`appData.${k} debe ser un array`)});
      if(input.appData.completion!==undefined&&!isObj(input.appData.completion))errors.push('appData.completion debe ser un objeto');
      if(input.appData.production!==undefined&&!isObj(input.appData.production))errors.push('appData.production debe ser un objeto');
    }
    if(Array.isArray(input.savedScenarios))input.savedScenarios.forEach((s,i)=>{
      if(!isObj(s))errors.push(`savedScenarios[${i}] debe ser un objeto`);
      else if(s.slots!==undefined)errors.push(...validateSlots(s.slots,`savedScenarios[${i}].slots`));
    });
    return {ok:errors.length===0,errors};
  }
  function normalizeSlots(slots){
    const out={1:[],2:[],3:[],4:[],5:[],6:[],0:[]};
    if(!isObj(slots))return out;
    Object.keys(out).forEach(k=>{out[k]=Array.isArray(slots[k])?clone(slots[k]):[]});
    return out;
  }
  function migrateBackup(input){
    const check=validateBackup(input);if(!check.ok)throw new Error(check.errors.join('\n'));
    const out=clone(input);
    out.schemaVersion=Number(out.schemaVersion||LEGACY_SCHEMA_VERSION);
    out.productVersion=PRODUCT_VERSION;
    if(out.plannerDraft)out.plannerDraft=normalizeSlots(out.plannerDraft);
    if(isObj(out.appData)){
      out.appData.completion=isObj(out.appData.completion)?out.appData.completion:{};
      out.appData.production=isObj(out.appData.production)?out.appData.production:{};
    }
    if(Array.isArray(out.savedScenarios))out.savedScenarios=out.savedScenarios.map(s=>({...s,slots:normalizeSlots(s.slots)}));
    return out;
  }
  window.EDITORIAL_DATA={PRODUCT_VERSION,LEGACY_SCHEMA_VERSION,validateBackup,migrateBackup,normalizeSlots};
})();
