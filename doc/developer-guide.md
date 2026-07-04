# JOG V2 Developer Guide

## Status

This document describes the JOG V2 code that exists now under `v2/`. It is a living document and must be updated whenever the runtime or example apps change.

Current `v2/` layout:

- `v2/runtime/`: framework runtime source
- `v2/apps/`: first-party example application scripts
- `v2/packages/`: sample third-party control packages
- `v2/examples/`: browser entry HTML files for the examples

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

Implemented public surface in `v2/runtime/JOG.js`:

- theme API: `JOG.SetTheme()`, `JOG.GetTheme()`, `JOG.Theme`, `Application.Theme`
- browser helpers: `JOG.Browser.OpenTextFile()`, `JOG.Browser.SaveTextFile()`
- application runtime: `Application`, `Page`
- base types: `Component`, `Control`, `Container`
- layout containers: `Panel`, `DockPanel`, `WorkspaceShell`, `SplitPanel`, `StackPanel`, `Repeater`, `SectionPanel`, `Grid`
- shell controls: `MenuBar`, `ToolBar`, `StatusBar`, `PageHeader`, `TabControl`, `TabPage`
- windows: `Window`, `Dialog`
- controls: `DataGrid`, `Label`, `ValidationMessage`, `ValidationSummary`, `Button`, `TextBox`, `TextArea`, `CheckBox`, `RadioButton`, `DropDownList`, `ListBox`
- state: `Store`, `Collection`, `FormState`
- event payload type: `EventArgs`
- control-level validation state: `Invalid`, `ErrorText`, `SetError()`, `ClearError()`, `BindError()`, `ValidationMessage`, `ValidationSummary`
- application diagnostics: `Debug`, `DumpTree()`, `LogTree()`
- third-party extensibility: `JOG.Version`, `JOG.RegisterControl()`, `JOG.GetRegisteredControl()`, `JOG.ListRegisteredControls()`, `JOG.DumpRegisteredControls()`, `JOG.IsVersionCompatible()`, `JOG.RegisterStyleBlock()`, `JOG.DefineControlProperty()`

Test entrypoint:

- `node test/run-v2-tests.js`

Example apps:

- [v2/examples/hello-world.html](../v2/examples/hello-world.html)
- [v2/examples/example.html](../v2/examples/example.html)
- [v2/examples/notepad.html](../v2/examples/notepad.html)
- [v2/examples/customer-admin.html](../v2/examples/customer-admin.html)
- [v2/examples/form-demo.html](../v2/examples/form-demo.html)
- [v2/examples/opportunity-board.html](../v2/examples/opportunity-board.html)
- [v2/examples/third-party-demo.html](../v2/examples/third-party-demo.html)

Distribution build:

- source runtime at [v2/runtime/JOG.js](../v2/runtime/JOG.js)
- minified browser artifact at `dist/JOG.min.js`
- source map at `dist/JOG.min.js.map`
- starter release bundle at `dist/starter/`

Third-party control extensibility status:

- JOG now exposes a first-pass public registration and extension surface for third-party controls
- the current contract is implemented in `v2/runtime/JOG.js` and exercised by [AcmeJOG.Controls.js](../v2/packages/AcmeJOG.Controls.js) plus [BeaconJOG.Controls.js](../v2/packages/BeaconJOG.Controls.js)
- the broader direction and remaining gaps are documented in [third-party-control-spec.md](third-party-control-spec.md)

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
It also schedules one follow-up viewport layout pass on the next animation frame so fill-based shell layouts can settle against real browser dimensions.

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

See [v2/apps/HelloWorldApp.js](../v2/apps/HelloWorldApp.js) and [v2/examples/hello-world.html](../v2/examples/hello-world.html).

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
2. ship `v2/runtime/JOG.js` as a readable development build, or ship `dist/JOG.min.js` as a release build
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

## Browser Helpers

JOG now exposes a very small browser-helper surface for text file open and save flows:

```js
JOG.Browser.OpenTextFile({
  types: [
    {
      description: "Text files",
      accept: {
        "text/plain": [".txt", ".md"]
      }
    }
  ]
}).then(function(result) {
  if (!result) {
    return;
  }
  console.log(result.name, result.text);
});
```

```js
JOG.Browser.SaveTextFile({
  text: "hello world",
  suggestedName: "notes.txt"
}).then(function(result) {
  if (!result) {
    return;
  }
  console.log(result.name, result.method);
});
```

Behavior implemented now:

- `OpenTextFile()` prefers the modern picker API when available
- `OpenTextFile()` falls back to a runtime-managed hidden native file input when needed
- `SaveTextFile()` reuses an existing file handle when one is available and `saveAs` is not requested
- `SaveTextFile()` otherwise prefers the modern save picker, then falls back to a download link
- both helpers return `null` on user cancel instead of treating cancel as an error

This should stay narrow. The intent is to remove obvious browser DOM escape hatches from app code, not to turn JOG into a broad browser-services layer.

## Third-Party Controls

JOG now includes a first-pass public extension contract for third-party controls.

Current public extension entrypoints:

- `JOG.Version`
- `JOG.RegisterControl(definition)`
- `JOG.GetRegisteredControl(nameOrConstructor)`
- `JOG.ListRegisteredControls()`
- `JOG.DumpRegisteredControls()`
- `JOG.IsVersionCompatible(range)`
- `JOG.RegisterStyleBlock(name, cssText)`
- `JOG.DefineControlProperty(target, propertyName, options)`

Stable base-class hooks available to third-party authors:

- `CreateDom(doc)`
- `ApplyState(prevState, nextState)`
- `BindDomEvents()`
- `OnAttached()`
- `OnDisposed()`
- `GetChildHostNode()`
- `RegisterEvent(name, listener)`
- `RaiseEvent(name, originalEvent, extras)`
- `GetStateValue(key)`
- `SetStateValue(key, value)`
- `MarkDirty()`
- `TrackBinding(unsubscribe)`
- `GetRegistration()`

Window-specific helper available to third-party floating shells:

- `GetWindowShell()`

Registration shape implemented now:

```js
JOG.RegisterControl({
  fullName: "AcmeJOG.TagPicker",
  version: "1.0.0",
  jogVersionRange: "^2.0.0",
  constructor: TagPicker,
  metadata: {
    baseType: "Control",
    properties: ["Items", "Value", "Placeholder"],
    events: ["OnChange"],
    methods: ["BindValue"],
    capabilities: {
      supportsValidation: true
    }
  }
});
```

Behavior implemented now:

- registration enforces unique full names
- registration rejects unsupported JOG version ranges against `JOG.Version`
- diagnostics and tree dumps use registered third-party full names
- diagnostics include third-party package version information on runtime event and render failures
- style blocks can be registered once per package through `JOG.RegisterStyleBlock()`
- third-party controls can define plain properties without reaching into private runtime fields through `JOG.DefineControlProperty()`
- the sample `AcmeJOG.TagPicker` now also demonstrates first-pass keyboard selection and radio-group accessibility semantics
- `JOG.Window.GetWindowShell()` now gives third-party `Window` and `Dialog` subclasses a stable way to reuse the built-in chrome without reaching into private fields

Current sample package:

- [AcmeJOG.Controls.js](../v2/packages/AcmeJOG.Controls.js) registers `AcmeJOG.TagPicker` as a primitive control and `AcmeJOG.InspectorCard` as a composite container with a custom child host
- [AcmeJOG.Controls.js](../v2/packages/AcmeJOG.Controls.js) also registers `AcmeJOG.CommandPaletteDialog` as a third-party dialog that reuses the built-in window shell through `GetWindowShell()`
- [BeaconJOG.Controls.js](../v2/packages/BeaconJOG.Controls.js) registers `BeaconJOG.ViewSwitch` as a second primitive control and `BeaconJOG.MetricCard` as a composite control built largely from existing JOG controls
- [ThirdPartyDemoApp.js](../v2/apps/ThirdPartyDemoApp.js) and [third-party-demo.html](../v2/examples/third-party-demo.html) show both packages used side by side from outside `v2/runtime/JOG.js`

Current limits:

- the public extension contract is first-pass, not yet frozen as a long-term compatibility promise
- the sample primitive control now proves first-pass keyboard interaction, but not yet deeper screen-reader validation across real browsers
- there is not yet higher-level tooling for serialization, designers, or package discovery

## Control Model

Every control is a JavaScript object with internal state. State changes do not write to the DOM immediately. Instead:

1. a property setter updates the control state
2. the runtime marks the control dirty
3. the runtime flushes dirty controls in a microtask
4. each control applies current state to its DOM node

This is the core architectural shift from V1. It separates control state from direct DOM mutation.

The runtime now also exposes a narrow `Fill` flag for controls and containers that need to stretch inside shell layouts. This is not a general flexbox abstraction. It exists so shells and tab workspaces can reduce manual width and height math.
When a control is already dock-managed inside a `DockPanel`, `Fill` now avoids forcing raw `100%` width and height so dock geometry remains authoritative.
`DockPanel` now also honors `Gap` as shell spacing between docked regions. A docked child can override that spacing with its own `Gap` when one region needs a different separation than the rest of the shell. `WorkspaceShell` builds on that dock behavior with explicit `Header`, `Sidebar`, and `Content` slots for the most common app-shell composition, and now also exposes a shell-owned `SidebarLayout` helper for repeated responsive sidebar sizing and collapse patterns.

## Data Controls

JOG now has a first-pass data-centric layer aimed at CRUD and internal-tool screens.

`JOG.Collection` is the runtime state model for row-oriented data. It currently handles:

- stable row identity through a configurable `idKey`
- explicit row insert, update, upsert, and remove operations
- single-row selection through `Select()` and `ClearSelection()`
- dirty tracking for updated rows and deleted baseline rows
- derived summaries through named summary functions

`JOG.DataGrid` is the first control built on top of that model. The implemented surface today is still intentionally narrow, but it now covers first-pass view-level sorting, filtering, and inline editing:

- explicit column definitions with `key`, `title`, `width`, `align`, and optional `formatter`
- optional sortable headers, `sortValue`, and view-level `SortKey` plus `SortDirection`
- explicit filter text plus optional `FilterColumns` and `FilterPredicate`
- per-column overflow modes for truncate, wrap, or clip
- first-pass inline editing for text, textarea, and select cells, including committing the current edit when the user moves directly to another editable cell
- bounded pixel-width resizing through per-column `minWidth` and `maxWidth`
- bounded flexible columns through `minWidth` plus `maxWidth` without forcing a fixed pixel width
- rows provided by a bound `JOG.Collection`
- single-row selection
- row command buttons through `RowCommands`
- optional mouse-driven header resizing through `ResizableColumns` for pixel-width columns
- empty-state text
- dirty-row and selected-row styling

What it does not do yet:

- column reordering
- virtualization
- touch resizing
- accessibility-grade keyboard navigation

The current design goal is credibility, not completeness. It gives business-app examples a first-class repeated-item surface without trying to solve the full grid problem in one pass.

## Shell Controls

JOG now includes a first minimal shell control:

- `MenuBar`
- `ToolBar`
- `StatusBar`
- `PageHeader`
- `TabControl`

`MenuBar` is a horizontal command strip for page-level application chrome. The current implementation is intentionally narrow:

- items are provided through `menuBar.Items`
- each item supports `key`, `text`, and `enabled`
- click handling is exposed through `menuBar.OnItemClick(listener)`
- nested menus, keyboard shortcuts, and dropdown popouts are not implemented yet

Example:

```js
var menuBar = new JOG.MenuBar();
menuBar.Items = [
  { key: "file", text: "File" },
  { key: "view", text: "View" },
  { key: "help", text: "Help" }
];

menuBar.OnItemClick(function(args) {
  console.log("Menu clicked:", args.Key);
});
```

`ToolBar` is a horizontal container for existing controls such as buttons, labels, and future command widgets. The current implementation:

- hosts ordinary JOG child controls directly
- uses flow layout for its children
- provides shell styling for command rows
- does not yet implement overflow handling, separators, or icon conventions

`StatusBar` is a horizontal container for low-priority application state and readouts. The current implementation:

- hosts ordinary JOG child controls directly
- uses flow layout for its children
- provides shell styling for footer-style status content
- does not yet implement grip areas, segmented regions, or automatic spring spacing

`PageHeader` is a narrow shell header primitive for page title and subtitle chrome. The current implementation:

- exposes `TitleText` and `SubtitleText`
- stacks those values in normal flow instead of requiring absolute label coordinates
- sizes itself from content instead of requiring a fixed explicit height
- works cleanly as a `Dock = "top"` region inside `DockPanel`

`TabControl` is a page-region container for switching between multiple child panels. The current implementation uses explicit `TabPage` children rather than a loose item array:

- `TabControl` hosts `TabPage` children only
- each `TabPage` can define `Title` and `TabKey`
- `ActiveTab` selects the visible page
- `OnTabChange(listener)` reports user tab switches
- inactive pages are hidden cleanly
- closable tabs, drag reordering, overflow handling, and nested docking behavior are not implemented yet

Example:

```js
var tabs = new JOG.TabControl();

var detailsTab = new JOG.TabPage();
detailsTab.TabKey = "details";
detailsTab.Title = "Details";
detailsTab.Add(detailsLayout);

var activityTab = new JOG.TabPage();
activityTab.TabKey = "activity";
activityTab.Title = "Activity";
activityTab.Add(activityLayout);

tabs.Add(detailsTab);
tabs.Add(activityTab);
tabs.ActiveTab = "details";
```

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

The container also respects container `Padding`, container `Gap`, child `Margin`, and docked-child `Gap` overrides.

Responsive dock behavior can now be driven through inherited `ResponsiveLayout` on the container and its children. This is the current way to collapse a left sidebar into a top region on smaller widths.

Use it for app shells, sidebars, top bars, and detail regions.

### WorkspaceShell

`WorkspaceShell` is a higher-level dock-based shell container for the common header plus sidebar plus content pattern.

- `Header` defaults to `Dock = "top"`
- `Sidebar` defaults to `Dock = "left"`
- `Content` defaults to `Dock = "fill"`
- `SidebarLayout` can own the repeated responsive dock, width, height, and gap pattern for the sidebar slot
- keeps those slotted children ordered correctly even if you assign them in a different sequence
- still honors `Padding`, `Gap`, and child `ResponsiveLayout` so sidebars can collapse to top regions on narrow widths

Use it when you want a page shell primitive instead of wiring `DockPanel` child order and default docking by hand.

### SplitPanel

`SplitPanel` is the new higher-level workspace container for two-pane layouts.

- `Orientation = "horizontal"` or `"vertical"`
- `FirstPaneSize` fixes the first pane in pixels when set
- `SecondPaneSize` fixes the second pane in pixels when set
- `Gap` controls the separation between panes
- `Responsive` can switch orientation, gap, and pane sizes by breakpoint

Use it for left-nav-plus-content shells, inspector layouts, and stacked mobile fallbacks where the outer shell should stay simple.

### SectionPanel

`SectionPanel` wraps content in a framed card with an optional title header and a padded body.

Use it to create visually separated regions such as forms, sidebars, summaries, and detail panels.

`SectionPanel` now also supports a narrow `Responsive` surface for breakpoint-driven title and body-padding changes.

Example:

```js
sidebar.Responsive = {
  base: {
    title: "Pipeline",
    padding: 10
  },
  md: {
    title: "Pipeline Snapshot",
    padding: 12
  }
};
```

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

Current limitation: `Grid` now supports explicit placement, named areas, automatic row sizing, and breakpoint-based responsive overrides, while `StackPanel`, `DockPanel`, `WorkspaceShell`, and `SplitPanel` now cover the main shell patterns. There is still no container-query model or deeper multi-pane workspace manager.

## Window and Dialog Model

`Window` is a container with a title bar and content area.

Current behaviors:

- absolute positioning
- modal overlay support
- stacked modal overlay support across multiple visible dialogs
- modal focus trap that keeps `Tab` and `Shift+Tab` inside the top modal window
- focus restoration to the previous control when the last modal closes, and back to the underlying dialog when nested modals unwind
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
- `Derive(key, dependencyKeys, compute)`

`Subscribe` returns an unsubscribe function. Control bindings register these unsubscribers and clean them up on `Dispose()`.
`Derive` also returns an unsubscribe function. It keeps one store key in sync from other store keys through an explicit compute function.

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
- `Component.BindEnabled(store, key, transform)`

Current explicit app-state helper:

- `Store.Derive(key, dependencyKeys, compute)`
- `FormState(store, options)`

Binding is explicit and per-control. There is no expression language or selector syntax. `Store.Derive()` and `FormState` stay intentionally narrow. App code still decides which keys are derived, when validation runs, and what those keys mean.

## Collection Model

`JOG.Collection` is the current state primitive for repeated business records.

```js
var deals = new JOG.Collection({
  idKey: "id",
  rows: [
    { id: 1, account: "Northwind", value: 145000 }
  ],
  summaryDefinitions: {
    totalValue: function(rows) {
      return rows.reduce(function(sum, row) {
        return sum + row.value;
      }, 0);
    }
  }
});
```

Available collection methods:

- `GetIdKey()`
- `GetRowId(row)`
- `GetRows()`
- `GetRow(id)`
- `SetRows(rows)`
- `Insert(row, index)`
- `Update(id, updaterOrPatch)`
- `Upsert(row)`
- `Remove(id)`
- `Select(id)`
- `SetSelectedIds(ids)`
- `ToggleSelected(id)`
- `ClearSelection()`
- `GetSelectedId()`
- `GetSelectedIds()`
- `GetSelectedRows()`
- `GetDirtyRowIds()`
- `GetDeletedRowIds()`
- `GetDirtyState()`
- `IsDirty(id)`
- `HasDirtyRows()`
- `MarkClean(ids)`
- `SetSummaryDefinitions(definitions)`
- `GetSummary(key)`
- `GetSummaries()`
- `Subscribe(key, listener)`
- `BindStore(store, key, eventKeys, compute)`

Supported subscription keys today:

- `rows`
- `selection`
- `dirty`
- `summary`
- `change`

`BindStore(store, key, eventKeys, compute)` is the narrow bridge from collection state into store-backed page state. It is useful when a page wants labels, button enabled state, or status text that depend on collection summaries, selection, or dirty state without hand-written subscription glue.

For simple repeated collection-backed UI, use `JOG.Repeater` with `BindCollection(collection, renderer)`. The renderer stays explicit and returns normal JOG controls, while the repeater handles re-rendering when the collection changes.

The collection API stays explicit. App code decides when records become clean again, usually after a persistence step or a deliberate local snapshot reset.

## Validation Model

JOG now has a small control-level validation surface.

Available on components and controls:

- `Invalid`
- `ErrorText`
- `SetError(message)`
- `ClearError()`
- `BindError(store, key)`
- `BindVisible(store, key, transform)`
- `BindEnabled(store, key, transform)`

What this does today:

- toggles invalid styling on supported input controls
- sets `aria-invalid`
- uses the error text as the control tooltip
- can bind a control's error state directly to a store key
- can bind page-level summary and inline error visibility directly to a store key
- provides small first-class validation display controls for inline messages and summary blocks

What it does not do:

- it does not provide a validator DSL
- it does not render inline error text automatically
- it does not decide which validations your form needs

The intended usage is explicit. App code decides when validation runs, stores error messages where useful, and can show inline error labels beside controls.

The recommended pattern now is:

1. keep error strings in the store
2. call `control.BindError(store, "someErrorKey")`
3. have validation code set or clear that store key
4. render inline error labels only where you want them

`JOG.FormState` now covers the narrow repeated pattern where a form needs to validate a fixed set of store keys, write field errors back into the store, and optionally maintain one summary key plus one valid-state key.

```js
var formState = new JOG.FormState(store, {
  summaryKey: "validationSummary",
  validations: [
    {
      errorKey: "nameError",
      validate: function(currentStore) {
        return (currentStore.Get("name") || "").trim() ? "" : "Enter a name.";
      }
    }
  ]
});

saveButton.OnClick(function() {
  if (!formState.Validate()) {
    return;
  }
  // persist record
});
```

`FormState.Watch(keys)` re-runs validation only after errors exist, which keeps the model explicit without forcing eager validation on every keystroke. When your summary is just a composition of field-level error strings and you do not need a dedicated form helper, `ValidationSummary.BindErrors(store, ["nameError", "statusError"])` is still the smaller option.

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

[v2/apps/ExampleApp.js](../v2/apps/ExampleApp.js) demonstrates:

- page boot
- button and label usage
- opening a dialog

### Customer Admin App

[v2/apps/CustomerAdminApp.js](../v2/apps/CustomerAdminApp.js) demonstrates:

- `DockPanel` shell layout
- `SplitPanel` left-nav-plus-content workspace composition
- `SectionPanel` regions
- inline store-driven updates
- modal dialog editing
- list/detail CRUD-style interaction

### Form Demo

[v2/apps/FormApp.js](../v2/apps/FormApp.js) demonstrates:

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

[v2/apps/CustomerAdminApp.js](../v2/apps/CustomerAdminApp.js) now also demonstrates:

- one shared validation routine reused across inline save and modal save
- `PageHeader` replacing manual fixed-height shell title layout
- field-level error binding on text inputs in both page and dialog contexts
- summary-level validation messaging reused across multiple save entry points
- live revalidation after an invalid edit begins to be corrected

[v2/apps/ExampleApp.js](../v2/apps/ExampleApp.js) now also demonstrates:

- switching the public theme API at runtime between the built-in default and two distinct palettes
- opening one modal dialog directly
- opening a second modal on top of the first
- verifying that the shared overlay stays between the top modal and lower modal windows

[v2/apps/OpportunityBoardApp.js](../v2/apps/OpportunityBoardApp.js) now also demonstrates:

- breakpoint-aware dialog form layout inside the opportunity editor
- responsive `DockPanel` shell behavior for the board sidebar
- `PageHeader` replacing manual fixed-height shell title layout
- responsive `StackPanel` action rows
- `DataGrid` row commands with collection-backed updates
- first-pass header drag resizing for pixel-width columns
- built-in `ThemePreset` usage on buttons, labels, and sections

[v2/apps/NotepadApp.js](../v2/apps/NotepadApp.js) now also demonstrates:

- docked shell chrome without manual viewport resize math
- `Fill = true` inside a tab workspace for full-height editor composition
- runtime-managed browser text file open and save flows through `JOG.Browser`
- JOG dialog-based file-operation error reporting instead of browser `alert()` calls

## Guidance for Developers

- Prefer explicit JavaScript object composition over clever helper layers.
- Treat `v2/runtime/JOG.js` as the runtime truth.
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
