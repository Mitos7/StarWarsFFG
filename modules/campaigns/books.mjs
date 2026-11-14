export const LINE_LABELS = {
  eote: "Al Filo del Imperio · Edge of the Empire",
  aor: "La Era de la Rebelión · Age of Rebellion",
  fad: "La Fuerza y el Destino · Force and Destiny",
  shared: "Épocas y recopilaciones compartidas",
  legacy: "Ediciones beta · referencia histórica",
  fan: "Material fan y ejemplos",
  homebrew: "Mi campaña homebrew",
  tools: "Modificadores y recursos compartidos",
  unknown: "Pendiente de identificar"
};

const rows = [
  ["eote","eote","Edge of the Empire Core Rulebook","Básico · Al Filo del Imperio"],
  ["eotebg","eote","Edge of the Empire Beginner Game","Caja de inicio"],
  ["eotegm","eote","Edge of the Empire Game Master's Kit","Pantalla y ayuda del director"],
  ["etu","eote","Enter the Unknown","Exploradores"],
  ["dc","eote","Dangerous Covenants","Soldados a sueldo"],
  ["fh","eote","Far Horizons","Colonos"],
  ["fc","eote","Fly Casual","Contrabandistas"],
  ["sm","eote","Special Modifications","Técnicos y fabricación"],
  ["nd","eote","No Disintegrations","Cazarrecompensas"],
  ["sof","eote","Suns of Fortune","Sector Corelliano"],
  ["lonh","eote","Lords of Nal Hutta","Espacio Hutt"],
  ["btr","eote","Beyond the Rim","Aventura"],
  ["joy","eote","The Jewel of Yavin","Aventura"],
  ["mpq","eote","Mask of the Pirate Queen","Aventura"],
  ["lah","eote","Long Arm of the Hutt","Aventura de continuación"],
  ["uabs","eote","Under a Black Sun","Aventura introductoria"],
  ["aor","aor","Age of Rebellion Core Rulebook","Básico · La Era de la Rebelión"],
  ["aorbg","aor","Age of Rebellion Beginner Game","Caja de inicio"],
  ["aorgm","aor","Age of Rebellion Game Master's Kit","Pantalla y ayuda del director"],
  ["sot","aor","Stay on Target","Ases y pilotos"],
  ["da","aor","Desperate Allies","Diplomáticos"],
  ["lbe","aor","Lead by Example","Comandantes"],
  ["fib","aor","Forged in Battle","Soldados"],
  ["fo","aor","Fully Operational","Ingenieros"],
  ["cam","aor","Cyphers and Masks","Espías"],
  ["sor","aor","Strongholds of Resistance","Mundos de la Alianza"],
  ["oaa","aor","Onslaught at Arda I","Aventura"],
  ["flt","aor","Friends Like These","Aventura"],
  ["osp","aor","Operation Shadowpoint","Aventura de continuación"],
  ["ragp","aor","Rescue at Glare Peak","Aventura introductoria"],
  ["fad","fad","Force and Destiny Core Rulebook","Básico · La Fuerza y el Destino"],
  ["fadbg","fad","Force and Destiny Beginner Game","Caja de inicio"],
  ["fadgm","fad","Force and Destiny Game Master's Kit","Pantalla y ayuda del director"],
  ["ktp","fad","Keeping the Peace","Guardianes"],
  ["ev","fad","Endless Vigil","Centinelas"],
  ["ss","fad","Savage Spirits","Buscadores"],
  ["up","fad","Unlimited Power","Místicos"],
  ["kof","fad","Knights of Fate","Guerreros"],
  ["doh","fad","Disciples of Harmony","Cónsules"],
  ["nop","fad","Nexus of Power","Lugares vinculados a la Fuerza"],
  ["cotg","fad","Chronicles of the Gatekeeper","Aventura"],
  ["god","fad","Ghosts of Dathomir","Aventura"],
  ["lotl","fad","Lure of the Lost","Aventura de continuación"],
  ["dor","shared","Dawn of Rebellion","Primeros años de la Rebelión"],
  ["rots","shared","Rise of the Separatists","Comienzos de las Guerras Clon"],
  ["cor","shared","Collapse of the Republic","Final de las Guerras Clon"],
  ["aaa","shared","Allies and Adversaries","Personajes y adversarios"],
  ["gag","shared","Gadgets and Gear","Equipo, armas y accesorios"],
  ["sas","shared","Starships and Speeders","Naves y vehículos"],
  ["tfabg","shared","The Force Awakens Beginner Game","Caja de inicio"],
  ["acfh","shared","A Call for Heroes","Aventura de continuación"],
  ["eotebeta","legacy","Edge of the Empire Beta Rulebook","Edición beta"],
  ["aorbeta","legacy","Age of Rebellion Beta Rulebook","Edición beta"],
  ["fadbeta","legacy","Force and Destiny Beta Rulebook","Edición beta"],
  ["usm","fan","Unofficial Species Menagerie","Suplemento fan"],
  ["fan-demo","fan","Ejemplos y adaptaciones fan de demostración","No son datos oficiales de los libros"],
  ["homebrew","homebrew","Homebrew de Mitos · historia propia","Personajes, equipo y relatos creados para tu campaña"],
  ["oggdude-descriptors","tools","OggDude — ItemDescriptors.xml","Modificadores reutilizables; vinculados a los libros de los objetos que los usan"],
  ["unknown","unknown","Sin fuente identificada","No se atribuye un libro por semejanza"]
];
export const BOOKS = rows.map(([id,line,title,detail]) => ({id,line,title,detail}));
export function normalizeSource(source) {
  return String(source ?? "").trim().replace(/\s+(?:pg\.?|pág\.?|page[s]?|p\.)\s*\d.*$/iu, "").replace(/\s+/g," ").toLowerCase();
}
const aliases = new Map(BOOKS.flatMap(b => [[normalizeSource(b.title),b.id],[`book:${b.id}`,b.id]]));
for (const [alias,id] of [["Jewel of Yavin","joy"],["The Long Arm of the Hutt","lah"],["Force Awakens Beginner Game","tfabg"],["Al Filo del Imperio","eote"],["La Era de la Rebelión","aor"],["La Fuerza y el Destino","fad"]]) aliases.set(normalizeSource(alias),id);
export function bookIdForSource(source) {
  const normalized=normalizeSource(source);
  return aliases.get(normalized) ?? (normalized ? `unclassified:${normalized}` : "unknown");
}
const decodeText = text => String(text).replace(/<br\s*\/?>/gi,"\n").replace(/<[^>]*>/g,"").replace(/&(?:amp|quot|apos|lt|gt|nbsp);|&#(?:x[\da-f]+|\d+);/gi,entity=>{
  const named={"&amp;":"&","&quot;":'"',"&apos;":"'","&lt;":"<","&gt;":">","&nbsp;":" "};
  if(named[entity.toLowerCase()])return named[entity.toLowerCase()];
  const value=entity.toLowerCase().startsWith("&#x")?parseInt(entity.slice(3),16):parseInt(entity.slice(2),10);
  return value>=0&&value<=0x10ffff?String.fromCodePoint(value):entity;
});
/** Recover explicit import citations only; mentioning a book in ordinary prose is not attribution. */
export function sourcesFromDescription(description="") {
  const html=String(description),sources=[];
  for(const block of html.matchAll(/<h3\b[^>]*>\s*Sources\s*:\s*<\/h3>([\s\S]*?)(?:<\/p>|<h[1-6]\b|$)/gi)) {
    for(const raw of decodeText(block[1]).split(/\r?\n/)){
      const line=raw.trim();if(!line||line==="[object Object]")continue;
      const page=line.match(/^Page\s+(\d+(?:[-–]\d+)?)\s*-\s*(.+)$/i);
      sources.push(page?`${page[2].trim()} pg.${page[1]}`:line);
    }
  }
  const text=decodeText(html).trim();
  if(/(?:^|\n)\s*(?:please\s+)?see\b[^\n]*\bpage\s+\d/i.test(text)){
    for(const book of BOOKS.filter(b=>!["homebrew","unknown","fan"].includes(b.line))){
      const title=book.title.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      const pattern=new RegExp(`page\\s+(\\d+(?:[-–]\\d+)?)\\s+of\\s+(?:the\\s+)?${title}(?=\\s|[.,;]|$)`,"gi");
      for(const match of text.matchAll(pattern))sources.push(`${book.title} pg.${match[1]}`);
    }
  }
  return [...new Set(sources)];
}
export function entryBookIds(entry) {
  if (entry.pack?.startsWith("world.mitos-homebrew-") || entry.homebrew) return ["homebrew"];
  if (entry.pack?.startsWith("starwarsffg.sw-") || entry.pack?.startsWith("swffg-mitos-starter.")) return ["fan-demo"];
  const sources = Array.isArray(entry.sources) ? entry.sources : [];
  const tags = (Array.isArray(entry.tags) ? entry.tags : []).filter(t=>String(t).startsWith("book:"));
  const related=(entry.relatedBooks??[]).filter(id=>BOOKS.some(b=>b.id===id));
  const ids = [...new Set([...sources,...tags].filter(s=>typeof s==="string"&&s.trim()).map(bookIdForSource).concat(related))];
  return ids.length ? ids : ["unknown"];
}
export function catalogueBooks(entries) {
  const map = new Map(BOOKS.map(b=>[b.id,{...b,count:0}]));
  for (const entry of entries) for (const id of new Set(entry.books??entryBookIds(entry))) {
    if(!map.has(id)) map.set(id,{id,line:"unknown",title:id.replace(/^unclassified:/,""),detail:"Referencia sin clasificar; se conserva su texto original",count:0});
    map.get(id).count++;
  }
  return [...map.values()];
}
export function filterEntries(entries, {selected=["*"],book="",line="",type="",search="",includeFan=false}={}) {
  const chosen=new Set(selected),term=String(search).trim().toLocaleLowerCase();
  const lines=new Map(BOOKS.map(b=>[b.id,b.line]));
  return entries.filter(e=>{
    const ids=e.books??entryBookIds(e);
    if(!includeFan&&ids.every(id=>lines.get(id)==="fan"))return false;
    if(!chosen.has("*")&&!ids.some(id=>chosen.has(id)))return false;
    if(book&&!ids.includes(book))return false;
    if(line&&!ids.some(id=>(lines.get(id)??"unknown")===line))return false;
    if(type&&e.type!==type&&e.documentName!==type)return false;
    return !term||[e.name,e.packLabel,...(e.sources??[])].some(x=>String(x).toLocaleLowerCase().includes(term));
  });
}
