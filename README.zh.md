**简体中文** | [English](./README.md)

<p align="center">
	<img src="./Fast.png" width="128" alt="Fast.Element.Plus Logo" />
</p>

<h1 align="center">Fast.Element.Plus</h1>

<p align="center">
	<a href="https://www.npmjs.com/package/fast-element-plus"><img src="https://img.shields.io/npm/v/fast-element-plus?logo=npm" alt="npm version" /></a>
	<a href="https://www.npmjs.com/package/fast-element-plus"><img src="https://img.shields.io/npm/dm/fast-element-plus" alt="npm downloads" /></a>
	<a href="./LICENSE"><img src="https://img.shields.io/npm/l/fast-element-plus" alt="License" /></a>
</p>

基于 Vue 3 和 Element Plus 的业务组件 SDK，提供组件、指令、Hooks 与类型。

**[使用文档](https://docs.fastdotnet.cn/zh-CN/frontend/element-plus/) · [官方网站](https://fastdotnet.com)**

本库不是 Element Plus 的直接替代品；业务默认值、事件语义和数据交互遵循 Fast 约定。

## 环境要求

- 支持 ES2022 的现代浏览器或 WebView。
- Vue `^3.5.11`。
- Element Plus `^2.14.5`。
- Element Plus Icons `^2.3.2`。
- Fast.Element.Plus.Icons `^2.0.0`。

Vue、Element Plus、Element Plus Icons 和 Fast.Element.Plus.Icons 均为强制 Peer Dependency。两套图标包保持在构建产物之外。包管理器会自动安装正式 Runtime Dependency，ESM 构建保留这些外部导入，不再将其复制到 `dist/node_modules`；CDN IIFE 仍会内联依赖以支持浏览器直接使用。组件内部工具包含在 Fast.Element.Plus 构建产物中。

当前 Element Plus 人工审计基线为 `2.14.x`。当 Element Plus 次版本号发生变化，例如由 `2.14.x` 升级到 `2.15.x` 或更高时，必须重新核对封装涉及的原生 Props、Emits、Slots、Expose、默认值和内部样式结构，详见 [Element Plus 兼容性与升级核对](https://docs.fastdotnet.cn/zh-CN/frontend/element-plus/ELEMENT_PLUS_COMPATIBILITY)。

## 安装

```bash
pnpm add fast-element-plus vue element-plus @element-plus/icons-vue @fast-element-plus/icons-vue
```

## CDN

jsDelivr 入口为 `dist/index.global.min.js`。页面先加载 Vue、Element Plus、Element Plus Icons 和 Fast.Element.Plus.Icons，再通过 `globalThis.FastElementPlus` 访问组件库。样式需单独加载 `dist/index.css`。

| 资源                                         | jsDelivr                                                                            | unpkg                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `fast-element-plus/dist/index.global.min.js` | [jsDelivr](https://cdn.jsdelivr.net/npm/fast-element-plus/dist/index.global.min.js) | [unpkg](https://unpkg.com/fast-element-plus/dist/index.global.min.js) |
| `fast-element-plus/dist/index.css`           | [jsDelivr](https://cdn.jsdelivr.net/npm/fast-element-plus/dist/index.css)           | [unpkg](https://unpkg.com/fast-element-plus/dist/index.css)           |

```html
<!doctype html>
<html lang="zh-CN">
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
				render: () => Vue.h(globalThis.FastElementPlus.FaButton, { type: "primary" }, () => "按钮"),
			})
				.use(globalThis.FastElementPlus)
				.mount("#app");
		</script>
	</body>
</html>
```

## 快速开始

注册完整组件库：

```ts
import { createApp } from "vue";
import "element-plus/dist/index.css";
import FastElementPlus from "fast-element-plus";
import "fast-element-plus/style.css";
import App from "./App.vue";

createApp(App).use(FastElementPlus).mount("#app");
```

### 主题与响应式

Fast.Element.Plus 使用 Element Plus CSS Variables，并兼容其官方 `html.dark` 深色模式。需要深色模式时，在 Fast 样式之前额外导入官方深色变量：

```ts
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "fast-element-plus/style.css";

document.documentElement.classList.toggle("dark", isDark);
```

基础样式以 PC 为默认布局，并为手机（小于 `768px`）和平板（`768px` 至 `1199px`）提供弹窗、抽屉、表格、搜索表单、分页、树、选择器和上传区域的响应式规则。业务应用可通过 Element Plus CSS Variables 调整品牌色、表面、边框、阴影和间距。

也可以使用具名 API，由应用自行控制注册范围：

```ts
import { FaButton, FaTable, useOverlay, vCopy } from "fast-element-plus";

app.use(FaButton);
app.use(FaTable);
app.directive("copy", vCopy);

useOverlay.show();
```

如需全局组件和指令类型，在应用 `tsconfig.json` 中加入包类型入口：

```jsonc
{
	"compilerOptions": {
		"types": ["element-plus/global", "fast-element-plus/global"],
	},
}
```

## 公开模块

| 模块 | 公开 API                                                                                                                                                                                                                                                                                                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 组件 | `FaAvatar`、`FaButton`、`FaCarNumber`、`FaContextMenu`、`FaDialog`、`FaDrawer`、`FaForm`、`FaFormItem`、`FaFormItemTip`、`FaIcon`、`FaIconSelector`、`FaImage`、`FaInputDialogPage`、`FaLayoutGrid`、`FaLayoutGridItem`、`FaSelect`、`FaSelectOption`、`FaSelectPage`、`FaSelectV2`、`FaTable`、`FaTableColumn`、`FaTree`、`FaTreeSelect`、`FaUpload`、`FaUploadImage`、`FaUploadImages` |
| 指令 | `vCopy`、`vDebounce`、`vDraggable`、`vIconCopy`、`vLongpress`、`vThrottle`                                                                                                                                                                                                                                                                                                               |
| Hook | `useLoading`、`useOverlay`、`useScreenFull`                                                                                                                                                                                                                                                                                                                                              |
| 常量 | `FaMimeType`、`RegExps`                                                                                                                                                                                                                                                                                                                                                                  |
| 工具 | `Decimal`、`install`、`version`                                                                                                                                                                                                                                                                                                                                                          |

包根入口是唯一 JavaScript API 入口；`fast-element-plus/global` 提供 Vue 全局声明，`fast-element-plus/style.css` 提供组件样式。`dist/` 下的其他文件均为实现细节。

业务行、分页扩展字段、选择器与树节点附加数据、请求参数和动态配置在 SDK 无法预知应用模型时使用 `any`，已知模型可通过公开泛型约束；未经验证的运行时输入、错误对象和必须先收窄的值继续使用 `unknown`。`DefaultRow` 是 FaTable 默认公开行类型，可直接用于未预先定义字段的业务表格。

## 文档

- [组件文档与交互案例](https://docs.fastdotnet.cn/zh-CN/frontend/element-plus/components/overview)
- [安装与使用](https://docs.fastdotnet.cn/zh-CN/frontend/element-plus/guide/installation)
- [文档站构建与部署](https://docs.fastdotnet.cn/zh-CN/frontend/element-plus/guide/deployment)
- [API 参考](https://docs.fastdotnet.cn/zh-CN/frontend/element-plus/api/)
- [运行时契约](https://docs.fastdotnet.cn/zh-CN/frontend/element-plus/RUNTIME_CONTRACT)
- [Element Plus 兼容性与升级核对](https://docs.fastdotnet.cn/zh-CN/frontend/element-plus/ELEMENT_PLUS_COMPATIBILITY)
- [开发与发布指南](./docs/DEVELOPMENT_RELEASE.zh-CN.md)
- [贡献指南](./CONTRIBUTING.md)
- [安全策略](./SECURITY.md)
- [更新日志](./CHANGELOG.md)

## 开源协议

[Apache-2.0](./LICENSE)

## 版权、许可证与使用声明

版权所有 © 2018-Now 小方。本项目依据 [Apache License 2.0](./LICENSE) 开源；在遵守许可证的前提下，可以使用、修改和分发本软件，包括商业使用。

再分发时，应按许可证要求提供许可证副本、对修改的文件作出显著说明，并保留适用的版权和归属声明；包含需要保留的 NOTICE 信息时一并处理。本说明不替代正式许可证，也不额外要求在产品界面展示作者或项目标识。

使用者应就自身使用、二次开发、部署、数据处理及运营活动遵守适用法律和第三方合法权益，自行取得依法需要的授权。上述内容为合规提醒，不构成附加许可条件。

除适用法律另有规定或另有书面约定外，本软件按“原样”提供；保证排除与责任限制以许可证第 7、8 条为准。提供本项目不代表原作者为使用者的二次开发和运营活动背书，也不当然承担其对第三方作出的合同承诺。本说明不排除依法不得排除的责任。
