import { find_compendium_entity_by_id } from "./util.js";
import { update_status } from "./status_icon.js";

const MODULE = "star-wars-status-automation";
const pending = new WeakMap();

export async function get_encumbrance_talent() {
    const id = game.settings.get(MODULE, "encumbrance-talent-id");
    return find_compendium_entity_by_id("Item", id);
}

function primaryGM() {
    return game.user.isGM && (!game.users?.activeGM || game.users.activeGM.id === game.user.id);
}

// Serialize changes per actor. Several linked tokens share one Actor, whereas
// unlinked tokens have independent synthetic Actors with the same base ID.
async function syncToken(token) {
    const actor = token?.actor;
    if (actor?.type !== "character") return;
    const previous = pending.get(actor) ?? Promise.resolve();
    const task = previous.catch(() => {}).then(async () => {
        const stats = actor.system?.stats?.encumbrance;
        const value = Number(stats?.value);
        const max = Number(stats?.max);
        const brawn = Number(actor.system?.characteristics?.Brawn?.value);
        if (![value, max, brawn].every(Number.isFinite)) return;
        const enabled = game.settings.get(MODULE, "encumbrance-sync-enable");
        const ranks = enabled ? Math.max(0, value - max) : 0;
        // Equipment/talents can increase the threshold above Brawn + 5.
        await update_status(token, ranks, ranks > 0 && ranks >= brawn);
    });
    pending.set(actor, task);
    try { await task; }
    finally { if (pending.get(actor) === task) pending.delete(actor); }
}

export async function encumbrance_sync(source, ...args) {
    if (!primaryGM()) return;
    try {
        if (source === "canvasReady") return await update_encumbrance();
        if (source === "drawToken") return await syncToken(args[0]);
        const document = args[0];
        // Our own encumbrance talent must not trigger another inventory sync.
        if (document?.flags?.[MODULE]?.managed) return;
        if (source === "updateItem" && document?.type === "talent") {
            const template = await get_encumbrance_talent();
            if (template && document.name === template.name) return;
        }
        const actor = source === "updateActor" ? document : document?.actor;
        if (actor?.type !== "character") return;
        const tokens = (canvas.tokens?.placeables ?? []).filter(token => token.actor === actor || (actor.uuid && token.actor?.uuid === actor.uuid));
        if (tokens.length) await syncToken(tokens[0]);
    } catch (error) {
        console.error(`${MODULE} | Cannot synchronize encumbrance`, error);
    }
}

export async function update_encumbrance() {
    if (!primaryGM()) return;
    const seen = new Set();
    for (const token of canvas.tokens?.placeables ?? []) {
        const actor = token.actor;
        if (actor?.type !== "character" || seen.has(actor)) continue;
        seen.add(actor);
        // One malformed token must not stop every later character on the scene.
        try { await syncToken(token); }
        catch (error) { console.error(`${MODULE} | ${token.name ?? token.id}`, error); }
    }
}
