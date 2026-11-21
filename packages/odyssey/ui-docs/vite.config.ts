import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createDocsPlugin } from "@odyssey/docs/plugin";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import docsConfig from "./docs.config.ts";

const docsRoot = fileURLToPath(new URL("./docs", import.meta.url));

export default defineConfig({
  plugins: [...createDocsPlugin({ config: docsConfig, docsRoot }), tailwindcss(), react()],
  resolve: { dedupe: ["react", "react-dom", "styled-components"] },
  optimizeDeps: { exclude: ["@odyssey/docs", "odyssey:docs"] },
  server: { port: 4174, strictPort: true },
});
