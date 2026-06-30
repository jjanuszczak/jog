# JOG

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
- controls such as `MenuBar`, `ToolBar`, `StatusBar`, `TabControl`, `Label`, `ValidationMessage`, `ValidationSummary`, `Button`, `TextBox`, `TextArea`, `CheckBox`, `RadioButton`, `DropDownList`, and `ListBox`
- layout containers such as `Panel`, `DockPanel`, `StackPanel`, `SectionPanel`, and `Grid`
- breakpoint-aware responsive overrides for `Grid`
- responsive layout helpers for `StackPanel` and `DockPanel`
- dialogs and windows with dragging, stacked modal behavior, and lower-right resizing
- explicit store-based binding
- control-level validation state
- public theme API with global and per-app token overrides
- built-in theme presets for selected control types
- runtime diagnostics
- a zero-dependency Node test runner
- a minified browser distribution build at `dist/JOG.min.js`

It is not feature-complete. The roadmap in [doc/roadmap.md](doc/roadmap.md) is the living source for what is next.

## Repo Layout

- [v2](v2): active runtime and example apps
- [test](test): Node-based regression checks
- [doc](doc): living documentation
- [v1](v1): earlier implementation kept for reference
- [ref](ref): older reference material and experiments

## Where To Start

If you are new to the project, read these in order:

1. [doc/developer-guide.md](doc/developer-guide.md)
2. [doc/api-reference.md](doc/api-reference.md)
3. [doc/roadmap.md](doc/roadmap.md)
4. [AGENTS.md](AGENTS.md)

The developer guide explains the runtime model. The API reference documents what exists now. The roadmap tells you what is implemented, what is partial, and what should happen next.

## Running The Examples

Open these files directly in a browser:

- [v2/hello-world.html](v2/hello-world.html)
- [v2/example.html](v2/example.html)
- [v2/customer-admin.html](v2/customer-admin.html)
- [v2/form-demo.html](v2/form-demo.html)
- [v2/opportunity-board.html](v2/opportunity-board.html)

What they cover:

- `hello-world.html`: the smallest runnable JOG app, one page and one label
- `example.html`: small runtime sanity check, first `MenuBar`, `ToolBar`, `StatusBar`, and `TabControl` usage, default-versus-custom theme switching, stacked modal dialogs, resize behavior
- `customer-admin.html`: CRUD-style page shell with shared inline and dialog validation
- `form-demo.html`: form layout, responsive grid collapse, explicit store binding, reusable validation summary wiring, inline errors, radio-group invalid state
- `opportunity-board.html`: CRM-style opportunity rows with add, edit, delete, modal record editing, a responsive editor form, and a responsive board shell

## Installing JOG Today

JOG does not have an npm runtime package yet, and it is intentionally deferred while the current release-asset automation remains sufficient.

Today, the install model is direct browser usage, with GitHub Releases as the primary distribution channel for browser-ready artifacts.

1. download the latest release artifacts from GitHub Releases, or build them locally
2. copy `dist/JOG.min.js` into your project for the minified release build, or copy [v2/JOG.js](v2/JOG.js) for a readable source build
3. optionally start from the files in `dist/starter/`
4. load your app code after the runtime

Example:

```html
<script src="JOG.min.js"></script>
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
