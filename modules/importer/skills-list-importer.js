import {defaultSkillList} from "../config/ffg-skillslist.js";

const {ApplicationV2, HandlebarsApplicationMixin} = foundry.applications.api;

/** Native ApplicationV2 skill-list manager. */
export default class SkillListImporter extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "swffg-skilllist-importer",
    classes: ["starwarsffg", "data-import"],
    window: {title: "Skill List Importer", resizable: true},
    position: {width: 440, height: 540},
    actions: {
      "reset-skills": async function() { return this._resetSkills(); },
      "download-skills": async function(event, target) { return this._downloadSkills(target.dataset.id); },
      "import-skills": async function() { return this._importSkills(); }
    }
  };

  static PARTS = {
    main: {template: "systems/starwarsffg/templates/importer/skill-list-importer-v2.hbs"}
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const currentSkillTheme = game.settings.get("starwarsffg", "skilltheme");
    context.cssClass = "data-importer-window";
    context.themes = CONFIG.FFG.alternateskilllists.map(list => ({
      name: list.id,
      isactive: currentSkillTheme === list.id,
      candelete: currentSkillTheme !== list.id && !["starwars", "genesys"].includes(list.id)
    }));
    return context;
  }

  async _resetSkills() {
    if (!game.user.isGM) return ui.notifications.warn("Only GMs can reset skill lists.");
    await game.settings.set("starwarsffg", "arraySkillList", foundry.utils.deepClone(defaultSkillList));
    await game.settings.set("starwarsffg", "skilltheme", "starwars");
    await this.close();
    window.location.reload();
  }

  async _downloadSkills(skillTheme) {
    if (!skillTheme) return;
    const current = game.settings.get("starwarsffg", "arraySkillList");
    const data = current.find(entry => entry.id === skillTheme);
    if (!data) return ui.notifications.warn("Skill theme not found.");
    const filename = `swffg-skilltheme-${skillTheme.replace(/[^a-z0-9_-]/gi, "_")}.json`;
    foundry.utils.saveDataToFile(JSON.stringify(data, null, 2), "application/json", filename);
  }

  async _importSkills() {
    if (!game.user.isGM) return ui.notifications.warn("Only GMs can import skill lists.");
    const input = this.element.querySelector('input[type="file"][name="data"]');
    const file = input?.files?.[0];
    if (!file) return ui.notifications.error("You did not upload a data file!");

    try {
      const text = await foundry.utils.readTextFromFile(file);
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed.id !== "string" || !parsed.id.trim()
        || !parsed.skills || Array.isArray(parsed.skills) || typeof parsed.skills !== "object") {
        throw new Error("Invalid skill-theme JSON: expected an id and skills object.");
      }
      for (const skill of Object.values(parsed.skills)) {
        if (!skill || typeof skill !== "object" || typeof skill.label !== "string") {
          throw new Error("Invalid skill entry in imported theme");
        }
        if (!skill.custom && !skill.label.includes("SWFFG.")) skill.custom = true;
      }
      const current = foundry.utils.deepClone(game.settings.get("starwarsffg", "arraySkillList"));
      const index = current.findIndex(entry => entry.id === parsed.id);
      if (index >= 0) current[index] = parsed;
      else current.push(parsed);
      await game.settings.set("starwarsffg", "arraySkillList", current);
      await this.close();
      window.location.reload();
    } catch (error) {
      CONFIG.logger.error("Error importing skill theme", error);
      ui.notifications.error("Error importing the file. Check the console for details.");
    }
  }
}
