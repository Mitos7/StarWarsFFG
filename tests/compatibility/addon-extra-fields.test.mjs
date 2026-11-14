import test from "node:test";
import assert from "node:assert/strict";
const callbacks = new Map(); let listeners = 0;
globalThis.Hooks = {once() {}, on: (name, fn) => callbacks.set(name, fn)};
globalThis.foundry = {appv1: {api: {FormApplication: class {}}}, utils: {mergeObject: Object.assign}};
globalThis.CONFIG = {Actor: {sheetClasses: {}}};
globalThis.document = {querySelector: () => ({parentElement: {style: {}}})};
class Element {
  jquery = true; length = 1;
  find() {return new Element();} closest() {return this;} remove() {return this;}
  css() {return this;} parent() {return this;} after() {return this;}
  append() {return this;} on() {listeners++; return this;}
}
globalThis.$ = () => new Element();
const fields = [{group: "Test", name: "blank", value: 0}, {group: "Test", name: "Renown", value: 2}];
globalThis.game = {settings: {get: () => structuredClone(fields)}};
await import("../../addons/patches/lgs-extra-fields-for-star-wars/scripts/lgs-extra-fields-for-star-wars.js");
test("blank spacer fields no longer call find on a string, and unknown sheet registrations are safe", async () => {
  const actor = {type: "character", isOwner: true, name: "Test", getFlag: (_, key) => key === "extraFields" ? structuredClone(fields) : null,
    async update() {throw new Error("Rendering existing fields must not write the actor");}};
  await callbacks.get("renderActorSheet")({object: actor, isEditable: true}, new Element(), {});
  assert.equal(listeners, 1, "only the numeric field receives a change handler");
});
test("read-only sheets do not synchronize or mutate flags", async () => {
  const actor = {type: "character", isOwner: false,
    getFlag() {throw new Error("Read-only fields must not synchronize");}};
  await callbacks.get("renderActorSheet")({object: actor}, new Element(), {});
  await callbacks.get("renderActorSheet")({object: null}, new Element(), {});
});
