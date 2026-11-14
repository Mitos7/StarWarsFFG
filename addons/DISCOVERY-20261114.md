# Catálogo ampliado de módulos Star Wars para Foundry

Búsqueda del 14 de noviembre de 2026. Objetivo de tu instalación: Foundry 14.369 y StarWarsFFG 2.0.5-mitos.14.

Se localizaron **91 familias de módulos**, agrupando variantes y forks, además de **28 recursos, prototipos o sistemas separados**. Se consultaron archivos de **130 repositorios candidatos**; los 529 resultados de búsqueda de GitHub incluyen duplicados de proyecto, sistemas y resultados ajenos al juego y no son un recuento de módulos.

**Localizado no significa instalado ni probado.** Las versiones de Foundry de las tablas son las declaradas por cada autor. Las pruebas reales anteriores están en [REVIEW-20261114.md](REVIEW-20261114.md). Esta búsqueda no cambió los módulos activos del mundo.

## Hallazgos que amplían o corrigen la revisión anterior

- Nuevos: Roger, Roger! (XML OggDude), Utilities, Workshops, Sabacc, Dice Stacks, Party Boost, críticos, adversarios, creador de personajes, traducciones y varias herramientas Genesys.
- Variantes V14 localizadas: Space Opera UI 14.0.2, Token Range Bands 2.0.1 y Token Action HUD FFG 14.0.0.2_0_5 de Saberofblue. Sus manifiestos declaran soporte V14; falta probar estas variantes en el mundo.
- Pool Party: el catálogo oficial lista versión 3 para Foundry 10–12, aunque su descarga devuelve 404. Los forks 1-dev encontrados antes no representan esa publicación. Se conserva la distinción en el JSON.
- Holocron de wanoo es una aplicación web compañera; Holocron de ObifourKenobi es una bóveda Obsidian. Ninguno se instala como módulo normal.
- Templates FFG y el antiguo SWRPG Compendium de LeeDurant tienen manifiestos JSON inválidos. El importador de adversarios de LuNoX conserva un manifiesto vacío.
- El importador XML de OggDude reemplaza los objetos y efectos del actor destino: la prueba debe realizarse sobre una copia.

## Recuento sin sumar forks como módulos

| Grupo | Familias |
|---|---:|
| StarWarsFFG: reglas, fichas, datos y utilidades | 44 |
| Genesys sobre el sistema StarWarsFFG | 5 |
| Mapas, cartas, temas y herramientas compartidas | 8 |
| Otros sistemas: SW5E, Saga, OpenD6 o Genesys independiente | 28 |
| Dependencias generales y HUD clásico | 6 |

## StarWarsFFG: reglas, fichas, datos y utilidades

| Módulo y fuente | Versión encontrada | Foundry declarado | Dependencias | Función / límite | Revisión anterior |
|---|---|---|---|---|---|
| [Adversaires](https://github.com/Acknar/SWFFG-Adversaires) | 1.0.0 | mín. 13; verif. 13 | — | Compendio de adversarios en francés. | Nuevo en el catálogo |
| [Beaver's System Adapter for Star Wars FFG](https://github.com/villain4hire78/bsa-starwarsffg) | v2.0.3 | mín. 11; verif. 12 | beavers-system-interface | Adaptador FFG para Beaver’s System Interface; no es contenido por sí solo. | Nuevo en el catálogo |
| [Crafting Workshops — Star Wars FFG](https://github.com/wanoo/swffg-workshops) | 2.1.0 | mín. 12; verif. 13 | — | Fabricación de sables, alquimia de la Fuerza y modificaciones de accesorios; inglés/francés. | Nuevo en el catálogo |
| [FFG Azecraft Addon](https://github.com/tomalaci/ffg-azecraft-addon) | 0.7.0 | mín. 13; verif. 13 | — | Utilidades FFG y panel de misiones de Mass Effect; mezcla contenido de otra ambientación. | Nuevo en el catálogo |
| [FFG Consumables](https://github.com/villain4hire78/ffg-consumables) | 1.0.0 | mín. 10; verif. 12; máx. 12 | starwarsffg | Seguimiento y uso de consumibles. Comprobar solapamiento con estimulantes de Enhancements. | Sí; ver límites de la revisión |
| [FFG Party Boosts & Bonus Bar](https://github.com/Lyinggod/ffg-party-boost) | 1.1.1 | mín. 11; verif. 12 | — | Bonificaciones y dados compartidos de grupo. | Nuevo en el catálogo |
| [FFG Roller](https://github.com/petepeg/FFG-Roller) | 0.3 | sin declarar | — | Lanzador histórico de dados FFG, anterior al sistema actual. | Nuevo en el catálogo |
| [FFG Star Wars - Alternative UI](https://github.com/TeddyBears/StarWarsFFG-alternative-UI) | 12.6.2.1_905 | mín. 12; verif. 12.331 | — | Diseño de fichas. Incluye la variante Genesys de Lyinggod bajo el mismo ID. | Sí; ver límites de la revisión |
| [FFG Star Wars - Utilities](https://github.com/TeddyBears/StarWarsFFG-utilities) | 12.0.3.1_903 | mín. 12; verif. 12 | babele, ffg-star-wars-enhancements | Macros de críticos, recuperación de tensión y ayudas de resultados; principalmente francés. | Nuevo en el catálogo |
| [FFG Star Wars Adversaries](https://github.com/nlx3647/ffg-swa) | 1.0.2 | mín. 9.280; verif. 9 | starwarsffg | Compendio de adversarios; Foundry 9 declarado. | Nuevo en el catálogo |
| [FFG Star Wars Character Creator](https://github.com/wrycu/StarWarsFFG-Character-Creator) | 0.0.1 | mín. 9; verif. 9 | starwarsffg, lib-wrapper | Asistente antiguo para crear personajes; revisar estado de desarrollo. | Nuevo en el catálogo |
| [FFG Star Wars Enhancements](https://github.com/Saberofblue/StarWarsFFG-Enhancements) | 3.2.1 | mín. 13; verif. 14.368 | fxmaster, lib-wrapper, statuscounter | Introducciones, tiendas, datapads, transiciones y ayudas de tirada. | Sí; ver límites de la revisión |
| [FFG Star Wars RPG Crits for Foundry VTT](https://github.com/nlx3647/ffg-crits) | 1.0.0 | mín. 9.280; verif. 9 | — | Otro paquete de críticos; no mezclar importaciones duplicadas. | Nuevo en el catálogo |
| [FFG Star Wars Space Opera Ui](https://github.com/Saberofblue/space-op-ui) | 14.0.2 | mín. 13; verif. 14.368 | — | Tema global. Variante Saberofblue V14 localizada; no combinar con otro tema global. | Sí; ver límites de la revisión |
| [FFG Star Wars Status Automation](https://github.com/Malven31/foundryVTT-SWFFG-status-automation) | 0.2.1 | mín. 12; verif. 12; máx. 13 | statuscounter, babele | Automatización de estados; necesita Status Icon Counters y Babele. | Sí; ver límites de la revisión |
| [FFG版スターウォーズ 日本語化MOD](https://github.com/dreamfv/starwarsffgJP) | 0.0.0 | mín. 11; verif. 11 | — | Traducción japonesa de términos del sistema. | Nuevo en el catálogo |
| [Flying is for Droids](https://github.com/LedtheTed/StarWarsFFG-FlyingIsForDroids) | 0.1 | mín. 12; verif. 12 | — | Automatización y reglas caseras de combate espacial. Faltan archivos compilados en el archivo revisado. | Sí; ver límites de la revisión |
| [Genesys FFG Options Enhancer](https://github.com/robert16444/Genesys-FFG-Options-Enhancer) | 1.1.1 | mín. 13; verif. 13; máx. 13 | ffg-star-wars-enhancements, statuscounter | Funciones de combate y Genesys. Exige sistema como máximo 2.0.4: no habilitado con 2.0.5-mitos.14. | Sí; ver límites de la revisión |
| [Health Estimate Star Wars FFG](https://github.com/prolice/healthEstimateSwffg) | 2.5.0 | mín. 0.5.0; verif. 0.7.9 | — | Indicador aproximado de salud. Se agrupan las dos adaptaciones FFG antiguas. | Nuevo en el catálogo |
| [Item Piles: Star Wars FFG](https://github.com/maersk-aerospace/FoundryVTT-ItemPiles-StarWarsFFG) | 0.0.1 | mín. 12; máx. 13 | item-piles | Adaptador FFG para Item Piles. Código fuente sin distribución lista para instalar confirmada. | Sí; ver límites de la revisión |
| [Kelborn's SWFFG Force Presence](https://github.com/YeNov/kelborns-swffg-force-presence) | 0.2.16 | mín. 13; verif. 14 | socketlib | Reglas opcionales que sustituyen Moralidad; exige StarWarsFFG 2.1.5, superior al sistema local. | Sí; ver límites de la revisión |
| [Lyinggods Clever Dice Re-roller (v12)](https://github.com/Lyinggod/lgs-swffg-reroller-v12) | 1.0.0 | mín. 12; verif. 12; máx. 12 | — | Repetir dados individuales. Declara sistema hasta 1.999 y Foundry 12. | Nuevo en el catálogo |
| [Lyinggods Extra Actor Fields for FFG Star Wars](https://github.com/Lyinggod/lgs-ffg-star-wars-extra-fields) | 1.0.3 | mín. 12; máx. 12 | — | Campos adicionales en fichas; el nombre antiguo del repositorio redirige al actual. | Sí; ver límites de la revisión |
| [Lyinggods Item Viewer](https://github.com/Lyinggod/lgs-item-viewer) | 1.0.4 | mín. 12; verif. 12; máx. 12 | — | Navegador de objetos; verificar utilidad frente al navegador ya incorporado al sistema. | Nuevo en el catálogo |
| [Lyinggods Token Range Bands](https://github.com/Saberofblue/lgs-token-range-bands) | 2.0.1 | mín. 13; verif. 14.368 | lib-wrapper | Bandas de alcance. Variante Saberofblue 2.0.1 declara V14; falta contrastarla con el parche local. | Sí; ver límites de la revisión |
| [Material Deck - Star Wars FFG](https://github.com/MaterialFoundry/MaterialDeck_StarWarsFFG) | 1.0.1 | mín. 10; verif. 11 | MaterialDeck | Integración con Material Deck; requiere su servidor y hardware externo. | Sí; ver límites de la revisión |
| [Pool Party for FFG Star Wars](https://github.com/tucker87/ffg-pool-party) | 1-dev | mín. 0.8.6; verif. 0.8.9 | — | Pools compartidos. Foundry lista versión 3, pero su enlace oficial devolvió 404; forks 1-dev recuperables. | Sí; ver límites de la revisión |
| [Roger, Roger! An OggDude XML Importer](https://github.com/Saberofblue/ffg-xml-importer) | 1.4.0 | mín. 12; verif. 14 | — | Importa personajes XML de OggDude. Antes de importar borra objetos y efectos del actor destino; probar sobre una copia. | Nuevo en el catálogo |
| [Sabacc — Star Wars FFG](https://github.com/wanoo/swffg-sabacc) | 1.2.0 | mín. 12; verif. 13 | — | Corellian Spike y Kessel Sabacc, manos privadas y apuestas con créditos de las fichas. | Nuevo en el catálogo |
| [Star Wars - Silhouette](https://github.com/prolice/starwars-silhouette) | 1.2.2 | mín. 10; verif. 12.331; máx. 12 | _mathjs | Siluetas y tamaños de naves; requiere Math.js. Importación de imágenes pendiente de prueba. | Sí; ver límites de la revisión |
| [Star Wars - User Interface Creative Common](https://github.com/prolice/swffgUI-cc) | 3.0.0 | mín. 12; verif. 13; máx. 13 | — | Tema global alternativo. Rama pública 3.0.0; la revisión anterior examinó 2.6.3. | Sí; ver límites de la revisión |
| [Star Wars All Compendia](https://github.com/prolice/starwars-all-compendia) | 12.330.0 | mín. 11; verif. 12; máx. 13 | — | Compendios comunitarios; revisar duplicados, idioma y referencias antes de importar. | Nuevo en el catálogo |
| [Star Wars FFG - Traduction Fr OggDude](https://github.com/Spocky69/StarWarsFFG-TraductionFrOggDude) | 0.5.0 | mín. 12; verif. 13 | babele | Traducción francesa de compendios importados de OggDude; requiere Babele. | Nuevo en el catálogo |
| [Star Wars FFG Addon Module](https://github.com/calumgould/star-wars-ffg-addon) | 0.2.0 | mín. 11; verif. 11 | socketlib | Utilidades y macros adicionales FFG; necesita socketlib. | Nuevo en el catálogo |
| [Star Wars FFG Critical Hits](https://github.com/laialex501/swffg-critical-hits) | 1.0.1 | mín. 0.6.0; verif. 0.8.8 | — | Heridas y daños críticos, tablas y macros; versión antigua. | Nuevo en el catálogo |
| [Star Wars FFG Fixes and Patches](https://github.com/kurigohan-lab/StarWarsFFGFixesandPatches) | 1.0.0 | mín. 12; verif. 13 | — | Parches comunitarios V12–13; comprobar solapamientos con los ya aplicados. | Nuevo en el catálogo |
| [Star Wars FFG HUD Enhancements](https://github.com/YeNov/ffg-star-wars-hud-enhancements) | 1.0.1 | mín. 13; verif. 13 | — | Heridas, tensión y trauma de casco desde el HUD del token. | Sí; ver límites de la revisión |
| [SWFFG Astronavigation — Astrogation & Atlas galactique](https://github.com/wanoo/swffg-astronavigation) | 2.0.4 | mín. 13; verif. 13 | campaign-codex | Mapa y cálculo de astrogación; requiere Campaign Codex. Incluye reglas de viaje propias. | Sí; ver límites de la revisión |
| [SWFFG Dice Stacks](https://github.com/YeNov/swffg-dice-stacks) | 0.0.1 | mín. 13; verif. 13.351 | statuscounter | Efectos de dados por un número de tiradas; necesita Status Icon Counters. | Nuevo en el catálogo |
| [SWRPG Dice Helper Compendium](https://github.com/DukeVenator/swffg-data-compendiums) | 1.1.4 | mín. 13; verif. 13 | ffg-star-wars-enhancements | Sugerencias para gastar resultados en todas las habilidades. | Sí; ver límites de la revisión |
| [SWRPG Karmic Dice](https://github.com/thompsdt/swrpg-karmic-dice) | 1.0.1 | mín. 12; verif. 12 | — | Modifica la distribución de resultados. Conservar las preferencias de probabilidad del mundo. | Sí; ver límites de la revisión |
| [Token Action HUD for FFG Star Wars](https://github.com/Saberofblue/token-action-hud-ffgsw) | 14.0.0.2_0_5 | mín. 13; verif. 14.368 | token-action-hud-core | Acciones desde los tokens. Variante Saberofblue V14 localizada; requiere HUD Core. | Sí; ver límites de la revisión |
| [Translation: Brazilian Portuguese [Star Wars FFG]](https://gitlab.com/fvtt-brasil/starwarsffg) | 0.3.0 | mín. 0.8.9; verif. 9 | — | Traducción brasileña; ficha oficial marcada como no publicada. | Nuevo en el catálogo |
| [Unofficial SWRPG Compendium](https://github.com/LeeDurant/swrpg) | 1.0.15 | mín. 0.7.10; verif. 0.8.9 | starwarsffg, compendium-folders, lib-wrapper | Compendios comunitarios antiguos de personajes y equipo. | Nuevo en el catálogo |

Los enlaces llevan al proyecto; el JSON adjunto conserva las URL de manifiesto, requisitos de sistema y variantes. Una versión con marcadores como `#{VERSION}#`, `[version]` o `auto replaced` procede del código fuente y no es una versión publicada válida.

## Genesys sobre el sistema StarWarsFFG

| Módulo y fuente | Versión encontrada | Foundry declarado | Dependencias | Función / límite | Revisión anterior |
|---|---|---|---|---|---|
| [Genesys compendiums](https://github.com/ndebogory/genesys_compendiums) | 0.5.0 | mín. 10; verif. 13 | — | Arquetipos, críticos, cualidades y macros de Genesys para el sistema StarWarsFFG. | Nuevo en el catálogo |
| [GenesysRef API Importer for StarWarsFFG](https://gitlab.com/rlnrln/genesysref-api-for-swffg) | 0.1.3 | mín. 13; verif. 13 | — | Importador de colecciones JSON GenesysRef al modelo de StarWarsFFG; no incluye los datos de los libros. | Nuevo en el catálogo |
| [Lyinggods Genesys Extra Actor Tabs](https://github.com/Lyinggod/lgs-genesys-actor-extra-tabs) | 1.0.0 | mín. 11.0.0; verif. 12 | — | Contactos, favores y habilidades heroicas de Genesys sobre StarWarsFFG. | Nuevo en el catálogo |
| [Lyinggods Genesys Spell Selector](https://github.com/Lyinggod/lgs-genesys-spell-selector) | 0.3.1 | mín. 11.0.0; verif. 12.999; máx. 12.999 | — | Constructor de magia de Genesys sobre StarWarsFFG; no es un árbol de poderes de la Fuerza. | Nuevo en el catálogo |
| [Lyinggods Talent Pyramid + Ability Costs](https://github.com/Lyinggod/lgs-talent-pyramid) | 1.0.0 | mín. 11; verif. 12; máx. 12 | — | Pirámide de talentos y costes de Genesys; reglas distintas a las especializaciones de Star Wars. | Nuevo en el catálogo |

Los enlaces llevan al proyecto; el JSON adjunto conserva las URL de manifiesto, requisitos de sistema y variantes. Una versión con marcadores como `#{VERSION}#`, `[version]` o `auto replaced` procede del código fuente y no es una versión publicada válida.

## Mapas, cartas, temas y herramientas compartidas

| Módulo y fuente | Versión encontrada | Foundry declarado | Dependencias | Función / límite | Revisión anterior |
|---|---|---|---|---|---|
| [Carte Galactique](https://github.com/Acknar/Carte-Galactique) | 1.0.0 | mín. 13; verif. 13 | — | Mapa galáctico con diarios de planetas; contenido en francés. | Nuevo en el catálogo |
| [Corellian Spike Sabacc](https://github.com/thenotoriousJeremy/foundry-sabacc) | 2.2.0 | mín. 12; verif. 13 | — | Corellian Spike Sabacc; revisar apuestas y permisos en FFG. | Nuevo en el catálogo |
| [Pazaak — Star Wars Card Game](https://github.com/rafkro632816/pazaak-fvtt) | 1.0.0 | mín. 13; verif. 14 | — | Pazaak independiente del sistema; verificar el manejo de créditos en FFG. | Nuevo en el catálogo |
| [Special Dice Roller](https://github.com/BernhardPosselt/foundryvtt-special-dice-roller) | 1.0.0 | mín. 12; verif. 12; máx. 12 | — | Dados especiales para varios juegos, incluidos Star Wars FFG y Genesys. | Nuevo en el catálogo |
| [Star Wars Galaxy Map & Hyperspace Calculator](https://github.com/tomjdr4-hub/foundry-swgalaxy-map) | 0.1.0 | mín. 13; verif. 13; máx. 14 | — | Mapa galáctico y calculadora aproximada de viajes. | Sí; ver límites de la revisión |
| [Story Points](https://github.com/ipmillar/story-points) | 1.2.1 | mín. 10; verif. 13.342; máx. 13.999 | — | Contador genérico de monedas/puntos narrativos, inspirado en Genesys. | Nuevo en el catálogo |
| [Storyteller Star Wars Theme](https://github.com/for-the-new-order/storyteller-star-wars-theme) | 1.0.10 | mín. 10; verif. 9 | storyteller | Apariencia de datapad para Storyteller; requiere ese módulo. | Nuevo en el catálogo |
| [SW Card Games](https://github.com/awitteck/sw-card-games) | 11.0.0 | mín. 11; verif. 11 | — | Barajas de juegos de Star Wars y reglas breves; compendios de cartas. | Nuevo en el catálogo |

Los enlaces llevan al proyecto; el JSON adjunto conserva las URL de manifiesto, requisitos de sistema y variantes. Una versión con marcadores como `#{VERSION}#`, `[version]` o `auto replaced` procede del código fuente y no es una versión publicada válida.

## Otros sistemas: SW5E, Saga, OpenD6 o Genesys independiente

| Módulo y fuente | Versión encontrada | Foundry declarado | Dependencias | Función / límite | Revisión anterior |
|---|---|---|---|---|---|
| [Arbron’s Summoning](https://github.com/thenotoriousJeremy/fvtt-summoner-sw5e) | 1.1.6 | mín. 10.274; verif. 11 | warpgate | Fork de invocaciones/acompañantes para SW5E. | Nuevo en el catálogo |
| [Argon - Combat HUD (SW5E)](https://github.com/sw5e-foundry/enhancedcombathud-sw5e) | 1.0 | mín. 11; verif. 11 | enhancedcombathud | HUD Argon adaptado a SW5E. | Nuevo en el catálogo |
| [Automated Animations – Genesys Support](https://github.com/Stormyvil/Genesys-Automated-Animations) | 1.0.1 | mín. 12; verif. 13 | autoanimations | Integración de animaciones para el sistema genesys independiente. | Nuevo en el catálogo |
| [Dawn of Defiance](https://github.com/thenotoriousJeremy/dawnofdefiance) | 1.0.0 | mín. 9; verif. 11 | — | Campaña Dawn of Defiance adaptada a SW5E; manifiesto antiguo con campos mal ubicados. | Nuevo en el catálogo |
| [Foundry VTT Content Parser](https://github.com/JackDCondon/foundryvtt-importer-genesys) | 0.2.40 | mín. 8; verif. 10.285; máx. 10 | — | Fork de importación Genesys. El enlace de actualización apunta al proyecto genérico, no a este fork. | Nuevo en el catálogo |
| [Genesys Combat Enhancements](https://github.com/Stosart/genesys-combat-enhancements) | 1.0.0 | mín. 10; verif. 12 | — | Automatizaciones para el sistema genesys independiente. | Nuevo en el catálogo |
| [Genesys Dice Forge](https://github.com/GuteboysFactory/Gutes-Dice-Forge) | 1.0.2 | mín. 13.351; verif. 13.351; máx. 14 | — | Dados 3D Genesys; V14 declarado pero el propio autor indica falta de prueba real en V14. | Nuevo en el catálogo |
| [Genesys Initiative Slots](https://github.com/Nyliss/foundryvtt-genesys-initiative-slots) | 0.2.5 | mín. 13; verif. 13.351 | — | Turnos por huecos de iniciativa del sistema genesys independiente. | Nuevo en el catálogo |
| [Genesys Inventions](https://github.com/Nyliss/foundryvtt-genesys-inventions) | 0.3.2 | mín. 13; verif. 13 | — | Inventos, componentes y esquemas del sistema genesys independiente. | Nuevo en el catálogo |
| [Genesys Ref Importer](https://github.com/3darkman/foundryvtt-genesysref-importer) | 0.1.1 | mín. 12; verif. 12 | — | Importador para el sistema genesys independiente; no declara StarWarsFFG. | Nuevo en el catálogo |
| [Genesys Status Effects](https://github.com/Stormyvil/Genesys-Status-Effects) | 1.0.1 | mín. 12; verif. 13; máx. 13 | — | Iconos de estados para Genesys; no es automatización FFG. | Nuevo en el catálogo |
| [Genesys Toolkit](https://github.com/Nyliss/foundryvtt-genesys-dice-helper) | 1.1.1 | mín. 13; verif. 13.351 | — | Ayudas de dados y críticos para el sistema genesys independiente. | Nuevo en el catálogo |
| [Genesys Weapon Qualities](https://github.com/Stormyvil/Genesys-Weapon-Qualities) | 1.0.1 | mín. 12; verif. 13; máx. 13 | — | Modificadores de dados por cualidades de armas para el sistema genesys independiente. | Nuevo en el catálogo |
| [Ready Set Roll for sw5e](https://github.com/sw5e-foundry/fvtt-ready-set-roll-sw5e) | 1.0.0 | mín. 10.274; verif. 10.290; máx. 10 | lib-wrapper | Tiradas mejoradas para el antiguo sistema sw5e. | Nuevo en el catálogo |
| [Roll New Character Stats (RNCS) SW5E](https://github.com/sw5e-foundry/roll-new-character-stats-sw5e) | 3.1.4 | mín. 0.8.6; verif. 9 | — | Generación de atributos de personajes SW5E. | Nuevo en el catálogo |
| [Savage Worlds Star Wars](https://github.com/Alex76g/swsw) | 0.0.26 | mín. 0.7.9; verif. 0.7.9 | — | Contenido y macros para partidas de Star Wars con Savage Worlds; proyecto distinto a StarWarsFFG. | Nuevo en el catálogo |
| [Star Wars - User Interface Creative Common 1138](https://github.com/Elek1138/swffgUI-cc-1138) | 2.5.0 | mín. 10; verif. 11.315; máx. 11 | — | Variante del tema CC cuyo manifiesto exige OpenD6. | Nuevo en el catálogo |
| [Star Wars D6 - Aventure - Les pirates de Prexiar](https://gitlab.com/mich.michoui/starwarsd6-adventure-pirates-prexiar-fr) | 1.0.0 | mín. 0.8.6; verif. 10 | starwarsd6-essentialcompanion-od6s | Aventura Los piratas de Prexiar en francés, para Star Wars D6/OpenD6. | Nuevo en el catálogo |
| [Star Wars Sheets for OpenD6](https://github.com/algnc/od6s-star-wars) | 1.0.6 | mín. 10; verif. 11; máx. 12 | — | Fichas para OpenD6; no corresponde a StarWarsFFG. | Nuevo en el catálogo |
| [SW5E](https://github.com/sw5e-foundry/sw5e-module) | 1.4.3 | mín. 13; verif. 13 | lib-wrapper | Implementación SW5E sobre dnd5e; no activar en el mundo FFG. | Nuevo en el catálogo |
| [SW5E Companions](https://github.com/sw5e-foundry/sw5e-companions) | [version] | mín. 11; verif. 11 | — | Compendios de acompañantes para SW5E. | Nuevo en el catálogo |
| [sw5e Force Alignment](https://github.com/intuited/fvtt-sw5e-force-alignment) | 0.0.1 | mín. 10; verif. 10 | — | Alineamiento de la Fuerza en SW5E. | Nuevo en el catálogo |
| [SW5e Variant Rules](https://github.com/DeviousFate/SW5e-Variant-Rules) | 0.2.25 | mín. 13; verif. 13 | sw5e-module | Reglas opcionales para SW5E sobre dnd5e. | Nuevo en el catálogo |
| [The Essential Companion to Star Wars D6 on OpenD6 Space](https://github.com/DarthBanjo/starwarsd6-essentialcompanion-od6s) | 12.0.3 | mín. 13; verif. 14.365; máx. 14 | — | Contenido y configuración Star Wars D6 para OpenD6; se agrupan el original y el fork REUP. | Nuevo en el catálogo |
| [The Mandalorian Codex](https://github.com/sw5e-foundry/mandalorian-codex) | 3.4.1.2.0.0 | mín. 2.3.0; verif. 11 | — | Compendios mandalorianos para SW5E. | Nuevo en el catálogo |
| [Token Action HUD - Star Wars Saga Edition](https://github.com/Wes-l-eye/token-action-hud-swse) | 1.3.0 | mín. 13; verif. 13 | token-action-hud-core | HUD para Saga Edition; sistema distinto de StarWarsFFG. | Nuevo en el catálogo |
| [Token Action HUD SW5e](https://github.com/sw5e-foundry/token-action-hud-sw5e) | 1.5.1.1 | mín. 10; verif. 11.313 | token-action-hud-core | HUD para SW5E. | Nuevo en el catálogo |
| [Triston's Loot Generator](https://github.com/triston-dev/tristons-loot-generator) | 1.0.4 | mín. 13; verif. 13.351 | — | Botín para dnd5e/SW5E; no declara FFG. | Nuevo en el catálogo |

Los enlaces llevan al proyecto; el JSON adjunto conserva las URL de manifiesto, requisitos de sistema y variantes. Una versión con marcadores como `#{VERSION}#`, `[version]` o `auto replaced` procede del código fuente y no es una versión publicada válida.

## Dependencias generales y HUD clásico

| Módulo y fuente | Versión encontrada | Foundry declarado | Dependencias | Función / límite | Revisión anterior |
|---|---|---|---|---|---|
| [Babele](https://gitlab.com/riccisi/foundryvtt-babele) | 2.9.1 | mín. 13; verif. 14 | — | Dependencia general; consulta la revisión conectada para las pruebas realizadas. | Sí; ver límites de la revisión |
| [Material Deck](https://github.com/MaterialFoundry/MaterialDeck) | 1.7.2 | mín. 11; verif. 12 | — | Dependencia general; consulta la revisión conectada para las pruebas realizadas. | Sí; ver límites de la revisión |
| [Math.js](https://github.com/League-of-Foundry-Developers/mathjs-lib) | 7.5.1-fvtt2 | mín. 0.0.0; verif. 1.0.0 | — | Biblioteca matemática necesaria para Silhouette; no aporta contenido por sí sola. | Sí; ver límites de la revisión |
| [Status Icon Counters](https://gitlab.com/woodentavern/status-icon-counters) | 3.1.3 | mín. 14.359; verif. 14.368 | — | Dependencia general; consulta la revisión conectada para las pruebas realizadas. | Sí; ver límites de la revisión |
| [Token Action HUD Classic](https://github.com/Drental/fvtt-tokenactionhud) | 3.0.21 | mín. 10; verif. 10.291 | — | HUD clásico multijuego; sustituido en este mundo por Core + FFGSW. | Sí; ver límites de la revisión |
| [Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core) | 2.1.0 | mín. 13.351; verif. 14.368 | socketlib | Base del HUD moderno; necesita el adaptador de cada sistema. | Sí; ver límites de la revisión |

Los enlaces llevan al proyecto; el JSON adjunto conserva las URL de manifiesto, requisitos de sistema y variantes. Una versión con marcadores como `#{VERSION}#`, `[version]` o `auto replaced` procede del código fuente y no es una versión publicada válida.

## Variantes agrupadas

| Familia | Fuentes adicionales |
|---|---|
| sw5e-module | [thenotoriousJeremy/sw5e-module](https://github.com/thenotoriousJeremy/sw5e-module) (#{VERSION}#) |
| sw5e-companions | [thenotoriousJeremy/sw5e-companions](https://github.com/thenotoriousJeremy/sw5e-companions) ([version]) |
| starwarsd6-essentialcompanion-od6s | [madseumas/StarWarsD6_REUP_FoundryVTT](https://github.com/madseumas/StarWarsD6_REUP_FoundryVTT) (12.0.2) |
| mandalorian-codex | [thenotoriousJeremy/mandalorian-codex](https://github.com/thenotoriousJeremy/mandalorian-codex) (3.4.1.2.0.0) |
| ffg-star-wars-alternative-ui | [Lyinggod/StarWarsFFG-alternative-UI-Genesys](https://github.com/Lyinggod/StarWarsFFG-alternative-UI-Genesys) (12.6.0.1_903) |
| ffg-crits | [LeFrique/ffg-crits](https://github.com/LeFrique/ffg-crits) (1.0.0) |
| space-op-ui | [sasmira/space-op-ui](https://gitlab.com/sasmira/space-op-ui) (13.2) |
| healthEstimateSwffg | [tatsumasagc/healthEstimateSWFFG](https://github.com/tatsumasagc/healthEstimateSWFFG) (2.4.0) |
| lgs-extra-fields-for-star-wars | [Lyinggod/FFG-Star-Wars-Extra-Fields](https://github.com/Lyinggod/FFG-Star-Wars-Extra-Fields) (1.0.3) |
| lgs-token-range-bands | [Lyinggod/lgs-token-range-bands](https://github.com/Lyinggod/lgs-token-range-bands) (1.1.3) |
| ffg-pool-party | [LeFrique/ffg-pool-party](https://github.com/LeFrique/ffg-pool-party) (1-dev) |
| token-action-hud-ffgsw | [TeddyBears/token-action-hud-ffgsw](https://github.com/TeddyBears/token-action-hud-ffgsw) (13.0.0.2_0_3) |

## Herramientas externas, prototipos y sistemas separados

| Proyecto | Clasificación | Resultado |
|---|---|---|
| [Acknar/templates-ffg](https://github.com/Acknar/templates-ffg) | broken-manifest | Manifiesto JSON inválido: Expecting property name enclosed in double quotes: line 11 column 3 (char 195) |
| [Ag0n0s/swffg-custom-tools](https://github.com/Ag0n0s/swffg-custom-tools) | external-or-unresolved | Repositorio no disponible o vacío en la consulta; sin módulo verificable. |
| [BE-Arbiter/swffg-battle-handler](https://github.com/BE-Arbiter/swffg-battle-handler) | external-or-unresolved | Herramienta web externa de combate. |
| [CityPhox/GenesysFFG](https://github.com/CityPhox/GenesysFFG) | system | Sistema de juego completo o fork de sistema, no módulo adicional. |
| [coltimar/Star-Wars-5e-Foundry](https://github.com/coltimar/Star-Wars-5e-Foundry) | system | Sistema de juego completo o fork de sistema, no módulo adicional. |
| [docflowGM/foundryvtt-swse](https://github.com/docflowGM/foundryvtt-swse) | system | Sistema de juego completo o fork de sistema, no módulo adicional. |
| [Frosthawk617/GenesysRPG-FoundryVTT-Macros](https://github.com/Frosthawk617/GenesysRPG-FoundryVTT-Macros) | external-or-unresolved | Macros Genesys, sin manifiesto de módulo localizado. |
| [ItsZarel/swade-star-wars](https://github.com/ItsZarel/swade-star-wars) | external-or-unresolved | No se ha recuperado un manifiesto de módulo válido. |
| [JackSkylark/character-creator-swffg](https://github.com/JackSkylark/character-creator-swffg) | external-or-unresolved | Creador externo de personajes; no es el asistente de wrycu para Foundry. |
| [JaynexAV/SWFFG-Combat-Tool](https://github.com/JaynexAV/SWFFG-Combat-Tool) | external-or-unresolved | Herramienta externa de combate, sin manifiesto de módulo localizado. |
| [jero-rodriguez/dataset-swffg](https://github.com/jero-rodriguez/dataset-swffg) | external-or-unresolved | Datos para OggDude; se importan, no se activan como módulo. |
| [kaerosd/brp-star-wars](https://github.com/kaerosd/brp-star-wars) | external-or-unresolved | Proyecto BRP Star Wars sin implementación de módulo en el árbol consultado. |
| [LeeDurant/FoundryVTT_SWRPG_Compendiums](https://github.com/LeeDurant/FoundryVTT_SWRPG_Compendiums) | broken-manifest | Manifiesto JSON inválido: Expecting ',' delimiter: line 12 column 4 (char 584) |
| [LuNoX/FVTT-SWFFG-Adversaries-Importer](https://github.com/LuNoX/FVTT-SWFFG-Adversaries-Importer) | external-or-unresolved | Prototipo incompleto: module.json vacío y sin código del importador en el árbol principal. |
| [Lyinggod/lgs-ffg-tweaks](https://github.com/Lyinggod/lgs-ffg-tweaks) | external-or-unresolved | Repositorio sin implementación: solo .gitattributes en el árbol consultado. |
| [ObifourKenobi/StarWarsFFGHolocron](https://github.com/ObifourKenobi/StarWarsFFGHolocron) | external-or-unresolved | Bóveda de Obsidian y scripts de contenido; no es módulo de Foundry. |
| [okPickle/FFG_SW_DH](https://github.com/okPickle/FFG_SW_DH) | system | Sistema de juego completo o fork de sistema, no módulo adicional. |
| [panewman/SWFFGFoundryVTTGenesysSkills](https://github.com/panewman/SWFFGFoundryVTTGenesysSkills) | external-or-unresolved | Listas de habilidades Genesys para importar. |
| [profK/foundry-swthejedaii](https://github.com/profK/foundry-swthejedaii) | system | Sistema de juego completo o fork de sistema, no módulo adicional. |
| [ronfino/FVTT-Star-Wars-5e-Italian-Compendium](https://github.com/ronfino/FVTT-Star-Wars-5e-Italian-Compendium) | external-or-unresolved | Archivos de traducción italiana para Babele/SW5E. |
| [saethone/SWFFGSMacros](https://github.com/saethone/SWFFGSMacros) | external-or-unresolved | Repositorio de macros, sin manifiesto de módulo localizado. |
| [Shep-de-Lis/ffg-core-experiment](https://github.com/Shep-de-Lis/ffg-core-experiment) | system | Sistema de juego completo o fork de sistema, no módulo adicional. |
| [Steve-LP/starwars-ffg-foundry](https://github.com/Steve-LP/starwars-ffg-foundry) | system | Sistema de juego completo o fork de sistema, no módulo adicional. |
| [sw5e-foundry/sw5e-fvtt-import](https://github.com/sw5e-foundry/sw5e-fvtt-import) | external-or-unresolved | Herramientas de importación SW5E, no módulo de StarWarsFFG. |
| [thenotoriousJeremy/enhancedcombathud-sw5e-module](https://github.com/thenotoriousJeremy/enhancedcombathud-sw5e-module) | excluded-variant | El manifiesto conserva ID y actualización de Argon dnd5e; no se cuenta como una integración SW5E independiente. |
| [thenotoriousJeremy/sw-dod](https://github.com/thenotoriousJeremy/sw-dod) | external-or-unresolved | Proyecto de aventura SW5E; el árbol consultado solo contiene README y licencia. |
| [thompsdt/Foundry-Custom-Dataset-SWRPG](https://github.com/thompsdt/Foundry-Custom-Dataset-SWRPG) | external-or-unresolved | Datos para OggDude; posible solapamiento con compendios ya importados. |
| [wanoo/swffg-holocron](https://github.com/wanoo/swffg-holocron) | external-or-unresolved | Aplicación web compañera de campaña, con puente a Foundry; requiere despliegue propio. No es un módulo instalable. |

## Cobertura y límites

Se buscaron nombres, descripciones y README en GitHub; se consultaron repositorios de autores, manifiestos, endpoints de publicación, el catálogo oficial paginado, GitLab y referencias de la comunidad. Las consultas y páginas están registradas en [discovery-20261114.json](discovery-20261114.json).

El catálogo agrupa IDs repetidos y adaptaciones próximas. Los sistemas completos, herramientas externas, repositorios vacíos y módulos genéricos no se presentan como nuevos módulos Star Wars FFG. No se puede garantizar localizar proyectos privados, eliminados, sin indexar o compartidos únicamente por Discord.

La siguiente revisión técnica debe comprobar cada candidato relevante con las dependencias y versiones reales del mundo, detectar funciones duplicadas y probar fichas, tiradas e imágenes antes de activarlo.
