import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const root=join(fileURLToPath(new URL(".",import.meta.url)),"../..");
const read=p=>readFileSync(join(root,p),"utf8");
const manifest=JSON.parse(read("system.json"));

test("Both original Star Wars and Genesys rule/dice/skill themes remain present",()=>{
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

test("Foundry setup images are unmodified resources inside the upstream project",()=>{
  assert.equal(manifest.background,"systems/starwarsffg/images/bgWindow.jpg");
  const setup=manifest.media.find(media=>media.type==="setup");
  assert.equal(setup?.url,"systems/starwarsffg/images/paused.png");
  assert.equal(setup?.thumbnail,"systems/starwarsffg/images/paused.png");
  for(const resource of [manifest.background, setup.url, setup.thumbnail]){
    assert.ok(existsSync(join(root,resource.replace("systems/starwarsffg/",""))),resource);
  }
});
