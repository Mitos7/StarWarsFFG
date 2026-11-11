import test from "node:test";
import assert from "node:assert/strict";

class ApplicationV2 {}
globalThis.foundry = {
  applications: {api: {
    ApplicationV2,
    HandlebarsApplicationMixin: Base => class HandlebarsApp extends Base {
      async _prepareContext() { return {}; }
      render() {}
    }
  }},
  utils: {
    flattenObject: obj => obj,
    equals: (a, b) => JSON.stringify(a) === JSON.stringify(b)
  }
};
const path = "../../modules/settings/ui-settings.js";
const {
  FFGSettingsV2, rulesetSettings, uiSettings, combatSettings, actorSettings,
  xpSpendingSettings, localizationSettings, groupManagerSettings
} = await import(path);
const menuClasses = [rulesetSettings, uiSettings, combatSettings, actorSettings,
  xpSpendingSettings, localizationSettings, groupManagerSettings];

test("all seven settings menus extend native ApplicationV2", () => {
  assert.equal(menuClasses.length, 7);
  for (const cls of menuClasses) {
    assert.ok(cls.prototype instanceof ApplicationV2, cls.name);
    assert.ok(cls.prototype instanceof FFGSettingsV2, cls.name);
    assert.ok(cls.SETTING_KEYS.length > 0, cls.name);
    assert.equal(cls.DEFAULT_OPTIONS.classes.includes("ffg-settings-v2"), true);
    assert.ok(!cls.prototype.activateListeners);
  }
  assert.equal(FFGSettingsV2.DEFAULT_OPTIONS.tag, "form");
  assert.equal(FFGSettingsV2.DEFAULT_OPTIONS.form.closeOnSubmit, true);
});

test("V2 menu populates context from registered settings", async () => {
  const registry = new Map();
  const values = new Map();
  for (const key of rulesetSettings.SETTING_KEYS) {
    const [,name] = key.split(".");
    registry.set(key, {namespace:"starwarsffg",key:name,name,hint:name,type: name==="enableForceDie"?Boolean:String});
    values.set(key, name==="enableForceDie");
  }
  globalThis.game = {
    settings: {
      settings: registry,
      get: (ns,key) => values.get(ns+"."+key),
      set: (ns,key,val) => { values.set(ns+"."+key,val); return Promise.resolve(val); }
    },
    user: {can: () => true},
    system: {title:"Star Wars FFG"},
    i18n: {localize: s => s}
  };
  const app = new rulesetSettings();
  const data = await app._prepareContext({});
  assert.equal(data.data.system.settings.length, 4);
  assert.equal(data.data.system.settings[3].isCheckbox, true);
  assert.equal(data.data.system.settings[0].value, false);
});

test("V2 submit updates only whitelisted settings and handles unchecked checkbox", async () => {
  const app = new rulesetSettings();
  const calls = [];
  game.settings.set = async (ns,key,val) => { calls.push([ns,key,val]); return val; };
  await app._saveSettings({object: {
    "starwarsffg.dicetheme": "starwars",
    "starwarsffg.vehicleRangeBand": "genesys",
    "starwarsffg.skilltheme": "starwars",
    "starwarsffg.forbidden": "intruder"
  }});
  assert.ok(calls.some(call => call[1] === "vehicleRangeBand"));
  assert.ok(calls.some(call => call[1] === "enableForceDie" && call[2] === false));
  assert.ok(!calls.some(call => call[1] === "forbidden"));
});
