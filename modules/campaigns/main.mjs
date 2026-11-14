import {CampaignManager,clearCampaignIndex,loadCampaignIndex} from "./manager.mjs";
import {NAMESPACE,PROFILES,cleanCampaign} from "./profiles.mjs";
import {createHomebrewWorkspace} from "./workspace.mjs";

export function registerCampaignOptions(){
 if(game.settings.settings.has(`${NAMESPACE}.campaignProfile`))return;
 game.settings.register(NAMESPACE,"campaignBooks",{scope:"world",config:false,type:Array,default:["*"]});
 game.settings.register(NAMESPACE,"campaignDraft",{scope:"world",config:false,type:Object,default:cleanCampaign()});
 game.settings.register(NAMESPACE,"campaignWorkspace",{scope:"world",config:false,type:Object,default:{}});
 game.settings.register(NAMESPACE,"campaignModuleBackup",{scope:"world",config:false,type:Object,default:{}});
 game.settings.register(NAMESPACE,"campaignProfile",{name:"Combinación de libros y campaña",hint:"Selecciona una combinación o «Mitos · historia propia / homebrew». Filtra la biblioteca de campaña; los módulos se revisan y aplican desde el gestor.",scope:"world",config:true,type:String,choices:Object.fromEntries(PROFILES.map(p=>[p.id,p.name])),default:"custom",onChange:async value=>{const p=PROFILES.find(p=>p.id===value);if(game.user.isGM&&p&&p.id!=="custom")await game.settings.set(NAMESPACE,"campaignBooks",p.books);}});
 game.settings.registerMenu(NAMESPACE,"campaignManager",{name:"Libros, combinaciones y campaña homebrew",label:"Abrir biblioteca y opciones",hint:"Agrupa las fichas por libro, revisa módulos y prepara tu historia de Star Wars.",icon:"fas fa-book-open-reader",type:CampaignManager,restricted:true});
 game.swffgCampaigns={open:section=>new CampaignManager({section}).render(true),refresh:clearCampaignIndex,index:loadCampaignIndex,createHomebrew:createHomebrewWorkspace};
 if(!document.getElementById("swffg-campaign-style")){const link=document.createElement("link");link.id="swffg-campaign-style";link.rel="stylesheet";link.href="systems/starwarsffg/styles/campaign-library.css";document.head.append(link);}
}
function addDirectoryButton(app,html){
 if(!game.user.isGM)return;const root=html instanceof HTMLElement?html:html?.[0];if(!root||root.querySelector('[data-swffg-campaign-button]'))return;
 const button=document.createElement("button");button.type="button";button.dataset.swffgCampaignButton="true";button.innerHTML='<i class="fas fa-book-open-reader"></i> Libros y mi campaña';button.addEventListener("click",()=>game.swffgCampaigns.open("books"));
 (root.querySelector(".header-actions")??root.querySelector(".directory-header")??root).prepend(button);
}
Hooks.once("init",registerCampaignOptions);
Hooks.on("renderCompendiumDirectory",addDirectoryButton);
Hooks.on("createItem",clearCampaignIndex);Hooks.on("updateItem",clearCampaignIndex);Hooks.on("deleteItem",clearCampaignIndex);
Hooks.on("createActor",clearCampaignIndex);Hooks.on("updateActor",clearCampaignIndex);Hooks.on("deleteActor",clearCampaignIndex);
Hooks.on("createJournalEntry",clearCampaignIndex);Hooks.on("updateJournalEntry",clearCampaignIndex);Hooks.on("deleteJournalEntry",clearCampaignIndex);
for(const type of ["Scene","RollTable","Folder"])for(const event of ["create","update","delete"])Hooks.on(`${event}${type}`,clearCampaignIndex);
Hooks.on("updateCompendium",clearCampaignIndex);
