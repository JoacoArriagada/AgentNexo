# Entrega del frontend en Figma para ERS v0.3

**Fecha: 10 de octubre de 2026.** La ampliación autorizada cubre los doce casos de uso de la ERS de trabajo v0.3: catálogo controlado, cuatro roles, ofertas versionadas, contratación financiada, revisión y cierre contractual. El trabajo vigente sigue siendo **requerimientos y diseño en Figma, sin código ni aplicación**. El diseño de la ampliación está terminado: 180 pantallas/variantes de escritorio, 180 móviles y 24 esqueletos, uno por CU y formato. Son marcos de diseño, no 360 funcionalidades distintas ni servicios implementados.

La referencia de alcance es la [ERS de trabajo v0.3](<../../Documentos/Ingenieria de Requerimientos/Exportación/AgentNexo_Especificacion_de_Requerimientos.docx>). Sus parámetros siguen propuestos para validación; no son una línea base aprobada ni resultados de pruebas. La [auditoría anterior](<../../Documentos/Ingenieria de Requerimientos/Exportación/AgentNexo_Analisis_critico_Figma_vs_requerimientos.md>) examinó el diseño con referencia a v0.1 antes de esta ampliación; se conserva sin sobrescribirla. La referencia actual contiene 44 requisitos de software y 33 pruebas planificadas.

## Abrir la ampliación

- [Portal de escritorio](https://www.figma.com/proto/lgVHKGkPztbmJ85eTEuIoa/AgentNexo?page-id=63%3A8&node-id=63-12&starting-point-node-id=63%3A12&scaling=fit-width&content-scaling=fixed).
- [Portal móvil](https://www.figma.com/proto/lgVHKGkPztbmJ85eTEuIoa/AgentNexo?page-id=63%3A9&node-id=63-175&starting-point-node-id=63%3A175&scaling=fit-width&content-scaling=fixed).
- [Diseño editable](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-12).
- [Página de esqueletos](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-10).
- [Matriz visible de cobertura](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=72-2994).

Las páginas nuevas son escritorio 63:8, móvil 63:9, esqueletos 63:10 y cobertura 63:11. Los portales de entrada son 63:12 y 63:175. Cada formato dispone de 13 entradas de flujo: portal y doce CU. El recorrido móvil conserva la base de 375 px. Los 24 esqueletos pertenecen a esta ampliación; las muestras y cifras de la entrega anterior se conservan como registro histórico y no se suman aquí.

## Cuatro roles y sus límites

| Rol | Funciones y restricciones |
| --- | --- |
| Visitante | Consulta pública de ofertas aprobadas sin cuenta ni wallet; continúa hacia acceso para contratar. |
| Comprador | Encargo y órdenes propios, snapshot, depósito, inicio, gasto, aceptación, disputa y reclamación por plazo. |
| Proveedor | Publicación/versionado, ofertas y ventas propias, antecedentes compartidos y renuncia al precio; no accede al código privado por ser vendedor. |
| Administrador | Invitaciones/roles, moderación independiente, incidentes y conciliación justificada. Arbitraje solo si fue designado para la orden y no es parte. |

Una persona puede tener varios roles expresos. Cambiar de vista no concede permisos. Se impide contratar la propia oferta, aprobar la propia publicación o arbitrar una orden propia. El proveedor humano se distingue del proveedor de modelo y de las APIs A/B.

## Cobertura de los doce casos de uso

El inventario siguiente documenta las vistas, decisiones y alternativas diseñadas en escritorio y móvil. Cada CU dispone de un esqueleto por formato y de una entrada propia; la matriz visible vincula requisitos y nodos. Esta cobertura visual no demuestra aceptación funcional de una aplicación.

| Caso de uso exacto | Vistas y decisiones | Alternativas mínimas |
| --- | --- | --- |
| CU01 Explorar catálogo | Buscar/filtrar, ficha de versión aprobada, proveedor, perfil, precio/activo, costos excluidos, evidencia y garantía. | Vacío, limpiar filtros, oferta retirada y contratar bloqueado. |
| CU02 Acceder y gestionar sesión | Invitación, acceso, recuperación, cierre, rol autorizado y vínculo wallet mediante desafío. | Error genérico, token vencido, rol prohibido, firma rechazada y wallet ajena. |
| CU03 Publicar y versionar agente | Ficha, perfil aprobado, entregables, precio, receptor verificado, términos, borrador y envío a moderación. | Campos inválidos, rechazo motivado, revisión y nueva versión sin sobrescribir la publicada. |
| CU04 Moderar publicaciones | Bandeja, ficha/evidencia, cuenta, conflicto, aprobar/rechazar y suspender. | Autoaprobación denegada, falta de evidencia y retirada para nuevas ventas sin alterar órdenes. |
| CU05 Preparar encargo y política | Oferta/versión, objetivo, archivos, criterios, cuatro bolsas, herramientas y aceptación de snapshot. | Entrada inválida sin costo, aceptación invalidada por edición y política incompatible. |
| CU06 Contratar y depositar precio | Términos, partes, árbitro, precio/plazos, preparación, orden única, firma y financiación confirmada. | Rechazo de firma, saldo/red incorrectos, financiación pendiente/incierta, oferta cambiada y capacidad agotada antes del depósito. |
| CU07 Ejecutar agente contratado | Inicio tras financiación y preparación; perfil fijo, tareas, actividad, resultados completos/parciales. | Sin permiso/presupuesto, fallo o reintento limitado, herramienta no aplicable y no preparado. |
| CU08 Seguir y cancelar encargo | Estados separados, avance y confirmación del efecto según fase. | Antes de inicio: devolución del precio; después: disputa; compras enviadas conservan conciliación. |
| CU09 Controlar gastos y compras | Cuatro bolsas, cotización, reserva, límites, recibo, pagador, saldos y ampliación aceptada. | Rechazo antes de firma, incertidumbre, déficit, pago sin entrega y recuperación de la misma compra. |
| CU10 Revisar y resolver entrega | Informe/criterios/evidencia, Markdown/JSON, aceptar con firma, disputar, responder y cierre. | Parcial, no entrega, silencio, evidencia incompleta, firma rechazada y cierre pendiente de conciliación. |
| CU11 Consultar ventas propias | Ofertas/órdenes filtradas, precio retenido, cobros, devoluciones, vencimientos y renuncia. | Sin ventas, orden ajena, orden financiada no editable y confirmación de retirada/renuncia. |
| CU12 Operar y resolver disputas | Preparación, incidentes, pausas, reservas antiguas, conciliación, controversia y resolución motivada. | Conflicto arbitral, datos incompletos, restauración no conciliada y acción sin permiso. |

Carga, error recuperable, vacío, validación, confirmación conservadora y acción deshabilitada con motivo se representan por actor. El estado completado del análisis no equivale a cierre de la contratación. Las vistas de encargo, gastos e informe tienen variantes propias para precio pagado y devuelto, de modo que la navegación conserve identidad y cierre.

## Nodos de entrada y esqueletos

| CU | Escritorio | Móvil | Esqueleto escritorio | Esqueleto móvil |
| --- | --- | --- | --- | --- |
| CU01 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-13) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-176) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-8) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-975) |
| CU02 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-19) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-182) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-97) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-1058) |
| CU03 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-60) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-223) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-161) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-1118) |
| CU04 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-72) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-235) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-257) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-1205) |
| CU05 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-38) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-201) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-330) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-1266) |
| CU06 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-46) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-209) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-420) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-1344) |
| CU07 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-79) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-242) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-520) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-1434) |
| CU08 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-81) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-244) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-603) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-1505) |
| CU09 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-86) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-249) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-663) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-1553) |
| CU10 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-97) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-260) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-754) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-1634) |
| CU11 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-118) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-281) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-823) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-1691) |
| CU12 | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-137) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=63-300) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-888) | [Abrir](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa/Sin-t%C3%ADtulo?node-id=70-1748) |

Estos enlaces abren nodos existentes del diseño. Los portales de prototipo permiten recorrer las variantes conectadas; los esqueletos son referencias visuales estáticas.

## Precio retenido y tres bolsas de gasto

| Categoría | Ejemplo de la ERS | Presentación y autoridad |
| --- | --- | --- |
| Precio de contratación | 0,02 USDC Testnet por orden | Retenido en escrow; pago íntegro al proveedor o devolución íntegra al comprador. Nunca financia herramientas. |
| Modelos | USD 1,00 por trabajo | Autorizado, reservado, confirmado, disponible y déficit; subtope 0,50 por rol si se permite two-role. |
| Herramientas | 0,05 o 0,06 USDC Testnet | Máximo 0,03 por compra A/B, identidad única, pago y entrega independientes. |
| Comisiones | 0,10 XLM Testnet | Pagador y patrocinio explícitos; no duplicar costos de terceros ni descontarlos silenciosamente del precio. |

Los importes son escenarios ilustrativos propuestos, no tarifas comerciales ni saldo real. No sumar USD, USDC y XLM. Aunque precio y herramientas usen USDC, son bolsas distintas. Déficit o incertidumbre no desaparecen al cancelar o cerrar una vista.

Para archivos privados A/B siguen no aplicables; no se reutiliza su catálogo como evidencia. La base es reviewer; two-role solo corresponde a un perfil evaluado y permitido. La aceptación de política es distinta de firmar depósito; la financiación y el inicio contractual deben confirmarse antes de ejecutar. El escrow del precio es obligatorio en la contratación protegida de la ERS; la alternativa G-account de herramientas no lo sustituye.

## Diez transiciones de garantía

| Transición | Autoridad/condición propuesta | Salida que debe explicar la interfaz |
| --- | --- | --- |
| T1 Iniciar | Atestador autorizado antes de 30 min desde depósito. | Financiada→en ejecución; esperar confirmación. |
| T2 No inicio | Comprador cancela antes del inicio o una parte reclama desde 30 min sin inicio. | Devolución íntegra al comprador original. |
| T3 Entregar | Atestador registra informe válido y accesible antes de 15 min desde inicio. | Entregada; comienza aceptación de 48 h. |
| T4 Sin entrega | Una parte reclama desde 15 min sin entrega atestada ni disputa previa. | Devolución del precio; gastos de herramientas aparte. |
| T5 Aceptar | Comprador firma dentro del plazo, sin disputa. | Pago íntegro al proveedor pactado. |
| T6 Silencio | Una parte reclama desde 48 h de entrega, sin disputa. | Pago íntegro; requiere una transacción. |
| T7 Disputar | Comprador durante ejecución o dentro de 48 h de entrega. | Disputa, evidencia privada y detención de nuevo despacho. |
| T8 Arbitrar | Árbitro pactado sin conflicto, antes de 7 días desde disputa. | Pago o devolución total motivados, a destinatario fijo. |
| T9 Renunciar | Proveedor firma antes del cierre, también desde entregada/disputada. | Devolución íntegra al comprador. |
| T10 Sin resolución | Una parte reclama desde 7 días sin decisión confirmada. | Devolución según términos aceptados. |

No hay pago o devolución parcial en el mínimo. La atestación verifica una entrega accesible, no garantiza que sea correcta. El árbitro no cambia importe/destinatarios ni se asigna fondos. Solicitud, firma, envío, incertidumbre y confirmación se distinguen; blockchain no ejecuta automáticamente un cron.

Los vencimientos financieros se presentan como fechas absolutas en hora local con zona, derivados del tiempo de ledger; reiniciar no los amplía. Ejecución: máximo 10 min. También se representa acceso al contrato/reclamación si la API no está disponible, con costo de transacción visible.

Los parámetros propuestos siguen pendientes de validación. RS01 propone sesión de 30 min de inactividad/8 h absolutas, recuperación de 15 min y desafío wallet de 5 min; esos valores sustituyen los del diseño anterior para esta referencia, sin afirmar aplicación real de los límites.

## Alcance técnico previsto por etapa e interfaz

La ERS v0.3 conserva los doce CU, los cuatro roles, los plazos y las cuatro categorías económicas. PostgreSQL, almacenamiento privado de objetos y coordinación de API/workers pertenecen al conjunto inicial propuesto. La entrega actual contiene requerimientos y diseño Figma; esos servicios no están implementados.

Antes de habilitar un perfil en una futura implementación se debe elegir una sola API real, Anthropic u OpenAI, y registrar proveedor, modelo, versión, tarifa, límites y evaluación. Dos roles de revisión no exigen dos proveedores. Un simulador no acredita inferencia real ni aceptación funcional.

Docker Compose organiza el entorno inicial de desarrollo y ensayo. AWS, MongoDB, base de grafos, Kubernetes y un segundo proveedor LLM son opciones futuras; no bloquean el mínimo por estar ausentes. La sección 1.6 de la ERS especifica su etapa y aplicabilidad.

Redis queda fuera del prototipo base. RS43 y PR32 son exigibles solo al incorporarlo; la ausencia de caché se registra como no aplicabilidad justificada, nunca como prueba aprobada. Si se incorpora, las métricas de caché y el fallback limitado pasan a aplicar, y toda contratación sigue revalidándose en PostgreSQL. Redis no decide saldo o autorización.

La preparación y operación deben mostrar capacidad global reservada antes del depósito; los cupos no se multiplican por instancia. La ausencia de PostgreSQL, objetos requeridos o inferencia real impide la acción afectada. Una entrega ausente, dañada o inaccesible no se presenta como atestada.

La recuperación propone RPO ≤5 min y RTO ≤4 h para base y objetos vinculados. Restaurar no habilita nuevos gastos/inferencia hasta conciliar el intervalo perdido y las operaciones externas; los plazos contractuales siguen vigentes. El relevo de workers no reinicia presupuesto o tiempo ni repite una compra incierta.

PR01–PR31 y PR33 siguen «No ejecutada» en la ERS. PR32 queda «No aplicable al prototipo base sin Redis», con justificación; al habilitar la extensión debe ejecutarse antes de aceptarla. En PR21, PR22, PR23 y PR27 solo se omiten los pasos exclusivos de Redis cuando está ausente; el resto permanece exigible. La falta de una integración inicial no se convierte en no aplicabilidad.

## Lenguaje visual e interacción

Se conserva la paleta existente: navy #1E3A5F/#132A45 para estructura y acciones, verde #166534 para éxito/pago, amarillo #854D0E sobre #FFFBEB para devolución/atención y rojo #B91C1C para errores/rechazos. Cada estado añade etiqueta textual y, cuando corresponde, icono; el color no distingue por sí solo financiación, pago o entrega.

Inter e IBM Plex Mono, variables semánticas, componentes reutilizables, auto-layout y controles de al menos 44 px mantienen coherencia. Los esqueletos preservan jerarquía y espacio sin simular importes/resultados reales. Sus títulos son neutrales, como «Revisión de entrega», para no afirmar que ya existe un resultado.

El prototipo usa datos y formularios predefinidos; no admite escritura libre, archivos reales o servicios conectados. Los cambios de rol, estado o variables de Figma no constituyen autorización, persistencia de aplicación, sesión, correo, análisis, firma, depósito, disputa o pago reales.

## Evidencia y límites de cierre

El [manifiesto de entrega](C:/Users/jmarr/.codex/visualizations/2026/10/09/01a122c1-94e9-7c72-9acd-bf69f61fe85f/figma-cu12-delivery.json) registra 180 marcos por dispositivo y 24 esqueletos, con identificadores por CU y formatos. La fuente Word v0.3 quedó confirmada con lectura completa de bytes y una comprobación posterior estable: SHA-256 `c2c7d4b25f41aa50d167182b7497cd4e433df74147d5b7486cc1db16dedd1c4b`. El hash v0.2 permanece únicamente en el registro histórico. Las 13 entradas de flujo por formato fueron informadas por el agente principal.

La auditoría estructural del agente principal volvió a pasar en las cuatro páginas después de actualizar las etiquetas a v0.3. El grafo de navegación permite alcanzar 180/180 estados desde el portal en cada formato. Se detectaron cero textos fuera del padre, hijos fuera de la raíz, destinos inexistentes, acciones NAVIGATE hacia modales, colisiones entre marcos y placeholders TODO/TBD. El inventario conserva exactamente las mismas cifras tras estos cambios.

| Área | Marcos | Nodos | Instancias | Navegación | Entradas de flujo |
| --- | --- | --- | --- | --- | --- |
| Escritorio | 180 | 7.088 | 1.609 | 1.504 reacciones | 13 |
| Móvil | 180 | 5.885 | 1.279 | 1.178 reacciones | 13 |
| Esqueletos | 24 | 936 | 117 | Sin reacciones | Sin entradas |
| Guía de cobertura | 1 | 215 | 63 | 50 enlaces | Sin entradas |

Estas cifras son un inventario de estructura Figma. Accesibilidad desde el portal significa conexión de destinos en el grafo; no implica que se haya probado manualmente cada interacción en el reproductor.

La revisión visual independiente inicial examinó contratación y arbitraje de escritorio, borrador de oferta móvil, precio pagado, precio devuelto y aceptación móvil. Sus observaciones y las muestras del cierre v0.2 se conservan en el registro histórico. En v0.3 se revisaron las capturas actuales de operaciones, restauración, privacidad y matriz: mantienen un proveedor de inferencia, Redis fuera de la base y PR32 no aplicable sin la extensión; no se encontraron contradicciones críticas o recortes en estas muestras.

La ambigüedad del borrador quedó corregida a «Verificación requerida antes de enviar». El agente principal confirmó también contratación con «Wallet compradora por vincular» antes del desafío, precio «a depositar» y gasto confirmado cero. Los estados de vinculación, depósito e inicio se mantienen separados.

Capturas verificables actuales: [operaciones móvil](C:/Users/jmarr/.codex/visualizations/2026/10/09/01a122c1-94e9-7c72-9acd-bf69f61fe85f/market-final-phone_operations.png), [restauración móvil](C:/Users/jmarr/.codex/visualizations/2026/10/09/01a122c1-94e9-7c72-9acd-bf69f61fe85f/market-final-phone_restoreBlocked.png), [privacidad móvil](C:/Users/jmarr/.codex/visualizations/2026/10/09/01a122c1-94e9-7c72-9acd-bf69f61fe85f/market-final-phone_privacy.png) y [matriz de cobertura](C:/Users/jmarr/.codex/visualizations/2026/10/09/01a122c1-94e9-7c72-9acd-bf69f61fe85f/market-final-coverage.png).

La auditoría previa fue anterior a estas páginas. Sus cifras, defectos y resultados describen aquella versión y no se usan para aprobar la ampliación. Su archivo no fue sobrescrito.

No se realizaron pruebas manuales clic a clic en el reproductor. El registro de aplicabilidad de PR32 sigue la configuración de Redis, sin convertir «no aplicable» en «aprobada». Cobertura visual y navegación conectada no aceptan PR01–PR33 ni demuestran backend, escrow, reservas, idempotencia, confidencialidad, accesibilidad semántica o ejecución on-chain. Los formularios, firmas, recibos, correos y resultados siguen siendo representaciones de ejemplo; la futura implementación requiere sus propias pruebas.

## Documentos relacionados

[Índice documental](README.md), [registro de revisión](review-record.md) y [ERS de trabajo v0.3](<../../Documentos/Ingenieria de Requerimientos/Exportación/AgentNexo_Especificacion_de_Requerimientos.docx>). Los documentos técnicos anteriores conservan decisiones de la fase previa; cualquier discrepancia con esta ampliación debe resolverse mediante una versión de requisitos validada, sin presentar esas especificaciones como servicios existentes.
