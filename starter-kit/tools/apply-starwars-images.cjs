const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const imageMap=JSON.parse(fs.readFileSync(path.join(root,'starter-kit/starwars-image-map.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/starwars-original/sources.json'),'utf8'));
const normalize=x=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const byName=new Map(Object.entries(imageMap).map(([n,a])=>[normalize(n),a]));
const byAsset=new Map(catalog.images.map(x=>[x.id,x]));
let changed=0;const used=new Set();
for(const file of fs.readdirSync(path.join(root,'starter-kit/source')).filter(x=>x.startsWith('sw-')&&x.endsWith('.json'))){
 const f=path.join(root,'starter-kit/source',file),docs=JSON.parse(fs.readFileSync(f,'utf8'));
 for(const d of docs){if(!d.img)continue;const id=byName.get(normalize(d.name));if(!id)throw Error('Unmapped Star Wars entry: '+d.name);
 const image=byAsset.get(id);if(!image)throw Error('Missing asset: '+id);const b=fs.readFileSync(path.join(root,image.file));
 if(crypto.createHash('sha256').update(b).digest('hex')!==image.sha256)throw Error('Image checksum mismatch: '+id);
 const src='systems/starwarsffg/'+image.file;d.img=src;if(d.prototypeToken)d.prototypeToken.texture={...d.prototypeToken.texture,src};used.add(id);changed++;}
 fs.writeFileSync(f,JSON.stringify(docs,null,2)+'\n');
}
if(changed!==175)throw Error('Expected 175 Star Wars documents, got '+changed);
console.log(JSON.stringify({documents:changed,uniqueAssets:used.size}));
