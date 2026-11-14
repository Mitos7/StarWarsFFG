import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../../modules/helpers/dice-helpers.js',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('export function get_dice_pool')).replace('export function','function');
const stats={skills:{Custom:{rank:3,characteristic:'Brawn',remsetback:2}},characteristics:{Brawn:{value:4}}};
const world={system:{skills:{Custom:{rank:0,characteristic:'Brawn'}},characteristics:{Brawn:{value:1}}}};
const context=vm.createContext({game:{actors:new Map([['shared',world]])},DicePoolFFG:class{constructor(data){Object.assign(this,data);}}});
vm.runInContext(fn,context);
test('dice pool resolves a synthetic actor separately from its world actor with the same ID',()=>{
 const incoming=Object.fromEntries(['ability','proficiency','boost','setback','force','advantage','dark','light','failure','threat','success','triumph','despair','upgrades','remsetback','difficulty','challenge'].map(k=>[k,0]));incoming.remsetback=1;
 const synthetic={id:'shared',system:stats};const pool=context.get_dice_pool(synthetic,'Custom',incoming);
 assert.equal(pool.ability,1);assert.equal(pool.proficiency,3);assert.equal(pool.remsetback,3);
 const base=context.get_dice_pool('shared','Custom',incoming);assert.equal(base.ability,1);assert.equal(base.proficiency,0);
});
