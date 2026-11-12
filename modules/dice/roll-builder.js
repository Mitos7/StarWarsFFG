import { MonteCarlo } from "../../lib/@swrpg-online/monte-carlo/dist/index.esm.js";

const {ApplicationV2, HandlebarsApplicationMixin} = foundry.applications.api;

/** Interactive dice-pool editor. Its positional constructor is the public DiceHelpers API. */
export default class RollBuilderFFG extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(rollData, rollDicePool, rollDescription, rollSkillName, rollItem, rollAdditionalFlavor, rollSound) {
    super();
    this.roll = {data: rollData, skillName: rollSkillName, item: rollItem, sound: rollSound, flavor: rollAdditionalFlavor};
    this.dicePool = rollDicePool;
    this.description = rollDescription;
  }

  static DEFAULT_OPTIONS = {
    id: "roll-builder", classes: ["starwarsffg", "roll-builder-dialog"], tag: "form",
    position: {width: 350}, window: {resizable: false},
    form: {handler: async function(event, form, formData) { return this._submitRoll(formData); }, closeOnSubmit: true, submitOnChange: false},
    actions: {
      "upgrade-pool": function(event, target) { return this._changeUpgrade(target.dataset.upgrade); },
      "increment-pool": function(event, target) { return this._changePoolValue(target.dataset.pool, 1); },
      "toggle-option": function(event, target) { return this._toggleOption(target); },
    },
  };

  static PARTS = {form: {template: "systems/starwarsffg/templates/dice/roll-options-ffg.html"}};

  get title() { return this.description || game.i18n.localize("SWFFG.RollingDefaultTitle"); }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const diceSymbols = {};
    for (const [name, symbol] of Object.entries({advantage: "AD", success: "SU", threat: "TH", failure: "FA", upgrade: "PR", triumph: "TR", despair: "DE", light: "LI", dark: "DA"})) {
      diceSymbols[name] = await foundry.applications.ux.TextEditor.enrichHTML(`[${symbol}]`);
    }
    const sounds = [];
    let canUserAddAudio = await game.settings.get("starwarsffg", "allowUsersAddRollAudio");
    const selectedSound = this.roll?.sound ?? this.roll?.item?.flags?.starwarsffg?.ffgsound;
    const addSounds = playlist => playlist?.sounds?.forEach(sound => sounds.push({name: sound.name, path: sound.path, selected: selectedSound === sound.path}));
    if (game.user.isGM) game.playlists.contents.forEach(addSounds);
    else if (canUserAddAudio) {
      const playlist = await game.playlists.get(await game.settings.get("starwarsffg", "allowUsersAddRollAudioPlaylist"));
      if (playlist) addSounds(playlist);
      else { CONFIG.logger.warn("Playlist for players does not exist, disabling audio"); canUserAddAudio = false; }
    }
    const users = [{name: "Send To All", id: "all"}];
    if (game.user.isGM) game.users.contents.forEach(user => { if (user.visible && user.id !== game.user.id) users.push({name: user.name, id: user.id}); });
    const displaySimulation = game.settings.get("starwarsffg", "displaySimulation");
    return Object.assign(context, {
      sounds, isGM: game.user.isGM, canUserAddAudio, flavor: this.roll.flavor, users,
      enableForceDie: game.settings.get("starwarsffg", "enableForceDie"),
      labels: {light: game.settings.get("starwarsffg", "destiny-pool-light"), dark: game.settings.get("starwarsffg", "destiny-pool-dark")},
      diceSymbols, simDisplay: (displaySimulation === "GM" && game.user.isGM) || displaySimulation === "All",
      simCount: game.settings.get("starwarsffg", "rollSimulation"),
    });
  }

  _onRender(context, options) {
    super._onRender(context, options);
    this._initializeInputs();
    this.element.addEventListener("contextmenu", event => {
      const target = event.target.closest("[data-pool]");
      if (!target || !this.element.contains(target)) return;
      event.preventDefault();
      this._changePoolValue(target.dataset.pool, -1);
    });
  }

  _input(pool) { return this.element.querySelector(`input[name="${pool}"]`); }

  _initializeInputs() {
    for (const input of this.element.querySelectorAll(".pool-value input, .pool-additional input")) {
      input.value = this.dicePool[input.name] ?? 0;
      if (input.closest(".pool-additional")) input.dataset.allowNegative = "true";
    }
    this._updatePreview();
  }

  _changeUpgrade(upgrade) {
    if (upgrade === "ability") this.dicePool.upgrade(1);
    else if (upgrade === "ability-down") this.dicePool.upgrade(-1);
    else if (upgrade === "difficulty") this.dicePool.upgradeDifficulty(1);
    else if (upgrade === "difficulty-down") this.dicePool.upgradeDifficulty(-1);
    this._initializeInputs();
  }

  _changePoolValue(pool, change) {
    const input = this._input(pool);
    if (!input) return;
    const next = Number(this.dicePool[pool] ?? input.value ?? 0) + change;
    if (next < 0 && input.dataset.allowNegative !== "true") return;
    this.dicePool[pool] = next;
    input.value = next;
    this._updatePreview();
  }

  _toggleOption(target) {
    target.classList.toggle("minimize");
    const control = target.nextElementSibling;
    if (!control) return;
    control.classList.toggle("hide"); control.classList.toggle("maximize");
    if (!target.classList.contains("minimize")) control.value = "";
  }

  _updatePreview() {
    const preview = this.element.querySelector(".dice-pool-dialog .dice-pool");
    if (!preview) return;
    preview.replaceChildren();
    this.dicePool.renderPreview(preview);
    this._updateSimulationPreview();
  }

  async _submitRoll(formData) {
    const values = formData?.object ?? formData ?? {};
    if (!this.roll.sound && values.sound) await this._saveSound(values.sound);
    if (!this.roll.flavor && values.flavor) this.roll.flavor = values.flavor;
    await this._ensureItemUuid();
    await this._removeOneTimeEffects();
    await this._consumeAmmo();
    return values.user ? this._sendPoolToPlayer(values.user) : this._dispatchRoll();
  }

  async _saveSound(sound) {
    this.roll.sound = sound;
    if (!this.roll.item) return;
    let item = this.roll.item;
    if (!item?.flags?.starwarsffg?.uuid && this.roll.data?.actor?._id) item = game.actors.get(this.roll.data.actor._id)?.items.get(item.id) ?? item;
    foundry.utils.setProperty(item, "flags.starwarsffg.ffgsound", sound);
    await item.update?.({"flags.starwarsffg.ffgsound": sound});
  }

  async _ensureItemUuid() {
    if (this.roll.item?.uuid && !this.roll.item.flags?.starwarsffg?.uuid) {
      const item = await fromUuid(this.roll.item.uuid);
      await item?.setFlag("starwarsffg", "uuid", this.roll.item.uuid);
    }
  }

  async _removeOneTimeEffects() {
    try {
      const actor = this.roll.data?.document;
      const ids = (actor?.getEmbeddedCollection("ActiveEffect")?.contents ?? []).filter(effect => effect?.system?.duration === "once").map(effect => effect._id);
      if (ids.length) await actor.deleteEmbeddedDocuments("ActiveEffect", ids);
    } catch (error) { CONFIG.logger.warn(`Caught error in roller: ${error}`); }
  }

  async _consumeAmmo() {
    try {
      if (this.roll.item?.type !== "weapon") return;
      const item = await foundry.utils.fromUuid(this.roll.item.uuid);
      if (item?.getFlag("starwarsffg", "config.enableAmmo")) await item.update({"system.ammo.value": item.system.ammo.value - 1});
    } catch (error) { CONFIG.logger.warn(`Caught ammo error in roller: ${error}`); }
  }

  async _sendPoolToPlayer(userId) {
    const container = document.createElement("div"); container.className = "dice-pool";
    this.dicePool.renderAdvancedPreview(container);
    const content = `<div><div>${game.i18n.localize("SWFFG.SentDicePoolRollHint")}</div>${container.innerHTML}<button class="ffg-pool-to-player">${game.i18n.localize("SWFFG.SentDicePoolRoll")}</button></div>`;
    const options = {user: game.user.id, content, flags: {starwarsffg: {roll: this.roll, dicePool: this.dicePool, description: this.description}}};
    if (userId !== "all") options.whisper = [userId];
    return ChatMessage.create(options);
  }

  async _dispatchRoll() {
    if (this.roll.crew) this.roll.item.crew = this.roll.crew;
    const roll = new game.ffg.RollFFG(this.dicePool.renderDiceExpression(), this.roll.item, this.dicePool, this.roll.flavor);
    if (this.roll.item?.crew && Object.keys(this.roll.item).length > 1) await this.roll.item.update({"flags.starwarsffg.crew": this.roll.item.crew});
    await roll.toMessage({user: game.user.id, speaker: {actor: game.actors.get(this.roll.data?.actor?._id), alias: this.roll.data?.token?.name, token: this.roll.data?.token?._id}, flavor: `${game.i18n.localize("SWFFG.Rolling")} ${game.i18n.localize(this.roll.skillName)}...`});
    if (this.roll.sound) AudioHelper.play({src: this.roll.sound}, true);
    return roll;
  }

  _updateSimulationPreview() {
    try {
      const simPool = new MonteCarlo({
        dicePool: {abilityDice: this.dicePool.ability, difficultyDice: this.dicePool.difficulty, proficiencyDice: this.dicePool.proficiency, challengeDice: this.dicePool.challenge, boostDice: this.dicePool.boost, setbackDice: this.dicePool.setback}, iterations: game.settings.get("starwarsffg", "rollSimulation"), runSimulate: false,
        modifiers: {automaticSuccesses: this.dicePool.success, automaticFailures: this.dicePool.failure, automaticAdvantages: this.dicePool.advantage, automaticThreats: this.dicePool.threat, automaticTriumphs: this.dicePool.triumph, automaticDespairs: this.dicePool.despair},
      });
      const result = simPool.simulate(); const chance = this.element.querySelector("#success_chance");
      if (!chance) return;
      chance.textContent = `${(result.successProbability * 100).toLocaleString(undefined, {maximumFractionDigits: 0})}%`;
      chance.classList.toggle("unlikely", result.successProbability < .25); chance.classList.toggle("likely", result.successProbability > .75);
    } catch (error) { /* Simulation preview must never prevent a roll. */ }
  }
}
