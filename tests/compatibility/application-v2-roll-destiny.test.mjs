import test from "node:test";
import assert from "node:assert/strict";

class ApplicationV2 {
  constructor(options={}) { this.options = options; }
  async _prepareContext() { return {}; }
  _onRender() {}
}

globalThis.foundry = {
  applications: {api: {ApplicationV2, HandlebarsApplicationMixin: Base => class extends Base {}}},
  utils: {setProperty: (object, path, value) => {
    const parts = path.split("."); let target = object;
    for (const part of parts.slice(0, -1)) target = target[part] ??= {};
    target[parts.at(-1)] = value;
  }, fromUuid: async () => null},
};

const RollBuilderFFG = (await import("../../modules/dice/roll-builder.js")).default;
const DestinyTracker = (await import("../../modules/ffg-destiny-tracker.js")).default;

test("roll builder is a native V2 form and preserves its positional constructor", () => {
  const pool = {ability: 2};
  const builder = new RollBuilderFFG({actor: {_id: "a"}}, pool, "Check", "Skill", {}, "Flavor", "sound.ogg");
  assert.ok(builder instanceof ApplicationV2);
  assert.equal(RollBuilderFFG.DEFAULT_OPTIONS.tag, "form");
  assert.equal(builder.description, "Check");
  assert.equal(builder.dicePool, pool);
  assert.equal(builder.roll.skillName, "Skill");
});

test("roll submit carries sound and flavor into the live RollFFG dispatch", async () => {
  const calls = [];
  globalThis.game = {
    user: {id: "user"}, actors: {get: id => ({id})},
    i18n: {localize: key => key},
    ffg: {RollFFG: class {
      constructor(...args) { calls.push(["construct", ...args]); }
      async toMessage(data) { calls.push(["message", data]); }
    }},
  };
  globalThis.CONFIG = {logger: {warn() {}}};
  globalThis.AudioHelper = {play: (...args) => calls.push(["audio", ...args])};
  const pool = {renderDiceExpression: () => "2g", renderPreview() {}};
  const builder = new RollBuilderFFG({actor: {_id: "actor"}}, pool, "Check", "Skill", {type: "gear"}, undefined, "roll.ogg");
  await builder._submitRoll({object: {flavor: "Custom flavor"}});
  assert.equal(builder.roll.flavor, "Custom flavor");
  assert.deepEqual(calls[0].slice(0, 3), ["construct", "2g", builder.roll.item]);
  assert.equal(calls[1][1].speaker.actor.id, "actor");
  assert.equal(calls[2][0], "audio");
});

test("destiny tracker flips GM pools and serializes queued player requests", async () => {
  const values = new Map([["dPoolLight", 2], ["dPoolDark", 1]]);
  const changes = [];
  globalThis.game = {
    user: {id: "gm", isGM: true, hasRole: () => true},
    settings: {get: (namespace, key) => values.get(key), set: async (namespace, key, value) => { values.set(key, value); changes.push([key, value]); }},
    i18n: {localize: key => key},
  };
  globalThis.CONFIG = {ChatMessage: {documentClass: {create: async data => data}}, logger: {debug() {}}};
  const tracker = Object.create(DestinyTracker.prototype);
  tracker.destinyQueue = [];
  await tracker._changeDestiny({shiftKey: false, ctrlKey: false, metaKey: false}, {dataset: {group: "dPoolLight"}});
  assert.deepEqual(changes.slice(0, 2), [["dPoolLight", 1], ["dPoolDark", 2]]);
  tracker.destinyQueue.push({id: "player", type: "destiny-flip", light: -1, dark: 1});
  tracker.isRunningQueue = true;
  await tracker._processDestinyRequests();
  assert.equal(values.get("dPoolLight"), 2);
  assert.equal(values.get("dPoolDark"), 1);
  assert.equal(tracker.isRunningQueue, false);
});
