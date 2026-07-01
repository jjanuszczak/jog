# JOG V2 Roadmap

## Status

This roadmap tracks implementation reality, not aspiration. Update it whenever framework work lands.

## Implemented

### Runtime and Core

- application boot with `Application.Run(page)`
- dirty-control scheduling through microtasks
- state-driven DOM updates
- lifecycle guard against updating disposed controls
- store subscription cleanup during control disposal
- modal overlay support
- window z-order management
- base document style reset for full-viewport page rendering
- page-level flow layout for direct child controls, with windows and dialogs remaining absolute
- control-level invalid state and error text
- application diagnostics with debug logging and tree dump
- public theme API with global and per-application token overrides
- built-in theme presets for selected control types
- zero-dependency Node test runner for core runtime regression checks
- minified browser distribution build at `dist/JOG.min.js`
- starter release bundle at `dist/starter/`

### Base Types

- `Component`
- `Control`
- `Container`
- `Page`

### Layout

- `Panel`
- `DockPanel`
- `StackPanel`
- `SectionPanel`
- `Grid`

### Controls

- `MenuBar`
- `ToolBar`
- `StatusBar`
- `TabControl`
- `Label`
- `ValidationMessage`
- `ValidationSummary`
- `Button`
- `TextBox`
- `TextArea`
- `CheckBox`
- `RadioButton`
- `DropDownList`
- `ListBox`

### State and Binding

- `Store`
- `Label.BindText`
- `ValidationMessage.BindMessage`
- `ValidationSummary.BindSummary`
- `ValidationSummary.BindErrors`
- `TextBox.BindText`
- `TextArea.BindText`
- `CheckBox.BindChecked`
- `RadioButton.BindSelectedValue`
- `DropDownList.BindSelectedValue`
- `ListBox.BindSelectedValue`
- `BindVisible(store, key, transform)`
- `SetError(message)`
- `ClearError()`
- `BindError(store, key)`

### Windows and Dialogs

- draggable windows
- resizable windows with edge and corner handles
- close button support
- close-on-escape support
- modal dialogs
- stacked modal overlay behavior across multiple visible dialogs
- window lifecycle hooks with `OnLoad`, `OnShow`, `OnHide`, and `OnClose`
- configurable close button label

### Example Apps

- bare-bones hello world example
- simple example app
- notepad example with multi-document tabs and browser file open/save flows
- customer admin example
- form demo with grid layout
- form demo with breakpoint-aware responsive grid layout
- form demo validation and inline error feedback
- form demo validation summary with reusable binding helpers
- form demo checkbox and radio-group invalid-state feedback
- opportunity board sample with CRM-style add, edit, and delete flows
- opportunity editor dialog with breakpoint-aware responsive grid layout
- opportunity board shell with responsive dock and stack behavior
- opportunity board use of built-in theme presets

### Tests

- Node test runner at `test/run-v2-tests.js`
- baseline coverage for store, container rules, diagnostics, error binding, lifecycle guards, responsive grid breakpoints, responsive dock and stack behavior, theme preset classes, richer window resize behavior, modal stacking, window lifecycle events, and example-level integration flows including customer selection, dialog close branches, and form reset behavior

## Partial

### Window System

No major known runtime gaps remain beyond normal hardening.

### Layout

- `Grid` now has breakpoint-based responsive track and placement overrides
- `StackPanel` now has breakpoint-based orientation and spacing overrides
- `DockPanel` now supports responsive shell and child layout changes through inherited `ResponsiveLayout`
- `SectionPanel` still has no dedicated responsive helper surface

### Shell Controls

- `MenuBar` exists as a first minimal shell control with flat clickable items
- `ToolBar` exists as a first minimal shell container for command controls
- `StatusBar` exists as a first minimal shell container for status content
- `TabControl` exists as a first minimal tabbed container with explicit `TabPage` children
- nested menus, accelerators, and keyboard navigation are not implemented yet
- toolbar overflow, separators, richer status conventions, closable tabs, and drag reordering are not implemented yet

### Events

- shorthand aliases still exist alongside the preferred `OnX` style

### Styling

- framework injects built-in styles
- public theme API exists for global and per-application token overrides
- built-in theme presets now exist for selected control types
- arbitrary per-control style objects are still not implemented

### Packaging

- release packaging is direct browser script usage, not npm runtime installation
- GitHub Releases are the primary intended distribution channel for built browser artifacts
- GitHub Release asset upload is automated for published releases
- npm packaging is intentionally deferred unless the current release artifact flow proves insufficient
- minified distribution output exists, but there is no broader package-manager or CDN distribution story yet

### Validation

- control-level validation exists
- error-state binding from store to control now exists
- page-level visibility and label text can now bind directly to store keys
- first-class validation display controls now exist for inline messages and summary blocks
- validation summaries can now derive their own message directly from multiple field error keys
- radio-group invalid styling can now be applied at the row-container level
- app code must still orchestrate when validation runs

## Deferred

- tool bar
- data grid
- tree view
- arbitrary per-control style objects
- richer binding model
- accessibility pass
- npm package publishing unless the release artifact workflow later proves insufficient

## Documentation Rule

When a feature lands:

1. update `doc/developer-guide.md`
2. update `doc/api-reference.md`
3. update this roadmap

Do that in the same change as the code.
