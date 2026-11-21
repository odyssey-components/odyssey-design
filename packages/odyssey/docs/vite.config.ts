import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
    },
    rollupOptions: {
      external: [/^@odyssey\/ui/, /^@mdx-js\/react/, /^react/, /^react-dom/, /^styled-components/, /^odyssey:docs$/],
    },
  },
  plugins: [react()],
});
