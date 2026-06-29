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
- control-level invalid state and error text
- application diagnostics with debug logging and tree dump
- zero-dependency Node test runner for core runtime regression checks
- minified browser distribution build at `dist/JOG.min.js`

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

- simple example app
- customer admin example
- form demo with grid layout
- form demo validation and inline error feedback
- form demo validation summary with reusable binding helpers
- form demo checkbox and radio-group invalid-state feedback
- opportunity board sample with CRM-style add, edit, and delete flows

### Tests

- Node test runner at `test/run-v2-tests.js`
- baseline coverage for store, container rules, diagnostics, error binding, lifecycle guards, richer window resize behavior, modal stacking, window lifecycle events, and example-level integration flows including customer selection, dialog close branches, and form reset behavior

## Partial

### Window System

No major known runtime gaps remain beyond normal hardening.

### Layout

- `Grid` supports explicit placement only
- no auto row generation abstraction
- no named areas
- no responsive layout helpers

### Events

- shorthand aliases still exist alongside the preferred `OnX` style

### Styling

- framework injects built-in styles
- public theme API is not implemented yet

### Packaging

- release packaging is direct browser script usage, not npm runtime installation
- minified distribution output exists, but there is no broader package-manager or CDN distribution story yet

### Validation

- control-level validation exists
- error-state binding from store to control now exists
- page-level visibility and label text can now bind directly to store keys
- first-class validation display controls now exist for inline messages and summary blocks
- radio-group invalid styling can now be applied at the row-container level
- app code must still orchestrate when validation runs

## Next Recommended Work

### 1. Validation Maturity

Build on the new validation surface:

- consider whether first-class validation summary or field-message controls are worth adding

### 2. Packaging Maturity

- decide whether to keep GitHub Releases as the primary distribution path
- consider a starter release bundle with `JOG.min.js`, a starter HTML file, and a minimal app example
- decide later whether npm packaging is worth the maintenance cost

## Deferred

- menu bar
- tool bar
- status bar
- tab control
- data grid
- tree view
- theming system
- richer binding model
- accessibility pass

## Documentation Rule

When a feature lands:

1. update `doc/developer-guide.md`
2. update `doc/api-reference.md`
3. update this roadmap

Do that in the same change as the code.
