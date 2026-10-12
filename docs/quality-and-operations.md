# Calidad y operación

**Estado:** requisitos de revisión de diseño y futura aceptación del producto. El código anterior fue retirado; no hay aplicaciones, scripts, CI ni suites disponibles. Backend, agentes, persistencia y pagos pendientes. Un recorrido de Figma no acepta P1/P2. Fecha: **10 de octubre de 2026**.

## Separación de evidencias

| Evidencia | Qué demuestra | Qué no demuestra |
| --- | --- | --- |
| Requisitos, enlaces documentales y nodos Figma revisados | Alcance, responsabilidades y navegación visual coherentes. | Que el producto arranque o realice un pago. |
| Metadatos de versiones de registros oficiales | Que una versión publicada y sus restricciones fueron consultadas. | Compatibilidad integrada, ausencia de vulnerabilidades o instalación local. |
| Recorridos del prototipo Figma | Destinos y estados visuales representados. | Ejecución de lógica, correo, sesión o pagos. |
| Prueba integrada con recibos y hashes Testnet | Resultado de una combinación exacta de SDK, firmante, contrato, activo y facilitator. | Garantía de entrega HTTP, calidad del informe o capacidad en Mainnet. |

Toda evidencia futura registra fecha, commit, versiones exactas, configuración pública pertinente, entrada sintética, resultado esperado/obtenido y limitaciones. No guardar claves, sesiones, código privado ni prompts completos en reportes de CI.

## Diseño actual y construcción futura

La entrega vigente se valida mediante inventario de pantallas, componentes editables, variables visuales, destinos de prototipo y revisión de composiciones en escritorio/móvil. Acceso y recuperación deben tener campos precisos, carga y errores; cada pestaña tiene un esqueleto pertinente. Confirmaciones ofrecen conservar y distinguen borrar, archivar y cancelar.

Verificar Inicio→crear→condiciones→aceptación→Resumen; pestañas del mismo trabajo; Gastos inciertos/entrega perdida; notificación→origen; recuperación→nueva contraseña→acceso y error/carga. Registrar los nodos reales creados y capturas inspeccionadas. No atribuir accesibilidad semántica o funcionalidad de servidor al diseño.

La [propuesta de monorepositorio](monorepo.md) no está materializada. Si se autoriza construir, frontend/backend tendrán instalación/build/inicio independientes y contratos públicos portables. Un lock revisado y dependencias en cada consumidor; comprobar en checkout limpio. Sin instrucciones de instalación actuales ni carpetas ejecutables.

## Configuración y entorno

Node.js LTS 24 es la línea objetivo. La consulta del coordinador registra **24.21.0** como LTS publicada y **24.18.0** local; no se actualiza el computador en esta tarea. npm **12.2.0** es la referencia consultada. Fijar versiones y restricciones en el primer build, comprobar compatibilidad de dependencias nativas SQLite y no usar `latest` en instalaciones/CI reproducibles. [Node.js releases](https://nodejs.org/en/about/previous-releases), [registro npm](https://registry.npmjs.org/npm/latest).

| Entorno | Datos, red e integraciones | Reglas |
| --- | --- | --- |
| Desarrollo | Ejemplos sintéticos, SQLite local; modelo y pagos sustituidos por adaptadores deterministas por defecto. | Credenciales dedicadas, ningún gasto por levantar un servidor. |
| Pruebas | Base temporal por suite; reloj controlable; fixtures de ofertas, pagos y respuestas. | Sin conexión necesaria a blockchain en pruebas unitarias/integración local. |
| Demo Testnet | Instancia única, SQLite persistente y proveedores A/B identificados como demo. | Claves de prueba separadas; límites pequeños; evidencias de liquidación. |
| Producción pública | Fuera del MVP. | Requiere resolver identidad pública, operación, pagos y protección de datos antes de habilitarse. |

Separar variables de frontend, backend y proveedores. Frontend recibe solo URL pública de API y opciones visuales no sensibles; cualquier variable `VITE_*` queda expuesta en el bundle. Claves de modelo, credenciales de sesión y material de firma permanecen en backend/gestor de secretos y nunca en Git. [Vite: variables](https://vite.dev/guide/env-and-mode).

Validar configuración al inicio; rechazar valores de plantilla, red distinta de Testnet en demo, destinatarios no admitidos o almacenamiento inválido. Documentar cómo provisionar secretos sin pegarlos en logs. La sesión del responsable preconfigurado es distinta de la conexión de wallet; no se implementa registro público solo porque haya una pantalla de acceso.

## Pruebas de producto previstas

Los nombres identifican niveles, no suites existentes. Evitar runners redundantes para una misma suite: Vitest para frontend/contratos y `node:test` para backend son la base prevista; Playwright cubre recorridos de navegador. Vitest **5.0.3** y Playwright **1.64.0** son referencias consultadas por el coordinador; antes de instalarlos se comprueban `engines`, soporte TypeScript/Vite y descarga de navegadores. [Vitest](https://registry.npmjs.org/vitest/latest), [Playwright](https://registry.npmjs.org/@playwright%2Ftest/latest).

| Nivel | Objeto | Prueba y evidencia mínima |
| --- | --- | --- |
| Dominio | Presupuesto, política, idempotencia, transiciones. | Importes exactos; límites global/agente/operación; vencimiento y destino; transiciones prohibidas y duplicados. |
| Integración SQLite | Repositorios, migraciones y reservas. | Dos conexiones compiten por el mismo cupo; una sola reserva; rollback; unicidad; recuperación tras cierre abrupto. Usar SQLite real, no sustituir transacciones por un mock. |
| Contrato HTTP | DTO, validación, sesión, autorización por recurso y errores. | Contratos compartidos y servidor coinciden; cantidades inválidas, archivos excedidos y propietario incorrecto se rechazan. |
| Coordinador/agentes | Límites y consolidación. | Dos roles, concurrencia máxima de dos, llamadas/reintentos/plazo; informe parcial y cancelación; instrucciones maliciosas no amplían herramientas. |
| Integraciones simuladas | LLM, proveedor, facilitator y RPC. | 402 fuera de política, timeout antes/después de envío, respuesta perdida, error transitorio y entrega fallida tras pago. |
| Navegador | Recorrido visible. | Crear, autorizar, seguir, comprender rechazo/reserva incierta, cancelar y descargar. DOBLE clic/recarga no producen otro trabajo/pago. |
| Accesibilidad | Semántica y comprensión. | Automatización de errores comunes; teclado, lector de pantalla, zoom/reflujo y contraste manual. |
| Soroban local | Política contractual si se implementa. | Destinos, activos, cupos, vencimientos e intentos de evasión con autoridad equivalente. |
| Testnet integrada | SDK, firmante, contrato, facilitator y activo exactos. | Compra y rechazo verificables, hashes/recibos y recuperación. Una prueba local del contrato no reemplaza esta prueba. |

No ejecutar archivos del cliente para “verificar” el resultado. Las pruebas de AgentNexo usan datos sintéticos controlados; el entregable del agente diseñador son casos propuestos, no una suite ejecutada sobre código recibido.

### Matriz de aceptación trazable

La aceptación integrada P1/P2 de los casos siguientes está **pendiente**. La revisión de diseño P0 se registra por separado y no constituye evidencia de esa aceptación. Los identificadores se conservan en futuros tickets, tests y evidencias.

| ID | Requisito y responsable | Escenario verificable | Evidencia requerida |
| --- | --- | --- | --- |
| Q01 | Trabajos + frontend | Crear trabajo con objetivo, criterios, 1–3 archivos `.js` o `.ts` UTF-8, 1.000 líneas y 256 KiB totales; rechazar otras extensiones y entrada excedida antes de ejecutar. | DTO persistido, errores por campo y ausencia de tarea iniciada al rechazar. |
| Q02 | Autorización + políticas | Intentar iniciar sin autorización o con versión anterior; editar alcance de borrador con `PATCH`, `If-Match` e idempotencia. | Rechazo del inicio inválido sin agente/pago; edición solo en `draft/awaiting_authorization`; snapshot/política dependiente invalidado y condiciones revisadas de nuevo. |
| Q03 | Coordinador | Reviewer o dos roles según política; máximo 2 simultáneos, 4 llamadas por tarea incluyendo 1 reintento, plazo 10 minutos. Probar ambas variantes; single-pass sin A/B. | Modo/roles inmutables durante ejecución; contador reproducible; tareas extra bloqueadas; cierre parcial si corresponde. |
| Q04 | Broker + datos | Trabajo de 0,05 USDC Testnet: A compra 0,03; B solicita 0,03. | A confirmada, B rechazada sin autorización emitida; disponible 0,02 y reservas 0 al conciliar. |
| Q05 | Broker + proveedores | Segundo trabajo de 0,06 permite A y B a 0,03. | Dos destinatarios y resultados distintos; no amplía el primer trabajo. |
| Q06 | Política | Cotización 0,04 con máximo por operación 0,03, aunque alcance saldo global. | Rechazo antes de firmar; reserva inexistente o anulada de forma segura según transición. |
| Q07 | Transacciones | Dos solicitudes distintas de 0,03 contra 0,05, iniciadas al mismo tiempo desde conexiones separadas. | Exactamente una reserva; presupuesto nunca negativo. |
| Q08 | Idempotencia | Reenvío concurrente y tras reinicio de una operación con la misma identidad; conflicto si cambia payload. | Una reserva y un pago como máximo; respuesta coherente o conflicto, no nueva compra. |
| Q09 | Recuperación | Interrumpir proceso después de persistir reserva, después de firmar y después de enviar. | Reserva y autorización recuperables; consulta/reconciliación sin emitir otro pago por timeout. |
| Q10 | Entrega | Liquidación confirmada seguida de fallo HTTP. | Gasto confirmado visible; recuperación del resultado con la misma compra o limitación explícita. |
| Q11 | Cancelación | Cancelar con una operación enviada. | No empiezan tareas nuevas tras procesar cancelación; continúa conciliación de operación enviada. |
| Q12 | Frontend | Consultar datos con estimación, reserva y confirmado en USD/token Testnet/XLM, incluyendo un cargo real superior a la cota estimada. | Importes coinciden con API; ningún total entre monedas; estado incierto explicado. Disponible es `max(0, autorizado − confirmado − reservado)` y déficit es `max(0, confirmado + reservado − autorizado)`; el cargo confirmado nunca se oculta. |
| Q13 | Informes | Una tarea concluye y otra falla/se rechaza. | Informe parcial con archivo/línea, evidencia, casos propuestos y limitaciones; ningún test inventado. |
| Q14 | Seguridad | Usuario distinto solicita trabajo/archivo/recibo; entrada o proveedor intenta cambiar permisos. | Acceso denegado y ninguna ampliación, firma o herramienta no autorizada. |
| Q15 | Contrato on-chain, si se afirma integrado | Eludir broker en prueba controlada con la misma autoridad delegada e intentar exceder política. | Rechazo real de política contractual durante liquidación x402; si falta, rotular control en aplicación. |
| Q16 | Operación | Restaurar copia previa con operaciones inciertas; incluir trabajo y pago creados después de la copia, ausentes de ella, y reiniciar sin red disponible. | Bloqueo global de nuevo gasto hasta enumerar y conciliar el intervalo copia–incidente, incluyendo cuentas, facturas y autorizaciones; si no puede reconstruirse de forma completa, el bloqueo se mantiene. Ningún pago duplicado ni reserva liberada por ausencia del registro. |
| Q17 | UX y accesibilidad | Teclado, lector de pantalla y 320/375/414/768/1.280/1.440 px; error, carga, vacío y textos largos. | Registro manual y capturas de la futura UI; sin pérdida de controles ni cifras. |
| Q18 | Monorepositorio | Construir frontend/API por separado y comprobar imports prohibidos. | Bundle frontend sin módulos/secretos de servidor; API funciona sin build frontend. |

No establecer una cifra arbitraria de cobertura como sustituto de estas pruebas. Prioridad: invariantes monetarias, autoridad, recuperación y comprensión del estado. Pruebas visuales se reservan para componentes/recorridos estables y relevantes, no para snapshots extensos que solo reflejan la implementación.

## CI por etapas

**Etapa actual:** ejecutar las comprobaciones de estructura/enlaces/metadatos realmente incorporadas al repositorio. Inspeccionan manifiestos/dependencias declaradas y destinos de enlaces Markdown locales; no revisan aún imports de fuentes, anchors ni disponibilidad de URLs externas. Reportar ausencia de aplicaciones como estado esperado, sin un “test passed” ficticio. Las comprobaciones no deben necesitar secretos ni acceso a wallets.

**Al implementar:** añadir instalación reproducible desde lockfile, validación de contratos, TypeScript, lint pertinente y tests del componente modificado. Frontend incluye build y recorrido de navegador; backend incluye migraciones y concurrencia SQLite; contratos usan su toolchain fijada. Cambios en `packages/api-contracts` disparan ambos lados. Un cambio solo documental conserva checks documentales sin lanzar pagos.

**Pruebas Testnet:** job separado y deliberado, nunca obligatorio para un PR ajeno que no tiene credenciales. Usar entorno protegido con secretos de Testnet de cupo acotado y no exponerlos a código de forks. Registrar versión/capacidades del facilitator en cada ejecución. No reintentar automáticamente una liquidación de resultado incierto.

**Dependencias:** registrar lockfile, revisar licencias y avisos relevantes, comprobar `engines` y binarios nativos en Windows y entorno de despliegue. Actualizaciones en cambios acotados con evidencia de pruebas; no modificar masivamente a `latest` al iniciar CI. Las acciones externas de CI se fijan por revisión verificable y se actualizan conscientemente.

## Despliegue previsto

Una máquina/instancia con proceso backend, almacenamiento persistente SQLite/archivos y activos estáticos del frontend. Reverse proxy con TLS expone frontend y `/api` bajo el mismo origen cuando sea posible; desarrollo usa proxy local/orígenes explícitos. El broker y coordinador viven en el proceso backend; no hay workers distribuidos ni balanceo de escritores.

Los proveedores A/B de demo pueden compartir proceso independiente con rutas, destinatarios y límites separados. No operarlos dentro del contexto de firma del cliente. El facilitator sigue siendo externo. Configurar timeouts y límites en backend; no delegar autoridad en el proxy o el navegador.

No usar filesystem efímero de una función serverless para SQLite o informes. No escalar réplicas copiando el archivo de base de datos. Si se necesita multiinstancia, alta disponibilidad o varios hosts escritores, abrir una decisión de migración a PostgreSQL y revisar coordinación/operación; no añadir Redis por anticipación.

Despliegue futuro: detener admisión de trabajos, esperar/resolver operaciones en curso de forma controlada, crear copia coherente, aplicar migración con versión/checksum, arrancar nueva versión en modo verificación y habilitar ejecución tras controles. Ante fallo, conservar la evidencia del intento y restaurar solo mediante el procedimiento probado; una versión anterior de programa no implica que pueda leer una base migrada.

## SQLite, archivos y copias

**La base activa y los informes se guardan fuera de OneDrive, del checkout Git y de carpetas sincronizadas.** El repositorio documental puede permanecer en su ubicación actual. Para Windows, una ruta propuesta es `%LOCALAPPDATA%/AgentNexo/data`; en despliegue, un volumen persistente local dedicado. Son destinos propuestos: esta tarea no los crea ni configura.

SQLite documenta restricciones de WAL en filesystems de red y riesgos de copiar archivos durante transacciones. Excluir la base activa de sincronización es una decisión operativa prudente derivada de esas restricciones, no una afirmación de que OneDrive tenga exactamente la semántica de NFS. [WAL](https://sqlite.org/wal.html), [riesgos de corrupción](https://www.sqlite.org/howtocorrupt.html).

Usar transacciones breves, activar y verificar claves foráneas, configurar un timeout de bloqueo acotado y supervisar tamaño del WAL. No hacer HTTP, inferencias ni operaciones blockchain dentro de la transacción de reserva. No desactivar mecanismos de durabilidad para mejorar una demo. Se recomienda WAL con `synchronous=FULL`, sujeto a verificar el driver y las pruebas de fallos; registrar la versión real embebida y la corrección WAL exigida en [datos](data-model.md).

Copias mediante la API de backup de SQLite o un mecanismo equivalente documentado que produzca una instantánea consistente; no copiar solo el `.db` mientras hay escritura activa. Archivos de entregables inmutables se vinculan por ID/hash y se respaldan junto al manifiesto que indica cuáles necesita la copia. [SQLite Backup API](https://sqlite.org/backup.html).

Procedimiento de restauración futuro:

1. Aplicar bloqueo global de nuevo gasto: deshabilitar firmas, envíos de pagos, inferencias facturables y admisión de trabajos en la instancia de destino.
2. Restaurar en ruta aislada una instantánea verificada y sus archivos referidos; registrar momento de copia y versión de esquema.
3. Ejecutar comprobación de integridad, claves foráneas, presencia/hash de informes y comparación de presupuestos/reservas.
4. Enumerar y conciliar todo el intervalo desde la copia hasta el incidente mediante cuentas controladas, red/facilitator, registros de proveedor y facturación, e inventario de autorizaciones emitidas. Incluir trabajos, compras e inferencias creados después de la copia y por tanto ausentes de la base restaurada; consultar solo sus filas `submitted/uncertain` es insuficiente. Reconstruir metadatos, cargos y reservas antes de permitir otro gasto.
5. Si no puede enumerarse o conciliarse completamente ese intervalo, mantener el bloqueo global de nuevo gasto, conservar reservas conocidas y recuperar evidencia externa o resolver con el responsable. Un registro ausente no demuestra que no hubo cargo, y bloquear solo los trabajos conocidos no protege contra operaciones desaparecidas de la copia. No liberar por antigüedad sin prueba de no liquidación y ausencia de autorización utilizable.
6. Habilitar ejecución solo tras documentar reconstrucción y conciliación completas, ausencia de autorizaciones desconocidas aún utilizables y validación de secretos/políticas. Lecturas pueden seguir disponibles en modo degradado mientras el gasto permanece bloqueado.

Retención inicial de demo acordada: entradas/código y respuestas del modelo **7 días** tras cierre; informes **30 días**; política, cargos y recibos **90 días** tras cierre financiero; backups cifrados **7 días**. Las operaciones inciertas conservan solo metadatos necesarios hasta resolver, con revisión a los 7 días y sin liberación automática. Eliminar contenido debe propagarse al almacenamiento activo y reaplicarse tras cualquier restauración; informar que las copias expiran en su propia ventana. Plazos y tratamiento de proveedores externos se detallan en [datos](data-model.md).

Objetivos propuestos para demo: copia antes de migrar y al terminar una sesión, más copia horaria durante operación. RPO operativo objetivo de una hora y RTO de cuatro horas, **sin medir todavía**; esos objetivos no autorizan perder ni repetir un pago ni levantar el bloqueo por cumplir un plazo. Las evidencias externas deben cubrir operaciones y trabajos enteramente posteriores a la copia, incluida facturación de modelos y autorizaciones aún utilizables. Si esa reconstrucción no es posible, continúa el bloqueo global. Practicar una restauración completa con ese caso antes de la demo.

## Observabilidad y respuesta a incidentes

Logs estructurados con identificadores de solicitud, trabajo, tarea y compra; transición, duración y código de error. Excluir entrada del cliente, respuestas completas de modelos, payloads de autorización firmados, cookies, claves y cabeceras sensibles. Correlacionar con registros persistidos del broker; los logs no sustituyen el libro de reservas/pagos.

Indicadores mínimos: trabajos activos/parciales, antigüedad de operaciones inciertas, reservas sin conciliación, rechazos por motivo, errores de SQLite, tiempos de proveedor y uso de llamadas/tokens. No crear panel analítico extenso antes de existir tráfico medido. Salud del proceso y disponibilidad para admitir trabajos son estados distintos: un API vivo con almacenamiento no escribible debe rechazar trabajo nuevo.

Ante liquidación incierta repetida, firmante comprometido, incoherencia de saldo o base no íntegra: detener nuevas firmas y compras, conservar registros y presentar estado degradado. Rotar/revocar credenciales según corresponda y reconciliar antes de reanudar. Ante caída solo de UI, el backend no presupone cancelación. Ante caída del proveedor, preservar resultados parciales y límites de reintento.

## Pendientes y criterios para avanzar

Pendientes: proveedor/host de demo, operación y responsable de copias, validación de los plazos propuestos con el responsable y proveedores externos, mecanismo de restauración verificado, driver SQLite compatible con runtime, proveedor/modelo de IA y compatibilidad real x402/Soroban/facilitator. Cada decisión se cierra con evidencia; no se instala infraestructura adicional para resolver incertidumbres documentales.

Orden propuesto: P0 revisa la experiencia en Figma; una construcción futura autorizada de P1 validaría utilidad, persistencia, sesión, límites e informe reales. El spike de pagos puede avanzar en paralelo y se integra en P2. La cuenta C no bloquea la revisión útil. El [plan actualizado](development-plan.md) y la [revisión crítica](scope-and-critical-review.md) fijan las dependencias y mínimos.

## Alcance de la revisión visual en curso

Los recorridos distinguen revisión privada estándar (modelo USD 1,00, USDC/XLM externos no autorizados en cero) de DEMO-01 público fijo (USD 1,00, USDC Testnet 0,06, XLM Testnet 0,10 y aceptación propia). Comprobar que cambiar pestañas de una revisión completada mantiene identidad y estado, y que ninguna acción convierte el trabajo privado en el caso Testnet.

Mostrar/Ocultar, lectura individual/todas de avisos, filtro Sin leer y borrador eliminado son interacciones nativas del prototipo. Verificar su representación sin atribuir almacenamiento o lógica de servidor. La aprobación visual final la registra el agente principal cuando termine; este documento no la da por concluida.
