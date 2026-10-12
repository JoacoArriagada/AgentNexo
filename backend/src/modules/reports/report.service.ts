import type { Finding, Job, Payment, Report } from "@agentnexo/api-contracts";
import { Store, id } from "../../shared/database/store.js";
import { ensure } from "../../shared/errors.js";
export class ReportService {
  constructor(private store: Store) {}
  get(jobId: string) {
    const report = this.store.get<Report>("report", jobId);
    ensure(
      report,
      409,
      "REPORT_NOT_READY",
      "El informe todavía no está disponible.",
    );
    return report;
  }
  generate(
    job: Job,
    findings: Finding[],
    operations: Payment[],
    taskFailed: boolean,
  ): Report {
    const usable = findings.filter((finding) => {
      const file = job.files.find((item) => item.id === finding.fileId);
      return (
        file &&
        finding.startLine > 0 &&
        finding.endLine <= file.content.split("\n").length
      );
    });
    const contributions = operations
      .filter((operation) => operation.kind === "tool")
      .map((operation) => ({
        providerId: operation.providerId,
        status:
          operation.deliveryState === "available"
            ? ("available" as const)
            : operation.financialState === "rejected"
              ? ("rejected" as const)
              : ("failed" as const),
      }));
    const partial =
      taskFailed ||
      contributions.some((contribution) => contribution.status !== "available");
    const previous = this.store.get<Report>("report", job.id);
    const report: Report = {
      jobId: job.id,
      version: (previous?.version ?? 0) + 1,
      status: partial ? "partial" : "complete",
      createdAt: this.store.now(),
      summary: `${usable.length} observaciones sustentadas en patrones del texto recibido. Análisis determinista local; no se ejecutó el código ni un modelo remoto.`,
      findings: usable,
      testCases: usable.map((finding) => ({
        id: id("test"),
        title: `Caso límite: ${finding.title}`,
        description: `Preparar entradas que ejerciten ${finding.fileName}:${finding.startLine}. ${finding.recommendation}`,
        expectedResult:
          "El comportamiento cumple el contrato definido y maneja el caso límite de forma explícita.",
        executed: false as const,
        findingIds: [finding.id],
      })),
      criteria: job.acceptanceCriteria.map((criterion) => {
        const normalized = criterion
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .toLowerCase()
          .replace(/[.!]+$/, "");
        const structural = [
          "hallazgos con archivo y lineas",
          "casos de prueba propuestos",
        ].includes(normalized);
        const negative = ["sin hallazgos", "no hay hallazgos"].includes(
          normalized,
        )
          ? usable
          : [
                "sin hallazgos de alta severidad",
                "no hay hallazgos de alta severidad",
              ].includes(normalized)
            ? usable.filter((finding) => finding.severity === "high")
            : [];
        const references = (negative.length ? negative : usable).map(
          (finding) =>
            `${finding.fileName}:${finding.startLine} · ${finding.title}`,
        );
        return {
          criterion,
          status: negative.length
            ? ("no_sustentado" as const)
            : structural && usable.length
              ? ("sustentado" as const)
              : ("no_evaluado" as const),
          evidence:
            negative.length || (structural && usable.length)
              ? references
              : [
                  "Las reglas locales no prueban automáticamente este criterio de negocio; la ausencia de patrones no demuestra ausencia de defectos.",
                ],
        };
      }),
      limitations: [
        "Inspección de patrones, sin ejecución ni análisis completo de tipos o flujo.",
        "Las observaciones no prueban explotabilidad ni cumplimiento de requisitos de negocio.",
        "Los casos propuestos no fueron ejecutados.",
        "Los costos y recibos son simulaciones locales.",
      ],
      contributions,
    };
    if (partial)
      report.limitations.push(
        "Informe parcial: faltan una o más contribuciones; se conserva únicamente evidencia recibida.",
      );
    for (const contribution of contributions.filter(
      (item) => item.status === "available",
    )) {
      if (contribution.providerId === "service-b")
        report.testCases.push({
          id: id("test"),
          title: "Catálogo B · límites de cálculo",
          description:
            "Probar cantidad cero/negativa, precio no finito y descuento superior al subtotal sobre el fixture público.",
          expectedResult:
            "El contrato de negocio define rechazo o resultado permitido para cada entrada.",
          executed: false,
          findingIds: usable.map((finding) => finding.id),
        });
    }
    this.store.save("report", { ...report, id: job.id });
    return report;
  }
  markdown(report: Report) {
    const lines = [
      `# Informe de revisión`,
      "",
      `Trabajo: ${report.jobId}`,
      `Versión: ${report.version} · ${report.status}`,
      `Fecha UTC: ${report.createdAt}`,
      "",
      report.summary,
      "",
      "## Criterios",
      ...report.criteria.flatMap((criterion) => [
        `- ${criterion.criterion}: ${criterion.status}`,
        ...criterion.evidence.map((evidence) => `  - ${evidence}`),
      ]),
      "",
      "## Hallazgos",
    ];
    for (const finding of report.findings)
      lines.push(
        "",
        `### ${finding.title}`,
        `${finding.fileName}:${finding.startLine} · ${finding.severity}`,
        finding.explanation,
        `Evidencia: ${finding.evidence}`,
        `Recomendación: ${finding.recommendation}`,
        `Incertidumbre: ${finding.uncertainty}`,
      );
    lines.push(
      "",
      "## Casos propuestos (no ejecutados)",
      ...report.testCases.map(
        (item) =>
          `- ${item.title}: ${item.description} Resultado esperado: ${item.expectedResult}`,
      ),
      "",
      "## Contribuciones",
      ...report.contributions.map(
        (item) => `- ${item.providerId}: ${item.status}`,
      ),
      "",
      "## Limitaciones",
      ...report.limitations.map((item) => `- ${item}`),
    );
    return lines.join("\n");
  }
}
