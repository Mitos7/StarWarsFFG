# ApplicationV2 migration: Foundry V16 preparation

Status: **IN PROGRESS**. Do not mark this system as compatible with V16 until tested against an actual V16 build. All world tests must occur in a disposable world.

## Migrated on branch `foundry-v16-application-v2`

- Seven settings submenu classes from `modules/settings/ui-settings.js`: `rulesetSettings`, `uiSettings`, `combatSettings`, `actorSettings`, `xpSpendingSettings`, `localizationSettings`, `groupManagerSettings`. They now extend `HandlebarsApplicationMixin(ApplicationV2)` and use `_prepareContext`, `PARTS`, a native form handler and action callbacks. The ruleset submenu was opened and submitted in live Foundry V14 build 369 without an error.
- Skill list importer from `modules/importer/skills-list-importer.js`: now extends `HandlebarsApplicationMixin(ApplicationV2)`, uses native actions and a template without inline JavaScript. Static tests pass; import/export actions still require interactive validation.

## Still needs conversion

- **Actor and Item sheets**: `modules/actors/actor-sheet-ffg.js`, `modules/actors/actor-sheet-ffg-v2.js`, `modules/actors/adversary-sheet-ffg.js`, `modules/actors/adversary-sheet-ffg-v2.js`, `modules/items/item-sheet-ffg.js`, `modules/items/item-sheet-ffg-v2.js`. The existing names suffixed `v2` are NOT Foundry ApplicationV2. They inherit legacy ActorSheet and ItemSheet classes. Migrate to `foundry.applications.sheets.ActorSheetV2` and `ItemSheetV2`, preserving draggable items, skill rolls, character creation, active effects, tab navigation, document editing and item drops.
- Destiny tracker: `modules/ffg-destiny-tracker.js`.
- Roll builder: `modules/dice/roll-builder.js`.
- Group manager: `modules/groupmanager-ffg.js`.
- Popout editors: `modules/popout-editor.js` and `modules/popout-modifiers.js`.
- Other importers: `modules/importer/swa-importer.js`, Item editor `modules/items/item-editor.js`.
- Crew configuration: `modules/settings/crew-settings.js`.
- Scan again for `FormApplication`, `foundry.appv1`, and legacy `Application` after each migration; remove all corresponding active registrations before V16.

## Verification required before release

- V14: settings submenu rendering, saving typed settings, file picker, reset, skill-list import/export, Actor/Item creation and edit, skill and dice rolls, combat, active effects, destiny point synchronization, token dragging, multi-client.
- V16: re-run in an isolated disposable test world on a real V16 build; no `ApplicationV1` runtime usage, no console errors; explicit world migration backups.
- **Do not replace the public V14 stable release with an incomplete V16 build.** The public release stays at `v2.0.5-mitos.2` while this branch is developed.

Current automated tests: 23 pass under Node 24. They do not replace browser integration tests.
