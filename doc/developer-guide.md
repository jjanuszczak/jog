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

- application runtime: `Application`, `Page`
- base types: `Component`, `Control`, `Container`
- layout containers: `Panel`, `DockPanel`, `StackPanel`, `SectionPanel`, `Grid`
- windows: `Window`, `Dialog`
- controls: `Label`, `Button`, `TextBox`, `TextArea`, `CheckBox`, `RadioButton`, `DropDownList`, `ListBox`
- state: `Store`
- event payload type: `EventArgs`
- control-level validation state: `Invalid`, `ErrorText`, `SetError()`, `ClearError()`, `BindError()`
- application diagnostics: `Debug`, `DumpTree()`, `LogTree()`

Test entrypoint:

- `node test/run-v2-tests.js`

Example apps:

- [v2/example.html](/Users/johnjanuszczak/Projects/jog/v2/example.html)
- [v2/customer-admin.html](/Users/johnjanuszczak/Projects/jog/v2/customer-admin.html)
- [v2/form-demo.html](/Users/johnjanuszczak/Projects/jog/v2/form-demo.html)

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
- `app.DumpTree()`
- `app.LogTree()`

What `Debug = true` does today:

- logs dirty queue activity
- logs render and mount lifecycle work
- logs event dispatch with handler counts

What tree dump does:

- prints the current control hierarchy
- includes control type, control name or id, visible state, enabled state, lifecycle state, and basic size or position data when present

Typical usage:

```js
var app = new JOG.Application();
app.Debug = true;
app.Run(page);

console.log(app.DumpTree());
```

Use `LogTree()` when you just want the tree in the console without formatting it yourself.

## Tests

JOG V2 now has a small zero-dependency Node test harness.

Run it with:

```bash
node test/run-v2-tests.js
```

What it covers today:

- store subscription and unsubscribe behavior
- duplicate child name protection
- error binding and disposal behavior
- control tree dump output
- resizable window handle behavior

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

Use it for app shells, sidebars, top bars, and detail regions.

### SectionPanel

`SectionPanel` wraps content in a framed card with an optional title header and a padded body.

Use it to create visually separated regions such as forms, sidebars, summaries, and detail panels.

### Grid

`Grid` is the newest layout primitive. It uses CSS grid internally and is intended for desktop-style form layout.

Grid container properties:

- `Columns`
- `Rows`
- `ColumnGap`
- `RowGap`

Child placement properties:

- `GridColumn`
- `GridRow`
- `ColumnSpan`
- `RowSpan`

Current limitation: `Grid` is explicit placement only. There is no auto-layout engine, no named areas, and no higher-level row or column abstraction yet.

## Window and Dialog Model

`Window` is a container with a title bar and content area.

Current behaviors:

- absolute positioning
- draggable by title bar
- modal overlay support
- close button
- escape-to-close when enabled
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

When `Resizable = true`, the window shows a lower-right resize handle. Resize behavior currently respects `MinWidth` and `MinHeight`.

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

- `TextBox.BindText(store, key)`
- `TextArea.BindText(store, key)`
- `CheckBox.BindChecked(store, key)`
- `RadioButton.BindSelectedValue(store, key)`
- `DropDownList.BindSelectedValue(store, key)`
- `ListBox.BindSelectedValue(store, key)`

Binding is explicit and per-control. There is no expression language, selector syntax, derived store, or automatic form model.

## Validation Model

JOG now has a small control-level validation surface.

Available on components and controls:

- `Invalid`
- `ErrorText`
- `SetError(message)`
- `ClearError()`
- `BindError(store, key)`

What this does today:

- toggles invalid styling on supported input controls
- sets `aria-invalid`
- uses the error text as the control tooltip
- can bind a control's error state directly to a store key

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

You can also keep a separate summary key in the store when you want a page-level validation summary block above the form.

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

[v2/ExampleApp.js](/Users/johnjanuszczak/Projects/jog/v2/ExampleApp.js) demonstrates:

- page boot
- button and label usage
- opening a dialog

### Customer Admin App

[v2/CustomerAdminApp.js](/Users/johnjanuszczak/Projects/jog/v2/CustomerAdminApp.js) demonstrates:

- `DockPanel` shell layout
- `SectionPanel` regions
- inline store-driven updates
- modal dialog editing
- list/detail CRUD-style interaction

### Form Demo

[v2/FormApp.js](/Users/johnjanuszczak/Projects/jog/v2/FormApp.js) demonstrates:

- `Grid` form layout
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
- inline error labels driven by store state
- validation summary region driven by store state
- checkbox validation with invalid-state styling

## Guidance for Developers

- Prefer explicit JavaScript object composition over clever helper layers.
- Treat `v2/JOG.js` as the runtime truth.
- Treat `doc/v2-spec.md` as direction, not implementation truth.
- Update this guide, the API reference, and the roadmap whenever the framework changes.

## Known Gaps

Not implemented yet:

- theming API beyond built-in styles
- resize behavior for windows
- menus, tabs, grids for data, trees, toolbars
- diagnostics tooling
- automated tests

Partially implemented:

- validation exists at the control level, but there is no first-class form validation API yet
- inline error presentation is possible, but app code must render the error labels explicitly
