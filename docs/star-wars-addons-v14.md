# Star Wars FFG / Genesys — complementos instalados (Foundry V14)

Auditoría realizada el 12 de noviembre de 2026. El catálogo de FoundryMods incluye 13 módulos relacionados con StarWarsFFG; **12 de 13 están instalados localmente**, además de varias ampliaciones y dependencias. La instalación se hizo con las versiones originales de sus autores, sin modificar sus archivos y comprobando el ID de `module.json` en cada paquete.

**Importante: instalado no significa activado ni compatible con V14.** Los módulos se han instalado en `FoundryVTT/Data/modules` y no se han habilitado en ninguno de los mundos existentes. Solo deberían activarse tras probarlos en un mundo temporal de Star Wars y comprobar la consola, las tiradas, las fichas y los combates.

| Módulo | Versión instalada | Última verificación publicada | Estado |
|---|---:|---|---|
| FFG Star Wars Enhancements | 3.0.0 | Foundry V13 | Instalado, sin activar |
| Star Wars - User Interface Creative Common | 2.6.3 | Foundry V12 | Instalado, sin activar |
| FFG Star Wars Space Opera UI | 13.2 | Foundry V13 | Instalado, sin activar |
| FFG Star Wars Status Automation | 0.2.1 | Foundry V12, máximo V13 | Instalado, sin activar |
| Token Action HUD for FFG Star Wars | 13.0.0.2_0_3 | Foundry V13 | Instalado, sin activar |
| Star Wars - Silhouette | 1.2.2 | Foundry V12 | Instalado, sin activar |
| FFG Star Wars - Alternative Sheet Design | 12.6.2.1_905 | Foundry V12 | Instalado, sin activar |
| Lyinggods Token Range Bands | 1.1.3 | Foundry V12 | Instalado, sin activar |
| Lyinggods Extra Actor Fields for FFG Star Wars | 1.0.3 | Foundry V12 | Instalado, sin activar |
| Genesys FFG Options Enhancer | 1.1.1 | Foundry V13 | Instalado, sin activar |
| SWRPG Karmic Dice | 1.0.1 | Foundry V12 | Instalado, sin activar; **modifica probabilidades** |
| Token Action HUD Classic | 3.0.21 | Foundry V10 | Instalado, sin activar; obsoleto, usar HUD Core actual |

**Único módulo del catálogo sin instalar:** `Pool Party for FFG Star Wars`. Sus manifiestos publicados y el repositorio de `BoltsJ/ffg-pool-party` devuelven HTTP 404. No se utilizó ningún ZIP de fuentes desconocidas. El proyecto no es compatible oficialmente con V14 y modificaba el gestor de dados; la alternativa más prudente es implementar la función de compartir tiradas directamente en el fork cuando `ApplicationV2` esté probado.

## Otros complementos y dependencias instalados

- FFG Star Wars HUD Enhancements 1.0.1 (Foundry V13, no probado en V14).
- SWRPG Dice Helper Compendium 1.1.4 (Foundry V13; datos para el asistente de resultados de Enhancements, no sustituye los manuales oficiales).
- Material Deck - Star Wars FFG 1.0.1 (Foundry V11). Requiere MaterialDeck y hardware Stream Deck; **no es aconsejable activarlo en V14**.
- MaterialDeck core 1.7.2 (antiguo, compatible como máximo con versiones anteriores; la línea moderna de Material Deck es premium y requiere la suscripción correspondiente).
- Status Icon Counters 3.1.3 (verificado en V14.368).
- Babele 2.9.1 (verificado en V14; requerido por Status Automation).
- Token Action HUD Core 2.1.2, libWrapper, FXMaster y socketlib ya existían en la instalación.

## Orden de validación recomendado

1. Con un mundo temporal de Star Wars y sin otros módulos: verificar fichas, características, dados, combate, chat, Destino y guardado.
2. Activar únicamente un módulo cada vez, comenzando por Status Icon Counters, FFG Enhancements y Dice Helper Compendium.
3. Probar Token Action HUD Core + Token Action HUD for FFG Star Wars y HUD Enhancements; comprobar clics y tiradas narrativas.
4. Probar Genesys Options Enhancer, Status Automation y las bandas de distancia, individualmente, verificando compatibilidad V14 y el tema Genesys.
5. Elegir **una** interfaz visual: Space Opera UI, Creative Common UI o Alternative Sheet Design, no las tres simultáneamente. Estas tres están pendientes de adaptación a V14 y pueden entrar en conflicto con la migración de fichas a ApplicationV2.
6. Mantener SWRPG Karmic Dice desactivado salvo decisión expresa de introducir tiradas probabilísticamente modificadas. Silhouette requiere los recursos importados autorizados de OggDude.

La suite `StarWarsFFG` incluye soporte **nativo para Genesys** (dados, lista de habilidades y alcance de vehículos) según su README y su propio código. No requiere un segundo sistema Genesys.

El fork público `Mitos7/StarWarsFFG` sigue manteniendo separada la versión jugable V14 de la rama experimental de migración `ApplicationV2`. No se considera V16 compatible hasta superar una prueba real en V16.