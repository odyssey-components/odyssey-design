import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const packageRoot = path.resolve(import.meta.dirname, "..");
const root = path.join(packageRoot, "src");
const primitives = path.join(root, "primitives");
const workspaceRoot = path.resolve(packageRoot, "../..");
const errors = [];
const packageJson = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
if (!packageJson.exports["."]) errors.push("package.json: root export is required for product-level composition");
if (!Array.isArray(packageJson.sideEffects) || !packageJson.sideEffects.includes("./src/styles.css")) {
  errors.push("package.json: shared stylesheet must be explicitly preserved as a side effect");
}
for (const section of ["dependencies", "peerDependencies", "devDependencies"]) {
  if (packageJson[section]?.["styled-components"]) errors.push(`package.json: shared UI must not declare styled-components in ${section}`);
}
for (const relative of [
  "packages/odyssey-pro/package.json",
  "packages/odyssey/docs/package.json",
]) {
  const manifest = JSON.parse(await readFile(path.join(workspaceRoot, relative), "utf8"));
  for (const section of ["dependencies", "peerDependencies", "devDependencies"]) {
    if (manifest[section]?.["styled-components"]) errors.push(`${relative}: migrated consumer must not declare styled-components in ${section}`);
  }
}
const odysseyAiManifest = JSON.parse(await readFile(path.join(workspaceRoot, "packages/odyssey-ai/package.json"), "utf8"));
if (!odysseyAiManifest.peerDependencies?.["styled-components"] && !odysseyAiManifest.dependencies?.["styled-components"]) {
  errors.push("packages/odyssey-ai/package.json: independent AI runtime must retain its styled-components peer");
}
const aiRuntimeFiles = await walk(path.join(workspaceRoot, "packages/odyssey-ai/src"));
if (!(await Promise.all(aiRuntimeFiles.map((file) => readFile(file, "utf8")))).some((source) => source.includes("styled-components"))) {
  errors.push("packages/odyssey-ai/src: independent AI runtime must retain styled-components consumers");
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

for (const file of await walk(root)) {
  const relative = path.relative(root, file);
  if (relative.endsWith(".css") && !["styles.css", "components.css", "theme.css"].includes(relative)) errors.push(`${relative}: CSS must be part of the shared stylesheet source`);
  if (!/\.(?:ts|tsx)$/.test(relative)) continue;
  const source = await readFile(file, "utf8");
  if (source.includes('from "styled-components"') || source.includes("from 'styled-components'") || /\bstyled\s*\(/.test(source)) {
    errors.push(`${relative}: shared runtime must use static classes and cannot import styled-components`);
  }
  const localeContracts = new Set([path.join("locale.tsx"), path.join("internal", "pro-locale.tsx"), path.join("ai", "locale.tsx")]);
  if (!localeContracts.has(relative) && !/\.test\.tsx?$/.test(relative) && /\p{Script=Han}/u.test(source)) {
    errors.push(`${relative}: built-in user copy must come from the typed locale contract or caller props`);
  }
  if (/\.module\.css/.test(source)) errors.push(`${relative}: CSS Module import remains`);
  if (/(?:^|[^a-z0-9])ods-/i.test(source)) errors.push(`${relative}: legacy ods prefix is forbidden`);
  const tokenSource = await readFile(path.join(root, "tokens/web.ts"), "utf8");
  for (const [, variable] of source.matchAll(/var\((--od-[a-z0-9-]+)/g)) {
    if (!tokenSource.includes(`"${variable}"`)) errors.push(`${relative}: unknown public CSS Variable ${variable}`);
  }
  if (relative.startsWith(`primitives${path.sep}`) && /createGlobalStyle/.test(source)) {
    errors.push(`${relative}: component styles must be attached to styled anatomy, not createGlobalStyle`);
  }
  if (relative.startsWith(`primitives${path.sep}`) && /\b(?:margin|padding|border)-(?:left|right)|text-align:\s*(?:left|right)/.test(source)) {
    errors.push(`${relative}: use logical CSS properties for direction-sensitive component styles`);
  }
  if (/runtime-styles/i.test(relative) || /OdysseyRuntimeStyleFallback|OdysseyComponentRuntimeStyles/.test(source)) {
    errors.push(`${relative}: full component style registries and fallback contexts are forbidden`);
  }
  if (relative.startsWith(`primitives${path.sep}`) && /<>\s*\{\s*</s.test(source)) errors.push(`${relative}: redundant single-child Fragment is forbidden`);
  if (/primitives\/[^/]+\/[^/]+\.styles/.test(source) && !relative.startsWith(`primitives${path.sep}`))
    errors.push(`${relative}: component styles must remain private to their component`);
}

for (const entry of await readdir(primitives, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  for (const required of [`${entry.name}.tsx`, "index.ts"]) {
    try { await readFile(path.join(primitives, entry.name, required)); }
    catch { errors.push(`primitives/${entry.name}/${required}: missing required component file`); }
  }
  const files = await readdir(path.join(primitives, entry.name));
  if (!files.includes(`${entry.name}.styles.tsx`)) {
    const component = await readFile(path.join(primitives, entry.name, `${entry.name}.tsx`), "utf8");
    if (!/\bcva\s*\(|\bcn\s*\(/.test(component)) errors.push(`primitives/${entry.name}: static utility or component style source missing`);
  }
  if (!files.some((file) => /\.test\.tsx?$/.test(file))) errors.push(`primitives/${entry.name}: every public component needs an observable contract test`);
  const subpath = `./${entry.name.replace(/[A-Z]/g, (letter, offset) => `${offset ? "-" : ""}${letter.toLowerCase()}`)}`;
  if (!packageJson.exports[subpath]) errors.push(`package.json: missing component export ${subpath}`);
  if (!packageJson.exports[`./primitives/${subpath.slice(2)}`]) errors.push(`package.json: missing primitive-layer export ${subpath}`);
}

const patterns = path.join(root, "patterns");
for (const entry of await readdir(patterns, { withFileTypes: true })) {
  if (!entry.isDirectory() || !entry.name.startsWith("Pro")) continue;
  const target = `./src/patterns/${entry.name}/index.ts`;
  if (!Object.values(packageJson.exports).includes(target)) errors.push(`patterns/${entry.name}: missing public pattern export`);
  for (const required of [`${entry.name}.tsx`, "index.ts"]) {
    try { await readFile(path.join(patterns, entry.name, required)); }
    catch { errors.push(`patterns/${entry.name}/${required}: missing pattern source file`); }
  }
}

const ai = path.join(root, "ai");
if (!packageJson.exports["./ai"]) errors.push("package.json: missing AI layer export");
const aiRootFiles = new Set(["locale.tsx", "types.ts", "index.ts", "README.md"]);
for (const entry of await readdir(ai, { withFileTypes: true })) {
  if (entry.name.startsWith(".")) continue;
  if (!entry.isDirectory()) {
    if (!aiRootFiles.has(entry.name)) errors.push(`ai/${entry.name}: the AI layer root only allows component directories, locale.tsx, types.ts, index.ts and README.md`);
    continue;
  }
  for (const required of [`${entry.name}.tsx`, `${entry.name}.classes.ts`, "index.ts"]) {
    try { await readFile(path.join(ai, entry.name, required)); }
    catch { errors.push(`ai/${entry.name}/${required}: missing component file`); }
  }
  const slug = entry.name.replace(/^AI/, "").replace(/[A-Z]/g, (letter, offset) => `${offset ? "-" : ""}${letter.toLowerCase()}`);
  if (!packageJson.exports[`./ai/${slug}`]) errors.push(`package.json: missing AI component export ./ai/${slug}`);
  const files = await readdir(path.join(ai, entry.name));
  if (!files.some((file) => file.endsWith(".test.tsx") || file.endsWith(".test.ts"))) errors.push(`ai/${entry.name}: contract test missing`);
}
for (const file of await walk(ai)) {
  if ((!file.endsWith(".ts") && !file.endsWith(".tsx")) || file.includes(".test.")) continue;
  const source = await readFile(file, "utf8");
  if (source.includes("createGlobalStyle") || source.includes("@odyssey/pro") || source.includes('from "@odyssey/ui"') || source.includes('from "../products/')) {
    errors.push(`${path.relative(root, file)}: AI layer may use only public UI primitives and tokens`);
  }
}

for (const file of await walk(patterns)) {
  if (!/\.(?:ts|tsx)$/.test(file) || /\.test\.tsx?$/.test(file)) continue;
  const source = await readFile(file, "utf8");
  const relative = path.relative(root, file);
  if (/from\s+["']@odyssey\/ui["']/.test(source)) errors.push(`${relative}: patterns must import primitives directly instead of the UI aggregate root`);
  if (/from\s+["']@odyssey\/pro(?:["'/])/.test(source)) errors.push(`${relative}: patterns cannot depend on the compatibility package`);
}

for (const file of await walk(primitives)) {
  if (!/\.(?:ts|tsx)$/.test(file)) continue;
  const source = await readFile(file, "utf8");
  const relative = path.relative(root, file);
  if (/from\s+["'][^"']*patterns(?:\/|["'])/.test(source)) errors.push(`${relative}: primitives cannot depend on patterns`);
  if (/from\s+["']@odyssey\/pro(?:["'/])/.test(source)) errors.push(`${relative}: primitives cannot depend on the compatibility package`);
}

const styleFiles = [
  ...(await walk(primitives)).filter((file) => /\.(?:ts|tsx)$/.test(file)),
  ...["styles.css", "components.css", "theme.css"].map((file) => path.join(root, file)),
];
const styleSources = (await Promise.all(styleFiles.map((file) => readFile(file, "utf8")))).join("\n");
const tokenSource = await readFile(path.join(root, "tokens/web.ts"), "utf8");
const componentContractPaths = [...tokenSource.matchAll(/([A-Za-z0-9]+):\s*token\(\s*"([^"]+)",\s*"(components\.[^"]+)"/g)];
for (const [, role, variable, tokenPath] of componentContractPaths) {
  if (!styleSources.includes(`odysseyTokenVars.${role}`) && !styleSources.includes(variable)) {
    errors.push(`${tokenPath}: Component Token is not consumed by a component style`);
  }
}

if (errors.length) throw new Error(`Odyssey architecture violations:\n${errors.join("\n")}`);
console.log("Validated Odyssey primitives and patterns source-first architecture.");
