# Revisión de las 239 referencias pendientes

Aplicada al mundo local con Foundry 14.369 y StarWarsFFG 2.0.5-mitos.14. El código queda en la rama de revisión; no sustituye los ZIP ni manifiestos publicados.

| Grupo original | Cantidad | Resolución |
|---|---:|---|
| Vehículos | 36 | Recuperadas citas explícitas de `system.biography`, antes omitidas por el índice. |
| Holocrones | 10 | Recuperadas citas con formatos «See Table», «See page» o «Please see sidebar»: nueve del básico de Fuerza y Destino y uno de Chronicles of the Gatekeeper. |
| Modificadores y cualidades | 186 | Identificados por clave y definición en el `ItemDescriptors.xml` original del usuario. Se conservan como recursos compartidos. |
| Plantillas genéricas de tamaño | 7 | Eliminadas tras comprobar que no se usan; copia previa completa. |

Los 186 modificadores incluyen 73 de vehículo, 15 de armadura, 69 de armas y 29 generales. De ellos, 149 aparecen en objetos con citas de libros en los XML originales: el navegador muestra esa relación **por uso**, sin presentarla como una cita directa del modificador. Los otros 37 conservan su fuente técnica. Una definición reutilizable no se elimina por carecer de una página propia.

## Reparación funcional

- Los 73 modificadores de vehículo estaban importados como accesorios de nave. Se convirtieron a `itemmodifier` de destino `vehicle`, conservando ID y UUID; Foundry V14 requiere sustitución explícita del modelo al cambiar el tipo.
- Los 15 modificadores de armadura usaban `armor`; ahora usan `armour`, el identificador que acepta el sistema.
- Se restauraron 62 opciones de mejora en 36 objetos padre y se añadió la explicación de modificaciones base en los 63 padres presentes. Las nuevas opciones comienzan inactivas; las opciones existentes se conservan.
- El arrastre admite las mejoras de vehículo sobre accesorios de nave y guarda una copia de los datos antes de actualizar. Las matrices heredadas se persisten explícitamente para evitar diferencias vacías en Foundry V14.
- Las búsquedas del importador exigen el tipo `itemmodifier`: claves como `DEMONMASK`, `MEDFOCUS`, `IRONFIST` y `VAKSAI` también identifican objetos de otros tipos y no se deben resolver solo por clave.

La corrección no automatiza todas las condiciones narrativas, elecciones, tiradas de instalación o efectos especiales. Las notas de modificación indican que deben comprobarse al aplicarlas.

## Respaldo y eliminación

Antes de modificar los documentos se guardaron 302 documentos completos de 12 compendios, sus estados de bloqueo y la configuración narrativa privada en `Backups/source-review-20261114/documents-before-complete.json` del directorio de Foundry. También se respaldaron los archivos de código instalados. El contenido privado del respaldo no forma parte del repositorio.

Se eliminaron únicamente las plantillas `GENERIC0` a `GENERIC6`: Incidental, Very Small, Small, Medium, Medium-Large, Large y Very Large Item. No tenían usos en los XML; el escaneo de otros 3.128 documentos del mundo y sus compendios no encontró referencias por ID ni UUID. El reparador vuelve a comprobar referencias antes de cualquier eliminación y restaura los bloqueos originales al terminar.

## Evidencia y límites

`modules/campaigns/data/source-repairs-20261114.json` conserva las claves, citas, relaciones y hashes del conjunto de origen. `parent-modifier-repairs-20261114.json` registra las relaciones de los objetos padre. El XML original completo no se incorpora.

Validación final: 232 documentos conservados, todos válidos; 62 opciones recuperadas persistidas; 45 rutas de imagen distintas accesibles; cero entradas desconocidas en un índice de 3.516 entradas. Dos pruebas reales de arrastre, a accesorio de nave y armadura, se verificaron mediante una nueva lectura del servidor y después se retiraron sus objetos temporales. Pasaron 72 pruebas JavaScript y la comprobación sintáctica de 105 módulos.

Cinco objetos padre citados por los XML no están importados en la biblioteca actual y no se inventaron ni se duplicaron durante esta reparación: Hydraulic Control Circuits, Hyperdrive Module Class 4, Hyperdrive Module Class 8, Civilian Vehicle Retrofit y Demon Mask. La identificación de las 239 entradas no certifica que todos los libros estén completos.
