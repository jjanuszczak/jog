# JOG V2 Specification

## Preamble

JOG is a real framework concept, but it is not a new category.

Its core idea, letting a desktop-style developer build a browser UI entirely in JavaScript objects and control APIs without writing HTML or touching the DOM, is legitimate. It also overlaps with several existing families of tools:

- component-driven UI frameworks such as React
- desktop-style browser UI toolkits
- older object-oriented web application frameworks

So the opportunity is not to claim a wholly new invention. The opportunity is to build a better product for a specific type of developer and application.

JOG should not try to beat React head-on as a general frontend platform. React has ecosystem depth, hiring familiarity, tooling maturity, and broad market momentum. That is not a realistic first target.

JOG can still be valuable if it becomes the best tool for a narrower class of work:

- business applications
- internal tools
- form-heavy systems
- CRUD-heavy line-of-business apps
- teams with desktop application instincts
- developers who want a control-and-container mental model instead of a markup-and-CSS mental model

The technical goal of V2 is therefore not to imitate React. It is to deliver a plain-JavaScript, desktop-style browser UI runtime that is internally modern, externally simple, and materially more productive for the kind of developer JOG is meant to serve.

This specification should stay aligned with the implemented V2 direction. It is not a wish-list for every possible UI category. It should describe the product lane JOG is actually trying to own:

- browser-based internal tools
- line-of-business applications
- desktop-style shells
- form-heavy and CRUD-heavy workflows
- data-centric applications that need tabs, dialogs, status chrome, validation, and predictable state flow

## 1. Product Goal

JOG V2 is a plain-JavaScript UI framework for the browser with these rules:

1. App developers write JavaScript, not HTML.
2. App developers do not manipulate the DOM directly.
3. App developers work with controls, containers, windows, dialogs, state, and events.
4. The framework owns rendering, layout, lifecycle, and browser integration.
5. The public API stays explicit and conservative. No JSX, no templates, no DSL.

## 2. Non-Goals

JOG V2 is not trying to be:

- a universal replacement for React
- a static-site or content-site framework
- a design-system-first framework for highly custom consumer experiences
- a functional reactive language
- a template engine

## 3. Design Principles

1. Keep authoring in straight JavaScript.
2. Keep public APIs explicit rather than clever.
3. Separate control state from DOM state.
4. Batch DOM updates through a runtime.
5. Make windowing, forms, dialogs, layout, and events first-class.
6. Optimize for line-of-business application development.
7. Preserve a desktop-developer mental model.

## 4. Public Programming Model

### 4.1 Example

```js
var app = new JOG.Application();
var page = new JOG.Page();

page.Title = "Customer Admin";

var button = new JOG.Button();
button.Name = "cmdSave";
button.Text = "Save";
button.Location(20, 20);
button.OnClick(onSave);

page.Add(button);
app.Run(page);
```

### 4.2 Canonical Authoring Model

The canonical JOG V2 authoring model is:

- create controls with `new`
- set properties directly
- compose through `Add`
- handle events with `OnX` methods such as `OnClick` and `OnChange`
- bootstrap applications with `Application.Run(page)`
- use explicit store binding where state synchronization is needed

Compatibility aliases such as `Click(listener)` and `Change(listener)` may exist, but they are not the preferred public style.

### 4.3 Public API Constraints

- no HTML fragments
- no JSX
- no chained builder syntax as the primary model
- no string-based UI declarations
- no required direct CSS authoring

## 5. Public Types

### 5.1 Application Types

- `JOG.Application`
- `JOG.Page`
- `JOG.Window`
- `JOG.Dialog`

### 5.2 Base UI Types

- `JOG.Component`
- `JOG.Control`
- `JOG.Container`

### 5.3 Core Controls

- `JOG.Label`
- `JOG.Button`
- `JOG.TextBox`
- `JOG.CheckBox`
- `JOG.RadioButton`
- `JOG.DropDownList`
- `JOG.ListBox`
- `JOG.TextArea`

### 5.4 Layout Containers

- `JOG.Panel`
- `JOG.StackPanel`
- `JOG.DockPanel`
- `JOG.SplitPanel`
- `JOG.SectionPanel`
- `JOG.Grid`

### 5.5 Shell Controls

- `JOG.MenuBar`
- `JOG.ToolBar`
- `JOG.StatusBar`
- `JOG.TabControl`
- `JOG.TabPage`

These controls now exist, but they are still early and should be treated as first-pass shell primitives rather than complete desktop-shell subsystems.

### 5.6 Data-Centric Controls

- `JOG.DataGrid`
- `JOG.TreeView`

`JOG.DataGrid` now exists as a first-pass flagship control for the current product lane. `TreeView` remains deferred behind deeper `DataGrid` maturity or a concrete app need.

## 6. Core Public Properties

These should exist consistently where applicable:

- `Name`
- `Parent`
- `Visible`
- `Enabled`
- `Width`
- `Height`
- `Top`
- `Left`
- `Text`
- `CssClass`
- `Tooltip`

Container-capable controls should also expose:

- `Children`

Window-capable controls should also expose:

- `Title`
- `Modal`
- `Resizable`
- `Draggable`

The current V2 surface also benefits from:

- `MinWidth`
- `MinHeight`
- `MaxWidth`
- `MaxHeight`
- `Fill`
- `Padding`
- `Margin`
- validation state such as `Invalid` and `ErrorText`
- responsive layout metadata where applicable

## 7. Core Public Methods

### 7.1 Base Methods

- `Show()`
- `Hide()`
- `Dispose()`
- `Focus()`
- `Refresh()`
- `Location(x, y)`
- `Size(width, height)`
- `SetBounds(x, y, width, height)`

### 7.2 Container Methods

- `Add(child)`
- `Remove(child)`
- `Clear()`

### 7.3 Dialog and Window Methods

- `Show()`
- `ShowModal()`
- `Close()`
- `BringToFront()`

## 8. Core Public Events

All controls should expose a standard event registration pattern. The preferred public style is `OnX`.

Preferred style:

- `OnClick(listener)`
- `OnChange(listener)`
- `OnFocus(listener)`
- `OnBlur(listener)`
- `OnKeyDown(listener)`
- `OnKeyUp(listener)`

Compatibility aliases may also exist:

- `Click(listener)`
- `Change(listener)`
- `Focus(listener)`
- `Blur(listener)`
- `KeyDown(listener)`
- `KeyUp(listener)`

Window and dialog types should also expose:

- `OnLoad(listener)`
- `OnShow(listener)`
- `OnHide(listener)`
- `OnClose(listener)`

For V2, the framework should favor one documented event style instead of presenting old and new forms as equally primary.

## 9. Internal Runtime Architecture

JOG V2 should be built in five layers.

### 9.1 Public API Layer

Responsibilities:

- object creation
- public properties
- public methods
- public event registration

### 9.2 Control Model Layer

Responsibilities:

- internal state storage
- parent-child relationships
- event registry management
- lifecycle state tracking

### 9.3 Runtime Layer

Responsibilities:

- dirty tracking
- update scheduling
- lifecycle transitions
- event cleanup
- focus coordination
- window and dialog management
- responsive layout recalculation
- narrow browser-integration helpers for cases where app code would otherwise hand-roll DOM escape hatches
- diagnostics and error reporting

### 9.4 Renderer Layer

Responsibilities:

- create DOM nodes
- update DOM nodes
- remove DOM nodes
- apply style and attributes
- translate browser events into control events

### 9.5 Utility Layer

Responsibilities:

- id generation
- diagnostics
- lightweight state store
- testing helpers

## 10. State Model

Each control owns a plain JavaScript state object.

Example:

```js
{
  id: "cmdSave",
  type: "Button",
  text: "Save",
  visible: true,
  enabled: true,
  left: 20,
  top: 20,
  width: null,
  height: null,
  cssClass: null,
  children: []
}
```

Rules:

1. Public setters update control state.
2. Public setters do not directly mutate DOM nodes.
3. State changes mark controls dirty.
4. Dirty controls are flushed through the runtime scheduler.

## 11. Rendering Model

### 11.1 Render Descriptor

Each control produces an internal render descriptor.

Example:

```js
{
  tag: "button",
  attrs: {
    id: "cmdSave",
    type: "button"
  },
  text: "Save",
  style: {
    position: "absolute",
    left: "20px",
    top: "20px"
  },
  events: {
    click: "Click"
  }
}
```

### 11.2 Render Cycle

The render cycle should work as follows:

1. Control state changes.
2. Control is marked dirty.
3. Scheduler queues a flush.
4. Runtime asks dirty controls for fresh render descriptors.
5. Renderer computes updates.
6. Renderer applies DOM changes.

### 11.3 Update Semantics

- multiple state changes in one tick should batch
- repeated setters should collapse into one render pass
- removed controls should trigger listener cleanup
- disposed controls should be detached from runtime tracking

## 12. Internal Control Contract

Each concrete control should conform to this internal contract:

- `init()`
- `getState()`
- `setDirty(reason)`
- `render()`
- `mount(domNode)`
- `update(domNode, prevState, nextState)`
- `unmount()`
- `dispose()`

These are internal, not public app-facing APIs.

## 13. Lifecycle Model

### 13.1 Lifecycle States

- `Created`
- `Mounted`
- `Shown`
- `Hidden`
- `Disposed`

### 13.2 Lifecycle Rules

1. A control begins in `Created`.
2. A rendered control enters `Mounted`.
3. A visible rendered control enters `Shown`.
4. A hidden rendered control enters `Hidden`.
5. A disposed control enters `Disposed` permanently.

### 13.3 Lifecycle Guarantees

- `Dispose()` is idempotent
- disposed controls cannot be shown again
- event subscriptions are released on dispose
- child controls are disposed when parent disposal policy requires it

### 13.4 Accessibility and Focus Direction

Accessibility is part of framework completeness for JOG's target product lane.

The intended direction for V2 is:

- dialogs should trap focus when modal
- focus should return to the prior control when a modal dialog closes
- shell controls should support keyboard-first interaction
- controls should expose sound semantics and invalid-state signaling

This area is not complete in the current implementation and should be treated as active framework work, not optional polish.

## 14. Layout System

### 14.1 Supported Layout Modes

JOG V2 should support:

- absolute layout
- stacked layout
- dock layout
- grid layout

### 14.2 Layout Container Responsibilities

#### `Panel`

- supports explicit positioning
- child coordinates remain app-controlled

#### `StackPanel`

- vertical or horizontal arrangement
- spacing support
- child alignment options

#### `DockPanel`

- dock top, bottom, left, right, fill
- page-shell use should avoid forcing child `100%` width and height when dock geometry is already authoritative
- child-structure changes should trigger parent relayout so tabbed and split shells stay stable after mutations

#### `SplitPanel`

- horizontal or vertical two-pane workspace layout
- fixed first-pane or second-pane sizing
- breakpoint-based orientation changes

#### `Grid`

- row and column definitions
- row and column spanning
- alignment within cells

### 14.3 Product-Lane Layout Direction

The next layout step should not be more raw primitives in isolation. It should be making desktop-style application shells dependable.

That means:

- less manual height and chrome math in app code
- stronger composition for shell-style pages
- better support for multi-pane, tabbed, and status-driven business-app layouts

Current implemented direction:

- page-level shell layout is materially more dependable than it was earlier in V2
- `Fill` is still a narrow stretch signal, not a general flexbox abstraction
- dock-managed children should let `DockPanel` own their geometry

### 14.4 Layout Priority

V2 minimum target:

1. `Panel`
2. `StackPanel`
3. `DockPanel`
4. `SplitPanel`
5. `Grid`

## 15. Windowing System

The windowing subsystem is a primary differentiator for JOG.

### 15.1 Required Features

- floating windows
- draggable title bars
- modal dialogs
- overlay masking for modals
- z-index ordering
- focus handoff
- close handling
- focus trapping for modal dialogs
- focus restoration after modal close

Current implemented behavior also includes:

- resizable windows with edge and corner handles
- stacked modal overlays
- scrollable window and dialog content panes so oversized dialog bodies remain reachable

### 15.2 Nice-to-Have Features

- resizable windows
- minimize and maximize
- snapped placement
- keyboard navigation between windows

### 15.3 Window Manager Responsibilities

- assign z-order
- track active window
- coordinate modal overlays
- manage focus and restore prior focus
- remove disposed windows cleanly

Current gap:

- focus trapping and focus restoration are still intended behavior, not completed behavior

### 15.4 Browser Integration Direction

The runtime should own a small number of explicit browser-integration helpers when the alternative is repeated ad hoc DOM manipulation in app code.

Near-term priority:

- a runtime-level file-picker helper that prefers modern browser file APIs when available
- a built-in fallback path for browsers that still require a hidden native file input
- an app-facing API narrow enough that examples such as `NotepadApp` do not append raw DOM nodes to `document.body`

This should stay conservative. The goal is not a broad browser-service abstraction layer. The goal is to absorb obvious browser interop seams that otherwise weaken the JOG programming model.

## 16. Event System

### 16.1 Public Model

Controls should expose strongly named registration methods:

```js
button.OnClick(onSave);
textBox.OnChange(onNameChanged);
```

Compatibility aliases may exist for older samples or convenience, but the spec should treat `OnX` as canonical.

### 16.2 Internal Model

- controls maintain event registries
- renderer binds browser listeners once per mounted node
- internal event bridge dispatches to control listeners
- disposing a control removes all bridged listeners

### 16.3 Event Object

JOG should define a normalized event object with:

- `Source`
- `Type`
- `OriginalEvent`
- `Handled`
- `Value` when relevant
- `Key` when relevant

## 17. Data Binding

Binding should be minimal and explicit.

### 17.1 Store

```js
var customerState = new JOG.Store({
  name: "",
  active: true
});
```

### 17.2 Explicit Bindings

```js
nameTextBox.BindText(customerState, "name");
activeCheckBox.BindChecked(customerState, "active");
```

### 17.3 Binding Rules

- one-way binding by default
- two-way binding only for input-style controls
- explicit property binding methods
- no expression language

### 17.4 Next Binding Priorities

The current gap is not field-level binding. That part exists. The current gap is higher-order state leverage for business apps:

- collection updates
- repeated-item rendering patterns
- selection state
- dirty tracking
- derived values and summary state
- validation orchestration across larger forms

V2 should improve those areas without abandoning the explicit JavaScript programming model.

## 18. Styling and Theme Model

JOG should support styling without requiring app authors to write CSS by hand.

### 18.1 Framework Styling Rules

- framework should emit stable class names for built-in controls
- framework may set dynamic inline styles for layout and runtime-driven positioning
- framework should expose a public theme API based on named design tokens
- apps should be able to theme the entire runtime without editing the injected stylesheet directly

### 18.2 Public Theme API

The public styling surface for V2 should be token-based and explicit.

Required global API:

- `JOG.SetTheme(themeObject)`
- `JOG.GetTheme()`
- `JOG.Theme`

Required application-level API:

- `app.Theme`

Theme application rules:

- `JOG.SetTheme(...)` sets the process-wide default theme for future apps
- running apps without an application override should update when the global theme changes
- `app.Theme` should override the global theme for that application only
- the active app theme should be resolved as `merge(globalTheme, app.Theme)`

### 18.3 Theme Shape

```js
JOG.SetTheme({
  colors: {
    appBackground: "#f5efe6",
    surface: "#fffdf8",
    surfaceMuted: "#f2eadf",
    text: "#1f2937",
    textMuted: "#5b6472",
    border: "#d7cbbb",
    primary: "#8a4b2a",
    primaryText: "#fff8f1",
    danger: "#c2410c",
    dangerText: "#9a3412",
    overlay: "rgba(42, 24, 16, 0.28)"
  },
  typography: {
    fontFamily: "\"IBM Plex Sans\", Arial, sans-serif",
    fontSize: "14px",
    captionSize: "12px",
    titleSize: "13px",
    lineHeight: "1.45"
  },
  radius: {
    control: "8px",
    section: "14px",
    shell: "16px",
    window: "14px"
  },
  spacing: {
    pagePadding: "32px",
    sectionBody: "16px",
    windowContent: "20px"
  },
  shadow: {
    shell: "0 14px 34px rgba(15, 23, 42, 0.06)",
    section: "0 8px 20px rgba(15, 23, 42, 0.04)",
    window: "0 24px 50px rgba(15, 23, 42, 0.16)"
  }
});
```

Applications should also be able to override the global theme:

```js
var app = new JOG.Application();

app.Theme = {
  colors: {
    primary: "#0f766e",
    primaryText: "#f0fdfa"
  }
};
```

### 18.4 Initial Token Groups

V2 should standardize these theme groups:

- `colors`
- `typography`
- `radius`
- `spacing`
- `shadow`

Each group should contain documented token names. Unknown token names should not be relied on as public API.

### 18.5 Styling Delivery Model

The runtime should:

- inject one stable base stylesheet
- express default visual styling through CSS custom properties
- assign resolved theme values to the page root so child controls inherit them
- apply a small amount of runtime style directly where required for layout, positioning, or out-of-tree overlays

### 18.6 Public Styling Surface

Implemented public styling hooks should be limited to:

- `CssClass`
- `JOG.SetTheme(themeObject)`
- `JOG.GetTheme()`
- `JOG.Theme`
- `app.Theme`

Not part of the initial public API:

- arbitrary per-control style objects
- direct editing of generated framework CSS
- undocumented CSS variable names as compatibility guarantees

## 19. Error Handling and Diagnostics

JOG V2 should have a real diagnostic model.

### 19.1 Required Diagnostics

- duplicate control names in a container
- invalid parent-child relationships
- invalid lifecycle transitions
- attempts to update disposed controls
- missing required renderer support

### 19.2 Debug Features

- control tree dump
- dirty queue logging
- lifecycle transition logging
- event dispatch logging

## 20. Testing Requirements

### 20.1 Unit Tests

- control property setters update state correctly
- control methods enforce lifecycle rules
- render descriptors are valid

### 20.2 Renderer Tests

- initial mount
- state-driven update
- node removal
- listener attachment and cleanup

### 20.3 Integration Tests

- page boot
- window open and close
- modal dialog behavior
- textbox input propagation
- layout container behavior
- shell-control interaction behavior
- accessibility-sensitive keyboard flows

### 20.4 Sample App Regression

The example apps that define the target lane should continue to work under V2, especially shell, form, CRUD, and dialog flows.

That now explicitly includes:

- shell relayout after tab open and close
- dock-managed fill layouts that stay inside their parent shell
- dialog bodies that remain scrollable and reachable when content exceeds the initial window body

## 21. V2 Delivery Scope

### 21.1 Must-Have

- `Application`
- `Page`
- `Window`
- `Dialog`
- `Button`
- `Label`
- `TextBox`
- `Panel`
- `StackPanel`
- scheduler
- renderer
- lifecycle management
- event cleanup
- clear canonical authoring model around `Run(page)` and `OnX`

### 21.2 Should-Have

- `DockPanel`
- `SplitPanel`
- `SectionPanel`
- `Grid`
- `DataGrid`
- minimal store and binding
- modal overlay manager
- diagnostics mode
- first-pass shell controls
- responsive layout behavior

### 21.3 Can-Wait

- `TreeView`
- deeper shell-control behavior
- deeper collection-oriented state helpers
- full accessibility and keyboard pass

### 21.4 Current Data Scope Status

The first-pass data sprint is now implemented at a credibility level, not a finished end-state.

Implemented now:

- `JOG.Collection` for row identity, selection, explicit updates, dirty tracking, deleted-row tracking, and derived summaries
- `JOG.DataGrid` for explicit columns, collection-backed rows, single selection, basic formatting, row commands, and first-pass mouse resizing for pixel-width columns
- `OpportunityBoard` as the proving example for collection plus grid composition
- regression coverage for collection updates, selection, grid rerendering, and column resizing

Still remaining from a fuller business-app interpretation:

- sorting
- filtering
- inline grid editing
- persistence integration for collection mutations
- app-exposed persistence hooks for resized column widths if needed later
- keyboard-first and accessibility-grade grid interaction

## 22. Strategic Next Steps

JOG is now beyond the original migration phase. The next steps should optimize for alignment and product credibility in the business-app lane.

### 22.1 Unify The Public Contract

- align rationale docs, spec, developer guide, and API reference
- treat `Run(page)` and `OnX` as canonical
- keep compatibility aliases secondary

### 22.2 Harden Shell And Layout Behavior

- continue making desktop-style shell composition dependable
- keep reducing the remaining manual app-level chrome and sizing math after the `SplitPanel` and fill-layout pass
- deepen the layout story around multi-pane and tabbed shells beyond the current two-pane and tab-workspace baseline

### 22.3 Deepen Data-Heavy Primitives

- harden `DataGrid` now that the first pass exists
- add the next internal-tool behaviors in the right order: sorting, filtering, then inline editing
- keep row commands, selection, and predictable data flow as the baseline that must not regress

### 22.4 Improve State Leverage

- add stronger collection, selection, derived-state, and validation-orchestration helpers
- keep the programming model explicit rather than magical

### 22.5 Close The Accessibility Gap

- implement modal focus trap
- restore focus on close
- add keyboard behavior across shell controls
- add browser-level verification for interaction correctness

## 23. Acceptance Criteria

JOG V2 is acceptable when all of the following are true:

1. A developer can build a non-trivial app in plain JavaScript with no authored HTML beyond a host shell.
2. Public control setters do not directly mutate DOM nodes.
3. Repeated state changes are batched through the runtime.
4. Controls can be mounted, shown, hidden, and disposed without leaking listeners.
5. Windows and dialogs behave predictably with z-order and modal support.
6. At least one real sample app proves the productivity model.
7. The API remains straightforward for a desktop-style developer.
8. The shell and layout model are dependable enough that app code does not carry excessive chrome math.
9. The framework has a credible path for data-centric internal-tool work, including a serious grid strategy.
10. Accessibility and keyboard behavior are treated as product requirements, not deferred polish.

## 24. Summary

JOG V2 should be a plain-JavaScript, desktop-style browser UI runtime with:

- explicit control APIs
- a modern internal rendering architecture
- first-class windowing and layout
- business-app shell credibility
- stronger state leverage for CRUD and form workflows
- a first-pass data-centric flagship control in `DataGrid`, with a clear path to deeper behavior
- predictable lifecycle and cleanup
- zero requirement for app developers to write HTML or manipulate the DOM

That preserves the original intent while giving the framework a serious technical foundation.
