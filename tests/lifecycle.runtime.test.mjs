import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { Rolldown } from "tsdown";

const virtualId = "\0fast-lifecycle-tests";
const bundle = await Rolldown.rolldown({
	input: virtualId,
	plugins: [
		{
			name: "lifecycle-test-entry",
			resolveId(id) {
				if (id === virtualId) return id;
			},
			load(id) {
				if (id !== virtualId) return;
				return `export * from ${JSON.stringify(fileURLToPath(new URL("../dist/index.mjs", import.meta.url)))}; export { createRenderer, defineComponent, getCurrentInstance, onBeforeMount, h, nextTick } from "vue";`;
			},
		},
	],
});
const generated = await bundle.generate({ format: "esm", codeSplitting: false });
await bundle.close();
const entry = generated.output.find((item) => item.type === "chunk" && item.isEntry);
if (!entry) throw new Error("Missing lifecycle test entry.");
const api = await import(`data:text/javascript;base64,${Buffer.from(entry.code).toString("base64")}`);
const renderer = api.createRenderer({
	createElement: (type) => ({ type, children: [] }),
	createText: (text) => ({ text }),
	createComment: (text) => ({ text }),
	insert(node, parent) {
		parent.children.push(node);
		node.parent = parent;
	},
	remove(node) {
		if (node.parent) node.parent.children = node.parent.children.filter((child) => child !== node);
	},
	setText(node, text) {
		node.text = text;
	},
	setElementText(node, text) {
		node.text = text;
	},
	parentNode: (node) => node.parent ?? null,
	nextSibling: () => null,
	patchProp() {},
});
function mountSetup(component, props = {}) {
	const wrapper = api.defineComponent({
		...component,
		setup(actualProps, context) {
			const instance = api.getCurrentInstance();
			api.onBeforeMount(() => {
				instance.render = () => null;
			});
			return component.setup(actualProps, context);
		},
	});
	const app = renderer.createApp(wrapper, props);
	const instance = app.mount({ children: [] });
	return { instance, unmount: () => app.unmount() };
}

test("real Vue button setup pairs concurrent Loading and ignores late completion after unmount", async (t) => {
	const show = api.useOverlay.show,
		hide = api.useOverlay.hide;
	let overlays = 0;
	api.useOverlay.show = () => {
		overlays++;
	};
	api.useOverlay.hide = () => {
		overlays--;
	};
	t.after(() => {
		api.useOverlay.show = show;
		api.useOverlay.hide = hide;
	});
	const { instance, unmount } = mountSetup(api.FaButton);
	const first = Promise.withResolvers(),
		second = Promise.withResolvers();
	const a = instance.doLoading(() => first.promise);
	const b = instance.doLoading(() => second.promise);
	await api.nextTick();
	assert.equal(instance.loading, true);
	// 手动任务结束不能关闭仍在执行的内部任务。
	instance.loading = true;
	instance.loading = false;
	assert.equal(instance.loading, true);
	first.resolve();
	await a;
	await api.nextTick();
	assert.equal(instance.loading, true);
	unmount();
	assert.equal(overlays, 0);
	second.resolve();
	await b;
	await api.nextTick();
	assert.equal(overlays, 0);
});

test("real Vue table setup cancels pending render and rejects late result state writes", async () => {
	let calls = 0;
	const started = Promise.withResolvers(),
		response = Promise.withResolvers();
	const { instance, unmount } = mountSetup(api.FaTable, {
		requestApi: async () => {
			calls++;
			started.resolve();
			return response.promise;
		},
	});
	// Wait for mounted auto-load, then ensure a scheduled explicit render settles on disposal.
	await started.promise;
	assert.equal(instance.setManualLoading, undefined);
	instance.loading = true;
	instance.loading = false;
	assert.equal(instance.loading, true);
	const scheduled = instance.doRender();
	unmount();
	await scheduled;
	response.resolve({ rows: [{ id: 1 }], totalRows: 1, pageIndex: 1, pageSize: 20 });
	await Promise.resolve();
	await api.nextTick();
	assert.equal(calls, 1);
	assert.deepEqual(instance.tableData, []);
});

test("FaTree forwards scalar initParam and merges search state into object queries", async () => {
	const cases = [
		["department-1", "department-1"],
		[0, 0],
		["", ""],
		[
			{ hospitalId: 1, searchValue: "old" },
			{ hospitalId: 1, searchValue: undefined },
		],
		[null, { searchValue: undefined }],
		[undefined, { searchValue: undefined }],
	];
	for (const [initParam, expected] of cases) {
		const requests = [];
		const { instance, unmount } = mountSetup(api.FaTree, {
			initParam,
			requestApi(params) {
				requests.push(params);
				return Promise.resolve([]);
			},
		});
		try {
			await instance.refresh();
			assert.deepEqual(requests, [expected, expected]);
		} finally {
			unmount();
		}
	}
});
