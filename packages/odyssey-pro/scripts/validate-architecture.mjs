import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const packageRoot = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.join(packageRoot, "src");
const packageJson = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
const errors = [];

if (packageJson.exports["."]) errors.push('package.json: root "." export is forbidden');
if (packageJson.sideEffects !== false) errors.push("package.json: sideEffects must be false");
if (Object.keys(packageJson.dependencies ?? {}).some((name) => name !== "@odyssey/ui")) {
	errors.push("package.json: compatibility facade may depend only on @odyssey/ui");
}

for (const [subpath, target] of Object.entries(packageJson.exports)) {
	const name = subpath.slice(2);
	const file = path.resolve(packageRoot, target);
	if (!file.startsWith(`${sourceRoot}${path.sep}`)) {
		errors.push(`package.json: ${subpath} must resolve to a local facade`);
		continue;
	}
	try {
		const source = await readFile(file, "utf8");
		if (!source.includes(`@odyssey/ui/patterns/${name}`)) errors.push(`${subpath}: must forward to @odyssey/ui/patterns/${name}`);
	} catch {
		errors.push(`${subpath}: facade file is missing (${path.relative(packageRoot, file)})`);
	}
}

async function walk(directory) {
	const files = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const target = path.join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await walk(target)));
		else files.push(target);
	}
	return files;
}

for (const file of await walk(sourceRoot)) {
	if (!/\.(?:ts|tsx)$/.test(file) || file.includes(`${path.sep}test${path.sep}`)) continue;
	const source = await readFile(file, "utf8");
	if (/from\s+["']\.\.?\//.test(source)) errors.push(`${path.relative(sourceRoot, file)}: compatibility facade cannot import local implementation`);
	if (/from\s+["']@odyssey\/pro(?:["'/])/.test(source)) errors.push(`${path.relative(sourceRoot, file)}: compatibility facade cannot import itself`);
}

if (errors.length) throw new Error(`Odyssey Pro compatibility violations:\n${errors.join("\n")}`);
console.log("Validated Odyssey UI Pro compatibility exports.");
