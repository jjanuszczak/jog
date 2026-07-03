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
- `DockPanel` now supports container and docked-child `Gap` spacing so shells can reserve chrome separation without manual margin glue
- `WorkspaceShell` now provides explicit header, sidebar, and content slots for common page-shell composition
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
- `WorkspaceShell`
- `SplitPanel`
- `StackPanel`
- `Repeater`
- `SectionPanel`
- `SectionPanel` responsive title and body-padding overrides
- `Grid`

### Controls

- `MenuBar`
- `ToolBar`
- `StatusBar`
- `PageHeader`
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
- `FormState`
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
- `BindEnabled(store, key, transform)`
- `SetError(message)`
- `ClearError()`
- `BindError(store, key)`
- `Store.Derive(key, dependencyKeys, compute)`
- `Collection.BindStore(store, key, eventKeys, compute)`
- `Repeater.BindCollection(collection, renderer)`
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
- notepad shell now uses dock gap spacing instead of manual menu and status bar margins
- customer admin example
- customer admin now demonstrates a `SplitPanel` left-nav-plus-content workspace
- customer admin now uses `PageHeader` instead of a manual fixed-height title panel
- customer admin now uses `WorkspaceShell` instead of wiring the page-shell header and fill region manually
- customer admin shell no longer overflows on the right edge
- customer admin shell now uses dock gap spacing instead of manual header margin coordination
- customer admin edit dialog now starts hidden correctly and uses a larger scrollable window body
- form demo with grid layout
- form demo with breakpoint-aware responsive grid layout
- form demo validation and inline error feedback
- form demo validation summary with reusable binding helpers
- form demo now uses derived store summary wiring instead of manual summary subscription glue
- form demo now uses `FormState` for validation orchestration
- form demo checkbox and radio-group invalid-state feedback
- opportunity board sample with CRM-style add, edit, and delete flows
- opportunity board migrated to `Collection` plus `DataGrid`
- opportunity board now uses collection-to-store binding helpers for board metrics and command-state wiring
- opportunity board now uses `FormState` for editor validation orchestration
- opportunity board now uses `Repeater` for collection-backed sidebar account rows
- opportunity board now uses `PageHeader` instead of a manual fixed-height title panel
- opportunity board now uses `WorkspaceShell` instead of wiring the page-shell header, sidebar, and fill region manually
- opportunity board now demonstrates first-pass resizable `DataGrid` columns
- opportunity editor dialog with breakpoint-aware responsive grid layout
- opportunity board shell with responsive dock and stack behavior
- opportunity board shell now uses dock gap spacing instead of manual header and sidebar margin coordination
- opportunity board now demonstrates responsive `SectionPanel` title and padding changes
- opportunity board use of built-in theme presets

### Tests

- Node test runner at `test/run-v2-tests.js`
- baseline coverage for store, collection, container rules, diagnostics, error binding, lifecycle guards, responsive grid breakpoints, responsive dock, dock-gap shell spacing, workspace-shell slot behavior, split, stack, section, and page-header behavior, browser text file helper flows, theme preset classes, richer window resize behavior, modal stacking, window lifecycle events, data-grid rendering, fill-based tab workspaces, shell relayout after tab mutations, dock-managed fill behavior, scrollable dialog content panes, and example-level integration flows including customer selection, dialog close branches, form reset behavior, and the opportunity board grid flow

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
- `DockPanel` now supports gap-driven shell spacing at both the container and docked-child level
- `WorkspaceShell` now covers the common header plus sidebar plus content shell pattern without manual child-order coordination
- `SplitPanel` now supports first-pane and second-pane sizing plus breakpoint-based orientation changes
- `SectionPanel` now supports a dedicated responsive helper surface for title and body-padding changes
- shell layout is substantially more dependable than it was before this hardening pass, but app code still owns deeper multi-pane workspace composition decisions
- the framework still lacks deeper workspace management beyond `WorkspaceShell`, `DockPanel`, and `SplitPanel`
- `WorkspaceShell` still lacks convenience helpers for common sidebar sizing and shell-region sizing patterns, so apps still set widths and responsive collapse behavior directly on child controls

### Shell Controls

- `MenuBar` exists as a first minimal shell control with flat clickable items
- `ToolBar` exists as a first minimal shell container for command controls
- `StatusBar` exists as a first minimal shell container for status content
- `PageHeader` exists as a narrow shell primitive for page title and subtitle chrome
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
- a third-party control specification now exists in `doc/third-party-control-spec.md`, but the runtime does not yet expose a public extension API that implements it

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
- `FormState` now covers the repeated pattern where app code wants store-driven field errors, one summary key, and revalidation watches without hand-written subscription glue
- app code still owns the validation rules and explicit save timing

### State and Data

- explicit store binding is working well for single-record forms
- `Collection` now covers row identity, selection, update patterns, dirty tracking, deleted-row tracking, and derived summaries
- `Store.Derive()` now covers explicit store-to-store derived keys
- `Repeater.BindCollection()` now covers first-pass collection-backed repeated UI
- `Collection.BindStore()` now covers explicit collection-to-store derived page state
- `DataGrid` now covers columns, rows, single selection, basic formatting, dirty-row styling, row commands, and first-pass mouse resizing for pixel-width columns
- app code still owns sorting, filtering, inline editing flows, persistence, and keyboard-heavy interaction behavior
- collection-to-control binding is still explicit, but the new helpers now cover a large share of repeated summary, selection, command-state, validation-summary, and simple repeated-row glue
- resized column widths currently persist only in memory for the lifetime of the grid instance
- the initial data-grid sprint goal is met at a credible first-pass level, but not yet at a production-depth level

## Next Priorities

1. Shell and layout hardening
2. DataGrid depth and behavior hardening
3. Third-party control extensibility
4. Accessibility and keyboard model
5. Deeper shell-control behavior
6. Browser-level interaction verification

### 1. Shell And Layout Hardening

- keep making shell layout boring and dependable across more than the current examples
- reduce the remaining multi-pane sizing and deeper workspace-composition glue in app code
- keep tightening the higher-level shell primitives now that header plus sidebar plus content composition is runtime-managed
- evaluate whether `WorkspaceShell` should grow narrow convenience helpers for sidebar sizing, responsive sidebar collapse, or other repeated shell-region sizing patterns
- keep hardening container interactions so tab, split, and dialog-heavy shells stay stable without manual coordination

### 2. DataGrid Depth And Behavior Hardening

- add sorting and filtering without breaking the explicit collection model
- add inline editing patterns only after the row-command and dialog flows are stable
- harden column sizing and layout behavior for wider datasets
- keep resized column widths in memory only for now, then later decide whether apps need hooks for saved views or per-user persistence
- expose finer per-column overflow and sizing behavior once more than the OpportunityBoard example needs it
- keep `TreeView` behind deeper `DataGrid` maturity unless a concrete app need pulls it forward

### 3. Third-Party Control Extensibility

- implement a formal third-party control registration model instead of relying on runtime patching or private internals
- define and document the supported extension contract for `Control`, `Container`, `Window`, and `Dialog`
- expose documented extension lifecycle hooks so third-party controls do not need to bind to underscored runtime details
- add control-package metadata and compatibility checks so JOG can reject duplicate or incompatible registrations cleanly
- make diagnostics aware of registered third-party control names and package versions
- prove the docs by building at least one real third-party control package outside the core runtime source using only the published third-party developer specification
- feed anything awkward or missing from that proof build back into the runtime contract and the developer docs before calling the model stable

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
