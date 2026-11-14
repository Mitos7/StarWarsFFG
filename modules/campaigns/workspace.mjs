import {NAMESPACE,cleanCampaign,escapeHTML} from "./profiles.mjs";

function ownFlags(key){return {[NAMESPACE]:{campaignTools:{key,version:1}}};}
async function ensureFolder(type,key,name,parent=null){
 const existing=game.folders.find(f=>f.type===type&&f.getFlag(NAMESPACE,"campaignTools")?.key===key);
 return existing??Folder.create({name,type,folder:parent?.id??null,color:"#b69351",sorting:"a",flags:ownFlags(key)});
}
const promptPages=[
 ["Historia y punto de partida",["Premisa escrita por Mitos","Qué ocurrió en la historia anterior, si existe","Situación al comenzar esta campaña","Protagonistas y qué les une","Preguntas que la historia explorará"]],
 ["Canon y cronología",["Época y fecha de inicio","Hechos del universo que se mantienen","Cambios respecto al canon","Cronología de los hechos confirmados","Hechos que los personajes desconocen"]],
 ["Facciones y lugares",["Facciones propias: objetivos, recursos y relaciones","Planetas y asentamientos originales","Personajes importantes y vínculos","Lugares conocidos de Star Wars que se usarán"]],
 ["Reglas homebrew",["Regla propuesta y objetivo","A qué regla sustituye o complementa","Cómo se probará y cuándo se revisará","Estado: propuesta, aprobada o retirada","Registro de cambios"]],
 ["Sesiones y continuidad",["Próxima sesión: situación inicial","Frentes activos y decisiones pendientes","Resumen de la última sesión","Consecuencias de las decisiones de los jugadores","Cabos abiertos y siguiente paso"]],
 ["Plantilla de aventura",["Título y premisa","Objetivo de los personajes","Escenas y lugares","PNJ y motivaciones","Pistas y formas alternativas de avanzar","Complicaciones y consecuencias","Recompensas y continuidad"]]
];
export async function createHomebrewWorkspace(input={}) {
 if(!game.user.isGM)throw Error("Solo el director puede preparar la campaña.");
 const campaign=cleanCampaign(input),folders=[];
 const jr=await ensureFolder("JournalEntry","journal-root","Star Wars · Homebrew de Mitos");folders.push(jr);
 for(const [type,key,name,children] of [
  ["Actor","actor-root","Homebrew · Personajes y naves",["Personajes jugadores","Aliados y PNJ","Adversarios","Naves y vehículos"]],
  ["Item","item-root","Homebrew · Creaciones",["Equipo y tecnología","Especies y carreras","Talentos y Fuerza"]],
  ["Scene","scene-root","Homebrew · Escenas",[]],
  ["RollTable","table-root","Homebrew · Tablas",[]]
 ]){const f=await ensureFolder(type,key,name);folders.push(f);for(let i=0;i<children.length;i++)folders.push(await ensureFolder(type,`${key}-${i}`,children[i],f));}
 let journal=game.journal.find(j=>j.getFlag(NAMESPACE,"campaignTools")?.key==="campaign-bible");
 if(!journal){
  const intro=`<h1>${escapeHTML(campaign.title)}</h1><p>Historia original de Mitos. Documento de trabajo del director.</p><p><strong>Época:</strong> ${escapeHTML(campaign.era||"Por definir")}</p><p><strong>Canon:</strong> ${escapeHTML(campaign.canon)}</p><p><strong>Tono:</strong> ${escapeHTML(campaign.tone||"Por definir")}</p><h2>Premisa</h2><p>${escapeHTML(campaign.premise||"Por definir por Mitos.").replace(/\n/g,"<br>")}</p><h2>Continuidad anterior</h2><p>${escapeHTML(campaign.previousStory||"Por definir.").replace(/\n/g,"<br>")}</p><h2>Reglas homebrew propuestas</h2><p>${escapeHTML(campaign.houseRules||"Por definir.").replace(/\n/g,"<br>")}</p>`;
  const pages=[{name:"00 · Mi campaña",type:"text",text:{format:1,content:intro}},...promptPages.map(([name,sections],i)=>({name:`0${i+1} · ${name}`,type:"text",text:{format:1,content:sections.map(h=>`<h2>${escapeHTML(h)}</h2><p><em>Por definir.</em></p>`).join("")}}))];
  journal=await JournalEntry.create({name:campaign.title,folder:jr.id,ownership:{default:0},pages,flags:ownFlags("campaign-bible")});
 }
 const compendiums=[];
 for(const [name,label,type] of [["actors","Personajes y naves","Actor"],["items","Equipo, especies y poderes","Item"],["journals","Historias y lugares","JournalEntry"],["scenes","Escenas","Scene"],["tables","Tablas","RollTable"]]){
  const packName=`mitos-homebrew-${name}`;let pack=game.packs.get(`world.${packName}`);
  if(!pack)pack=await foundry.documents.collections.CompendiumCollection.createCompendium({name:packName,label:`Homebrew Mitos · ${label}`,type,system:["Actor","Item"].includes(type)?"starwarsffg":undefined,ownership:{PLAYER:"NONE",TRUSTED:"NONE",ASSISTANT:"OWNER"}});
  await pack.configure({locked:false,ownership:{PLAYER:"NONE",TRUSTED:"NONE",ASSISTANT:"OWNER"}});compendiums.push(pack.collection);
 }
 let macro=game.macros.find(m=>m.getFlag(NAMESPACE,"campaignTools")?.key==="open-homebrew");
 if(!macro)macro=await Macro.create({name:"Star Wars · Mi campaña homebrew",type:"script",img:"icons/svg/book.svg",command:'game.swffgCampaigns.open("homebrew");',ownership:{default:0},flags:ownFlags("open-homebrew")});
 const result={journalUuid:journal.uuid,macroUuid:macro.uuid,folders:folders.map(f=>f.id),compendiums};
 await game.settings.set(NAMESPACE,"campaignWorkspace",result);
 return result;
}
