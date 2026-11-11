/**
 * Star Wars FFG settings menus.
 *
 * Native Foundry ApplicationV2 implementation; no FormApplication,
 * jQuery event bindings or legacy form-update hooks.
 */
const {ApplicationV2, HandlebarsApplicationMixin} = foundry.applications.api;

export class FFGSettingsV2 extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "swffg-settings-{id}",
    classes: ["starwarsffg", "ffg-settings-v2"],
    tag: "form",
    window: {title: "Star Wars FFG Settings", resizable: true},
    position: {width: 640, height: 650},
    form: {
      handler: async function(event, form, formData) {
        return this._saveSettings(formData);
      },
      closeOnSubmit: true,
      submitOnChange: false
    },
    actions: {
      "reset-settings": function() { return this.render({force: true}); },
      "file-picker": function(event, target) { return this._openFilePicker(target); }
    }
  };

  static PARTS = {
    settings: {template: "systems/starwarsffg/templates/dialogs/ffg-ui-settings-v2.hbs"}
  };

  static SETTING_KEYS = [];

  get title() {
    return game.i18n.localize(this.constructor.TITLE_KEY ?? "SWFFG.Settings.ui.Title");
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const settings = [];
    for (const fullKey of this.constructor.SETTING_KEYS) {
      const entry = game.settings.settings.get(fullKey);
      if (!entry) {
        console.warn("SWFFG | Unknown setting for ApplicationV2 menu:", fullKey);
        continue;
      }
      const value = game.settings.get(entry.namespace, entry.key);
      const setting = {
        ...entry,
        name: game.i18n.localize(entry.name),
        hint: game.i18n.localize(entry.hint),
        value,
        type: (typeof entry.type === "function" ? entry.type.name : "String"),
        isCheckbox: entry.type === Boolean,
        isSelect: entry.choices !== undefined,
        isRange: entry.type === Number && !!entry.range,
        isFilePicker: entry.valueType === "FilePicker"
      };
      settings.push(setting);
    }
    context.user = game.user;
    context.canConfigure = game.user.can("SETTINGS_MODIFY");
    context.systemTitle = game.system.title;
    context.data = {system: {title: game.system.title, menus: [], settings}};
    return context;
  }

  async _saveSettings(formData) {
    if (!game.user.can("SETTINGS_MODIFY")) {
      ui.notifications.error("Only a GM may change these settings.");
      return;
    }
    const submitted = foundry.utils.flattenObject(formData.object);
    for (const fullKey of this.constructor.SETTING_KEYS) {
      const config = game.settings.settings.get(fullKey);
      if (!config) continue;
      let value = submitted[fullKey];
      // Unchecked HTML checkboxes may be omitted from submitted forms.
      if (value === undefined) {
        if (config.type !== Boolean) continue;
        value = false;
      }
      if (config.type === Boolean) value = value === true || value === "true" || value === "on";
      else if (config.type === Number) {
        value = Number(value);
        if (!Number.isFinite(value)) throw new Error("Invalid numeric setting: " + fullKey);
      }
      else if (config.type === String && value != null) value = String(value);
      const previous = game.settings.get(config.namespace, config.key);
      if (!foundry.utils.equals(previous, value)) {
        await game.settings.set(config.namespace, config.key, value);
      }
    }
  }

  _openFilePicker(button) {
    const input = button.previousElementSibling;
    if (!input || !input.name) return;
    const picker = new foundry.applications.apps.FilePicker({
      type: "image",
      callback: path => {
        input.value = path;
        input.dispatchEvent(new Event("change", {bubbles: true}));
      }
    });
    return picker.browse();
  }
}


export class rulesetSettings extends FFGSettingsV2 {
  static DEFAULT_OPTIONS = {
    id: "ruleset-settings",
    classes: ["starwarsffg", "ffg-settings-v2", "ruleset-settings"]
  };
  static TITLE_KEY = "SWFFG.Settings.ruleset.Title";
  static SETTING_KEYS = ["starwarsffg.dicetheme", "starwarsffg.vehicleRangeBand", "starwarsffg.skilltheme", "starwarsffg.enableForceDie"];
}


export class uiSettings extends FFGSettingsV2 {
  static DEFAULT_OPTIONS = {
    id: "ui-settings",
    classes: ["starwarsffg", "ffg-settings-v2", "ui-settings"]
  };
  static TITLE_KEY = "SWFFG.Settings.ui.Title";
  static SETTING_KEYS = ["starwarsffg.ui-uitheme", "starwarsffg.ui-pausedImage", "starwarsffg.ui-token-healthy", "starwarsffg.ui-token-wounded", "starwarsffg.ui-token-overwounded", "starwarsffg.ui-token-stamina-ok", "starwarsffg.ui-token-stamina-damaged", "starwarsffg.ui-token-stamina-over", "starwarsffg.displaySimulation", "starwarsffg.rollSimulation"];
}


export class combatSettings extends FFGSettingsV2 {
  static DEFAULT_OPTIONS = {
    id: "combat-settings",
    classes: ["starwarsffg", "ffg-settings-v2", "combat-settings"]
  };
  static TITLE_KEY = "SWFFG.Settings.combat.Title";
  static SETTING_KEYS = ["starwarsffg.useGenericSlots", "starwarsffg.initiativeRule", "starwarsffg.removeCombatantAction", "starwarsffg.useDefense", "starwarsffg.additionalStatuses"];
}


export class actorSettings extends FFGSettingsV2 {
  static DEFAULT_OPTIONS = {
    id: "actor-settings",
    classes: ["starwarsffg", "ffg-settings-v2", "actor-settings"]
  };
  static TITLE_KEY = "SWFFG.Settings.actor.Title";
  static SETTING_KEYS = ["starwarsffg.enableSoakCalc", "starwarsffg.talentSorting", "starwarsffg.showMinionCount", "starwarsffg.showAdversaryCount", "starwarsffg.adversaryItemName", "starwarsffg.maxAttribute", "starwarsffg.maxSkill", "starwarsffg.medItemName", "starwarsffg.HealingItemAction", "starwarsffg.consumeHealingItem", "starwarsffg.RivalTokenPrepend"];
}


export class xpSpendingSettings extends FFGSettingsV2 {
  static DEFAULT_OPTIONS = {
    id: "xpSpending",
    classes: ["starwarsffg", "ffg-settings-v2", "xpSpending"]
  };
  static TITLE_KEY = "SWFFG.Settings.xpSpending.Title";
  static SETTING_KEYS = ["starwarsffg.specializationCompendiums", "starwarsffg.signatureAbilityCompendiums", "starwarsffg.forcePowerCompendiums", "starwarsffg.talentCompendiums", "starwarsffg.backgroundCompendiums", "starwarsffg.obligationCompendiums", "starwarsffg.speciesCompendiums", "starwarsffg.careerCompendiums", "starwarsffg.motivationCompendiums", "starwarsffg.itemCompendiums", "starwarsffg.notifyOnXpSpend", "starwarsffg.defaultObligation", "starwarsffg.defaultDuty", "starwarsffg.defaultMorality", "starwarsffg.maxRarity", "starwarsffg.allowRestricted", "starwarsffg.defaultCredits"];
}


export class localizationSettings extends FFGSettingsV2 {
  static DEFAULT_OPTIONS = {
    id: "localization",
    classes: ["starwarsffg", "ffg-settings-v2", "localization"]
  };
  static TITLE_KEY = "SWFFG.Settings.localization.Title";
  static SETTING_KEYS = ["starwarsffg.skillSorting", "starwarsffg.destiny-pool-light", "starwarsffg.destiny-pool-dark"];
}


export class groupManagerSettings extends FFGSettingsV2 {
  static DEFAULT_OPTIONS = {
    id: "group-manager",
    classes: ["starwarsffg", "ffg-settings-v2", "group-manager"]
  };
  static TITLE_KEY = "SWFFG.Settings.groupManager.Title";
  static SETTING_KEYS = ["starwarsffg.pcListMode", "starwarsffg.privateTriggers", "starwarsffg.GMCharactersInGroupManager"];
}

