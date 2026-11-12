/**
 * Experimental Foundry native ItemSheetV2, independent of the legacy sheet.
 * Minimal editable fields are intentionally limited pending full migration.
 */
const {api, sheets, apps} = foundry.applications;
export class ItemSheetFFGAppV2 extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["starwarsffg", "swffg-app-v2", "swffg-item-app-v2"],
    tag: "form",
    position: {width: 710, height: 620},
    window: {resizable: true},
    form: {
      handler: async function(event, form, formData) {
        if (!this.isEditable) return;
        return this.document.update(formData.object);
      },
      closeOnSubmit: false,
      submitOnChange: false
    }
  };
  static PARTS = {
    main: {
      template: "systems/starwarsffg/templates/items/ffg-item-application-v2.hbs",
      scrollable: [".swffg-v2-body"]
    }
  };
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.document;
    context.item = item;
    context.canEdit = this.isEditable;
    context.fields = Object.entries(item.system ?? {}).flatMap(([key,value]) => {
      if (value && typeof value === "object" && !Array.isArray(value) &&
          (typeof value.value === "string" || typeof value.value === "number")) {
        return [{key,label:value.label ?? key,value:value.value,
          number:typeof value.value === "number"}];
      }
      return [];
    });
    return context;
  }
}

export function registerExperimentalItemSheet() {
  apps.DocumentSheetConfig.registerSheet(Item,"ffg",ItemSheetFFGAppV2,{
    label:"Star Wars FFG Item (ApplicationV2 - experimental)",
    makeDefault:false
  });
}
