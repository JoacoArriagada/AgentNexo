import { useEffect, useState, type ReactNode } from "react";
import type { Actor, Preferences } from "@agentnexo/api-contracts";
import { request } from "../shared/api";
import { Card, ErrorNotice, Loading, setDateTimezone } from "../shared/ui";
import { Catalog } from "../modules/catalog/Catalog";
import { Offers } from "../modules/offers/Offers";
import { Moderation } from "../modules/moderation/Moderation";
import { JobEditor } from "../modules/jobs/JobEditor";
import { PolicyPage } from "../modules/jobs/PolicyPage";
import { JobDetail } from "../modules/jobs/JobDetail";
import { JobsList } from "../modules/jobs/JobsList";
import { SalesPage } from "../modules/sales/SalesPage";
import { OperationsPage } from "../modules/operations/OperationsPage";
import { NotificationsPage } from "../modules/notifications/NotificationsPage";
import { SettingsPage } from "../modules/settings/SettingsPage";
import { ProvidersPage } from "../modules/catalog/ProvidersPage";
export function App() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [actorId, setActorId] = useState(
    () => localStorage.getItem("agentnexo.actor") ?? "visitor",
  );
  const [url, setUrl] = useState(location.pathname + location.search);
  const [error, setError] = useState<Error>();
  const [, setTimezone] = useState("America/Santiago");
  const path = url.split("?")[0];
  const search = new URLSearchParams(url.split("?")[1]);
  const actor = actors.find((item) => item.id === actorId);
  const role = actor?.roles[0] ?? "visitor";
  const load = () => {
    setError(undefined);
    request<{ actors: Actor[] }>("visitor", "/context")
      .then((value) => {
        setActors(value.actors);
        if (!value.actors.some((item) => item.id === actorId))
          setActorId(value.actors[0]?.id ?? "visitor");
      })
      .catch(setError);
  };
  useEffect(load, []);
  useEffect(() => {
    const handle = () => setUrl(location.pathname + location.search);
    addEventListener("popstate", handle);
    return () => removeEventListener("popstate", handle);
  }, []);
  useEffect(() => {
    let active = true;
    let preferencesChanged = false;
    const apply = (timezone: string) => setTimezone(setDateTimezone(timezone));
    apply("America/Santiago");
    if (actorId !== "visitor")
      request<Preferences>(actorId, "/preferences")
        .then((value) => {
          if (active && !preferencesChanged) apply(value.timezone);
        })
        .catch(() => {});
    const updated = (event: Event) => {
      const value = (
        event as CustomEvent<{ actorId: string; timezone: string }>
      ).detail;
      if (value.actorId === actorId) {
        preferencesChanged = true;
        apply(value.timezone);
      }
    };
    addEventListener("agentnexo.preferences-updated", updated);
    return () => {
      active = false;
      removeEventListener("agentnexo.preferences-updated", updated);
    };
  }, [actorId]);
  function navigate(target: string) {
    history.pushState({}, "", target);
    setUrl(target);
    window.scrollTo(0, 0);
    setTimeout(() => document.querySelector<HTMLElement>("#main")?.focus(), 0);
  }
  const nav = [
    ["/", "Inicio"],
    ["/catalog", "Catálogo"],
    ...(role === "buyer"
      ? [
          ["/jobs", "Mis encargos"],
          ["/reports", "Informes"],
        ]
      : []),
    ...(role === "provider"
      ? [
          ["/offers", "Mis ofertas"],
          ["/sales", "Mis ventas"],
        ]
      : []),
    ...(role === "admin"
      ? [
          ["/moderation", "Moderación"],
          ["/operations", "Operaciones y disputas"],
        ]
      : []),
    ["/services", "Servicios"],
    ...(role !== "visitor"
      ? [
          ["/notifications", "Notificaciones"],
          ["/preferences", "Preferencias"],
        ]
      : []),
  ];
  const parts = path.split("/").filter(Boolean);
  let page: ReactNode;
  if (parts[0] === "catalog")
    page = (
      <Catalog
        actorId={actorId}
        role={role}
        navigate={navigate}
        offerId={parts[1]}
      />
    );
  else if (parts[0] === "services")
    page = <ProvidersPage actorId={actorId} navigate={navigate} />;
  else if (parts[0] === "offers" && role === "provider")
    page = <Offers actorId={actorId} navigate={navigate} offerId={parts[1]} />;
  else if (parts[0] === "moderation" && role === "admin")
    page = <Moderation actorId={actorId} />;
  else if (parts[0] === "jobs" && role === "buyer") {
    if (parts[1] === "new")
      page = (
        <JobEditor
          actorId={actorId}
          navigate={navigate}
          offerId={search.get("offer") ?? undefined}
        />
      );
    else if (parts[2] === "edit")
      page = (
        <JobEditor
          actorId={actorId}
          navigate={navigate}
          jobId={parts[1]}
          offerId={search.get("offer") ?? undefined}
        />
      );
    else if (parts[2] === "policy")
      page = (
        <PolicyPage
          actorId={actorId}
          navigate={navigate}
          jobId={parts[1]}
          offerId={search.get("offer") ?? undefined}
        />
      );
    else if (parts[1])
      page = (
        <JobDetail
          actorId={actorId}
          navigate={navigate}
          jobId={parts[1]}
          tab={parts[2] ?? "summary"}
        />
      );
    else page = <JobsList actorId={actorId} navigate={navigate} />;
  } else if (parts[0] === "reports" && role === "buyer")
    page = <JobsList actorId={actorId} navigate={navigate} reports />;
  else if (parts[0] === "sales" && role === "provider")
    page = <SalesPage actorId={actorId} />;
  else if (parts[0] === "operations" && role === "admin")
    page = <OperationsPage actorId={actorId} />;
  else if (parts[0] === "notifications" && role !== "visitor")
    page = <NotificationsPage actorId={actorId} navigate={navigate} />;
  else if (parts[0] === "preferences" && role !== "visitor")
    page = <SettingsPage actorId={actorId} />;
  else if (path === "/")
    page = (
      <div className="stack">
        <div>
          <h1>
            {role === "visitor"
              ? "Un encargo, de principio a fin"
              : `Buen día, ${actor?.name.split(" ")[0]}`}
          </h1>
          <p>Revisiones claras. Decisiones bajo tu control.</p>
        </div>
        <Card title="Tu próxima acción">
          <p>
            Explora una oferta aprobada, define el alcance y revisa la evidencia
            antes de decidir.
          </p>
          <div className="actions">
            <button onClick={() => navigate("/catalog")}>
              Explorar catálogo
            </button>
            {role === "buyer" && (
              <button
                className="secondary"
                onClick={() => navigate("/jobs/new")}
              >
                Nuevo encargo
              </button>
            )}
            {role === "provider" && (
              <button className="secondary" onClick={() => navigate("/offers")}>
                Ver mis ofertas
              </button>
            )}
            {role === "admin" && (
              <button
                className="secondary"
                onClick={() => navigate("/operations")}
              >
                Abrir operaciones
              </button>
            )}
          </div>
        </Card>
        {role === "buyer" && <JobsList actorId={actorId} navigate={navigate} />}
        <Card title="Límites que debes conocer">
          <p>
            1–3 archivos · 1.000 líneas · 256 KiB. La revisión inspecciona texto
            sin ejecutar código. Cada informe declara evidencia y limitaciones;
            las pruebas propuestas no se ejecutan.
          </p>
          <p>
            Precio, modelos, herramientas y comisiones conservan bolsas
            separadas. Las herramientas A/B sólo usan el fixture público
            DEMO-01.
          </p>
        </Card>
      </div>
    );
  else
    page = (
      <Card title="Esta vista no está disponible para el actor seleccionado">
        <p>
          Elige un actor con la responsabilidad correspondiente o vuelve al
          catálogo.
        </p>
        <button onClick={() => navigate("/catalog")}>Abrir catálogo</button>
      </Card>
    );
  return (
    <>
      <a className="skip" href="#main">
        Ir al contenido
      </a>
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">AgentNexo</div>
          <label>
            Actor de demostración
            <select
              value={actorId}
              onChange={(event) => {
                const id = event.target.value;
                localStorage.setItem("agentnexo.actor", id);
                setActorId(id);
                navigate("/");
              }}
            >
              {actors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <nav aria-label="Navegación principal">
            {nav.map(([target, title]) => (
              <a
                key={target}
                href={target}
                className={
                  path === target ||
                  (target !== "/" && path.startsWith(target + "/"))
                    ? "active"
                    : ""
                }
                onClick={(event) => {
                  event.preventDefault();
                  navigate(target);
                }}
              >
                {title}
              </a>
            ))}
          </nav>
          <small>
            Datos persistentes en este equipo. El selector permite explorar
            responsabilidades sin credenciales.
          </small>
        </aside>
        <div className="main">
          <header className="topbar">
            <span>
              Tu espacio /{" "}
              {nav.find(([target]) => target === path)?.[1] ?? "Detalle"}
            </span>
            <span>Prototipo local · Simulación</span>
          </header>
          <main className="content" id="main" tabIndex={-1}>
            <div className="alert notice">
              Simulación local: análisis estático determinista, financiación y
              garantía de prueba. No se realizan pagos ni llamadas a modelos
              externos.
            </div>
            {error ? (
              <ErrorNotice error={error} retry={load} />
            ) : !actors.length ? (
              <Loading />
            ) : (
              <div key={actorId + path}>{page}</div>
            )}
          </main>
          <footer className="footer">
            Sólo datos locales · Sin comisión comercial · Importes simulados
          </footer>
        </div>
      </div>
    </>
  );
}
