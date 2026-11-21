import { gzipSync } from "node:zlib";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { build } from "vite";

const root = path.resolve(import.meta.dirname, "..");
const fixtures = ["button", "root-button", "button-select", "input-group", "combobox", "number-field", "otp-input", "toast", "all"];
const update = process.argv.includes("--write-budget");
const budgetFile = path.join(import.meta.dirname, "bundle-size-budget.json");
// The budget has to be regenerated with the runtime that actually runs this
// gate: the web verification profile drives workspace scripts through
// `bun run --bun`, which replaces the `node` call below with Bun, and the
// upgraded toolchain emits a different byte order per runtime. Regenerate with
// `bun scripts/check-bundle-size.mjs --write-budget`, never with plain node.
let budgets = {};
try { budgets = JSON.parse(await readFile(budgetFile, "utf8")); } catch { if (!update) throw new Error("Bundle size budget is missing; run bun run size:check -- --write-budget once"); }
const measured = {};

for (const name of fixtures) {
  const result = await build({
    configFile: false,
    logLevel: "silent",
    root,
    build: {
      write: false,
      minify: "oxc",
      lib: { entry: path.join(import.meta.dirname, "fixtures", `${name}.${name === "all" ? "ts" : "tsx"}`), formats: ["es"], fileName: () => `${name}.js` },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) => item.output);
  const chunks = outputs.filter((item) => item.type === "chunk");
  const code = chunks.map((chunk) => chunk.code).join("\n");
  const modules = new Set(chunks.flatMap((chunk) => Object.keys(chunk.modules)));
  measured[name] = { raw: Buffer.byteLength(code), gzip: gzipSync(code).byteLength };
  if (name === "button" || name === "root-button") {
    for (const marker of ["od-Select", "od-Dialog", "od-Tooltip", "od-Combobox", "od-InputGroup", "od-Toast"]) if (code.includes(marker)) throw new Error(`Button-only fixture contains unused ${marker} styles`);
    for (const id of modules) if (/floating-ui|primitives\/(?:Select|Dialog|Tooltip|Combobox|InputGroup|Toast)/.test(id)) throw new Error(`Button-only fixture contains unused module: ${id}`);
  }
  if (name === "button-select") {
    for (const id of modules) if (/primitives\/(?:Dialog|Tooltip|Combobox|InputGroup|Toast)/.test(id)) throw new Error(`Button + Select fixture contains unused module: ${id}`);
  }
  if (!update) {
    const budget = budgets[name];
    if (!budget || measured[name].raw > budget.raw || measured[name].gzip > budget.gzip) throw new Error(`${name} exceeds budget: ${JSON.stringify({ measured: measured[name], budget })}`);
  }
}

if (update) await writeFile(budgetFile, `${JSON.stringify(measured, null, 2)}\n`);
console.log(JSON.stringify(measured, null, 2));
