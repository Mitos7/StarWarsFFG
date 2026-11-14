/** Read-only inventory for the next connected Foundry review.
 * const {auditStarWarsWorld} = await import('/systems/starwarsffg/scripts/audit-starwars-world.mjs');
 * window.swReview = await auditStarWarsWorld({compendia: true, checkImages: true});
 */
export async function auditStarWarsWorld({compendia = true, checkImages = false} = {}) {
  if (!game.user.isGM) throw new Error("La revisión completa requiere un usuario GM.");
  const report = {foundry: game.version, system: game.system.version, world: game.world.id,
    modules: [], conflicts: [], packs: [], documents: [], errors: [], images: []};
  const paths = new Map();
  const image = (src, owner, role) => {
    if (!src || typeof src !== "string") return;
    if (!paths.has(src)) paths.set(src, []);
    paths.get(src).push({owner, role});
  };
  const inspect = (doc, location) => {
    report.documents.push({uuid: doc.uuid, name: doc.name, type: doc.type, location, img: doc.img,
      token: doc.prototypeToken?.texture?.src});
    image(doc.img, doc.uuid, "portrait");
    image(doc.prototypeToken?.texture?.src, doc.uuid, "token");
    image(doc.texture?.src, doc.uuid, "scene-token");
    image(doc.background?.src, doc.uuid, "background");
    for (const item of doc.items ?? []) inspect(item, doc.uuid);
    for (const token of doc.tokens ?? []) {
      inspect(token, doc.uuid);
      image(token.actor?.img, token.uuid, "synthetic-portrait");
    }
    const layers = doc.flags?.["tokenizer-2"]?.layerStack;
    const source = Array.isArray(layers) ? layers.find(layer => layer.name === "Token Image")?.src : null;
    if (source && doc.img && source !== doc.img) report.errors.push({uuid: doc.uuid, issue: "tokenizer-portrait-mismatch", source, portrait: doc.img});
  };
  const active = new Set([...game.modules.values()].filter(m => m.active).map(m => m.id));
  for (const module of game.modules.values()) {
    const missing = [...(module.relationships?.requires ?? [])].filter(dep => !active.has(dep.id) && dep.type !== "system").map(dep => dep.id);
    report.modules.push({id: module.id, version: module.version, active: module.active,
      compatibility: module.compatibility, missingActiveDependencies: module.active ? missing : []});
  }
  const interfaces = ["space-op-ui", "swffgUI-cc", "ffg-star-wars-alternative-ui"].filter(id => active.has(id));
  if (interfaces.length > 1) report.conflicts.push({issue: "overlapping-interfaces", modules: interfaces});
  if (active.has("token-action-hud") && active.has("token-action-hud-core")) report.conflicts.push({issue: "classic-and-core-hud-active"});
  if (active.has("star-wars-status-automation") && active.has("ffg-star-wars-enhancements")) report.conflicts.push({issue: "check-overlapping-encumbrance-settings"});
  if (active.has("ffg-consumables") && active.has("ffg-star-wars-enhancements")) report.conflicts.push({issue: "check-overlapping-stimpack-settings"});
  for (const collection of [game.actors, game.items, game.scenes]) for (const doc of collection) inspect(doc, "world");
  if (compendia) for (const pack of game.packs.values()) {
    if (!["Actor", "Item", "Scene"].includes(pack.documentName)) continue;
    try {
      const documents = await pack.getDocuments();
      report.packs.push({id: pack.collection, type: pack.documentName, count: documents.length});
      for (const doc of documents) inspect(doc, pack.collection);
    } catch (error) {report.errors.push({pack: pack.collection, issue: String(error)});}
  }
  const remaining = [...paths.entries()];
  const worker = async () => {
    while (remaining.length) {
      const [src, usedBy] = remaining.shift();
      const result = {src, usedBy};
      if (src.includes("*")) {
        result.status = "wildcard-not-checked";
        report.images.push(result);
        continue;
      }
      if (checkImages) {
        try {
          const url = new URL(src, document.baseURI);
          // Cross-origin CORS failures do not establish that an image is missing.
          if (url.origin !== location.origin || url.protocol === "data:") result.status = "external-not-checked";
          else {
            const response = await fetch(url, {method: "HEAD", signal: AbortSignal.timeout(15000)});
            result.status = response.status;
            if (!response.ok) report.errors.push({src, issue: `image-http-${response.status}`});
          }
        } catch (error) {result.status = String(error); report.errors.push({src, issue: String(error)});}
      }
      report.images.push(result);
    }
  };
  await Promise.all(Array.from({length: 6}, worker));
  report.summary = {documents: report.documents.length, images: paths.size,
    activeModules: active.size, conflicts: report.conflicts.length, errors: report.errors.length};
  return report;
}
