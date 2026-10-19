# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and releases should follow [Semantic Versioning](https://semver.org/).

## [2.0.26] - 2026-10-20

### Changed

- Default `ElInputNumber` text alignment to `left` when the package root is imported, while preserving explicit per-instance `align` values and the existing `controls: false` default.
- Reorder SCSS declarations and simplify redundant nesting without changing selector scope or component styling.

### Documentation and Tooling

- Use HTTPS for the official website and documentation links in package metadata and repository documents.
- Synchronize the bilingual Element Plus defaults documentation and runtime contract with the new input-number alignment default.

## [2.0.25] - 2026-10-19

### Fixed

- Keep `FaTable` expansion content horizontally sticky, remove the expanded cell's default padding, and move wrapper styles into the stylesheet with a configurable `--fa-table-expand-width` (default `100cqw`).
- Scope table, dialog and drawer structural styles to their own elements; support table headers in both fixed and auto layouts without styling nested tables.
- Apply table date-range popper styles after Teleport, including the compact size, and let mobile search controls override compact desktop widths.
- Let responsive icon-selector popper widths override Element Plus's inline automatic width.
- Restore compact detail-form spacing, limit twinkle animation to the direct child, and remove obsolete internal table styles and duplicate form rules.
- Keep drawer resize handles inside the clipped body and increase their desktop hit area to 8px; suppress custom loading animation and component size transitions when reduced motion is requested.

### Changed

- Organize component styles around existing `fa-*` namespaces with shallow nesting for related elements and states, merge repeated selectors within the same scope, consolidate size variants into local CSS variables, and use internal table/tree hooks instead of repeated Element Plus DOM chains.
- Use ordinary component scopes for internal overrides and states; reserve context specificity reduction for long structural boundaries and overridable table defaults. Retain standalone Teleport namespaces and remove unused Sass imports and the unused desktop mixin.
- Target dialog/drawer scrollbar views and every built-in table-image branch through dedicated classes, replacing three contextual `:where()` selectors without increasing specificity.
- Use parent selectors for same-element states and pseudo-elements while keeping standalone component element names explicit. Standardize runtime size classes on hyphenated suffixes, including `fa-form-detail-small`, and remove legacy underscore classes and compatibility selectors.

### Documentation and Tooling

- Document the shared SCSS organization, naming, spacing, specificity and validation conventions in `AGENTS.md`; normalize spacing between style rules without changing compiled CSS.

## [2.0.24] - 2026-10-18

### Fixed

- Size `FaTable` expansion content to its main container with `100cqw` and border-box sizing, independently of the total column width.
- Apply 16px padding to expansion content, reduced to 12px for the `small` component size.

## [2.0.23] - 2026-10-17

### Added

- Add a dedicated `FaTable` `expand` slot with row, column, row index and table context; supplying the slot creates a fixed-left expansion column.
- Add `selectionColumn` (default `false`) and `indexColumn` (default `true`) to control the built-in selection and index columns independently.

### Changed

- Render enabled utility columns in expansion, selection and index order before business columns; include expansion columns in grouped-row merging and shared column styles.
- Remove `selection`, `index` and `expand` from `FaTableColumnType`. Move expansion content to `FaTable`'s `expand` slot and use the table props for selection and index columns. Existing tables must explicitly enable `selection-column` to retain checkboxes.
- Require Element Plus `^2.14.7` and update the development Fast icon dependency to `^2.0.3`.

## [2.0.22] - 2026-10-07

### Fixed

- Correct internal `pick` and `omit` return types for dynamic key arrays while retaining precise tuple inference.
- Use a compatible own-property check in deep equality and keep clipboard handling scoped to browser APIs, including the legacy copy fallback.

### Changed

- Use English errors in internal utilities and Vue helpers without changing error types or failure conditions.
- Normalize API documentation and clarify table, upload and validation contracts.

## [2.0.21] - 2026-09-27

### Fixed

- Resolve nested `prop` paths consistently for default, date/time, numeric, link, tag, enum and image table columns, including local sorting.

## [2.0.20] - 2026-09-22

### Fixed

- Keep independent Loading ownership for concurrent button/table tasks and external/manual states; stale completions cannot release another task.
- Cancel delayed table work on unmount, invalidate stale request results immediately on rerender and disconnect ResizeObserver through actual watchEffect cleanup.
- Prefer current remote option labels while retaining out-of-page selections, and clear stale selector caches after reset/context changes.
- Release debounce/throttle timers on directive unmount; preserve the throttle unlock timer across extra events and callback errors.
- Track FaButton overlay ownership so initial false state, duplicate completion and unmount do not close another component's overlay.

### Documentation and Tooling

- Admit Icons 2.x and the corrected 3.x through the peer range; the installer continues registering `fa-icon-*` by public export keys. Locked development dependencies remain unchanged.
- Correct localized Fast.Docs links and retain minimal README examples.
- Align public-contract comments and agent guidance.
- Keep ESLint and Prettier skill-file ignores separate and add regression checks.

## [2.0.19] - 2026-09-16

### Changed

- Made `FaUploadImage` `width` and `height` size only the image frame; the tip now uses the outer available width below the frame, so the component's total height includes the tip.

### Fixed

- Confined the `FaUploadImage` loading mask to the image frame when a form stretches the outer component to the full row width.
- Aligned `FaUpload` trigger and `FaUploadImages` add-card styling with and without drag-and-drop, with width constraints for narrow containers.
- Added a preview page covering normal and loading states for all three upload components with drag-and-drop enabled or disabled, plus the full-width form case.

## [2.0.18] - 2026-09-15

### Changed

- Disabled drag-and-drop upload by default for `FaUploadImage`; callers can still enable it with `drag`.

## [2.0.17] - 2026-09-12

### Changed

- Expanded the applicable base, Vue SFC, and Vue JSX/TSX rules from Fast.ESLint.Config 2.1.8 directly in the repository's single `eslint.config.mjs`, adding only the required Vue parser and plugin dependencies.
- Reworked component state derived from props into existing immediate watchers or computed values so drawers, selectors, trees, tables, forms, and responsive layout gaps remain reactive.
- Standardized TSX setup ordering for state, computed values, methods, watchers, lifecycle hooks, rendering, and exposed members; migrated DOM and component references to explicitly typed `shallowRef` bindings; and adopted `useModel` and watcher cleanup where their contracts preserve existing behavior.
- Replaced the remaining direct VueUse event-listener usage with matching Vue lifecycle registration and cleanup, removing the package's direct `@vueuse/core` dependency.
- Replaced Lodash predicates and object helpers with native checks and local `isEqual`, `pick`, and `omit` utilities, removing the package's direct Lodash-family dependencies.
- Added a dedicated `Rank` drag handle and touch-only activation delay to the table column settings dialog so scrolling does not unintentionally reorder rows.
- Replaced the inferred Avatar `object-fit` declaration with an equivalent local type and removed the package's direct `csstype` dependency.
- Updated documentation examples and VitePress helpers for current Promise, type-safety, serialization, and regular-expression checks.
- Standardized responsive layout API names to `FaLayoutGridBreakpoint`, `breakpoint`, and `breakpointChange`, and standardized selector and tree data events to `dataChange`; the previous spellings were removed as requested.

### Compatibility

- Preserved the published `visible-change` and `node-click` event names, with reasoned single-line ESLint exemptions for these established Element Plus event names.

## [2.0.16] - 2026-09-11

### Changed

- Updated form validation failures to reject with Element Plus `invalidFields` details instead of `false`, while unmounted forms continue to reject with an `Error`.
- Enforced the fixed `multiple` contracts of `FaUploadImage` and `FaUploadImages` through runtime prop validation.
- Synchronized the TSX and TypeScript ESLint rules without changing the component package runtime dependencies.

## [2.0.15] - 2026-09-11

### Changed

- Reused the public loading controls inside `FaButton.handleLoading` and updated the icon package and development toolchain dependencies.

### Fixed

- Prevented height-only `FaTable` container changes, such as an Android soft keyboard opening, from recalculating column widths and temporarily disabling the focused keyword search input.

## [2.0.14] - 2026-09-10

### Changed

- Restricted `FaUploadImage` to a `string | null` model and fixed it to single-file selection.

### Fixed

- Prevented upload validation from cancelling valid `FaUpload` requests before Element Plus synchronizes its file list.
- Validated file type and size when files are selected in manual-upload mode, and kept only the newly successful file in single-file mode.
- Preserved existing upload-file metadata while synchronizing URL models and derived new file names from the final URL path without query parameters or fragments.

## [2.0.13] - 2026-09-04

### Changed

- Tightened mainland China mobile-number validation and expanded email validation to support standard local-part characters and general top-level domains.
- Added medium-password, six-digit verification-code, and four-character image-CAPTCHA regular expressions, and disallowed whitespace in medium and strong passwords.

## [2.0.12] - 2026-09-03

### Changed

- Updated `formUtil.validate` and `formUtil.validateScrollToField` to reject with `false` on validation failure instead of an `Error`. This also applies to `FaForm.validate()` without a callback and `FaForm.validateScrollToField()`; unmounted forms still reject with an `Error`.

## [2.0.11] - 2026-09-01

### Fixed

- Restricted Table date-range panel fallback placement to the vertical axis so it retains the original downward positioning behavior when space permits.

## [2.0.10] - 2026-09-01

### Changed

- Updated public API type tests to resolve source entries independently of existing build declarations.
- Aligned Fast package aliases and type-only imports with the repository import grouping rules.

### Fixed

- Kept the Table search form at two columns below 480 pixels so fields and actions remain usable in narrow containers.

## [2.0.9] - 2026-09-01

### Fixed

- Allowed Table column identifiers to use either numeric or string values.

## [2.0.8] - 2026-09-01

### Changed

- Standardized Select, SelectPage, SelectV2, and TreeSelect model updates around the native `update:modelValue` contract while retaining the enriched `change(data, value)` event.
- Kept selector labels as derived `v-model:label` state instead of coupling them to custom `change` handlers.
- Restored InputDialogPage and Tree `change` events with their original row and node data payloads without coupling them to model synchronization.
- Restored Upload `onChange(uploadFile, uploadFiles)` to the Element Plus callback contract; uploaded URL changes are now reported only through `update:modelValue`.

### Fixed

- Corrected TreeSelect multiple selection so array values are preserved and node clicks no longer fabricate selection changes.
- Prevented duplicated selector events and restored native single-select popup closing behavior.
- Removed duplicate Upload file-list writes, preserved array models when clearing multiple uploads, and kept FaUploadImages output typed as an array even when file selection is restricted to one item.
- Forwarded Tree node clicks without suppressing keyless nodes.

## [2.0.7] - 2026-08-31

### Fixed

- Routed TreeSelect node clicks through the Element Plus internal selection bridge so single-select popups close after selection while multiple-select popups remain open.
- Restored V1-compatible responsive Table search columns on narrow screens and kept reset and refresh buttons at their natural width.
- Corrected the remote Table search parameters, icon and Table examples, and added TreeSelect single-select request and label synchronization coverage.

## [2.0.6] - 2026-08-31

### Fixed

- Migrated controlled Pagination and Popover state to TSX `v-model` bindings, eliminating repeated ElPagination deprecated-usage warnings while preserving remote page loading and visibility cleanup.

## [2.0.5] - 2026-08-31

### Fixed

- Aligned blank fill colors with overlay backgrounds in dialogs, drawers, and table cards to prevent nested component background differences.
- Removed the table search border transition to prevent temporary light or dark border flashes while showing or hiding it.

## [2.0.4] - 2026-08-31

### Fixed

- Restored caller-controlled item, dialog, drawer, table, tree, and upload dimensions without responsive minimum-size overrides.
- Restored the `FaDrawer` opening and closing transform transition.
- Restored Element Plus theme-controlled border colors for tables, trees, popovers, drawers, and upload variants.
- Corrected `FaUploadImage` width and height handling and restored Element Plus picture-card sizing for `FaUploadImages`.

## [2.0.3] - 2026-08-31

### Fixed

- Forwarded only configured search, cell, and `headerSlot` slots from `FaTable` to generated child components.
- Restored table date parsing and V1-compatible local sorting for comparable non-number values.
- Returned `Promise` from asynchronous public loading and Dialog/Drawer methods so callback errors remain available to callers.
- Restored `undefined` as the default `FaTree` “全部” value.
- Restored expose-only visibility control for `FaDialog` and `FaDrawer`; external `v-model` values no longer open or close them.

## [2.0.2] - 2026-08-29

### Changed

- Relaxed open-ended business data types for tables, pagination, selectors, trees, context menus, request parameters, and dynamic configuration while preserving `unknown` at untrusted runtime boundaries.
- Added generic selector and tree payload types, precise selection change payloads, and consumer type tests for anonymous-data defaults.
- Renamed the public table row type from `FaTableRow` to `DefaultRow` and removed redundant internal forwarding exports for Element Plus tree types.

## [2.0.1] - 2026-08-28

### Changed

- Externalized declared runtime dependencies from the ESM build so package managers resolve the installed dependency graph without copying third-party modules into `dist/node_modules`; the CDN IIFE remains self-contained.

### Removed

- Removed the redundant named `FastElementPlus` component namespace export; components remain available as tree-shakable named exports and the default export remains the complete Vue plugin.

## [2.0.0] - 2026-08-28

### Added

- Added one typed ESM package entry for 26 Vue components, 6 directives, 3 browser UI hooks, constants, Decimal, and the complete application plugin.
- Added Vue global component and directive declarations through `fast-element-plus/global`.
- Added a separately minified CDN IIFE and a documented `fast-element-plus/style.css` entry.
- Added strict type checking, local ESLint Flat Config, formatting checks, runtime tests, consumer type tests, package-contract tests, Publint, and Node.js 22/24 CI.
- Added synchronized English and Chinese README and API references, runtime contract, contribution guidance, security policy, and development/release instructions.
- Standardized repository-root publishing with one `package.json` and one root `dist/` directory.
- Added an Element Plus `2.14.x` compatibility audit that checks native runtime Props and Emits and blocks unreviewed minor-version upgrades.
- Added public Slot type exports and missing native events, Slots, and exposed methods for Form, Image, Tree, TreeSelect, SelectV2, and Table wrappers.
- Added phone, tablet, and desktop responsive styles that follow Element Plus light/dark CSS Variables directly.

### Changed

- Established the TypeScript 6 and tsdown build pipeline.
- Organized source code under `src/` and component styles under `styles/`.
- Merged declaration generation into the root `tsconfig.json`.
- Synchronized the complete applicable Fast.ESLint.Config rule set in the repository-local Flat Config while retaining explanatory Chinese comments.
- Kept Vue, Element Plus, and both required icon implementations as external runtime peers, and moved the required Fast.Utils behavior into non-public `src/utils/` modules.
- Documented Fast.Element.Plus as an officially open-source Fast business SDK rather than a drop-in Element Plus replacement.
- Applied Element Plus default Props and MessageBox shortcut enhancements during root-module evaluation while keeping only CSS declared as a package side effect.
- Preserved Fast default Props and MessageBox shortcut conventions while preventing caller option mutation and duplicate completion; MessageBox `beforeClose` callbacks close by default after settling.
- Made remote Select, SelectPage, SelectV2, TreeSelect, Tree, and Table data loading resistant to stale request results.
- Improved upload request configuration, concurrent loading state, native custom requests, removal hooks, and model synchronization.
- Improved Dialog and Drawer model synchronization, accessibility, resizing, and cleanup while preserving Fast asynchronous `open` and `close` event semantics without duplicate native forwarding.
- Restored the pre-Element Plus 2.14 empty `ElInput` clearable layout for Table, Tree, SelectPage, and dynamic Table search fields so hidden clear icons do not reserve space.
- Scoped Table styles and added responsive IconSelector styling.
- Improved dialogs, drawers, tables, forms, trees, selectors, car-number input, images, and uploads for dark mode, touch input, and narrow viewports.

[2.0.26]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.25...v2.0.26
[2.0.25]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.24...v2.0.25
[2.0.24]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.23...v2.0.24
[2.0.23]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.22...v2.0.23
[2.0.22]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.21...v2.0.22
[2.0.21]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.20...v2.0.21
[2.0.20]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.19...v2.0.20
[2.0.19]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.18...v2.0.19
[2.0.18]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.17...v2.0.18
[2.0.17]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.16...v2.0.17
[2.0.16]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.15...v2.0.16
[2.0.15]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.14...v2.0.15
[2.0.14]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.13...v2.0.14
[2.0.13]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.12...v2.0.13
[2.0.12]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.11...v2.0.12
[2.0.11]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.10...v2.0.11
[2.0.10]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.9...v2.0.10
[2.0.9]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.8...v2.0.9
[2.0.8]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.7...v2.0.8
[2.0.7]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.6...v2.0.7
[2.0.6]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.5...v2.0.6
[2.0.5]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.4...v2.0.5
[2.0.4]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.3...v2.0.4
[2.0.3]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.2...v2.0.3
[2.0.2]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.1...v2.0.2
[2.0.1]: https://gitee.com/FastDotnet/fast.element.plus/compare/v2.0.0...v2.0.1
[2.0.0]: https://gitee.com/FastDotnet/fast.element.plus/releases/tag/v2.0.0
