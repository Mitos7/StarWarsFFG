const MODULE = "star-wars-status-automation";

export async function add_talent(actor, template, ranks) {
    if (!actor || !template) return;
    const existing = [...actor.items].filter(item => item.name === template.name);
    if (ranks <= 0) {
        if (existing.length) await actor.deleteEmbeddedDocuments("Item", existing.map(item => item.id));
        return;
    }
    let item = existing[0];
    if (!item) {
        const data = template.toObject ? template.toObject() : structuredClone(template);
        delete data._id;
        data.flags ??= {};
        data.flags[MODULE] = { ...data.flags[MODULE], managed: true };
        data.system ??= {};
        data.system.ranks ??= {};
        data.system.ranks.current = ranks;
        [item] = await actor.createEmbeddedDocuments("Item", [data]);
    } else if (Number(item.system.ranks.current) !== ranks || !item.flags?.[MODULE]?.managed) {
        await item.update({ "system.ranks.current": ranks, [`flags.${MODULE}.managed`]: true });
    }
}
