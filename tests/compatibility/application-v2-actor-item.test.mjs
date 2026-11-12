import test from "node:test";
import assert from "node:assert/strict";
class AppV2 { async _prepareContext(){return {}} }
class ActorSheetV2 extends AppV2 {}
class ItemSheetV2 extends AppV2 {}
const registered=[];
globalThis.foundry = {
  applications: {
    api: {HandlebarsApplicationMixin: Base => class extends Base {}},
    sheets: {ActorSheetV2,ItemSheetV2},
    apps: {DocumentSheetConfig: {registerSheet:(documentType,namespace,cls,options)=>registered.push({documentType,namespace,cls,options})}}
  }
};
globalThis.Actor=class Actor{};
globalThis.Item=class Item{};
globalThis.game={i18n:{has:()=>false,localize:x=>x}};
const {ActorSheetFFGAppV2,registerExperimentalActorSheet}=await import("../../modules/actors/actor-sheet-ffg-appv2.js");
const {ItemSheetFFGAppV2,registerExperimentalItemSheet}=await import("../../modules/items/item-sheet-ffg-appv2.js");

test("new actor/item sheets inherit native Foundry ApplicationV2 classes, not legacy sheets",()=>{
  assert.ok(ActorSheetFFGAppV2.prototype instanceof ActorSheetV2);
  assert.ok(ItemSheetFFGAppV2.prototype instanceof ItemSheetV2);
  assert.equal(ActorSheetFFGAppV2.DEFAULT_OPTIONS.tag,"form");
  assert.equal(ItemSheetFFGAppV2.DEFAULT_OPTIONS.tag,"form");
  registerExperimentalActorSheet();registerExperimentalItemSheet();
  assert.equal(registered.length,2);
  assert.deepEqual(registered.map(r=>r.options.makeDefault),[false,false]);
  assert.equal(registered[0].documentType,Actor);
  assert.equal(registered[1].documentType,Item);
});

test("actor context exposes characteristics, skills, resources, and inventory without legacy sheet",async()=>{
  const instance=Object.create(ActorSheetFFGAppV2.prototype);
  instance.isEditable=true;
  instance.document={
    type:"character",name:"Test",img:"test.webp",
    system:{characteristics:{Brawn:{label:"Brawn",value:3}},
      stats:{wounds:{value:2,max:12},strain:{value:1,max:10},soak:{value:4},credits:{value:350}},
      skills:{Computers:{rank:2,characteristic:"Intellect"}}},
    items:{contents:[{id:"id1",name:"Datapad",type:"gear",img:"datapad.webp"}]}
  };
  const data=await instance._prepareContext({});
  assert.equal(data.characteristics[0].value,3);
  assert.equal(data.skills[0].rank,2);
  assert.equal(data.stats[0].value,2);
  assert.equal(data.items[0].name,"Datapad");
});

test("item context prepares editable fields and writes updates via document",async()=>{
  const item={name:"Blaster",type:"weapon",img:"w.webp",system:{damage:{value:5,label:"Damage"},range:{value:"Short",label:"Range"}}};
  const instance=Object.create(ItemSheetFFGAppV2.prototype);
  instance.isEditable=true;instance.document=item;
  const data=await instance._prepareContext({});
  assert.equal(data.fields.length,4);
  assert.equal(data.fields[0].number,true);
  let result;
  instance.document.update=async object=>{result=object;};
  await ItemSheetFFGAppV2.DEFAULT_OPTIONS.form.handler.call(instance,null,null,{object:{"system.damage.value":6}});
  assert.deepEqual(result,{"system.damage.value":6});
});

test("native actor actions operate on embedded documents without an ApplicationV1 sheet",async()=>{
  const calls=[];
  globalThis.game.ffg={DiceHelpers:{
    rollSkillDirect:async(...args)=>calls.push(["skill",...args]),
    rollItem:async(...args)=>calls.push(["weapon",...args])
  }};
  const weapon={id:"weapon1",type:"weapon",system:{equippable:{equipped:false},quantity:{value:2}},update:async change=>calls.push(["update",change])};
  const actor={id:"actor1",system:{characteristics:{Brawn:{value:3}},skills:{Brawl:{rank:2,characteristic:"Brawn"}}},items:{get:id=>id==="weapon1"?weapon:null},toObject:()=>({_id:"actor1"})};
  const instance=Object.create(ActorSheetFFGAppV2.prototype); instance.isEditable=true; instance.document=actor;
  await instance._rollSkill("Brawl"); await instance._rollWeapon("weapon1");
  await instance._toggleEquipped("weapon1"); await instance._changeQuantity("weapon1",-1);
  assert.equal(calls[0][0],"skill"); assert.deepEqual(calls[1],["weapon","weapon1","actor1"]);
  assert.deepEqual(calls[2],["update",{"system.equippable.equipped":true}]);
  assert.deepEqual(calls[3],["update",{"system.quantity.value":1}]);
});

test("native item drop installs a compatible modifier and transfers its effects",async()=>{
  globalThis.foundry.utils={deepClone:value=>structuredClone(value)};
  const updates=[],effects=[];
  const target={type:"weapon",system:{itemmodifier:[],hardpoints:{adjusted:2}},update:async update=>updates.push(update),createEmbeddedDocuments:async(type,data)=>effects.push([type,data])};
  const modifier={type:"itemmodifier",system:{type:"weapon",rank:1},toObject:()=>({name:"Accurate",system:{rank:1},effects:[{name:"Accurate effect"}]})};
  const instance=Object.create(ItemSheetFFGAppV2.prototype); instance.isEditable=true; instance.document=target;
  await instance._onDropItem({},modifier);
  assert.equal(updates[0]["system.itemmodifier"][0].name,"Accurate");
  assert.equal(effects[0][0],"ActiveEffect");
  assert.equal(effects[0][1][0].disabled,false);
});
