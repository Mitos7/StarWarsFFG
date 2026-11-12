import {SYSTEM_DEFAULTS} from "../data/legacy-defaults.js";

/** Return an independent resolved template without requesting removed template.json. */
export function getImportTemplate(type) {
  const defaults = Object.values(SYSTEM_DEFAULTS).find(group => Object.hasOwn(group, type))?.[type];
  if (!defaults) throw new Error(`Unknown Star Wars document type: ${type}`);
  return structuredClone(defaults);
}
