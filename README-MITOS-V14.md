# Star Wars FFG â€“ Mitos V14 build

Community compatibility build for Foundry VTT V14, based on `salohcin714/StarWarsFFG` pull request [#2280](https://github.com/StarWarsFoundryVTT/StarWarsFFG/pull/2280), itself based on the original [StarWarsFoundryVTT/StarWarsFFG](https://github.com/StarWarsFoundryVTT/StarWarsFFG) project.

Version: `2.0.5-mitos.4`  |  System ID: `starwarsffg`  |  Compatible generation: Foundry 14.

## Installation

Foundry VTT > Game Systems > Install System > Manifest URL:

`https://github.com/Mitos7/StarWarsFFG/releases/latest/download/system.json`

Or download the release `system.zip` and extract its contents into `FoundryVTT/Data/systems/starwarsffg`, with `system.json` directly inside that folder.

## Testing and limits

The source PR reports runtime checks on Foundry V14 build 366, and this fork has passed 20 compatibility unit tests and JavaScript syntax tests. A clean Foundry 14 build 369 world was created and an Actor was created and its character sheet opened successfully. The legacy root `template.json` warning is removed by registering transitional TypeDataModels for all 26 Actor/Item types; the original template is retained under `scripts/legacy-template.json` for reference. It is not an official upstream release, and later Foundry updates are not automatically guaranteed. Backup worlds before migration. This repo contains no copyrighted game rulebook content.

## Credits and license

Original project and contributors are preserved; see README.md and LICENSE.txt (MIT). Compatibility work by `salohcin714` in upstream PR #2280. This fork packages that patch for standalone Foundry installation.
## Setup artwork

The setup thumbnail uses the original Star Wars yellow logo sourced from Wikimedia Commons, not generated imagery. The original StarWarsFFG manifest did not include an official setup background. Please see assets/setup/SOURCE-STAR-WARS-LOGO.md for the precise provenance and trademark notice.
