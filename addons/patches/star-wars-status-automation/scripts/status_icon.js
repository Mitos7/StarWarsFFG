import { get_encumbrance_talent } from "./encumbrance_automation.js";
import { add_talent } from "./talent.js";

const MODULE = "star-wars-status-automation";

export async function update_status(token, ranks, over) {
    const actor = token?.actor;
    if (!actor) return;
    const normal = game.settings.get(MODULE, "encumbrance-sync-status");
    const heavy = game.settings.get(MODULE, "encumbrance-sync-status-over");
    const img = over ? heavy : normal;
    const status = over ? "overencumbered" : "encumbered";
    const managed = [...actor.effects].filter(effect =>
        effect.flags?.[MODULE]?.managed ||
        effect.img?.startsWith(`modules/${MODULE}/`) ||
        // Adopt effects created by this module's original 0.2.1 release only.
        ([normal, heavy].includes(effect.img) &&
            ["encumbered", "overencumbered"].includes(effect.flags?.core?.statusId))
    );
    let effect = ranks > 0 ? managed.find(entry => entry.img === img) : null;
    const remove = managed.filter(entry => entry !== effect).map(entry => entry.id);
    if (remove.length) await actor.deleteEmbeddedDocuments("ActiveEffect", remove);
    if (ranks > 0) {
        if (!effect) {
            [effect] = await actor.createEmbeddedDocuments("ActiveEffect", [{
                name: over ? "Overencumbered" : "Encumbered",
                img, statuses: [status],
                flags: { [MODULE]: { managed: true } }
            }]);
        } else if (!effect.flags?.[MODULE]?.managed) {
            effect = await effect.update({ [`flags.${MODULE}.managed`]: true });
        }
        const counter = globalThis.ActiveEffectCounter?.getCounter?.(effect);
        if (counter && counter.getValue() !== ranks) await counter.setValue(ranks);
    }
    const talent = await get_encumbrance_talent();
    if (talent) await add_talent(actor, talent, ranks);
    // Missing optional compendium content must not break token rendering.
}
