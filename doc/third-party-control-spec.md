# JOG V2 Third-Party Control Specification

## Status

This document now serves two roles:

- it describes the first-pass public third-party control contract implemented in `v2/runtime/JOG.js`
- it keeps the remaining direction and quality bar explicit where the runtime is not yet fully hardened

Use this document alongside `doc/developer-guide.md` and `doc/api-reference.md` when building third-party controls.

## Goal

Third-party JOG controls should feel native to app developers.

That means a custom control should:

- be created with `new`
- expose plain properties
- compose with `Add` when it is a container
- expose events through `OnX(listener)`
- participate in JOG dirty rendering and disposal
- consume the same theme tokens, layout properties, validation hooks, and event model as core controls

The extension model should increase reuse without turning JOG into a plugin-heavy or markup-first framework.

## Non-Goals

This specification does not propose:

- JSX, templates, or author-written HTML as the primary model
- a declarative control DSL
- automatic expression binding
- a second rendering engine inside JOG
- arbitrary per-control style objects as the primary styling contract
- direct app ownership of control DOM

## Design Principles

The extension contract should hold these lines:

- stay JavaScript-first
- stay control-and-container-first
- keep state explicit
- keep DOM ownership inside the framework and the control package
- keep public APIs narrow and documented
- favor composition over clever framework magic
- make version compatibility explicit

## Current Reality

JOG V2 now has a first-pass public extension API for third-party controls:

- controls are stateful JavaScript objects
- rendering is dirty-queue based
- controls expose properties plus `OnX` events
- containers compose through `Add`
- themes are token-based
- validation and visibility bindings are explicit
- controls can register through `JOG.RegisterControl()`
- package styles can register through `JOG.RegisterStyleBlock()`
- custom properties can be defined through `JOG.DefineControlProperty()`
- the public extension lifecycle now includes `CreateDom()`, `ApplyState()`, `BindDomEvents()`, `OnAttached()`, `OnDisposed()`, and `GetChildHostNode()`
- `JOG.Window` now also exposes `GetWindowShell()` so third-party `Window` and `Dialog` subclasses can reuse the built-in floating chrome without touching private node fields
- modal focus trapping and focus restoration are runtime-managed for core and third-party dialogs through the shared `Window` behavior

What still remains unfinished is long-term hardening around accessibility, keyboard depth, and broader package tooling.
The sample `AcmeJOG.TagPicker` now demonstrates first-pass keyboard navigation and radio-group semantics, `AcmeJOG.CommandPaletteDialog` proves a third-party floating shell through the documented `Window` helper, and the additional `BeaconJOG` sample package proves that a second package with a different authoring style can coexist cleanly. That still does not replace broader real-browser accessibility verification.

## Extension Targets

Third-party developers should build on one of these public bases:

- `JOG.Control` for primitive or single-surface controls
- `JOG.Container` for composite controls that host child JOG controls
- `JOG.Window` or `JOG.Dialog` only when the control is inherently a floating shell

The default recommendation should be:

- use `Control` when the control needs custom native input or custom pointer and keyboard behavior
- use `Container` when the control can be composed from existing JOG controls

Many business-app controls should be composite controls, not new low-level DOM widgets.

## App-Author Experience

The app authoring surface should look like a core JOG control.

Example:

```js
var datePicker = new AcmeJOG.DatePicker();
datePicker.Value = "2026-07-03";
datePicker.MinDate = "2026-01-01";
datePicker.ThemePreset = "quiet";

datePicker.OnChange(function(args) {
  store.Set("startDate", args.Value);
});
```

If a custom control requires templates, render callbacks, or a separate view model, it is off-model for JOG.

## Control Package Contract

Each third-party control package should expose:

- one or more control constructors
- a registration entrypoint for JOG
- package metadata
- compatibility metadata
- package documentation with examples and limitations

Recommended package layers:

1. browser-ready runtime bundle
2. readable source package for teams that vendor code
3. docs package or README

## Registration Model

JOG now exposes a formal registration API instead of relying on global monkey-patching.

Recommended direction:

```js
JOG.RegisterControl({
  fullName: "Acme.DatePicker",
  version: "1.0.0",
  jogVersionRange: "^2.0.0",
  constructor: AcmeDatePicker,
  metadata: {
    baseType: "Control"
  }
});
```

Registration should enforce:

- unique full names
- duplicate-registration failure
- version-range validation against the running JOG runtime
- clear diagnostics when a package targets an unsupported JOG version

JOG now also exposes first-pass lookup and inspection helpers through `JOG.GetRegisteredControl()`, `JOG.ListRegisteredControls()`, and `JOG.DumpRegisteredControls()`. Designer tooling and serialization-specific helpers are still future work if they become necessary.

## Required Metadata

Each registered control should declare metadata that is stable enough for docs, diagnostics, and future tooling.

Recommended metadata shape:

- `fullName`
- `shortName`
- `packageName`
- `packageVersion`
- `jogVersionRange`
- `baseType`
- `properties`
- `events`
- `methods`
- `themePresets`
- `capabilities`

Recommended capability flags:

- `supportsValidation`
- `supportsKeyboard`
- `supportsResponsiveLayout`
- `supportsCollection`
- `supportsChildren`
- `supportsFocusRestore`

This metadata should describe the public contract, not the internal implementation.

## Public API Rules

Third-party control APIs should follow the same discipline as core JOG controls.

Rules:

- use plain properties for public state
- use `OnX(listener)` for events
- keep imperative methods rare and concrete
- expose `Add`, `Remove`, and `Clear` only for real containers
- keep property names literal and unsurprising
- avoid giant `SetConfig({...})` surfaces
- avoid template callbacks and DOM escape hatches

Good property examples:

- `Value`
- `Items`
- `SelectedValue`
- `Placeholder`
- `Invalid`
- `ErrorText`
- `ThemePreset`

Bad API examples:

- `SetConfig({...})`
- `RenderTemplate(fn)`
- `BeforePatch(fn)`
- `UsePlugin(...)`
- `DomNode`

## Lifecycle Contract

JOG now exposes a narrow, documented extension lifecycle.

Recommended protected hooks:

- `CreateDom()`
- `ApplyState(prevState, nextState)`
- `BindDomEvents()`
- `OnAttached()`
- `OnDisposed()`
- `GetChildHostNode()` for controls that host child controls internally
- `GetWindowShell()` for `Window` and `Dialog` subclasses that need to customize the built-in floating shell

The important rule is simple: third-party controls should code against documented hooks, not private runtime internals.

JOG should keep fields such as `_state`, `_domNode`, `_runtime`, and `_children` private implementation details unless a future extension API explicitly blesses a stable subset.

## State And Rendering Rules

Custom controls should follow the same state model as core JOG controls:

- property changes update control state
- state changes mark the control dirty
- JOG schedules the render
- the control applies current state during render

Third-party authors should not write directly to the DOM from public property setters. If they do, the control will drift from the rest of the framework.

## Container And Slot Model

Container-style third-party controls should declare whether they:

- accept ordinary child controls
- accept only a constrained child type
- expose named slots

If named slots are needed, they should stay JavaScript-first.

Recommended examples:

- `SetHeader(child)`
- `SetFooter(child)`
- `AddItem(child)`
- `SetEditor(child)`

Do not make HTML fragments or template strings the slot contract.

## Layout Contract

Third-party controls should participate in the existing layout model:

- `Width`
- `Height`
- `MinWidth`
- `MinHeight`
- `MaxWidth`
- `MaxHeight`
- `Top`
- `Left`
- `Margin`
- `Padding`
- `Fill`
- `Dock`
- `ResponsiveLayout`
- `GridColumn`
- `GridRow`
- `GridArea`
- `ResponsiveGrid`
- `ColumnSpan`
- `RowSpan`

If a custom container uses flow layout internally, it should behave consistently with existing `Container` and shell controls.

## Theme And Styling Contract

Third-party controls should be styled through the JOG theme model first.

Rules:

- consume JOG CSS variables for core colors, spacing, radius, typography, and shadow
- support `ThemePreset` when variants are valuable and reusable
- use package-scoped CSS custom properties only when core tokens are not enough
- treat `CssClass` as an app escape hatch, not the primary styling API
- avoid hardcoded product-specific colors and measurements where theme tokens already cover the need

Recommended styling layers:

1. core JOG theme tokens
2. control-level `ThemePreset`
3. package-scoped CSS variables
4. app-level CSS overrides as a last resort

## Validation Contract

Input-like third-party controls should adopt the same validation model as core input controls.

Expected surface:

- `Invalid`
- `ErrorText`
- `SetError(message)`
- `ClearError()`
- `BindError(store, key)`

If a control edits a primary value, it should also expose:

- one canonical value property, usually `Value`
- one canonical change event, usually `OnChange`

This keeps third-party controls usable inside the same form patterns as `TextBox`, `DropDownList`, and `CheckBox`.

## Binding Contract

Binding should stay explicit.

Recommended patterns:

- `BindValue(store, key)` for a primary editable value
- `BindSelectedValue(store, key)` for selection controls
- `BindText(store, key, formatter)` for display controls
- `BindItems(store, key, formatter)` only when a control truly owns repeated option data

When interaction state matters across rows or records, JOG should favor `Collection` integration over ad hoc array binding.

This spec does not recommend an expression language or hidden auto-binding layer.

## Event Contract

Third-party controls should emit `JOG.EventArgs`-compatible payloads.

Required event fields:

- `Source`
- `Type`
- `OriginalEvent`
- `Handled`

Optional fields should reuse existing JOG naming where applicable:

- `Value`
- `Key`
- `Index`
- `Row`
- `RowId`
- `Column`
- `Command`

JOG should not tolerate package-specific event naming chaos if the controls are meant to feel first-party.

## Accessibility And Keyboard Contract

Reusable controls need a minimum framework-level quality bar.

Third-party controls should:

- support keyboard interaction for their core behavior
- expose visible focus state
- use native controls or semantic roles where possible
- support disabled state
- support invalid state where relevant
- document any keyboard or screen-reader limitations directly

Accessibility cannot be treated as optional package polish if JOG wants a reusable control ecosystem.

## Packaging And Distribution Model

This specification works with JOG's current direct-browser distribution model.

Near-term package expectations:

- ship as a browser-ready script after `JOG.min.js` or `v2/runtime/JOG.js`
- register controls during package load
- export constructors through a stable namespace

Example load order:

```html
<script src="JOG.min.js"></script>
<script src="acme-jog-controls.js"></script>
<script src="MyApp.js"></script>
```

Future npm or package-manager distribution can sit on top of the same control contract later. It should not require a different authoring model.

## Versioning And Compatibility

This is the hardest part of a control ecosystem and should be explicit from the start.

JOG now defines, at a first-pass level:

- a stable public extension contract
- a private internal runtime surface
- semantic compatibility rules for third-party packages

Third-party controls should depend only on documented extension APIs, not on runtime internals.

## Diagnostics And Tooling

Now that JOG has third-party control support, diagnostics should treat those controls as first-class citizens.

Implemented today:

- include registered control full names in tree dumps and error output
- report extension-package version mismatches clearly
- expose a runtime registry dump for debugging loaded controls
- let docs and future tooling read control metadata without instantiating controls

Still missing:

- designer or serialization-focused tooling on top of that registry
- broader diagnostic helpers for package loading order or multi-package conflict analysis

## Documentation Standard For Third-Party Controls

Each control package should document:

- purpose
- public properties
- public events
- public methods
- binding helpers
- child or slot rules
- theme presets
- accessibility behavior
- example usage
- supported JOG version range
- known limitations

If the docs are weak, reuse will stay weak.

## Recommended Core Enhancements For JOG

JOG will need specific framework work before this model is real.

Recommended runtime enhancements:

1. formal control registration API
2. version and compatibility checks for registered packages
3. documented extension lifecycle hooks
4. public metadata model for registered controls
5. stable base-class guidance for `Control`, `Container`, `Window`, and `Dialog`
6. diagnostics support for third-party control names and packages
7. developer-doc guidance for composite versus primitive custom controls
8. at least one proof control built strictly from the published extension docs

That proof control matters. JOG should test the docs by building a real third-party control from them rather than assuming the contract is complete.

## Acceptance Criteria For The Future JOG Feature

The extension model should not be considered complete until all of these are true:

- a third-party package can register at least one custom primitive control
- a third-party package can register at least one composite control
- app code uses those controls with the same `new`, property, `Add`, and `OnX` style as core controls
- the controls participate in theme tokens, validation, layout, and disposal correctly
- JOG emits meaningful diagnostics when registration or compatibility fails
- the proof control is documented and used from outside the core runtime source tree

## Bottom Line

The right model is not a plugin free-for-all.

The right model is a narrow, stable extension contract where third-party controls behave like first-party JOG controls:

- property-driven
- event-driven
- explicit
- theme-aware
- lifecycle-safe
- reusable across projects

That keeps JOG true to its current principles while making the framework substantially more extensible.
