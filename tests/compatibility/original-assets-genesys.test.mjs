import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";

const root=join(fileURLToPath(new URL(".",import.meta.url)),"../..");
const read=p=>readFileSync(join(root,p),"utf8");
const manifest=JSON.parse(read("system.json"));

test("Star Wars and Genesys rule/dice/skill themes remain present",()=>{
  const settings=read("modules/settings/settings-helpers.js");
  assert.match(settings,/["']dicetheme["']/);
  assert.match(settings,/["']vehicleRangeBand["']/);
  assert.ok((settings.match(/genesys:\s*["']genesys["']/g)??[]).length>=2);
  const skills=read("modules/config/ffg-skillslist.js");
  assert.match(skills,/["']genesys["']/);
  assert.match(skills,/["']starwars["']/);
  for(const theme of ["starwars","genesys"]) {
    assert.ok(existsSync(join(root,"images","dice",theme,"green.png")),theme+" green dice");
    assert.ok(existsSync(join(root,"images","dice",theme,"yellow.png")),theme+" yellow dice");
  }
  assert.match(read("README.md"),/Full support for other Genesys-based systems/i);
});

test("Foundry setup restores exact classic Star Wars logo from prior release",()=>{
  const path="systems/starwarsffg/assets/setup/";
  assert.equal(manifest.background,path+"star-wars-original-cover.webp");
  const setup=manifest.media.find(media=>media.type==="setup");
  assert.equal(setup?.url,path+"star-wars-original-cover.webp");
  assert.equal(setup?.thumbnail,path+"star-wars-original-thumbnail.webp");
  const checks=[
    ["assets/setup/star-wars-original-cover.webp","504c731818ee7cf06757a865d796f52338df1fc23c7c0cde787e76630bb56067"],
    ["assets/setup/star-wars-original-thumbnail.webp","1d84db7f5debfcce00befcb46ce0b3aea96b5bccba5ee7b98ce5b8823cd4608a"],
  ];
  for(const [resource,hash] of checks){
    const digest=createHash("sha256").update(readFileSync(join(root,resource))).digest("hex");
    assert.equal(digest,hash,"must exactly match previously published classic-logo file");
  }
  assert.ok(existsSync(join(root,"assets/setup/star-wars-original-logo.svg")));
  assert.ok(existsSync(join(root,"images/paused.png")),"keep upstream Imperial insignia intact");
  assert.ok(existsSync(join(root,"images/bgWindow.jpg")),"keep upstream window background intact");
});

test("public Foundry installer metadata uses correct download and latest manifest",()=>{
  assert.equal(manifest.version,"2.0.5-mitos.6");
  assert.equal(manifest.id,"starwarsffg");
  assert.equal(manifest.manifest,"https://github.com/Mitos7/StarWarsFFG/releases/latest/download/system.json");
  assert.equal(manifest.download,"https://github.com/Mitos7/StarWarsFFG/releases/download/v2.0.5-mitos.6/system.zip");
  assert.equal(manifest.compatibility.verified,14);
});
