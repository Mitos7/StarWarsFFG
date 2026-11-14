import {
    encumbrance_sync,
    get_encumbrance_talent,
} from "./scripts/encumbrance_automation.js";
import { init as settings_init } from "./scripts/settings.js";
import { init as babele_translation_init } from "./scripts/babele_translation.js";
import { add_talent } from "./scripts/talent.js";

Hooks.once("init", () => {
    settings_init();
    babele_translation_init();
});

Hooks.on("updateActor", (...args) => {
    encumbrance_sync("updateActor", ...args);
});

Hooks.on("updateItem", (...args) => {
    encumbrance_sync("updateItem", ...args);
});

Hooks.on("createItem", (...args) => {
    encumbrance_sync("updateItem", ...args);
});

Hooks.on("deleteItem", (...args) => {
    encumbrance_sync("updateItem", ...args);
});

Hooks.on("drawToken", (...args) => {
    encumbrance_sync("drawToken", ...args);
});

Hooks.on("canvasReady", (...args) => {
    encumbrance_sync("canvasReady", ...args);
});

window.talent = {
    setTalent: add_talent,
    getEncumbrance: get_encumbrance_talent,
    /*
    actor = game.actors.get("pllpGdsKEyqiLpMV") // ACTOR ID
    await window.talent.setTalent(actor, await window.talent.getEncumbrance(), 0);
    */
};
