/** Apply reviewed, exact-name artwork to imported world compendia; call as GM.
 * Requires Tokenizer 2. Returns the original actor data for a reversible backup.
 * Does not touch unrelated portraits or alter actor statistics.
 */
export async function applyReviewedWorldArt() {
  if (!game.user.isGM) throw Error('GM required');
  const base='systems/starwarsffg/';
  const [map,catalog]=await Promise.all(['adversary-image-map.json','sources.json'].map(p=>fetch('/'+base+'assets/starwars-original/'+p).then(r=>r.json())));
  const assets=new Map(catalog.images.map(i=>[i.id,base+i.file]));
  const result={changed:[],before:[],tokens:[],errors:[]};
  const cache=new Map();
  for(const pack of game.packs){
    if(pack.documentName!=='Actor'||!pack.collection.startsWith('world.'))continue;
    const docs=await pack.getDocuments();
    const selected=docs.filter(a=>map[a.name]&&a.img!==assets.get(map[a.name])&&(/^(systems\/starwarsffg\/|worlds\/[^/]+\/images\/packs\/)/.test(a.img)));
    if(!selected.length)continue;
    const locked=pack.locked;if(locked)await pack.configure({locked:false});
    try{for(const actor of selected){
      try{
        const img=assets.get(map[actor.name]);result.before.push({uuid:actor.uuid,data:actor.toObject()});
        let token=cache.get(img);
        if(!token){
          token=await Tokenizer2.tokenize(actor,{portraitSrc:img,forceBakedRing:true,frameSrc:'modules/tokenizer-2/img/plain-marble-frame-grey.png',portraitFit:actor.type==='vehicle'?'contain':'cover',exportSize:512,exportFormat:'webp',saveFolder:'[data] systems/starwarsffg/assets/tokens-tokenizer2',filename:'role-'+actor.id,updateActor:false});
          cache.set(img,token);result.tokens.push({name:actor.name,path:token.path,img});
        }
        await actor.update({img,'prototypeToken.texture.src':token.path,'prototypeToken.ring.enabled':false,'flags.tokenizer-2.layerStack':token.layers});
        result.changed.push({uuid:actor.uuid,name:actor.name,img,token:token.path});
      }catch(e){result.errors.push({uuid:actor.uuid,message:e.message});}
    }}finally{if(locked)await pack.configure({locked:true});}
  }
  const pack=game.packs.get('ffg-star-wars-enhancements.ffg-sw-enhanced-scene-ideas');
  if(pack){
    const scene=await pack.getDocument('hH4iPXB3OPrv6F00');
    const token=scene?.tokens.get('NlTXqnRqRRVeei2I');
    if(token?.texture.src==='/modules/clocks/themes/dog_blink_blue/12clock_0.png'){
      const locked=pack.locked;if(locked)await pack.configure({locked:false});
      try{result.before.push({uuid:scene.uuid,data:scene.toObject()});await scene.updateEmbeddedDocuments('Token',[{_id:token.id,'texture.src':assets.get('progress-clock-12-empty')}]);result.changed.push({uuid:token.uuid,name:'Original progress clock image restored'});}
      finally{if(locked)await pack.configure({locked:true});}
    }
  }
  return result;
}
