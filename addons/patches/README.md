# Parches preparados para probar en Foundry 14

Los tres parches corrigen fallos reproducibles del código original. Conservan
las licencias de los autores. **Todavía no se han validado dentro del mundo**:
el equipo de Foundry estaba desconectado durante la revisión del 14/11/2026.

| Complemento | Cambios |
|---|---|
| Star Wars Status Automation 0.2.1 | Continúa después de PNJ y tokens sin actor; usa actores sintéticos; evita duplicados y bucles de su propio talento; gestiona Active Effects sin `Token.toggleEffect`; contempla umbral de carga modificado y el límite inclusivo de Fortaleza. No falla al faltar el talento del compendio. |
| FFG Star Wars HUD Enhancements 1.0.1 | Ajusta números importados como texto; comprueba permisos y recursos; respeta el estado solicitado del botón; distingue tokens sintéticos por UUID. |
| Extra Fields for Star Wars 1.0.3 | Corrige el fallo del campo `blank` y del registro de ficha alternativo inexistente; evita escribir al abrir fichas sin permisos o bloqueadas; no modifica arrays de flags por referencia. |

Las pruebas de regresión están en `tests/compatibility/addon-*.test.mjs`.
El índice incluye hashes del código original y corregido. Una versión distinta
o modificaciones locales detienen la operación antes de escribir archivos.

Ejemplo de comprobación previa (Foundry debe estar detenido antes de aplicar):

```powershell
python scripts/apply-addon-patches.py --modules-dir "$env:LOCALAPPDATA/FoundryVTT/Data/modules" --module star-wars-status-automation --module ffg-star-wars-hud-enhancements --module lgs-extra-fields-for-star-wars
```

Añadir `--apply` aplica los cambios y guarda los originales en
`Data/mitos-addon-backups/<fecha>/`. El comando sin esa opción solo revisa.
No activa módulos, ni modifica mundos o preferencias. El manifiesto parcheado
no declara una versión de Foundry verificada hasta completar la prueba real.

Antes de activar Status Automation, comprobar si Enhancements ya automatiza la
carga: dos automatizaciones sobre el mismo recurso pueden duplicar efectos.
Para restaurar, detener Foundry y copiar los archivos del respaldo a las mismas
rutas bajo `Data/modules/`.
