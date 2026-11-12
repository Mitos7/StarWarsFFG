/** Native ActorSheetV2 implementation; it does not inherit an ApplicationV1 sheet. */
import {activeEffectCreateData} from "../compatibility/active-effects.js";

const {api, sheets, apps} = foundry.applications;
const localize = value => game.i18n?.has?.(value) ? game.i18n.localize(value) : value;

export class ActorSheetFFGAppV2 extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["starwarsffg", "swffg-app-v2", "swffg-actor-app-v2"], tag: "form",
    position: {width: 900, height: 740}, window: {resizable: true},
    form: {closeOnSubmit: false, submitOnChange: false, handler: async function(event, form, formData) {
      if (this.isEditable) return this.document.update(formData.object);
    }},
    actions: {
      "open-item": function(event, target) { return this._item(target.dataset.itemId)?.sheet?.render(true); },
      "delete-item": function(event, target) { return this._deleteItem(target.dataset.itemId); },
      "toggle-equipped": function(event, target) { return this._toggleEquipped(target.dataset.itemId); },
      "quantity": function(event, target) { return this._changeQuantity(target.dataset.itemId, Number(target.dataset.delta)); },
      "roll-skill": function(event, target) { return this._rollSkill(target.dataset.skill); },
      "roll-weapon": function(event, target) { return this._rollWeapon(target.dataset.itemId); },
      "roll-force": function(event, target) { return this._rollForce(target.dataset.itemId); },
      "toggle-force-upgrade": function(event, target) { return this._toggleForceUpgrade(target.dataset.itemId, target.dataset.upgrade); }
    }
  };
  static TABS = {primary: {navSelector: ".tabs", contentSelector: ".tab-content", initial: "overview"}};
  static PARTS = {main: {template: "systems/starwarsffg/templates/actors/ffg-actor-application-v2.hbs", scrollable: [".swffg-v2-body"]}};

  /** Compatibility bridge for the existing, system-owned dice roller (not a V1 sheet API). */
  async getData() {
    const actor = this.document;
    return {actor: actor.toObject?.(false) ?? {_id: actor.id, name: actor.name}, data: actor.system ?? {}, items: actor.items};
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options), actor = this.document;
    const system = actor.system ?? {}, stats = system.stats ?? {}, items = actor.items?.contents ?? Array.from(actor.items ?? []);
    context.actor = actor; context.canEdit = this.isEditable; context.actorType = actor.type;
    context.characteristics = Object.entries(system.characteristics ?? {}).map(([key, value]) => ({key, label: localize(value?.label ?? key), value: value?.value ?? 0}));
    context.stats = ["wounds", "strain", "soak", "defence", "credits", "forcePool"].filter(key => stats[key]).map(key => ({key, label: localize(stats[key]?.label ?? key), value: stats[key]?.value ?? 0, max: stats[key]?.max}));
    context.skills = Object.entries(system.skills ?? {}).map(([key, value]) => ({key, label: localize(value?.label ?? key), rank: value?.rank ?? 0, characteristic: value?.characteristic ?? ""})).sort((a, b) => a.label.localeCompare(b.label));
    context.items = items.map(item => ({id: item.id, name: item.name, type: item.type, img: item.img, equipped: Boolean(item.system?.equippable?.equipped), quantity: item.system?.quantity?.value, isWeapon: ["weapon", "shipweapon"].includes(item.type), isForcePower: item.type === "forcepower"}));
    context.weapons = context.items.filter(item => item.isWeapon);
    context.forcePowers = items.filter(item => item.type === "forcepower").map(item => ({id: item.id, name: item.name, img: item.img, upgrades: Object.entries(item.system?.upgrades ?? {}).filter(([, upgrade]) => upgrade?.visible !== false).map(([key, upgrade]) => ({key, name: upgrade.name || key, learned: Boolean(upgrade.islearned), cost: upgrade.cost ?? upgrade.xp ?? ""}))}));
    return context;
  }

  _item(id) { return this.document.items?.get?.(id); }
  async _deleteItem(id) { if (this.isEditable) return this._item(id)?.delete(); }
  async _toggleEquipped(id) { const item = this._item(id); if (this.isEditable && item?.system?.equippable) return item.update({"system.equippable.equipped": !item.system.equippable.equipped}); }
  async _changeQuantity(id, delta) { const item = this._item(id), quantity = Number(item?.system?.quantity?.value); if (this.isEditable && Number.isFinite(quantity)) return item.update({"system.quantity.value": Math.max(0, quantity + delta)}); }
  async _rollSkill(skillKey) { const skill = this.document.system?.skills?.[skillKey], characteristic = this.document.system?.characteristics?.[skill?.characteristic], roller = game.ffg?.DiceHelpers; if (skill && characteristic && roller) return roller.rollSkillDirect(skill, characteristic, 2, await this.getData()); }
  async _rollWeapon(itemId) { const item = this._item(itemId), roller = game.ffg?.DiceHelpers; if (item && roller && ["weapon", "shipweapon"].includes(item.type)) return roller.rollItem(item.id, this.document.id); }
  async _rollForce(itemId) { const item = this._item(itemId), pool = this.document.system?.stats?.forcePool, force = Number(pool?.max ?? 0) - Number(pool?.value ?? 0), roller = game.ffg?.DiceHelpers; if (item && force > 0 && roller && globalThis.DicePoolFFG) return roller.displayRollDialog(await this.getData(), new globalThis.DicePoolFFG({force}), `${localize("SWFFG.Rolling")} ${item.name}`, item.name, item); return ui.notifications?.info?.(localize("SWFFG.Roll.ForcePowers.NoDice")); }
  async _toggleForceUpgrade(itemId, upgradeKey) { const item = this._item(itemId), upgrade = item?.system?.upgrades?.[upgradeKey]; if (this.isEditable && upgrade) return item.update({[`system.upgrades.${upgradeKey}.islearned`]: !upgrade.islearned}); }

  async _onDropItem(event, item) {
    if (!this.isEditable || !item) return null;
    if (["itemmodifier", "itemattachment"].includes(item.type)) { ui.notifications?.warn?.("Item Modifiers and Attachments must be dropped on a compatible item sheet."); return null; }
    if (item.type === "criticaldamage" && this.document.type !== "vehicle") return null;
    if (item.parent?.uuid === this.document.uuid) return this._onSortItem(event, item);
    const data = item.toObject(false);
    for (const key of ["_id", "folder", "ownership", "_stats"]) delete data[key];
    data.effects = data.effects?.map(effect => activeEffectCreateData(effect)) ?? [];
    const [created] = await this.document.createEmbeddedDocuments("Item", [data]);
    return created ?? null;
  }
}

export function registerExperimentalActorSheet() {
  apps.DocumentSheetConfig.registerSheet(Actor, "ffg", ActorSheetFFGAppV2, {label: "Star Wars FFG (ApplicationV2 preview)", makeDefault: false});
}
