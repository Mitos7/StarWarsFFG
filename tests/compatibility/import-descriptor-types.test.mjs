import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

test("OggDude descriptors import as reusable modifiers with normalized armor targeting",async()=>{
 const saved=[];
 const progress={toggleClass(){return this;},width(){return this;},html(){return this;}};
 const context={JXON:{xmlToJs:()=>({ItemDescriptors:{ItemDescriptor:[{Key:"SPEEDADD",Name:"Speed",Type:"Vehicle",ModDesc:"Speed +1"},{Key:"SOAKADD",Name:"Soak",Type:"Armor",ModDesc:"Soak +1"},{Key:"FORCEADD",Name:"Force",ModDesc:"Force +1"}]}})},CONFIG:{logger:{debug(){},error(e){throw e;}}},$:()=>progress,foundry:{utils:{mergeObject:Object.assign}},ImportHelpers:{asyncForEach:async(a,f)=>{for(const v of a)await f(v);},getCompendiumPack:async(t,id)=>id,prepareBaseObject:(o,type)=>({name:o.Name,type}),cleanDescription:s=>s,getSourcesAsArray:()=>[],processMods:async()=>null,processDiceMods:async()=>null,addImportItemToCompendium:async(t,d,p)=>saved.push({d,p})}};
 const code=readFileSync(new URL("../../modules/importer/oggdude/importers/item-descriptors.js",import.meta.url),"utf8").replace(/^import[^;]+;\s*/m,"").replace("export default class ItemDescriptors","class ItemDescriptors");
 vm.runInNewContext(code+";globalThis.Importer=ItemDescriptors;",context);
 await context.Importer.Import(null);
 assert.equal(saved.length,3);assert.ok(saved.every(x=>x.d.type==="itemmodifier"));
 assert.equal(saved[0].d.data.type,"vehicle");assert.equal(saved[1].d.data.type,"armour");assert.equal(saved[2].d.data.type,"all");
 assert.equal(saved[1].p,"oggdude.ArmorMods");assert.equal(saved[2].p,"oggdude.GenericMods");
 assert.ok(saved.every(x=>x.d.data.metadata.sources.includes("OggDude — ItemDescriptors.xml")));
});

test("modifier lookup cannot resolve an equipment item with the same OggDude key",async()=>{
 const context={structuredClone,CONFIG:{temporary:{skills:{}},logger:{warn(){}}},foundry:{utils:{duplicate:structuredClone,randomID:()=>"new-id"}},game:{i18n:{localize:s=>s}}};
 const code=readFileSync(new URL("../../modules/importer/import-helpers.js",import.meta.url),"utf8").replace(/^import[^;]+;\s*/gm,"").replace("export default class ImportHelpers","class ImportHelpers");
 vm.runInNewContext(code+";globalThis.Helpers=ImportHelpers;",context);
 context.Helpers.findCompendiumEntityByImportId=async(type,key,pack,subtype)=>subtype==="itemmodifier"?{type:"itemmodifier",name:"Demon Mask modifier",system:{description:"modifier",rank:1}}:{type:"gear",name:"Demon Mask equipment"};
 const result=await context.Helpers.processModsData({Mod:{Key:"DEMONMASK",Count:"2"}});
 assert.equal(result.itemmodifier.length,1);assert.equal(result.itemmodifier[0].system.rank,2);
});
