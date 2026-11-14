const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class WoundsStrainHUD extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "ffg-sw-wounds-strain-hud",
    classes: ["ffg-sw-hud-panel"],
    position: {
      width: 220,
      height: "auto",
      top: 80,
      left: 15
    },
    window: {
      title: "ffg-sw-hud.title",
      icon: "fas fa-heart-pulse",
      resizable: false,
      minimizable: false
    },
    actions: {
      "adjust-stat": WoundsStrainHUD.#onAdjustStat
    }
  };

  static PARTS = {
    hud: {
      template: "modules/ffg-star-wars-hud-enhancements/templates/hud-panel.hbs"
    }
  };

  /** @type {Token|null} */
  _token = null;

  /** @type {boolean} Whether the HUD is enabled via toggle */
  _enabled = true;

  /**
   * Set the tracked token and render the HUD (if enabled).
   * @param {Token} token
   */
  setToken(token) {
    const actor = token.actor;
    if (!actor) return;

    // Permission check: GM always, players need at least OBSERVER
    if (!game.user.isGM && !actor.testUserPermission(game.user, "OBSERVER")) return;

    this._token = token;
    if (this._enabled) this.render({ force: true });
  }

  /**
   * Clear the tracked token and close the HUD.
   */
  clearToken() {
    this._token = null;
    this.close();
  }

  /**
   * Toggle the HUD on/off. When toggled off, the HUD closes.
   * When toggled on, it opens for the current token if one is selected.
   */
  toggle(active = !this._enabled) {
    this._enabled = Boolean(active);
    if (!this._enabled) {
      this.close();
    } else {
      const token = canvas.tokens.controlled[0];
      if (token) this.setToken(token);
    }
  }

  /** @override */
  async _prepareContext(options) {
    const actor = this._token?.actor;
    if (!actor) return { hasData: false };

    const type = actor.type;
    const stats = actor.system.stats;
    const isVehicle = type === "vehicle";
    const hasStrain = type !== "minion" && type !== "rival";

    let primary, secondary;

    if (isVehicle) {
      primary = {
        label: game.i18n.localize("ffg-sw-hud.hull-trauma"),
        value: stats.hullTrauma.value,
        max: stats.hullTrauma.max,
        key: "system.stats.hullTrauma.value",
        exceeded: stats.hullTrauma.value > stats.hullTrauma.max
      };
      secondary = {
        label: game.i18n.localize("ffg-sw-hud.system-strain"),
        value: stats.systemStrain.value,
        max: stats.systemStrain.max,
        key: "system.stats.systemStrain.value",
        isStrain: true,
        exceeded: stats.systemStrain.value > stats.systemStrain.max
      };
    } else {
      primary = {
        label: game.i18n.localize("ffg-sw-hud.wounds"),
        value: stats.wounds.value,
        max: stats.wounds.max,
        key: "system.stats.wounds.value",
        exceeded: stats.wounds.value > stats.wounds.max
      };
      if (hasStrain) {
        secondary = {
          label: game.i18n.localize("ffg-sw-hud.strain"),
          value: stats.strain.value,
          max: stats.strain.max,
          key: "system.stats.strain.value",
          isStrain: true,
          exceeded: stats.strain.value > stats.strain.max
        };
      }
    }

    const soak = isVehicle
      ? { label: game.i18n.localize("ffg-sw-hud.armour"), value: stats.armour.value }
      : { label: game.i18n.localize("ffg-sw-hud.soak"), value: stats.soak.value };

    return {
      hasData: true,
      tokenName: this._token.name,
      soak,
      primary,
      secondary: secondary ?? null,
      canEdit: actor.testUserPermission(game.user, "OWNER")
    };
  }

  /**
   * Handle +1/-1 button clicks.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onAdjustStat(event, target) {
    const key = target.dataset.key;
    const delta = Number(target.dataset.delta);
    const actor = this._token?.actor;
    if (!actor?.testUserPermission(game.user, "OWNER")) return;
    const allowed = actor.type === "vehicle"
      ? ["system.stats.hullTrauma.value", "system.stats.systemStrain.value"]
      : ["system.stats.wounds.value", ...(["minion", "rival"].includes(actor.type) ? [] : ["system.stats.strain.value"])];
    if (!allowed.includes(key) || ![-1, 1].includes(delta)) return;
    const currentValue = Number(foundry.utils.getProperty(actor, key));
    if (!Number.isFinite(currentValue)) return;
    let newValue = Math.max(0, currentValue + delta);

    await actor.update({ [key]: newValue });
  }

}
