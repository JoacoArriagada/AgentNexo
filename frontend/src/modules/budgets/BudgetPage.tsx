import { useEffect, useState } from "react";
import { request } from "../../shared/api";
import type {
  BudgetView,
  List,
  Payment,
  Job,
  Policy,
  Order,
} from "@agentnexo/api-contracts";
import { useResource } from "../../shared/hooks";
import {
  Badge,
  Card,
  Dialog,
  ErrorNotice,
  Loading,
  label,
  money,
  date,
} from "../../shared/ui";
function decimal(minor: string, scale: number) {
  const raw = minor.padStart(scale + 1, "0");
  return raw.slice(0, -scale) + "." + raw.slice(-scale);
}
function toMinor(value: string, scale: number) {
  if (!new RegExp("^\\d+(\\.\\d{1," + scale + "})?$").test(value))
    throw new Error(
      "Usa un importe positivo con hasta " + scale + " decimales.",
    );
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole + fraction.padEnd(scale, "0")).toString();
}
export function BudgetPage({
  actorId,
  jobId,
}: {
  actorId: string;
  jobId: string;
}) {
  const budget = useResource<BudgetView>(actorId, `/jobs/${jobId}/budget`);
  const payments = useResource<List<Payment>>(
    actorId,
    `/jobs/${jobId}/payments`,
  );
  const jobResource = useResource<Job>(actorId, `/jobs/${jobId}`);
  const [selected, setSelected] = useState<Payment>();
  const [outcome, setOutcome] = useState("confirmed");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<Error>();
  const [busy, setBusy] = useState(false);
  const [amending, setAmending] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [limits, setLimits] = useState({
    modelLimitMinor: "1.000000000",
    toolLimitMinor: "0.0000000",
    feeLimitMinor: "0.0000000",
    maxOperationMinor: "0.0300000",
  });
  const job = jobResource.data;
  const orders = useResource<List<Order>>(actorId, "/orders");
  const order = orders.data?.items.find((item) => item.jobId === jobId);
  useEffect(() => {
    const policy = job?.pendingPolicy ?? job?.policy;
    if (policy)
      setLimits({
        modelLimitMinor: decimal(policy.modelLimitMinor, 9),
        toolLimitMinor: decimal(policy.toolLimitMinor, 7),
        feeLimitMinor: decimal(policy.feeLimitMinor, 7),
        maxOperationMinor: decimal(policy.maxOperationMinor, 7),
      });
  }, [job]);
  async function refresh() {
    await Promise.all([
      budget.reload(),
      payments.reload(),
      jobResource.reload(),
    ]);
  }
  async function reconcile() {
    setBusy(true);
    setError(undefined);
    try {
      await request(
        actorId,
        `/jobs/${jobId}/payments/${selected!.id}` +
          (selected!.financialState === "uncertain"
            ? "/reconcile"
            : "/recover-delivery"),
        "POST",
        selected!.financialState === "uncertain" ? { outcome, reason } : {},
      );
      setSelected(undefined);
      await refresh();
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  }
  async function amend() {
    if (!job) return;
    setBusy(true);
    setError(undefined);
    try {
      if (job.pendingPolicy) {
        await request(actorId, `/jobs/${jobId}/authorizations`, "POST", {
          policyVersion: job.pendingPolicy.version,
          policyDigest: job.pendingPolicy.digest,
          accept: true,
        });
        setAmending(false);
        setSaved(true);
      } else {
        await request<{ job: Job; policy: Policy; amendmentId: string }>(
          actorId,
          `/jobs/${jobId}/policy/amendments`,
          "POST",
          {
            expectedVersion: job.version,
            modelLimitMinor: toMinor(limits.modelLimitMinor, 9),
            toolLimitMinor: toMinor(limits.toolLimitMinor, 7),
            feeLimitMinor: toMinor(limits.feeLimitMinor, 7),
            maxOperationMinor: toMinor(limits.maxOperationMinor, 7),
          },
        );
        setAccepted(false);
      }
      await refresh();
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  }
  if (budget.error)
    return <ErrorNotice error={budget.error} retry={budget.reload} />;
  if (!budget.data) return <Loading />;
  return (
    <div className="stack">
      {error && <ErrorNotice error={error} />}
      {saved && (
        <div role="status" className="alert success">
          Ampliación aceptada. Se conservan entrada, precio, reservas y
          vencimientos.
        </div>
      )}
      <Card title="Gastos y precio retenido">
        <p>
          No se suman monedas ni se usa la garantía para pagar herramientas.
          Todos los importes son simulados.
        </p>
        <div className="grid">
          {budget.data.buckets.map((bucket) => (
            <Card
              key={bucket.category}
              title={
                {
                  models: "Modelos",
                  tools: "Herramientas",
                  fees: "Comisiones",
                  contract: "Precio de contratación",
                }[bucket.category]
              }
            >
              {(
                [
                  "authorized",
                  "reserved",
                  "confirmed",
                  "available",
                  "deficit",
                ] as const
              ).map((key) => (
                <div className="row" key={key}>
                  <span>
                    {
                      {
                        authorized: "Autorizado",
                        reserved: "Reservado",
                        confirmed: "Confirmado",
                        available: "Disponible",
                        deficit: "Déficit",
                      }[key]
                    }
                  </span>
                  <strong className="mono">
                    {money(bucket[key], bucket.scale, bucket.currencyKey)}
                  </strong>
                </div>
              ))}
            </Card>
          ))}
        </div>
        <div className="actions">
          <button className="secondary" onClick={() => void refresh()}>
            Actualizar consumo
          </button>
          {job?.policy &&
            job.orderId &&
            order &&
            !["paid", "refunded"].includes(order.escrowState) && (
              <button
                className="secondary"
                onClick={() => {
                  setAmending(true);
                  setAccepted(false);
                  setSaved(false);
                }}
              >
                Revisar ampliación de límites
              </button>
            )}
        </div>
      </Card>
      <Card title="Libro de movimientos">
        {payments.error ? (
          <ErrorNotice error={payments.error} retry={payments.reload} />
        ) : !payments.data ? (
          <Loading />
        ) : !payments.data.items.length ? (
          <p>Aún no hay movimientos.</p>
        ) : (
          payments.data.items.map((item) => (
            <div className="row" key={item.id}>
              <div className="stack">
                <strong>
                  {item.providerId} ·{" "}
                  {item.kind === "tool" ? "Herramienta" : "Modelo local"}
                </strong>
                <p className="mono">
                  {money(
                    item.amount.minor,
                    item.amount.scale,
                    item.amount.currencyKey,
                  )}
                </p>
                <p>{date(item.createdAt)}</p>
                <Badge>
                  {label(item.financialState)} · Entrega{" "}
                  {label(item.deliveryState)}
                </Badge>
                {item.reason && <p>{item.reason}</p>}
                {(item.financialState === "uncertain" ||
                  (item.financialState === "confirmed" &&
                    item.deliveryState === "failed")) && (
                  <button
                    className="secondary"
                    onClick={() => setSelected(item)}
                  >
                    {item.financialState === "uncertain"
                      ? "Conciliar operación"
                      : "Recuperar la misma entrega"}
                  </button>
                )}
                {item.receipt && <p>Recibo simulado: {item.receipt.id}</p>}
              </div>
            </div>
          ))
        )}
      </Card>
      {selected && (
        <Dialog
          title={
            selected.financialState === "uncertain"
              ? "Conciliar operación incierta"
              : "Recuperar entrega pagada"
          }
          onClose={() => setSelected(undefined)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void reconcile();
            }}
          >
            {error && <ErrorNotice error={error} />}
            <p>
              Se conserva la identidad de la operación. No se realiza otra
              compra.
            </p>
            {selected.financialState === "uncertain" && (
              <>
                <label>
                  Resultado comprobado
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                  >
                    <option value="confirmed">Consumo confirmado</option>
                    <option value="failed">Operación fallida</option>
                  </select>
                </label>
                <label>
                  Motivo y evidencia local
                  <textarea
                    required
                    minLength={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
              </>
            )}
            <button disabled={busy}>
              {busy ? "Procesando…" : "Confirmar recuperación"}
            </button>
          </form>
        </Dialog>
      )}
      {amending && job?.policy && (
        <Dialog
          title={
            job.pendingPolicy
              ? `Aceptar política sucesora · v${job.pendingPolicy.version}`
              : "Amplía tus límites"
          }
          onClose={() => setAmending(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void amend();
            }}
            className="stack"
          >
            {error && <ErrorNotice error={error} />}
            <p>
              La ampliación no cambia el precio retenido, el alcance, los
              destinatarios ni los vencimientos. La versión actual sigue vigente
              hasta aceptar la nueva.
            </p>
            {job.pendingPolicy ? (
              <>
                <div className="alert">
                  <p>
                    Modelos:{" "}
                    {money(job.pendingPolicy.modelLimitMinor, 9, "USD")}
                  </p>
                  <p>
                    Herramientas:{" "}
                    {money(job.pendingPolicy.toolLimitMinor, 7, "USDC_DEMO")}
                  </p>
                  <p>
                    Comisiones:{" "}
                    {money(job.pendingPolicy.feeLimitMinor, 7, "XLM_DEMO")}
                  </p>
                  <p>
                    Máximo por operación:{" "}
                    {money(job.pendingPolicy.maxOperationMinor, 7, "USDC_DEMO")}
                  </p>
                </div>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                  Autorizo los límites de esta nueva versión de política
                </label>
              </>
            ) : (
              <>
                {(
                  [
                    "modelLimitMinor",
                    "toolLimitMinor",
                    "feeLimitMinor",
                    "maxOperationMinor",
                  ] as const
                ).map((key) => (
                  <label key={key}>
                    {
                      {
                        modelLimitMinor: "Límite de modelos · USD",
                        toolLimitMinor:
                          "Límite de herramientas · USDC de prueba",
                        feeLimitMinor: "Límite de comisiones · XLM de prueba",
                        maxOperationMinor: "Máximo por compra · USDC de prueba",
                      }[key]
                    }
                    <input
                      required
                      inputMode="decimal"
                      value={limits[key]}
                      disabled={
                        job.context === "private-review" &&
                        ["toolLimitMinor", "feeLimitMinor"].includes(key)
                      }
                      onChange={(e) =>
                        setLimits({ ...limits, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
              </>
            )}
            <button
              disabled={busy || (Boolean(job.pendingPolicy) && !accepted)}
            >
              {busy
                ? "Guardando…"
                : job.pendingPolicy
                  ? "Aceptar ampliación"
                  : "Proponer nueva versión"}
            </button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
