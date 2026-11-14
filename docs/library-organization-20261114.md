# Biblioteca distribuida en Foundry — 14 noviembre 2026

Mundo: starwars-ffg-pruebas-biblioteca. Foundry 14.369, StarWarsFFG 2.0.5-mitos.14.

## Resultado

- 3.335 entradas canónicas de biblioteca localizadas: 3.311 copias nuevas y 24 fichas existentes conservadas.
- Actores y objetos se ordenan por línea, libro y categoría. Las referencias se importan a Diarios.
- Las entradas con varias fuentes conservan todas las citas y se archivan una sola vez por su primera fuente explícita.
- Los modificadores reutilizables quedan bajo recursos compartidos; el material fan, los ejemplos originales y el homebrew están separados.
- Los 25 compendios importados tienen carpetas internas por línea y libro, conservando los UUID.
- Las copias sw-* del módulo inicial no se importan de nuevo.
- Siete escenas de ejemplo, cinco macros y la tabla de cantina se colocan en Ayudas FFG. No se ejecutan las macros ni se activan las escenas.
- Totales del mundo: 603 actores, 2.689 objetos, 50 diarios, ocho escenas y una tabla.
- Diario de acceso: “Biblioteca y estado de la instalación”, en “00 · Acceso a Star Wars”.
- Las carpetas y cinco compendios de “El regreso de los Jedi” siguen disponibles para la campaña propia.

## Ilustraciones

Se revisaron los 81 vehículos con imagen genérica. Se incorporaron cinco imágenes existentes y tokens hechos con Tokenizer 2: Cargohopper 102, Blade-32, WUD-500, Wander y Herd Ship.
Rabbit’s Foot es una variante modificada del WUD-500; su ilustración no modifica las reglas de la ficha. El Herdship usa una representación de la comunidad de SWCombine.
Las fuentes, hashes, notas de revisión y los 76 modelos sin ilustración verificada están en assets/starwars-original/vehicle-review-20261114.json y sources.json.
No se afirma que los 76 modelos carezcan de ilustración publicada: no se localizó una correspondencia verificable en las fuentes revisadas.

## Corrección detectada al probar fichas

Al cerrar una ficha de vehículo sin editar sus campos bloqueados, la migración de stats rellenaba los campos omitidos con valores por defecto. Esto podía restablecer velocidad máxima, blindaje, umbrales, precio y rareza.
StarWarsTypeData.migrateData ahora transmite las opciones del núcleo y solo completa valores en datos completos, nunca en actualizaciones con partial=true.
Los imports antiguos incompletos siguen adquiriendo los recursos que les faltan. La prueba de regresión incluye vehículos, rivales y esbirros.
La ficha Blade-32 usada en la prueba se restauró desde su compendio; abrirla y cerrarla después de recargar conserva sus estadísticas.

## Verificación y recuperación

- 73 pruebas de compatibilidad aprobadas.
- Auditoría: 9.570 documentos y 1.449 rutas de imagen, sin errores de preparación ni de carga.
- Verificación tras recarga: 3.335 fuentes localizadas, sin entradas ausentes, copias duplicadas por la importación ni carpetas de tipo incorrecto.
- La comparación semántica espera la preparación asíncrona de objetos y distingue los efectos internos neutros añadidos por ItemFFG de cambios de reglas. Normaliza únicamente los indicadores calculados de arma y los booleanos antiguos de navicomputadora.
- Copia íntegra previa, registro de cambios y comprobaciones guardados en FoundryVTT/Backups/library-organization-20261114.
- Material Deck y su integración permanecen desactivados: no se encontró su puente Material Companion en localhost:3001, y la versión instalada declara soporte hasta Foundry 12.

Los scripts organize-foundry-library.mjs y organize-foundry-tools.mjs son reanudables y evitan reimportar fuentes ya presentes. El primero hace una simulación por defecto; no se ejecutan automáticamente al iniciar el mundo.

Resultado final tras recarga: 3.311 fichas nuevas comparadas semánticamente con su fuente, cero diferencias de reglas y cero fuentes ausentes. Se identificaron 128 efectos internos neutros generados normalmente por el sistema. La ficha Blade-32 conserva velocidad 4, manejo -2, casco 12 y blindaje 4 al abrir y cerrar.
