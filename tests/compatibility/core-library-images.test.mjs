import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=join(dirname(fileURLToPath(import.meta.url)),"../..");
const foundryIcons="D:/Program Files/Foundry Virtual Tabletop/resources/app/public/icons";
const manifest=JSON.parse(readFileSync(join(root,"system.json"),"utf8"));
const optional=JSON.parse(readFileSync(join(root,"starter-kit/module.json"),"utf8"));
const sources=optional.packs.map(pack=>({
  pack, documents:JSON.parse(readFileSync(join(root,"starter-kit/source",pack.name+".json"),"utf8"))
}));
const localFile=(src)=>src.startsWith("icons/")
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

test("230 item and actor images map to existing Foundry or StarWarsFFG stock assets",()=>{
  const all=sources.flatMap(x=>x.documents);
  assert.equal(all.length,239);
  const withImage=all.filter(doc=>doc.img);
  assert.equal(withImage.length,230);
  const mapped=new Set();
  for(const doc of withImage){
    const src=doc.img;
    assert.match(src,/^(icons\/[a-z0-9/-]+\.webp|systems\/starwarsffg\/images\/defaults\/actors\/vehicle\.png)$/);
    assert.doesNotMatch(src,/catalog|mitos|^https?:/i);
    assert.ok(existsSync(localFile(src)),doc.name+" "+src);
    mapped.add(src);
    if(doc.prototypeToken){
      assert.equal(doc.prototypeToken.texture.src,src,doc.name);
      assert.equal(doc.prototypeToken.depth,1,doc.name);
    }
  }
  assert.ok(mapped.size>=20, "at least 20 semantically distinct existing images");
  const datapad=withImage.find(doc=>doc.name==="Datapad");
  assert.equal(datapad.img,"icons/commodities/tech/phone-smart-tablet.webp");
});

test("all Star Wars source documents have corresponding native compendium packs",()=>{
  const starWars=sources.filter(x=>x.pack.name.startsWith("sw-"));
  assert.equal(starWars.length,12);
  assert.equal(starWars.flatMap(x=>x.documents).length,180);
  for(const {pack,documents} of starWars){
    assert.ok(existsSync(join(root,"packs",pack.name,"CURRENT")),pack.name);
    for(const doc of documents){
      if(doc.img)assert.doesNotMatch(doc.img,/catalog|mitos/i);
    }
  }
});
