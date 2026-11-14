import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const index=JSON.parse(fs.readFileSync(new URL('../../addons/patches/index.json',import.meta.url)));
const patch=index.modules.find(m=>m.id==='starwars-silhouette').files[0];
const source=patch.upgrade_replacements.map(r=>r.new).join('\n');
function fixture(enabled,ratio=4,isGM=true){
 const context=vm.createContext({game:{user:{isGM},settings:{get:(_m,k)=>k==='autoScaling'?enabled:ratio}}});
 vm.runInContext(source,context);return context;
}
function vehicle(size,silhouette){
 const updates=[];
 return {type:'vehicle',prototypeToken:{height:size,width:size},system:{stats:{silhouette:{value:silhouette}}},updates,
  async update(data){await Promise.resolve();updates.push(data);this.prototypeToken={height:data['prototypeToken.height'],width:data['prototypeToken.width']};}};
}
test('disabled scaling and player clients preserve configured vehicle token sizes',async()=>{
 for(const context of [fixture(false),fixture(true,4,false)]){
  const a=vehicle(6,4);assert.equal(await context.changeScaleOnSilhouette([a]),0);
  assert.equal(a.prototypeToken.width,6);assert.equal(a.updates.length,0);
 }
});
test('enabled scaling awaits one atomic update per changed vehicle and is idempotent',async()=>{
 const context=fixture(true),fighter=vehicle(1,3),destroyer=vehicle(1,9);
 assert.equal(await context.changeScaleOnSilhouette([fighter,destroyer]),1);
 assert.equal(fighter.updates.length,0);assert.equal(destroyer.prototypeToken.height,6);
 assert.deepEqual(Object.keys(destroyer.updates[0]).sort(),['prototypeToken.height','prototypeToken.width']);
 assert.equal(await context.changeScaleOnSilhouette([fighter,destroyer]),0);
 assert.equal(destroyer.updates.length,1);
});
test('invalid import data cannot produce NaN or infinite token dimensions',async()=>{
 const context=fixture(true,0),valid=vehicle(3,'4'),invalid=vehicle(5,'unknown');
 assert.equal(await context.changeScaleOnSilhouette([valid,invalid,{type:'rival'}]),1);
 assert.equal(valid.prototypeToken.width,2);assert.equal(invalid.prototypeToken.width,5);
});
