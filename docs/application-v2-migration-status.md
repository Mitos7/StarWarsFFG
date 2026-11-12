# ApplicationV2 migration: Foundry V16 preparation

Status: **IN PROGRESS — do not claim V16 compatibility yet.** The public stable release remains separately installable as `2.0.5-mitos.5`. This branch shares its version metadata and unchanged upstream imagery, but adds experimental ApplicationV2 code and is **not** a published V16-compatible release. Test world work must remain disposable.

## Native V2 work completed on `foundry-v16-application-v2`

- [x] Seven settings submenus in `modules/settings/ui-settings.js` use `HandlebarsApplicationMixin(ApplicationV2)`, native form handlers, and native action callbacks.
- [x] Skill-list importer uses native `ApplicationV2` actions and a non-inline-JavaScript template.
- [x] `ActorSheetFFGAppV2` is a real `HandlebarsApplicationMixin(ActorSheetV2)` sheet, registered as an **opt-in, non-default** preview. It has native V2 tabs/forms/actions; characteristics, resources and skills editing; skill rolls; weapon rolls; force-power rolls; force upgrade learning toggles; owned-item open/delete/equip/quantity actions; and document-level item drop/sort handling. Dropped effects are normalized through the V14 compatibility helper.
- [x] `ItemSheetFFGAppV2` is a real `HandlebarsApplicationMixin(ItemSheetV2)` opt-in preview. It exposes recursively discovered scalar system fields for editing, weapon rolls for owned weapons, force/signature upgrade toggles, and compatible modifier/attachment drops with hardpoint validation and active-effect transfer. Attached modifiers and attachments can be removed.
- [x] The native sheets do **not import or inherit** `ActorSheet`, `ItemSheet`, `FormApplication`, or another ApplicationV1 class. Their roll buttons call the existing system dice service through `game.ffg.DiceHelpers` at action time.
- [x] `RollBuilderFFG` is now a native `HandlebarsApplicationMixin(ApplicationV2)` form. Its positional DiceHelpers constructor, mutable dice-pool controls, upgrades, fixed-result modifiers, sound/flavor options, player dispatch, effect cleanup, ammo consumption, chat roll, and simulation preview remain implemented. This needs disposable-world browser coverage, especially the visual preview and token-owned item sound persistence.
- [x] `DestinyTracker` is now a native `HandlebarsApplicationMixin(ApplicationV2)` application. Native actions handle pool/menu interaction while its chat hook, player/GM socket protocol, and GM request queue remain in place. Runtime multi-client testing is still required.

## Deliberate remaining gaps

- [ ] The old default registrations (`ActorSheetFFGV2`, `ItemSheetFFGV2`) are still ApplicationV1-derived despite their names. They remain the default because there is not parity yet; do not flip this switch before browser/world verification.
- [ ] The preview does not yet implement the legacy XP purchase/refund dialogs, character creator, medical/rest actions, initiative and custom-skill context menus, vehicle crew/gunnery controls, or detailed item/chat pop-outs.
- [ ] Force/specialization/signature trees expose learning toggles but not the legacy tree-layout editor, connector editor, purchase-cost enforcement, or active-effect/source bookkeeping for every tree operation.
- [ ] Item association UI covers modifier/attachment installation/removal, but not the legacy embedded-item editor, attachment-modifier activation editor, species/career drag targets, specialization talent transfer, or summarized-quality presentation.
- [ ] `GroupManager`, crew settings, popout editors, item editor, SWA importer, and some test helpers still extend `FormApplication`; these are active V1 usage and must be ported before V16.

## API and testing evidence

Foundry's published `ActorSheetV2` API documents native `_onDropItem`, `_onSortItem`, `_onDragStart`, form submission, `actions`, and tab support. This implementation overrides `_onDropItem` with the documented resolved-Item signature and uses `DocumentSheetV2` rather than custom jQuery drag/drop wiring. The V14/V16 runtime behavior has **not** been tested in a Foundry browser during this change, so this is API-verified code, not runtime-certified code.

`D:\FoundryV14\node24\npm.cmd test` passed after the roll-builder and destiny-tracker migration: syntax check covered 98 modules and the Node compatibility suite passed 33 tests (including Star Wars / Genesys and original-image regression checks). The suite includes mocked native inheritance, roll form dispatch, and GM destiny-pool/queue coverage. It is not a substitute for a V14/V16 disposable-world sheet, visual roll dialog, chat, active-effect, combat, or multi-client test.

## Image and module audit safety

This development branch has been synchronized with stable 2.0.5-mitos.5 for unchanged original StarWarsFFG setup artwork (images/paused.png, images/bgWindow.jpg), native Genesys support and the documentation of available add-ons. The previous custom/generated setup artwork is not included. No locally installed third-party module is enabled or bundled into the system archive.
