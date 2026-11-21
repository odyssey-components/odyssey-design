import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const sourceRoot = join(root, "src");
const errors = [];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? sourceFiles(join(directory, entry.name)) : /\.(ts|tsx)$/.test(entry.name) ? [join(directory, entry.name)] : [],
    ),
  );
  return nested.flat();
}

const visualFiles = new Set(["markdown.tsx"]);
const headlessFiles = new Set(["headless.ts", "types.ts", "runtime.ts", "client.ts", "server-thread.ts", "memory-storage.ts", "tool.ts"]);

// A type-only import is erased at build time, so it cannot turn a headless
// module into a UI-dependent one. The shared presentation contracts now live in
// @odyssey/ui/ai/types and are reachable from headless modules as types only.
const withoutTypeOnlyImports = (source) => source.replace(/\b(?:import|export)\s+type\s[^;]*?from\s+["'][^"']+["']/g, "");

for (const path of await sourceFiles(sourceRoot)) {
  const file = relative(sourceRoot, path);
  const text = await readFile(path, "utf8");
  if (!file.includes("/") && file !== "locale.tsx" && !/\.test\.tsx?$/.test(file) && /\p{Script=Han}/u.test(text))
    errors.push(`${file}: built-in user copy must come from locale.tsx or caller props`);
  if (/antd|@ant-design/.test(text)) errors.push(`${file}: Ant Design dependency is forbidden`);
  if (/apiKey|OPENAI_API_KEY|ANTHROPIC_API_KEY/.test(text)) errors.push(`${file}: model credentials are forbidden`);
  if (/export\s+(?:type\s+)?\{[^}]*\}\s+from\s+["']@tanstack/.test(text)) errors.push(`${file}: TanStack types must not be re-exported`);
  if (/useOdysseyChat|["']\.\/chat["']/.test(text)) errors.push(`${file}: removed Chat API must not be reintroduced`);
  if (/from\s+["']@odyssey\/(?:i18n|pro)(?:["'/])/.test(text)) errors.push(`${file}: AI may only depend on Odyssey UI public exports`);
  if (headlessFiles.has(file) && /from\s+["'](?:react|react-dom|styled-components|@odyssey\/ui)/.test(withoutTypeOnlyImports(text)))
    errors.push(`${file}: headless modules cannot depend on React, styled-components, or Odyssey UI`);
  if (visualFiles.has(file) && /from\s+["']\.\/(?:react|runtime|client|server-thread|storage)["']/.test(text))
    errors.push(`${file}: controlled UI primitives cannot import runtime or transport modules`);
  if (file === "react.tsx" && /from\s+["']@odyssey\/ui\/ai\/(?!locale)/.test(text))
    errors.push(`${file}: React bindings cannot import visual primitives`);
}

const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
if (manifest.exports?.["."]) errors.push("package.json: root barrel export is forbidden");
for (const legacy of ["./chat", "./client", "./runtime", "./types", "./storage", "./server-thread", "./composer", "./message", "./thread", "./tools", "./ui/composer", "./ui/message", "./ui/thread", "./ui/thread-list", "./ui/suggestion", "./ui/model-selector", "./ui/renderers", "./ui/tools"])
  if (manifest.exports?.[legacy]) errors.push(`package.json: legacy subpath ${legacy} must not be exported`);
for (const required of ["./headless", "./react", "./assistant", "./ui/markdown", "./ui/locale"])
  if (!manifest.exports?.[required]) errors.push(`package.json: required layered subpath ${required} is missing`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Odyssey AI architecture validated.");
