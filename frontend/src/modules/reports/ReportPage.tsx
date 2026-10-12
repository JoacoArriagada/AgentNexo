import { useState } from "react";
import type { Report } from "@agentnexo/api-contracts";
import { download } from "../../shared/api";
import { useResource } from "../../shared/hooks";
import { Badge, Card, ErrorNotice, Loading } from "../../shared/ui";
export function ReportPage({
  actorId,
  jobId,
}: {
  actorId: string;
  jobId: string;
}) {
  const resource = useResource<Report>(actorId, `/jobs/${jobId}/report`);
  const [severity, setSeverity] = useState("");
  const [error, setError] = useState<Error>();
  if (resource.error)
    return <ErrorNotice error={resource.error} retry={resource.reload} />;
  if (!resource.data) return <Loading />;
  const report = resource.data;
  async function exportReport(format: "markdown" | "json") {
    try {
      await download(
        actorId,
        `/jobs/${jobId}/report/download?format=${format}`,
        `informe-${jobId}-v${report.version}.${format === "markdown" ? "md" : "json"}`,
      );
    } catch (e) {
      setError(e as Error);
    }
  }
  return (
    <div className="stack">
      {error && <ErrorNotice error={error} />}
      <Card title={`Informe de revisión · v${report.version}`}>
        <Badge>{report.status === "complete" ? "Completo" : "Parcial"}</Badge>
        <p>{report.summary}</p>
        <div className="actions">
          <button onClick={() => void exportReport("markdown")}>
            Exportar Markdown
          </button>
          <button
            className="secondary"
            onClick={() => void exportReport("json")}
          >
            Exportar JSON
          </button>
        </div>
      </Card>
      <Card title="Criterios de aceptación">
        {report.criteria.map((item, index) => (
          <div key={index} className="row">
            <div className="stack">
              <strong>{item.criterion}</strong>
              <Badge>
                {
                  {
                    sustentado: "Sustentado",
                    no_sustentado: "No sustentado",
                    no_evaluado: "No evaluado",
                  }[item.status]
                }
              </Badge>
              {item.evidence.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          </div>
        ))}
      </Card>
      <Card title="Hallazgos">
        <label>
          Filtrar severidad
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </label>
        {report.findings
          .filter((item) => !severity || item.severity === severity)
          .map((item) => (
            <details key={item.id} className="card">
              <summary>
                <strong>{item.title}</strong> · {item.fileName}:{item.startLine}{" "}
                ·{" "}
                {{ high: "Alta", medium: "Media", low: "Baja" }[item.severity]}
              </summary>
              <p>{item.explanation}</p>
              <pre className="code">{item.evidence}</pre>
              <p>{item.recommendation}</p>
              <p>Incertidumbre: {item.uncertainty}</p>
            </details>
          ))}
        {!report.findings.length && (
          <p>
            No se encontraron hallazgos en las reglas locales. Esto no garantiza
            ausencia de defectos.
          </p>
        )}
      </Card>
      <Card title="Casos de prueba propuestos · No ejecutados">
        {report.testCases.map((item) => (
          <div key={item.id} className="stack">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>Resultado esperado: {item.expectedResult}</p>
          </div>
        ))}
      </Card>
      <Card title="Limitaciones">
        <ul className="list">
          {report.limitations.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
