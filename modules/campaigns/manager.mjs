import {LINE_LABELS,entryBookIds,catalogueBooks,filterEntries,sourcesFromDescription} from "./books.mjs";
import {NAMESPACE,PROFILES,RECOMMENDED_MODULES,REVIEWED_VERSIONS,planModules,cleanCampaign} from "./profiles.mjs";
import {createHomebrewWorkspace} from "./workspace.mjs";

const {ApplicationV2,HandlebarsApplicationMixin}=foundry.applications.api;
let indexCache=null,moduleCatalogue=null;
export function clearCampaignIndex(){indexCache=null;}
export async function loadCampaignIndex(){
 if(indexCache)return indexCache;
 const entries=[],errors=[];
 for(const pack of game.packs){
  if(!pack.visible||!["Actor","Item","JournalEntry","Scene","RollTable"].includes(pack.documentName))continue;
  if(!/^(world\.|starwarsffg\.sw-|swffg-mitos-starter\.)/.test(pack.collection))continue;
  try{
   const index=await pack.getIndex({fields:["img","type","system.metadata.sources","system.metadata.tags","system.description","pages"]});
   // Journal indexes omit page bodies; imported skill references require their text pages.
   const sourceDocuments=pack.documentName==="JournalEntry"&&pack.collection.startsWith("world.oggdude")?new Map((await pack.getDocuments()).map(doc=>[doc.id,doc])):new Map();
   for(const doc of index){
    const entry={uuid:doc.uuid??`Compendium.${pack.collection}.${pack.documentName}.${doc._id}`,name:doc.name,type:doc.type??pack.documentName,documentName:pack.documentName,img:doc.img||"icons/svg/book.svg",pack:pack.collection,packLabel:pack.metadata.label,sources:doc.system?.metadata?.sources??[],tags:doc.system?.metadata?.tags??[]};
    if(!entry.sources.length&&!entry.tags.some(t=>String(t).startsWith("book:"))&&pack.collection.startsWith("world.")){
      entry.sources=sourcesFromDescription([doc.system?.description??"",...(sourceDocuments.get(doc._id)?.pages??doc.pages??[]).map(p=>p.text?.content??"")].join("\n"));
      entry.recoveredSource=entry.sources.length>0;
    }
    entry.books=entryBookIds(entry);entries.push(entry);
   }
  }catch(error){errors.push({pack:pack.collection,message:error.message});}
 }
 // Include creations in the campaign's world folders as soon as they are saved.
 const homebrewFolders=new Set(game.folders.filter(f=>f.getFlag(NAMESPACE,"campaignTools")?.key).map(f=>f.id));
 const inHomebrewFolder=doc=>{let folder=doc.folder;const seen=new Set();while(folder&&!seen.has(folder.id)){if(homebrewFolders.has(folder.id))return true;seen.add(folder.id);folder=folder.folder;}return false;};
 for(const collection of [game.actors,game.items,game.journal,game.scenes,game.tables])for(const doc of collection){
  if(!doc.visible||(!inHomebrewFolder(doc)&&!doc.getFlag(NAMESPACE,"campaignTools")?.key))continue;
  entries.push({uuid:doc.uuid,name:doc.name,type:doc.type??doc.documentName,documentName:doc.documentName,img:doc.img||"icons/svg/book.svg",packLabel:"Mi campaña · En el mundo",sources:doc.system?.metadata?.sources??[],tags:[],homebrew:true,books:["homebrew"]});
 }
 entries.sort((a,b)=>a.name.localeCompare(b.name,game.i18n.lang));
 indexCache={entries,books:catalogueBooks(entries),errors};return indexCache;
}
async function loadCatalogue(){
 if(!moduleCatalogue){const r=await fetch("systems/starwarsffg/modules/campaigns/data/modules.json");if(!r.ok)throw Error("No se pudo leer el catálogo de módulos.");moduleCatalogue=await r.json();}
 return moduleCatalogue;
}
export class CampaignManager extends HandlebarsApplicationMixin(ApplicationV2){
 static DEFAULT_OPTIONS={id:"swffg-campaign-manager",tag:"form",classes:["swffg-campaign-manager"],window:{title:"Star Wars · Libros, combinaciones y homebrew",icon:"fas fa-book-journal-whills",resizable:true},position:{width:1020,height:760},form:{closeOnSubmit:false,submitOnChange:false},actions:{tab:CampaignManager.tab,saveBooks:CampaignManager.saveBooks,selectAll:CampaignManager.selectAll,clearBooks:CampaignManager.clearBooks,applyProfile:CampaignManager.applyProfile,applyModules:CampaignManager.applyModules,openEntry:CampaignManager.openEntry,more:CampaignManager.more,refresh:CampaignManager.refresh,saveCampaign:CampaignManager.saveCampaign,createWorkspace:CampaignManager.createWorkspace,openBible:CampaignManager.openBible}};
 static PARTS={body:{template:"systems/starwarsffg/templates/campaigns/manager.hbs",scrollable:[".swc-scroll"]}};
 constructor(options={}){super(options);this.section=options.section??"books";this.bookDraft=null;this.profile=game.settings.get(NAMESPACE,"campaignProfile");this.book="";this.line="";this.kind="";this.search="";this.moduleSearch="";this.includeFan=false;this.limit=60;this.campaignDraft=null;}
 async _prepareContext(){
  const data=await loadCampaignIndex(),catalogue=await loadCatalogue();
  if(!this.bookDraft){const saved=game.settings.get(NAMESPACE,"campaignBooks");this.bookDraft=new Set(saved.includes("*")?data.books.map(b=>b.id):saved);}
  const filtered=filterEntries(data.entries,{selected:game.settings.get(NAMESPACE,"campaignBooks"),book:this.book,line:this.line,type:this.kind,search:this.search,includeFan:this.includeFan});
  const profile=PROFILES.find(p=>p.id===this.profile)??PROFILES[0],modules=[...game.modules].map(m=>({id:m.id,title:m.title,version:m.version}));
  const plan=planModules(modules,game.settings.get("core","moduleConfiguration"),{foundry:game.version,system:game.system.version});
  const groups=Object.entries(LINE_LABELS).map(([id,label])=>({id,label,books:data.books.filter(b=>b.line===id).map(b=>({...b,checked:this.bookDraft.has(b.id),available:b.count>0}))}));
  const active=game.modules;const q=this.moduleSearch.toLocaleLowerCase();
  const tools=catalogue.filter(m=>!q||`${m.title} ${m.description} ${m.id}`.toLocaleLowerCase().includes(q)).map(m=>{const installed=active.get(m.id);return {...m,installed:!!installed,active:!!installed?.active,installedVersion:installed?.version,compatibleScope:!m.otherSystem,status:installed?.active?"Activo":installed?"Instalado · inactivo":m.otherSystem?"Otro sistema":"Sin instalar",reviewed:!!installed&&REVIEWED_VERSIONS[m.id]?.includes(installed.version)};});
  const selectedProfileBooks=profile.books.includes("*")?data.books:data.books.filter(b=>profile.books.includes(b.id));
  return {tabs:[["books","Libros"],["library","Biblioteca"],["profiles","Combinaciones"],["modules","Módulos"],["homebrew","Mi homebrew"]].map(([id,label])=>({id,label,active:id===this.section})),isBooks:this.section==="books",isLibrary:this.section==="library",isProfiles:this.section==="profiles",isModules:this.section==="modules",isHomebrew:this.section==="homebrew",groups,selectedCount:this.bookDraft.size,totalBooks:data.books.length,total:data.entries.length,unidentified:data.entries.filter(e=>e.books.includes("unknown")).length,indexErrors:data.errors,profiles:PROFILES.map(p=>({...p,selected:p.id===this.profile})),profile,profileBooks:selectedProfileBooks,missingProfileBooks:selectedProfileBooks.filter(b=>!b.count),modulePlan:plan,hasModuleChanges:plan.changed,canApplyModules:!plan.issues.length&&plan.changed,recommendedModules:RECOMMENDED_MODULES.map(id=>({id,title:active.get(id)?.title??id,version:active.get(id)?.version??"Sin instalar",active:!!active.get(id)?.active})),karmic:!!active.get("swrpg-karmic-dice")?.active,results:filtered.slice(0,this.limit).map(e=>({...e,sourceLabel:e.books.map(id=>data.books.find(b=>b.id===id)?.title??id).join(" · ")})),resultCount:filtered.length,shown:Math.min(this.limit,filtered.length),hasMore:this.limit<filtered.length,search:this.search,bookOptions:data.books.map(b=>({...b,selected:b.id===this.book})),lineOptions:Object.entries(LINE_LABELS).map(([id,label])=>({id,label,selected:id===this.line})),typeOptions:[...new Set(data.entries.map(e=>e.type))].sort().map(id=>({id,selected:id===this.kind})),includeFan:this.includeFan,tools,moduleSearch:this.moduleSearch,campaign:this.campaignDraft??game.settings.get(NAMESPACE,"campaignDraft"),workspace:game.settings.get(NAMESPACE,"campaignWorkspace")};
 }
 _attachPartListeners(part,element,options){
  super._attachPartListeners(part,element,options);
  element.querySelectorAll('[data-book-id]').forEach(el=>el.addEventListener("change",()=>{if(el.checked)this.bookDraft.add(el.dataset.bookId);else this.bookDraft.delete(el.dataset.bookId);const count=element.querySelector('[data-selected-count]');if(count)count.textContent=this.bookDraft.size;}));
  element.querySelectorAll('[data-control]').forEach(el=>{
   const control=el.dataset.control;const isText=["search","moduleSearch"].includes(control);
   el.addEventListener(isText?"input":"change",()=>{this[control]=el.type==="checkbox"?el.checked:el.value;this.limit=60;clearTimeout(this.debounce);this.debounce=setTimeout(async()=>{const pos=el.selectionStart;await this.render();if(isText){const next=this.element.querySelector(`[data-control="${control}"]`);next?.focus();if(typeof pos==="number")next?.setSelectionRange(pos,pos);}},isText?220:0);});
  });
  element.querySelectorAll('[data-campaign]').forEach(el=>el.addEventListener("input",()=>{this.campaignDraft??={...game.settings.get(NAMESPACE,"campaignDraft")};this.campaignDraft[el.dataset.campaign]=el.value;}));
  element.querySelectorAll('[draggable="true"][data-uuid]').forEach(el=>el.addEventListener("dragstart",event=>{event.dataTransfer.setData("text/plain",JSON.stringify({type:el.dataset.documentType,uuid:el.dataset.uuid}));}));
 }
 static async tab(event,target){this.section=target.dataset.tab;await this.render();}
 static async selectAll(){this.bookDraft=new Set((await loadCampaignIndex()).books.map(b=>b.id));await this.render();}
 static async clearBooks(){this.bookDraft=new Set();await this.render();}
 static async saveBooks(){await game.settings.set(NAMESPACE,"campaignProfile","custom");await game.settings.set(NAMESPACE,"campaignBooks",[...this.bookDraft]);this.profile="custom";this.book="";this.section="library";await this.render();ui.notifications.info("Selección de libros guardada para este mundo.");}
 static async applyProfile(){const p=PROFILES.find(x=>x.id===this.profile);if(!p)return;await game.settings.set(NAMESPACE,"campaignProfile",p.id);if(p.id!=="custom")await game.settings.set(NAMESPACE,"campaignBooks",p.books);this.bookDraft=null;this.book="";await this.render();ui.notifications.info(`Combinación seleccionada: ${p.name}`);}
 static async applyModules(){
  const current=game.settings.get("core","moduleConfiguration");const plan=planModules([...game.modules].map(m=>({id:m.id,title:m.title,version:m.version})),current,{foundry:game.version,system:game.system.version});
  if(plan.issues.length)return ui.notifications.warn(plan.issues.join(" "));if(!plan.changed)return ui.notifications.info("La combinación recomendada ya está activa.");
  const yes=await foundry.applications.api.DialogV2.confirm({window:{title:"Aplicar combinación de módulos"},content:`<p>Activar: ${plan.enable.join(", ")||"ninguno"}.</p><p>Desactivar por conflicto: ${plan.disable.join(", ")||"ninguno"}.</p><p>Foundry recargará este mundo al aplicar los cambios.</p>`});
  if(!yes)return;
  await game.settings.set(NAMESPACE,"campaignModuleBackup",{at:new Date().toISOString(),configuration:current});await game.settings.set("core","moduleConfiguration",plan.configuration);window.location.reload();
 }
 static async openEntry(event,target){const doc=await fromUuid(target.dataset.uuid);if(doc)await doc.sheet.render(true);else ui.notifications.warn("La entrada ya no está disponible. Actualiza el índice.");}
 static async more(){this.limit+=60;await this.render();}
 static async refresh(){clearCampaignIndex();await this.render();}
 static async saveCampaign(){const campaign=cleanCampaign(this.campaignDraft??game.settings.get(NAMESPACE,"campaignDraft"));await game.settings.set(NAMESPACE,"campaignDraft",campaign);this.campaignDraft=null;ui.notifications.info("Ficha de campaña guardada.");await this.render();}
 static async createWorkspace(){await CampaignManager.saveCampaign.call(this);await createHomebrewWorkspace(game.settings.get(NAMESPACE,"campaignDraft"));await game.settings.set(NAMESPACE,"campaignProfile","homebrew");this.profile="homebrew";this.bookDraft=null;clearCampaignIndex();await this.render();ui.notifications.info("Tu espacio homebrew está preparado: diario privado, carpetas y cinco compendios editables.");}
 static async openBible(){const uuid=game.settings.get(NAMESPACE,"campaignWorkspace")?.journalUuid;if(uuid){const doc=await fromUuid(uuid);await doc?.sheet.render(true);}}
}
