import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5174",
    channel: process.platform === "win32" ? "msedge" : undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "node tests/e2e/start-api.mjs",
      url: "http://127.0.0.1:3101/api/v1/health",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "npm run dev -w @agentnexo/frontend -- --port 5174 --strictPort",
      url: "http://127.0.0.1:5174",
      env: { API_PROXY_TARGET: "http://127.0.0.1:3101" },
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
