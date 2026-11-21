import type { Plugin } from "vite";
import { type AppearanceBootstrapOptions, createAppearanceBootstrapScript } from "./appearance-bootstrap.ts";

/** Serve the same blocking, same-origin bootstrap in development and production. */
export function appearanceBootstrapVitePlugin(options: AppearanceBootstrapOptions): Plugin {
  const filename = `od-appearance-${encodeURIComponent(options.storageKey)}.js`;
  const script = createAppearanceBootstrapScript(options);
  let base = "/";
  return {
    name: "od-appearance-bootstrap",
    configResolved(config) {
      base = config.base;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split("?")[0];
        if (path !== `/${filename}` && path !== `${base}${filename}`) return next();
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.end(script);
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: filename, source: script });
    },
    transformIndexHtml: { order: "pre", handler: () => [{ tag: "script", attrs: { src: `${base}${filename}` }, injectTo: "head-prepend" }] },
  };
}
