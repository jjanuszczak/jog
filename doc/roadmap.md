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

### Windows and Dialogs

- draggable windows
- close button support
- close-on-escape support
- modal dialogs
- configurable close button label

### Example Apps

- simple example app
- customer admin example
- form demo with grid layout

## Partial

### Window System

- `Resizable` property exists, but resize behavior is not implemented
- modal support assumes one active modal overlay at a time

### Layout

- `Grid` supports explicit placement only
- no auto row generation abstraction
- no named areas
- no responsive layout helpers

### Events

- event naming is not yet fully normalized
- focus registration is inconsistent with other event helpers

### Styling

- framework injects built-in styles
- public theme API is not implemented yet

## Next Recommended Work

### 1. Validation

Add a small validation model for forms:

- invalid state per control
- inline error text
- validation hooks for save actions
- visual invalid styling

This is the most useful next step for real data-entry apps.

### 2. Event API Cleanup

Normalize the event registration surface so it is predictable:

- `Focus(listener)` and `Blur(listener)` symmetry
- decide whether `OnX` aliases stay or go
- document the final event naming rule

### 3. Window Maturity

- implement actual resize behavior or remove `Resizable` until ready
- improve modal stacking rules
- add load/show/hide lifecycle events if needed

### 4. Diagnostics

- control tree dump
- lifecycle transition logging
- dirty queue logging
- clearer runtime errors

### 5. Tests

- unit coverage for property setters
- integration checks for store binding and dialog behavior
- regression coverage for example apps

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
