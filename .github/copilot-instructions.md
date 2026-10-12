# AgentNexo

Alcance vigente desde 2026-10-12: prototipo local implementado. Lee README.md,
reglamentario.md, .specify/memory/constitution.md y specs/ antes de cambiar código.
Las instrucciones históricas de sólo documentación fueron sustituidas por la petición
explícita del responsable. Su copia está en docs/history/.

Mantén frontend/ y backend/ independientes, módulos por funcionalidad y DTO públicos
en packages/api-contracts/. Evita capas vacías y servicios externos innecesarios.
No añadas login, credenciales, wallet, dominio, pagos reales, LLM remoto obligatorio ni
infraestructura distribuida al prototipo local. Los actores demo no autentican usuarios.

No ejecutes código recibido. Conserva evidencia de archivo/línea, límites de entrada,
aceptación versionada, snapshots, idempotencia durable y reservas exactas. No sumes
USD/USDC/XLM ni el precio retenido con consumos. No liberes incertidumbre por timeout.
Casos propuestos nunca son pruebas ejecutadas; desconocer un criterio no lo satisface.

Lee git status y preserva trabajo ajeno. No hagas reescrituras destructivas ni publiques
sin autorización. Ejecuta build y pruebas pertinentes; documenta resultados reales y
limitaciones. Docker Compose existe; su arranque no fue comprobado en este equipo sin Docker.
