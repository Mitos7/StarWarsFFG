import {NAMESPACE,escapeHTML} from "./profiles.mjs";

const BASE="systems/starwarsffg/modules/campaigns/data/";
const keyOf=doc=>doc.getFlag(NAMESPACE,"ffgimportid");
export async function loadSourceReview(){
 const files=["source-repairs-20261114.json","parent-modifier-repairs-20261114.json"];
 const [sources,parents]=await Promise.all(files.map(async file=>{const r=await fetch(BASE+file);if(!r.ok)throw Error(`No se pudo leer ${file}`);return r.json();}));
 return {sources,parents};
}
export function normalizedModifierSystem(system,record){
 const old=system.toObject?.()??system;
 return {description:old.description??record.rulesText??"",attributes:structuredClone(old.attributes??{}),type:record.modifierType,rank:Number.isFinite(Number(old.rank))&&Number(old.rank)>0?Number(old.rank):1,metadata:structuredClone(old.metadata??{}),itemmodifier:structuredClone(old.itemmodifier??[])};
}
export function appendMissingModifiers(existing,refs,descriptors){
 const result=structuredClone(existing??[]),added=[];
 for(const ref of refs??[]){
  if(result.some(m=>m.flags?.starwarsffg?.ffgimportid===ref.Key))continue;
  const source=descriptors.get(ref.Key);if(!source)throw Error(`Modificador no encontrado: ${ref.Key}`);
  const value=structuredClone(source.toObject?.()??source);
  value.type="itemmodifier";value.system.rank=Math.max(1,Number(ref.Count)||1);value.system.active=false;
  delete value._id;delete value.id;delete value.folder;delete value._stats;
  result.push(value);added.push(ref.Key);
 }
 return {items:result,added};
}
async function collectTargets(review){
 const packNames=new Set([...review.sources.documents,...review.sources.remove].map(r=>r.pack));
 for(const p of game.packs)if(/^world\.oggdude(?:.*attachments|gear|talents)$/.test(p.collection))packNames.add(p.collection);
 const packs=new Map();for(const id of packNames){const pack=game.packs.get(id);if(!pack)throw Error(`Falta el compendio ${id}`);packs.set(id,{pack,documents:await pack.getDocuments()});}
 const resolve=record=>{const rows=packs.get(record.pack)?.documents.filter(d=>keyOf(d)===record.key)??[];if(rows.length!==1||rows[0].name!==record.name)throw Error(`La ficha ${record.key} ha cambiado; revisar antes de aplicarla.`);return rows[0];};
 const documents=review.sources.documents.map(record=>({record,doc:resolve(record)}));
 const remove=review.sources.remove.flatMap(record=>{const found=packs.get(record.pack)?.documents.find(d=>keyOf(d)===record.key);if(!found)return [];return [{record,doc:resolve(record)}];});
 const missingParents=[];
 const parents=review.parents.flatMap(record=>{
  const expected=record.file==="Gear.xml"?"gear":record.file==="Talents.xml"?"talent":null;
  const matches=[...packs.values()].flatMap(p=>p.documents).filter(d=>keyOf(d)===record.key&&(expected?d.type===expected:d.pack?.endsWith("attachments")&&["itemattachment","shipattachment"].includes(d.type)));
  if(!matches.length){missingParents.push({key:record.key,name:record.name});return [];}
  if(matches.length!==1)throw Error(`Accesorio padre ambiguo: ${record.key}`);
  return [{record,doc:matches[0]}];
 });
 return {packs,documents,remove,parents,missingParents};
}
export async function snapshotSourceReview(){
 if(!game.user.isGM)throw Error("Solo el director puede revisar las fuentes.");
 const review=await loadSourceReview(),targets=await collectTargets(review);
 const docs=[...new Map([...targets.documents,...targets.remove,...targets.parents].map(x=>[x.doc.uuid,x.doc])).values()];
 const workspace=game.settings.get(NAMESPACE,"campaignWorkspace"),journal=workspace.journalUuid?await fromUuid(workspace.journalUuid):null;
 return {at:new Date().toISOString(),world:game.world.id,documents:docs.map(d=>({uuid:d.uuid,pack:d.pack,source:d.toObject()})),packs:[...targets.packs.values()].map(({pack})=>({id:pack.collection,locked:pack.locked})),campaignDraft:game.settings.get(NAMESPACE,"campaignDraft"),campaignJournal:journal?.toObject()};
}
async function verifyUnused(candidates){
 const references=[],needle=candidates.map(({doc})=>({uuid:doc.uuid,id:doc.id}));let scanned=0;
 const check=doc=>{if(needle.some(n=>n.uuid===doc.uuid))return;scanned++;const data=JSON.stringify(doc.toObject());for(const n of needle)if(data.includes(n.uuid)||data.includes(n.id))references.push({target:n.uuid,in:doc.uuid});};
 for(const collection of [game.actors,game.items,game.journal,game.scenes,game.tables,game.macros])for(const doc of collection)check(doc);
 for(const pack of game.packs)if(pack.collection.startsWith("world."))for(const doc of await pack.getDocuments())check(doc);
 if(references.length)throw Error(`Los objetos de relleno todavía tienen ${references.length} referencias; no se eliminarán.`);
 return scanned;
}
export async function applySourceReview({deleteUnused=false}={}){
 if(!game.user.isGM)throw Error("Solo el director puede revisar las fuentes.");
 const review=await loadSourceReview(),targets=await collectTargets(review);
 const scanned=deleteUnused?await verifyUnused(targets.remove):0;
 const summary={updated:0,retyped:0,normalizedArmor:0,parents:0,restoredOptions:0,removed:[],scanned,missingParents:targets.missingParents};
 const descriptors=new Map();
 const originalLocks=[...targets.packs.values()].map(({pack})=>[pack.collection,pack.locked]);
 try{
  for(const {pack} of targets.packs.values())if(pack.locked)await pack.configure({locked:false});
  for(const {record,doc} of targets.documents){
   const sources=[...new Set([...(doc.system.metadata?.sources??[]),...record.sources])];
   const reviewFlag={version:1,date:review.sources.date,kind:record.kind,origin:record.provenance,relatedBooks:record.relatedBooks,evidence:record.related,usageCount:record.usageCount};
   // ItemBaseFFG adds a root flags object; provide nested flags so normalization preserves them.
   const update={"system.metadata.sources":sources,flags:{[NAMESPACE]:{sourceReview:reviewFlag}}};
   if(record.kind==="descriptor"){
    const system=normalizedModifierSystem(doc.system,record);
    system.metadata.sources=sources;system.metadata.tags=[...new Set([...(system.metadata.tags??[]).filter(t=>t!=="shipattachment"&&t!=="armor"),"itemmodifier",record.modifierType])];
    if(doc.type!=="itemmodifier"){
     update.type="itemmodifier";update.system=foundry.data.operators.ForcedReplacement.create(system);delete update["system.metadata.sources"];summary.retyped++;
    }else{update["system.type"]=record.modifierType;update["system.metadata.tags"]=system.metadata.tags;if(doc.system.type==="armor")summary.normalizedArmor++;}
   }
   await doc.update(update);summary.updated++;
   if(record.kind==="descriptor")descriptors.set(record.key,doc);
  }
  for(const {record,doc} of targets.parents){
   const added=appendMissingModifiers(doc.system.itemmodifier,record.groups.AddedMods,descriptors);
   const update={};
   if(added.added.length){update["system.itemmodifier"]=added.items.map(i=>({...i,id:i.id??foundry.utils.randomID()}));summary.restoredOptions+=added.added.length;}
   const base=record.groups.BaseMods??record.groups.Qualities??[];
   if(base.length&&!String(doc.system.description??"").includes('data-source-review-base="1"')){
    const lines=base.map(ref=>{const descriptor=review.sources.documents.find(d=>d.key===ref.Key&&d.kind==="descriptor");if(!descriptor)throw Error(`Falta ${ref.Key}`);const text=(descriptor.qualText||descriptor.rulesText||descriptor.name).replaceAll("{0}",String(Number(ref.Count)||1));return `<li>${escapeHTML(text)}</li>`;});
    update["system.description"]=(doc.system.description??"")+`<section data-source-review-base="1"><h3>Modificaciones base recuperadas</h3><ul>${lines.join("")}</ul><p>Comprueba las elecciones y condiciones de cada modificación al aplicarla.</p></section>`;
   }
   // Persist legacy embedded arrays explicitly; their object entries are not reliably diffed in V14.
   if(Object.keys(update).length){await doc.update(update,{diff:false});summary.parents++;}
  }
  if(deleteUnused)for(const {record,doc} of targets.remove){await doc.delete();summary.removed.push({name:record.name,key:record.key});}
 }finally{
  for(const [id,locked] of originalLocks){const pack=game.packs.get(id);if(pack&&pack.locked!==locked)await pack.configure({locked});}
 }
 game.swffgCampaigns.refresh();return summary;
}
