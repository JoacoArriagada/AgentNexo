import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(() => {
  const target = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3001";
  return {
    plugins: [react()],
    server: { host: "127.0.0.1", port: 5173, proxy: { "/api": target } },
    preview: { host: "127.0.0.1", port: 5173, proxy: { "/api": target } },
  };
});
