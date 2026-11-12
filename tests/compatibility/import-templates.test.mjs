import test from "node:test";
import assert from "node:assert/strict";
import {getImportTemplate} from "../../modules/importer/document-defaults.js";

test("adversary weapon templates resolve locally without HTTP", () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("Unexpected network request"); };
  try { const weapon = getImportTemplate("weapon"); assert.ok(weapon.damage); assert.ok(weapon.skill); assert.ok(weapon.attributes); assert.equal(weapon.templates, undefined); }
  finally { globalThis.fetch = original; }
});

test("imported documents cannot mutate defaults or another import", () => {
  const first = getImportTemplate("weapon"); const second = getImportTemplate("weapon");
  first.damage.value = 999; first.attributes.custom = {value: 7};
  assert.notEqual(second.damage.value, 999); assert.equal(second.attributes.custom, undefined);
  assert.deepEqual(getImportTemplate("weapon"), second);
});

test("unknown document types fail explicitly", () => assert.throws(() => getImportTemplate("missing-type"), /Unknown/));
