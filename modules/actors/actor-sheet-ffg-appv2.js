/**
 * Experimental native ActorSheetV2 for the Star Wars FFG system.
 * Does not inherit from any ApplicationV1 sheet. Registered as an optional
 * alternative until equivalent mechanics have been migrated and tested.
 */
const {api, sheets, apps} = foundry.applications;

export class ActorSheetFFGAppV2 extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["starwarsffg", "swffg-app-v2", "swffg-actor-app-v2"],
    tag: "form",
    position: {width: 900, height: 740},
    window: {resizable: true},
    form: {
      handler: async function(event, form, formData) {
        if (!this.isEditable) return;
        return this.document.update(formData.object);
      },
      closeOnSubmit: false,
      submitOnChange: false
    },
    actions: {
      "open-item": function(event, button) {
        const item = this.document.items.get(button.dataset.itemId);
        return item?.sheet?.render(true);
      }
    }
  };

  static PARTS = {
    main: {
      template: "systems/starwarsffg/templates/actors/ffg-actor-application-v2.hbs",
      scrollable: [".swffg-v2-body"]
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const stats = actor.system?.stats ?? {};
    context.actor = actor;
    context.canEdit = this.isEditable;
    context.actorType = actor.type;
    context.characteristics = Object.entries(actor.system?.characteristics ?? {}).map(([key, value]) => ({
      key, label: value?.label || key, value: value?.value ?? 0
    }));
    context.stats = [
      {key: "wounds",label: "Wounds",value: stats.wounds?.value ?? 0, max: stats.wounds?.max ?? 0},
      {key: "strain",label: "Strain",value: stats.strain?.value ?? 0, max: stats.strain?.max ?? 0},
      {key: "soak",label: "Soak",value: stats.soak?.value ?? 0, max: null},
      {key: "credits",label: "Credits",value: stats.credits?.value ?? 0, max: null}
    ];
    context.skills = Object.entries(actor.system?.skills ?? {}).map(([key, value]) => ({
      key,
      label: game.i18n.has(value?.label) ? game.i18n.localize(value.label) : (value?.label ?? key),
      rank: value?.rank ?? 0,
      characteristic: value?.characteristic ?? "",
      type: value?.type ?? ""
    })).sort((a,b) => a.label.localeCompare(b.label));
    context.items = actor.items.contents.map(item => ({id:item.id,name:item.name,type:item.type,img:item.img}));
    return context;
  }
}

/** Register without changing the currently default V14 character sheet. */
export function registerExperimentalActorSheet() {
  apps.DocumentSheetConfig.registerSheet(Actor,"ffg",ActorSheetFFGAppV2,{
    label:"Star Wars FFG (ApplicationV2 - experimental)",
    makeDefault:false
  });
}
