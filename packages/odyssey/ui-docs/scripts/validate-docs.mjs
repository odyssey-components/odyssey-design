import { readFile } from "node:fs/promises";
import path from "node:path";

const catalog = JSON.parse(
	await readFile(path.resolve(import.meta.dirname, "../src/catalog.json"), "utf8"),
);
const registry = await readFile(
	path.resolve(import.meta.dirname, "../src/demos/registry.tsx"),
	"utf8",
);
const api = JSON.parse(
	await readFile(
		path.resolve(import.meta.dirname, "../src/generated/api.json"),
		"utf8",
	),
);

const names = new Set();
const demoIds = new Set();
const apiNames = new Set(api.children?.map((entry) => entry.name));
for (const item of catalog) {
	if (names.has(item.name)) throw new Error(`Duplicate component: ${item.name}`);
	names.add(item.name);
	const docPath = path.resolve(import.meta.dirname, `../docs/${item.docId}.mdx`);
	const doc = await readFile(docPath, "utf8");
	if (!doc.includes("## 何时使用")) throw new Error(`Missing usage guidance for ${item.name}`);
	if (!doc.includes("## API")) throw new Error(`Missing API section for ${item.name}`);
	if (item.accessibility.length > 0 && !/## (无障碍|键盘)/.test(doc))
		throw new Error(`Missing accessibility guidance for ${item.name}`);
	for (const demoId of item.demoIds) {
		if (demoIds.has(demoId)) throw new Error(`Duplicate demo: ${demoId}`);
		demoIds.add(demoId);
		if (!registry.includes(`${demoId}:`) || !doc.includes(`id="${demoId}"`))
			throw new Error(`Missing demo ${demoId} for ${item.name}`);
	}
	for (const apiName of item.api) {
		if (!apiNames.has(apiName) || !doc.includes(`name="${apiName}"`))
			throw new Error(`Missing API ${apiName} for ${item.name}`);
	}
}
if (registry.includes("@base-ui/react") || /@odyssey\/ui\/src/.test(registry))
	throw new Error("Demos must consume only the public @odyssey/ui entrypoint.");
if (!Array.isArray(api.children) || api.children.length === 0)
	throw new Error("Generated API metadata is empty.");
console.log(
	`Validated ${catalog.length} components, ${demoIds.size} demos and ${api.children.length} public API interfaces.`,
);
