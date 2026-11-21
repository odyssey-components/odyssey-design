import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceRoots = [path.resolve(import.meta.dirname, "../../../../packages/odyssey-ui/src"), path.resolve(import.meta.dirname, "../../../../packages/odyssey-pro/src")];

async function walk(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const target = path.join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await walk(target)));
		else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name))
			files.push(target);
	}
	return files;
}

function readBlock(source, openingBrace) {
	let depth = 0;
	for (let index = openingBrace; index < source.length; index += 1) {
		if (source[index] === "{") depth += 1;
		if (source[index] === "}") depth -= 1;
		if (depth === 0) return source.slice(openingBrace + 1, index);
	}
	return "";
}

function cleanComment(raw = "") {
	return raw
		.replace(/^\s*\/\*\*|\*\/\s*$/g, "")
		.split("\n")
		.map((line) => line.replace(/^\s*\* ?/, ""))
		.join("\n")
		.trim();
}

function parseComment(raw) {
	const value = cleanComment(raw);
	if (!value) return undefined;
	const firstTag = value.search(/@\w+/);
	const summary = (firstTag >= 0 ? value.slice(0, firstTag) : value)
		.replace(/\s+/g, " ")
		.trim();
	const blockTags = [...value.matchAll(/(@\w+)\s+([^@\n]*)/g)].map((match) => ({
		tag: match[1],
		content: [{ text: match[2].trim() }],
	}));
	return { summary: summary ? [{ text: summary }] : [], blockTags };
}

function parseMembers(block) {
	const members = [];
	const pattern =
		/(\/\*\*[\s\S]*?\*\/\s*)?(?:readonly\s+)?(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))(\?)?\s*:\s*([^;\n]+);/g;
	for (const match of block.matchAll(pattern)) {
		members.push({
			name: match[2] ?? match[3] ?? match[4],
			flags: { isOptional: Boolean(match[5]) },
			type: { type: "display", name: match[6].trim() },
			comment: parseComment(match[1]),
		});
	}
	return members;
}

function readTypeAlias(source, start) {
	const pairs = { "(": ")", "[": "]", "{": "}" };
	const stack = [];
	for (let index = start; index < source.length; index += 1) {
		const character = source[index];
		if (character in pairs) stack.push(pairs[character]);
		else if (character === stack.at(-1)) stack.pop();
		else if (character === ";" && stack.length === 0)
			return source.slice(start, index).trim();
	}
	return "";
}

const declarations = [];
for (const file of (await Promise.all(sourceRoots.map(walk))).flat()) {
	const source = await readFile(file, "utf8");
	const pattern =
		/(\/\*\*[\s\S]*?\*\/\s*)?export\s+interface\s+([A-Za-z_$][\w$]*)[^{]*\{/g;
	for (const match of source.matchAll(pattern)) {
		const openingBrace = match.index + match[0].lastIndexOf("{");
		declarations.push({
			name: match[2],
			comment: parseComment(match[1]),
			children: parseMembers(readBlock(source, openingBrace)),
		});
	}
	const aliasPattern =
		/(\/\*\*[\s\S]*?\*\/\s*)?export\s+type\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g;
	for (const match of source.matchAll(aliasPattern)) {
		declarations.push({
			name: match[2],
			comment: parseComment(match[1]),
			children: [],
			type: { type: "display", name: match[3].trim() },
		});
	}
	const genericAliasPattern =
		/(\/\*\*[\s\S]*?\*\/\s*)?export\s+type\s+([A-Za-z_$][\w$]*)<[^;]+?>\s*=\s*/g;
	for (const match of source.matchAll(genericAliasPattern)) {
		const value = readTypeAlias(source, match.index + match[0].length);
		if (!value) continue;
		declarations.push({
			name: match[2],
			comment: parseComment(match[1]),
			children: [],
			type: { type: "display", name: value },
		});
	}
}

const output = {
	name: "@odyssey/ui + @odyssey/pro",
	children: declarations.sort((a, b) => a.name.localeCompare(b.name)),
};
const target = path.resolve(import.meta.dirname, "../src/generated/api.json");
await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify(output, null, "\t")}\n`, "utf8");
console.log(
	`Generated API metadata for ${declarations.length} public interfaces.`,
);
