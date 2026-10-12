import { useState } from "react";
import type { Job, List } from "@agentnexo/api-contracts";
import { useResource } from "../../shared/hooks";
import {
  Badge,
  Card,
  Empty,
  ErrorNotice,
  Loading,
  date,
  label,
} from "../../shared/ui";
export function JobsList({
  actorId,
  navigate,
  reports = false,
}: {
  actorId: string;
  navigate: (path: string) => void;
  reports?: boolean;
}) {
  const [archived, setArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const resource = useResource<List<Job>>(
    actorId,
    `/jobs?archived=${archived}`,
  );
  const jobs = resource.data?.items.filter(
    (job) =>
      (!reports || ["completed", "partial"].includes(job.state)) &&
      (!state || job.state === state) &&
      job.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="stack">
      <div className="pagehead">
        <div>
          <h1>{reports ? "Informes" : "Mis encargos"}</h1>
          <p>
            {reports
              ? "Resultados completos y parciales vinculados a su revisión."
              : "Continúa borradores y consulta el estado de tu trabajo."}
          </p>
        </div>
        {!reports && (
          <button onClick={() => navigate("/jobs/new")}>Nuevo encargo</button>
        )}
      </div>
      <Card>
        <div className="grid">
          <label>
            Buscar encargo
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            Estado
            <select value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">Todos</option>
              {["draft", "running", "completed", "partial", "cancelled"].map(
                (value) => (
                  <option key={value} value={value}>
                    {label(value)}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
          />
          Mostrar archivados
        </label>
      </Card>
      {resource.error ? (
        <ErrorNotice error={resource.error} retry={resource.reload} />
      ) : !jobs ? (
        <Loading />
      ) : !jobs.length ? (
        <Empty>
          No hay {reports ? "informes disponibles" : "encargos en este filtro"}.{" "}
          <button
            className="secondary"
            onClick={() => {
              setSearch("");
              setState("");
            }}
          >
            Limpiar filtros
          </button>
        </Empty>
      ) : (
        <Card>
          {jobs.map((job) => (
            <div className="row" key={job.id}>
              <div className="stack">
                <strong>{job.title}</strong>
                <p>{date(job.updatedAt)}</p>
                <Badge>{label(job.state)}</Badge>
              </div>
              <button
                className="secondary"
                onClick={() =>
                  navigate(`/jobs/${job.id}${reports ? "/report" : ""}`)
                }
              >
                Abrir {reports ? "informe" : "encargo"}
              </button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
