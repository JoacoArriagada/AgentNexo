# Contribuir a AgentNexo

El alcance vigente es el prototipo local descrito en README.md y reglamentario.md.
La constitución y specs/ contienen los requisitos, decisiones y tareas de cada módulo.
Los documentos de la fase Figma del 10 de octubre se conservan como antecedentes.

Mantén frontend/ y backend/ separados y los contratos públicos sin dependencias de servidor.
Organiza cada aplicación por funcionalidades. Añade capas y bibliotecas sólo para necesidades
concretas; no introduzcas servicios externos, login, credenciales ni pagos reales al demo.

Para cambios de comportamiento, ajusta spec/plan/tasks pertinentes y registra aclaraciones.
Usa pruebas de invariantes y recorridos, y ejecuta npm run build, npm test y los E2E afectados.
La verificación local no acredita integraciones de producción, pruebas de IA o blockchain.

Conserva ramas y cambios ajenos; no fuerces, borres ni publiques sin autorización aplicable.
Si hace falta una rama nueva usa codex/, salvo instrucción explícita. No crees ramas sólo
por editar documentación. Los comandos de pruebas usan bases aisladas de los datos demo.

No incorpores código privado de usuarios, bases locales o resultados de ejecución al Git.
La propuesta Word y la ERS son fuentes externas; modificar Markdown no las actualiza.
