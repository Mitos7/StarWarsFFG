/**
 * Transitional V14 TypeDataModels for the original Star Wars FFG data shape.
 *
 * The legacy template defined user-extensible nested objects (skills, stats,
 * item upgrades, etc.). Preserve those structures with ObjectField instead of
 * imposing a closed nested SchemaField that could silently delete custom data.
 * Simple scalar fields are typed normally. A later change may introduce
 * stricter per-subtype nested schemas after world-migration tests.
 */
import {SYSTEM_DEFAULTS} from "./legacy-defaults.js";

function makeField(initialValue) {
  const {AnyField, ArrayField, BooleanField, NumberField, ObjectField, StringField} = foundry.data.fields;

  if (Array.isArray(initialValue)) {
    return new ArrayField(
      new AnyField({nullable: true, serializable: true}),
      {required: true, initial: () => foundry.utils.deepClone(initialValue)}
    );
  }
  if (initialValue !== null && typeof initialValue === "object") {
    return new ObjectField({required: true, initial: () => foundry.utils.deepClone(initialValue)});
  }
  if (typeof initialValue === "string") {
    return new StringField({required: true, initial: initialValue, blank: true});
  }
  if (typeof initialValue === "number") {
    return new NumberField({required: true, initial: initialValue});
  }
  if (typeof initialValue === "boolean") {
    return new BooleanField({required: true, initial: initialValue});
  }
  return new AnyField({required: false, nullable: true, serializable: true, initial: initialValue});
}

/**
 * Called synchronously during Foundry's init hook, before worlds load.
 * The subtype names are already declared in system.json > documentTypes.
 */
export function registerStarWarsDataModels() {
  for (const [documentName, typeDefaults] of Object.entries(SYSTEM_DEFAULTS)) {
    const documentConfig = CONFIG[documentName];
    if (!documentConfig?.dataModels) {
      throw new Error(`SWFFG: Missing CONFIG.${documentName}.dataModels`);
    }
    for (const [type, defaults] of Object.entries(typeDefaults)) {
      class StarWarsTypeData extends foundry.abstract.TypeDataModel {
        static migrateData(source, options = {}) {
          source = super.migrateData(source, options);
          // Old compendium imports may contain a partial stats object. ObjectField
          // supplies defaults only when the entire field is absent, unlike the
          // legacy template merge. Restore missing stats without losing existing
          // thresholds, custom resources or user-defined skill lists.
          // Partial form updates must not refill omitted fields with defaults.
          // Disabled controls are absent on submit, not requests to reset their values.
          if (!options.partial && defaults.stats && source.stats && typeof source.stats === "object" && !Array.isArray(source.stats)) {
            source.stats = foundry.utils.mergeObject(foundry.utils.deepClone(defaults.stats), source.stats);
          }
          return source;
        }

        static defineSchema() {
          return Object.fromEntries(
            Object.entries(defaults).map(([name, value]) => [name, makeField(value)])
          );
        }
      }
      documentConfig.dataModels[type] = StarWarsTypeData;
    }
  }
}
