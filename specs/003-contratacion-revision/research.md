# Research: Contratación y revisión

- Decision: inspección determinista de entrada sin eval/import. Rationale: resultados reales locales y reproducibles sin LLM; cita líneas y limita afirmaciones. Alternatives considered: fixture constante (evidencia falsa), API remota (claves excluidas).
- Decision: BEGIN IMMEDIATE para reservas/estado; moneda exacta bigint/INTEGER/strings JSON. Rationale: no sobregiro ni suma de unidades. Alternatives considered: floats y saldo RAM.
- Decision: snapshots de entrada/política/oferta y claves idempotentes. Rationale: reproducir compromiso y recuperar sin duplicar. Alternatives considered: resolver objetos mutables actuales.
- Decision: máximo10 plazas durables antes financiar, dispatcher local con checkpoints. Rationale: alcance una instancia; ERS RS39/44 adaptado sin workers remotos.
- Decision: A/B sólo DEMO-01 público; perfiles reales no evaluados se rotulan experimentales. Fuentes: docs/backend-local-research.md y docs/local-api-contract.md.
