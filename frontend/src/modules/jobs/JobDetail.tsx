import { useEffect, useState } from "react";
import type { Job, Order, List, JobEvent } from "@agentnexo/api-contracts";
import { request } from "../../shared/api";
import { useResource } from "../../shared/hooks";
import {
  Badge,
  Card,
  Dialog,
  ErrorNotice,
  Loading,
  date,
  label,
  money,
  lineCount,
} from "../../shared/ui";
import { BudgetPage } from "../budgets/BudgetPage";
import { ReportPage } from "../reports/ReportPage";
export function JobDetail({
  actorId,
  jobId,
  tab,
  navigate,
}: {
  actorId: string;
  jobId: string;
  tab: string;
  navigate: (path: string) => void;
}) {
  const resource = useResource<Job>(actorId, `/jobs/${jobId}`);
  const orders = useResource<List<Order>>(actorId, "/orders");
  const events = useResource<{ items: JobEvent[] }>(
    actorId,
    `/jobs/${jobId}/events`,
  );
  const [error, setError] = useState<Error>();
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const job = resource.data;
  const order = orders.data?.items.find((item) => item.jobId === jobId);
  useEffect(() => {
    if (job && ["queued", "running"].includes(job.state)) {
      const timer = setInterval(() => {
        void resource.reload();
        void orders.reload();
        void events.reload();
      }, 1500);
      return () => clearInterval(timer);
    }
  }, [job?.state, actorId, jobId]);
  async function mutate() {
    setBusy(true);
    setError(undefined);
    try {
      const body =
        action === "dispute"
          ? { reason, evidence }
          : action === "claim"
            ? { kind: reason }
            : action === "cancel"
              ? { reason }
              : action === "delete"
                ? { expectedVersion: job!.version }
                : {};
      await request(
        actorId,
        action === "delete"
          ? `/jobs/${jobId}`
          : action === "archive"
            ? `/jobs/${jobId}/archive`
            : action === "unarchive"
              ? `/jobs/${jobId}/unarchive`
              : action === "content"
                ? `/jobs/${jobId}/content`
                : `/orders/${order!.id}/${action}`,
        action === "delete" || action === "content" ? "DELETE" : "POST",
        body,
      );
      setAction("");
      if (action === "delete") {
        navigate("/jobs");
        return;
      }
      await Promise.all([resource.reload(), orders.reload(), events.reload()]);
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  }
  if (resource.error)
    return <ErrorNotice error={resource.error} retry={resource.reload} />;
  if (!job) return <Loading />;
  const terminal = ["completed", "partial", "cancelled", "failed"].includes(
    job.state,
  );
  return (
    <div className="stack">
      <div className="pagehead">
        <div>
          <h1>{job.title}</h1>
          <p>
            {job.id} · {date(job.createdAt)}
          </p>
        </div>
        <Badge>{label(job.state)}</Badge>
      </div>
      {error && <ErrorNotice error={error} />}
      <nav className="tabs" aria-label="Detalle del encargo">
        {[
          ["summary", "Resumen"],
          ["budget", "Gastos"],
          ["activity", "Actividad"],
          ["report", "Informe"],
        ].map(([key, text]) => (
          <a
            className={tab === key ? "active" : ""}
            key={key}
            href={`/jobs/${jobId}/${key}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/jobs/${jobId}/${key}`);
            }}
          >
            {text}
          </a>
        ))}
      </nav>
      {tab === "budget" ? (
        <BudgetPage actorId={actorId} jobId={jobId} />
      ) : tab === "report" ? (
        <ReportPage actorId={actorId} jobId={jobId} />
      ) : tab === "activity" ? (
        <Card title="Actividad del encargo">
          {events.error ? (
            <ErrorNotice error={events.error} retry={events.reload} />
          ) : !events.data ? (
            <Loading />
          ) : (
            events.data.items.map((event) => (
              <div className="row" key={event.sequence}>
                <div className="stack">
                  <strong>{event.message}</strong>
                  <p>{date(event.createdAt)}</p>
                  <span className="help">{event.type}</span>
                </div>
              </div>
            ))
          )}
          <button className="secondary" onClick={() => void events.reload()}>
            Actualizar actividad
          </button>
        </Card>
      ) : (
        <>
          <Card title="Estado y próxima decisión">
            <p>{job.objective}</p>
            <div className="grid">
              <div>
                <h3>Ejecución</h3>
                <Badge>{label(job.state)}</Badge>
              </div>
              <div>
                <h3>Entrega</h3>
                <Badge>
                  {order ? label(order.deliveryState) : "Pendiente"}
                </Badge>
              </div>
              <div>
                <h3>Garantía local</h3>
                <Badge>
                  {order ? label(order.escrowState) : "Sin contratación"}
                </Badge>
              </div>
              <div>
                <h3>Financiación</h3>
                <Badge>
                  {order ? label(order.financingState) : "Sin depósito"}
                </Badge>
              </div>
            </div>
            <div className="actions">
              {!order && (
                <>
                  <button onClick={() => navigate(`/jobs/${jobId}/policy`)}>
                    Revisar condiciones
                  </button>
                  <button
                    className="secondary"
                    onClick={() => navigate(`/jobs/${jobId}/edit`)}
                  >
                    Editar borrador
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setAction("delete")}
                  >
                    Eliminar borrador
                  </button>
                </>
              )}
              {order?.escrowState === "unfunded" && (
                <button onClick={() => setAction("fund")}>
                  Simular depósito
                </button>
              )}
              {order?.escrowState === "funded" && (
                <>
                  <button onClick={() => setAction("start")}>
                    Iniciar revisión
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setAction("cancel")}
                  >
                    Cancelar antes del inicio
                  </button>
                </>
              )}
              {order?.escrowState === "running" && (
                <button
                  className="secondary"
                  onClick={() => setAction("dispute")}
                >
                  Abrir disputa
                </button>
              )}
              {order?.escrowState === "delivered" && (
                <>
                  <button onClick={() => setAction("accept")}>
                    Aceptar entrega y liberar precio
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setAction("dispute")}
                  >
                    Disputar entrega
                  </button>
                </>
              )}
              {order &&
                !["paid", "refunded", "unfunded"].includes(
                  order.escrowState,
                ) && (
                  <button
                    className="secondary"
                    onClick={() => {
                      setAction("claim");
                      setReason("no_start");
                    }}
                  >
                    Reclamar por vencimiento
                  </button>
                )}
              {terminal && !job.contentDeleted && (
                <button
                  className="secondary"
                  onClick={() => setAction("content")}
                >
                  Retirar contenido
                </button>
              )}
              {terminal && (
                <button
                  className="secondary"
                  onClick={() =>
                    setAction(job.archived ? "unarchive" : "archive")
                  }
                >
                  {job.archived ? "Restaurar encargo" : "Archivar encargo"}
                </button>
              )}
            </div>
          </Card>
          {order && (
            <Card title="Términos de la contratación">
              <p>
                Oferta {order.offer.name} · v{order.offer.version} · Política v
                {order.policy.version}
              </p>
              <p>
                Precio:{" "}
                <strong className="mono">
                  {money(
                    order.price.minor,
                    order.price.scale,
                    order.price.currencyKey,
                  )}
                </strong>{" "}
                · Simulado
              </p>
              <p>
                Inicio: {date(order.startDeadline)}
                <br />
                Entrega: {date(order.deliveryDeadline)}
                <br />
                Aceptación: {date(order.acceptanceDeadline)}
                <br />
                Resolución: {date(order.disputeDeadline)}
              </p>
              {order.dispute && (
                <div className="alert warning">
                  <strong>Disputa: {order.dispute.reason}</strong>
                  <p>Evidencia compartida: {order.dispute.evidence}</p>
                  {order.dispute.response && (
                    <p>Respuesta del proveedor: {order.dispute.response}</p>
                  )}
                  {order.dispute.resolution && (
                    <p>Resolución: {order.dispute.resolution}</p>
                  )}
                </div>
              )}
              {order.closureReason && <p>Cierre: {order.closureReason}</p>}
            </Card>
          )}
          <Card title="Criterios y entrada">
            <ul className="list">
              {job.acceptanceCriteria.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
            {job.files.map((file, i) => (
              <details key={i}>
                <summary>
                  {file.name} · {lineCount(file.content)} líneas
                </summary>
                <pre className="code">{file.content}</pre>
              </details>
            ))}
            {job.contentDeleted && (
              <div className="alert warning">
                Contenido retirado por su responsable; el registro conserva
                trazabilidad.
              </div>
            )}
          </Card>
        </>
      )}
      {action && (
        <Dialog
          title={
            {
              fund: "Confirmar depósito simulado",
              start: "Iniciar revisión local",
              cancel: "¿Cancelar antes del inicio?",
              accept: "¿Aceptar y liberar el precio?",
              dispute: "Abrir disputa",
              delete: "¿Eliminar este borrador?",
              archive: "¿Archivar este encargo?",
              unarchive: "Restaurar encargo",
              content: "Retirar contenido",
              claim: "Reclamar por vencimiento",
            }[action] ?? "Confirmar acción"
          }
          onClose={() => setAction("")}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void mutate();
            }}
          >
            {error && <ErrorNotice error={error} />}
            <p>
              {action === "accept"
                ? "Se pagará el precio completo al proveedor en la simulación local."
                : action === "cancel"
                  ? "Se devolverá el precio simulado antes del inicio. Los gastos confirmados conservan trazabilidad."
                  : action === "dispute"
                    ? "Se detiene nuevo despacho y se comparte sólo la evidencia que indiques."
                    : action === "delete"
                      ? "Se eliminará el borrador y su entrada; esta acción sólo está permitida sin compromisos."
                      : "La acción cambia el estado persistente del prototipo local."}
            </p>
            {action === "claim" && (
              <label>
                Causal
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="no_start">Sin inicio · 30 minutos</option>
                  <option value="no_delivery">Sin entrega · 15 minutos</option>
                  <option value="silence">Silencio · 48 horas</option>
                  <option value="unresolved">Sin resolución · 7 días</option>
                </select>
              </label>
            )}
            {["dispute", "cancel"].includes(action) && (
              <label>
                Motivo
                <textarea
                  required={action === "dispute"}
                  minLength={action === "dispute" ? 3 : 0}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
            )}
            {action === "dispute" && (
              <label>
                Evidencia mínima a compartir
                <textarea
                  required
                  minLength={3}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                />
              </label>
            )}
            <button
              disabled={busy}
              className={action === "delete" ? "danger" : ""}
            >
              {busy ? "Confirmando…" : "Confirmar"}
            </button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
