[简体中文](./README.zh.md) | **English**

<p align="center">
	<img src="./Fast.png" width="128" alt="Fast.Element.Plus Logo" />
</p>

<h1 align="center">Fast.Element.Plus</h1>

<p align="center">
	<a href="https://www.npmjs.com/package/fast-element-plus"><img src="https://img.shields.io/npm/v/fast-element-plus?logo=npm" alt="npm version" /></a>
	<a href="https://www.npmjs.com/package/fast-element-plus"><img src="https://img.shields.io/npm/dm/fast-element-plus" alt="npm downloads" /></a>
	<a href="./LICENSE"><img src="https://img.shields.io/npm/l/fast-element-plus" alt="License" /></a>
</p>

A Vue 3 and Element Plus business-component SDK with components, directives, hooks and types.

**[Documentation](https://docs.fastdotnet.cn/en-US/frontend/element-plus/) · [Official website](https://fastdotnet.com)**

This SDK is not a drop-in replacement for Element Plus; business defaults, event semantics and data flows follow Fast conventions.

## Requirements

- ES2022 modern browsers or WebViews.
- Vue `^3.5.11`.
- Element Plus `^2.14.5`.
- Element Plus Icons `^2.3.2`.
- Fast.Element.Plus.Icons `^2.0.0`.

Vue, Element Plus, Element Plus Icons, and Fast.Element.Plus.Icons are required peer dependencies. Both icon packages remain external to the build. Package managers install declared runtime dependencies automatically, and the ESM build keeps those imports external instead of copying them into `dist/node_modules`; the CDN IIFE bundles them for direct browser use. Component-only utilities are included in the Fast.Element.Plus build.

The current manually audited Element Plus baseline is `2.14.x`. When the Element Plus minor version changes, for example from `2.14.x` to `2.15.x` or later, native Props, Emits, Slots, exposed methods, defaults, and internal style structures must be audited again. See [Element Plus compatibility and upgrade audit](https://docs.fastdotnet.cn/en-US/frontend/element-plus/ELEMENT_PLUS_COMPATIBILITY).

## Install

```bash
pnpm add fast-element-plus vue element-plus @element-plus/icons-vue @fast-element-plus/icons-vue
```

## CDN

The jsDelivr entry uses `dist/index.global.min.js`. Load Vue, Element Plus, Element Plus Icons, and Fast.Element.Plus.Icons first, then access the library as `globalThis.FastElementPlus`. Load `dist/index.css` separately.

| Resource                                     | jsDelivr                                                                            | unpkg                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `fast-element-plus/dist/index.global.min.js` | [jsDelivr](https://cdn.jsdelivr.net/npm/fast-element-plus/dist/index.global.min.js) | [unpkg](https://unpkg.com/fast-element-plus/dist/index.global.min.js) |
| `fast-element-plus/dist/index.css`           | [jsDelivr](https://cdn.jsdelivr.net/npm/fast-element-plus/dist/index.css)           | [unpkg](https://unpkg.com/fast-element-plus/dist/index.css)           |

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<title>Fast Element Plus</title>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/element-plus@2.14.5/dist/index.css" />
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fast-element-plus/dist/index.css" />
	</head>
	<body>
		<div id="app"></div>
		<script src="https://cdn.jsdelivr.net/npm/vue@3.5.11/dist/vue.global.prod.js"></script>
		<script src="https://cdn.jsdelivr.net/npm/element-plus@2.14.5/dist/index.full.min.js"></script>
		<script src="https://cdn.jsdelivr.net/npm/@element-plus/icons-vue@2.3.2/dist/index.iife.min.js"></script>
		<script src="https://cdn.jsdelivr.net/npm/@fast-element-plus/icons-vue/dist/index.global.min.js"></script>
		<script src="https://cdn.jsdelivr.net/npm/fast-element-plus/dist/index.global.min.js"></script>
		<script>
			Vue.createApp({
				render: () => Vue.h(globalThis.FastElementPlus.FaButton, { type: "primary" }, () => "Button"),
			})
				.use(globalThis.FastElementPlus)
				.mount("#app");
		</script>
	</body>
</html>
```

## Quick start

Register the complete component library:

```ts
import { createApp } from "vue";
import "element-plus/dist/index.css";
import FastElementPlus from "fast-element-plus";
import "fast-element-plus/style.css";
import App from "./App.vue";

createApp(App).use(FastElementPlus).mount("#app");
```

### Theme and responsive layout

Fast.Element.Plus uses Element Plus CSS Variables and supports its official `html.dark` dark mode. Import the official dark variables before the Fast styles when dark mode is required:

```ts
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "fast-element-plus/style.css";

document.documentElement.classList.toggle("dark", isDark);
```

Desktop is the base layout. Responsive rules cover phones below `768px` and tablets from `768px` through `1199px`, including dialogs, drawers, tables, search forms, pagination, trees, selectors, and upload areas. Applications may customize branding, surfaces, borders, shadows, and spacing through Element Plus CSS Variables.

Or import named APIs and let the application control registration:

```ts
import { FaButton, FaTable, useOverlay, vCopy } from "fast-element-plus";

app.use(FaButton);
app.use(FaTable);
app.directive("copy", vCopy);

useOverlay.show();
```

For global component and directive types, add the package type entry to the application `tsconfig.json`:

```jsonc
{
	"compilerOptions": {
		"types": ["element-plus/global", "fast-element-plus/global"],
	},
}
```

## Component example

After the full installation above, use the button in a page:

```vue
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
	<FaButton :disabled-loading="true" @click="count++">{{ count }}</FaButton>
</template>
```

When using internal loading for asynchronous work, finish through the click `done` callback or the exposed `doLoading()` contract.

## Public modules

| Module     | Public APIs                                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Components | `FaAvatar`, `FaButton`, `FaCarNumber`, `FaContextMenu`, `FaDialog`, `FaDrawer`, `FaForm`, `FaFormItem`, `FaFormItemTip`, `FaIcon`, `FaIconSelector`, `FaImage`, `FaInputDialogPage`, `FaLayoutGrid`, `FaLayoutGridItem`, `FaSelect`, `FaSelectOption`, `FaSelectPage`, `FaSelectV2`, `FaTable`, `FaTableColumn`, `FaTree`, `FaTreeSelect`, `FaUpload`, `FaUploadImage`, `FaUploadImages` |
| Directives | `vCopy`, `vDebounce`, `vDraggable`, `vIconCopy`, `vLongpress`, `vThrottle`                                                                                                                                                                                                                                                                                                               |
| Hooks      | `useLoading`, `useOverlay`, `useScreenFull`                                                                                                                                                                                                                                                                                                                                              |
| Constants  | `FaMimeType`, `RegExps`                                                                                                                                                                                                                                                                                                                                                                  |
| Utilities  | `Decimal`, `install`, `version`                                                                                                                                                                                                                                                                                                                                                          |

The package root is the only JavaScript API entry. `fast-element-plus/global` provides Vue global declarations, and `fast-element-plus/style.css` provides the component styles. Files under `dist/` are implementation details.

Open-ended business rows, paging extensions, selector/tree payloads, request parameters, and dynamic configuration use `any` where the SDK cannot know the application schema; exported generics can constrain known models. Untrusted runtime inputs, errors, and values that require validation remain `unknown`. `DefaultRow` is the public default FaTable row type for business tables whose fields are not declared in advance.

## Documentation

- [Component documentation and interactive examples (Chinese)](https://docs.fastdotnet.cn/en-US/frontend/element-plus/components/overview)
- [Installation guide (Chinese)](https://docs.fastdotnet.cn/en-US/frontend/element-plus/guide/installation)
- [Documentation build and deployment (Chinese)](https://docs.fastdotnet.cn/en-US/frontend/element-plus/guide/deployment)
- [API reference](https://docs.fastdotnet.cn/en-US/frontend/element-plus/api/)
- [Runtime contract](https://docs.fastdotnet.cn/en-US/frontend/element-plus/RUNTIME_CONTRACT)
- [Element Plus compatibility and upgrade audit](https://docs.fastdotnet.cn/en-US/frontend/element-plus/ELEMENT_PLUS_COMPATIBILITY)
- [Development and release guide (Chinese)](./docs/DEVELOPMENT_RELEASE.zh-CN.md)
- [Contributing](./CONTRIBUTING.md)
- [Security policy](./SECURITY.md)
- [Changelog](./CHANGELOG.md)

## Copyright, license and use

Copyright © 2018-Now 小方. This project uses [Apache License 2.0](./LICENSE). Use, modification, distribution and commercial use are permitted subject to its terms.

When redistributing, provide the license, mark modified files and preserve applicable copyright, attribution and supplied NOTICE information as required. This summary does not replace the license or impose additional UI attribution.

Users are responsible for the legal compliance and authorization of their own modifications, deployment, data processing and operations. This reminder is not an additional license condition.

Except as required by applicable law or agreed in writing, the software is provided on an "AS IS" basis. Sections 7 and 8 govern warranty disclaimers and liability limits. Providing the project does not endorse downstream activities or assume users' contractual commitments. This statement does not exclude liability that cannot lawfully be excluded.
