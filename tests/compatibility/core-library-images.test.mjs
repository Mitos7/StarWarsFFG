import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=join(dirname(fileURLToPath(import.meta.url)),"../..");
const manifest=JSON.parse(readFileSync(join(root,"system.json"),"utf8"));
const optional=JSON.parse(readFileSync(join(root,"starter-kit/module.json"),"utf8"));
const sources=optional.packs.map(pack=>({
  pack, documents:JSON.parse(readFileSync(join(root,"starter-kit/source",pack.name+".json"),"utf8"))
}));
const p=(src)=>join(root,src.replace(/^systems\/starwarsffg\//,""));

test("twelve system compendiums are built using independently loadable LevelDB packs",()=>{
  assert.equal(manifest.packs.length,12);
  assert.ok(manifest.packs.every(pack=>pack.name.startsWith("sw-")));
  for(const pack of manifest.packs){
    assert.ok(existsSync(join(root,pack.path,"CURRENT")),pack.name);
    if(pack.type!=="JournalEntry")assert.equal(pack.system,"starwarsffg");
  }
  assert.equal(optional.packs.length,23);
});

test("every item, actor and prototype token uses a real native icon (no custom/generated image)",()=>{
  const all=sources.flatMap(x=>x.documents);
  assert.equal(all.length,239);
  const withImage=all.filter(doc=>doc.img);
  assert.equal(withImage.length,230);
  for(const doc of withImage){
    const image=doc.img;
    assert.match(image,/^systems\/starwarsffg\/images\/defaults\/(items|actors)\/[a-z]+\.png$/);
    assert.ok(existsSync(p(image)),doc.name+" "+image);
    const header=readFileSync(p(image)).subarray(0,8).toString("hex");
    assert.equal(header,"89504e470d0a1a0a",doc.name);
    if(doc.prototypeToken){
      assert.equal(doc.prototypeToken.texture.src,image,doc.name);
      assert.equal(doc.prototypeToken.depth,1,doc.name);
    }
  }
});

test("all visible Star Wars content uses stock icons, not generated catalogue assets",()=>{
  const starWars=sources.filter(x=>x.pack.name.startsWith("sw-"));
  assert.equal(starWars.length,12);
  assert.equal(starWars.flatMap(x=>x.documents).length,180);
  for(const {pack,documents} of starWars){
    assert.ok(existsSync(join(root,"packs",pack.name,"CURRENT")),pack.name);
    for(const doc of documents){
      if(doc.img)assert.doesNotMatch(doc.img,/catalog|mitos/i);
      if(doc.prototypeToken?.texture?.src)assert.doesNotMatch(doc.prototypeToken.texture.src,/catalog|mitos/i);
    }
  }
});
