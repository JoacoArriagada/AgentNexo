import { useEffect, useRef, type ReactNode } from "react";
import { ApiError } from "./api";
export function Card({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="card">
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <Card>
      <p>{children}</p>
    </Card>
  );
}
export function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando contenido"
      className="card skeleton"
    >
      <span />
      <span />
      <span />
    </div>
  );
}
export function ErrorNotice({
  error,
  retry,
}: {
  error: Error;
  retry?: () => void;
}) {
  return (
    <div role="alert" className="alert error">
      <strong>{error.message}</strong>
      {error instanceof ApiError && error.details?.length ? (
        <ul>
          {error.details.map((item, index) => (
            <li key={index}>
              {(
                {
                  title: "Título",
                  objective: "Objetivo",
                  acceptanceCriteria: "Criterios",
                  files: "Archivos",
                  name: "Nombre",
                  description: "Descripción",
                  priceMinor: "Precio",
                  reason: "Motivo",
                } as Record<string, string>
              )[item.field] ?? item.field}
              : {item.reason}
            </li>
          ))}
        </ul>
      ) : null}
      {retry && <button onClick={retry}>Reintentar</button>}
    </div>
  );
}
export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.showModal();
    return () => previous?.focus();
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose} aria-labelledby="dialog-title">
      <h2 id="dialog-title">{title}</h2>
      {children}
      <button className="secondary" autoFocus onClick={onClose}>
        Conservar y volver
      </button>
    </dialog>
  );
}
export const labels: Record<string, string> = {
  draft: "Borrador",
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  suspended: "Suspendida",
  ready: "Lista para iniciar",
  awaiting_authorization: "Por autorizar",
  queued: "En cola",
  running: "En ejecución",
  paused: "Pausada",
  completed: "Completada",
  partial: "Parcial",
  cancelled: "Cancelada",
  failed: "Fallida",
  unfunded: "Sin depósito",
  funded: "Precio en garantía",
  delivered: "Entregada",
  disputed: "Disputada",
  paid: "Precio pagado",
  refunded: "Precio devuelto",
  confirmed: "Confirmada",
  uncertain: "Pendiente de conciliación",
  available: "Disponible",
};
export function label(value: string) {
  return labels[value] ?? value;
}
export function money(minor: string, scale: number, currency: string) {
  const amount = BigInt(minor);
  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const raw = abs.toString().padStart(scale + 1, "0");
  return `${negative ? "-" : ""}${scale ? raw.slice(0, -scale) + "," + raw.slice(-scale) : raw} ${currency.replace("_DEMO", " de prueba")}`;
}
let displayTimezone = "America/Santiago";
export function setDateTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("es-CL", { timeZone: timezone });
    displayTimezone = timezone;
  } catch {
    displayTimezone = "America/Santiago";
  }
  return displayTimezone;
}
export function date(value?: string) {
  return value
    ? new Intl.DateTimeFormat("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: displayTimezone,
      }).format(new Date(value)) +
        " · " +
        displayTimezone
    : "—";
}
export function lineCount(content: string) {
  return content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
}
