const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const imageMap={...read('starter-kit/starwars-image-map.json'),...read('starter-kit/homebrew-image-map.json')};
const tokens=read('starter-kit/tokenizer2-token-map.json');
const catalog=read('assets/starwars-original/sources.json');
let changed=0,tokenCount=0;const used=new Set();
for(const file of fs.readdirSync(path.join(root,'starter-kit/source')).filter(x=>x.endsWith('.json'))){
 const f=path.join(root,'starter-kit/source',file),docs=JSON.parse(fs.readFileSync(f,'utf8'));
 for(const d of docs){if(!d.img)continue;const id=imageMap[d.name];if(!id)throw Error('Unmapped entry: '+d.name);
 const asset=catalog.images.find(x=>x.id===id);if(!asset)throw Error('Missing asset: '+id);
 if(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,asset.file))).digest('hex')!==asset.sha256)throw Error('Image checksum mismatch: '+id);
 d.img='systems/starwarsffg/'+asset.file;
 if(d.prototypeToken){const token=tokens[d.name];if(!token)throw Error('Missing Tokenizer 2 token: '+d.name);
 if(!fs.existsSync(path.join(root,token.prototypeToken.texture.src.replace(/^systems\/starwarsffg\//,''))))throw Error('Missing token file: '+d.name);
 if(token.img!==d.img||token.flags?.['tokenizer-2']?.layerStack?.find(l=>l.name==='Token Image')?.src!==d.img)throw Error('Portrait/token mismatch: '+d.name);
 d.prototypeToken=token.prototypeToken;d.prototypeToken.bar2.attribute=['minion','rival'].includes(d.type)?null:d.type==='vehicle'?'stats.systemStrain':'stats.strain';d.flags={...d.flags,...token.flags};tokenCount++;}
 used.add(id);changed++;}
 fs.writeFileSync(f,JSON.stringify(docs,null,2)+'\n');
}
if(changed!==230||tokenCount!==69)throw Error('Expected 230 images / 69 tokens, got '+changed+' / '+tokenCount);
console.log(JSON.stringify({documents:changed,tokens:tokenCount,uniqueAssets:used.size}));
