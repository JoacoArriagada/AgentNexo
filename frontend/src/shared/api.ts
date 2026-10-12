export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: { field: string; reason: string }[],
  ) {
    super(message);
  }
}
const pendingKeys = new Map<string, string>();
export async function request<T>(
  actorId: string,
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { "X-Actor-Id": actorId };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const signature = JSON.stringify([actorId, path, method, body]);
  if (method !== "GET") {
    if (!pendingKeys.has(signature))
      pendingKeys.set(signature, crypto.randomUUID());
    headers["Idempotency-Key"] = pendingKeys.get(signature)!;
  }
  const response = await fetch(`/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.ok || response.status < 500) pendingKeys.delete(signature);
  if (response.status === 204) return undefined as T;
  const value = await response.json();
  if (!response.ok)
    throw new ApiError(
      value.error?.code ?? "REQUEST_FAILED",
      value.error?.message ?? "No se pudo completar la solicitud.",
      value.error?.details,
    );
  return value as T;
}
export function download(actorId: string, path: string, filename: string) {
  return fetch(`/api/v1${path}`, { headers: { "X-Actor-Id": actorId } }).then(
    async (response) => {
      if (!response.ok)
        throw new Error("El informe no está disponible para exportar.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    },
  );
}
