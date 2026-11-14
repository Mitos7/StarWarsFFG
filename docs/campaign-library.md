# Libros, combinaciones y campaña homebrew

Disponible en la rama de revisión e instalado en el mundo local `starwars-ffg-pruebas-biblioteca`. No se ha publicado una nueva versión del instalador.

## Dónde se selecciona

En **Configuración → Configurar opciones (Game Settings) → Star Wars FFG**:

- **Combinación de libros y campaña**: desplegable con siete perfiles, guardado por mundo.
- **Abrir biblioteca y opciones**: gestor con las pestañas Libros, Biblioteca, Combinaciones, Módulos y Mi homebrew.

También se abre desde **Compendios → Libros y mi campaña**, o con la macro **Star Wars · Mi campaña homebrew** después de preparar el espacio homebrew.

## Perfiles disponibles

| Perfil | Uso |
|---|---|
| Personalizada | Elegir las fuentes una a una. |
| Recomendada | Tres manuales básicos y recopilaciones de personajes, equipo y naves. |
| Borde Exterior | Exploración, contrabando, cazarrecompensas y tecnología. |
| Rebelión | Espionaje, diplomacia y operaciones de la Alianza. |
| La Fuerza | Misterios, viajes y legado Jedi. |
| Guerras Clon | República y Separatistas, con sus suplementos de época. |
| Mitos · historia propia / homebrew | Base de los tres manuales y espacio para una historia original. |

Seleccionar un perfil cambia el filtro de la biblioteca de campaña. No importa libros, no modifica estadísticas ni activa módulos por sí solo. Obligación, Deber, Moralidad, época y reglas caseras se deciden para cada mesa.

## Biblioteca por libro

Las fichas se agrupan mediante sus referencias y etiquetas `book:`. Una ficha que cite varios libros aparece al filtrar cualquiera de ellos, sin copiar el documento. Las referencias de página originales se conservan. El contador de un libro **no certifica que su contenido esté completo**.

La revisión inicial identificó 3.103 documentos importados en 25 compendios: 2.541 tenían referencias en sus metadatos y 562 carecían de ellas. El gestor recuperó las citas explícitas de 323 descripciones y diarios. La [revisión posterior de las 239 restantes](source-review-20261114.md) recuperó las fuentes de 36 vehículos y 10 holocrones, identificó 186 modificadores compartidos del archivo original `ItemDescriptors.xml` y eliminó siete plantillas genéricas sin uso tras comprobar sus referencias. Quedan **cero entradas sin identificar**. De los modificadores compartidos, 149 se relacionan con libros a través de los objetos que los utilizan; 37 solo tienen procedencia técnica comprobada. No se inventan citas ni páginas.

El catálogo enumera 51 publicaciones oficiales; 38 tienen al menos una referencia local. Las ediciones beta, el material fan, el contenido propio y los recursos compartidos se muestran por separado.

El índice inicial del gestor contiene 3.522 entradas: 3.103 importadas y 419 ejemplos de los compendios del sistema y del módulo de inicio. Al crear el diario homebrew, el índice pasa a 3.523. Los compendios de ejemplo pueden duplicar contenido entre sí y están excluidos del navegador hasta marcar **Incluir ejemplos y material fan**. *Unofficial Species Menagerie* se considera material fan aunque proceda de la importación.

Después de retirar las siete plantillas sin uso, el índice local contiene **3.516 entradas**. Se conservó una copia completa de los documentos afectados antes de reparar o eliminar contenido.

**Gadgets and Gear**, **Starships and Speeders**, **Dawn of Rebellion** y **Collapse of the Republic** no tienen referencias locales identificadas. Pueden seleccionarse como fuentes previstas, pero el gestor muestra esa ausencia y no crea fichas ficticias para cubrirla. El [inventario de referencias](../addons/book-audit-20261114.json) conserva la auditoría de importación.

En Biblioteca se puede buscar por nombre o referencia, filtrar por línea, libro y tipo, abrir una ficha y arrastrarla al destino que acepte ese tipo de documento. La selección se guarda por mundo y no oculta ni borra los compendios originales. **Actualizar** vuelve a leer las fuentes; los cambios de documentos invalidan automáticamente el índice.

El importador OggDude conserva las fuentes de futuras importaciones y crea los modificadores de vehículo como `itemmodifier`, dentro de su compendio correcto. La reparación local corrigió 73 tipos de documento, normalizó 15 destinos de armadura y restauró 62 opciones de mejora en 36 objetos. Las mejoras se guardan al arrastrarlas a accesorios de nave y armaduras. Las elecciones y condiciones narrativas siguen requiriendo la revisión de la mesa.

## Herramientas adicionales

Módulos muestra las 91 familias del [catálogo ampliado](../addons/DISCOVERY-20261114.md), con enlace a su proyecto y estado de instalación. Las herramientas transversales no se atribuyen artificialmente a un libro. Los proyectos de otros sistemas se identifican; aparecer en el catálogo no implica compatibilidad ni instalación.

Combinaciones ofrece una base de 19 módulos y dependencias revisados: Space Opera, Alternative UI, dados visuales, Tokenizer 2, HUD, campos extra, ayudas de resultados y mapa galáctico. La acción comprueba las versiones instaladas y la pareja Foundry 14.369 / StarWarsFFG 2.0.5-mitos.14, presenta los cambios, conserva un respaldo de la configuración y recarga solo al aplicarlos. Si falta una dependencia o cambia una versión, pide una nueva revisión en lugar de activar una mezcla no comprobada.

La acción de combinación solo desactiva dos alternativas que entran en conflicto con esa base: el tema global CC y Token Action HUD Classic. Los demás módulos conservan su estado. Karmic Dice sigue siendo una preferencia opcional y sus ajustes no se modifican.

En una revisión posterior de siete módulos activados por el usuario, se pasó de 31 a **28 activos**: se desactivó CC para mantener Space Opera como tema general, y MaterialDeck junto con su integración FFG porque su servidor externo rechazaba la conexión. Permanecen activos Bandas de alcance, Automatización de estados, Silhouette y Scene Packer. El arranque posterior no registró errores ni excepciones; persisten advertencias de APIs obsoletas de terceros. Los detalles y límites están en [la revisión de módulos](../addons/REVIEW-20261114.md).

## Mi homebrew

La ficha permite guardar nombre, época, relación con el canon, tono, premisa, continuidad anterior y propuestas de reglas. El código no impone una trama ni una época. Las decisiones narrativas y páginas adicionales del mundo local se guardan de forma privada, fuera de este repositorio.

**Preparar mi campaña homebrew** crea:

- Un diario privado con siete páginas: presentación, historia, canon/cronología, facciones/lugares, reglas, sesiones/continuidad y plantilla de aventura.
- Doce carpetas de diarios, actores, objetos, escenas y tablas, incluyendo carpetas para personajes, aliados, adversarios, naves, equipo, especies y poderes.
- Cinco compendios propios editables: personajes/naves, equipo/especies/poderes, historias/lugares, escenas y tablas.
- Una macro para abrir el gestor directamente en Mi homebrew.

La preparación es idempotente: repetirla completa lo que falte sin duplicar ni sobrescribir la historia existente. La ficha de idea se guarda por separado; el diario puede editarse libremente. El director y su asistente tienen acceso a los compendios; los jugadores no lo tienen por defecto. Los documentos creados en estas carpetas, incluidas sus subcarpetas, y los cinco compendios se incorporan al filtro **Homebrew de Mitos**.

Este espacio se prepara dentro del mundo actual. No crea otro mundo ni modifica la campaña de Aebraeth o Star City.

## Comprobaciones

- Selector nativo y apertura real del submenú en Configurar opciones; botón de acceso en Compendios. Las cinco pestañas se comprobaron mediante clics, corrigiendo el conflicto con la acción reservada `tab` de Foundry.
- Perfil homebrew y fuentes conservados después de recargar Foundry.
- Filtro de *Cyphers and Masks*: 89 resultados al seleccionar todas las fuentes; apertura de la ficha *A Step Ahead* e imagen cargada.
- Catálogo de 91 módulos; búsqueda de Sabacc devuelve sus dos herramientas.
- Arrastre del diario con tipo y UUID válidos.
- Preparación homebrew repetida mediante API y botón real: un diario, siete páginas, doce carpetas, cinco compendios y una macro; sin duplicados, compendios editables y permisos comprobados. También se comprobó guardar una selección manual de libros desde su botón y se restauró el perfil homebrew.
- Cero errores de lectura del índice y cero excepciones durante estos recorridos. Las advertencias de obsolescencia V1 de las fichas existentes son independientes del nuevo gestor V2.
- 72 pruebas JavaScript y comprobación sintáctica de 105 módulos `.js` y `.mjs`. La revisión previa de módulos también incluye tres pruebas Python del instalador.
- Revisión final: 232 documentos conservados y válidos, 45 imágenes distintas accesibles, 62 opciones de mejora guardadas; cero fuentes desconocidas. Se comprobó la persistencia mediante una lectura nueva del servidor después de arrastrar una mejora a un accesorio de nave y otra a una armadura. Los objetos temporales se eliminaron.

La revisión general de imágenes sigue teniendo pendientes documentados en [REVIEW-20261114.md](../addons/REVIEW-20261114.md); el selector no convierte esos pendientes en trabajo terminado.
