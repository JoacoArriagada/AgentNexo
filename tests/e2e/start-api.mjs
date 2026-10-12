import { mkdtempSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = fileURLToPath(new URL("../../", import.meta.url));
mkdirSync(resolve(root, ".local"), { recursive: true });
const directory = mkdtempSync(resolve(root, ".local/e2e-"));
const child = spawn(
  process.execPath,
  ["--import", "tsx", "backend/src/index.ts"],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: "3101",
      DB_PATH: resolve(directory, "test.sqlite"),
    },
  },
);
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
process.on("SIGINT", () => child.kill("SIGTERM"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
