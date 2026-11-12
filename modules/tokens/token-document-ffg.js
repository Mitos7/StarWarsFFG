/** Support editable FFG resource bars stored in extensible V14 ObjectFields. */
export class TokenDocumentFFG extends foundry.documents.TokenDocument {
  getBarAttribute(barName, options = {}) {
    let attribute = options.alternative || this[barName]?.attribute;
    const vehicle = this.actor?.type === "vehicle";
    const aliases = { wounds: vehicle ? "stats.hullTrauma" : "stats.wounds",
      strain: vehicle ? "stats.systemStrain" : "stats.strain",
      hullTrauma: "stats.hullTrauma", systemStrain: "stats.systemStrain" };
    attribute = aliases[attribute] || attribute;
    const result = super.getBarAttribute(barName, { ...options, alternative: attribute });
    // The transitional schema intentionally keeps stats extensible. Core treats
    // ObjectField descendants as read-only even though these four values persist.
    const resources = ["stats.wounds", "stats.strain", "stats.hullTrauma", "stats.systemStrain"];
    if (result?.type === "bar" && resources.includes(attribute)) {
      const stored = foundry.utils.getProperty(this.actor?._source?.system, attribute);
      if (stored && typeof stored.value === "number" && Number.isFinite(stored.value)) result.editable = true;
    }
    return result;
  }
}
