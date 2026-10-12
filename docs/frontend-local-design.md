# Frontend del prototipo local

Fecha: 12 de octubre de 2026. Diseño acordado para implementación después de generar constitution, spec, plan y tasks con Spec Kit.

## Fuentes y precedencia

La instrucción actual exige monorepo `frontend/` y `backend/`, funcionamiento exclusivamente local y ausencia de login, credenciales, dominios o servicios externos. Sustituye los requisitos históricos de acceso y despliegue. La selección de actor representa un contexto de demostración, no autenticación.

La referencia visual vigente son las exportaciones Markdown/HTML locales de `../Figma/06 - Casos de uso - Web`, `07 - Casos de uso - Escritorio pt2` y `09 - Cobertura y recorridos`: 150 + 30 estados del marketplace ERS v0.3. Fundamentos y componentes proceden de 00 y 01; 03 aporta errores/vacíos y 08 esqueletos. 02 contiene referencias de la fase anterior de revisión privada. Las carpetas 04 y 05 no están presentes; la adaptación móvil se deriva de las reglas documentadas y referencias móviles disponibles en 08.

Documentos complementarios: `frontend-ux.md`, `prototype-screen-map.md`, `figma-delivery.md` y `monorepo.md`. La ampliación de doce CU de `figma-delivery.md` prevalece sobre la navegación antigua de revisión privada. No se consulta Figma remoto.

## Tokens y geometría

| Variable CSS | Valor |
| --- | --- |
| --color-bg | #F8FAFC |
| --color-surface | #FFFFFF |
| --color-ink | #0F172A |
| --color-muted | #475569 |
| --color-primary | #1E3A5F |
| --color-sidebar | #132A45 |
| --color-success / --color-success-bg | #166534 / #F0FDF4 |
| --color-warning / --color-warning-bg | #854D0E / #FFFBEB |
| --color-error / --color-error-bg | #B91C1C / #FEF2F2 |
| --color-info-bg | #EEF3FA |
| --color-border / --color-divider | #64748B / #CBD5E1 |
| --color-focus / --color-skeleton | #2563EB / #E2E8F0 |

Inter para lectura y controles; IBM Plex Mono para montos y referencias. Fuentes locales si están disponibles, sin solicitudes a CDN. Cuerpo 16/24 px, ayudas 14/20, subtítulos 18/26 y títulos 32/40. Espaciado 4/8/12/16/24/32/48. Sidebar de escritorio 240 px, contenido flexible con padding 40; tarjetas padding 24, gap 16, radio 12 y divisor de 1 px. Botones padding 12/16, radio 8 y controles de al menos 44 px. Base 1440, adaptación 768 y 375, reflujo 320 sin perder acciones. Sin alturas fijas que recorten contenido.

## Pantallas y casos de uso

| CU | Vistas locales | Comportamiento |
| --- | --- | --- |
| CU01 | Catálogo, búsqueda/filtros, ficha de oferta/versionado | Abrir oferta aprobada, limpiar filtros y explicar contratación bloqueada. |
| CU02 | Selector de actor, preferencias y privacidad | Visitante, Ana compradora, Marcos proveedor y Rocío administradora/árbitra; sin sesión, contraseña, recuperación ni invitación real. |
| CU03 | Mis ofertas, nueva oferta, edición, versiones y revisión de publicación | Guardar borrador, validar, enviar a moderación, crear versión, retirar futuras ventas. |
| CU04 | Bandeja de moderación, ficha/evidencia, aprobación/rechazo/suspensión | Motivos explícitos y conflicto de interés bloqueado; no alterar encargos existentes. |
| CU05 | Nuevo encargo, objetivo, archivos, criterios y política | Validar límites; snapshot y aceptación explícita inicialmente desmarcada. |
| CU06 | Términos, contratación y garantía simulada | Partes, cuatro bolsas, plazos y preparación; depósito sólo local y claramente simulado. |
| CU07 | Resumen y actividad del encargo | Inicio local, tareas, resultados y fallos; análisis sin ejecución de archivos ni llamadas a modelos externos. |
| CU08 | Mis encargos, detalle y cancelación | Estado contractual separado de ejecución; confirmación y efecto según fase. |
| CU09 | Gastos, movimientos y compras del fixture DEMO-01 | Bolsas separadas, reservas, incertidumbre, conciliación y ampliación aceptada. |
| CU10 | Entrega, informe, exportación, aceptación y disputa | Criterios/evidencia/limitaciones, Markdown y JSON; compartir evidencia mínima al disputar. |
| CU11 | Mis ventas, detalle, respuesta a disputa y renuncia | Cobros/devoluciones/vencimientos, filtros y confirmación de renuncia. |
| CU12 | Operaciones, disponibilidad, pausa, conciliación y arbitraje | Motivo y conflicto explícitos; resolución local total, nunca parcial. |

Inicio, notificaciones y preferencias completan la navegación. El detalle del encargo usa Resumen, Gastos, Actividad e Informe y conserva identidad y estado al cambiar pestañas. Las notificaciones abren su origen y su lectura no modifica ejecución ni contabilidad.

## Componentes e interacción

Shell, navegación lateral/móvil, encabezado contextual, botones primario/secundario/ghost/peligro, campos/textarea/casillas, badges, alertas, tarjetas, pestañas, filas de archivo/oferta/encargo/notificación, cronología, desglose presupuestario, hallazgos de informe, esqueletos propios por vista, vacío, error recuperable y diálogos de confirmación.

Los fragmentos HTML exportados son referencia visual: se convierten en controles semánticos y formularios accesibles. Etiquetas persistentes, error asociado, foco visible, diálogos con foco contenido/retorno, teclado, estados con texto además de color y movimiento reducido. La actualización conserva datos anteriores con aviso si falla. No hay botones principales sin destino ni acciones decorativas presentadas como operativas.

Confirmaciones para eliminar borrador, quitar archivo, descartar cambios, cancelar, retirar oferta, aceptar entrega, renunciar y resolver disputa. Escape conserva; foco inicial en la opción conservadora. Estado pendiente deshabilita envío duplicado.

## Contrato de interfaz y frontera

`frontend/` contiene React, TypeScript, Vite, navegación por URL y CSS semántico. Los DTO compartidos proceden de `@agentnexo/api-contracts`, sin IO, SQL, SDK financieros ni dependencias del servidor. El contrato exacto se fija en `local-api-contract.md`.

API base `/api/v1`; cada solicitud incluye `X-Actor-Id` para seleccionar un actor local conocido. No hay tokens de acceso ni cookies de autenticación. Una capa cliente central convierte respuestas y errores en estados de interfaz. Las rutas, payloads y tipos definitivos se implementarán según el contrato del backend; este documento no inventa endpoints.

Backend es autoridad única para persistencia, permisos de escenario, transiciones, presupuestos, aceptación, conciliación y notificaciones. Frontend no concede permisos ni calcula autoridad financiera. Configuración, perfiles y capacidades son locales. Todas las acciones que en producción requieren firma, blockchain, modelo o correo se rotulan como simuladas y no conectan servicios externos.

## Invariantes de presentación

- Título 3–100 caracteres; objetivo 20–2000; 1–10 criterios de hasta 500 cada uno.
- 1–3 archivos JS/TS UTF-8, máximo 1000 líneas y 262144 bytes combinados; error concreto por archivo. No URLs, clonación, instalación o ejecución.
- Edición invalida política aceptada; la ampliación requiere nueva aceptación.
- Precio, modelos, herramientas y comisiones son cuatro bolsas independientes. Nunca sumar USD/USDC/XLM ni usar precio retenido para herramientas.
- Herramientas A/B sólo en fixture público DEMO-01 separado; archivos privados muestran no aplicable.
- Contratación, ejecución, entrega y cierre financiero mantienen estados distintos; incertidumbre no se borra al cancelar.
- Informe parcial y criterio no evaluado declaran sus límites; pruebas propuestas no se presentan como ejecutadas.
- Fechas absolutas con zona America/Santiago y montos con unidad explícita, alineación tabular.

## Verificación prevista

Construcción y comprobación TypeScript; integración de formularios y API; recorridos reales catálogo→encargo→política→contratación local→ejecución→informe→decisión; oferta→moderación; disputa→arbitraje; gastos→conciliación; notificación→origen. Verificación visual de escritorio/móvil, teclado, foco, reflujo y estados de error. La aprobación del diseño Figma no prueba estos comportamientos de aplicación.
