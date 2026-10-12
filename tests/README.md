# Pruebas del prototipo local

`npm test` ejecuta las pruebas de backend/tests con SQLite real temporal y node:test.
Cubren entradas, versiones, permisos demo, idempotencia, reservas, supresión, garantías,
plazos y reinicio del despachador. Los relojes inyectados comprueban vencimientos sin esperas.

`npm run test:e2e` ejecuta tests/e2e con Microsoft Edge en Windows y Chromium en Linux.
Levanta backend en 3101 y Vite en 5174 con una base aislada bajo .local/e2e-*.
No usa ni elimina la base habitual .local/agentnexo.sqlite.

Antes de pruebas en checkout limpio ejecuta npm ci y npm run build.
Para Linux prepara el navegador con npx playwright install chromium.
Las capturas de verificación se guardan en .artifacts/screens y los errores en test-results;
ambos directorios están excluidos del Git. No incluyen datos privados reales.

Resultados y límites: [validación local](../docs/local-acceptance-report.md).
No equiparar estos tests con las pruebas de inferencia, blockchain, PostgreSQL, S3,
Redis o despliegue de la ERS original.
