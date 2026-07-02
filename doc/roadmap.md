# JOG V2 Roadmap

## Status

This roadmap tracks implementation reality, not aspiration. Update it whenever framework work lands.

## Current Direction

JOG should optimize for one narrow product lane:

- browser-based internal tools
- line-of-business applications
- form-heavy and CRUD-heavy workflows
- desktop-style shells with tabs, dialogs, status chrome, and predictable state flow

That means the next phase is not broad control expansion for its own sake. The next phase is making shell layout dependable, shipping stronger data-heavy primitives, improving state leverage, and closing the keyboard and accessibility gap.

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
- follow-up viewport layout pass after app mount so fill-based shells can settle against measured browser dimensions
- page-level flow layout for direct child controls, with windows and dialogs remaining absolute
- narrow `Fill` layout flag for stretching workspace content inside shell layouts
- `Fill` no longer overrides dock-managed child width and height with raw `100%` sizing, which keeps page shells and split workspaces inside their containers
- container child-structure changes now also dirty parent layout so docked shells reflow after tab and workspace mutations
- control-level invalid state and error text
- application diagnostics with debug logging and tree dump
- public theme API with global and per-application token overrides
- built-in theme presets for selected control types
- narrow browser text file helpers through `JOG.Browser.OpenTextFile()` and `JOG.Browser.SaveTextFile()`
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
- `SplitPanel`
- `StackPanel`
- `SectionPanel`
- `Grid`

### Controls

- `MenuBar`
- `ToolBar`
- `StatusBar`
- `TabControl`
- `DataGrid`
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
- `Collection`
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
- collection row identity, selection, dirty tracking, and derived summary definitions

### Windows and Dialogs

- draggable windows
- resizable windows with edge and corner handles
- close button support
- close-on-escape support
- modal dialogs
- stacked modal overlay behavior across multiple visible dialogs
- window lifecycle hooks with `OnLoad`, `OnShow`, `OnHide`, and `OnClose`
- configurable close button label
- scrollable window and dialog content panes so oversized dialog bodies stay reachable inside the window shell

### Example Apps

- bare-bones hello world example
- simple example app
- notepad example with multi-document tabs and browser file open/save flows
- notepad now uses fill-based tab workspace composition without manual viewport resize math
- notepad shell now reflows correctly after document tab open and close operations
- notepad now uses runtime-managed browser file open and save helpers instead of direct picker and fallback DOM glue
- notepad now reports file-operation failures through a JOG dialog instead of browser `alert()` UI
- customer admin example
- customer admin now demonstrates a `SplitPanel` left-nav-plus-content workspace
- customer admin shell no longer overflows on the right edge
- customer admin edit dialog now starts hidden correctly and uses a larger scrollable window body
- form demo with grid layout
- form demo with breakpoint-aware responsive grid layout
- form demo validation and inline error feedback
- form demo validation summary with reusable binding helpers
- form demo checkbox and radio-group invalid-state feedback
- opportunity board sample with CRM-style add, edit, and delete flows
- opportunity board migrated to `Collection` plus `DataGrid`
- opportunity board now demonstrates first-pass resizable `DataGrid` columns
- opportunity editor dialog with breakpoint-aware responsive grid layout
- opportunity board shell with responsive dock and stack behavior
- opportunity board use of built-in theme presets

### Tests

- Node test runner at `test/run-v2-tests.js`
- baseline coverage for store, collection, container rules, diagnostics, error binding, lifecycle guards, responsive grid breakpoints, responsive dock, split, and stack behavior, browser text file helper flows, theme preset classes, richer window resize behavior, modal stacking, window lifecycle events, data-grid rendering, fill-based tab workspaces, shell relayout after tab mutations, dock-managed fill behavior, scrollable dialog content panes, and example-level integration flows including customer selection, dialog close branches, form reset behavior, and the opportunity board grid flow

## Partial

### Window System

- modal stacking, drag, resize, and lifecycle hooks are working
- window and dialog content panes now scroll internally when body content exceeds the available height
- modal focus trap is not implemented yet
- focus restoration after dialog close is not implemented yet
- broader keyboard-first dialog behavior still needs hardening
- the window system is usable, but not yet production-grade from an accessibility standpoint

### Layout

- `Grid` now has breakpoint-based responsive track and placement overrides
- `StackPanel` now has breakpoint-based orientation and spacing overrides
- `DockPanel` now supports responsive shell and child layout changes through inherited `ResponsiveLayout`
- `SplitPanel` now supports first-pane and second-pane sizing plus breakpoint-based orientation changes
- `SectionPanel` still has no dedicated responsive helper surface
- shell layout is substantially more dependable than it was before this hardening pass, but app code still owns higher-level chrome composition decisions
- the framework still lacks deeper multi-pane workspace management beyond `DockPanel` plus `SplitPanel`

### Shell Controls

- `MenuBar` exists as a first minimal shell control with flat clickable items
- `ToolBar` exists as a first minimal shell container for command controls
- `StatusBar` exists as a first minimal shell container for status content
- `TabControl` exists as a first minimal tabbed container with explicit `TabPage` children
- nested menus, accelerators, and keyboard navigation are not implemented yet
- toolbar overflow, separators, richer status conventions, closable tabs, and drag reordering are not implemented yet
- shell controls are proving the concept, but still need more depth before they can carry a long-lived business app without custom glue

### Events

- shorthand aliases still exist alongside the preferred `OnX` style

### API Contract

- the runtime, examples, and current developer docs now center the authoring model around `new`, property assignment, `Add`, `OnX`, and `Application.Run(page)`
- older rationale documents still contain outdated or broader examples, including `Click(listener)`-first guidance and older future-control framing
- the public contract needs to be reconciled so contributors have one canonical programming model

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

### State and Data

- explicit store binding is working well for single-record forms
- `Collection` now covers row identity, selection, update patterns, dirty tracking, deleted-row tracking, and derived summaries
- `DataGrid` now covers columns, rows, single selection, basic formatting, dirty-row styling, row commands, and first-pass mouse resizing for pixel-width columns
- app code still owns sorting, filtering, inline editing flows, persistence, and keyboard-heavy interaction behavior
- collection-to-control binding is still split between `Collection` subscriptions and `Store` bindings rather than a broader derived-state layer
- resized column widths currently persist only in memory for the lifetime of the grid instance
- the initial data-grid sprint goal is met at a credible first-pass level, but not yet at a production-depth level

## Next Priorities

1. Shell and layout hardening
2. Richer binding and app-state helpers
3. DataGrid depth and behavior hardening
4. Accessibility and keyboard model
5. Deeper shell-control behavior
6. Browser-level interaction verification

### 1. Shell And Layout Hardening

- keep making shell layout boring and dependable across more than the current examples
- reduce the remaining explicit height, offset, and chrome math in app code
- add stronger desktop-style shell composition primitives such as split-workspace and left-nav-plus-content patterns
- keep hardening container interactions so tab, split, and dialog-heavy shells stay stable without manual coordination

### 2. Richer Binding And App-State Helpers

- add stronger support for collection updates and repeated UI structures
- improve validation orchestration helpers
- improve selection, dirty tracking, and derived-value patterns without turning JOG into a magic framework
- if the next flagship example needs a stronger browser-native utility story, use the planned Browser Data and Settings Utility captured in `doc/browser-data-settings-utility-prd.md`
- keep the model explicit and JavaScript-first

### 3. DataGrid Depth And Behavior Hardening

- add sorting and filtering without breaking the explicit collection model
- add inline editing patterns only after the row-command and dialog flows are stable
- harden column sizing and layout behavior for wider datasets
- keep resized column widths in memory only for now, then later decide whether apps need hooks for saved views or per-user persistence
- expose finer per-column overflow and sizing behavior once more than the OpportunityBoard example needs it
- keep `TreeView` behind deeper `DataGrid` maturity unless a concrete app need pulls it forward

## Remaining From Initial Data Scope

- sorting is still deferred
- filtering is still deferred
- inline editing inside `DataGrid` is still deferred
- persistence of collection mutations remains app-owned
- keyboard-first and accessibility-grade grid behavior remains unfinished

### 4. Accessibility And Keyboard Model

- add modal focus trap
- restore focus after dialog close
- add keyboard navigation for `MenuBar`
- add keyboard navigation for `TabControl`
- review control labeling and semantics
- treat accessibility as framework completeness, not deferred polish

### 5. Deeper Shell-Control Behavior

- add menu hierarchy and better command behavior where appropriate
- add toolbar overflow and separators
- add stronger status-bar conventions
- add closable and reorderable tabs when the underlying shell behavior is stable

### 6. Browser-Level Interaction Verification

- keep the zero-dependency Node suite for fast regression coverage
- add lightweight real-browser verification for focus order, keyboard flows, modal correctness, and pointer interaction edge cases

## Deferred

- tree view
- arbitrary per-control style objects
- npm package publishing unless the release artifact workflow later proves insufficient
- broad browser-service abstractions beyond focused runtime helpers such as file picking

## Documentation Rule

When a feature lands:

1. update `doc/developer-guide.md`
2. update `doc/api-reference.md`
3. update this roadmap

Do that in the same change as the code.
