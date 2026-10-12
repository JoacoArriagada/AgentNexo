import { createApp } from "./app/index.js";
const runtime = createApp();
const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "127.0.0.1";
const server = runtime.app.listen(port, host, () =>
  console.log(`AgentNexo local API: http://${host}:${port}`),
);
function shutdown() {
  server.close(() => {
    runtime.close();
    process.exit(0);
  });
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
