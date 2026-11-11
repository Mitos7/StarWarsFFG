import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

import {SYSTEM_DEFAULTS} from "../../modules/data/legacy-defaults.js";
import {registerStarWarsDataModels} from "../../modules/data/system-data-models.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = JSON.parse(readFileSync(join(root, "system.json"), "utf-8"));

test("all declared document subtypes receive a V14 TypeDataModel", () => {
  class MockField {
    constructor(options = {}) { this.options = options; }
  }
  class MockArrayField extends MockField {
    constructor(member, options) { super(options); this.member = member; }
  }
  class MockTypeDataModel {}
  globalThis.foundry = {
    abstract: {TypeDataModel: MockTypeDataModel},
    data: {fields: {
      AnyField: MockField,
      ArrayField: MockArrayField,
      BooleanField: MockField,
      NumberField: MockField,
      ObjectField: MockField,
      StringField: MockField
    }},
    utils: {deepClone: structuredClone}
  };
  globalThis.CONFIG = {Actor: {dataModels: {}}, Item: {dataModels: {}}};
  registerStarWarsDataModels();
  for (const family of ["Actor", "Item"]) {
    const expectedTypes = Object.keys(manifest.documentTypes[family]).sort();
    assert.deepEqual(Object.keys(CONFIG[family].dataModels).sort(), expectedTypes);
    for (const subtype of expectedTypes) {
      const Model = CONFIG[family].dataModels[subtype];
      assert.ok(Model.prototype instanceof MockTypeDataModel);
      const schema = Model.defineSchema();
      const defaults = SYSTEM_DEFAULTS[family][subtype];
      assert.deepEqual(Object.keys(schema).sort(), Object.keys(defaults).sort());
      for (const [key, expected] of Object.entries(defaults)) {
        const initial = schema[key].options.initial;
        assert.deepEqual(typeof initial === "function" ? initial() : initial, expected,
          `${family}.${subtype}.${key} default mismatch`);
      }
    }
  }
  assert.equal(Object.keys(CONFIG.Actor.dataModels).length, 6);
  assert.equal(Object.keys(CONFIG.Item.dataModels).length, 20);
});

test("root template.json is absent, and the old defaults are reproducible", () => {
  assert.ok(!existsSync(join(root, "template.json")));
  assert.ok(existsSync(join(root, "scripts", "legacy-template.json")));
  const source = JSON.parse(readFileSync(join(root, "scripts", "legacy-template.json"), "utf-8"));
  for (const family of ["Actor", "Item"]) {
    for (const [subtype, defaults] of Object.entries(SYSTEM_DEFAULTS[family])) {
      const original = source[family][subtype];
      assert.ok(original);
      for (const [key, value] of Object.entries(original)) {
        if (key === "templates") continue;
        assert.deepEqual(defaults[key], value, `${family}.${subtype} legacy override`);
      }
      for (const template of original.templates ?? []) {
        for (const key of Object.keys(source[family].templates[template])) {
          assert.ok(key in defaults, `${family}.${subtype} missing template field ${key}`);
        }
      }
    }
  }
});
