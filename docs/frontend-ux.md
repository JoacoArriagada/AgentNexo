# Frontend y experiencia de uso

**Estado: requisitos y diseño en Figma, sin código. Revisión: 10 de octubre de 2026.** El prototipo local fue retirado. [Alcance del diseño](prototype-implementation.md) distingue un recorrido visual de una integración. Las conductas siguientes son requisitos del producto futuro y de sus estados de diseño.

## Propósito

El responsable define una revisión estática pequeña, autoriza su alcance y comprende resultado, limitaciones y consumo. La navegación prioriza el trabajo y su próxima decisión. Tener dos agentes, pagar o completar tareas no demuestra calidad de análisis.

Escritorio es la experiencia principal; móvil permite definir, consultar y decidir. No se añaden marketplace, administración de equipos, métricas comerciales inventadas ni conversación permanente. Acceso privado con un responsable preconfigurado; no hay registro público.

## Navegación

| Área | Contenido mínimo | Acción |
| --- | --- | --- |
| Inicio | Bienvenida breve, próxima acción, revisiones recientes y pendientes reales del escenario. | Crear revisión, continuar borrador o abrir un pendiente. |
| Revisiones | Nombre, fecha, estado y próxima acción; búsqueda y filtro. | Crear, abrir, editar borrador; menú con eliminación o archivo permitidos. |
| Nueva revisión / edición | Título, objetivo, criterios y archivos; contadores y ayuda. | Revisar condiciones o guardar borrador. |
| Autorizar | Snapshot, versión, entregable, modo y plazo; modelo USD 1,00 en revisión estándar, externo USDC/XLM no autorizado con tope cero. | Aceptación inicialmente desmarcada; autorizar e iniciar sin compras Testnet. |
| Detalle: Resumen | Estado general, plazo, tareas y próxima acción. | Ver resultados, solicitar cancelación o resolver una decisión pendiente. |
| Detalle: Gastos | Consumo USD del modelo; USDC/XLM en cero y no autorizados para archivos privados. El caso público Testnet tiene gastos separados. | Actualizar consumo; conciliación/recuperación Testnet solo dentro del caso público autorizado. |
| Detalle: Actividad | Cronología sanitizada; evento, hora y motivo comprensible. | Actualizar y consultar evento; sin secretos ni prompts completos. |
| Detalle: Informe | Conclusión, evidencia, criterios, casos propuestos, limitaciones y gastos. | Filtrar, expandir hallazgo o representar descarga. |
| Informes | Índice de informes disponibles o parciales, ligados a revisión. | Abrir informe; no ofrecer descarga si el contenido fue retirado. |
| Notificaciones | Todas / Sin leer; evento, fecha, revisión y estado de lectura. | Abrir origen, marcar como leída o marcar todas. |
| Servicios | A/B identificados como integración Testnet del fixture público fijo, ajenos al flujo de archivos privados. | Abrir DEMO-01 y revisar su autorización específica; sin marketplace. |
| Ajustes | Cuenta, seguridad, preferencias de notificación y contexto Testnet opcional. | Guardar preferencias, recuperar/cambiar acceso y cerrar sesión. |

Resumen, Gastos, Actividad e Informe son pestañas del mismo trabajo y conservan identidad y estado. Las variantes de una revisión completada permanecen completadas al cambiar pestaña; no regresan a ejecución ni abren el caso Testnet. Informes es un índice global distinto del informe del trabajo. Notificaciones no sustituye la actividad ni cambia el estado financiero al marcarse como leída. Informes existentes se consultan sin conectar wallet.

## Acceso y recuperación

Correo y contraseña tienen etiquetas persistentes. Formato inválido o campo vacío muestra un error asociado y conserva el resto del formulario. Un rechazo del servidor muestra **“Correo o contraseña incorrectos”**, sin distinguir cuenta inexistente, contraseña errónea o estado de la cuenta. Mostrar/ocultar contraseña es una acción accesible.

Durante verificación: **“Iniciando sesión…”**, indicador de carga y envío deshabilitado para evitar duplicados. El éxito conduce a Inicio o al recurso autorizado solicitado; no basta el temporizador visual para conceder sesión.

**“Olvidé mi contraseña”** conduce a correo, estado enviando y respuesta **“Si existe una cuenta con ese correo, recibirás un enlace”**. El enlace será temporal, único y ligado a la cuenta; caducado o usado ofrece solicitar otro. Solicitudes limitadas por origen y cuenta; respuestas sin enumeración. El nuevo secreto admite 15–128 caracteres, espacios y pegado, sin reglas obligatorias de símbolos. Confirmación distinta muestra error local. El éxito revoca sesiones y vuelve a acceso, sin inicio automático. [OWASP autenticación](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP recuperación](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), consultadas el 10-10-2026.

El diseño incluye normal, datos de ejemplo, correo inválido, contraseña vacía, credencial rechazada, carga, demasiados intentos, recuperación normal/inválida/carga/enviada, nueva contraseña normal/corta/no coincidente/carga/éxito y enlace caducado/usado. Sesión vencida ofrece reingresar sin guardar archivos sensibles en almacenamiento persistente.

## Entrada y autorización

Título: 3–100 caracteres. Objetivo: 20–2.000. Criterios: 1–10 de hasta 500 cada uno. Archivos: 1–3 `.js`/`.ts` UTF-8, 1.000 líneas y 256 KiB combinados. Mostrar por archivo nombre, tamaño, líneas y error concreto. No URLs, clonación, instalación o ejecución.

La autorización estándar para archivos privados fija USD 1,00 de modelo y USDC/XLM externos no autorizados, con topes cero. No permite A/B ni firma aunque un archivo tenga el nombre del fixture. DEMO-01 es un caso público separado con pricing.ts fijo: USD 1,00 de modelos, USDC Testnet 0,06 y XLM Testnet 0,10, sin sumar unidades. Su autorización Testnet es explícita, distinta de iniciar una revisión privada. Todos son topes ilustrativos, sin afirmar saldo o gasto real. Garantía de aplicación; contractual solo con evidencia futura.

Cambiar entradas invalida aceptación y genera condiciones nuevas. La ampliación no modifica silenciosamente un límite aceptado; exige revisar y aceptar otra versión. El frontend nunca calcula autoridad, firma compras, decide permisos ni inicia agentes por sí solo.

## Confirmaciones y acciones destructivas

| Acción | Confirmación y salida |
| --- | --- |
| Eliminar borrador | Mostrar nombre y contenido afectado, **Conservar borrador** y **Eliminar borrador**. Solo sin ejecución ni compromisos financieros. Éxito vuelve a lista; fallo conserva borrador. |
| Quitar archivo | Mostrar archivo y efecto sobre el alcance; **Conservar archivo** / **Quitar archivo**. Si había condiciones aceptadas, explicar que se invalidarán. |
| Descartar cambios | **Seguir editando** / **Descartar cambios**; guardado explícito antes de abandonar cuando corresponda. |
| Cancelar revisión | **Continuar revisión** / **Solicitar cancelación**. Explicar que se detiene nuevo despacho y no se revierten pagos ni reservas inciertas. Luego solicitud en curso, cancelada o fallo. |
| Archivar revisión | **Mantener visible** / **Archivar revisión**. Solo con ejecución terminal; archivo retira del listado activo, no borra contabilidad; ofrecer filtro Archivadas y restaurar. |
| Eliminar con operación pendiente | Acción bloqueada con explicación y enlace a Gastos. No presentar un botón destructivo habilitado que el sistema no permitirá. |
| Cerrar sesión | Cuando haya cambios sin guardar, resolverlos antes; revocación y regreso a acceso. Cierre fallido conserva mensaje recuperable. |

En diálogos el foco inicial estará en la opción conservadora; acción destructiva con texto preciso y color de error. Escape/cerrar equivale a conservar, salvo envío ya irreversible. Devolver foco al invocador. No confundir archivar, cancelar y borrar contenido bajo la política de retención.

## Estados financieros comprensibles

| Estado | Presentación |
| --- | --- |
| Rechazada | Motivo, importe y límite; “No se realizó el pago”. |
| Reservada | “Importe reservado”, todavía sin gasto confirmado. |
| Preparada / enviada | Identidad persistida o envío en espera; no afirmar liquidación. |
| Incierta | “Resultado pendiente de conciliación. El importe sigue reservado”. Sin volver a pagar. |
| Confirmada | Importe y evidencia reales cuando existan; entrega indicada separadamente. |
| Confirmada sin entrega | “Pago confirmado. Respuesta pendiente de recuperación”; recuperar la misma compra. |

Los estados de compras de esta tabla se aplican al caso público Testnet, no habilitan compras en la revisión estándar. Disponible = máximo entre cero y autorizado − confirmado − reservado; déficit real visible. Cupos de rol limitan la misma bolsa. Una revisión cancelada o informe completo pueden conservar estado financiero pendiente. No liberar automáticamente una reserva por timeout ni prometer reembolso.

## Sistema visual

Dirección sobria, fondo claro, tinta azul oscura y jerarquía por tipografía/espaciado. Sin degradados, fondos animados ni cifras decorativas inventadas. Variables semánticas y componentes reutilizables en Figma; no pantallas hechas con capturas planas.

| Token | Valor | Uso |
| --- | --- | --- |
| Fondo / superficie | #F8FAFC / #FFFFFF | Lienzo y contenido. |
| Texto / secundario | #0F172A / #475569 | Jerarquía legible. |
| Primario / navegación | #1E3A5F / #132A45 | Acción y estructura. |
| Éxito / error | #166534 / #B91C1C | Con texto e icono. |
| Advertencia / superficie | #854D0E / #FFFBEB | Incertidumbre o decisión requerida. |
| Borde control / divisor | #64748B / #CBD5E1 | Controles y separación. |
| Foco / esqueleto | #2563EB / #E2E8F0 | Foco visible y carga. |

Tipografía de diseño: **Inter**, pesos Regular, Medium, Semi Bold y Bold; **IBM Plex Mono** para referencias y valores técnicos. Cuerpo 16 px, ayudas 14, subtítulo 18–20, título 28–32; interlineado de lectura alrededor de 1,5. Valores monetarios tabulares y alineados. La futura web deberá resolver licencia/alojamiento sin añadir cargas externas innecesarias.

Espaciado 4/8/12/16/24/32/48 px; controles de al menos 44 px; radios 6–12 px según componente. Una familia SVG coherente, sin emojis como navegación. Movimiento de feedback breve, reducido o eliminado cuando se prefiera menor animación.

Componentes: botones primario/secundario/ghost/peligro con estados; campos, textarea, casilla de aceptación, etiquetas de estado, alertas, filas de archivo/revisión/tarea/notificación, pestañas, navegación, desglose financiero, diálogo y barras de esqueleto. Variantes normal, hover, foco, deshabilitado, carga, error y éxito donde correspondan. No multiplicar variantes sin uso.

## Carga, vacío y errores

Cada pestaña tendrá un esqueleto propio que conserve navegación, título, ancho y estructura de su contenido. Incluye Inicio, Revisiones, Nueva revisión, Autorización, Resumen, Gastos, Actividad, Informe, Informes, Notificaciones, Servicios y Ajustes; acceso/recuperación usan carga del formulario. El esqueleto no contiene resultados ni importes que parezcan reales.

Distinguir carga inicial de actualización: en la segunda conservar último dato con fecha y aviso de desactualización si falla. Un estado vacío explica la ausencia y ofrece una acción pertinente; “sin resultados de búsqueda” permite limpiar filtros. Error ofrece reintento seguro y referencia pública, sin stack trace, secretos o compras nuevas.

Informe parcial no equivale a “sin defectos”. Hallazgos y casos dependen de evidencia recibida; un resultado del fixture nunca se atribuye a archivos propios. Retención vencida informa fecha/motivo y retira descarga. Guardar preferencias, marcar notificaciones y copiar valores tienen feedback de éxito/fallo.

## Accesibilidad y adaptación

Objetivo futuro **WCAG 2.2 AA**, sin certificación actual. [W3C](https://www.w3.org/WAI/WCAG22/quickref/).

- Etiquetas visibles, errores asociados, resumen enfocable, orden de lectura y foco coherente.
- Contraste de texto normal al menos 4,5:1; texto grande y controles relevantes 3:1. Estado no depende solo de color.
- Controles 44 × 44 px; funciones por teclado; diálogos con foco contenido y retorno al invocador.
- Carga y cambios relevantes se anunciarán sin narrar cada actualización; foco inmediato y movimiento reducido.
- Base escritorio 1.440 px, tablet 768 y móvil 375; reflujo futuro a 320 y zoom 200 % sin perder acciones.
- En móvil navegación compacta, campos apilados y movimientos financieros con etiquetas; código/tablas pueden desplazarse dentro de su región.
- Fechas y vencimientos con zona visible; referencia inicial America/Santiago. Moneda y Testnet explícitos.

Figma permite revisar intención y geometría; teclado, lector de pantalla y semántica deberán probarse en una futura implementación. No se instala ni selecciona un router por diseñar estas pantallas.

## Aceptación del diseño

El [mapa](prototype-screen-map.md) debe corresponder a frames editables y recorridos conectados, sin botones principales huérfanos. Verificar acceso/recuperación, creación→aceptación→resumen→gastos/actividad/informe, notificaciones→origen y confirmaciones conservadoras/destructivas. Los escenarios de carga/error deben mantener el contexto. Revisar escritorio y móvil y registrar únicamente IDs Figma reales.

Quedan pendientes validación con usuarios, entregabilidad de correo, proveedor de identidad/modelo, contratos efectivos y soporte de wallet. No son dependencias ni capacidades implementadas.

## Interacciones representadas y enlaces

El archivo contiene componentes interactivos para Mostrar/Ocultar contraseña y variables nativas de Figma para lectura individual/todas de avisos, filtro Sin leer y eliminación del borrador de ejemplo. Estas interacciones cambian el estado del prototipo; no verifican una contraseña ni persisten datos en un backend.

DEMO-01 presenta autorización específica, gastos, actividad y resultado de la integración pública. Sus datos y resultados no se trasladan a una revisión privada ni prueban compras ejecutadas. Los destinos de pestañas del trabajo completado deben conservar su estado e identidad.

Enlaces de recorrido proporcionados por el agente principal: [escritorio](https://www.figma.com/proto/lgVHKGkPztbmJ85eTEuIoa/AgentNexo?node-id=16-109&starting-point-node-id=16%3A109), [móvil](https://www.figma.com/proto/lgVHKGkPztbmJ85eTEuIoa/AgentNexo?node-id=24-145&starting-point-node-id=24%3A145) y [diseño editable](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa). La verificación final de estos recorridos y sus composiciones corresponde al agente principal; este documento no declara aprobación final.
