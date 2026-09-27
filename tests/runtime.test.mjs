import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { Rolldown } from "tsdown";

// 组件库面向浏览器打包器；测试将开发环境中可解析的运行时依赖打入第二阶段测试包。
const bundle = await Rolldown.rolldown({ input: fileURLToPath(new URL("../dist/index.mjs", import.meta.url)) });
const generated = await bundle.generate({ format: "esm", codeSplitting: false });
await bundle.close();
const entry = generated.output.find((item) => item.type === "chunk" && item.isEntry);
if (entry?.type !== "chunk") throw new Error("Runtime bundle did not produce an entry chunk.");
const library = await import(`data:text/javascript;base64,${Buffer.from(entry.code).toString("base64")}`);
const FastElementPlus = library.default;
const { isEqual, omit, pick } = await import("../dist/utils/object/index.mjs");

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

test("object utilities select keys and compare supported values", () => {
	const symbolKey = Symbol("symbolKey");
	const source = { visible: 1, hidden: 2, [symbolKey]: 3 };
	assert.deepEqual(pick(source, ["visible", symbolKey]), { visible: 1, [symbolKey]: 3 });
	assert.deepEqual(omit(source, ["hidden"]), { visible: 1, [symbolKey]: 3 });

	assert.equal(isEqual({ nested: [1, { value: Number.NaN }] }, { nested: [1, { value: Number.NaN }] }), true);
	assert.equal(isEqual(Object(Symbol.for("same")), Object(Symbol.for("same"))), true);
	assert.equal(isEqual(new Date("2026-09-12"), new Date("2026-09-12")), true);
	assert.equal(isEqual(new Map([[{ id: 1 }, new Set(["a", "b"])]]), new Map([[{ id: 1 }, new Set(["b", "a"])]])), true);
	assert.equal(isEqual({ value: 1 }, { value: 2 }), false);

	const leftCycle = {};
	const rightCycle = {};
	leftCycle.self = leftCycle;
	rightCycle.self = rightCycle;
	assert.equal(isEqual(leftCycle, rightCycle), true);
});

test("root entry exposes the documented plugin, components, directives, and hooks", () => {
	assert.equal(library.version, packageJson.version);
	assert.equal(FastElementPlus.version, packageJson.version);
	assert.equal(FastElementPlus.install, library.install);
	assert.equal("FastElementPlus" in library, false);

	for (const componentName of ["FaButton", "FaDialog", "FaTable", "FaTableColumn", "FaTree", "FaUpload"]) {
		const component = library[componentName];
		assert.equal(typeof component, "object");
		assert.equal(typeof component.install, "function");
	}

	for (const componentName of ["TableColumnsSettingDialog", "TablePagination", "TableSearchForm", "TableSearchFormItem"]) {
		const component = library.FaTable[componentName];
		assert.equal(typeof component, "object");
		assert.match(component.name, /^FaTable/u);
	}

	for (const directiveName of ["vCopy", "vDebounce", "vDraggable", "vIconCopy", "vLongpress", "vThrottle"]) {
		const directive = library[directiveName];
		assert.equal(typeof directive, "object");
		assert.equal(typeof directive.install, "function");
	}

	assert.equal(typeof library.useLoading.show, "function");
	assert.equal(typeof library.useOverlay.hide, "function");
	assert.equal(typeof library.useScreenFull, "object");
	assert.equal(typeof library.useScreenFull.toggle, "function");
});

test("FaTable installs its documented related components", () => {
	const components = new Map();
	const directives = new Map();
	const app = {
		component(name, component) {
			if (component === undefined) return components.get(name);
			components.set(name, component);
			return app;
		},
		directive(name, directive) {
			if (directive === undefined) return directives.get(name);
			directives.set(name, directive);
			return app;
		},
	};

	library.FaTable.install(app);
	assert.deepEqual(
		[...components.keys()],
		["FaTable", "FaTableColumn", "FaTableColumnsSettingDialog", "FaTablePagination", "FaTableSearchForm", "FaTableSearchFormItem"]
	);
});

test("table utility resolves nested prop paths used by built-in column renderers", () => {
	const row = { profile: { details: { name: "Nested value" } } };

	assert.equal(library.tableUtil.handleRowAccordingToProp(row, "profile.details.name"), "Nested value");
	assert.equal(library.tableUtil.handleRowAccordingToProp(row, "profile.missing.name"), undefined);
	assert.deepEqual(
		[{ profile: { score: 20 } }, { profile: { score: 10 } }].sort(
			library.tableUtil.arrayDynamicSort([{ enField: "profile.score", mode: "ascending" }])
		),
		[{ profile: { score: 10 } }, { profile: { score: 20 } }]
	);
});
