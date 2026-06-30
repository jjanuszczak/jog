# JOG V2 Developer Guide

## Status

This document describes the JOG V2 code that exists now under `v2/`. It is a living document and must be updated whenever the runtime or example apps change.

## What JOG V2 Is

JOG V2 is a browser UI runtime for developers who want to build front ends in straight JavaScript using controls, containers, windows, dialogs, state, and events instead of writing HTML or touching the DOM directly.

The authoring model is explicit:

- create controls with `new`
- set properties directly
- compose with `Add`
- handle events with `OnX` methods such as `OnClick` and `OnChange`
- bind input controls to a `JOG.Store`

JOG owns rendering, DOM creation, styling injection, and event wiring.

## What Exists Today

Implemented public surface in `v2/JOG.js`:

- theme API: `JOG.SetTheme()`, `JOG.GetTheme()`, `JOG.Theme`, `Application.Theme`
- application runtime: `Application`, `Page`
- base types: `Component`, `Control`, `Container`
- layout containers: `Panel`, `DockPanel`, `StackPanel`, `SectionPanel`, `Grid`
- windows: `Window`, `Dialog`
- controls: `Label`, `ValidationMessage`, `ValidationSummary`, `Button`, `TextBox`, `TextArea`, `CheckBox`, `RadioButton`, `DropDownList`, `ListBox`
- state: `Store`
- event payload type: `EventArgs`
- control-level validation state: `Invalid`, `ErrorText`, `SetError()`, `ClearError()`, `BindError()`, `ValidationMessage`, `ValidationSummary`
- application diagnostics: `Debug`, `DumpTree()`, `LogTree()`

Test entrypoint:

- `node test/run-v2-tests.js`

Example apps:

- [v2/hello-world.html](../v2/hello-world.html)
- [v2/example.html](../v2/example.html)
- [v2/customer-admin.html](../v2/customer-admin.html)
- [v2/form-demo.html](../v2/form-demo.html)
- [v2/opportunity-board.html](../v2/opportunity-board.html)

Distribution build:

- source runtime at [v2/JOG.js](../v2/JOG.js)
- minified browser artifact at `dist/JOG.min.js`
- source map at `dist/JOG.min.js.map`
- starter release bundle at `dist/starter/`

## Application Model

The normal boot pattern is:

```js
var app = new JOG.Application();
var page = new JOG.Page();

page.Title = "My App";
page.Add(someControl);

app.Run(page);
```

`Application.Run(page)` attaches the runtime to `document.body`, injects framework styles, attaches the page to the runtime, marks the page dirty, and flushes the initial render.

`Page` is the root container. It also sets `document.title` from `page.Title`.

When the application starts, JOG also resets the browser's default document margin and padding so the page root can own the full viewport surface consistently.

Direct children added to `Page` now use normal flow layout by default. That means a plain `Label`, `Button`, or `SectionPanel` added directly to the page will render like a normal block in document flow. `Window` and `Dialog` still render with absolute positioning so desktop-style floating surfaces continue to work.

Smallest runnable example in this repo:

```js
var app = new JOG.Application();
var page = new JOG.Page();
var helloLabel = new JOG.Label();

page.Title = "Hello World";
helloLabel.Text = "Hello world from JOG.";

page.Add(helloLabel);

app.Run(page);
```

See [v2/HelloWorldApp.js](../v2/HelloWorldApp.js) and [v2/hello-world.html](../v2/hello-world.html).

## Theme Model

JOG now exposes a small public theme API instead of relying only on hardcoded built-in styling.

Global theme usage:

```js
JOG.SetTheme({
  colors: {
    appBackground: "#f8f5ef",
    primary: "#7c3f00",
    primaryText: "#fff7ed"
  },
  typography: {
    fontFamily: "\"IBM Plex Sans\", Arial, sans-serif"
  }
});
```

Per-application overrides:

```js
var app = new JOG.Application();

app.Theme = {
  colors: {
    primary: "#0f766e",
    primaryText: "#f0fdfa"
  }
};
```

Behavior implemented now:

- global themes merge with built-in defaults
- `Application.Theme` merges over the global theme for that app only
- the runtime applies resolved values through CSS custom properties on the page root
- the modal overlay is also themed even though it renders outside the page subtree

Supported theme groups today:

- `colors`
- `typography`
- `radius`
- `spacing`
- `shadow`

## Install Model

JOG V2 is currently a direct browser runtime, not an npm-installed application framework.
Npm packaging is intentionally deferred until the current release-asset automation proves insufficient.

The practical install story today is:

1. treat GitHub Releases as the primary distribution channel for browser-ready artifacts
2. ship `v2/JOG.js` as a readable development build, or ship `dist/JOG.min.js` as a release build
3. include the runtime with a `<script>` tag
4. load app code that constructs controls and calls `Application.Run(page)`

Generate the minified distribution with:

```bash
npm install
npm run build:release
```

This currently writes:

- `dist/JOG.min.js`
- `dist/JOG.min.js.map`
- `dist/starter/index.html`
- `dist/starter/StarterApp.js`
- `dist/release/JOG.min.js`
- `dist/release/JOG.min.js.map`
- `dist/release/jog-starter-index.html`
- `dist/release/jog-starter-app.js`

The `dist/release/` files are the exact assets that should be attached to GitHub Releases today. The current release process is documented in [doc/release-guide.md](release-guide.md), and the upload step is automated in [release-artifacts.yml](../.github/workflows/release-artifacts.yml).

This is the appropriate release packaging model for the current state of the project. It keeps the browser delivery story simple while the runtime API continues to evolve, and now includes a minimal starter bundle you can copy and rename.

## Control Model

Every control is a JavaScript object with internal state. State changes do not write to the DOM immediately. Instead:

1. a property setter updates the control state
2. the runtime marks the control dirty
3. the runtime flushes dirty controls in a microtask
4. each control applies current state to its DOM node

This is the core architectural shift from V1. It separates control state from direct DOM mutation.

## Diagnostics

JOG now has a small built-in diagnostics layer on `Application`.

Available surface:

- `app.Debug = true`
- `app.DebugTopics = ["event", "lifecycle"]`
- `app.DumpTree()`
- `app.DumpTree({ detailed: true })`
- `app.LogTree()`
- `app.LogTree({ detailed: true })`

What `Debug = true` does today:

- logs dirty queue activity
- logs render and mount lifecycle work
- logs event dispatch with handler counts

What `DebugTopics` does today:

- optionally limits debug logging to selected categories
- accepted categories are `dirty`, `flush`, `lifecycle`, and `event`
- accepts an array such as `["event", "lifecycle"]` or a comma-separated string such as `"event,lifecycle"`

What runtime error formatting does today:

- reports render failures with the control name and stack when available
- reports event handler failures with the control name, event name, handler index, and stack when available
- rethrows the original error after logging it

What tree dump does:

- prints the current control hierarchy
- includes control type, control name or id, visible state, enabled state, lifecycle state, and basic size or position data when present
- detailed mode also includes richer state such as title, text, placeholder, dock, grid coordinates, span, invalid state, error text, and child counts when relevant

Typical usage:

```js
var app = new JOG.Application();
app.Debug = true;
app.DebugTopics = ["event", "lifecycle"];
app.Run(page);

console.log(app.DumpTree());
console.log(app.DumpTree({ detailed: true }));
```

Use `LogTree()` when you just want the tree in the console without formatting it yourself. Pass `{ detailed: true }` when you need a richer state dump.

## Tests

JOG V2 now has a small zero-dependency Node test harness.

Run it with:

```bash
node test/run-v2-tests.js
```

What it covers today:

- store subscription and unsubscribe behavior
- duplicate child name protection
- setter normalization and disposed-control lifecycle guards
- error binding and disposal behavior
- remove and clear disposal behavior
- control tree dump output
- richer window resize behavior
- modal stacking and window lifecycle events
- example-level integration flows for customer-admin selection, dialog editing, alternate dialog close paths, and form validation/reset bindings

This is intentionally lightweight. It does not replace browser-level verification, but it does give the repo a fast regression check for core runtime behavior.

## Layout Model

JOG V2 currently supports three useful layout styles and one low-level container.

### Panel

`Panel` is the simplest container. It uses absolute positioning for child controls unless the child is inside a flow-layout container higher up.

Use it when you need explicit `Left` and `Top` placement.

### StackPanel

`StackPanel` is a flex-based flow container.

- `Orientation = "vertical"` or `"horizontal"`
- `Gap` or `Spacing` controls item spacing
- `Responsive` can switch orientation and spacing by breakpoint

Use it for simple linear layouts, toolbars, vertical forms, and button rows.

### DockPanel

`DockPanel` is the closest current equivalent to a desktop-style shell layout.

Children can set:

- `Dock = "top"`
- `Dock = "bottom"`
- `Dock = "left"`
- `Dock = "right"`
- `Dock = "fill"`

The container also respects container `Padding` and child `Margin`.

Responsive dock behavior can now be driven through inherited `ResponsiveLayout` on the container and its children. This is the current way to collapse a left sidebar into a top region on smaller widths.

Use it for app shells, sidebars, top bars, and detail regions.

### SectionPanel

`SectionPanel` wraps content in a framed card with an optional title header and a padded body.

Use it to create visually separated regions such as forms, sidebars, summaries, and detail panels.

### Grid

`Grid` is the newest layout primitive. It uses CSS grid internally and is intended for desktop-style form layout.

Grid container properties:

- `Columns`
- `Rows`
- `Areas`
- `AutoRows`
- `AutoFlow`
- `ColumnGap`
- `RowGap`
- `Responsive`

Child placement properties:

- `GridColumn`
- `GridRow`
- `GridArea`
- `ColumnSpan`
- `RowSpan`
- `ResponsiveGrid`

Breakpoint keys implemented now:

- `base`
- `sm` at `640px`
- `md` at `768px`
- `lg` at `1024px`
- `xl` at `1280px`

Example:

```js
formGrid.Responsive = {
  base: { columns: ["1fr"] },
  md: { columns: ["160px", "1fr"] }
};

nameInput.ResponsiveGrid = {
  base: { column: 1, row: 2 },
  md: { column: 2, row: 1 }
};
```

Component-level layout changes can also use `ResponsiveLayout`:

```js
sidebar.ResponsiveLayout = {
  base: { dock: "top", height: 220, margin: { bottom: 16 } },
  md: { dock: "left", width: 270, margin: { top: 0, right: 24, bottom: 0, left: 0 } }
};
```

Current limitation: `Grid` now supports explicit placement, named areas, automatic row sizing, and breakpoint-based responsive overrides, while `StackPanel` and `DockPanel` now support narrower responsive behavior. There is still no higher-level layout abstraction or container-query model.

## Window and Dialog Model

`Window` is a container with a title bar and content area.

Current behaviors:

- absolute positioning
- modal overlay support
- stacked modal overlay support across multiple visible dialogs
- draggable by title bar
- close button
- escape-to-close when enabled
- load, show, hide, and close lifecycle hooks
- z-index stacking through the runtime

`Dialog` is a `Window` that defaults `Modal = true`.

Useful window properties today:

- `Title`
- `Modal`
- `Draggable`
- `Resizable`
- `CloseButtonVisible`
- `CloseButtonText`
- `CloseOnEscape`
- `Width`, `Height`, `MinWidth`, `MinHeight`
- `Left`, `Top`

When `Resizable = true`, the window can be resized from edges and corners. Resize behavior currently respects `MinWidth` and `MinHeight`.

## Theme Presets

JOG now has a small built-in preset surface on `ThemePreset`.

Implemented presets today:

- `Button`: `primary`, `danger`, `quiet`
- `Label`: `primary`, `strong`
- `SectionPanel`: `primary`, `muted`

Example:

```js
saveButton.ThemePreset = "primary";
deleteButton.ThemePreset = "danger";
sidebar.ThemePreset = "primary";
titleLabel.ThemePreset = "strong";
```

This is intentionally narrow. It gives app code a stable presentation layer without opening arbitrary per-control style objects yet.

## Store and Binding Model

`JOG.Store` is intentionally small.

```js
var store = new JOG.Store({
  name: "Atlas Bio",
  active: true
});
```

Available store methods:

- `Get(key)`
- `Set(key, value)`
- `Subscribe(key, listener)`

`Subscribe` returns an unsubscribe function. Control bindings register these unsubscribers and clean them up on `Dispose()`.

Current explicit binding helpers:

- `Label.BindText(store, key, formatter)`
- `ValidationMessage.BindMessage(store, key, formatter)`
- `ValidationSummary.BindSummary(store, key, formatter)`
- `ValidationSummary.BindErrors(store, keys, formatter)`
- `TextBox.BindText(store, key)`
- `TextArea.BindText(store, key)`
- `CheckBox.BindChecked(store, key)`
- `RadioButton.BindSelectedValue(store, key)`
- `DropDownList.BindSelectedValue(store, key)`
- `ListBox.BindSelectedValue(store, key)`
- `Component.BindVisible(store, key, transform)`

Binding is explicit and per-control. There is no expression language, selector syntax, derived store, or automatic form model.

## Validation Model

JOG now has a small control-level validation surface.

Available on components and controls:

- `Invalid`
- `ErrorText`
- `SetError(message)`
- `ClearError()`
- `BindError(store, key)`
- `BindVisible(store, key, transform)`

What this does today:

- toggles invalid styling on supported input controls
- sets `aria-invalid`
- uses the error text as the control tooltip
- can bind a control's error state directly to a store key
- can bind page-level summary and inline error visibility directly to a store key
- provides small first-class validation display controls for inline messages and summary blocks

What it does not do:

- it does not provide a form validator DSL
- it does not render inline error text automatically
- it does not manage validation timing for you

The intended usage is explicit. App code decides when validation runs, stores error messages where useful, and can show inline error labels beside controls.

The recommended pattern now is:

1. keep error strings in the store
2. call `control.BindError(store, "someErrorKey")`
3. have validation code set or clear that store key
4. render inline error labels only where you want them

You can also keep a separate summary key in the store when you want a page-level validation summary block above the form. When your summary is just a composition of field-level error strings, `ValidationSummary.BindErrors(store, ["nameError", "statusError"])` removes that extra summary-store wiring while keeping validation timing in app code.

For radio-group validation, bind the error key to the `StackPanel` that owns the radio buttons. The built-in invalid styling now propagates from that row container to the radio captions.

## Events

Controls expose event registration methods instead of raw DOM listeners.

Current event registration rule:

- use `OnX(listener)` as the standard documented style
- shorthand aliases such as `Click(listener)` and `Change(listener)` remain supported for compatibility
- `Focus()` is reserved for imperative browser focus, so focus event registration uses `OnFocus(listener)`

Current event methods on `Control`:

- `Click(listener)`
- `Change(listener)`
- `OnFocus(listener)`
- `Blur(listener)`
- `KeyDown(listener)`
- `KeyUp(listener)`
- `OnClick(listener)`
- `OnChange(listener)`
- `OnBlur(listener)`
- `OnKeyDown(listener)`
- `OnKeyUp(listener)`

Window-specific:

- `OnLoad(listener)`
- `OnShow(listener)`
- `OnHide(listener)`
- `OnClose(listener)`

Events receive a `JOG.EventArgs` instance with:

- `Source`
- `Type`
- `OriginalEvent`
- `Handled`
- `Value` when applicable
- `Key` when applicable

Current limitation: the shorthand and `OnX` styles both still exist. The runtime now treats `OnX` as the preferred public style, while the older shorthand remains as a compatibility layer.

## Lifecycle and Rendering

Important lifecycle states in the current runtime:

- `Created`
- `Shown`
- `Hidden`
- `Disposed`

Calling `Dispose()`:

- unsubscribes store bindings
- removes the DOM node
- disposes children for containers

Calling setters on a disposed control throws.

## Current Example Coverage

### Example App

[v2/ExampleApp.js](../v2/ExampleApp.js) demonstrates:

- page boot
- button and label usage
- opening a dialog

### Customer Admin App

[v2/CustomerAdminApp.js](../v2/CustomerAdminApp.js) demonstrates:

- `DockPanel` shell layout
- `SectionPanel` regions
- inline store-driven updates
- modal dialog editing
- list/detail CRUD-style interaction

### Form Demo

[v2/FormApp.js](../v2/FormApp.js) demonstrates:

- `Grid` form layout
- breakpoint-based responsive `Grid` layout
- text input binding
- dropdown binding
- checkbox binding
- radio group binding
- list box binding
- textarea binding
- computed summary updates from store subscriptions
- explicit save-time validation
- invalid control styling
- `BindError()` for field-level invalid state
- `Label.BindText()` and `BindVisible()` for reusable page-level validation wiring
- inline error labels driven by store state
- validation summary region driven either by a dedicated store key or directly from multiple field error keys
- checkbox and radio-group validation with invalid-state styling

[v2/CustomerAdminApp.js](../v2/CustomerAdminApp.js) now also demonstrates:

- one shared validation routine reused across inline save and modal save
- field-level error binding on text inputs in both page and dialog contexts
- summary-level validation messaging reused across multiple save entry points
- live revalidation after an invalid edit begins to be corrected

[v2/ExampleApp.js](../v2/ExampleApp.js) now also demonstrates:

- switching the public theme API at runtime between the built-in default and two distinct palettes
- opening one modal dialog directly
- opening a second modal on top of the first
- verifying that the shared overlay stays between the top modal and lower modal windows

[v2/OpportunityBoardApp.js](../v2/OpportunityBoardApp.js) now also demonstrates:

- breakpoint-aware dialog form layout inside the opportunity editor
- responsive `DockPanel` shell behavior for the board sidebar
- responsive `StackPanel` action rows
- built-in `ThemePreset` usage on buttons, labels, and sections

## Guidance for Developers

- Prefer explicit JavaScript object composition over clever helper layers.
- Treat `v2/JOG.js` as the runtime truth.
- Treat `doc/v2-spec.md` as direction, not implementation truth.
- Update this guide, the API reference, and the roadmap whenever the framework changes.

## Known Gaps

Not implemented yet:

- menus, tabs, grids for data, trees, toolbars
- richer diagnostics tooling beyond debug logging and tree dumps
- accessibility pass

Partially implemented:

- theming is now public and token-based, and built-in theme presets exist, but arbitrary per-control style objects are still not implemented
- validation exists at the control level, but there is no first-class form validation API yet
- inline error presentation is possible, but app code must render the error labels explicitly
- responsive layout helpers now exist for `Grid`, and in narrower form for `StackPanel` and `DockPanel`, but not for `SectionPanel`
