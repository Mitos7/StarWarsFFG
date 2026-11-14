import test from 'node:test';
import assert from 'node:assert/strict';
let ready; let Adapter; const rolls=[];
globalThis.Hooks={once:(name,fn)=>{ready=fn;}};
globalThis.CONFIG={FFG:{characteristics:{Brawn:{label:'Brawn'}},skills:{Athletics:{label:'Athletics'}}},statusEffects:[{id:'stunned',name:'Stunned',img:'stunned.svg'}],controlIcons:{effects:'effects.svg'}};
globalThis.game={i18n:{localize:k=>k},modules:new Map([['materialdeck-starwarsffg',{version:'test'}]]),materialDeck:{registerSystem:entry=>{Adapter=entry.system;}},ffg:{DiceHelpers:{rollSkillDirect:(...args)=>rolls.push(args)}}};
await import('../../addons/patches/materialdeck-starwarsffg/materialdeck-starwarsffg.js');ready();
const adapter=new Adapter();
test('Material Deck reads actual Star Wars resources and characteristics without Starfinder config',()=>{
 const actor={type:'nemesis',system:{stats:{wounds:{value:3,max:14},strain:{value:2,max:11},defencemelee:{value:1}},characteristics:{Brawn:{value:3}},skills:{Athletics:{rank:2}}}};
 assert.deepEqual(adapter.getHP({actor}),{value:3,max:14});assert.deepEqual(adapter.getStrain({actor}),{value:2,max:11});assert.equal(adapter.getDefenseMelee({actor}),1);assert.equal(adapter.getAbility({actor}),3);assert.equal(adapter.getSkill({actor}),2);
 const vehicle={type:'vehicle',system:{stats:{hullTrauma:{value:7,max:30},systemStrain:{value:4,max:18}}}};
 assert.deepEqual(adapter.getHP({actor:vehicle}),{value:7,max:30});assert.deepEqual(adapter.getStrain({actor:vehicle}),{value:4,max:18});
 assert.equal(adapter.getAbilityList()[0].value,'Brawn');assert.deepEqual(adapter.getSavesList(),[]);
});
test('removing status conditions preserves equipment and talent effects',async()=>{
 const deleted=[];const actor={isOwner:true,effects:[{id:'status',statuses:new Set(['stunned'])},{id:'armour',statuses:new Set()}],deleteEmbeddedDocuments:async(type,ids)=>deleted.push(...ids)};
 await adapter.toggleCondition({actor},'removeAll');assert.deepEqual(deleted,['status']);
 actor.isOwner=false;await adapter.toggleCondition({actor},'removeAll');assert.deepEqual(deleted,['status']);
});
test('skill rolls use the selected synthetic actor and native FFG roll builder',async()=>{
 const skill={rank:4,characteristic:'Brawn',label:'Athletics'},sheet={actor:{name:'Synthetic'}};
 const actor={isOwner:true,system:{skills:{Athletics:skill},characteristics:{Brawn:{value:3}}},sheet:{getData:async()=>sheet}};
 await adapter.roll({actor},'skill',{},'Brawn','Athletics');assert.equal(rolls.at(-1)[0],skill);assert.equal(rolls.at(-1)[3],sheet);
});
