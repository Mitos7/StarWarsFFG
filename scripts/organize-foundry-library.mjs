import {BOOKS,LINE_LABELS} from "../modules/campaigns/books.mjs";
import {clearCampaignIndex,loadCampaignIndex} from "../modules/campaigns/manager.mjs";
const KEY="libraryOrganization",VERSION=1;
const canonical=uuid=>String(uuid??"").replace(/^Compendium\.swffg-mitos-starter\.(sw-[^.]+)\./,"Compendium.starwarsffg.$1.");
const source=doc=>canonical(doc.flags?.starwarsffg?.[KEY]?.sourceUuid??doc._stats?.compendiumSource??doc.flags?.core?.sourceId);
const labels={oggdudeskilldescriptions:"Habilidades y referencias",oggdudebackgrounds:"Trasfondos",oggdudearmormods:"Modificadores de armadura",oggdudemotivations:"Motivaciones",oggdudeweaponmods:"Modificadores de arma",oggdudeobligations:"Obligaciones",oggdudegenericmods:"Modificadores generales",oggdudevehiclemods:"Modificadores de vehículos",oggdudearmor:"Armaduras",oggdudeforcepowers:"Poderes de la Fuerza",oggdudegear:"Equipo",oggdudearmorattachments:"Accesorios de armadura",oggdudetalents:"Talentos",oggdudeweaponattachments:"Accesorios de arma",oggdudegenericattachments:"Accesorios generales",oggdudeweapons:"Armas",oggdudevehicleattachments:"Accesorios de vehículos",oggdudevehicleweapons:"Armamento de vehículos",oggdudespecies:"Especies",oggdudespecializations:"Especializaciones",oggdudecareers:"Carreras",oggdudevehiclesplanetary:"Vehículos planetarios",oggdudevehiclesspace:"Naves espaciales",oggdudesignatureabilities:"Capacidades distintivas","sw-adversaries-core":"Personajes y adversarios"};
function eligible(pack){return /^(world\.(oggdude|sw-adversaries-core)|starwarsffg\.sw-|swffg-mitos-starter\.(?!sw-))/.test(pack?.collection??"");}
function category(entry){return labels[entry.pack.split(".")[1]]??entry.packLabel.replace(/ - .*$/,"");}
function bookFor(entry){return BOOKS.find(b=>b.id===(entry.auxiliary?"oggdude-descriptors":entry.books?.[0]))??BOOKS.find(b=>b.id==="unknown");}
function flags(data){return {starwarsffg:{[KEY]:{version:VERSION,...data}}};}
export async function organizeFoundryLibrary({dryRun=true,limitPerType=Infinity,onProgress=()=>{}}={}){
if(!game.user.isGM||game.system.id!=="starwarsffg")throw Error("Requiere director y sistema starwarsffg");
clearCampaignIndex();const index=await loadCampaignIndex();
const entries=index.entries.filter(e=>eligible(game.packs.get(e.pack)));
const collections=new Map(),existing=new Map();
for(const type of new Set(entries.map(e=>e.documentName))){
const collection=game.collections.get(type);collections.set(type,collection);
for(const doc of collection){const uuid=source(doc);if(uuid&&!existing.has(uuid))existing.set(uuid,doc);}
}
const plan={total:entries.length,missing:0,existing:0,byType:{},byBook:{},unknown:[],created:[],preserved:[],folders:0,packMoves:0,packEntries:0,errors:[]};
for(const e of entries){const book=bookFor(e);plan.byType[e.documentName]=(plan.byType[e.documentName]??0)+1;plan.byBook[book.id]=(plan.byBook[book.id]??0)+1;if(book.id==="unknown")plan.unknown.push(e.uuid);if(existing.has(canonical(e.uuid)))plan.existing++;else plan.missing++;}
if(dryRun)return plan;
if(plan.unknown.length)throw Error("No se organiza contenido sin fuente revisada: "+plan.unknown.length);
const folderCache=new Map();
async function folder(type,name,parent=null,pack=null,key=""){
const collection=pack?pack.folders:game.folders;
const cacheKey=[pack?.collection??"world",type,parent??"",name].join("|");
if(folderCache.has(cacheKey))return folderCache.get(cacheKey);
let doc=collection.find(f=>f.type===type&&f.name===name&&(f.folder?.id??f._source.folder??null)===parent);
if(!doc){[doc]=await Folder.createDocuments([{name,type,folder:parent,sorting:"a",color:type==="Compendium"?"#3c5777":"#31445e",flags:flags({key})}],{...(pack?{pack:pack.collection}:{}),render:false});plan.folders++;}
folderCache.set(cacheKey,doc.id);return doc.id;
}
const roots={};
for(const [id,name] of Object.entries({ffg:"01 · Biblioteca FFG",fan:"02 · Material fan y ejemplos",homebrew:"03 · Mi campaña · El regreso de los Jedi",tools:"04 · Herramientas de juego",archive:"99 · Copias conservadas"}))roots[id]=await folder("Compendium",name,null,null,id);
for(const pack of game.packs){
let root,sub;
if(/^world\.(oggdude|sw-adversaries-core)/.test(pack.collection)){root=roots.ffg;sub=pack.documentName==="Actor"?"Personajes y vehículos":pack.documentName==="Item"?(/mods$/.test(pack.collection)?"Modificadores compartidos":"Equipo y creación de personaje"):"Referencias";}
else if(pack.collection.startsWith("world.mitos-homebrew-"))root=roots.homebrew;
else if(pack.collection.startsWith("starwarsffg.sw-")){root=roots.fan;sub="Adaptaciones de Star Wars · datos no oficiales";}
else if(pack.collection.startsWith("swffg-mitos-starter.sw-")){root=roots.archive;sub="Copias del módulo inicial";}
else if(pack.collection.startsWith("swffg-mitos-starter.")){root=roots.fan;sub="Ejemplos originales";}
else {root=roots.tools;sub=pack.metadata.packageName;}
const target=sub?await folder("Compendium",sub,root):root;
if(pack.folder?.id!==target){await pack.setFolder(target);plan.packMoves++;}
}
const worldFolder=async e=>{
const b=bookFor(e),type=e.documentName;
const root=await folder(type,b.line==="fan"?"Material fan y ejemplos":"Biblioteca FFG");
const line=await folder(type,LINE_LABELS[b.line],root);
const book=await folder(type,b.title,line);
return folder(type,category(e),book);
};
const createdPerType={};
for(const pack of game.packs.filter(eligible)){
onProgress({phase:"pack",pack:pack.collection,created:plan.created.length});
const docs=await pack.getDocuments(),byId=new Map(docs.map(d=>[d.id,d]));
const packEntries=entries.filter(e=>e.pack===pack.collection);
const isWorld=pack.metadata.packageType==="world",wasLocked=pack.locked;
try{
if(isWorld&&wasLocked)await pack.configure({locked:false});
const packUpdates=[],batches=[];
for(const e of packEntries){
const doc=byId.get(e.uuid.split(".").at(-1));if(!doc)throw Error("No existe "+e.uuid);
const b=bookFor(e);
if(isWorld){
const line=await folder(e.documentName,LINE_LABELS[b.line],null,pack);
const target=await folder(e.documentName,b.title,line,pack);
if(doc.folder?.id!==target)packUpdates.push({_id:doc.id,folder:target});
}
const prior=existing.get(canonical(e.uuid));
if(prior){plan.preserved.push({source:e.uuid,uuid:prior.uuid});continue;}
if((createdPerType[e.documentName]??0)>=limitPerType)continue;
const data=collections.get(e.documentName).fromCompendium(doc,{clearFolder:true});
data.folder=await worldFolder(e);
data.flags??={};data.flags.starwarsffg??={};data.flags.starwarsffg[KEY]={version:VERSION,sourceUuid:e.uuid,book:b.id,allBooks:e.books,importedAt:new Date().toISOString()};
batches.push({data,e});createdPerType[e.documentName]=(createdPerType[e.documentName]??0)+1;
}
if(packUpdates.length){await CONFIG[pack.documentName].documentClass.updateDocuments(packUpdates,{pack:pack.collection,render:false});plan.packEntries+=packUpdates.length;}
for(let i=0;i<batches.length;i+=25){
const chunk=batches.slice(i,i+25);
const created=await CONFIG[pack.documentName].documentClass.createDocuments(chunk.map(x=>x.data),{render:false});
if(created.length!==chunk.length)throw Error("Importación incompleta "+pack.collection);
for(let j=0;j<created.length;j++){const d=created[j],e=chunk[j].e;existing.set(canonical(e.uuid),d);plan.created.push({source:e.uuid,uuid:d.uuid,name:d.name});}
onProgress({phase:"import",pack:pack.collection,created:plan.created.length,total:plan.missing});
}
}catch(error){plan.errors.push({pack:pack.collection,error:error.message});throw Object.assign(error,{organizationReport:plan});}
finally{if(isWorld&&wasLocked)await pack.configure({locked:true});}
}
for(const type of collections.keys())collections.get(type).render();
ui.compendium.render();
clearCampaignIndex();return plan;
}
export async function validateOrganizedLibrary(){
clearCampaignIndex();const index=await loadCampaignIndex();const entries=index.entries.filter(e=>eligible(game.packs.get(e.pack)));
const result={expected:entries.length,matched:0,missing:[],duplicates:[],misfiled:[]};
for(const e of entries){
const matches=game.collections.get(e.documentName).filter(d=>source(d)===canonical(e.uuid));
if(!matches.length)result.missing.push(e.uuid);else result.matched++;
if(matches.filter(d=>d.flags?.starwarsffg?.[KEY]).length>1)result.duplicates.push(e.uuid);
for(const d of matches.filter(d=>d.flags?.starwarsffg?.[KEY]))if(!d.folder||d.folder.type!==d.documentName)result.misfiled.push(d.uuid);
}return result;
}
