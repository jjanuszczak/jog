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
- `Button`
- `TextBox`
- `TextArea`
- `CheckBox`
- `RadioButton`
- `DropDownList`
- `ListBox`

### State and Binding

- `Store`
- `TextBox.BindText`
- `TextArea.BindText`
- `CheckBox.BindChecked`
- `RadioButton.BindSelectedValue`
- `DropDownList.BindSelectedValue`
- `ListBox.BindSelectedValue`
- `SetError(message)`
- `ClearError()`
- `BindError(store, key)`

### Windows and Dialogs

- draggable windows
- resizable windows with lower-right resize handle
- close button support
- close-on-escape support
- modal dialogs
- configurable close button label

### Example Apps

- simple example app
- customer admin example
- form demo with grid layout
- form demo validation and inline error feedback
- form demo validation summary and checkbox invalid-state feedback

### Tests

- Node test runner at `test/run-v2-tests.js`
- baseline coverage for store, container rules, diagnostics, error binding, and resizable window behavior

## Partial

### Window System

- modal support assumes one active modal overlay at a time
- resizing currently uses a lower-right handle only

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

### Validation

- control-level validation exists
- error-state binding from store to control now exists
- app code must still orchestrate when validation runs
- inline error labels and summary regions are still app concerns rather than first-class runtime constructs

## Next Recommended Work

### 1. Validation Maturity

Build on the new validation surface:

- more examples of reusable page-level validation patterns
- consider whether radio-group level invalid styling should get a stronger built-in pattern

### 2. Window Maturity

- improve modal stacking rules
- add load/show/hide lifecycle events if needed
- add richer resize affordances if needed beyond the lower-right handle

### 3. Diagnostics Maturity

- clearer runtime error formatting
- optional category-based debug filtering
- richer tree dump detail when needed

### 4. Test Maturity

- broaden unit coverage for property setters and lifecycle rules
- add stronger integration coverage for dialog behavior and binding flows
- add regression checks that mirror example app usage more closely

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
