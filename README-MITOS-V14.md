# Star Wars FFG ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Mitos V14 build

Community compatibility build for Foundry VTT V14, based on `salohcin714/StarWarsFFG` pull request [#2280](https://github.com/StarWarsFoundryVTT/StarWarsFFG/pull/2280), itself based on the original [StarWarsFoundryVTT/StarWarsFFG](https://github.com/StarWarsFoundryVTT/StarWarsFFG) project.

Version: `2.0.5-mitos.11`  |  System ID: `starwarsffg`  |  Compatible generation: Foundry 14.

## Installation

Foundry VTT > Game Systems > Install System > Manifest URL:

`https://github.com/Mitos7/StarWarsFFG/releases/latest/download/system.json`

Or download the release `system.zip` and extract its contents into `FoundryVTT/Data/systems/starwarsffg`, with `system.json` directly inside that folder.

## Testing and limits

The source PR reports runtime checks on Foundry V14 build 366, and this fork has passed 20 compatibility unit tests and JavaScript syntax tests. A clean Foundry 14 build 369 world was created and an Actor was created and its character sheet opened successfully. The legacy root `template.json` warning is removed by registering transitional TypeDataModels for all 26 Actor/Item types; the original template is retained under `scripts/legacy-template.json` for reference. It is not an official upstream release, and later Foundry updates are not automatically guaranteed. Backup worlds before migration. This repo contains no copyrighted game rulebook content.

## Credits and license

Original project and contributors are preserved; see README.md and LICENSE.txt (MIT). Compatibility work by `salohcin714` in upstream PR #2280. This fork packages that patch for standalone Foundry installation.

## Setup card restored (v2.0.5-mitos.11)

The setup card and background were restored **byte for byte** from the previously published Mitos release v2.0.5-mitos.4: the classic yellow outlined Star Wars logo on black. The original logo SVG and source attribution remain in `assets/setup/`. This is NOT the procedural sci-fi drawing used in v2.0.5-mitos.3, nor the Imperial pause emblem used in v2.0.5-mitos.5.

The original StarWarsFoundryVTT/StarWarsFFG system did not ship a setup-card image in its manifest, but it does include an original Imperial insignia and window/character-sheet backgrounds. Those upstream resources remain unchanged in `images/`.

StarWarsFFG includes Star Wars and Genesys rules, skills and dice themes in the core system.

## Installing from a public Foundry client

In **Foundry V14 â†’ Game Systems â†’ Install System â†’ Manifest URL**, paste:

`https://github.com/Mitos7/StarWarsFFG/releases/latest/download/system.json`

The published `system.zip` contains the system code and `system.json` at
its ZIP root. A GitHub account is not required.

## Optional Star Wars add-on installer

This system recommends an **optional** installer collection,
`swffg-mitos-addons`. If Foundry offers it during system installation,
the user can choose whether to install it. Nothing is activated automatically.

It can also be installed separately from **Add-on Modules â†’ Install Module â†’
Manifest URL** using:

`https://raw.githubusercontent.com/Mitos7/StarWarsFFG/foundry-v14-mitos/addons/collection/module.json`

The [addon catalog](https://github.com/Mitos7/StarWarsFFG/blob/foundry-v14-mitos/addons/CATALOG.md)
lists all 20 independently installable packages and their authors, published
compatibility versions and warnings. Old addons verified only on Foundry V10â€“V13
are not guaranteed to work on V14. Some alter dice probabilities, and multiple
UI alternatives conflict. Activate and test selected addons one at a time.

Six licensed addons are mirrored with V14-era manifest syntax fixes. Other
addons retain their original publisher downloads; their internal legacy
manifests or code are not silently patched on the recipient's machine.
No proprietary game rulebooks, source art or premium content is included.

## Star Wars library included in the game system

Version 2.0.5-mitos.11 includes **12 native system compendium packs, with
180 Star Wars fan reference entries**: weapons, gear, armour, species,
careers, specializations, talents, Force concepts, adversaries, recognizable
characters, vehicles/starships, and adventure journals.

The Star Wars pack items use only pre-existing stock icons bundled with
the StarWarsFFG core system under `images/defaults/items/` and
`images/defaults/actors/`. No AI-generated or procedural image files are
created or distributed. All prototype tokens use the same valid original
icon path as their actors.

All text and numerical values are **fan-made demonstration content**;
they must not be confused with or substituted for official FFG/Edge
sourcebook statistics. Your own authorized OggDude data can be imported
separately and must remain distinguishable from fan entries.

The older `swffg-mitos-starter` add-on remains usable for 11 generic demo
packs; if enabled, its 12 Star Wars packs duplicate the system's library,
so disable it in a world where those duplicate lists are unwanted.
See `docs/library-catalogue.md` for details.
