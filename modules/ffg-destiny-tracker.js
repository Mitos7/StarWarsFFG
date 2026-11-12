import { bindChatAction, registerChatMessageRender } from "./helpers/chat-message.js";

/**
 * A specialized form used to pop out the editor.
 * Native ApplicationV2 tracker for the shared destiny pool.
 *
 * OPTIONS:
 *
 *
 */
const {ApplicationV2, HandlebarsApplicationMixin} = foundry.applications.api;

export default class DestinyTracker extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(object={}, options={}) {
    // `object` is retained for compatibility with the old FormApplication
    // signature. The tracker has no document object.
    super(options);

    this.destinyQueue = [];
    this.isRunningQueue = false;
    if (options?.menu) {
      this.menu = options.menu;
    }
  }

  static DEFAULT_OPTIONS = {
    id: "destiny-tracker",
    classes: ["starwarsffg"],
    tag: "form",
    window: {title: "Destiny Tracker", resizable: false},
    position: {width: 180, height: 120},
    actions: {
      "toggle-destiny-menu": function(event, target) { return this._toggleMenu(target); },
      "destiny-menu-item": function(event, target) { return this._runMenuItem(event, target); },
      "change-destiny": function(event, target) { return this._changeDestiny(event, target); },
    },
  };

  static PARTS = {tracker: {template: "systems/starwarsffg/templates/ffg-destiny-tracker.html"}};

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    // Get current value
    let destinyPool = { light: game.settings.get("starwarsffg", "dPoolLight"), dark: game.settings.get("starwarsffg", "dPoolDark") };
    let destinyPoolLabel = { light: game.settings.get("starwarsffg", "destiny-pool-light"), dark: game.settings.get("starwarsffg", "destiny-pool-dark") };

    // filter menu based on role.

    const menu = (this.menu ?? []).map((item, index) => ({...item, index})).filter(item => game.user.hasRole(item.minimumRole) || !item.minimumRole);

    // Return data
    return Object.assign(context, {
      destinyPool,
      destinyPoolLabel,
      isGM: game.user.isGM,
      menu,
      theme: game.settings.get("starwarsffg", "dicetheme"),
    });
  }

  /* -------------------------------------------- */

  _onRender(context, options) {
    super._onRender(context, options);
    this._registerDestinyHandlers();
  }

  _toggleMenu(target) {
    const menu = this.element.querySelector(`#${target.id}Content`);
    if (!menu) return;
    menu.classList.toggle("show");
    const rect = menu.getBoundingClientRect();
    menu.classList.toggle("vertical", rect.x + rect.width < 0 || rect.y + rect.height < 0 || rect.y + rect.height > window.innerHeight || rect.x + rect.width > window.innerWidth || rect.x > window.innerWidth || rect.y > window.innerHeight);
  }

  _runMenuItem(event, target) {
    event.preventDefault();
    event.stopPropagation();
    this.menu?.[Number(target.dataset.index)]?.callback();
  }

  async _changeDestiny(event, target) {
    const pointType = target.dataset.group;
    const typeName = game.i18n.localize(game.settings.get("starwarsffg", pointType === "dPoolLight" ? "destiny-pool-light" : "destiny-pool-dark"));
    const add = event.shiftKey;
    const remove = event.ctrlKey || event.metaKey;
    const flipType = pointType === "dPoolLight" ? "dPoolDark" : "dPoolLight";
    let messageText;

    if (!add && !remove) {
      if (game.settings.get("starwarsffg", pointType) === 0) return ui.notifications.warn(`Cannot flip a ${typeName} point; 0 remaining.`);
      const pool = {light: game.settings.get("starwarsffg", "dPoolLight"), dark: game.settings.get("starwarsffg", "dPoolDark")};
      pool[flipType === "dPoolLight" ? "light" : "dark"]++;
      pool[pointType === "dPoolLight" ? "light" : "dark"]--;
      if (game.user.isGM) {
        await game.settings.set("starwarsffg", "dPoolLight", pool.light);
        await game.settings.set("starwarsffg", "dPoolDark", pool.dark);
      } else await game.socket.emit("system.starwarsffg", {pool});
      messageText = `<div class="destiny-flip ${flipType}"><div class="destiny-title">${game.i18n.localize("SWFFG.DestinyFlipMessage")}: <span class="${typeName}">${typeName}</span></div><div class="destiny-left ${flipType !== "dPoolDark"} dark">${game.i18n.localize(game.settings.get("starwarsffg", "destiny-pool-dark"))} ${game.i18n.localize("SWFFG.DestinyFlipRemaining")}: ${pool.dark}</div><div class="destiny-left ${flipType !== "dPoolLight"} light">${game.i18n.localize(game.settings.get("starwarsffg", "destiny-pool-light"))} ${game.i18n.localize("SWFFG.DestinyFlipRemaining")}: ${pool.light}</div></div>`;
    } else {
      if (!game.user.isGM) return ui.notifications.warn("Only GMs can add or remove points from the Destiny Pool.");
      await game.settings.set("starwarsffg", pointType, game.settings.get("starwarsffg", pointType) + (add ? 1 : -1));
      messageText = `${add ? "Added" : "Removed"} a ${typeName} point.`;
    }
    return CONFIG.ChatMessage.documentClass.create({user: game.user.id, content: messageText});
  }

  _registerDestinyHandlers() {
    if (this._destinyHandlersRegistered) return;
    this._destinyHandlersRegistered = true;

    // setup chat hook for destiny roll
    registerChatMessageRender((message, html) => {
      bindChatAction(html, "click", ".ffg-destiny-roll", this.OnClickRollDestiny.bind(this));
    });

    // setup socket handler for checking destiny roll
    game.socket.on("system.starwarsffg", async (...args) => {
      if (args[0]?.canIRollDestinyResponse === game.user.id && !game.user.isGM) {
        if (!args[0]?.rolled) {
          const roll = await this._rollDestiny();
          await game.socket.emit("system.starwarsffg", { destiny: game.user.id, light: roll.ffg.light, dark: roll.ffg.dark });
        } else {
          ui.notifications.error(`${game.i18n.localize("SWFFG.DestinyAlreadyRolled")}`);
        }
      }
    });

    if (game.user.isGM) {
      // socket handler for GM
      game.socket.on("system.starwarsffg", async (...args) => {
        // check if this is the GM intended to answer the question or not
        if (game.user.id !== game.users.activeGM?.id) {
          // limit rolling to a single GM
          return;
        }
        // Can user roll destiny? Or have they already rolled
        if (args[0]?.canIRollDestiny) {
          let rolled = false;

          try {
            rolled = await game.settings.get("starwarsffg", `destinyrollers${args[0]?.canIRollDestiny}`);
          } catch (err) {
            game.settings.register("starwarsffg", `destinyrollers${args[0].canIRollDestiny}`, {
              name: "DestinyRoll",
              scope: "client",
              default: false,
              config: false,
              type: Boolean,
            });
          }

          await game.socket.emit("system.starwarsffg", { canIRollDestinyResponse: args[0]?.canIRollDestiny, rolled });
        }

        // Handle user initiated destiny pool flips
        if (args[0]?.pool) {
          const light = await game.settings.get("starwarsffg", "dPoolLight");
          const dark = await game.settings.get("starwarsffg", "dPoolDark");

          const request = {
            id: "player",
            type: "destiny-flip",
            light: +light - +args[0].pool.light,
            dark: +dark - +args[0].pool.dark,
          };

          // only allow one player flip at a time.
          if (!this.destinyQueue.find((q) => q.id === request.id)) {
            this.destinyQueue.push(request);
          }
        }

        // Handle user report for initial Destiny roll
        if (args[0]?.destiny) {
          const request = {
            id: args[0].destiny,
            type: "destiny-roll",
            light: args[0].light,
            dark: args[0].dark,
          };

          // make sure only one player destiny roll is queued.
          if (!this.destinyQueue.find((q) => q.id === args[0].destiny) && CONFIG.FFG.DestinyGM === game.user.id) {
            this.destinyQueue.push(request);
          }
        }

        if (!this.isRunningQueue) {
          this.isRunningQueue = true;
          this._processDestinyRequests();
        }
      });
    }
  }

  // Click event for Roll Destiny Chat Message
  async OnClickRollDestiny(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!game.user.isGM) {
      await game.socket.emit("system.starwarsffg", { canIRollDestiny: game.user.id });
    }

    if (game.user.isGM) {
      const roll = await this._rollDestiny();

      const light = await game.settings.get("starwarsffg", "dPoolLight");
      const dark = await game.settings.get("starwarsffg", "dPoolDark");

      await game.settings.set("starwarsffg", "dPoolLight", light + roll.ffg.light);
      await game.settings.set("starwarsffg", "dPoolDark", dark + roll.ffg.dark);
    }
  }

  async _processDestinyRequests() {
    CONFIG.logger.debug(`Processing ${this.destinyQueue.length} Destiny Requests`);
    try {
      while (this.destinyQueue.length > 0) {
        const request = this.destinyQueue.shift();
        CONFIG.logger.debug(`Processing Destiny Request (${request.type}) from User ${request.id}`, request);
        const light = await game.settings.get("starwarsffg", "dPoolLight");
        const dark = await game.settings.get("starwarsffg", "dPoolDark");

        switch (request.type) {
          case "destiny-roll": {
            game.settings.set("starwarsffg", `destinyrollers${request.id}`, true);
            await game.settings.set("starwarsffg", "dPoolLight", light + request.light);
            await game.settings.set("starwarsffg", "dPoolDark", dark + request.dark);
            break;
          }
          case "destiny-flip": {
            await game.settings.set("starwarsffg", "dPoolLight", light - request.light);
            await game.settings.set("starwarsffg", "dPoolDark", dark - request.dark);
            break;
          }
        }
      }
    } finally {
      this.isRunningQueue = false;
    }
    CONFIG.logger.debug(`Done Processing Destiny Requests`);
  }

  async _rollDestiny() {
    const pool = new DicePoolFFG({
      force: 1,
    });

    const roll = new game.ffg.RollFFG(pool.renderDiceExpression());
    await roll.toMessage({
      user: game.user.id,
      flavor: `${game.i18n.localize("SWFFG.Rolling")} ${game.i18n.localize("SWFFG.DestinyPool")}...`,
    });

    return roll;
  }
}
