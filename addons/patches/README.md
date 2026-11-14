# Parches de módulos para Foundry 14

Once parches locales aplicados en Foundry 14.369. La columna de comprobación describe el alcance real; MaterialDeck, Silhouette y Genesys conservan limitaciones pendientes.

| Complemento | Parche | Comprobación |
|---|---|---|
| ffg-star-wars-hud-enhancements | 1.0.1-mitos.1 | Foundry 14.369: wounds +/-1 on nemesis, minion, rival and hull trauma on vehicle; restored original values. |
| lgs-extra-fields-for-star-wars | 1.0.3-mitos.1 | Foundry 14.369: blank spacer and numeric field render once in standard V2 and Alternative actor sheets; read-only protection regression-tested. |
| star-wars-status-automation | 0.2.1-mitos.1 | Foundry 14.369: managed encumbrance counter 2 -> 0; unrelated ActiveEffect preserved. World enablement remains optional. |
| token-action-hud-ffgsw | 13.0.0.2_0_3-mitos.1 | Foundry 14.369: two selected tokens produce common skill actions; skill dialog opens; synthetic actor dice pool regression-tested. |
| swffgUI-cc | 2.6.3-mitos.1 | Foundry 14.369: startup, directories and Font Awesome icons checked. Alternative global theme; do not combine with Space Opera. |
| swrpg-karmic-dice | 1.0.1-mitos.1 | Foundry 14.369: a temporary FFG roll rendered in chat without errors and was removed. Original probability preferences preserved. |
| materialdeck-starwarsffg | 1.0.1-mitos.1 | Resource mappings, FFG rolls and condition preservation covered by regression tests. External MaterialDeck server/hardware unavailable. |
| genesys-ffg-options-enhancer | 1.1.1-mitos.1 | V14 scene control callbacks patched. Module declares maximum system 2.0.4 and remains disabled with 2.0.5-mitos.14; full feature integration pending. |
| starwars-silhouette | 1.2.2-mitos.1 | Startup and vehicle sheet hook load in Foundry 14.369. Automatic scale/art features still need configured silhouette folders and full validation. |
| lgs-token-range-bands | 1.1.3-mitos.1 | Foundry 14.369: SceneConfig fields, Token HUD, range creation and token movement cleanup checked. Legacy template deprecation warnings remain; detailed ruler labels not fully checked. |
| swgalaxy-map | 0.1.0-mitos.1 | Encuadre inicial corregido; búsqueda, 6.757 sistemas y calculadora probados en Foundry 14.369. |

El instalador rechaza versiones distintas y cambios locales desconocidos. Normaliza los payloads a LF para Windows, verifica el resultado por SHA-256 y respalda cada archivo antes de escribir. Solo admite una actualización de un parche anterior cuando su hash está enumerado expresamente.

```powershell
python scripts/apply-addon-patches.py --modules-dir "$env:LOCALAPPDATA/FoundryVTT/Data/modules" --module star-wars-status-automation --module ffg-star-wars-hud-enhancements --module lgs-extra-fields-for-star-wars
```

El comando anterior solo comprueba. Con Foundry detenido, añadir `--apply` aplica los parches y guarda el respaldo en `Data/mitos-addon-backups/<fecha>/`. No cambia la activación de módulos ni las preferencias del mundo.

No combinar los temas globales Space Opera y CC. Alternative UI es una ficha y se comprobó junto a Space Opera. No activar simultáneamente automatizaciones que gestionen el mismo recurso. Las preferencias originales de Karmic Dice se conservaron.
