# Revisión crítica, límites y mínimos del producto

Revisión del 10 de octubre de 2026. Decisiones de alcance y requisitos; el código anterior fue retirado. Este documento delimita el alcance; la [matriz de aceptación](requirements-and-acceptance.md) exige la evidencia de implementación. Un diseño, una simulación y una integración real no tienen el mismo grado de validación.

## Qué problema merece resolver

AgentNexo debe entregar una revisión estática comprensible de un módulo pequeño, con observaciones trazables, casos de prueba propuestos y gasto controlado. El beneficio que hay que validar es si reduce el tiempo de revisión humana sin introducir más falsos positivos. Tener agentes o efectuar una compra no demuestra ese beneficio.

El proyecto combina dos hipótesis distintas: **utilidad de la revisión** y **control de compras de herramientas**. Deben probarse por separado y después juntas. El diseño Figma representa interacción y estados; no demuestra calidad de modelos, aislamiento del servidor ni liquidaciones.

## Críticas y cambios adoptados

| Hallazgo | Por qué importa | Decisión aplicada |
| --- | --- | --- |
| Dos roles se presentaban como justificación suficiente de un sistema de agentes. | Dos prompts pueden duplicar costo, contexto y errores sin mejorar el informe. | Describirlo como un flujo acotado de dos roles bajo coordinador determinista. Compararlo con una sola llamada estructurada antes de afirmar valor multiagente. |
| La demostración A → B podía parecer el recorrido obligatorio de cualquier revisión. | Un sistema que compra siempre no demuestra selección útil de herramientas. | A/B son capacidades opcionales: requieren necesidad, entrada admitida y política. La secuencia forzada queda reservada a escenarios financieros reproducibles. |
| A/B solo soportan un fixture público, mientras la entrada admite archivos propios. | Comprar un catálogo de ejemplo para un archivo distinto daría evidencia falsa y expondría datos sin beneficio. | No despachar A/B para entradas no admitidas. El análisis real futuro de archivos propios depende del modelo; el diseño no realiza análisis ni atribuye resultados del fixture a archivos propios. |
| Se confundía completar tareas con pagar ambas APIs. | Un informe útil puede no necesitar ninguna compra; un pago confirmado puede no aportar una entrega. | Evaluar calidad del informe, estado de ejecución y estado financiero por separado. La correlación del escenario sintético no será una regla del backend. |
| Una cuenta contractual y la conexión de wallet ampliaban el camino crítico. | Compatibilidad de firma, custodia, SDK y facilitator todavía no está probada. | El mínimo de Testnet admite G-account dedicada, control en aplicación y límites explícitos. C-account y vínculo Freighter quedan condicionados a sus pruebas; no son requisitos de la revisión útil. |
| El stack y los módulos podían leerse como componentes ya operativos. | Una estructura bien nombrada no prueba un servicio. | Publicar estado por etapa. Toda construcción está retirada o pendiente; P0 contiene requisitos y Figma, sin comandos o pruebas vigentes. |
| Se priorizaba “última versión” sin una regla de compatibilidad. | La publicación más reciente puede romper el conjunto o ser una rama no LTS. | Mantener versiones exactas probadas, LTS y actualización deliberada. El SDK requerido por x402 prevalece sobre adoptar un major incompatible. |

Los agentes conservan autonomía limitada para proponer observaciones y solicitar capacidades permitidas. No eligen identidades, límites, monedas, URLs, firmantes o permisos. El coordinador no necesita ser otro modelo. No se añaden conversación permanente, memoria vectorial, planificador abierto, LangGraph, MCP de propósito general ni subagentes creados dinámicamente para este alcance.

Esta elección concuerda con la distinción entre flujos predefinidos y agentes que deciden su proceso; comenzar con la solución más simple permite medir si la complejidad aporta valor. Es una aplicación de ese criterio al proyecto, no evidencia de su rendimiento. [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents).

## Tres etapas con salidas verificables

| Etapa | Mínimo de salida | Estado actual | No permite afirmar |
| --- | --- | --- | --- |
| **P0 — Prototipo de diseño** | Acceso/recuperación, Inicio, revisiones, aceptación, ejecución, gastos, actividad, informes, notificaciones, confirmaciones, móvil y esqueletos. | Requisitos y diseño Figma; ver [registro](review-record.md). | Agentes reales, sesión, pagos o persistencia. |
| **P1 — Revisión útil** | API real y sesión; persistencia; entrada acotada; hallazgos y casos con salida validada; variante de ejecución elegida por evaluación; consumo de modelo reservado/conciliado; informe trazable; cancelación y recuperación. | Pendiente. | Valor superior a un solo modelo sin evaluación, ejecución de tests o seguridad exhaustiva del código. |
| **P2 — Demostración financiera integrada** | P1 más A/B distinguibles, compra real Testnet, rechazo por exceso antes de firma, idempotencia, carrera, incertidumbre y entrega perdida probadas. | Pendiente. | Custodia descentralizada, control contractual no probado, uso Mainnet o servicio público listo. |

La entrega funcional completa de AgentNexo exige **P1 + P2**. P0 no los sustituye. La cuenta C es una extensión condicional de P2, no una excusa para bloquear la revisión ni una garantía que pueda darse por hecha.

Figma es la representación editable y navegable de P0. La conexión fue restablecida; su construcción y revisión corresponde al agente principal. El [mapa](prototype-screen-map.md) define cobertura. Solo se atribuyen nodos y recorridos realmente creados y revisados.

## Límites mínimos del MVP

| Dimensión | Límite y conducta al excederlo |
| --- | --- |
| Entrada | 1–3 archivos `.js`/`.ts`, UTF-8, 1.000 líneas y 256 KiB combinados; objetivo 20–2.000 caracteres, 1–10 criterios de hasta 500 caracteres. Rechazo antes de inferir o comprar. |
| Acceso a datos | Solo entradas del trabajo y respuestas de capacidades permitidas. Sin clonar repositorios, acceso al disco general, URLs libres ni memoria entre clientes. |
| Ejecución | Lectura estática; no importar/ejecutar código, instalar dependencias del cliente, corregir su repositorio ni ejecutar tests. |
| Agentes | Variante base: una tarea `reviewer` que entrega hallazgos y casos. Variante experimental: `analyst` y `test-designer` fijos. Hasta 2 tareas simultáneas por trabajo y 2 llamadas externas activas globales. Máximo 4 llamadas por tarea, incluyendo como máximo 1 reintento total. La evaluación decide cuál se habilita; el modelo no crea roles. |
| Tiempo | 10 minutos absolutos desde el inicio aceptado; reanudar no reinicia el reloj. La conciliación puede continuar después. Timeouts: modelo 60 s, HTTP proveedor 20 s, lectura RPC 10 s. |
| Compras | Máximo una compra lógica por proveedor/rol, A/B únicamente, recurso público admitido y destino fijado por catálogo. Recuperar entrega o conciliar conserva identidad, sin nueva compra. |
| Dinero | Enteros exactos: USD escala 9; token Testnet escala 7 según activo configurado. Bolsas independientes. Disponible = máximo entre cero y autorizado − confirmado − reservado. Sobrecosto real se conserva y bloquea consumo nuevo. |
| Valores y contextos | Estándar privado: modelo 1 USD, USDC/XLM externos cero y no autorizados. DEMO-01 público fijo: modelo 1 USD, compras 0,06 USDC Testnet, red 0,10 XLM Testnet y autorización propia. Los ensayos futuros de rechazo pueden usar 0,05 con otra política. No son precios o facturas. |
| Autoridad | Aceptación de snapshot/digest por responsable; cambios de alcance invalidan aceptación. Ampliación requiere otra versión y aceptación. Un modelo nunca amplía su propio presupuesto. |
| Despliegue inicial | Una instancia backend, SQLite y archivos en disco local fuera de OneDrive; frontend estático separado. Sin usuarios públicos, varias réplicas escritoras o Mainnet. |
| Entrega | Hallazgo con archivo/líneas existentes, evidencia, severidad razonada, incertidumbre y recomendación. Casos propuestos rotulados sin ejecutar. Sin garantías de ausencia de defectos ni cobertura medida. |

Los límites de tokens, tarifas y facturación no tienen valores universales: se fijan con el proveedor y modelo elegidos antes de activar P1. Configuración incompleta devuelve `NOT_READY`, sin inferencia ni firma. Figma representa categorías y escenarios de presupuesto; no genera facturas ni impone límites.

## Mínimo de evaluación de los agentes

1. Preparar **20 módulos públicos o sintéticos** separados de los ejemplos usados para ajustar prompts: 10 con defectos revisados por una persona y 10 sin los defectos objetivo. Registrar el manifiesto, criterios y respuestas esperadas antes de comparar variantes.
2. Comparar bajo igual modelo, entradas y presupuesto: reglas estáticas locales cuando correspondan; una llamada estructurada que produzca hallazgos y casos; y el flujo de dos roles. Repetir cada variante de modelo tres veces por módulo. No usar los hallazgos fijos de P0 como resultado de esa evaluación.
3. Medir precisión/recuperación de defectos conocidos, falsos positivos en controles, validez de citas, utilidad de casos propuestos, costo real, latencia y tiempo de revisión humana. Puntuar a ciegas respecto de la variante; desacuerdos requieren revisión humana, no solo otro LLM.
4. Puertas iniciales propuestas de P1: 100% de salidas publicadas válidas en esquema y referencias; al menos 80% de precisión y 70% de recuperación en el conjunto anotado; 100% de casos de autoridad/entrada hostil sin acciones no permitidas. Son criterios del proyecto pendientes de prueba, no promesas de rendimiento.
5. Mantener dos roles como elección del producto solo si mejora al menos 10 puntos porcentuales la recuperación a precisión no inferior, dentro de los topes, o reduce al menos 20% el tiempo mediano de revisión humana sin empeorar precisión. Si no, simplificar el producto a un modelo y conservar dos roles únicamente como comparación experimental documentada. Ninguna métrica financiera compensa una pérdida de seguridad.

Veinte módulos constituyen una puerta pequeña de desarrollo, no un estudio que generalice a repositorios reales. Reportar distribución y fallos por caso, no solo un promedio. Las evaluaciones de agentes necesitan revisar tanto resultado como trayectoria y repetir intentos para captar variación; la recomendación de combinar validaciones automáticas con juicio humano inspira este plan. [Anthropic: Demystifying evals for AI agents, enero de 2026](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents).

La unidad independiente de comparación es el módulo, no cada repetición. Definir antes de ejecutar qué defecto cuenta como acierto: coincidencia adjudicada de causa y ubicación, deduplicada por defecto. Precisión = verdaderos positivos / hallazgos emitidos; recuperación = defectos conocidos detectados / defectos conocidos. Cero hallazgos no equivale a 100% de precisión: se informa «no calculable» y no supera la puerta. Publicar también controles con al menos un falso positivo, abstenciones, respuestas inválidas, fallos y costo de todos los intentos. No retirar del denominador las ejecuciones fallidas. Las repeticiones muestran variabilidad, no triplican la muestra independiente. Los umbrales anteriores son decisiones provisionales del proyecto y deben congelarse antes de evaluar; no provienen de un benchmark externo.

## Mínimo defendible y decisiones de simplificación

P1 comienza con una sola llamada estructurada que entrega las dos clases de resultado. No se exige implementar un segundo agente para declarar útil una revisión; se exige la comparación controlada antes de promover la variante de dos roles. El modo `single-pass` o `two-role`, sus permisos, cotas y versión de prompt quedan fijados en la política aceptada. Cambiar modo exige otra política, nunca una decisión del modelo durante el trabajo. P0 puede representar ambos modos con datos de ejemplo, sin afirmar que se ejecutaron tareas.

A/B son servicios del propio proyecto para ensayar HTTP 402, identidad de compra, reservas y conciliación. **No demuestran un mercado ni un motivo comercial para pagar por reglas locales o un catálogo estático.** Una regla determinista disponible localmente se calcula sin compra. P2 conserva esas APIs como banco de integración reproducible; una herramienta pagada de producto necesitaría utilidad adicional medida, procedencia, privacidad y precio justificados.

El informe mínimo contiene: alcance/digest, observaciones sustentadas y separadas de supuestos de negocio, casos propuestos sin ejecutar, estado `sustentado/no_sustentado/no_evaluado` por criterio solicitado con referencias, limitaciones y consumo por moneda. No basta que ambas tareas respondan JSON o que dos pagos confirmen. En P0 no se evalúan criterios; el ejemplo predefinido no los da por cumplidos.

Se exige ausencia de dependencias circulares entre módulos: `app` compone el flujo, `jobs` conserva el encargo, `execution` recibe su snapshot y `reports` recibe contribuciones y gastos explícitos. El renderizador no consulta `jobs` ni `execution` por su cuenta. Los siete módulos son límites lógicos del único backend; se crean al implementar su caso de uso, sin siete servicios, paquetes o capas obligatorias.

## Qué se retira del camino mínimo

- Marketplace, catálogo abierto, planes comerciales, selección de sectores y un agente supervisor LLM.
- Autogeneración de agentes, ejecución arbitraria, arreglo automático de código, infraestructura de RAG y vector DB.
- Microservicios, colas distribuidas, Kubernetes, Nx/Turbo y múltiples motores de datos.
- Firma por cada compra en el navegador, requerir wallet para leer un informe y presentar G-account como política on-chain.
- Usar clics del prototipo, capturas de Figma o tests del modelo financiero local como prueba de pagos y agentes operativos.

Se conserva el trabajo existente y se acota su interpretación. Las extensiones vuelven al plan solo con un requisito concreto y evidencia de beneficio.

## Corrección de alcance financiero en Figma

La navegación separa trabajos privados del caso público DEMO-01. No se propone una compra opcional en la revisión estándar ni se reutiliza un resultado del fixture para otro archivo. Esta separación reduce exposición, evita gastos sin propósito y permite evaluar utilidad del modelo independientemente de la integración financiera.

Los estados completados conservan identidad al cambiar Resumen/Gastos/Actividad/Informe. Las interacciones de avisos y borrador en Figma modifican variables de diseño; no prueban persistencia ni autoridad. La conexión Figma funciona y la revisión final del agente principal sigue en curso.
