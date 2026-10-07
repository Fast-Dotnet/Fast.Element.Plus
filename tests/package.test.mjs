import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));

/** 递归收集目录文件，用于验证全部声明而不只检查根入口。 */
const collectFiles = async (directory) => {
	const entries = await readdir(directory, { withFileTypes: true });
	const groups = await Promise.all(
		entries.map((entry) => {
			const url = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
			return entry.isDirectory() ? collectFiles(url) : [url];
		})
	);
	return groups.flat();
};

test("package metadata exposes the ESM, global types, style, and CDN entries", () => {
	assert.equal(packageJson.type, "module");
	assert.equal(packageJson.version, "2.0.22");
	assert.equal(packageJson.main, "./dist/index.mjs");
	assert.equal(packageJson.module, "./dist/index.mjs");
	assert.equal(packageJson.types, "./dist/index.d.ts");
	assert.deepEqual(packageJson.exports, {
		".": {
			types: "./dist/index.d.ts",
			import: "./dist/index.mjs",
			default: "./dist/index.mjs",
		},
		"./global": {
			types: "./dist/global.d.ts",
			import: "./dist/global.mjs",
			default: "./dist/global.mjs",
		},
		"./style.css": "./dist/index.css",
	});
	assert.equal(packageJson.style, "./dist/index.css");
	assert.equal(packageJson.unpkg, "./dist/index.global.min.js");
	assert.equal(packageJson.jsdelivr, "./dist/index.global.min.js");
	assert.deepEqual(packageJson.sideEffects, ["./dist/index.css"]);
	assert.deepEqual(packageJson.peerDependencies, {
		"@element-plus/icons-vue": "^2.3.2",
		"@fast-element-plus/icons-vue": "^2.0.0",
		"element-plus": "^2.14.5",
		vue: "^3.5.11",
	});
	assert.equal(packageJson.devDependencies?.["@element-plus/icons-vue"], "^2.3.2");
	assert.equal(packageJson.devDependencies?.["@fast-element-plus/icons-vue"], "^2.0.1");
	assert.equal(packageJson.dependencies?.["@fast-china/utils"], undefined);
	assert.equal(packageJson.devDependencies?.["@fast-china/utils"], undefined);
	for (const dependencyName of ["csstype", "lodash", "lodash-es", "lodash-unified", "@types/lodash", "@types/lodash-es"]) {
		assert.equal(packageJson.dependencies?.[dependencyName], undefined);
		assert.equal(packageJson.devDependencies?.[dependencyName], undefined);
	}
});

test("build output is complete and does not expose unpublished source paths", async () => {
	const requiredFiles = [
		"dist/index.mjs",
		"dist/index.d.ts",
		"dist/global.mjs",
		"dist/global.d.ts",
		"dist/components/button/index.mjs.map",
		"dist/index.css",
		"dist/index.css.map",
		"dist/index.global.min.js",
		"dist/index.global.min.js.map",
	];
	await Promise.all(requiredFiles.map((file) => access(new URL(file, root))));
	await assert.rejects(access(new URL("dist/node_modules/", root)), (error) => error?.code === "ENOENT");
	await assert.rejects(access(new URL("dist/_virtual/", root)), (error) => error?.code === "ENOENT");

	const declarationFiles = (await collectFiles(new URL("dist/", root))).filter((file) => file.pathname.endsWith(".d.ts"));
	const declarations = await Promise.all(declarationFiles.map((file) => readFile(file, "utf8")));
	for (const declaration of declarations) {
		assert.doesNotMatch(declaration, /\.pnpm[\\/]/u);
		assert.doesNotMatch(declaration, /@fast-element-plus\/(?:components|constants|directives|hooks)[/"']/u);
		assert.doesNotMatch(declaration, /(?:from\s+|import\()["']csstype["']/u);
	}
	const publicDeclarations = await Promise.all(["dist/index.d.ts", "dist/global.d.ts"].map((file) => readFile(new URL(file, root), "utf8")));
	for (const declaration of publicDeclarations) {
		assert.doesNotMatch(declaration, /(?:\.\.\/)*src\//u);
		assert.doesNotMatch(declaration, /(?:\.\.\/)*packages\//u);
	}

	const sourceMap = JSON.parse(await readFile(new URL("dist/components/button/index.mjs.map", root), "utf8"));
	assert.ok(Array.isArray(sourceMap.sourcesContent));
	assert.ok(sourceMap.sourcesContent.every((source) => typeof source === "string"));

	const css = await readFile(new URL("dist/index.css", root), "utf8");
	assert.match(css, /\.fa-/u);

	const cdnBundle = await readFile(new URL("dist/index.global.min.js", root), "utf8");
	assert.match(cdnBundle, /FastElementPlus/u);

	const esmFiles = (await collectFiles(new URL("dist/", root))).filter((file) => file.pathname.endsWith(".mjs"));
	const esmOutput = (await Promise.all(esmFiles.map((file) => readFile(file, "utf8")))).join("\n");
	assert.doesNotMatch(esmOutput, /@fast-china\/utils/u);
	assert.doesNotMatch(esmOutput, /(?:^|[\\/])node_modules[\\/]/u);
	for (const dependencyName of ["decimal.js", "screenfull", "sortablejs"]) {
		assert.match(esmOutput, new RegExp(`from\\s+["']${dependencyName.replaceAll(".", "\\.")}(?:/|["'])`, "u"));
	}
	assert.doesNotMatch(esmOutput, /from\s+["']lodash(?:-es|-unified)?(?:\/|["'])/u);
	// 两套强制 Peer 图标包只保留静态外部引用，不内联到发布产物。
	assert.match(esmOutput, /from\s+["']@element-plus\/icons-vue["']/u);
	assert.match(esmOutput, /from\s+["']@fast-element-plus\/icons-vue["']/u);
	assert.doesNotMatch(esmOutput, /import\(["']@(?:element-plus|fast-element-plus)\/icons-vue/u);
});

test("publish allowlist contains only runtime artifacts and root package documents", () => {
	assert.deepEqual(packageJson.files, [
		"CHANGELOG.md",
		"CONTRIBUTING.md",
		"Fast.png",
		"LICENSE",
		"README.md",
		"README.zh.md",
		"SECURITY.md",
		"dist",
	]);
});
