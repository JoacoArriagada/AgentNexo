import { createApp, type AppOptions } from "../src/app/index.js";
import type { Server } from "node:http";
import { randomUUID } from "node:crypto";
export async function setup(options: AppOptions = {}) {
  const runtime = createApp({
    dbPath: ":memory:",
    autoDispatch: false,
    ...options,
  });
  const server: Server = await new Promise((resolve) => {
    const listening = runtime.app.listen(0, "127.0.0.1", () =>
      resolve(listening),
    );
  });
  const address = server.address() as { port: number };
  async function api(
    path: string,
    method = "GET",
    body?: unknown,
    actor = "buyer",
    key = randomUUID(),
  ) {
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/v1${path}`,
      {
        method,
        headers: {
          "X-Actor-Id": actor,
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
    const text = await response.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = text;
    }
    return { status: response.status, data, headers: response.headers };
  }
  const close = async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    runtime.close();
  };
  return { ...runtime, api, close };
}
