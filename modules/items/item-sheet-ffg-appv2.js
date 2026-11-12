/** Native ItemSheetV2 with editable system fields and item-to-item associations. */
const {api, sheets, apps} = foundry.applications;
const localize = value => game.i18n?.has?.(value) ? game.i18n.localize(value) : value;
function fields(object, prefix = "", depth = 0) {
  if (!object || depth > 4) return [];
  return Object.entries(object).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value === null || ["string", "number", "boolean"].includes(typeof value)) return [{path, label: localize(key), value, number: typeof value === "number", boolean: typeof value === "boolean"}];
    return Array.isArray(value) ? [] : fields(value, path, depth + 1);
  });
}

export class ItemSheetFFGAppV2 extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["starwarsffg", "swffg-app-v2", "swffg-item-app-v2"], tag: "form", position: {width: 710, height: 620}, window: {resizable: true},
    form: {closeOnSubmit: false, submitOnChange: false, handler: async function(event, form, formData) { if (this.isEditable) return this.document.update(formData.object); }},
    actions: {
      "roll-item": function() { return this._rollItem(); }, "toggle-upgrade": function(event, target) { return this._toggleUpgrade(target.dataset.upgrade); },
      "remove-association": function(event, target) { return this._removeAssociation(target.dataset.type, target.dataset.id); }
    }
  };
  static TABS = {primary: {navSelector: ".tabs", contentSelector: ".tab-content", initial: "details"}};
  static PARTS = {main: {template: "systems/starwarsffg/templates/items/ffg-item-application-v2.hbs", scrollable: [".swffg-v2-body"]}};

  async _prepareContext(options) {
    const context = await super._prepareContext(options), item = this.document;
    context.item = item; context.canEdit = this.isEditable; context.fields = fields(item.system).filter(field => !field.path.startsWith("doNotSubmit"));
    context.isRollable = ["weapon", "shipweapon"].includes(item.type) && Boolean(item.actor);
    context.associations = ["itemmodifier", "itemattachment"].flatMap(type => (item.system?.[type] ?? []).map(entry => ({type, id: entry._id ?? entry.id ?? entry.name, name: entry.name, img: entry.img, rank: entry.system?.rank ?? entry.rank, active: entry.system?.active ?? entry.active})));
    context.upgrades = Object.entries(item.system?.upgrades ?? {}).filter(([, upgrade]) => upgrade?.visible !== false).map(([key, upgrade]) => ({key, name: upgrade.name || key, learned: Boolean(upgrade.islearned), cost: upgrade.cost ?? upgrade.xp ?? ""}));
    return context;
  }
  async _rollItem() { if (this.document.actor) return game.ffg?.DiceHelpers?.rollItem(this.document.id, this.document.actor.id); }
  async _toggleUpgrade(key) { const upgrade = this.document.system?.upgrades?.[key]; if (this.isEditable && upgrade) return this.document.update({[`system.upgrades.${key}.islearned`]: !upgrade.islearned}); }
  async _removeAssociation(type, id) { if (!this.isEditable || !["itemmodifier", "itemattachment"].includes(type)) return; const remaining = (this.document.system?.[type] ?? []).filter(entry => (entry._id ?? entry.id ?? entry.name) !== id); return this.document.update({[`system.${type}`]: remaining}); }

  async _onDropItem(event, item) {
    if (!this.isEditable || !item || !["itemmodifier", "itemattachment"].includes(item.type)) return null;
    const allowed = item.system?.type;
    if (!(allowed === "all" || allowed === this.document.type || (this.document.type === "shipweapon" && allowed === "weapon") || this.document.type === "itemattachment")) { ui.notifications?.warn?.("That modifier or attachment is not compatible with this item."); return null; }
    const data = item.toObject(false), type = item.type, current = foundry.utils.deepClone(this.document.system?.[type] ?? []);
    if (type === "itemattachment" && Number(this.document.system?.hardpoints?.adjusted ?? 0) < Number(data.system?.hardpoints?.value ?? 0)) { ui.notifications?.warn?.("Item does not have enough available hardpoints."); return null; }
    const existing = current.find(entry => entry.name === data.name);
    if (type === "itemmodifier" && existing && this.document.type !== "itemattachment") existing.system.rank = Number(existing.system?.rank ?? 0) + Number(data.system?.rank ?? 1);
    else current.push(data);
    await this.document.update({[`system.${type}`]: current});
    if (data.effects?.length) await this.document.createEmbeddedDocuments("ActiveEffect", data.effects.map(effect => ({...effect, disabled: false})));
    return item;
  }
}
export function registerExperimentalItemSheet() { apps.DocumentSheetConfig.registerSheet(Item, "ffg", ItemSheetFFGAppV2, {label: "Star Wars FFG Item (ApplicationV2 preview)", makeDefault: false}); }
