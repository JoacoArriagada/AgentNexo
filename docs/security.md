# Seguridad y tratamiento de datos

**Estado:** controles especificados, pendientes de implementación y prueba. Fuentes oficiales consultadas el **09-10-2026**. La especificación y el diseño no constituyen una certificación de seguridad. Alcance: revisión estática JavaScript/TypeScript, variante fija de una tarea o dos roles, dos APIs demostrativas y fondos Stellar Testnet. El modo y permisos son parte de la política aceptada; el modelo no puede cambiarlos.

## Fronteras de confianza

La web propuesta presentará decisiones y resultados. El backend futuro autenticará, autorizará recursos, limitará operaciones y mantendrá SQLite/archivos privados. El modelo recibe solo datos necesarios y propone resultados o solicitudes tipadas; nunca decide permisos. Proveedores, condiciones x402, código recibido e informes del modelo son datos no confiables. Stellar demuestra hechos financieros, no la veracidad del análisis ni la entrega HTTP.

| Amenaza | Control del MVP | Evidencia prevista |
| --- | --- | --- |
| Acceso a trabajo ajeno | Identidad/tenant derivados de sesión y autorización en consultas, cambios, eventos y descargas. | Un segundo propietario sintético no lee ni modifica recursos del primero. |
| Instrucciones maliciosas en código/respuestas | Datos separados de instrucciones; herramientas cerradas y validación determinista. | Un comentario que solicita secretos o pagos externos no consigue acciones. |
| Ejecución del código recibido | Analizar texto/AST sin ejecutar módulos, scripts, tests o instalaciones. | Corpus malicioso no inicia procesos ni tráfico de red. |
| Gasto duplicado/carrera | Reserva atómica, idempotencia, firmante exclusivo del backend y conciliación. | PAY-04 a PAY-06 de [pagos](payments-and-budget.md) conservan saldo. |
| Robo de sesión o acción desde otro sitio | Cookie protegida, rotación, expiración, CSRF y mismo origen. | Petición con origen/token inválidos no cambia estado. |
| SSRF/exfiltración | Destinos administrados y egreso acotado; sin URLs arbitrarias del modelo. | Bloqueo de destinos internos, redirecciones y resolución DNS no permitida. |
| Contenido activo en informes | Texto escapado; HTML remoto y recursos externos deshabilitados. | Payload XSS permanece como texto. |
| Secretos/código en logs | Lista de campos permitidos y eliminación programada. | Canarios secretos ausentes en logs, trazas y errores. |

## Identidad, sesión y autorización

La demo privada usa **un responsable preconfigurado**, sin registro público ni administración de usuarios. Su correo se preconfigura y verifica fuera del repositorio; el verificador seguro permite restablecer credencial. Contraseña validada en backend, fuera de URLs, bundles y logs. La sesión usa un identificador opaco generado criptográficamente, revocable, con **30 minutos de inactividad y 12 horas máximas**. Se rota al iniciar sesión y se revoca al salir. En HTTPS, cookie `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, sin `Domain`; nunca se almacena en `localStorage`. [OWASP: sesiones](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

HTTP local solo se admite en loopback y modo desarrollo explícito, con cookie de desarrollo distinta. El arranque rechaza exposición pública con esa configuración. Antes de acceso público o múltiples clientes reales se exige autenticación mantenida, preferentemente OIDC, revocaciones y nueva revisión de aislamiento; no se construye un proveedor de identidad propio para la demo.

`principalId` y `tenantId` proceden de la sesión. El trabajo conserva su propietario y tenant; el backend no acepta identidad ni tenant autorreportados por frontend/modelo. Presupuestos, políticas, reservas, pagos, archivos y entregables se consultan dentro del trabajo autorizado. Las relaciones compuestas y los repositorios filtran tenant/trabajo. IDs impredecibles no sustituyen autorización. Listados, eventos/polling, descargas y reintentos cumplen la misma regla; recurso ajeno devuelve `404` sin revelar existencia. Esta frontera se prueba con dos identidades aunque la demo use una. [OWASP: autorización](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

Mutaciones POST/PUT/PATCH/DELETE exigen token CSRF ligado a sesión y comprobación de `Origin`; GET no autoriza, cancela ni compra. Login también verifica origen y limita intentos. Frontend/API se publican bajo el mismo origen aunque se desarrollen por separado; el proxy de desarrollo reenvía `/api`. Si una integración necesita CORS, usa orígenes exactos y nunca `*` con credenciales. CORS no es autorización ni reemplaza CSRF. [OWASP: CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

Conectar wallet no inicia sesión ni delega fondos. Identidad de aplicación, prueba de posesión de wallet, autorización del trabajo y política contractual son actos separados, según [pagos](payments-and-budget.md).

## Entradas y procesamiento estático

Máximo **tres archivos `.js`/`.ts`, 1.000 líneas combinadas y 256 KiB totales**, UTF-8. El servidor vuelve a medir bytes/líneas; no confía en nombre, MIME ni validación del navegador. Rechaza binarios, archivos comprimidos, rutas absolutas/recorrido, archivos ocultos de credenciales y codificación inválida. El almacenamiento usa IDs generados por servidor; el nombre recibido es una etiqueta. Estos límites son decisiones de alcance, no garantías de bibliotecas.

Se validan campos permitidos, tipos, tamaños, enum de herramientas, cadenas monetarias y transiciones; consultas SQL parametrizadas. Se limita cuerpo HTTP antes de parsear y complejidad/profundidad JSON. No se admiten URLs de repositorios ni descargas remotas. Los archivos quedan fuera de raíz pública y se entregan por recurso autorizado. Normalizar saltos de línea conserva la correspondencia con líneas originales. [OWASP: carga de archivos](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

El parser analiza texto con tiempo/memoria acotados, sin resolver imports ni cargar `tsconfig`, plugins o configuración del cliente. No usa `eval`, `Function`, importación del archivo recibido, shell, gestor de paquetes ni runner de tests. El límite o fallo de sintaxis produce resultado parcial explícito. Los casos de prueba se entregan como texto; no se ejecutan.

## Agentes e instrucciones externas

Analista y diseñador de pruebas tienen herramientas específicas, parámetros tipados, cupos y datos propios del trabajo. El backend liga cada solicitud a tarea/rol; el modelo no elige su identidad. Sugerir ampliaciones o proveedores nuevos no produce efectos. Credenciales e instrucciones internas no se interpolan en código, respuestas externas ni errores.

El contenido entra identificado por origen. Se instruye al modelo para tratarlo como datos y se validan salidas, sin afirmar que un prompt o filtro elimine la inyección. La barrera es la autorización del broker y la ausencia de shell, filesystem general y red libre. Argumentos fuera del esquema se rechazan y se registra el motivo sin repetir contenido sensible. [OWASP: inyección de instrucciones](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).

El informe usa campos validados y texto escapado. Markdown opcional sin HTML crudo, URLs `javascript:`, imágenes externas ni incrustaciones. Distingue hallazgos observados, inferencias y limitaciones. El proveedor/modelo no puede declarar pago confirmado: lo decide la conciliación financiera.

## Tráfico saliente y proveedores

A/B, facilitator, RPC y modelo se configuran por operador. Frontend/modelo seleccionan un ID, nunca un destino arbitrario. Se validan esquema HTTPS, host, puerto, método y ruta autorizados. Redirecciones deshabilitadas; cualquier excepción requiere validar cada salto antes de conectar o reenviar cabeceras. Destinatario y precio del HTTP 402 se contrastan con política aprobada.

Se validan IPv4/IPv6 resueltas y conexión efectiva para evitar cambios DNS, bloqueando loopback, privadas, link-local, multicast y metadatos cloud salvo excepción local concreta. La excepción de demo fija host, puerto y rutas; nunca acepta una URL del usuario. Egreso limitado en infraestructura complementa al cliente HTTP. Se acotan respuesta/descompresión, timeout y conexiones, y no se reenvían cookies ni credenciales entre hosts. [OWASP: SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

Timeouts iniciales coherentes con backend: modelos 60 s, A/B/facilitator 20 s, RPC 10 s. Expirar una solicitud no revoca una autorización financiera ni prueba que no hubo consumo.

## Secretos, firma y operación

Las claves de modelos/firma pertenecen al backend y se separan por ambiente. No llegan a `packages` compartidos con navegador, variables públicas de compilación, API o prompts. `.env.example` solo contiene nombres y valores ficticios; secretos reales fuera de Git. Cuenta G usa una clave exclusiva Testnet; no se solicita semilla de wallet personal.

Desarrollo privado puede usar archivo excluido del repositorio y protegido por permisos del sistema. Despliegue compartido necesita gestor de secretos/rotación y privilegios mínimos. El firmante expone acciones concretas sobre una reserva válida, no “firmar cualquier XDR”. Material firmado pendiente se cifra en persistencia y nunca se registra en logs. Ante filtración se detienen nuevas firmas, se revoca/rota autoridad y se concilia lo emitido. Rotación no equivale a cancelar pagos en curso. [OWASP: secretos](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

Un backend modular no ofrece aislamiento fuerte frente a compromiso del proceso. Modo G confía en proceso/clave; modo C limita autoridad solo tras verificar sus rutas de evasión. SQLite y archivos van en disco local con permisos mínimos, fuera de OneDrive, carpetas públicas y repositorio; nunca se opera la base en carpeta sincronizada/compartida.

## Cifrado, minimización y retención

TLS en tráfico remoto, sin desactivar verificación de certificados. Volumen de datos y backups requieren cifrado del sistema operativo o infraestructura y permisos restrictivos. **SQLite estándar no cifra el archivo por defecto**: configurar almacenamiento es requisito pendiente, no una garantía ya implementada.

El responsable conoce qué proveedor de IA recibe código y con qué finalidad. Se minimizan fragmentos; detección de secretos ayuda a rechazar envíos identificados, sin prometer detección completa. No se cargan repositorios enteros ni se comparte contenido entre clientes. Retención/entrenamiento del proveedor se verifican al seleccionarlo; no se promete retención cero sin evidencia.

Política de demo, alineada con datos; ejecución mediante tarea local idempotente:

| Dato | Conservación | Eliminación y límite |
| --- | --- | --- |
| Código y respuestas crudas de modelos/proveedores | 7 días tras cierre | Originales, temporales y cachés; petición anticipada admitida. |
| Informe descargable | 30 días tras cierre | Archivo y acceso; solo metadatos necesarios permanecen. |
| Políticas, consumos, recibos e idempotencia | 90 días tras cierre y resolución financiera | Metadatos mínimos sin código. Operación incierta retiene evidencia necesaria hasta resolver. |
| Logs redactados | 14 días | Rotación y eliminación verificables. |
| Backups cifrados | Ventana máxima de 7 días | Expiración; toda restauración reaplica solicitudes de borrado antes de servir usuarios. |

Son decisiones técnicas para demo, no una interpretación normativa. Producción requiere política aprobada por su responsable. El usuario conoce el plazo de expiración de backups y que Stellar no permite borrar lo publicado. No se publican código, prompts, nombres, emails ni IDs de trabajo reversibles en blockchain.

## Logs, cuotas y errores

Logs estructurados por lista permitida: fecha, correlación opaca, evento, estado anterior/nuevo, duración, código de error y referencias financieras mínimas. Excluyen cookies, cabeceras de pago/autorización, firmas reutilizables, claves, código, prompts y respuestas completas. Texto externo se sanea para evitar inyección de líneas. Registrar autorizaciones/rechazos no convierte logs locales en prueba inviolable contra administrador. [OWASP: logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

Cuotas por sesión/tenant, intentos de login, concurrencia global, tamaños, duración y presupuestos. Errores estables con ID de correlación, sin stack trace ni secretos. Proxy confiable explícito para no aceptar IP falsificada por `X-Forwarded-For`. CSP restrictiva y cabeceras de seguridad; revisión de dependencias/lockfile antes de habilitar aplicación. [Express: seguridad](https://expressjs.com/en/advanced/best-practice-security/).

## Alternativas y aceptación

Se descartan contraseñas públicas gestionadas artesanalmente, JWT en almacenamiento del navegador, herramientas de URL libre, ejecución del código cliente, wallet compartida con dinero real y seguridad basada solo en prompts. OIDC antes de apertura pública y un firmante separado se evalúan al aumentar exposición; no se añaden servicios sin necesidad en la demo privada.

| ID | Evidencia antes de habilitar el flujo |
| --- | --- |
| SEC-01 | Dos propietarios no cruzan trabajos, eventos, adjuntos, recibos ni descargas; rechazo registrado sin datos privados. |
| SEC-02 | Sesión vencida, CSRF inválido y origen ajeno bloquean autorización, ampliación y cancelación. |
| SEC-03 | Límites y rutas maliciosas se rechazan; código con efectos laterales nunca se ejecuta. |
| SEC-04 | Inyección en comentario, API y hallazgo no cambia permisos ni revela secretos. |
| SEC-05 | URL manipulada, redirección y DNS interno no generan conexión ni compra. |
| SEC-06 | Canarios ausentes de bundle, Git, prompts, logs/errores; rotación impide nuevas firmas y conserva conciliación. |
| SEC-07 | Borrado/restauración respeta retención; incertidumbre retiene solo evidencia financiera necesaria. |
| SEC-08 | PAY-01 a PAY-08 y límites de modelos se prueban sin fondos reales. |

Pendientes: sesión/CSRF, esquema de datos, cliente HTTP con egreso validado, parser acotado, almacenamiento cifrado, proveedor de IA, matriz x402/firmante y procedimientos de borrado/rotación. Estos controles se convierten en pruebas al implementar módulos; hoy no se marcan como aprobados.

## Recuperación y notificaciones

Errores locales precisos, rechazo de credenciales y recuperación genéricos. Token aleatorio de recuperación, hash almacenado, uso único y 30 min propuestos. Limitar intentos, verificar origen y cambiar/consumir atómicamente. Contraseña de 15–128 caracteres sin truncado; revocar sesiones y exigir nuevo acceso. [OWASP autenticación](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP recuperación](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), consulta 10-10-2026.

No registrar tokens ni enviarlos a analítica o terceros. Notificaciones y marcado pertenecen al principal autenticado; texto/enlaces sanitizados y sin secretos o archivos privados. Figma solo representa estados.
