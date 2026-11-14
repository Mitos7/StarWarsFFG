/** Apply the reviewed role portraits using Tokenizer 2. Call snapshot first and save it before applying. */
const PLAN = "systems/starwarsffg/assets/starwars-original/role-art-plan-20261114.json";
async function collect(includeApplied=false) {
  if (!game.ready || !game.user?.isGM) throw Error("A ready GM session is required.");
  const response = await fetch(PLAN, {cache:"no-store"});
  if (!response.ok) throw Error("Cannot load reviewed portrait plan.");
  const plan = await response.json();
  const byName = new Map(plan.entries.map(e=>[e.name,e]));
  const selected=[], skipped=[];
  const inspect = actor => {
    const entry=byName.get(actor.name);
    if (!entry) return;
    if (actor.img===entry.img && !includeApplied) {skipped.push({uuid:actor.uuid,reason:"already-applied"});return;}
    if (actor.img!==entry.expectedImg && !(includeApplied && actor.img===entry.img)) {skipped.push({uuid:actor.uuid,reason:"portrait-changed",img:actor.img});return;}
    selected.push({actor,entry});
  };
  for (const pack of game.packs) {
    if (pack.documentName!=="Actor" || !pack.collection.startsWith("world.")) continue;
    for (const actor of await pack.getDocuments()) inspect(actor);
  }
  for (const actor of game.actors) inspect(actor);
  return {selected,skipped};
}
export async function snapshotReviewedRoleArt({includeApplied=false}={}) {
  const {selected,skipped}=await collect(includeApplied);
  return {world:game.world.id,at:new Date().toISOString(),skipped,
    actors:selected.map(({actor,entry})=>({uuid:actor.uuid,entry,data:actor.toObject()})),
    scenes:game.scenes.map(scene=>({uuid:scene.uuid,data:scene.toObject()}))};
}
export async function applyReviewedRoleArt(snapshot,{refresh=false}={}) {
  if (!snapshot || snapshot.world!==game.world.id || !Array.isArray(snapshot.actors)) throw Error("Save and supply a matching snapshot first.");
  if (typeof Tokenizer2?.tokenize!=="function") throw Error("Tokenizer 2 is required.");
  const {selected,skipped}=await collect(refresh);
  const before=new Map(snapshot.actors.map(row=>[row.uuid,row]));
  for (const {actor,entry} of selected) {
    const row=before.get(actor.uuid);
    if (!row || row.data.img!==actor.img || row.entry.img!==entry.img ||
        row.data._stats?.modifiedTime!==actor._source._stats?.modifiedTime)
      throw Error("Actor changed after backup: "+actor.uuid);
  }
  const result={changed:[],tokens:[],skipped,errors:[],sceneTokens:0};
  const generated=new Map();
  // Render all portraits before making document changes.
  for (const {actor,entry} of selected) {
    if (generated.has(entry.asset)) continue;
    const image=new Image(); image.src=entry.img; await image.decode();
    if (image.naturalWidth!==entry.width || image.naturalHeight!==entry.height) throw Error("Source dimensions changed: "+entry.asset);
    const preview=await Tokenizer2.tokenize(actor,{portraitSrc:entry.img,
      frameSrc:"modules/tokenizer-2/img/plain-marble-frame-grey.png",portraitFit:"contain",
      forceBakedRing:true,save:false,updateActor:false,persistLayers:false,exportSize:512,exportFormat:"webp"});
    const layers=foundry.utils.deepClone(preview.layers);
    const layer=layers.find(l=>l.name==="Token Image");
    if (!layer) throw Error("Tokenizer portrait layer missing.");
    // Tokenizer fits the longest side to 512 pixels before applying transforms.
    Object.assign(layer.transform,{scaleX:entry.scale,scaleY:entry.scale,
      x:(0.5-entry.focus[0])*512*entry.scale*entry.width/Math.max(entry.width,entry.height),
      y:(0.5-entry.focus[1])*512*entry.scale*entry.height/Math.max(entry.width,entry.height)});
    const token=await Tokenizer2.tokenize(actor,{portraitSrc:entry.img,layers,
      forceBakedRing:true,saveFolder:"[data] systems/starwarsffg/assets/tokens-tokenizer2",
      filename:"reviewed-"+entry.asset,updateActor:false,persistLayers:false,exportSize:512,exportFormat:"webp"});
    if (!token.path) throw Error("Tokenizer did not save "+entry.asset);
    generated.set(entry.asset,token);result.tokens.push({asset:entry.asset,path:token.path});
  }
  for (const {actor,entry} of selected) {
    const pack=actor.pack?game.packs.get(actor.pack):null;
    const locked=pack?.locked;
    if (locked) await pack.configure({locked:false});
    try {
      const token=generated.get(entry.asset);
      await actor.update({img:entry.img,"prototypeToken.texture.src":token.path,
        "prototypeToken.ring.enabled":false,"flags.tokenizer-2.layerStack":token.layers});
      result.changed.push({uuid:actor.uuid,name:actor.name,img:entry.img,token:token.path});
    } catch(error) {result.errors.push({uuid:actor.uuid,message:error.message});}
    finally {if(locked)await pack.configure({locked:true});}
  }
  const changedIds=new Set(result.changed.filter(r=>r.uuid.startsWith("Actor.")).map(r=>r.uuid.split(".")[1]));
  for (const scene of game.scenes) {
    const updates=[];
    for (const token of scene.tokens) {
      if (!token.actorLink || !changedIds.has(token.actorId)) continue;
      const actor=game.actors.get(token.actorId);
      updates.push({_id:token.id,"texture.src":actor.prototypeToken.texture.src,"ring.enabled":false});
    }
    if(updates.length){await scene.updateEmbeddedDocuments("Token",updates);result.sceneTokens+=updates.length;}
  }
  return result;
}
