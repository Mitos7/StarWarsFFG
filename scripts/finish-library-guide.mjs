import {escapeHTML as esc} from "../modules/campaigns/profiles.mjs";
export async function finishLibraryGuide(){
if(!game.user.isGM)throw Error("GM required");
const result={moved:[],emptyFoldersRemoved:[],journal:null,macro:null};
const actorRoot=game.folders.find(f=>f.type==="Actor"&&f.name==="Material fan y ejemplos"&&!f.folder);
if(actorRoot){
let target=game.folders.find(f=>f.type==="Actor"&&f.name==="Ejemplos preparados"&&f.folder?.id===actorRoot.id);
target??=await Folder.create({type:"Actor",name:"Ejemplos preparados",folder:actorRoot.id,sorting:"a"});
for(const a of game.actors.filter(a=>!a.folder&&["Agente ISB","Carguero Bruma Gris","Lanzadera Gris-7","Patrullera Centella"].includes(a.name))){await a.update({folder:target.id});result.moved.push(a.uuid);}
}
// Only remove empty legacy compendium containers, never packs or documents.
for(let pass=0;pass<4;pass++){
const empty=game.folders.filter(f=>f.type==="Compendium"&&!f.flags?.starwarsffg?.libraryOrganization&&!game.folders.some(child=>child.folder?.id===f.id)&&!game.packs.some(p=>p.folder?.id===f.id));
if(!empty.length)break;
await Folder.deleteDocuments(empty.map(f=>f.id),{deleteSubfolders:false,deleteContents:false});result.emptyFoldersRemoved.push(...empty.map(f=>f.id));
}
const r=await(await fetch("systems/starwarsffg/assets/starwars-original/vehicle-review-20261114.json",{cache:"no-store"})).json();
const campaign=game.journal.find(j=>j.flags?.starwarsffg?.campaignTools?.key==="campaign-bible");
const library=(type,name)=>{const folder=game.folders.find(f=>f.type===type&&f.name===name&&!f.folder);return folder?"@UUID["+folder.uuid+"]{"+esc(name)+"}":esc(name);};
const pages=[
{name:"01 · Dónde está cada cosa",type:"text",text:{format:1,content:
"<h1>Biblioteca Star Wars preparada</h1><p>En <strong>Actores</strong> están los personajes, adversarios, naves y vehículos. En <strong>Objetos</strong> están el equipo, armas, armaduras, especies, carreras, especializaciones, talentos y poderes. En <strong>Diarios</strong> están las referencias.</p><p>Dentro de Biblioteca FFG, abre la línea de juego, el libro y la categoría. Si una entrada aparece en varios libros, se archiva una sola vez por su primera fuente explícita; el buscador de libros conserva todas sus referencias. Los modificadores reutilizables están en Recursos compartidos.</p><p>"+library("Actor","Biblioteca FFG")+" · "+library("Item","Biblioteca FFG")+" · "+library("JournalEntry","Biblioteca FFG")+"</p><p>El material fan y los ejemplos se encuentran separados y mantienen la indicación de datos no oficiales. Las fichas que ya estaban preparadas se conservan. Los compendios originales mantienen sus identificadores y enlaces; las copias del módulo inicial no se han importado por segunda vez.</p><h2>Ayudas de juego</h2><p>Las escenas de ejemplo, la tabla de personajes de cantina y las macros de FFG Enhancements están en <strong>Ayudas FFG</strong>, en sus pestañas correspondientes. Las escenas no se han activado ni se han ejecutado las macros.</p><h2>Mi campaña</h2><p>"+(campaign?"@UUID["+campaign.uuid+"]{"+esc(campaign.name)+"}":"Homebrew de Mitos")+"</p><p>La campaña transcurre mucho después del episodio IX: los Jedi están casi extintos, aparece un nuevo mal y hay que encontrar posibles nuevos Jedi. Las carpetas y los cinco compendios homebrew están preparados para tu historia. Las recomendaciones de combinación de libros están disponibles en el gestor de campañas.</p>"}},
{name:"02 · Estado de las ilustraciones",type:"text",text:{format:1,content:
"<h1>Revisión de ilustraciones</h1><p>Se revisaron los 81 vehículos que conservaban la imagen genérica. Se localizaron cinco representaciones identificadas; los otros 76 mantienen el icono provisional. No se sustituyen por modelos distintos ni por imágenes inventadas.</p><p>La imagen WUD-500 corresponde a Rabbit’s Foot, una variante modificada; la ficha conserva sus reglas. La nave ciudad ithoriana usa una representación de la comunidad de SWCombine. Las fuentes y notas están registradas con los archivos.</p><h2>Modelos con imagen incorporada</h2><ul>"+r.resolved.map(x=>"<li>@UUID["+x.uuid+"]{"+esc(x.name)+"}</li>").join("")+"</ul><h2>Sin ilustración verificada</h2><p>Esto no significa que no exista una ilustración publicada: no se ha localizado una correspondencia verificable en las fuentes revisadas.</p><ul>"+r.unverified.map(x=>"<li>@UUID["+x.uuid+"]{"+esc(x.name)+"}</li>").join("")+"</ul>"}},
{name:"03 · Material Deck",type:"text",text:{format:1,content:
"<h1>Material Deck</h1><p>En la revisión del 14 de noviembre, Material Deck intentaba conectar con Material Companion en localhost:3001, pero no había ningún servicio escuchando. Tampoco se encontró una instalación de Material Companion ni de Elgato Stream Deck. La versión instalada de Material Deck declara compatibilidad hasta Foundry 12; este mundo usa Foundry 14.369.</p><p>Material Deck y su integración de Star Wars están desactivados para evitar los intentos fallidos de conexión. El resto del mundo puede funcionar sin ese puente. Para usar un dispositivo Stream Deck hay que instalar y configurar primero su software y el puente externo, y verificar una combinación compatible con esta versión de Foundry.</p>"}}
];
let folder=game.folders.find(f=>f.type==="JournalEntry"&&f.name==="00 · Acceso a Star Wars"&&!f.folder);
folder??=await Folder.create({name:"00 · Acceso a Star Wars",type:"JournalEntry",sorting:"a",color:"#b69351"});
let journal=game.journal.find(j=>j.flags?.starwarsffg?.libraryOrganization?.kind==="guide");
if(!journal)journal=await JournalEntry.create({name:"Biblioteca y estado de la instalación",folder:folder.id,ownership:{default:0},pages,flags:{starwarsffg:{libraryOrganization:{version:1,kind:"guide"}}}});
else for(const p of pages){const old=journal.pages.find(x=>x.name===p.name);if(old)await old.update({text:p.text});else await journal.createEmbeddedDocuments("JournalEntryPage",[p]);}
let macro=game.macros.find(m=>m.flags?.starwarsffg?.libraryOrganization?.kind==="open-library");
if(!macro)macro=await Macro.create({name:"Star Wars · Biblioteca por libros",type:"script",img:"icons/svg/book.svg",command:'game.swffgCampaigns.open("books");',ownership:{default:0},flags:{starwarsffg:{libraryOrganization:{version:1,kind:"open-library"}}}});
result.journal=journal.uuid;result.macro=macro.uuid;return result;
}
