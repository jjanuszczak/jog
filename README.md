# JavaScript Object GUI ("JOG")

JOG is a JavaScript-first browser UI framework aimed at developers who want a desktop-style programming model for front ends.

The core idea is simple:

- write straight JavaScript
- do not write app HTML
- do not manipulate the DOM directly
- build UIs from controls, containers, windows, dialogs, state, and events

The active implementation is `v2/`.

## Current Status

JOG V2 is functional and actively evolving. It already includes:

- application and page bootstrapping
- controls such as `MenuBar`, `ToolBar`, `StatusBar`, `TabControl`, `DataGrid`, `Label`, `ValidationMessage`, `ValidationSummary`, `Button`, `TextBox`, `TextArea`, `CheckBox`, `RadioButton`, `DropDownList`, and `ListBox`
- layout containers such as `Panel`, `DockPanel`, `WorkspaceShell`, `StackPanel`, `SectionPanel`, and `Grid`
- repeated collection-backed layouts through `Repeater`
- breakpoint-aware responsive overrides for `Grid`
- responsive layout helpers for `StackPanel`, `DockPanel`, and `WorkspaceShell`, including shell-owned sidebar layout wiring
- dialogs and windows with dragging, stacked modal behavior, and lower-right resizing
- explicit store-based binding plus first-pass collection state
- explicit store-based binding plus derived store, collection-to-store, and form-state helpers
- control-level validation state
- public theme API with global and per-app token overrides
- built-in theme presets for selected control types
- first-pass third-party control registration, compatibility checks, style-block registration, extension lifecycle hooks, and a stable window-shell helper for third-party dialogs
- external-library proof controls through `ChartJOG.BarChart`, `FlatpickrJOG.DatePicker`, `LexicalJOG.LexicalPlainTextBox`, and `LexicalJOG.LexicalRichTextBox`, wrapping a visualization, a popup date picker, and plain-text and rich-text editor surfaces behind JOG-native control contracts
- runtime diagnostics
- a zero-dependency Node test runner
- a minified browser distribution build at `dist/JOG.min.js`

It is not feature-complete. The roadmap in [doc/roadmap.md](doc/roadmap.md) is the living source for what is next.

## Repo Layout

- [v2](v2): active implementation tree
- `v2/runtime/`: framework runtime source
- `v2/apps/`: first-party example application scripts
- `v2/packages/`: browser-ready third-party control packages
- `v2/packages-src/`: source for bundled third-party packages that wrap external libraries
- `v2/examples/`: browser entry HTML files for the examples
- [test](test): Node-based regression checks
- [doc](doc): living documentation
- [v1](v1): earlier implementation kept for reference
- [ref](ref): older reference material and experiments

## License

JOG is available under the [MIT License](LICENSE).

## Where To Start

If you are new to the project, read these in order:

1. [doc/developer-guide.md](doc/developer-guide.md)
2. [doc/api-reference.md](doc/api-reference.md)
3. [doc/roadmap.md](doc/roadmap.md)
4. [AGENTS.md](AGENTS.md)

The developer guide explains the runtime model. The API reference documents what exists now. The roadmap tells you what is implemented, what is partial, and what should happen next.

JOG now includes a first-pass public third-party control API. The current contract and remaining direction are documented in [doc/third-party-control-spec.md](doc/third-party-control-spec.md).

## Pre-Release Status

JOG is close to a public pre-release, but it should still be treated as pre-release software.

What that means today:

- the framework is usable for early internal-tool evaluation
- the core programming model is implemented and documented
- the release artifact flow is in place
- some areas are still intentionally partial, especially shell-control keyboard depth, broader accessibility hardening, and long-term stability guarantees for newer extension surfaces

If you try JOG now, the right expectation is an early technical preview, not a finished general-purpose frontend platform.

## Running The Examples

Open these files directly in a browser:

- [v2/examples/hello-world.html](v2/examples/hello-world.html)
- [v2/examples/example.html](v2/examples/example.html)
- [v2/examples/notepad.html](v2/examples/notepad.html)
- [v2/examples/customer-admin.html](v2/examples/customer-admin.html)
- [v2/examples/form-demo.html](v2/examples/form-demo.html)
- [v2/examples/opportunity-board.html](v2/examples/opportunity-board.html)
- [v2/examples/third-party-demo.html](v2/examples/third-party-demo.html)

What they cover:

- `hello-world.html`: the smallest runnable JOG app, one page and one label
- `example.html`: small runtime sanity check, first `MenuBar`, `ToolBar`, `StatusBar`, and `TabControl` usage, default-versus-custom theme switching, stacked modal dialogs, resize behavior
- `notepad.html`: multi-document notepad shell with a docked menu, docked status bar, responsive editor area, browser file open and save flows, and one document per tab
- `customer-admin.html`: CRUD-style page shell with shared inline and dialog validation, using the shared workspace shell primitive
- `form-demo.html`: form layout, responsive grid collapse, explicit store binding, derived summary wiring, `FormState` validation orchestration, inline errors, and radio-group invalid state
- `opportunity-board.html`: CRM-style opportunity board using `Collection` plus `DataGrid` for row selection, edit and delete commands, dirty-state tracking, sortable, filterable, and inline-editable grid views, derived summaries, collection-to-store binding helpers, `Repeater`-driven sidebar rows, first-pass resizable columns, a bounded flexible notes column for wider datasets, and the shared workspace shell primitive
- `third-party-demo.html`: sample `AcmeJOG`, `BeaconJOG`, `ChartJOG`, `FlatpickrJOG`, and `LexicalJOG` packages showing primitive, composite, dialog, visualization, and external-library-backed controls built outside the core runtime source

## Installing JOG Today

JOG does not have an npm runtime package yet, and it is intentionally deferred while the current release-asset automation remains sufficient.

Today, the install model is direct browser usage, with GitHub Releases as the primary distribution channel for browser-ready artifacts.

1. download the latest release artifacts from GitHub Releases, or build them locally
2. copy `dist/JOG.min.js` into your project for the minified release build, or copy [v2/runtime/JOG.js](v2/runtime/JOG.js) for a readable source build
3. optionally start from the files in `dist/starter/`
4. load any third-party JOG control packages after the runtime
5. load your app code after the runtime and any third-party packages

Example:

```html
<script src="JOG.min.js"></script>
<script src="acme-jog-controls.js"></script>
<script src="flatpickr-jog-controls.js"></script>
<script src="lexical-jog-controls.js"></script>
<script src="MyApp.js"></script>
```

If you want to generate the release artifacts locally:

```bash
npm install
npm run build:release
```

This writes:

- `dist/JOG.min.js`
- `dist/JOG.min.js.map`
- `dist/starter/index.html`
- `dist/starter/StarterApp.js`
- `dist/release/JOG.min.js`
- `dist/release/JOG.min.js.map`
- `dist/release/jog-starter-index.html`
- `dist/release/jog-starter-app.js`

The `dist/starter/` folder is the current starter release bundle. It is meant to be copied as a small working starting point alongside `JOG.min.js`.

The current manual release process is documented in [doc/release-guide.md](doc/release-guide.md).

GitHub Release uploads are now automated with [.github/workflows/release-artifacts.yml](.github/workflows/release-artifacts.yml).

The safest way to evaluate JOG today is:

- start with the bundled examples
- use the generated release assets from `dist/release/`
- treat third-party extensibility as real but still early
- expect some API and ergonomics tightening before a broader public launch

## Running Tests

Run the current regression suite with:

```bash
node test/run-v2-tests.js
```

The current suite is lightweight and intentionally dependency-free. It covers core runtime behavior that should not regress while the framework continues to move.

## Diagnostics

JOG V2 includes a small built-in diagnostics layer.

Typical usage:

```js
var app = new JOG.Application();
app.Debug = true;
app.DebugTopics = ["event", "lifecycle"];
app.Run(page);

console.log(app.DumpTree());
console.log(app.DumpTree({ detailed: true }));
app.LogTree();
```

`Debug = true` enables console logging for dirty queue work, render and mount lifecycle activity, and event dispatch. `DebugTopics` can narrow that to categories such as `event`, `lifecycle`, `dirty`, and `flush`. Runtime render and event failures now log structured `[JOG][Error][...]` diagnostics before rethrowing. `DumpTree()` and `LogTree()` expose the current control tree, and `DumpTree({ detailed: true })` adds richer state when you need it.

## Development Rules

This repo treats docs as part of the product.

If you want to help, start with [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

When you change `v2/`:

- update [doc/developer-guide.md](doc/developer-guide.md) if the programming model changed
- update [doc/api-reference.md](doc/api-reference.md) if the public surface changed
- update [doc/roadmap.md](doc/roadmap.md) so status and next steps stay accurate
- update [doc/release-guide.md](doc/release-guide.md) if the release contents or process changed
- run `npm run build:release` if the browser distribution should be refreshed for release

Do that in the same change as the code.

## Project Direction

JOG is not trying to beat React as a general frontend platform.

The nearer target is narrower and more practical:

- internal tools
- line-of-business applications
- form-heavy systems
- CRUD-style interfaces
- developers who prefer a control-and-container mental model over a markup-first one

That direction is described in more detail in [doc/v2-spec.md](doc/v2-spec.md).
