# Star Wars FFG - Mitos V14 build

Community compatibility build for Foundry VTT V14, based on `salohcin714/StarWarsFFG` pull request [#2280](https://github.com/StarWarsFoundryVTT/StarWarsFFG/pull/2280), itself based on the original [StarWarsFoundryVTT/StarWarsFFG](https://github.com/StarWarsFoundryVTT/StarWarsFFG) project.

Version: `2.0.5-mitos.14`  |  System ID: `starwarsffg`  |  Compatible generation: Foundry 14.

## Installation

Foundry VTT > Game Systems > Install System > Manifest URL:

`https://github.com/Mitos7/StarWarsFFG/releases/latest/download/system.json`

Or download the release `system.zip` and extract its contents into `FoundryVTT/Data/systems/starwarsffg`, with `system.json` directly inside that folder.

## Testing and limits

The source PR reports runtime checks on Foundry V14 build 366, and this fork has passed 29 compatibility unit tests and JavaScript syntax tests. A clean Foundry 14 build 369 world was created and an Actor was created and its character sheet opened successfully. The legacy root `template.json` warning is removed by registering transitional TypeDataModels for all 26 Actor/Item types; the original template is retained under `scripts/legacy-template.json` for reference. It is not an official upstream release, and later Foundry updates are not automatically guaranteed. Backup worlds before migration. This repo contains no copyrighted game rulebook content.

## Credits and license

Original project and contributors are preserved; see README.md and LICENSE.txt (MIT). Compatibility work by `salohcin714` in upstream PR #2280. This fork packages that patch for standalone Foundry installation.

## Setup card restored (v2.0.5-mitos.12)

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
No proprietary game rulebooks or premium rules content is included. Artwork credits and source URLs are recorded separately.

## Star Wars library included in the game system

Version 2.0.5-mitos.14 includes **12 native system compendium packs, with
180 Star Wars fan reference entries**: weapons, gear, armour, species,
careers, specializations, talents, Force concepts, adversaries, recognizable
characters, vehicles/starships, and adventure journals.

The 175 illustrated Star Wars items and actors use locally bundled existing Star Wars artwork under `assets/starwars-original/`. The 60 native and 9 optional generic actor prototypes have separate circular tokens composed with Tokenizer 2. Generic NPCs use separate existing artwork rather than portraits of named heroes.

All text and numerical values are **fan-made demonstration content**;
they must not be confused with or substituted for official FFG/Edge
sourcebook statistics. Your own authorized OggDude data can be imported
separately and must remain distinguishable from fan entries.

The older `swffg-mitos-starter` add-on remains usable for 11 generic demo
packs; if enabled, its 12 Star Wars packs duplicate the system's library,
so disable it in a world where those duplicate lists are unwanted.
See `docs/library-catalogue.md` for details.

## Existing Star Wars artwork (v2.0.5-mitos.14)

All 175 illustrated Star Wars documents now use locally bundled Star Wars images instead of generic Foundry stock icons. Named heroes, species, ships and equipment use their matching existing images where available; abstract powers, talents and careers use representative Star Wars scenes. Both the built-in compendia and optional starter module (1.1.5) are updated. No images were generated with AI.

The 125 source images are unchanged downloads, predominantly from the official StarWars.com Databank. Some equipment and species use existing community artwork, game assets or replica photographs. Their exact origins, authors where known, and SHA-256 hashes are listed in `assets/starwars-original/sources.json`. Third-party artwork retains its respective ownership and is not covered by the code MIT license or the fan-data CC0 license.

Portraits preserve the full image. The release archive includes both `assets/` and `packs/`, so images are served locally without depending on external links at play time.

## Repairs in v2.0.5-mitos.14

All 230 illustrated source entries have existing local artwork; all 69 actors have baked Tokenizer 2 tokens. Generic smugglers, medics, officers, ISB agents, hunters and inquisitors no longer use named screen characters. Editable wound/hull and strain resource bars are supported on Foundry V14. OggDude mount attachments use an existing icon and imported vehicle prototypes receive their image and correct resource paths. Vehicle silhouettes use the V14 system field. SW Adversaries imports use bundled data defaults and serialize embedded weapon qualities as plain document data, avoiding removed template.json requests and V14 validation failures. The optional hangar setup is safe to call again without replacing an existing scene unless rebuild is explicitly requested.

OggDude and SW Adversaries data imported into a user world are not part of this system release. Imported source records without portraits retain type icons; do not mistake those for missing files.
