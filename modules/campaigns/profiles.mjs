export const NAMESPACE="starwarsffg";
export const PROFILES=[
 {id:"custom",name:"Personalizada · escoger libros",books:["*"],summary:"Selecciona las fuentes de tu biblioteca una a una."},
 {id:"recommended",name:"Recomendada · aventura Star Wars completa",books:["eote","aor","fad","aaa","gag","sas"],summary:"Los tres manuales básicos y las recopilaciones de personajes, equipo y naves. Permite combinar exploración, conflictos galácticos y Fuerza. Las reglas de Obligación, Deber y Moralidad se eligen según la campaña."},
 {id:"outer-rim",name:"Borde Exterior · exploración y bajos fondos",books:["eote","etu","fc","nd","sm","sof","lonh","aaa","gag","sas"],summary:"Contrabando, cazarrecompensas, exploración, tecnología y facciones criminales."},
 {id:"rebellion",name:"Rebelión · espionaje y guerra",books:["aor","cam","lbe","fib","fo","sot","da","sor","dor","aaa","gag","sas"],summary:"Espionaje, comandos, diplomacia y operaciones de la Alianza. Dawn of Rebellion aporta contexto para sus primeros años."},
 {id:"force",name:"La Fuerza · misterios y legado Jedi",books:["fad","eote","ev","doh","up","kof","ktp","ss","nop","aaa","gag","sas"],summary:"Investigación de secretos de la Fuerza, desarrollo de personajes y viajes. Las aventuras publicadas se eligen por separado."},
 {id:"clone-wars",name:"Guerras Clon · República y Separatistas",books:["aor","fad","rots","cor","fo","fib","sot","aaa","gag","sas"],summary:"Bases de Rebelión y Fuerza con los dos suplementos de las Guerras Clon. La disponibilidad tecnológica depende de la época."},
 {id:"homebrew",name:"Mitos · historia propia / homebrew",books:["eote","aor","fad","aaa","gag","sas","homebrew"],summary:"Base flexible para una historia creada por ti. Época, protagonistas, facciones, canon y reglas caseras quedan en tus manos; no se importa una trama publicada."}
];
export const RECOMMENDED_MODULES=["lib-wrapper","socketlib","colorsettings","babele","statuscounter","dice-so-nice","lordudice","tokenizer-2","fxmaster","ffg-star-wars-enhancements","ffg-star-wars-alternative-ui","space-op-ui","ffg-star-wars-hud-enhancements","lgs-extra-fields-for-star-wars","token-action-hud-core","token-action-hud-ffgsw","swrpg-dice-helper-compendium","swgalaxy-map","image-hover"];
export const REVIEWED_VERSIONS={
 "babele":["2.9.1"],"colorsettings":["3.0.4"],"dice-so-nice":["6.4.4"],"ffg-star-wars-alternative-ui":["12.6.2.1_905"],"ffg-star-wars-enhancements":["3.2.1"],"ffg-star-wars-hud-enhancements":["1.0.1-mitos.1"],"fxmaster":["8.4.1"],"image-hover":["3.2"],"lgs-extra-fields-for-star-wars":["1.0.3-mitos.1"],"lib-wrapper":["1.13.5.1"],"lordudice":["0.43"],"socketlib":["v1.1.4"],"space-op-ui":["13.2"],"statuscounter":["3.1.3"],"swgalaxy-map":["0.1.0-mitos.1"],"swrpg-dice-helper-compendium":["1.1.4-mitos.1"],"token-action-hud-core":["2.1.2"],"token-action-hud-ffgsw":["13.0.0.2_0_3-mitos.1"],"tokenizer-2":["2.1.0"]
};
export function planModules(installed,current={},runtime={foundry:"14.369",system:"2.0.5-mitos.14"}) {
 const byId=new Map(installed.map(m=>[m.id,m])),issues=[],enable=[];
 if(runtime.foundry!=="14.369"||runtime.system!=="2.0.5-mitos.14")issues.push("Este conjunto se revisó con Foundry 14.369 y StarWarsFFG 2.0.5-mitos.14; esta instalación necesita otra comprobación.");
 for(const id of RECOMMENDED_MODULES){const m=byId.get(id);if(!m){issues.push(`Falta ${id}.`);continue;}if(!REVIEWED_VERSIONS[id]?.includes(m.version)){issues.push(`${m.title??id}: versión ${m.version}, pendiente de revisar.`);continue;}if(!current[id])enable.push(id);}
 const disable=["swffgUI-cc","token-action-hud"].filter(id=>current[id]);
 const configuration={...current};for(const id of enable)configuration[id]=true;for(const id of disable)configuration[id]=false;
 return {enable,disable,issues,configuration,changed:enable.length+disable.length>0};
}
export function escapeHTML(text){return String(text??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
export function cleanCampaign(input={}) {
 const allowed=["title","era","canon","tone","premise","previousStory","houseRules"];
 const out=Object.fromEntries(allowed.map(k=>[k,String(input[k]??"").trim().slice(0,k==="title"?120:12000)]));
 out.title ||= "Star Wars · Historia de Mitos";out.canon ||= "Por definir";return out;
}
