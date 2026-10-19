# Fast.Element.Plus 开发与发布

## 基线

- Node.js：`^22.18.0 || ^24.18.0`。
- pnpm：`^11.0.0`，不固定补丁版本。
- TypeScript 6、tsdown、ESLint 10 Flat Config、Prettier 3。
- 发布格式：包管理器使用 ESM、`.mjs` 与 `.d.ts`，CDN 使用压缩 IIFE；JavaScript 产物均提供 Source Map。
- 根目录是唯一 npm 发布单元，根 `dist/` 是唯一产物目录。
- 组件样式构建为 `dist/index.css` 与内嵌源码的 Source Map。

应用环境包括支持 ES2022 的现代浏览器、WebView、Vue `^3.5.11` 和 Element Plus `^2.14.5`。

## 安装与命令

```bash
corepack enable
pnpm install --frozen-lockfile
```

| 命令                | 用途                                                |
| ------------------- | --------------------------------------------------- |
| `pnpm dev`          | 使用 tsdown 监听源码并增量构建 JavaScript           |
| `pnpm build`        | 构建 ESM、全局类型、压缩 IIFE 和 CSS                |
| `pnpm typegen`      | 使用 TypeScript 生成完整 Vue TSX 公开声明           |
| `pnpm typecheck`    | 检查源码与构建配置类型                              |
| `pnpm lint`         | 运行零警告 ESLint                                   |
| `pnpm format:check` | 检查 Prettier                                       |
| `pnpm test:types`   | 验证公开消费者类型                                  |
| `pnpm test:runtime` | 验证根入口、组件、指令与 Hook 契约                  |
| `pnpm test:package` | 验证公开入口、声明、Source Map、CSS、归档和 Publint |
| `pnpm check`        | 运行统一质量门禁                                    |

组件用法与示例见[使用文档](https://docs.fastdotnet.cn/zh-CN/frontend/element-plus/)。文档维护者另行验证站点构建与示例；SDK 常规构建和测试不要求访问文档工程。

## 修改公共 API

新增或修改公共组件、指令、Hook、常量或类型时必须同步：

1. 在对应 `src/` 模块中定义实现和完整 TSDoc/JSDoc。
2. 从模块 `index.ts` 和根 `src/index.ts` 导出公共 API。
3. 需要全局注册的组件或指令同步更新安装器和 `src/global.ts`。
4. 增加源码类型、消费者类型、运行时和真实包测试。
5. 更新双语 README、API、运行时契约和 Changelog。

组件主题样式直接使用 Element Plus CSS Variables，不另行建立 Fast 通用主题变量，也不绑定只适用于浅色模式的固定颜色。Element Plus 没有对应变量的内部布局尺寸直接写在组件样式中；仓库已有、承担组件尺寸或状态契约的 `--fa-dialog-*`、`--fa-drawer-*`、`--fa-table-*`、`--width` 和 `--height` 继续保留，但不得将其扩展为通用主题变量。手机、平板响应式规则统一复用 `styles/common/breakpoints.scss`，涉及 `.el-*` 内部结构时还应纳入 Element Plus 升级核对。

公开注释说明用途、约束、默认值、单位、异步与失败语义。行内注释解释非直观的生命周期、状态同步、安全边界和兼容逻辑，不复述语法。保留仍然准确的已有注释。

## TypeScript 数据类型边界

- 已知业务模型优先通过泛型传递，不把具体结构退化为 `any` 或 `unknown`。
- SDK 无法预知且调用方需要直接读取的匿名业务数据允许使用 `any`，例如表格行、分页扩展字段、选择器与树节点附加数据、请求参数和动态配置。
- 未经验证的外部输入、错误对象、反射结果、浏览器全局对象和通用工具内部值继续使用 `unknown`，完成类型守卫后再访问。
- `@typescript-eslint/no-explicit-any` 保持启用；合理的 `any` 必须使用局部 ESLint 说明标明业务边界，不得全局关闭规则或连带关闭 `no-unsafe-*` 检查。
- 类型调整必须增加消费者类型测试，确认匿名数据可直接使用、显式泛型仍能约束字段，并且不改变运行时行为。

禁止在导入阶段访问 `window`、`document`、Fullscreen、Clipboard 或其他浏览器全局对象。平台能力应在调用阶段解析。

## 依赖与锁文件

- Vue、Element Plus、Element Plus Icons 和 Fast.Element.Plus.Icons 均为强制 Peer Dependency。
- Element Plus Icons 与 Fast.Element.Plus.Icons 同时作为本地开发依赖，发布产物保留静态外部引用，不内联其运行时代码。
- `dependencies` 中的 Runtime Dependency 由包管理器自动安装；ESM 只保留包名导入，不得在 `dist/node_modules` 复制依赖源码，CDN IIFE 继续内联这些依赖。
- `src/utils/` 只保留组件真实使用的内部工具，不从根入口导出，也不依赖 Fast.Utils。
- Runtime Dependency 必须证明无法由平台能力或现有依赖替代。
- 依赖升级后使用当前 pnpm 11 更新 Lockfile，并通过 Frozen Lockfile 安装与 Peer 检查。
- Element Plus 次版本号发生变化时，必须完整执行 [Element Plus 兼容性与升级核对](https://docs.fastdotnet.cn/zh-CN/frontend/element-plus/ELEMENT_PLUS_COMPATIBILITY)，完成后才能更新文档审计基线。
- 不混用 npm、Yarn 或不同 pnpm 主版本改写 Lockfile。
- ESLint 配置完整同步 Fast.ESLint.Config 的 Vue、TypeScript、JavaScript、Import、RegExp、JSON、Markdown、排序和 Prettier 规则，直接安装官方插件，不依赖 `@fast-china/eslint-config`。

## CI

CI 在 Node.js 22.18.0 与 24.18.0 上运行，使用 Frozen Lockfile，并执行 `pnpm check`。Node.js 24 任务还会检查 npm Pack Dry Run。不得通过关闭类型、Lint、测试、包检查或格式检查来修复门禁。

## 发布

仓库只采用人工发布流程，不声明或配置 OIDC Trusted Publishing：

1. 修改代码，并同步相关测试。
2. 调整根 `package.json` 的包版本，并同步 `src/version.ts` 与 `CHANGELOG.md`。
3. 对照该版本的源码与变更记录，核对并同步相关文档和示例，包括 Props、Events、Slots、Exposes、`v-model`、默认值、类型与行为。
4. 核对完成后，由文档维护者更新文档核对记录中的 `docReviewVersion`。该字段表示文档已按此组件库版本完成核对，不表示 API 的首次引入版本；即使正文无需修改也必须在人工核对后更新。
5. 执行 `pnpm test`，并由文档维护者完成站点构建和文档检查；文档自动检查只校验可稳定自动判断的版本、页面和引用关系，版本一致不代表全部文档语义正确。
6. 执行 `pnpm check`，并人工检查 `pnpm --config.ignore-scripts=true pack --dry-run` 清单。
7. 由维护者在可信环境执行 npm Publish，并创建对应 `v<version>` Tag。

固定流程为：修改代码 → 调整包版本 → 核对并同步相关文档 → 更新文档已核对版本 → 执行测试和文档构建。不得只修改 `docReviewVersion` 来绕过校验；无法可靠确定变更范围时，应扩大人工核对范围。

未经明确授权，不执行 Publish、Push、Tag 或 Release。npm 已发布版本不可覆盖；发布后缺陷必须通过新的 Patch 或 Pre-release 修复。
