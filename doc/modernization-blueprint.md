# JOG Modernization Blueprint

## Objective

Preserve the original product idea:

- A desktop-style developer writes frontend code in plain JavaScript.
- The developer does not write HTML.
- The developer does not interact with the DOM directly.
- The framework owns rendering, layout, lifecycle, and browser interaction.

The main change is architectural. The public authoring model stays simple and explicit.

## Design Rules

1. Plain JavaScript only.
2. No template language.
3. No JSX.
4. No custom DSL beyond normal object creation, property assignment, and method calls.
5. The framework fully owns the DOM.
6. App code talks only to controls, containers, state, and events.

## Public API Goal

The desired authoring style should stay close to this:

```js
var page = new JOG.Page();
var button = new JOG.Button();

button.Text = "Save";
button.Left = 20;
button.Top = 10;
button.Click(onSave);

page.Add(button);
page.Show();
```

That remains straight JavaScript. The difference is that property setters should no longer mutate the DOM directly.

## Core Architectural Shift

The current model is:

- property setter runs
- setter reaches into the DOM
- setter mutates a live node directly

The target model should be:

- property setter updates internal control state
- control marks itself dirty
- scheduler batches dirty controls
- renderer applies updates once per cycle

This keeps the desktop-like API while making the runtime predictable and testable.

## Target Architecture

Build the framework in five layers.

### 1. Public Control API

- `Application`
- `Page`
- `Window`
- `Dialog`
- `Button`
- `Label`
- `TextBox`
- layout containers such as `Panel`, `StackPanel`, `DockPanel`, `Grid`

### 2. Control Base Layer

- base control state
- child collection handling
- event registration
- lifecycle hooks
- parent and owner relationships

### 3. Runtime

- render scheduler
- change tracking
- lifecycle manager
- event cleanup
- focus management
- window manager

### 4. DOM Renderer

- create, update, and remove DOM nodes
- map control state to DOM properties and styles
- attach translated browser events
- isolate browser-specific behavior

### 5. Utilities

- id generation
- observable state
- diagnostics
- test harness

## Internal State Model

Each control should own a plain JavaScript state object.

Example:

```js
{
  id: "saveButton",
  type: "Button",
  text: "Save",
  visible: true,
  enabled: true,
  x: 20,
  y: 10,
  width: null,
  height: null,
  children: []
}
```

Setters write to this state. The renderer reads from this state.

Benefits:

- predictable updates
- easier testing
- easier diagnostics
- easier serialization
- cleaner separation between framework state and DOM state

## Rendering Model

Use a two-step rendering process.

### Step 1: Control State to Render Descriptor

```js
{
  tag: "input",
  attrs: { type: "button", value: "Save" },
  style: { position: "absolute", left: "20px", top: "10px" },
  events: { click: onSave }
}
```

### Step 2: DOM Renderer Applies the Delta

The renderer compares prior and next render descriptors, then updates the DOM accordingly.

This does not require a heavy virtual DOM abstraction. It only requires a disciplined render description plus diff and update logic.

## Internal Control Contract

Each control should implement a shared internal contract:

- `init()`
- `getState()`
- `setDirty(reason)`
- `render()`
- `mount(node)`
- `update(node, prevState, nextState)`
- `unmount()`
- `dispose()`

These are runtime responsibilities, not app-level API surface.

## Lifecycle Model

Add explicit lifecycle stages:

- `Created`
- `Mounted`
- `Shown`
- `Hidden`
- `Disposed`

Add framework lifecycle events:

- `Load`
- `Show`
- `Hide`
- `Close`
- `Dispose`

This is necessary for repeated show and hide flows, dynamic control trees, and reliable cleanup.

## Events

Standardize events across controls:

- `Click(listener)`
- `Change(listener)`
- `Focus(listener)`
- `Blur(listener)`
- `KeyDown(listener)`
- `KeyUp(listener)`

Internal model:

- controls keep listener registries
- renderer binds browser events once
- runtime removes listeners automatically on dispose

Avoid per-control ad hoc DOM event attachment.

## Layout Strategy

Absolute positioning should remain supported, but it cannot be the only layout model.

Introduce containers in this order:

### Panel

- simple child host
- absolute positioning

### StackPanel

- vertical or horizontal stacking

### DockPanel

- top, bottom, left, right, fill

### Grid

- row and column layout

This is one of the biggest upgrades needed for real applications.

## Windowing System

The current `Form` concept should become a formal subsystem.

Add:

- z-index manager
- modal overlay manager
- drag manager
- focus trap for modal dialogs
- close and dispose behavior
- optional resize support later

Public API should stay simple:

```js
var win = new JOG.Window();
win.Title = "Calculator";
win.Show();

var dialog = new JOG.Dialog();
dialog.Title = "Confirm";
dialog.ShowModal();
```

## Concrete Control Design

Each control should define only:

1. default state
2. render descriptor mapping
3. browser event translations

Examples:

- `Button` maps `Text` to a button label
- `Label` maps `Text` to a text node or inline element
- `TextBox` maps `Text` to input value and propagates browser input back into control state

This fixes the current design problem where base text behavior assumes every control behaves like an input.

## Application Root

Introduce an `Application` object.

Responsibilities:

- startup
- root page registration
- runtime and scheduler ownership
- global window manager
- global theme and style registry

Example:

```js
var app = new JOG.Application();
app.Run(new MainPage());
```

This gives the framework a central coordinator.

## Styling Approach

Do not require CSS authoring from app developers, but allow the framework to use CSS internally.

Approach:

- framework emits base class names
- framework sets dynamic inline styles where needed
- theme objects define reusable visual defaults

Example:

```js
JOG.Theme.Default = {
  Button: { padding: "6px 10px" },
  Window: { backgroundColor: "#ddd" }
};
```

This keeps styling in JavaScript when desired while preserving a clean rendering model.

## Data Binding

Keep binding small and explicit.

Introduce a lightweight store:

```js
var state = new JOG.Store({
  count: 0
});
```

Add explicit binding helpers:

```js
textBox.BindText(state, "name");
label.BindText(state, "name");
```

Do not introduce a large MVVM or reactive DSL until the runtime is stable.

## Diagnostics

A mature framework needs debug visibility.

Add:

- duplicate id detection
- invalid parent-child relationship errors
- lifecycle warnings
- control tree dump
- dirty-control logging in debug mode

These will shorten debugging cycles significantly.

## Testing Strategy

Build tests in layers.

### Unit Tests

- setters update control state correctly
- render descriptors are correct

### Renderer Tests

- initial mount
- updates
- removal
- event wiring

### Integration Tests

- page render
- window open and close
- modal behavior
- textbox input flow

### Sample App Tests

- calculator app still works

## Migration Plan

### Phase 1: Stabilize the Public API

- freeze names for core public objects and properties
- document `Page`, `Window`, `Button`, `Label`, `TextBox`

### Phase 2: Rebuild Internals Under the Same API

- replace direct DOM mutation with state plus renderer
- keep the public authoring style unchanged

### Phase 3: Rebuild Core Controls

- `Button`
- `Label`
- `TextBox`
- `Page`
- `Window`

### Phase 4: Add Layout Containers

- `Panel`
- `StackPanel`
- `DockPanel`
- `Grid`

### Phase 5: Add Lifecycle and Cleanup

- repeated show and hide
- disposal
- event cleanup
- modal behavior

### Phase 6: Add Store and Binding

- minimal explicit bindings only

### Phase 7: Add Diagnostics and Tests

- debug mode
- control tree inspection
- regression coverage

## Recommended First Public API

Keep the surface explicit and conservative.

```js
var app = new JOG.Application();
var page = new JOG.Page();

page.Title = "Main";

var btn = new JOG.Button();
btn.Name = "cmdSave";
btn.Text = "Save";
btn.Location(20, 20);
btn.Click(onSave);

page.Add(btn);
app.Run(page);
```

This still satisfies the original intent:

- straight JavaScript
- no HTML written by the app developer
- no direct DOM interaction

## What To Avoid

- no JSX
- no template syntax
- no string-built UI definitions
- no fluent API everywhere for its own sake
- no heavy reflection-based binding
- no direct DOM mutation from control setters
- no script-order dependency as the long-term module model

## Best End State

JOG should become:

> A plain-JavaScript, desktop-style UI framework for the browser where developers construct controls and containers in code, while the runtime handles rendering, layout, events, lifecycle, and browser interaction.

That preserves the original goal and turns the implementation into something durable.
