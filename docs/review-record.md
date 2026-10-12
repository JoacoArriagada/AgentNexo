# Registro de revisión y cambio de alcance

**Fecha: 10 de octubre de 2026.** La instrucción más reciente reemplaza el alcance de implementación: solo requerimientos y frontend en el archivo Figma existente. Se retractan las afirmaciones anteriores de monorepositorio migrado y frontend ejecutable como estado vigente.

## Retirada de código

El agente principal retiró aplicaciones, paquetes, fuentes, manifiestos, dependencias, compilados, scripts, workflow y copias de prueba de la fase anterior. Los documentos describen una arquitectura futura. No hay servidor local, scripts npm ni suite ejecutable. No se hizo un nuevo commit, push o despliegue.

Los resultados históricos de build, modelo sintético y navegador no aceptan un producto actual ni se trasladan a la futura implementación. Se retiraron enlaces a aquellas fuentes y sus instrucciones de ejecución.

## Revisión documental

Se revisaron los Markdown para distinguir requisitos de implementación y retirar comandos/enlaces obsoletos. Se preservan límites de entrada, aceptación versionada, dinero exacto por activo, reserva ante incertidumbre, entrega independiente del pago y evaluación de uno frente a dos roles.

Se ampliaron UX y aceptación con inicio, notificaciones, recuperación autoservicio, errores por campo, carga, vacío, confirmaciones de eliminar/cancelar/archivar y esqueletos por pestaña. Rechazo de credenciales genérico; formato y campos obligatorios con errores asociados. Esto sustituye la recuperación exclusiva mediante operador.

Fuentes oficiales consultadas el 10-10-2026: [OWASP autenticación](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) y [OWASP recuperación](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html). Son requisitos, no controles implementados.

## Figma y evidencia

La conexión funciona. El agente principal completó el diseño y la revisión de [el archivo solicitado](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa); los antiguos avisos de bloqueo o reautenticación quedan retirados. Nodos y recorridos se acreditan mediante resultados reales de herramientas Figma.

El diseño permite revisar navegación, composición, copy y estados. No prueba correo, sesión, accesibilidad de código, análisis, persistencia, presupuesto autoritativo ni Stellar/x402.

Esta revisión no modifica la propuesta Word local. Si conserva referencias al código retirado, requiere sincronización separada; no se afirma haber revisado su contenido o paginación aquí.

## Alcance de la fase previa a la ERS v0.1

Se separó la revisión estándar de archivos privados de la integración pública. Estándar: modelo USD 1,00; USDC/XLM externos no autorizados con límites cero. DEMO-01: pricing.ts público y fijo, autorización Testnet explícita y límites separados de USD 1,00, USDC Testnet 0,06 y XLM Testnet 0,10. Se representan autorización, gastos, actividad y resultado propios del caso, sin convertir una revisión privada en una compra ni atribuirle resultados del fixture.

Se añadieron variantes de Resumen/Gastos/Actividad para revisiones completadas, de modo que la navegación conserve identidad y estado. El prototipo contiene Mostrar/Ocultar contraseña y variables nativas para lectura individual/todas de avisos, filtro Sin leer y eliminación del borrador de ejemplo. Son interacciones de Figma, sin sesión, almacenamiento ni persistencia backend.

Enlaces proporcionados por el agente principal: [prototipo escritorio](https://www.figma.com/proto/lgVHKGkPztbmJ85eTEuIoa/AgentNexo?node-id=16-109&starting-point-node-id=16%3A109), [prototipo móvil](https://www.figma.com/proto/lgVHKGkPztbmJ85eTEuIoa/AgentNexo?node-id=24-145&starting-point-node-id=24%3A145) y [archivo de diseño](https://www.figma.com/design/lgVHKGkPztbmJ85eTEuIoa). La comprobación final de destinos, comportamiento y composiciones corresponde al agente principal; la evidencia estructural/visual y el inventario informado se registran abajo, sin atribuir pruebas clic a clic.

## Evidencia de la entrega anterior a la ampliación ERS v0.1

El registro siguiente describe la entrega previa de 15 tipos de vistas; sus enlaces e inventario no son el cierre de la ampliación posterior. La [entrega Figma vigente](figma-delivery.md) documenta ahora los doce CU de la ERS v0.3. El agente principal informó seis páginas, 73 marcos de escritorio, 61 móviles/adaptados, 25 plantillas estáticas, 30 esqueletos, 66 componentes en 10 familias, 44 variables de diseño, siete de prototipo y 10 estilos tipográficos. Las muestras 320/768 px son adaptación visual; el recorrido móvil principal es de 375 px.

Auditoría estructural: ningún destino inexistente, texto fuera de contenedor con recorte o marco superpuesto. Revisión visual de Inicio, Acceso, borrado, informe móvil, formulario 320, gastos estándar, autorización Testnet y esqueleto Inicio; guía final e informe móvil tras ajustar altura también revisados visualmente. Los últimos ajustes se someten al control final del agente principal.

No se atribuye prueba clic a clic del reproductor ni pruebas backend. Páginas 03/05 son plantillas estáticas. Formularios predefinidos, sin escritura libre o servicios reales. El archivo es diseño y prototipo Figma, no una aplicación.

## Ampliación autorizada de los doce CU ERS v0.1

La instrucción posterior autoriza ampliar solo el diseño: visitante, comprador, proveedor y administrador; catálogo controlado, oferta/versionado/moderación, encargo y política, contratación/deposito, ejecución, seguimiento, gastos, entrega/disputa, ventas y operación. Se representa precio retenido separado de modelos/herramientas/comisiones y las diez transiciones de escrow. Los parámetros siguen propuestos para validación; esta revisión no modificó la ERS Word. La ampliación se inició con la referencia v0.1.

Páginas nuevas informadas por el agente principal: escritorio 63:8, móvil 63:9, esqueletos 63:10 y cobertura 63:11. Entradas: portal escritorio 63:12 y móvil 63:175. Los enlaces actuales y la checklist por CU están en [la entrega actualizada](figma-delivery.md). El diseño de la ampliación está terminado con 180 pantallas/variantes de escritorio, 180 móviles y 24 esqueletos, uno por CU y formato. Cada dispositivo tiene 13 entradas de flujo: portal y doce CU. La matriz visible es el nodo 72:2994.

La [auditoría anterior](<../../Documentos/Ingenieria de Requerimientos/Exportación/AgentNexo_Analisis_critico_Figma_vs_requerimientos.md>) se conserva sin sobrescribir: su veredicto describe el estado anterior al trabajo nuevo. La representación de contrato/firma/devolución no es aceptación de backend ni de las pruebas de la ERS, PR01–PR33 en la referencia vigente v0.3. No se creó código ni se realizaron transacciones.

## Actualización de la fuente a ERS v0.2

Durante el cierre, la ERS Word en disco cambió a versión de trabajo 0.2, con 44 requisitos de software y 33 pruebas planificadas. Se comprobó su SHA-256: `e0f975e1acc035e8e40aa6cb6157b7c9e386fd3f1f77ea4ea1bb924f84312113`. La actualización conserva los doce CU y los parámetros de roles, garantía y bolsas; añade PostgreSQL, objetos, Redis y workers. F05 deja de ser un identificador de fuente vigente; los parámetros siguen propuestos para validación.

Se revisan preparación, operación y recuperación con capacidad global reservada antes del depósito, RPO de cinco minutos, fallback limitado de Redis y disponibilidad de objetos. No se afirma que exista la infraestructura ni se aceptan PR01–PR33 mediante el diseño. La auditoría previa mantiene su referencia v0.1 y no se sobrescribe.

## Revisión de cierre de la ampliación ERS v0.2

El manifiesto de entrega contiene identificadores de los doce CU en ambos formatos y sus 24 esqueletos. Las variantes de gastos, encargo e informe conservan la identidad y el cierre del precio pagado o devuelto. La contratación previa al depósito se corrigió para mostrar precio «a depositar» y gasto confirmado cero. La captura final de contratación web confirma precio pendiente y modelo confirmado/reservado cero; sustituye como evidencia de ese estado a la muestra anterior.

La revisión independiente examinó capturas de contratación y arbitraje de escritorio; borrador de oferta, pago, devolución y aceptación de entrega móviles. No encontró una contradicción crítica en arbitraje o cierre entre precio, destinatario y gastos. La ambigüedad del borrador móvil quedó corregida a «Verificación requerida antes de enviar» y se confirmó en la captura final. También se revisaron las capturas finales de operaciones y restauración móvil v0.2: cupos globales, Redis auxiliar, RPO propuesto de cinco minutos y bloqueo de gasto/inferencia hasta conciliación.

La verificación estructural final del agente principal, posterior a los ajustes v0.2 y cabeceras móviles, pasó con estos inventarios: escritorio 180 marcos/7.088 nodos/1.609 instancias/1.504 reacciones; móvil 180 marcos/5.885 nodos/1.279 instancias/1.178 reacciones. Ambos tienen 13 entradas y 180/180 estados alcanzables desde el portal. Esqueletos: 24 marcos/936 nodos/117 instancias, sin reacciones o entradas; guía: un marco/215 nodos/63 instancias/50 enlaces.

En ambos formatos se detectaron cero textos fuera del padre, hijos fuera de la raíz, destinos inexistentes, NAVIGATE hacia modales y colisiones de marcos. Las coincidencias «todo/todos» correspondían a palabras españolas y no a placeholders TODO. El resultado describe estructura y conectividad, no pruebas manuales del reproductor. La evidencia de la fase previa permanece separada y no se sobrescribe.

Diseño terminado no significa producto ejecutable o aceptación de la ERS. No se realizaron pruebas manuales clic a clic del reproductor, pruebas backend ni transacciones. Los parámetros propuestos siguen pendientes de validación. La edición de cierre afecta solo Markdown; no modifica Word, código o el archivo de auditoría anterior.

## Actualización de la fuente a ERS v0.3

La fuente Word volvió a cambiar durante el cierre a versión de trabajo 0.3, manteniendo doce CU, 44 RS, 33 PR, dinero y plazos. La lectura completa de bytes y una comprobación posterior estable confirmaron SHA-256 `c2c7d4b25f41aa50d167182b7497cd4e433df74147d5b7486cc1db16dedd1c4b`; no se reutiliza el hash v0.2 como identidad de v0.3. La revisión y las capturas v0.2 anteriores permanecen como historial.

La sección 1.6 distingue conjunto inicial y opciones futuras. Antes de habilitar un perfil en una futura implementación se selecciona una sola API real, Anthropic u OpenAI, con proveedor/modelo/versión/tarifa/límites/evaluación registrados. Docker Compose corresponde al entorno inicial de desarrollo y ensayo; AWS, MongoDB, base de grafos, Kubernetes y segundo proveedor LLM son opcionales. Esta actualización documental no instala ni conecta dichos servicios.

Redis queda fuera del prototipo base: RS43/PR32 solo se exigen al incorporarlo. PR32 se registra «No aplicable al prototipo base sin Redis», con justificación, y no aprobada. PR01–PR31 y PR33 siguen «No ejecutada»; los pasos de Redis en pruebas compartidas se omiten solo cuando no aplica la extensión, preservando todas las demás obligaciones. Una integración inicial ausente permanece pendiente.

La guía y etiquetas Figma quedaron alineadas a v0.3 sin añadir pantallas. La auditoría posterior a estos cambios pasó en las cuatro páginas con exactamente los mismos inventarios de arriba: escritorio 180/7.088/1.609/1.504/13 y móvil 180/5.885/1.279/1.178/13, en orden marcos/nodos/instancias/reacciones/entradas. Ambos tienen 180/180 estados alcanzables desde su portal; esqueletos 24/936/117 sin reacciones/entradas y guía 1/215/63 con 50 enlaces, sin entradas.

Los resultados posteriores a v0.3 son cero textos fuera del padre, hijos fuera de la raíz, destinos inexistentes, NAVIGATE hacia modales, colisiones y placeholders TODO/TBD. Los títulos de los esqueletos son neutrales; contratación expresa «Wallet compradora por vincular» antes del desafío. La ambigüedad de cuenta receptora permanece corregida.

Se revisaron las capturas actuales de operaciones, restauración, privacidad y matriz: Redis fuera de la base, un proveedor de inferencia y PR32 no aplicable sin Redis, sin contradicciones críticas o recortes en estas muestras. El manifiesto vigente corresponde a v0.3 y al hash estable confirmado. La evidencia de v0.1/v0.2 sigue siendo histórica; no se sobrescribió la auditoría previa.

El control de estructura y revisión visual del diseño queda cerrado. No se atribuyen clics manuales del reproductor, aceptación de la ERS, pruebas backend ni transacciones.

