import { useEffect, useState } from "react";
import {
  PUBLIC_DEMO_FILES,
  type Job,
  type Offer,
  type List,
  type InputFile,
} from "@agentnexo/api-contracts";
import { request } from "../../shared/api";
import { Card, Dialog, ErrorNotice, Loading, lineCount } from "../../shared/ui";
export function JobEditor({
  actorId,
  navigate,
  jobId,
  offerId,
}: {
  actorId: string;
  navigate: (path: string) => void;
  jobId?: string;
  offerId?: string;
}) {
  const [job, setJob] = useState<Job>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selected, setSelected] = useState(offerId ?? "");
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [criteria, setCriteria] = useState([""]);
  const [files, setFiles] = useState<InputFile[]>([]);
  const [context, setContext] = useState<Job["context"]>("private-review");
  const [error, setError] = useState<Error>();
  const [busy, setBusy] = useState(false);
  const [removeIndex, setRemoveIndex] = useState<number>();
  const [discard, setDiscard] = useState(false);
  useEffect(() => {
    request<List<Offer>>(actorId, "/offers")
      .then((value) => {
        setOffers(value.items.filter((item) => item.status === "approved"));
        if (
          !jobId &&
          offerId &&
          value.items.find((item) => item.id === offerId)?.profile ===
            "two-role-demo"
        )
          setContext("public-demo");
      })
      .catch(setError);
    if (jobId)
      request<Job>(actorId, `/jobs/${jobId}`)
        .then((value) => {
          setJob(value);
          setTitle(value.title);
          setObjective(value.objective);
          setCriteria(value.acceptanceCriteria);
          setFiles(value.files);
          setContext(value.context);
        })
        .catch(setError);
  }, [actorId, jobId]);
  const compatibleOffers = offers.filter(
    (offer) =>
      offer.profile ===
      (context === "private-review" ? "reviewer" : "two-role-demo"),
  );
  useEffect(() => {
    if (!compatibleOffers.some((offer) => offer.id === selected))
      setSelected(compatibleOffers[0]?.id ?? "");
  }, [offers, context]);
  async function upload(incoming: FileList | null) {
    if (!incoming) return;
    try {
      const result: InputFile[] = [];
      for (const file of Array.from(incoming)) {
        if (!/\.(js|ts)$/i.test(file.name))
          throw new Error(`${file.name}: sólo se admiten archivos .js o .ts.`);
        const content = new TextDecoder("utf-8", { fatal: true })
          .decode(await file.arrayBuffer())
          .replace(/\r\n?/g, "\n");
        result.push({ name: file.name, content });
      }
      const combined = [...files, ...result];
      if (combined.length > 3) throw new Error("El máximo es tres archivos.");
      const bytes = combined.reduce(
        (sum, file) => sum + new TextEncoder().encode(file.content).length,
        0,
      );
      const lines = combined.reduce(
        (sum, file) => sum + lineCount(file.content),
        0,
      );
      if (bytes > 262144 || lines > 1000)
        throw new Error("Máximo conjunto: 256 KiB y 1.000 líneas.");
      setFiles(combined);
      setError(undefined);
    } catch (e) {
      setError(e as Error);
    }
  }
  async function save() {
    setBusy(true);
    setError(undefined);
    try {
      if (!files.length)
        throw new Error("Selecciona al menos un archivo JS/TS.");
      if (!selected) throw new Error("Selecciona una oferta aprobada.");
      const payload = {
        title,
        objective,
        acceptanceCriteria: criteria,
        ...(job?.context === "public-demo" ? {} : { files }),
        ...(job ? { expectedVersion: job.version } : { context }),
      };
      const result = await request<Job>(
        actorId,
        job ? `/jobs/${job.id}` : "/jobs",
        job ? "PATCH" : "POST",
        payload,
      );
      navigate(`/jobs/${result.id}/policy?offer=${selected}`);
    } catch (e) {
      setError(e as Error);
    } finally {
      setBusy(false);
    }
  }
  function example() {
    setTitle("Revisión de cálculo de precios");
    setObjective(
      "Revisar la validación del precio y de la cantidad para identificar riesgos en el cálculo del total.",
    );
    setCriteria([
      "Validar que el precio y la cantidad no permitan valores negativos.",
      "Identificar condiciones de entrada que requieren pruebas.",
    ]);
    setFiles(PUBLIC_DEMO_FILES.map((file) => ({ ...file })));
  }
  return (
    <div className="stack">
      <div>
        <h1>{jobId ? "Editar borrador" : "Prepara tu encargo"}</h1>
        <p>
          Archivos y objetivo · 1–3 archivos JS/TS, 1.000 líneas y 256 KiB
          combinados.
        </p>
      </div>
      {error && <ErrorNotice error={error} />}
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label>
          Oferta seleccionada
          <select
            required
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {compatibleOffers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                {offer.name} · v{offer.version}
                {offer.profile === "two-role-demo"
                  ? " · Experimental · Fixture público"
                  : " · Revisor único"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Título
          <input
            required
            minLength={3}
            maxLength={100}
            aria-describedby="title-help"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <span className="help" id="title-help">
            {title.length}/100 caracteres · mínimo 3
          </span>
        </label>
        <label>
          Objetivo
          <textarea
            required
            minLength={20}
            maxLength={2000}
            aria-describedby="objective-help"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
          <span id="objective-help" className="help">
            {objective.length}/2000 caracteres
          </span>
        </label>
        {criteria.map((value, index) => (
          <label key={index}>
            Criterio {index + 1}
            <textarea
              required
              maxLength={500}
              aria-describedby={`criterion-help-${index}`}
              value={value}
              onChange={(e) =>
                setCriteria(
                  criteria.map((item, i) =>
                    i === index ? e.target.value : item,
                  ),
                )
              }
            />
            <span className="help" id={`criterion-help-${index}`}>
              {value.length}/500 caracteres
            </span>
            {criteria.length > 1 && (
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setCriteria(criteria.filter((_, i) => i !== index))
                }
              >
                Quitar criterio
              </button>
            )}
          </label>
        ))}
        <button
          className="secondary"
          type="button"
          disabled={criteria.length >= 10}
          onClick={() => setCriteria([...criteria, ""])}
        >
          Añadir criterio
        </button>
        <label>
          Archivos JS/TS
          <input
            type="file"
            disabled={job?.context === "public-demo"}
            accept=".js,.ts"
            multiple
            onChange={(e) => {
              void upload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {files.map((file, index) => (
          <div className="row" key={`${file.name}-${index}`}>
            <div>
              <strong>{file.name}</strong>
              <p>
                {new TextEncoder().encode(file.content).length} bytes ·{" "}
                {lineCount(file.content)} líneas
              </p>
            </div>
            <button
              type="button"
              className="secondary"
              disabled={job?.context === "public-demo"}
              onClick={() => setRemoveIndex(index)}
            >
              Quitar archivo
            </button>
          </div>
        ))}
        <div className="alert">
          El proveedor no recibe tus archivos ni prompts. La revisión local
          inspecciona texto y no ejecuta el código.
        </div>
        <label>
          Contexto
          <select
            disabled={Boolean(job)}
            value={context}
            onChange={(e) => setContext(e.target.value as Job["context"])}
          >
            <option value="private-review">
              Revisión privada · Sin herramientas A/B
            </option>
            <option value="public-demo">
              DEMO-01 · Fixture público separado
            </option>
          </select>
        </label>
        {context === "public-demo" && (
          <div className="alert warning">
            DEMO-01 sólo admite el fixture público fijo. Carga el ejemplo para
            probar herramientas locales.
          </div>
        )}
        <div className="actions">
          <button disabled={busy}>
            {busy ? "Guardando…" : "Guardar y revisar condiciones"}
          </button>
          <button className="secondary" type="button" onClick={example}>
            Cargar ejemplo
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => setDiscard(true)}
          >
            Volver a encargos
          </button>
        </div>
      </form>
      {removeIndex !== undefined && (
        <Dialog
          title={`¿Quitar ${files[removeIndex].name}?`}
          onClose={() => setRemoveIndex(undefined)}
        >
          <p>
            El archivo se retirará del alcance. Si existían condiciones
            aceptadas, se invalidarán al guardar.
          </p>
          <button
            className="danger"
            onClick={() => {
              setFiles(files.filter((_, i) => i !== removeIndex));
              setRemoveIndex(undefined);
            }}
          >
            Quitar archivo
          </button>
        </Dialog>
      )}
      {discard && (
        <Dialog
          title="¿Descartar cambios del formulario?"
          onClose={() => setDiscard(false)}
        >
          <p>Los cambios que no hayas guardado se perderán.</p>
          <button className="danger" onClick={() => navigate("/jobs")}>
            Descartar cambios
          </button>
        </Dialog>
      )}
    </div>
  );
}
