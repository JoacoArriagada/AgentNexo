import { useState } from "react";
import type { Job, Policy, Offer, List, Order } from "@agentnexo/api-contracts";
import { request } from "../../shared/api";
import { useResource } from "../../shared/hooks";
import { Card, ErrorNotice, Loading, Dialog, money } from "../../shared/ui";
export function PolicyPage({
  actorId,
  jobId,
  offerId,
  navigate,
}: {
  actorId: string;
  jobId: string;
  offerId?: string;
  navigate: (path: string) => void;
}) {
  const resource = useResource<Job>(actorId, `/jobs/${jobId}`);
  const offers = useResource<List<Offer>>(actorId, "/offers");
  const [selected, setSelected] = useState(offerId ?? "");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error>();
  const [confirm, setConfirm] = useState(false);
  const [serviceA, setServiceA] = useState("normal");
  const [serviceB, setServiceB] = useState("normal");
  const job = resource.data;
  const compatibleOffers =
    offers.data?.items.filter(
      (item) =>
        item.status === "approved" &&
        item.profile ===
          (job?.context === "public-demo" ? "two-role-demo" : "reviewer"),
    ) ?? [];
  const offer =
    compatibleOffers.find((item) => item.id === (selected || offerId)) ??
    compatibleOffers[0];
  async function authorize() {
    if (!job || !offer) return;
    setBusy(true);
    setError(undefined);
    try {
      if (job.context === "public-demo")
        await request(actorId, "/jobs/" + jobId + "/demo-scenario", "POST", {
          serviceA,
          serviceB,
        });
      let current = job;
      let policy: Policy;
      if (!current.policy || current.policy.accepted) {
        const value = await request<{ job: Job; policy: Policy }>(
          actorId,
          `/jobs/${jobId}/policy`,
          "PUT",
          {
            expectedVersion: current.version,
            mode: offer.profile,
            modelLimitMinor: "1000000000",
            toolLimitMinor:
              job.context === "public-demo" && offer.profile === "two-role-demo"
                ? "600000"
                : "0",
            feeLimitMinor: job.context === "public-demo" ? "1000000" : "0",
            maxOperationMinor: "300000",
            allowTools:
              job.context === "public-demo" &&
              offer.profile === "two-role-demo",
          },
        );
        current = value.job;
        policy = value.policy;
      } else policy = current.policy;
      const auth = await request<{ authorizationId: string; job: Job }>(
        actorId,
        `/jobs/${jobId}/authorizations`,
        "POST",
        {
          policyVersion: policy.version,
          policyDigest: policy.digest,
          accept: true,
        },
      );
      const order = await request<Order>(actorId, "/orders", "POST", {
        jobId,
        offerId: offer.id,
        offerVersion: offer.version,
        authorizationId: auth.authorizationId,
      });
      navigate(`/jobs/${jobId}?order=${order.id}`);
    } catch (e) {
      setError(e as Error);
      await resource.reload();
    } finally {
      setBusy(false);
    }
  }
  if (resource.error)
    return <ErrorNotice error={resource.error} retry={resource.reload} />;
  if (!job || !offers.data) return <Loading />;
  return (
    <div className="stack">
      <div>
        <h1>Autoriza límites explícitos</h1>
        <p>
          {job.title} ·{" "}
          {job.context === "public-demo"
            ? "DEMO-01 público"
            : "Entrada privada"}
        </p>
      </div>
      {error && <ErrorNotice error={error} />}
      <Card title="Oferta y entregable">
        <label>
          Oferta aprobada
          <select
            value={offer?.id ?? ""}
            onChange={(e) => {
              setSelected(e.target.value);
              setAccepted(false);
            }}
          >
            {compatibleOffers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · v{item.version}
                {item.profile === "two-role-demo"
                  ? " · Experimental · Fixture público"
                  : " · Revisor único"}
              </option>
            ))}
          </select>
        </label>
        <p>{offer?.description}</p>
        <p>
          Informe de lectura estática con evidencia, criterios, casos propuestos
          y limitaciones. Perfil: {offer?.profile}.
        </p>
      </Card>
      <Card title="Cuatro bolsas independientes">
        <div className="grid">
          <div>
            <h3>Precio a depositar</h3>
            <p className="mono">
              {offer
                ? money(
                    offer.price.minor,
                    offer.price.scale,
                    offer.price.currencyKey,
                  )
                : "—"}
            </p>
            <p>Garantía local independiente de gastos.</p>
          </div>
          <div>
            <h3>Modelos</h3>
            <p className="mono">USD 1,00 · Simulado</p>
          </div>
          <div>
            <h3>Herramientas</h3>
            <p className="mono">
              {job.context === "public-demo" &&
              offer?.profile === "two-role-demo"
                ? "USDC de prueba 0,0600000"
                : "USDC de prueba 0,0000000"}
            </p>
            <p>
              {job.context === "public-demo" &&
              offer?.profile === "two-role-demo"
                ? "Fixture público A/B"
                : "Compras externas no aplicables"}
            </p>
          </div>
          <div>
            <h3>Comisiones</h3>
            <p className="mono">
              {job.context === "public-demo"
                ? "XLM de prueba 0,1000000"
                : "XLM de prueba 0,0000000 · No autorizado"}
            </p>
          </div>
        </div>
        <div className="alert warning">
          No se suman USD, USDC y XLM. Editar la entrada invalida la
          autorización.
        </div>
      </Card>
      {job.context === "public-demo" && (
        <Card title="Escenario de herramientas locales">
          <p>
            Elige un escenario antes de contratar. Sólo afecta al fixture
            público fijo.
          </p>
          {[
            ["A", serviceA, setServiceA],
            ["B", serviceB, setServiceB],
          ].map(([name, value, setter]) => (
            <label key={name as string}>
              Servicio {name as string}
              <select
                value={value as string}
                onChange={(e) =>
                  (setter as (value: string) => void)(e.target.value)
                }
              >
                <option value="normal">Entrega normal</option>
                <option value="uncertain">Resultado financiero incierto</option>
                <option value="delivery_failed">Pago sin entrega</option>
                <option value="price_exceeded">Precio supera el límite</option>
              </select>
            </label>
          ))}
        </Card>
      )}
      <Card title="Condiciones y plazos">
        <p>
          Inicio en 30 minutos, entrega en 15 minutos, aceptación en 48 horas y
          resolución de disputa en 7 días. La financiación local no inicia la
          revisión automáticamente.
        </p>
        <label className="check">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          He revisado y acepto el alcance y sus límites
        </label>
        <div className="actions">
          <button
            disabled={!accepted || busy || !offer}
            onClick={() => setConfirm(true)}
          >
            Autorizar y crear contratación
          </button>
          <button
            className="secondary"
            onClick={() =>
              navigate(`/jobs/${jobId}/edit?offer=${offer?.id ?? ""}`)
            }
          >
            Editar entrada
          </button>
        </div>
      </Card>
      {confirm && (
        <Dialog
          title="¿Confirmar la contratación local?"
          onClose={() => setConfirm(false)}
        >
          {error && <ErrorNotice error={error} />}
          <p>
            Se guardará una copia de la oferta y de la política. El precio
            seguirá sin financiar hasta que confirmes el depósito simulado.
          </p>
          <button disabled={busy} onClick={() => void authorize()}>
            {busy ? "Confirmando…" : "Crear contratación simulada"}
          </button>
        </Dialog>
      )}
    </div>
  );
}
