/** Prevent Foundry sheet initialization from writing to read-only compendium documents. */
export function canInitializeActorSheetFlags(actor) {
  return Boolean(actor && !actor.pack && actor.isOwner);
}
