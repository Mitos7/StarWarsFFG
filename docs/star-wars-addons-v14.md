# Star Wars FFG add-on audit for Foundry V14 (12 November 2026)

## Installed locally, but not activated in any game world

The packages below were downloaded from their original publisher release archives, verified by package `module.json` ID, and installed in Foundry's shared `Data/modules` directory. **Installed does not mean validated against Foundry V14 or against this community system fork.** None were enabled in Aebraeth, Star City, or other worlds.

| Package ID | Version | Published support | Notes |
|---|---|---|---|
| ffg-star-wars-enhancements | 3.0.0 | Verified V13, no explicit maximum | Opening crawl, datapads, shops, hyperspace, attack animations; needs follow-up V14 integration test |
| star-wars-status-automation | 0.2.1 | Maximum V13 | Incompatible/untested with V14; do not enable until ported |
| genesys-ffg-options-enhancer | 1.1.1 | Maximum V13 | Extends combat and rolls, depends on Enhancements and Status Icon Counters; must adapt to fork's version and V14 |
| token-action-hud-ffgsw | 13.0.0.2_0_3 | Verified V13 | Requires Token Action HUD Core, which was already installed in a V14-compatible version |
| statuscounter | 3.1.3 | Verified V14.368 | Dependency for other FFG modules; installed, no world enabled |
| space-op-ui | 13.2 | Verified V13 | UI overhaul, could conflict with the system's own UI migration; keep disabled |

## Not installed because older versions are unsuitable for Foundry V14

FoundryMods lists 13 modules associated with Star Wars FFG, but that association does **not** mean they all work on V14 or should be enabled together. Excluded:
- Token Action HUD Classic: old V10-era module superseded by the already installed Token Action HUD Core.
- Star Wars - User Interface Creative Common: last verified V12, conflicts with Space Opera UI.
- Pool Party for FFG Star Wars: verified V11 and maximum V12, changes the roll dialog.
- Star Wars - Silhouette: verified V12, requires user-supplied OggDude images and modifies vehicle sheets.
- Alternative sheet design for FFG Star Wars: verified V12; directly conflicts with the current ActorSheetV2/ItemSheetV2 migration.
- Lyinggods Token Range Bands and Lyinggods Star Wars Extra Fields: verified V12, require porting (the latter modifies character sheets).
- SWRPG Karmic Dice: verified V12, modifies dice probabilities; not enabled or installed.
- Genesys and Star Wars modules should be integration-tested individually before activation. No rulebook or proprietary compendia were included.

## Module content not supplied by the FFG system

The StarWarsFFG Foundry system and these add-ons do not ship licensed FFG/Edge Star Wars RPG rulebook data or arbitrary copyrighted artwork. Players must supply their own authorized content and optional OggDude data if applicable.
