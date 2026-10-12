import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const children = [
  spawn(
    process.execPath,
    [resolve(root, "node_modules/tsx/dist/cli.mjs"), "watch", "src/index.ts"],
    {
      cwd: resolve(root, "backend"),
      stdio: "inherit",
      env: process.env,
    },
  ),
  spawn(process.execPath, [resolve(root, "node_modules/vite/bin/vite.js")], {
    cwd: resolve(root, "frontend"),
    stdio: "inherit",
    env: process.env,
  }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  process.exitCode = code;
}
for (const child of children) {
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stop(code ?? 1);
  });
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
