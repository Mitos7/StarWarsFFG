# Revisión de retratos reanudada — 14 de noviembre de 2026

Se aplicaron retratos adecuados al oficio de 19 PNJ genéricos y una imagen específica del carguero MC-18 en el mundo de pruebas de biblioteca. Son ocho imágenes existentes, con origen y SHA-256 registrados en `assets/starwars-original/sources.json`; dos ilustraciones ya presentes se reutilizan para falsificadores e ingenieros navales. Las ilustraciones representan arquetipos y no cambian su especie ni sus estadísticas. No se modificaron personajes con nombre propio.

Tokenizer 2 generó diez tokens con marco. Se revisaron visualmente y se corrigieron las coordenadas de encuadre para imágenes verticales, calculándolas sobre el lado mayor. Las veinte fichas se actualizaron con el retrato, la textura de token y las capas correspondientes. Las fichas y las escenas previas se respaldaron antes de aplicar los cambios. Los compendios recuperan su estado de bloqueo después de la actualización.

El script `scripts/apply-reviewed-role-art.mjs` proporciona una captura previa y una aplicación independiente. Solo selecciona nombres exactos y retratos esperados en compendios del mundo y actores del mundo; exige la captura correspondiente antes de actualizar y rechaza documentos modificados desde la captura. La ejecución normal omite retratos ya aplicados. La opción explícita `refresh` permite corregir el encuadre usando una nueva captura.

## Verificación

- 20 fichas actualizadas, 10 tokens, cero errores de actualización.
- Revisión visual de los diez tokens.
- 4.902 documentos y 1.444 rutas de imagen revisados: cero errores de datos y cero rutas locales rotas.
- Biblioteca: 3.516 entradas, cero fuentes sin identificar, cero errores de lectura.
- 28 módulos activos; Material Deck y su integración FFG desactivados.
- Comprobación sintáctica de los 105 módulos existentes y del nuevo script.
- La campaña «El regreso de los Jedi», situada en un futuro lejano posterior al Episodio IX, conserva su planteamiento y sus cinco compendios homebrew.
- Permanecen 81 vehículos con icono genérico. El Arrow-23 sigue entre ellos: no se instaló la variante de imagen que había sido editada con IA.

## Material Deck

La instalación utiliza Material Deck 1.7.2, cuyo manifiesto declara Foundry 11–12, en Foundry 14.369. La causa observada del error de conexión fue `ws://localhost:3001/` sin un servicio Material Companion escuchando. Tampoco se detectaron las aplicaciones Elgato Stream Deck o Material Companion en las comprobaciones realizadas. No se ha probado funcionamiento físico ni se afirma compatibilidad completa con V14.

Material Deck controla Foundry desde un Stream Deck; activar únicamente los módulos de Foundry no completa la instalación. Se mantiene desactivado con `materialdeck-starwarsffg`. No se actualizó Foundry ni se instaló una versión premium de Material Deck.

Documentación: https://materialfoundry.github.io/MaterialCompanion/ y https://materialfoundry.github.io/MaterialDeck/gettingStarted/installation/

El inventario sigue marcando la coexistencia de Status Automation y Enhancements para revisar posibles ajustes de carga; es una advertencia de configuración, no un error de ejecución detectado. Los avisos de APIs obsoletas de terceros descritos en la revisión general permanecen.

La comprobación posterior a la recarga volvió a leer las veinte fichas y decodificó sus veinte recursos de retrato/token. Tras recalcular los campos derivados con prepareData, estadísticas, inventario, efectos, nombres, tipos, carpetas y permisos coinciden con el respaldo anterior. Las veinte asignaciones y sus capas de Tokenizer persistieron. Se abrió la ficha de Diplomat y se comprobó visualmente su retrato.
