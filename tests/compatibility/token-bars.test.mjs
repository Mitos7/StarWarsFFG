import test from "node:test";
import assert from "node:assert/strict";
const getProperty = (o, p) => p?.split(".").reduce((v, k) => v?.[k], o);
globalThis.foundry = {utils:{getProperty},documents:{TokenDocument:class {
  getBarAttribute(name, options={}) {
    const attribute=options.alternative || this[name]?.attribute;
    const data=getProperty(this.actor?.system,attribute);
    return data && typeof data==="object" && "max" in data
      ? {type:"bar",attribute,value:data.value,max:data.max,editable:false} : null;
  }
}}};
const {TokenDocumentFFG}=await import("../../modules/tokens/token-document-ffg.js");
function token(type="nemesis") {
  const t=new TokenDocumentFFG();
  const stats={wounds:{value:2,max:14},strain:{value:1,max:11},hullTrauma:{value:3,max:25},systemStrain:{value:4,max:17}};
  t.actor={type,system:{stats},_source:{system:{stats:structuredClone(stats)}}};
  t.bar1={attribute:"wounds"};t.bar2={attribute:"strain"};return t;
}
test("legacy character bars resolve to editable persistent wounds and strain",()=>{
  const t=token();assert.deepEqual(t.getBarAttribute("bar1"),{type:"bar",attribute:"stats.wounds",value:2,max:14,editable:true});
  assert.equal(t.getBarAttribute("bar2").attribute,"stats.strain");
});
test("legacy vehicle bars use hull trauma and system strain",()=>{
  const t=token("vehicle");assert.equal(t.getBarAttribute("bar1").max,25);
  assert.equal(t.getBarAttribute("bar2").attribute,"stats.systemStrain");
  assert.equal(t.getBarAttribute("bar2").editable,true);
});
test("explicit alternatives preserve unrelated and nonpersistent read-only fields",()=>{
  const t=token();t.actor.system.stats.custom={value:7,max:9};
  assert.equal(t.getBarAttribute("bar1",{alternative:"stats.custom"}).editable,false);
  delete t.actor._source.system.stats.wounds;
  assert.equal(t.getBarAttribute("bar1").editable,false);
});
test("unresolved resources and missing actors stay null",()=>{
  const t=token();assert.equal(t.getBarAttribute("bar1",{alternative:"stats.unknown"}),null);
  t.actor=null;assert.equal(t.getBarAttribute("bar1"),null);
});
