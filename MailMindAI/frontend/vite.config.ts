import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server proxies the API to the local backend; both bind to 127.0.0.1 only.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:8765" },
  },
  build: { outDir: "dist", sourcemap: false },
});
