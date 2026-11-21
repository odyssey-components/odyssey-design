import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.join(root, "src");

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => (entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)])),
  );
  return nested.flat();
}

const forbidden = [new RegExp(`@${"libs"}/docs`), /@libs\/(?:ui|starter)/, new RegExp(`${"libs"}:docs`), /--ant-/, /\.ant-/];
for (const file of await files(sourceRoot)) {
  if (!/\.(?:css|ts|tsx)$/.test(file)) continue;
  const source = await readFile(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(source)) throw new Error(`${path.relative(root, file)} contains forbidden legacy contract ${pattern}`);
  }
}

const manifest = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
if (manifest.name !== "@odyssey/docs") throw new Error("Docs runtime package must be named @odyssey/docs");
for (const subpath of [".", "./headless", "./mdx-runtime", "./plugin", "./locale", "./styles.css"]) {
  if (!manifest.exports?.[subpath]) throw new Error(`Missing public export ${subpath}`);
}
if (!manifest.dependencies?.["@odyssey/ui"]) throw new Error("Docs runtime must depend on @odyssey/ui");

console.log("Validated Odyssey Docs runtime architecture.");
