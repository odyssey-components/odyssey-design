import path from "node:path";
import { build } from "vite";

const root = path.resolve(import.meta.dirname, "..");
const results = {};

const fixtures = ["pro-table", "pro-select", "pro-radio-group", "pro-checkbox-group", "pro-count-badge", "pro-pagination", "pro-admin-provider", "pro-admin-shell", "pro-admin-login", "pro-form", "pro-icon-picker"];
const rawBudgets = {
  "pro-table": 530000,
  "pro-select": 430080,
  "pro-radio-group": 260000,
  "pro-checkbox-group": 260000,
  "pro-count-badge": 220000,
  "pro-pagination": 400000,
  "pro-admin-provider": 363955,
  "pro-admin-shell": 523354,
  "pro-admin-login": 225792,
  "pro-form": 752640,
  "pro-icon-picker": 394240,
};

for (const name of fixtures) {
  const result = await build({
    configFile: false,
    logLevel: "silent",
    root,
    build: {
      write: false,
      minify: "oxc",
      lib: { entry: path.join(import.meta.dirname, "patterns", "fixtures", `${name}.tsx`), formats: ["es"], fileName: () => `${name}.js` },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) => item.output);
  const chunks = outputs.filter((item) => item.type === "chunk");
  const modules = new Set(chunks.flatMap((chunk) => Object.keys(chunk.modules)));
  const code = chunks.map((chunk) => chunk.code).join("\n");
  results[name] = { modules: modules.size, raw: Buffer.byteLength(code) };
  if (results[name].raw > rawBudgets[name]) {
    throw new Error(`${name} exceeds its minified raw bundle budget: ${results[name].raw} > ${rawBudgets[name]} bytes`);
  }

  for (const id of modules) {
    if (id.includes("react-table/dist/legacy") || id.includes("useLegacyTable")) throw new Error(`${name} contains the TanStack legacy bridge: ${id}`);
    if (name === "pro-select" && /primitives\/Select\//.test(id)) throw new Error(`ProSelect bundles Core Select alongside Combobox: ${id}`);
    const privateComponent = /src\/patterns\/(Pro[^/]+)\//.exec(id)?.[1];
    const allowed = {
      "pro-admin-provider": new Set(["ProAdminProvider", "ProProvider"]),
      "pro-admin-login": new Set(["ProAdminLogin"]),
      "pro-form": new Set(["ProForm", "ProSelect"]),
      "pro-icon-picker": new Set(["ProIconPicker"]),
      "pro-select": new Set(["ProSelect"]),
      "pro-radio-group": new Set(["ProRadioGroup"]),
      "pro-checkbox-group": new Set(["ProCheckboxGroup"]),
      "pro-count-badge": new Set(["ProCountBadge"]),
      "pro-pagination": new Set(["ProPagination"]),
      "pro-table": new Set(["ProPagination", "ProTable"]),
    }[name];
    if (privateComponent && allowed && !allowed.has(privateComponent)) {
      throw new Error(`${name} statically includes unrelated Pro component ${privateComponent}: ${id}`);
    }
  }
}

console.log(JSON.stringify(results, null, 2));
