import test from "node:test";
import assert from "node:assert/strict";
globalThis.foundry = {applications: {api: {
  ApplicationV2: class {render() {} close() {}}, HandlebarsApplicationMixin: base => base
}}, utils: {getProperty: (o, p) => p.split(".").reduce((v, k) => v?.[k], o)}};
globalThis.game = {user: {}, i18n: {localize: key => key}};
globalThis.canvas = {tokens: {controlled: []}};
const {WoundsStrainHUD} = await import("../../addons/patches/ffg-star-wars-hud-enhancements/scripts/hud-panel.js");
const adjust = WoundsStrainHUD.DEFAULT_OPTIONS.actions["adjust-stat"];
function actor(type = "character", owner = true) {
  return {type, system: {stats: {wounds: {value: "3"}, strain: {value: 0}, hullTrauma: {value: 2}}},
    updates: [], testUserPermission: () => owner,
    async update(data) {this.updates.push(data);}};
}
test("HUD buttons change numeric wound values, including imported numeric strings", async () => {
  const a = actor();
  await adjust.call({_token: {actor: a}}, null, {dataset: {key: "system.stats.wounds.value", delta: "1"}});
  assert.deepEqual(a.updates, [{"system.stats.wounds.value": 4}]);
});
test("HUD cannot edit observer actors, arbitrary fields or absent minion strain", async () => {
  for (const [a, key, delta] of [
    [actor("character", false), "system.stats.wounds.value", "1"],
    [actor(), "system.stats.credits.value", "1"],
    [actor("minion"), "system.stats.strain.value", "1"],
    [actor(), "system.stats.wounds.value", "bad"],
    [actor(), "system.stats.wounds.value", "100"]
  ]) {
    await adjust.call({_token: {actor: a}}, null, {dataset: {key, delta}});
    assert.deepEqual(a.updates, []);
  }
});
test("scene control toggle uses the requested state without alternating on repeated callbacks", () => {
  const hud = new WoundsStrainHUD();
  hud.toggle(false); hud.toggle(false); assert.equal(hud._enabled, false);
  hud.toggle(true); hud.toggle(true); assert.equal(hud._enabled, true);
});
