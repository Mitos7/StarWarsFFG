/** Keep the subject of reviewed source images centered using Tokenizer 2. */
export async function applyReviewedTokenCrops(crops) {
  if (!game.user.isGM) throw Error('GM required');
  const result={changed:[],tokens:[],sourceActors:{},errors:[]};const cache=new Map();
  async function process(actor,source=false){
    const crop=crops[actor.img?.split('/').pop()];
    if(crop&&actor.flags['tokenizer-2']?.layerStack){
      let token=cache.get(actor.img);
      if(!token){
        const img=new Image();img.src=actor.img;await img.decode();
        const layers=foundry.utils.deepClone(actor.flags['tokenizer-2'].layerStack),layer=layers.find(l=>l.name==='Token Image');
        const scale=img.naturalWidth/crop.width;
        Object.assign(layer.transform,{x:(img.naturalWidth/2-crop.cx)*512/crop.width,y:(img.naturalHeight/2-crop.cy)*512/crop.width,scaleX:scale,scaleY:scale});
        layer.adjustments.brightness=crop.brightness??1;
        token=await Tokenizer2.tokenize(actor,{portraitSrc:actor.img,layers,forceBakedRing:true,exportSize:512,exportFormat:'webp',saveFolder:'[data] systems/starwarsffg/assets/tokens-tokenizer2',filename:'crop-'+actor.id,updateActor:false});
        cache.set(actor.img,token);result.tokens.push({name:actor.name,img:actor.img,path:token.path});
      }
      actor=(await actor.update({'prototypeToken.texture.src':token.path,'prototypeToken.ring.enabled':false,'flags.tokenizer-2.layerStack':token.layers}))??actor;
      result.changed.push({uuid:actor.uuid,name:actor.name,path:token.path});
    }
    if(source)result.sourceActors[actor.name]={img:actor.img,prototypeToken:actor.prototypeToken.toObject(),flags:{'tokenizer-2':actor.flags['tokenizer-2']}};
  }
  for(const pack of game.packs){
    const source=['starwarsffg.','swffg-mitos-starter.'].some(p=>pack.collection.startsWith(p));
    if(pack.documentName!=='Actor'||(!source&&!pack.collection.startsWith('world.')))continue;
    const documents=await pack.getDocuments();
    if(!source&&!documents.some(a=>crops[a.img?.split('/').pop()]))continue;
    const locked=pack.locked;if(locked)await pack.configure({locked:false});
    try{for(const a of documents)await process(a,source);}finally{if(locked)await pack.configure({locked:true});}
  }
  for(const a of game.actors)await process(a);
  for(const scene of game.scenes){
    const updates=[];
    for(const t of scene.tokens){if(!t.actor)continue;await process(t.actor);const token=cache.get(t.actor.img);if(token)updates.push({_id:t.id,'texture.src':token.path,'ring.enabled':false});}
    if(updates.length)await scene.updateEmbeddedDocuments('Token',updates);
  }
  return result;
}
