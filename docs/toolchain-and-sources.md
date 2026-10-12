# Herramientas y fuentes verificadas

Consulta histórica: 9 de octubre de 2026; estado revisado el 10-10-2026. Se conserva el registro de versiones/fuentes consultadas entonces, sin presentarlo como una nueva consulta completa. Código, manifiestos, lockfile y dependencias fueron retirados. «Última observada» indica metadata de esa fecha, no la versión vigente ni recomendación de instalar. Antes de una implementación autorizada se deberán verificar publicaciones, compatibilidad y avisos de seguridad. Publicación e integración son evidencias distintas.

## Runtime y aplicaciones

| Componente | Versión observada | Selección para implementar | Motivo y alternativa |
| --- | --- | --- | --- |
| Node.js | 26.11.1 Current; 24.21.0 LTS | 24.21.0 LTS | Runtime soportado y común a herramientas. No adoptar Current solo por ser más nuevo. |
| npm | 12.2.0 | npm workspaces; objetivo 12.2.0 | Sin otro gestor para cuatro unidades; pnpm descartado inicialmente por costo de cambio, Nx/Turbo sin necesidad de caché remota. |
| TypeScript | 7.0.2 | Candidato futuro; verificar compatibilidad | Contratos y tipos estrictos. Verificar herramientas con TS 7; no usar su API de compilador para analizar código del cliente sin comprobar compatibilidad. |
| React / react-dom | 19.3.0 / 19.3.0 | Ambos 19.3.0 | Composición de formulario, autorización y progreso asíncrono; vanilla ahorra dependencias pero exige más coordinación manual de esos estados. |
| Vite | 8.3.4 | 8.3.4 | Aplicación privada estática independiente. Next.js descartado: SSR y servidor adicional no resuelven un requisito del MVP. |
| @vitejs/plugin-react | 6.1.2 | 6.1.2, verificar peers | Declara Vite ^8; verificar peers opcionales y no incorporar React Compiler sin necesidad. |
| Express | 5.3.0 | 5.3.0 | API pequeña y adaptador x402 oficial. Fastify/Nest añaden cambio de adaptador o convenciones sin beneficio suficiente inicial. |
| Zod | 4.6.5 | Candidato para DTO | Una validación portable frontend/backend; añadir al crear esquemas, no como paquete sin consumidores. |
| better-sqlite3 | 13.0.3 | Driver candidato sujeto a prueba | API transaccional pequeña; verificar binarios Node 24 Windows/Linux y `sqlite_version()`. Alternativa `node:sqlite`, evaluando estabilidad/API del runtime. |
| tsx | 4.23.15 | Referencia histórica, sin dependencia instalada | No ejecuta código del cliente; carga fuentes confiables del proyecto. |
| Vitest | 5.0.3 | Pruebas frontend/contratos futuros | Compatible declarado con Vite 8/Node 24; backend puede usar `node:test` sin otro runner. |
| @playwright/test | 1.64.0 | Referencia histórica para futura verificación | Las pruebas del prototipo retirado no están disponibles ni aceptan futuras integraciones. |

Fuentes: [Node LTS](https://nodejs.org/en/blog/release/v24.21.0), [política Node](https://nodejs.org/en/about/previous-releases), [versiones React](https://react.dev/versions), [versiones Vite](https://vite.dev/releases), [soporte Express](https://expressjs.com/en/support/), [TypeScript](https://www.typescriptlang.org/). La metadata numérica se obtuvo de los endpoints `https://registry.npmjs.org/{paquete}/latest`: [npm](https://registry.npmjs.org/npm/latest), [TypeScript](https://registry.npmjs.org/typescript/latest), [Vite](https://registry.npmjs.org/vite/latest), [React](https://registry.npmjs.org/react/latest), [React DOM](https://registry.npmjs.org/react-dom/latest), [plugin React](https://registry.npmjs.org/@vitejs%2Fplugin-react/latest), [Express](https://registry.npmjs.org/express/latest), [Zod](https://registry.npmjs.org/zod/latest), [driver SQLite](https://registry.npmjs.org/better-sqlite3/latest), [tsx](https://registry.npmjs.org/tsx/latest), [Vitest](https://registry.npmjs.org/vitest/latest), [Playwright](https://registry.npmjs.org/@playwright%2Ftest/latest).

Compatibilidad declarada relevante: npm 12 requiere `^22.22.2 || ^24.15.0 || >=26.0.0`; Vite 8 y plugin React requieren `^20.19.0 || >=22.12.0`; Express 5 requiere Node>=18; better-sqlite3 requiere >=22; Vitest 5 admite Node 24. Esto permite proponer Node 24.21, pero no sustituye instalación/build/pruebas. El equipo disponía de Node 24.18/npm 11.16 para comprobar el repositorio; no se cambió esa instalación.

## Motores de datos

| Motor | Publicación estable observada | Decisión |
| --- | --- | --- |
| SQLite | 3.54.0, 09-10-2026 | Motor inicial recomendado para una instancia. La versión realmente embebida depende del driver y debe verificarse. |
| PostgreSQL | 18.6 en tabla de soporte | Alternativa al pasar a varios escritores/instancias o base administrada; PostgreSQL19 beta no es base de producción. |
| MongoDB, Redis, Neo4j | No incorporados | No hay necesidad documentada de documentos distribuidos, caché/colas externas o grafos. No se fijan ni instalan versiones de tecnologías descartadas. |

Fuentes: [releases SQLite](https://www.sqlite.org/changes.html), [WAL y correcciones](https://www.sqlite.org/wal.html), [versionado PostgreSQL](https://www.postgresql.org/support/versioning/). La [evaluación de persistencia](data-model.md) explica transacciones, concurrencia, retención y migración. Se exige una versión SQLite sin el problema de WAL documentado; no se infiere seguridad del número de versión del paquete Node.

## Stellar y x402

| Componente | Última observada | Candidato compatible / condición |
| --- | --- | --- |
| @x402/core, stellar, fetch, express | 2.28.0 | Alinear los cuatro en 2.28.0; `@x402/express` admite Express 4/5. |
| @stellar/stellar-sdk | 17.2.1 | x402/stellar2.28 depende de `^16.3.0`; candidato 16.3.1 para la integración, sin forzar override17. |
| @stellar/freighter-api | 6.0.1 | Solo frontend/configuración inicial; verificar firmas y red en spike. |
| soroban-sdk | 29.0.0 | Requiere Rust>=1.91.0; validar compilación y protocolo antes de fijar Cargo.lock. |
| Rust | 1.99.0 estable, 01-10-2026 | Candidato para compilar el spike; superar el mínimo del SDK no prueba compatibilidad Wasm/CLI/protocolo. |
| Stellar CLI | 28.1.0 | Última observada; compatibilidad con protocolo Testnet29 pendiente de prueba. |
| RPC Testnet | 29.0.0 / protocolo29 | Observado mediante `getVersionInfo`, no es una dependencia instalada ni una garantía permanente. |

El adaptador x402 exige Node>=22; SDK 17 requiere >=22.12. El peer `@x402/paywall` de Express es opcional y no obliga a añadir una pantalla de pago por compra. No compartir instancias de clases entre SDK 16/17 ni reemplazar versiones transitivas sin pruebas. [Pagos](payments-and-budget.md) registra fuentes, metadata, soporte del facilitator, el firmante candidato y la prueba integrada pendiente.

Rust se contrastó con el [anuncio oficial de 1.99.0](https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/). No se instaló toolchain Rust ni se generó Cargo.lock sin contrato que compilar.

No se elige automáticamente LangGraph ni OpenRouter. La coordinación del MVP tiene dos tareas y persistencia local; un coordinador determinista basta. El proveedor/modelo requiere evaluación de calidad, límites, privacidad y costo máximo conservador. Consultar la [decisión sobre agentes](backend-and-agents.md) antes de añadir SDKs o precios.

## Política de actualización

Fijar versiones directas exactas y un lock revisado en el cambio que añada cada dependencia; no ejecutar `latest` sin revisión en CI. Actualizar por grupo compatible (React/DOM, Vite/plugin, x402/SDK), verificar engines/peers, changelog y advisories oficiales, y ejecutar pruebas de ese grupo. El informe debe mostrar versión instalada, SQLite real, protocolo Testnet y fecha de capacidades del facilitator.

No hay script de comprobación ni workflow vigente. Consultar [checkout](https://github.com/actions/checkout/releases) y [setup-node](https://github.com/actions/setup-node/releases) si se autoriza CI; no se instala infraestructura ahora.
