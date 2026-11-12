const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {ClassicLevel}=require("D:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level");
const root=path.resolve(__dirname,"..");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"module.json"),"utf8"));
const allowedItem=new Set(["ability","armour","career","criticaldamage","criticalinjury","forcepower","gear","itemattachment","itemmodifier","talent","shipattachment","shipweapon","homesteadupgrade","signatureability","specialization","species","weapon","background","obligation","motivation"]);
const allowedActor=new Set(["character","minion","vehicle","homestead","rival","nemesis"]);
const expectedKeyPrefix={Item:"!items!",Actor:"!actors!",JournalEntry:"!journal!"};
async function run() {
 let total=0;
 for(const info of manifest.packs){
    const file=path.join(root,"source",info.name+".json");
    const source=JSON.parse(fs.readFileSync(file,"utf8"));
    const ids=new Set();
    const db=new ClassicLevel(path.join(root,info.path),{valueEncoding:"utf8"});
    await db.open();
    let count=0;
    for(const doc of source){
      if(ids.has(doc._id))throw new Error("Duplicate document ID "+doc._id);
      ids.add(doc._id);
      if(info.type==="Item" && !allowedItem.has(doc.type))throw new Error("Unknown item subtype "+doc.type);
      if(info.type==="Actor" && !allowedActor.has(doc.type))throw new Error("Unknown actor subtype "+doc.type);
      if(["Item","Actor"].includes(info.type) && !doc.system)throw new Error("Missing system data");
      if(info.type==="Actor" && doc.type!=="vehicle"){
        const chars=doc.system.characteristics ?? {};
        for(const key of ["Brawn","Agility","Intellect","Cunning","Willpower","Presence"]){
          const val=chars[key]?.value;
          if(!Number.isInteger(val) || val<1 || val>6){
            throw new Error(`Invalid characteristic ${key}=${val} on actor ${doc.name}`);
          }
        }
      }
      const key=expectedKeyPrefix[info.type]+doc._id;
      const parsed=JSON.parse(await db.get(key));
      if(parsed.name!==doc.name)throw new Error("Name mismatch");
      if(info.type==="JournalEntry"){
        if(parsed.pages.length!==doc.pages.length)throw new Error("Journal page IDs mismatch");
        for(const page of doc.pages){
          const pageData=JSON.parse(await db.get(`!journal.pages!${doc._id}.${page._id}`));
          if(!pageData.text?.content)throw new Error("Journal content missing");
        }
      }
      if(!doc.flags?.["swffg-mitos-starter"]?.demo)throw new Error("Demo flag missing");
      count++;
    }
    let keys=0;
    for await(const [key] of db.iterator()){keys++;}
    const expected=count+(info.type==="JournalEntry"?source.reduce((n,j)=>n+j.pages.length,0):0);
    if(keys!==expected)throw new Error("Unexpected extra or missing LevelDB records");
    await db.close();
    total+=count;
    console.log("PASS",info.name,count,"documents and",keys,"LevelDB entries");
  }
  if(total!==239 || manifest.packs.length!==23)throw new Error("Unexpected kit size");
  console.log("PASSED",manifest.packs.length,"PACKS,",total,"TOTAL DOCUMENTS");
}
run().catch(e=>{console.error(e);process.exitCode=1});
