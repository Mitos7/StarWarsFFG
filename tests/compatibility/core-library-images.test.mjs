import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=join(dirname(fileURLToPath(import.meta.url)),"../..");
const foundryIcons="D:/Program Files/Foundry Virtual Tabletop/resources/app/public/icons";
const manifest=JSON.parse(readFileSync(join(root,"system.json"),"utf8"));
const optional=JSON.parse(readFileSync(join(root,"starter-kit/module.json"),"utf8"));
const catalog=JSON.parse(readFileSync(join(root,"assets/starwars-original/sources.json"),"utf8"));
const imageMap=JSON.parse(readFileSync(join(root,"starter-kit/starwars-image-map.json"),"utf8"));
const sources=optional.packs.map(pack=>({
  pack, documents:JSON.parse(readFileSync(join(root,"starter-kit/source",pack.name+".json"),"utf8"))
}));
const localFile=src=>src.startsWith("icons/")
  ? join(foundryIcons,src.slice("icons/".length))
  : join(root,src.replace(/^systems\/starwarsffg\//,""));

test("all built-in Star Wars packs contain standalone LevelDB data",()=>{
  assert.equal(manifest.packs.length,12);
  assert.ok(manifest.packs.every(pack=>pack.name.startsWith("sw-")));
  for(const pack of manifest.packs){
    assert.ok(existsSync(join(root,pack.path,"CURRENT")),pack.name);
    if(pack.type!=="JournalEntry")assert.equal(pack.system,"starwarsffg");
  }
  assert.equal(optional.packs.length,23);
});

test("all 175 Star Wars illustrated entries use attributed local Star Wars images",()=>{
  const all=sources.flatMap(x=>x.documents);
  assert.equal(all.length,239);
  assert.equal(all.filter(doc=>doc.img).length,230);
  const sw=sources.filter(x=>x.pack.name.startsWith("sw-")).flatMap(x=>x.documents).filter(d=>d.img);
  assert.equal(sw.length,175);
  const used=new Set();
  for(const doc of all.filter(d=>d.img)){
    assert.ok(existsSync(localFile(doc.img)),doc.name+" "+doc.img);
    if(doc.prototypeToken)assert.equal(doc.prototypeToken.texture.src,doc.img,doc.name);
  }
  for(const doc of sw){
    assert.match(doc.img,/^systems\/starwarsffg\/assets\/starwars-original\//);
    const asset=catalog.images.find(x=>x.id===imageMap[doc.name]);
    assert.ok(asset,"Named mapping for "+doc.name);
    assert.equal(doc.img,"systems/starwarsffg/"+asset.file);
    assert.match(asset.source,/^https:\/\//);
    const hash=createHash("sha256").update(readFileSync(localFile(doc.img))).digest("hex");
    assert.equal(hash,asset.sha256,"Unmodified source image for "+doc.name);
    used.add(asset.id);
  }
  assert.ok(used.size>=100,"Distinct Star Wars artwork, not generic repeated placeholders");
  const byName=n=>sw.find(d=>d.name===n);
  assert.match(byName("Datapad").img,/\/datapad\.jpeg$/);
  assert.match(byName("DC-15A fusil bláster").img,/\/dc-15a\.jpg$/);
  assert.match(byName("T-65 X-wing").img,/\/x-wing-starfighter\.jpeg$/);
  assert.notEqual(byName("Wookiee").img,byName("Humano").img);
  assert.notEqual(byName("Luke Skywalker").img,byName("Darth Vader").img);
});

test("all Star Wars source documents have corresponding native compendium packs",()=>{
  const sw=sources.filter(x=>x.pack.name.startsWith("sw-"));
  assert.equal(sw.length,12);
  assert.equal(sw.flatMap(x=>x.documents).length,180);
  for(const {pack} of sw)assert.ok(existsSync(join(root,"packs",pack.name,"CURRENT")),pack.name);
});
