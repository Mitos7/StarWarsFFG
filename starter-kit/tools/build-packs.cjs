const fs = require("node:fs");
const path = require("node:path");
const {ClassicLevel} = require("./resolve-classic-level.cjs");
const root = path.resolve(__dirname, "..");
const moduleJson = JSON.parse(fs.readFileSync(path.join(root, "module.json"), "utf8"));
const prefixes = {Item:"items",Actor:"actors",JournalEntry:"journal"};
async function main() {
  const result={};
  for (const pack of moduleJson.packs) {
    const sourceFile=path.join(root,"source",pack.name+".json");
    const docs=JSON.parse(fs.readFileSync(sourceFile,"utf8"));
    const databasePath=path.join(root,pack.path);
    if (fs.existsSync(databasePath)) {
      // Avoid producing LevelDB files twice with stale keys. A rebuild is
      // intentionally destructive ONLY to generated starter-kit pack data.
      fs.rmSync(databasePath,{recursive:true,force:true});
    }
    fs.mkdirSync(databasePath,{recursive:true});
    const db=new ClassicLevel(databasePath,{valueEncoding:"utf8"});
    await db.open();
    const ops=[];
    const prefix=prefixes[pack.type];
    for (const doc of docs) {
      const top = structuredClone(doc);
      if (!top._id || !top.name) throw new Error("Invalid source document");
      if (pack.type==="JournalEntry") {
        const pages=top.pages ?? [];
        top.pages=pages.map(p=>p._id);
        for (const page of pages) {
          ops.push({type:"put",key:`!journal.pages!${doc._id}.${page._id}`,value:JSON.stringify(page)});
        }
      }
      ops.push({type:"put",key:`!${prefix}!${doc._id}`,value:JSON.stringify(top)});
    }
    await db.batch(ops);
    let found=0;
    for await(const [key,val] of db.iterator()) {
      if(!key.startsWith("!")) throw new Error("Unrecognized pack key");
      JSON.parse(val);
      found++;
    }
    await db.close();
    if(found!==ops.length)throw new Error("Incorrect number of entries in "+pack.name);
    result[pack.name]={type:pack.type,docs:docs.length,entries:found};
    console.log("PACK",pack.name,docs.length,"DOCUMENTS",found,"LEVELDB ENTRIES");
  }
  fs.writeFileSync(path.join(root,"pack-build-report.json"),JSON.stringify(result,null,2)+"\n");
}
main().catch(error=>{console.error(error);process.exitCode=1});
