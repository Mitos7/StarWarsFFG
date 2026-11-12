/** Installs a small playable scene using existing art and Tokenizer 2 tokens. */
export async function createHangarDemo({rebuild=false}={}) {
  if (!game.user.isGM) throw new Error("GM required");
  const name="Hangar 17 — Control imperial", unit=140;
  let scene=game.scenes.find(s=>s.name===name);
  if(scene&&!rebuild){await scene.activate();await scene.view();return {scene:scene.id,name,existing:true,tokens:scene.tokens.size,walls:scene.walls.size};}
  const config={name,width:4200,height:5600,padding:0,
    background:{src:"systems/starwarsffg/assets/scenes/hangar-17.jpg"},
    grid:{type:1,size:unit,distance:1.5,units:"m",alpha:0.12},
    tokenVision:true,fog:{exploration:false},environment:{globalLight:{enabled:true,alpha:0.2}},
    backgroundColor:"#17262b",initial:{x:2100,y:2600,scale:0.24},
    flags:{starwarsffg:{demoHangar:true}}};
  if(scene)await scene.update(config);else scene=await Scene.create(config);
  const folder=game.folders.find(f=>f.type==="Actor"&&f.name==="Hangar 17")||await Folder.create({name:"Hangar 17",type:"Actor",color:"#597b89"});
  const actor=async(packName,actorName)=>{
    let a=game.actors.find(a=>a.name===actorName);
    if(!a){const p=game.packs.get(packName),src=(await p.getDocuments()).find(d=>d.name===actorName);if(!src)throw Error(actorName);a=await game.actors.importFromCompendium(p,src.id,{folder:folder.id},{renderSheet:false});}
    return a;
  };
  const isb=await actor("starwarsffg.sw-adversarios","Agente ISB");
  const storm=await actor("starwarsffg.sw-adversarios","Stormtrooper imperial");
  const droid=await actor("starwarsffg.sw-adversarios","Droide de batalla B1");
  const pilot=await actor("swffg-mitos-starter.adversarios","Contrabandista de muelle");
  const medic=await actor("swffg-mitos-starter.adversarios","Rescatadora civil");
  const ship=await actor("swffg-mitos-starter.vehiculos","Carguero Bruma Gris");
  await pilot.update({"prototypeToken.disposition":1});await medic.update({"prototypeToken.disposition":1});
  await ship.update({"prototypeToken.width":3,"prototypeToken.height":3,"prototypeToken.disposition":0});
  const tokenSpecs=[[isb,"Supervisora ISB",19,5,-1],[storm,"Patrulla Aurek",13,13,-1],[storm,"Patrulla Besh",21,14,-1],[storm,"Guardia de acceso",15,9,-1],[droid,"Droide de seguridad",26,5,-1],[pilot,"Piloto del Bruma Gris",9,26,1],[medic,"Médica de la tripulación",11,26,1],[ship,ship.name,14,21,0]];
  if(scene.tokens.size)await scene.deleteEmbeddedDocuments("Token",scene.tokens.map(t=>t.id));
  const tokenData=[];
  for(const [a,label,x,y,disposition] of tokenSpecs){const td=await a.getTokenDocument({name:label,x:x*unit,y:y*unit,disposition,actorLink:false,displayName:30,displayBars:40,lockRotation:true,sight:{enabled:disposition===1,range:50},flags:{starwarsffg:{demoHangar:true}}});tokenData.push(td.toObject());}
  const walls=[],wall=(a,b,door=0)=>walls.push({c:[a[0]*unit,a[1]*unit,b[0]*unit,b[1]*unit],move:20,sight:20,light:20,sound:20,door,ds:0});
  const line=pts=>pts.slice(1).forEach((p,i)=>wall(pts[i],p));
  line([[16.4,7.1],[18.4,7.1]]);wall([18.4,7.1],[19.5,7.1],1);line([[19.5,7.1],[22.1,7.1],[22.1,6.1]]);wall([22.1,6.1],[22.1,5.2],1);
  line([[22.1,5.2],[22.1,3],[21.5,1.9],[20.5,1.2],[19.2,1],[18,1.3],[17,2.2],[16.4,3.5],[16.4,4.6]]);wall([16.4,4.6],[16.4,6],1);wall([16.4,6],[16.4,7.1]);
  line([[12,2],[16.1,2],[16.1,7.1],[15.2,7.1]]);wall([15.2,7.1],[14.2,7.1],1);line([[14.2,7.1],[12,7.1],[12,4.5]]);wall([12,4.5],[12,3.8],1);wall([12,3.8],[12,2]);
  line([[22.8,5.1],[22.8,2],[28.1,2],[28.1,7.4],[22.8,7.4],[22.8,6.2]]);wall([22.8,6.2],[22.8,5.1],1);
  line([[4,16],[4,29],[8.9,29]]);wall([8.9,29],[22.2,29],1);line([[22.2,29],[25.4,29],[25.4,15]]);
  if(scene.walls.size)await scene.deleteEmbeddedDocuments("Wall",scene.walls.map(w=>w.id));
  await scene.createEmbeddedDocuments("Wall",walls);
  let journal=game.journal.find(j=>j.name===name);
  const content="<h1>Hangar 17 — Control imperial</h1><p>El Bruma Gris tiene el transpondedor bloqueado. Una supervisora de la ISB acaba de ordenar una inspección, mientras dos tripulantes intentan recuperar el manifiesto de vuelo y liberar los anclajes antes de que llegue el relevo.</p><h2>Objetivos</h2><ol><li>Recuperar el manifiesto de la sala circular superior.</li><li>Desbloquear los anclajes en la consola del hangar.</li><li>Abrir la compuerta y regresar al carguero.</li></ol><h2>Opciones</h2><p>Computadoras o Mecánica: dificultad media (2 dados de dificultad) para el bloqueo o los anclajes. Engaño o Negociación: dificultad difícil (3) frente a la supervisora; una credencial válida elimina un dado de dificultad. También se puede rodear las patrullas o combatir. Son propuestas para este escenario de demostración, no reglas adicionales.</p><h2>Reparto</h2><p>Dos tripulantes aliados, tres puestos de patrulla imperial, una supervisora ISB y un droide de seguridad. Cada token de Stormtrooper representa el grupo de esbirros que figure en su ficha. Las fichas proceden de los compendios de demostración; sus estadísticas son material fan.</p><h2>Complicaciones</h2><p>Con amenaza, una puerta se cierra, un equipo queda expuesto o el relevo llega antes. Con ventaja, se encuentra un acceso de mantenimiento o una credencial. Las tiradas y consecuencias quedan a elección del director; no hay automatismos de daño.</p><h2>Mapa y tokens</h2><p>Mapa existente HangarBay3040-30x40.default.jpg, compartido en el repositorio LeeDurant/swrpg (autor gráfico no identificado en el archivo). Retratos ya instalados; tokens circulares compuestos con Tokenizer 2. Las naves usan una ficha representativa, no una miniatura a escala.</p>";
  if(!journal)journal=await JournalEntry.create({name,pages:[{name:"Operación Bruma Gris",type:"text",text:{content,format:1}}]});
  await scene.update({journal:journal.id});
  if(scene.notes.size)await scene.deleteEmbeddedDocuments("Note",scene.notes.map(n=>n.id));
  await scene.createEmbeddedDocuments("Note",[[19,3,"Manifiesto"],[22,13,"Anclajes"],[10,29,"Compuerta"]].map(([x,y,text])=>({entryId:journal.id,pageId:journal.pages.contents[0].id,x:x*unit,y:y*unit,text,texture:{src:"icons/svg/book.svg"},iconSize:40})));
  await scene.activate();await scene.view();
  if(!canvas.ready)await new Promise(resolve=>Hooks.once("canvasReady",resolve));
  await scene.createEmbeddedDocuments("Token",tokenData);
  await canvas.animatePan({x:2100,y:2600,scale:0.24,duration:0});
  return {scene:scene.id,name,tokens:scene.tokens.size,walls:scene.walls.size,doors:scene.walls.filter(w=>w.door).length,journal:journal.id};
}
