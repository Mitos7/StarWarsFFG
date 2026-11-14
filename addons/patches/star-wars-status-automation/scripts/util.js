export function log_msg(feature, ...args) {
    if (game.settings.get("star-wars-status-automation", "debug-enable")) {
        console.log("star-wars-status-automation |", feature, ...args);
    }
}

export async function find_compendium_entity_by_id(type, id) {
    const packs = [...game.packs.values()].filter(pack => pack.documentName === type);
    // Prefer the owning module over unrelated packs that happen to reuse an ID.
    packs.sort((a, b) => Number(b.collection?.startsWith("star-wars-status-automation.")) -
        Number(a.collection?.startsWith("star-wars-status-automation.")));
    for (const pack of packs) {
        try {
            const index = await pack.getIndex();
            if (index.has(id)) return await pack.getDocument(id);
        } catch (error) {
            console.warn(`star-wars-status-automation | Cannot read ${pack.collection}`, error);
        }
    }
}
