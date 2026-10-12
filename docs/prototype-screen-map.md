# Mapa de pantallas y estados para Figma

**Revisión: 10 de octubre de 2026.** Inventario de diseño del archivo [AgentNexo en Figma](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa). No existe frontend local. Los nombres son identificadores de diseño; no equivalen a IDs remotos. Los nodos reales se registran después de crearlos y revisarlos.

## Organización

Fundamentos visuales; componentes reutilizables; recorrido de escritorio; variantes/errores/confirmaciones; recorrido móvil; esqueletos. Las pantallas de cada recorrido deben compartir página cuando lo requieran sus conexiones de prototipo. El diseño usa capas editables, auto-layout, variables y componentes; no capturas como contenido de pantalla.

Convención sugerida: `AN / Área / Pantalla / Estado / Ancho`. Escritorio 1.440 px, móvil 375; reglas de adaptación a 768 y reflujo futuro a 320. Las variantes conservan identidad, navegación y contenido pertinente.

## Pantallas de acceso

| Pantalla | Variantes necesarias | Acción y salida |
| --- | --- | --- |
| Iniciar sesión | Vacía; datos; correo inválido; contraseña vacía; credencial rechazada; verificando; demasiados intentos. | Iniciar→carga→Inicio; mostrar/ocultar; recuperar. |
| Olvidé mi contraseña | Normal; correo inválido; enviando; respuesta genérica. | Enviar enlace; volver a acceso; representar mensaje sin revelar existencia. |
| Nueva contraseña | Normal; corta; no coincidente; guardando; actualizada. | Guardar→éxito→acceso, sin login automático. |
| Enlace caducado/usado | Explicación y salida. | Solicitar nuevo enlace. |
| Sesión vencida | Aviso sobre una pantalla sin datos privados visibles. | Reingresar y revalidar recurso. |

El error local identifica formato/campo. El rechazo de autenticación no identifica cuál credencial falló. Recuperación y envío de correo son estados visuales; no se envían mensajes desde Figma.

## Pantallas del espacio de trabajo

| Pantalla/pestaña | Bloques mínimos | Acción principal |
| --- | --- | --- |
| Inicio | Próxima acción, revisiones recientes y pendientes del escenario. | Crear revisión o continuar. |
| Revisiones | Búsqueda, filtro, lista, estado, fecha y menú contextual. | Crear/abrir/editar borrador. |
| Nueva revisión | Título, objetivo, criterios, archivos, contadores y ayuda. | Revisar condiciones. |
| Edición | Mismos campos, identidad de borrador y cambios. | Guardar o descartar con confirmación. |
| Autorización estándar | Snapshot, versión, entregable, modo; USD 1,00, externos USDC/XLM no autorizados en cero y aceptación desmarcada. | Autorizar e iniciar revisión privada sin compras A/B. |
| Resumen del trabajo | Estado, plazo, tareas, próxima decisión y pestañas. | Cancelar o ver informe. |
| Gastos estándar | Consumo USD del modelo, externos USDC/XLM cero y no autorizados. | Actualizar o consultar consumo; sin compra Testnet. |
| Actividad | Cronología, hora, evento y motivo. | Actualizar o abrir detalle. |
| Informe | Conclusión, hallazgos, criterios, casos propuestos, límites y gastos. | Expandir, filtrar o representar descarga. |
| Informes | Índice de informes completos/parciales y revisión de origen. | Abrir informe. |
| Notificaciones | Todas/Sin leer, fecha, origen y estado de lectura. | Marcar leída/todas u abrir revisión. |
| Servicios | A/B de integración pública, pricing.ts fijo y límites independientes de revisión privada. | Abrir DEMO-01 y revisar autorización Testnet. |
| DEMO-01: Autorización / Gastos / Actividad / Resultado | Caso público con identidad propia: USD 1,00, USDC Testnet 0,06, XLM Testnet 0,10, sin sumar unidades. | Aceptar explícitamente el caso Testnet y recorrer sus estados, sin comprar desde la revisión privada. |
| Ajustes | Cuenta, seguridad, preferencias y Testnet opcional. | Guardar preferencias o salir. |

Navegación lateral: Inicio, Revisiones, Informes y Notificaciones; Servicios/Ajustes secundarios. Resumen/Gastos/Actividad/Informe mantienen el mismo trabajo y estado; variantes completadas no vuelven a ejecución. Wallet es un flujo opcional de preparación financiera, sin bloquear lectura.

## Variantes y confirmaciones

| Área | Estados |
| --- | --- |
| Listas/Inicio/Informes/Notificaciones | Contenido, carga, vacío, error recuperable; sin coincidencias donde haya búsqueda. |
| Formulario | Datos válidos, errores por campo, archivo inválido/límite excedido, guardando y fallo conservando entradas. |
| Autorización | Sin aceptación, aceptada, iniciando, condiciones cambiadas, configuración no lista y ampliación sin aceptar. |
| Ejecución | En cola, ejecutando, completa, parcial, pausada, cancelación solicitada/cancelada y error. |
| Gastos | Revisión estándar sin compras y bolsas externas cero. Caso público DEMO-01 con límites propios; incertidumbre y pago sin entrega representados sin volver a pagar. Los ensayos de 0,05 permanecen criterios financieros futuros. |
| Informe | Completo, parcial, no disponible, contenido retirado; detalle expandido y filtro activo. |
| Wallet opcional | Desconectada, conectando, red incorrecta, firma rechazada y preparada. |
| Ajustes/notificaciones | Guardando/marcando, éxito y fallo recuperable. |
| Diálogos | Eliminar borrador; quitar archivo; descartar cambios; cancelar; archivar; eliminación bloqueada por operación pendiente. |

Cada diálogo incluye acción conservadora y una confirmación explícita, además del efecto exacto. Eliminar un borrador no equivale a archivar una revisión ni a cancelar su ejecución. Reservas inciertas, contabilidad y evidencias no desaparecen por cerrar el diálogo o trabajo.

## Móvil y esqueletos

El recorrido móvil debe cubrir acceso, recuperación, Inicio, Revisiones, Nueva revisión, Autorización, Resumen, Gastos, Actividad, Informe, Notificaciones y Ajustes, con navegación accesible y confirmación adaptada. Índice de informes y Servicios reutilizan sus patrones de lista apilada.

Esqueletos separados para **cada pestaña principal**: Inicio, Revisiones, Nueva revisión, Autorización, Resumen, Gastos, Actividad, Informe, Informes, Notificaciones, Servicios y Ajustes. Cada uno conserva la forma de su contenido; no sustituir todas las páginas por la misma tarjeta gris. Incluir variantes móviles de Inicio, Revisiones, Resumen, Gastos, Informe y Notificaciones. Acceso y recuperación representan carga en su formulario.

## Recorridos y verificación

1. Acceso→verificando→Inicio; error genérico→corrección; recuperación→enviando→respuesta→nueva contraseña→acceso.
2. Inicio/Revisiones→Nueva revisión→errores o condiciones→aceptación→Resumen.
3. Resumen↔Gastos↔Actividad↔Informe; cada cambio conserva trabajo y estados.
4. Incertidumbre→conciliar misma operación; pago sin entrega→recuperar misma compra; presupuesto insuficiente→ampliación→otra aceptación.
5. Notificación→revisión de origen; marcar leída no altera ejecución/pago.
6. Menú→confirmación→conservar o ejecutar la acción; eliminación pendiente→bloqueo explicativo.
7. Navegación móvil y regreso; variantes carga/vacío/error sin perder contexto.

Registrar IDs reales y comprobar destinos de acciones principales, foco previsto, márgenes, legibilidad y ausencia de contenido recortado involuntariamente. Un prototype click no constituye análisis, pago, correo o descarga real. No hay rutas locales ni datos que persistan fuera de Figma.

## Interacción y recorridos registrados

Mostrar/Ocultar contraseña utiliza componentes interactivos. Avisos leídos individualmente/todos, filtro Sin leer y borrador eliminado usan variables nativas del prototipo; no son persistencia de aplicación. La revisión final no se da por concluida por disponer de esos estados.

[Escritorio](https://www.figma.com/proto/lgVHKGkPztbmJ85eTEuIoa/AgentNexo?node-id=16-109&starting-point-node-id=16%3A109) · [Móvil](https://www.figma.com/proto/lgVHKGkPztbmJ85eTEuIoa/AgentNexo?node-id=24-145&starting-point-node-id=24%3A145).
