import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {normalizedModifierSystem,appendMissingModifiers} from "../../modules/campaigns/source-review.mjs";
import {BOOKS,bookIdForSource} from "../../modules/campaigns/books.mjs";

test("vehicle conversion preserves text, attributes and source metadata while removing accessory defaults",()=>{
 const original={description:"Special rule",attributes:{x:{value:2}},hardpoints:{value:0},price:{value:0},metadata:{sources:["known"],tags:["vehicle"]}};
 const system=normalizedModifierSystem(original,{modifierType:"vehicle"});
 assert.equal(system.type,"vehicle");assert.equal(system.rank,1);assert.equal(system.hardpoints,undefined);
 assert.deepEqual(system.attributes,original.attributes);assert.deepEqual(system.metadata,original.metadata);
 system.attributes.x.value=5;assert.equal(original.attributes.x.value,2);
});

test("restoring options is idempotent and preserves installed user modifications",()=>{
 const existing=[{name:"Custom",flags:{starwarsffg:{ffgimportid:"CUSTOM"}},system:{active:true,rank:3}}];
 const descriptors=new Map([["SPEEDADD",{_id:"source",name:"Speed",type:"itemmodifier",flags:{starwarsffg:{ffgimportid:"SPEEDADD"}},system:{type:"vehicle",rank:1},effects:[]}]]);
 const refs=[{Key:"SPEEDADD",Count:"2"}];
 const first=appendMissingModifiers(existing,refs,descriptors);
 assert.equal(first.items.length,2);assert.equal(first.items[0].system.active,true);assert.equal(first.items[1].system.active,false);
 assert.equal(first.items[1].system.rank,2);assert.equal(first.items[1]._id,undefined);assert.equal(existing.length,1);
 assert.deepEqual(appendMissingModifiers(first.items,refs,descriptors).added,[]);
 assert.throws(()=>appendMissingModifiers([], [{Key:"MISSING"}],descriptors),/no encontrado/);
});

test("reviewed inventory accounts for every unidentified entry without inventing official sources",()=>{
 const data=JSON.parse(readFileSync(new URL("../../modules/campaigns/data/source-repairs-20261114.json",import.meta.url)));
 const ids=new Set(BOOKS.map(b=>b.id));
 assert.equal(data.documents.length,232);assert.equal(data.remove.length,7);
 assert.equal(data.documents.filter(d=>d.kind==="book").length,46);
 assert.equal(data.documents.filter(d=>d.kind==="descriptor").length,186);
 for(const doc of data.documents){assert.ok(doc.provenance.file&&doc.provenance.key);for(const source of doc.sources)assert.ok(ids.has(bookIdForSource(source)),source);for(const id of doc.relatedBooks)assert.ok(doc.related.some(e=>e.book===id));}
 assert.ok(data.remove.every(d=>/^GENERIC[0-6]$/.test(d.key)&&d.pack==="world.oggdudegear"));
});
