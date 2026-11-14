/** Import supplied scene ideas, tables and macros without running macros or activating scenes. */
export async function organizeFoundryTools(){
if(!game.user.isGM)throw Error("GM required");
const result={created:[],preserved:[],errors:[]};
for(const pack of game.packs.filter(p=>p.collection.startsWith("ffg-star-wars-enhancements."))){
const type=pack.documentName,collection=game.collections.get(type);
if(!["Scene","RollTable","Macro"].includes(type))continue;
let folder=game.folders.find(f=>f.type===type&&f.name==="Ayudas FFG"&&!f.folder);
folder??=await Folder.create({name:"Ayudas FFG",type,sorting:"a",color:"#3c5777"});
for(const doc of await pack.getDocuments()){
const old=collection.find(d=>(d._stats?.compendiumSource??d.flags?.core?.sourceId)===doc.uuid);
if(old){result.preserved.push(old.uuid);continue;}
const data=collection.fromCompendium(doc,{clearFolder:true});data.folder=folder.id;
data.flags??={};data.flags.starwarsffg??={};data.flags.starwarsffg.libraryOrganization={version:1,sourceUuid:doc.uuid,kind:"helper"};
if(type==="Scene"){data.active=false;data.navigation=false;}
const created=await CONFIG[type].documentClass.create(data);
result.created.push({source:doc.uuid,uuid:created.uuid,name:created.name});
}
}return result;
}
/** Compare rule data after awaiting the system's asynchronous preparation.
 * Foundry metadata and object-key order are not rule changes. New neutral inherent
 * effects are created by ItemFFG._onCreateAEs; report them separately.
 */
export async function validateImportedRules(){
const strip=value=>Array.isArray(value)?value.map(strip):value&&typeof value==="object"?Object.fromEntries(Object.keys(value).sort().filter(k=>!["_stats","ownership","folder","sort"].includes(k)).map(k=>[k,strip(value[k])])):value;
const neutral=e=>{
const changes=e.system?.changes??e.changes??[];
return e.name==="(inherent)"&&!e.origin&&!e.statuses?.length&&changes.every(c=>c.type==="add"&&((c.key==="(none)"&&c.value===true)||(["system.stats.encumbrance.value","system.stats.defence.melee","system.stats.defence.ranged","system.stats.soak.value"].includes(c.key)&&c.value===0)));
};
const result={checked:0,differences:[],missingSources:[],generatedNeutralEffects:[]};
const cache=new Map();
for(const type of ["Actor","Item","JournalEntry"]){
for(const d of game.collections.get(type).filter(x=>x.flags?.starwarsffg?.libraryOrganization?.sourceUuid)){
const uuid=d.flags.starwarsffg.libraryOrganization.sourceUuid,parts=uuid.split(".");
const pack=game.packs.get(parts.slice(1,3).join("."));
if(!pack){result.missingSources.push(d.uuid);continue;}
if(!cache.has(pack.collection))cache.set(pack.collection,new Map((await pack.getDocuments()).map(x=>[x.id,x])));
const s=cache.get(pack.collection).get(parts.at(-1));
if(!s){result.missingSources.push(d.uuid);continue;}
for(const x of [d,s]){await x.prepareData();for(const i of x.items??[])await i.prepareData();}
const data=d.toObject(),original=s.toObject();
// Ignore only calculated display caches persisted by the legacy weapon sheet.
if(type==="Item"&&["weapon","shipweapon"].includes(d.type))for(const x of [data,original])for(const key of ["damage","crit","range"])if(x.system?.[key])delete x.system[key].adjusted;
// Checkbox submission normalizes legacy "true"/"false" strings.
if(type==="Actor"&&d.type==="vehicle")for(const x of [data,original]){const n=x.system?.stats?.navicomputer;if(n&&["true","false"].includes(n.value))n.value=n.value==="true";}
if(type==="Item"&&!original.effects?.some(e=>e.name==="(inherent)")){
data.effects=data.effects.filter(e=>{if(neutral(e)){result.generatedNeutralEffects.push({uuid:d.uuid,effect:e._id});return false;}return true;});
}
const pick=data=>strip(Object.fromEntries(["name","type","system","items","effects","pages"].filter(k=>k in data).map(k=>[k,data[k]])));
if(JSON.stringify(pick(data))!==JSON.stringify(pick(original)))result.differences.push({uuid:d.uuid,source:s.uuid,name:d.name,type});
result.checked++;
}
}return result;
}
