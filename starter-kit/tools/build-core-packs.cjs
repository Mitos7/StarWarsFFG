const fs=require("node:fs");
const path=require("node:path");
const {ClassicLevel}=require("D:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level");
const root=path.resolve(__dirname,"..","..");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"system.json"),"utf8"));
const prefix={Actor:"actors",Item:"items",JournalEntry:"journal"};
async function main(){
 const counts={};
 for(const pack of manifest.packs){
   if(!pack.name.startsWith("sw-"))throw new Error("Unrelated pack: "+pack.name);
   const documents=JSON.parse(fs.readFileSync(path.join(root,"starter-kit/source",pack.name+".json"),"utf8"));
   const dbPath=path.join(root,pack.path);
   if(fs.existsSync(dbPath))fs.rmSync(dbPath,{recursive:true,force:true});
   fs.mkdirSync(dbPath,{recursive:true});
   const db=new ClassicLevel(dbPath,{valueEncoding:"utf8"});
   await db.open();
   const operations=[];
   for(const document of documents){
      const doc=structuredClone(document);
      if(!doc._id || !doc.name)throw new Error("Invalid document");
      if(doc.img){
        const m=/^systems\/starwarsffg\/(.+)$/.exec(doc.img);
        if(!m || !fs.existsSync(path.join(root,m[1])) || m[1].includes("catalog/"))throw new Error("Invalid native image: "+doc.img);
      }
      if(pack.type==="JournalEntry"){
        const pages=doc.pages||[];
        doc.pages=pages.map(p=>p._id);
        for(const page of pages)operations.push({type:"put",key:`!journal.pages!${doc._id}.${page._id}`,value:JSON.stringify(page)});
      }
      operations.push({type:"put",key:`!${prefix[pack.type]}!${doc._id}`,value:JSON.stringify(doc)});
   }
   await db.batch(operations);
   let rows=0;
   for await(const [key,value] of db.iterator()){JSON.parse(value);rows++;}
   await db.close();
   if(rows!==operations.length)throw new Error("Wrong LevelDB entry count: "+pack.name);
   counts[pack.name]={documents:documents.length,records:rows};
   console.log("CORE PACK",pack.name,documents.length,"entries checked");
 }
 console.log("TOTAL",Object.values(counts).reduce((a,b)=>a+b.documents,0),"documents across",Object.keys(counts).length,"core packs");
}
main().catch(e=>{console.error(e);process.exitCode=1});
