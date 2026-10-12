# Requisitos y criterios de aceptación

Esta matriz exige aceptación integrada P1/P2, pendiente y fuera de la programación autorizada actual. P0 contiene requisitos y diseño Figma; la retirada del código y límites de evidencia se registran en [la revisión](review-record.md). Los [mínimos y exclusiones](scope-and-critical-review.md) impiden confundir simulación con producto operativo.

| ID | Requisito | Módulo responsable | Criterio y evidencia requerida |
| --- | --- | --- | --- |
| R01 | Trabajo estático acotado | jobs / work-orders | Persistir título de 3–100 caracteres, objetivo de 20–2.000 y 1–10 criterios de hasta 500; admitir 3 archivos, 1.000 líneas, 256 KiB; rechazar cada límite excedido, tipos/rutas inválidos. No proceso ejecuta la entrada. |
| R02 | Aceptación inicial | jobs, budgets, identity / work-orders | Mostrar snapshot/digest y registrar aceptación del responsable antes de run. Separar revisión privada con USD 1,00 y externos cero de la autorización Testnet pública DEMO-01. Modificar políticas exige otra aceptación; versión obsoleta se rechaza. |
| R03 | Ejecución acotada y variante explícita | execution, providers | P1 admite `single-pass` (reviewer) o `two-role` promovido tras R22; P2 documenta también el ensayo analyst/test-designer. Modo fijado en política; máximo 2 tareas y 4 llamadas por tarea incluido 1 reintento. Sin crear roles ni cambiar modo; herramienta no asignada se rechaza antes de IO. |
| R04 | Compra autorizada y rechazo por exceso | payments, budgets | Bolsa 0,05 USDC Testnet; ordenar A primero por 0,03, confirmar; B 0,03 rechazado sin firma. Final 0,03 confirmado/0 reservado/0,02 disponible. Hash, motivo y registro del firmante. |
| R05 | Dos APIs distinguibles | demo-services, payments | Segundo trabajo 0,06 compra A/B a 0,03; endpoints, resultados y destinatarios diferentes. Primer trabajo no se amplía automáticamente. |
| R06 | Tope por operación | budgets, payments | Cotización 0,04 contra máximo 0,03 rechazada aun con saldo global suficiente. No firma ni intento externo pagado. |
| R07 | Concurrencia | budgets | Barrera sincroniza dos solicitudes 0,03 contra 0,05; una reserva como máximo, otra rechazo. Comprobar base, no solo mock o orden de logs. |
| R08 | Idempotencia | jobs, payments, budgets | Mismo logical key y digest devuelve operación existente; otro digest produce conflicto. Reiniciar/reintentar no crea reserva/cargo/firma nueva. |
| R09 | Pagos inciertos | payments | Interrumpir después de persistir identidad y durante envío; reiniciar. Reserva permanece hasta evidencia; conciliación llega al mismo pago sin gasto duplicado. |
| R10 | Pago sin entrega | payments, reports | Confirmar transacción y perder respuesta HTTP. Gasto permanece confirmado, entrega fallida/pendiente visible; recuperación sin otra compra. |
| R11 | Garantía contractual condicional | contracts, payments | Compra x402 real y rechazos por cupo/destino/vencimiento/carrera, intentando omitir broker con misma autoridad delegada. Si falta, rotular control de aplicación. |
| R12 | Costos de modelos | providers, budgets | Contar llamadas/tokens facturables/retries; reservar cota; conciliar uso. Incertidumbre conserva reserva y sobrecosto real se registra/bloquea, nunca se oculta. |
| R13 | Informe verificable | reports / reports | Hallazgos sustentados separados de supuestos de negocio; referencias válidas; casos sin ejecutar; estado sustentado/no_sustentado/no_evaluado por criterio con evidencia; limitaciones y recibos. Una contribución no recibida no aparece en pantalla ni descarga. B fallido no impide mostrar observaciones obtenidas de A, ni la ausencia de A oculta B entregado. |
| R14 | Aislamiento y sesión | identity y todos los recursos | TenantB no puede listar/leer/mutar datos de A, incluso archivos/eventos/recibos. CSRF/origen/revocación/caducidad probados. Wallet sin sesión no otorga acceso. |
| R15 | Prompt injection y salida hostil | providers, execution / reports | Comentario o respuesta solicita shell, URL o secreto: ninguna herramienta lo permite. HTML/scripts de respuesta se muestran como texto; no se registran claves. |
| R16 | Cancelación y recuperación | jobs, execution, payments | Cancelación impide nuevo despacho; operación en curso conserva conciliación. Restore de backup bloquea gasto nuevo hasta comprobar operaciones posteriores. |
| R17 | Web accesible | Todos los módulos frontend | Teclado completo, foco, errores asociados, contraste y zoom 200%; 320px sin pérdida de acción primaria, lectura sin depender del color. |
| R18 | Monorepo y aplicaciones independientes | app/config/api-contracts | Propuesta futura: checkout limpio demuestra instalación/build/inicio independientes; contratos portables y ausencia de imports del servidor en navegador. P0 no contiene manifiestos ni aplicaciones. |
| R19 | Borrado, archivo y retención | jobs, reports, operación | Borrador eliminado solo sin ejecución/compromisos; archivo reversible sin borrar contabilidad. Retención de contenido 7/30 días, backup 7 y contabilidad 90 con excepción incierta mínima. Confirmaciones precisas y prohibición de prometer borrar blockchain. |
| R20 | Demo reproducible y honesta | Calidad y operación | Configuración pública/versiones/fixtures/hashes, pasos y resultados en fecha; todos los defectos y pendientes visibles. Testnet y servicios del proyecto identificados. |

## Paquete de evidencia

R21 — Aplicabilidad y necesidad de herramientas: entrada distinta del fixture rechaza A/B con `TOOL_NOT_APPLICABLE` antes de reserva/firma; una tarea puede completarse sin compras si entrega una salida válida. R22 — Valor de los roles: evaluación de 20 módulos, tres repeticiones y baseline de un modelo, métricas y puertas del [alcance crítico](scope-and-critical-review.md). Ambos están pendientes; los escenarios financieros no miden calidad del análisis.

Para cada escenario: ID de criterio, fecha UTC, commit/versión instalada, política normalizada sin secretos, fixture/digest público, estado inicial/final de base, eventos sanitizados, hash/ledger/activo/red de pagos y resultado observado. Firmas reutilizables, cookies, tokens, claves y código privado quedan excluidos.

R04 es un ensayo futuro de aceptación financiera con fixture público y 0,05 USDC Testnet; no es la política de archivos privados ni modifica el caso visual DEMO-01 de 0,06. Se ordena deliberadamente para demostrar A autorizado y B rechazado. R07 es otra prueba concurrente: cualquiera puede ganar; no se atribuye orden determinista a una carrera. Las pruebas de doble gasto financiero usan transacciones reales del motor y simulación de cortes; las pruebas on-chain requieren Testnet y sus hashes. Mocks verifican flujo local, no sustituyen liquidación ni autoridad contractual.

Una ejecución puede entregar informe completo con estado financiero pendiente; la evidencia debe mostrar ambos. Un gasto de modelos inesperado se registra aunque exceda autorización, bloquea gasto nuevo y abre conciliación. No convertir una discrepancia de factura en una supuesta prueba aprobada de topes.

## Aceptación visual y requisitos adicionales

| ID | Requisito | Evidencia de diseño / aceptación futura |
| --- | --- | --- |
| R23 | Acceso con errores y carga | Figma: formato de correo y contraseña vacía por campo; rechazo genérico, mostrando/ocultando, verificando y demasiados intentos. Futuro: servidor concede sesión solo tras verificar, bloquea duplicados y no enumera cuentas. |
| R24 | Recuperación autoservicio | Figma: solicitud, error local, enviando, respuesta genérica, enlace caducado/usado y nueva contraseña normal/corta/no coincidente/carga/éxito. Futuro: token aleatorio único de 30 min propuestos, cambio atómico, límites de intentos, 15–128 caracteres, sesiones revocadas y sin login automático. |
| R25 | Inicio y navegación completa | Inicio orientado a próxima acción, revisiones recientes, navegación a Revisiones/Informes/Notificaciones/Servicios/Ajustes y tabs de trabajo con identidad conservada. Sin cifras comerciales inventadas. |
| R26 | Notificaciones propias | Todas/Sin leer, vacío/carga/error; marcar una/todas, feedback y abrir origen. Futuro: autorización por principal, dedupe/idempotencia y estado de lectura que no cambia trabajo o pago. |
| R27 | Confirmaciones | Eliminar borrador, quitar archivo, descartar, cancelar y archivar tienen efecto preciso y salida conservadora. Operación pendiente bloquea borrado directo. Cancelar conserva cargos/reservas; archivar no borra contabilidad. |
| R28 | Estados y esqueletos | Inicio, Revisiones, Nueva revisión, Autorización, Resumen, Gastos, Actividad, Informe, Informes, Notificaciones, Servicios y Ajustes tienen esqueletos específicos, carga/vacío/error/reintento pertinentes. |
| R29 | Sistema visual editable y móvil | Variables, tipografía Inter/IBM Plex Mono, componentes con variantes, controles 44 px y adaptación escritorio/móvil. Revisión de legibilidad y recortes; teclado/lector de pantalla/320 px se aceptan en futura web, no por Figma. |
| R30 | Prototipo conectado y honesto | Destinos reales y acciones principales conectadas; Resumen/Gastos/Actividad/Informe conservan identidad y estado completado. Las variables Figma de avisos/borrador y Mostrar/Ocultar son interacciones del prototipo, sin persistencia backend. No afirmar correo, análisis, firma, descarga o pagos ejecutados. |
| R31 | Preferencias y sesión | Ajustes de cuenta y notificaciones, guardando/éxito/fallo, salida y sesión caducada. Futuro: autorización propia, 30 min inactividad/12 h máximo y revocación al salir/restablecer. |

La aceptación visual valida composición, cobertura y navegación representada. La aceptación de producto exige evidencia de servidor, datos, accesibilidad y operaciones reales. Las pruebas del prototipo retirado no son evidencia vigente.

## Separación de revisión privada e integración pública

R32 — La autorización estándar admite archivos privados y modelo por USD 1,00; USDC/XLM externos no autorizados, ambos con tope cero. Una necesidad o un 402 nunca convierte esta revisión en un caso financiero. A/B y firma se rechazan antes de IO, reserva o envío; no se envía código privado al fixture ni se reutiliza su resultado.

R33 — DEMO-01 usa exclusivamente el fixture público pricing.ts fijo, con política e identidad propias. Requiere autorización Testnet explícita de USD 1,00 de modelos, 0,06 USDC Testnet y 0,10 XLM Testnet en bolsas separadas. Autorización, gastos, actividad y resultado están ligados a ese caso; no se atribuyen al informe de una revisión privada.

R34 — En el diseño, cambiar entre Resumen, Gastos, Actividad e Informe de una revisión completada conserva trabajo, estado y evidencia. Eliminar el borrador de ejemplo mediante variable de Figma altera solo su representación; no borra un recurso persistido ni compromisos financieros.

Las futuras pruebas R04–R11/PAY son ensayos financieros con fixture público y sus propias políticas; sus límites no habilitan compras estándar. Los enlaces de Figma y la verificación visual final se registran por el agente principal, sin sustituir esa aceptación integrada.
