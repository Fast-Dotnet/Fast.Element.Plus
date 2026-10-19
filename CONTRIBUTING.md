# Contributing to Fast.Element.Plus

Thank you for improving Fast.Element.Plus. Contributions should preserve a predictable Vue component API, explicit Element Plus behavior, and reproducible package output.

## Requirements

- Node.js `^22.18.0 || ^24.18.0`
- pnpm `^11.0.0` through Corepack
- Git with LF line endings

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
```

Use `pnpm dev` when a long-running tsdown watch build is useful during implementation.
Review component usage and examples in the [documentation](https://docs.fastdotnet.cn/zh-CN/frontend/element-plus/).

## Design rules

- Keep the repository root as the only npm package and `dist/` as the only publication output.
- Preserve the documented root, global-type, and style entries.
- Reuse existing components, directives, hooks, constants, and `src/utils/` helpers before adding another abstraction.
- Keep Vue and Element Plus external to package-manager builds; icon implementations and internal utilities remain bundled.
- Do not access `window` or `document` during module import; resolve browser capabilities only when an API is called.
- Avoid new runtime dependencies unless the platform and existing dependency set cannot provide the behavior safely.
- Keep component state instance-local unless a documented global UI facility intentionally owns shared state.

## Public API and comments

Every public component, function, type, interface, method, property, option, prop, emit, slot, and exposed member must include TSDoc/JSDoc covering the applicable items:

- purpose and non-obvious design rationale;
- parameters, defaults, accepted ranges, and units;
- return values, asynchronous behavior, and failure semantics;
- Vue, Element Plus, browser, accessibility, and package-entry constraints;
- a focused example when the signature alone is insufficient.

Line comments must explain intent, constraints, lifecycle ordering, or compatibility behavior. Preserve useful existing comments. Do not translate syntax into prose, repeat the type signature, or add comments only to increase volume. Keep Chinese source comments clear and keep identifiers, package names, and API casing unchanged.

## Tests

- Add a regression test for every defect.
- Add compile-only cases to `tests/public-api.test.ts` for public type behavior.
- Keep runtime tests deterministic and independent of real network, credentials, timers, and user data.
- Update both README files, API references, runtime contract, and tests when public behavior changes.

Run the narrowest relevant command during development, then run the full set before opening a pull request:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
pnpm --config.ignore-scripts=true pack --dry-run
```

## Documentation review

Use one release flow: change code → update the package version → review and synchronize affected documentation → update the reviewed documentation version → run tests and the documentation build.

Documentation maintainers record the reviewed package version as `docReviewVersion`. It means the documentation has been checked against that package version; it is not the version in which a component or property was introduced. Before updating it, compare the release changes with source and verify the affected Props, Events, Slots, Exposes, `v-model` contracts, defaults, types, behavior, and examples. Update the field after the review even when no documentation text needs to change. If the change scope is uncertain, widen the review instead of assuming that no documentation update is required.

The documentation validation workflow checks the package/documentation version match, public component API-page coverage, required API references, and Markdown example paths. These stable checks do not prove that every semantic description or example is correct, so never update only `docReviewVersion` to make the test pass.

## Dependencies

Development tools use reviewed caret ranges and are resolved exactly by `pnpm-lock.yaml`. Before changing a dependency:

1. verify Node.js, Vue, Element Plus, and peer requirements;
2. review public type and runtime effects;
3. update only the pnpm lock file and relevant manifests;
4. run type, lint, test, build, package, peer, and dry-run checks;
5. avoid unrelated upgrades in the same pull request.

This repository defines its own ESLint Flat Config and must not depend on `@fast-china/eslint-config`.

## Pull requests

- Keep the diff focused and avoid repository-wide formatting unrelated to the change.
- Update English and Chinese docs for user-visible behavior.
- Add a dated `CHANGELOG.md` entry only when preparing a release.
- Describe component API, runtime, type, style, accessibility, security, and size impact.
- Never include credentials, private endpoints, private assets, or production data.
- Do not publish, tag, push, or deploy from a contribution workflow.

## Security reports

Do not open a public issue for a suspected vulnerability. Follow [SECURITY.md](./SECURITY.md).
