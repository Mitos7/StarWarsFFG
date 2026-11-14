import test from "node:test";
import assert from "node:assert/strict";
const MODULE = "star-wars-status-automation";
let sequence = 0;
function actor(type = "character", value = 9, max = 7, brawn = 2) {
  const a = {id: "shared-base-id", type, items: [], effects: [],
    system: {stats: {encumbrance: {value, max}}, characteristics: {Brawn: {value: brawn}}},
    async createEmbeddedDocuments(kind, data) {
      const docs = data.map(d => ({...structuredClone(d), id: `doc-${++sequence}`}));
      this[kind === "Item" ? "items" : "effects"].push(...docs); return docs;
    },
    async deleteEmbeddedDocuments(kind, ids) {
      const key = kind === "Item" ? "items" : "effects";
      this[key] = this[key].filter(d => !ids.includes(d.id));
    }
  }; return a;
}
const settings = new Map([
  ["encumbrance-sync-enable", true], ["encumbrance-sync-status", "normal.webp"],
  ["encumbrance-sync-status-over", "heavy.webp"], ["encumbrance-talent-id", "template"]
]);
globalThis.game = {user: {id: "gm", isGM: true}, users: {activeGM: {id: "gm"}},
  settings: {get: (_, key) => settings.get(key)}, packs: new Map()};
globalThis.canvas = {tokens: {placeables: []}};
const {update_encumbrance, encumbrance_sync} = await import("../../addons/patches/star-wars-status-automation/scripts/encumbrance_automation.js");
const {update_status} = await import("../../addons/patches/star-wars-status-automation/scripts/status_icon.js");

test("scene sync skips missing actors and NPCs, respects each synthetic actor and linked duplicates", async () => {
  const a = actor(), b = actor("character", 6), c = actor("character", 10, 9);
  canvas.tokens.placeables = [{}, {actor: actor("rival")}, {actor: a}, {actor: a}, {actor: b}, {actor: c}];
  await update_encumbrance();
  assert.equal(a.effects.length, 1);
  assert.equal(a.effects[0].img, "heavy.webp");
  assert.equal(b.effects.length, 0);
  assert.equal(c.effects[0].img, "normal.webp", "use the actual modified threshold");
  await update_encumbrance();
  assert.equal(a.effects.length, 1, "refresh must not duplicate effects");
});

test("normal, severe and cleared effects work without Status Counter or removed Token.toggleEffect", async () => {
  const a = actor();
  a.effects.push({id: "unrelated", img: "normal.webp", flags: {}});
  await update_status({actor: a}, 1, false);
  await update_status({actor: a}, 3, true);
  assert.equal(a.effects.filter(e => e.flags?.[MODULE]?.managed).length, 1);
  assert.equal(a.effects.at(-1).img, "heavy.webp");
  await update_status({actor: a}, 0, false);
  assert.deepEqual(a.effects.map(e => e.id), ["unrelated"]);
});

test("disabled automation clears only its own statuses", async () => {
  const a = actor(); canvas.tokens.placeables = [{actor: a}];
  await update_encumbrance(); settings.set("encumbrance-sync-enable", false);
  try { await update_encumbrance(); assert.equal(a.effects.length, 0); }
  finally { settings.set("encumbrance-sync-enable", true); }
});

test("drawToken sync uses the token's synthetic actor and serializes overlapping requests", async () => {
  const token = {actor: actor()};
  await Promise.all([encumbrance_sync("drawToken", token), encumbrance_sync("drawToken", token)]);
  assert.equal(token.actor.effects.length, 1);
});

test("secondary GMs cannot duplicate automatic changes", async () => {
  const token = {actor: actor()}; game.users.activeGM = {id: "another-gm"};
  try { await encumbrance_sync("drawToken", token); assert.equal(token.actor.effects.length, 0); }
  finally { game.users.activeGM = {id: "gm"}; }
});

test("managed talent updates do not feed back into encumbrance synchronization", async () => {
  const a = actor(); canvas.tokens.placeables = [{actor: a}];
  await encumbrance_sync("updateItem", {actor: a, type: "talent", flags: {[MODULE]: {managed: true}}});
  assert.equal(a.effects.length, 0);
});
