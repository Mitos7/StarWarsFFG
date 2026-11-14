import test from "node:test";
import assert from "node:assert/strict";
import {BOOKS, bookIdForSource, entryBookIds, catalogueBooks, filterEntries, sourcesFromDescription} from "../../modules/campaigns/books.mjs";
import {PROFILES, RECOMMENDED_MODULES, REVIEWED_VERSIONS, planModules, cleanCampaign, escapeHTML} from "../../modules/campaigns/profiles.mjs";

test("book references normalize page numbers, translated names and adversary book tags", () => {
  for (const source of ["Edge of the Empire Core Rulebook pg. 42", "  Edge of the Empire Core Rulebook  Pg 101 ", "Al Filo del Imperio", "book:eote"]) assert.equal(bookIdForSource(source), "eote");
  assert.equal(bookIdForSource("The Jewel of Yavin p. 24"), "joy");
  assert.equal(bookIdForSource("Unknown Supplement pg. 18"), "unclassified:unknown supplement");
});

test("multi-book entries retain every source and count once per book", () => {
  const entry={name:"Blaster",sources:["Edge of the Empire Core Rulebook pg. 10","Edge of the Empire Core Rulebook pg. 11","Age of Rebellion Core Rulebook pg. 9"],tags:["book:eote"]};
  assert.deepEqual(entryBookIds(entry),["eote","aor"]);
  const books=catalogueBooks([entry]);
  assert.equal(books.find(b=>b.id==="eote").count,1);
  assert.equal(books.find(b=>b.id==="aor").count,1);
  assert.equal(books.find(b=>b.id==="gag").count,0);
});

test("unknown, fan and homebrew sources cannot masquerade as official book content", () => {
  assert.deepEqual(entryBookIds({name:"Lightsaber"}),["unknown"]);
  assert.deepEqual(entryBookIds({pack:"starwarsffg.sw-gear",sources:["book:eote"]}),["fan-demo"]);
  assert.deepEqual(entryBookIds({pack:"swffg-mitos-starter.people"}),["fan-demo"]);
  assert.deepEqual(entryBookIds({pack:"world.mitos-homebrew-actors",sources:["book:eote"]}),["homebrew"]);
});

test("legacy attachment source footers recover exact book and page without parsing mod prose", () => {
  const html='<h3>Custom Grip</h3><p>Description.</p><p><h3>Sources:</h3>Page 54 - Special Modifications<br>Page 201 - Force and Destiny Core Rulebook<br></p><h3>Base Mods</h3><div>Other text</div>';
  assert.deepEqual(sourcesFromDescription(html),["Special Modifications pg.54","Force and Destiny Core Rulebook pg.201"]);
  assert.deepEqual(sourcesFromDescription('<h3>Sources:</h3>Page 9 - Test &amp; More<br>[object Object]<br></p>'),["Test & More pg.9"]);
});

test("journal page citations recover explicit references but ordinary book mentions do not", () => {
  const text='Please see page 116 of the Edge of the Empire Core Rulebook, page 128 of the Age of Rebellion Core Rulebook, or page 126 of the Force and Destiny Core Rulebook, for details.';
  assert.deepEqual(sourcesFromDescription(text),["Edge of the Empire Core Rulebook pg.116","Age of Rebellion Core Rulebook pg.128","Force and Destiny Core Rulebook pg.126"]);
  assert.deepEqual(sourcesFromDescription('A smuggler from Edge of the Empire Core Rulebook'),[]);
  assert.deepEqual(sourcesFromDescription('Please see page 20 of the Unknown Book for details.'),[]);
});

test("vehicle sidebars, holocron tables and adventure references retain book pages", () => {
  for(const [text,expected] of [
    ["Please see sidebar on page 272 of the Age of Rebellion Core Rulebook for details.","Age of Rebellion Core Rulebook pg.272"],
    ["See <b>Table 2-7: Holocron Skills</b> on page 109 of the Force and Destiny Core Rulebook for details.","Force and Destiny Core Rulebook pg.109"],
    ["See page 19 of the Chronicles of the Gatekeeper adventure module for details.","Chronicles of the Gatekeeper pg.19"]
  ])assert.deepEqual(sourcesFromDescription(text),[expected]);
});

test("shared descriptors have an explicit technical source and separately evidenced book relationships", () => {
  const entry={sources:["OggDude — ItemDescriptors.xml"],relatedBooks:["eote","aor","invented"]};
  assert.deepEqual(entryBookIds(entry),["oggdude-descriptors","eote","aor"]);
  assert.deepEqual(filterEntries([entry],{selected:["eote"]}),[entry]);
});

test("library filters intersect saved books, line, type and search without mutating entries", () => {
  const entries=[
    {name:"Stormtrooper",type:"minion",documentName:"Actor",books:["aor","eote"],sources:["book:aor"]},
    {name:"Temple guard",type:"rival",documentName:"Actor",books:["fad"]},
    {name:"Blaster",type:"weapon",documentName:"Item",books:["eote"]},
    {name:"Fan NPC",type:"rival",books:["fan-demo"]},
    {name:"My NPC",type:"rival",books:["homebrew"]}
  ];
  assert.deepEqual(filterEntries(entries,{selected:["eote"],line:"aor",type:"Actor",search:"storm"}),[entries[0]]);
  assert.equal(filterEntries(entries,{selected:[]}).length,0);
  assert.equal(filterEntries(entries).length,4);
  assert.equal(filterEntries(entries,{includeFan:true}).length,5);
  assert.deepEqual(filterEntries(entries,{selected:["homebrew"]}),[entries[4]]);
  assert.deepEqual(entries[0].books,["aor","eote"]);
});

test("all selectable profiles reference registered books and homebrew includes user content", () => {
  const ids=new Set(BOOKS.map(b=>b.id));
  assert.equal(ids.size,BOOKS.length);
  for(const profile of PROFILES)for(const id of profile.books)assert.ok(id==="*"||ids.has(id),`${profile.id}: ${id}`);
  assert.ok(PROFILES.find(p=>p.id==="homebrew").books.includes("homebrew"));
});

const installed=RECOMMENDED_MODULES.map(id=>({id,version:REVIEWED_VERSIONS[id][0]}));
test("module preset enables reviewed tools and preserves other settings", () => {
  const current={"swrpg-karmic-dice":true,"unrelated":true,"swffgUI-cc":true,"token-action-hud":true};
  const plan=planModules(installed,current);
  assert.equal(plan.issues.length,0);
  assert.deepEqual(plan.disable,["swffgUI-cc","token-action-hud"]);
  assert.equal(plan.configuration["swrpg-karmic-dice"],true);
  assert.equal(plan.configuration.unrelated,true);
  assert.equal(current["swffgUI-cc"],true);
  for(const id of RECOMMENDED_MODULES)assert.equal(plan.configuration[id],true);
  assert.equal(planModules(installed,plan.configuration).changed,false);
});

test("module preset reports missing tools, changed versions and changed runtime", () => {
  assert.match(planModules(installed.slice(1)).issues.join(" "),/Falta lib-wrapper/);
  assert.match(planModules(installed.map(m=>m.id==="tokenizer-2"?{...m,version:"9.0"}:m)).issues.join(" "),/pendiente de revisar/);
  assert.equal(planModules(installed,{}, {foundry:"15.1",system:"2.0.5-mitos.14"}).issues.length,1);
});

test("campaign input is bounded and journal HTML escapes user prose", () => {
  const result=cleanCampaign({title:" ",premise:'<img src=x onerror="alert(1)">',extra:"ignored"});
  assert.equal(result.title,"Star Wars · Historia de Mitos");
  assert.equal(result.canon,"Por definir");
  assert.equal(result.extra,undefined);
  assert.equal(cleanCampaign({title:"x".repeat(200)}).title.length,120);
  assert.ok(!escapeHTML(result.premise).includes("<img"));
  assert.equal(escapeHTML("A & B's"),"A &amp; B&#39;s");
});
