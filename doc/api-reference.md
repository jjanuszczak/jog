# JOG V2 API Reference

## Status

This reference covers the implemented public API in [v2/JOG.js](../v2/JOG.js). If code and this document diverge, update this document immediately.

## Application Types

### `JOG.SetTheme(theme)`

Sets the global default theme for JOG applications.

Notes:

- accepts a partial token object
- merges with the built-in default theme
- updates already-running applications that do not supply an overriding `app.Theme`

### `JOG.GetTheme()`

Returns the current merged global theme object.

### `JOG.Theme`

Alias property for the global theme.

Notes:

- reading `JOG.Theme` returns the current merged global theme
- assigning `JOG.Theme = {...}` is equivalent to calling `JOG.SetTheme({...})`

### `JOG.Browser.OpenTextFile(options)`

Opens one text file through the browser and resolves with its contents.

Options supported now:

- `types`

Resolved result shape:

- `name`
- `text`
- `file`
- `handle`
- `method`

Notes:

- returns `null` when the user cancels the picker
- prefers `showOpenFilePicker()` when the browser supports it
- falls back to a runtime-managed hidden native file input when modern picker APIs are unavailable
- `method` is currently `picker` or `input`
- this helper is intentionally narrow and text-file-oriented

### `JOG.Browser.SaveTextFile(options)`

Saves text through the browser and resolves with save metadata.

Options supported now:

- `text`
- `handle`
- `saveAs`
- `suggestedName`
- `types`

Resolved result shape:

- `name`
- `handle`
- `method`

Notes:

- returns `null` when the user cancels a picker-driven save
- reuses `options.handle` when possible unless `saveAs` is true
- prefers `showSaveFilePicker()` when a new handle is needed and the browser supports it
- falls back to a runtime-managed download link when modern save-picker APIs are unavailable
- `method` is currently `handle`, `picker`, or `download`
- this helper is intentionally narrow and text-file-oriented

### `JOG.Application`

Methods:

- `Run(page)`
- `DumpTree()`
- `DumpTree(options)`
- `LogTree()`
- `LogTree(options)`

Properties:

- `Runtime`
- `MainPage`
- `Debug`
- `DebugTopics`
- `Theme`

Notes:

- `Run(page)` attaches to `document.body` and performs the first render.
- `Run(page)` also injects the base document reset used by the runtime, including zeroing the default browser body margin and padding
- `Run(page)` also schedules one follow-up viewport layout pass so fill-based shell layouts can settle against measured browser dimensions after mount
- `Debug = true` enables runtime console logging for dirty queue activity, lifecycle work, and event dispatch
- `DebugTopics` optionally filters debug output to selected categories such as `event`, `lifecycle`, `dirty`, and `flush`
- `Theme` accepts a partial theme object that overrides the global JOG theme for that application only
- runtime render and event failures are logged with structured `[JOG][Error][...]` diagnostics before the original error is rethrown
- `DumpTree()` returns a text representation of the current control tree
- `DumpTree({ detailed: true })` includes richer control state such as text, title, docking, grid placement, validation state, and child counts when relevant
- `LogTree()` writes that control tree to the console
- `LogTree({ detailed: true })` writes the richer tree format to the console

Theme token groups supported now:

- `colors`
- `typography`
- `radius`
- `spacing`
- `shadow`

Current token keys:

- `colors.appBackground`
- `colors.surface`
- `colors.surfaceMuted`
- `colors.text`
- `colors.textMuted`
- `colors.textStrong`
- `colors.border`
- `colors.borderSoft`
- `colors.primary`
- `colors.primaryText`
- `colors.danger`
- `colors.dangerText`
- `colors.overlay`
- `colors.resizeGrip`
- `typography.fontFamily`
- `typography.fontSize`
- `typography.captionSize`
- `typography.titleSize`
- `typography.lineHeight`
- `radius.control`
- `radius.section`
- `radius.shell`
- `radius.window`
- `spacing.pagePadding`
- `spacing.sectionHeaderX`
- `spacing.sectionHeaderY`
- `spacing.sectionBody`
- `spacing.windowContent`
- `spacing.controlPaddingX`
- `spacing.controlPaddingY`
- `spacing.closeButtonX`
- `spacing.closeButtonY`
- `spacing.fieldGap`
- `spacing.listPadding`
- `shadow.shell`
- `shadow.section`
- `shadow.window`
- `shadow.invalidRing`

The built-in stylesheet consumes these tokens for page chrome, panels, windows, buttons, inputs, validation styling, and modal overlay styling.

### `JOG.Page`

Extends `JOG.Container`.

Properties:

- inherited component properties
- `Title`

Notes:

- root app container
- updates `document.title`
- direct child controls use normal flow layout by default
- `Window` and `Dialog` remain absolutely positioned when added directly to a page

### `JOG.MenuBar`

Extends `JOG.Control`.

Properties:

- `Items`

Events:

- `OnItemClick(listener)`

Item shape supported now:

- `key`
- `text`
- `enabled`

Notes:

- renders a horizontal strip of menu buttons
- `Items` also accepts an array of strings, which become menu items with generated keys
- click events expose the selected item through `args.Key` and `args.Value`
- disabled items render but do not emit click events
- nested submenus, keyboard navigation, and accelerators are not implemented yet

### `JOG.ToolBar`

Extends `JOG.Container`.

Properties:

- inherited container and component properties

Methods:

- `Add(child)`
- `Remove(child)`
- `Clear()`

Notes:

- renders a horizontal shell container for command controls
- child controls use normal flow layout inside the toolbar
- intended for composing `Button`, `Label`, and future command widgets
- overflow handling, separators, and richer command metadata are not implemented yet

### `JOG.StatusBar`

Extends `JOG.Container`.

Properties:

- inherited container and component properties

Methods:

- `Add(child)`
- `Remove(child)`
- `Clear()`

Notes:

- renders a horizontal shell container for status content
- child controls use normal flow layout inside the status bar
- intended for composing `Label` and other lightweight readout controls
- segmented regions, resize grips, and richer status conventions are not implemented yet

### `JOG.PageHeader`

Extends `JOG.Control`.

Properties:

- `TitleText`
- `SubtitleText`

Notes:

- renders a stacked shell header for page-level title and subtitle chrome
- sizes itself from content instead of requiring a fixed explicit height
- works cleanly as a `Dock = "top"` header inside `DockPanel`
- intended to replace manual top panels that only exist to position title and subtitle labels

### `JOG.TabPage`

Extends `JOG.Container`.

Properties:

- `Title`
- `TabKey`

Notes:

- intended only as a child of `JOG.TabControl`
- hosts the content for one tab pane
- child controls use normal flow layout inside the tab page
- `Fill = true` on a child control can now stretch that child through the tab workspace when the page layout calls for it

### `JOG.TabControl`

Extends `JOG.Container`.

Properties:

- `ActiveTab`

Methods:

- `Add(child)`
- `Remove(child)`
- `Clear()`
- `OnTabChange(listener)`

Notes:

- accepts `JOG.TabPage` children only
- renders one tab button per `TabPage`
- derives each tab header from `TabPage.Title`, with fallback to `Name`
- uses `TabPage.TabKey` or `Name` to identify the active tab
- hides inactive tab pages
- works more cleanly as a full-height workspace host when used with `Fill = true`
- closable tabs, drag reordering, overflow handling, and docking behavior are not implemented yet

## Base Types

### `JOG.Component`

Common properties:

- `Name`
- `Parent`
- `Visible`
- `Enabled`
- `Width`
- `Height`
- `MinWidth`
- `MinHeight`
- `MaxWidth`
- `MaxHeight`
- `Top`
- `Left`
- `Text`
- `CssClass`
- `Tooltip`
- `Invalid`
- `ErrorText`
- `Padding`
- `Margin`
- `Gap`
- `Fill`
- `ResponsiveLayout`
- `GridColumn`
- `GridRow`
- `ResponsiveGrid`
- `ColumnSpan`
- `RowSpan`
- `Dock`
- `ThemePreset`

Common methods:

- `Show()`
- `Hide()`
- `Dispose()`
- `Refresh()`
- `Focus()`
- `Location(x, y)`
- `Size(width, height)`
- `SetBounds(x, y, width, height)`
- `SetError(message)`
- `ClearError()`
- `BindError(store, key)`
- `BindVisible(store, key, transform)`
- `BindEnabled(store, key, transform)`

Notes:
- `Fill` stretches ordinary flow-layout controls with flex and `100%` sizing when appropriate
- dock-managed children inside `DockPanel` still honor `Fill` for stretch intent, but do not keep raw `100%` width or height overrides because dock layout owns those dimensions
- `Gap` is a generic spacing property, but `DockPanel` now uses it specifically for spacing between docked regions
- `WorkspaceShell` also uses `Dock` and `Fill` through the same dock-managed layout path as `DockPanel`
- `Dock` accepts `none`, `top`, `bottom`, `left`, `right`, `fill`
- `ResponsiveLayout` accepts breakpoint keys `base`, `sm`, `md`, `lg`, and `xl`
- `ResponsiveLayout` breakpoint values can override `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `left`, `top`, `padding`, `margin`, `gap`, and `dock`
- `ResponsiveGrid` accepts breakpoint keys `base`, `sm`, `md`, `lg`, and `xl`
- `ResponsiveGrid` breakpoint values can override `column`, `row`, `area`, `columnSpan`, and `rowSpan`
- `ThemePreset` is a small built-in presentation hook, not an arbitrary style object
- `Fill = true` is a narrow stretch hint for shell and workspace layouts
- `ColumnSpan` and `RowSpan` default to `1`
- `SetError(message)` sets both `ErrorText` and `Invalid`
- `ClearError()` clears both
- `BindError(store, key)` binds control error state to a store key whose value is an error string or empty
- `BindVisible(store, key, transform)` binds control visibility to a store key, with an optional mapper
- `BindEnabled(store, key, transform)` binds control enabled state to a store key, with an optional mapper

### `JOG.Control`

Extends `JOG.Component`.

Event registration methods:

- preferred style: `OnX(listener)`
- compatibility aliases remain supported
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

Notes:

- `OnClick`, `OnChange`, `OnFocus`, `OnBlur`, `OnKeyDown`, and `OnKeyUp` are the preferred registration methods
- `Click`, `Change`, `Blur`, `KeyDown`, and `KeyUp` remain available as compatibility aliases
- `Focus()` is an imperative component method, so focus event registration uses `OnFocus(listener)`

### `JOG.Container`

Extends `JOG.Control`.

Properties:

- `Children`

Methods:

- `Add(child)`
- `Remove(child)`
- `Clear()`

Rules enforced now:

- cannot add `null`
- cannot add a container to itself
- cannot add the same child twice
- cannot add a child already owned by a different parent
- duplicate child names in a container throw

## Layout Containers

### `JOG.Panel`

Extends `JOG.Container`.

Use for simple absolute-position regions.

### `JOG.DockPanel`

Extends `JOG.Container`.

Uses child `Dock` values and respects:

- container `Padding`
- container `Gap`
- child `Margin`
- docked-child `Gap` overrides
- explicit child `Width` and `Height` where relevant

Responsive support:

- container-level changes can use inherited `ResponsiveLayout`
- child dock, width, height, margin, and gap changes can also use inherited `ResponsiveLayout`

Notes:

- still the main shell-chrome container for top, bottom, left, right, and fill regions
- a docked child `Gap` applies spacing after that region and overrides the panel-level gap for that one child

### `JOG.WorkspaceShell`

Extends `JOG.DockPanel`.

Properties:

- `Header`
- `Sidebar`
- `Content`
- `SidebarLayout`

Notes:

- provides explicit shell slots for header plus sidebar plus content composition
- defaults `Header` children to `Dock = "top"` when no explicit dock is already set
- defaults `Sidebar` children to `Dock = "left"` when no explicit dock is already set
- `SidebarLayout` projects a shell-owned responsive dock, width, height, and gap pattern onto the sidebar child
- defaults `Content` children to `Dock = "fill"` when no explicit dock is already set
- keeps slotted children ordered as header, sidebar, then content even if assigned in a different sequence
- slotted children can still use inherited `ResponsiveLayout`, so a sidebar can collapse to a top region on smaller widths

### `JOG.SplitPanel`

Extends `JOG.Container`.

Properties:

- `Orientation`
- `FirstPaneSize`
- `SecondPaneSize`
- `Gap`
- `Responsive`

Notes:

- intended for two-pane workspace composition such as left-nav-plus-content
- `Orientation` accepts `horizontal` or `vertical`
- `FirstPaneSize` and `SecondPaneSize` accept pixel numbers
- `Responsive` uses breakpoint keys `base`, `sm`, `md`, `lg`, and `xl`
- `Responsive` breakpoint values can override `orientation`, `gap`, `firstPaneSize`, and `secondPaneSize`
- children use flow layout and stretch more cleanly when the child control also uses `Fill = true`

### `JOG.StackPanel`

Extends `JOG.Container`.

Properties:

- `Orientation`
- `Spacing`
- `Responsive`

Notes:

- `Orientation` accepts `vertical` or `horizontal`
- `Gap` also works because it comes from `Component`
- render implementation prefers `Gap` when both are set
- `Responsive` uses breakpoint keys `base`, `sm`, `md`, `lg`, and `xl`
- `Responsive` breakpoint values can override `orientation`, `spacing`, and `gap`

### `JOG.Repeater`

Extends `JOG.StackPanel`.

Properties:

- inherited stack-panel and component properties
- `EmptyText`

Methods:

- `BindCollection(collection, renderer)`

Notes:

- renders one child control per collection row
- `renderer(row, index, collection)` must return a JOG control
- re-renders on collection `change` events
- renders one fallback `Label` with `EmptyText` when the collection is empty
- stays explicit, it does not add templates, keyed diffing, or virtualized rendering

### `JOG.SectionPanel`

Extends `JOG.Container`.

Properties:

- `Title`
- `Responsive`

Notes:

- creates a titled frame with an internal body region
- children are added to the body area, not the outer node
- `ThemePreset` supports `primary` and `muted`
- `Responsive` uses breakpoint keys `base`, `sm`, `md`, `lg`, and `xl`
- `Responsive` breakpoint values can override `title` and `padding`

### `JOG.Grid`

Extends `JOG.Container`.

Properties:

- `Columns`
- `Rows`
- `Areas`
- `AutoRows`
- `AutoFlow`
- `ColumnGap`
- `RowGap`
- `Responsive`

Child placement:

- `GridColumn`
- `GridRow`
- `GridArea`
- `ColumnSpan`
- `RowSpan`
- `ResponsiveGrid`

Responsive breakpoints:

- `base`
- `sm` at `640px`
- `md` at `768px`
- `lg` at `1024px`
- `xl` at `1280px`

`Responsive` breakpoint values can override:

- `columns`
- `rows`
- `areas`
- `autoRows`
- `autoFlow`
- `columnGap`
- `rowGap`

Current limitations:

- no container-query model

### `JOG.DataGrid`

Extends `JOG.Control`.

Properties:

- `Columns`
- `RowCommands`
- `Collection`
- `EmptyText`
- `SelectionMode`
- `ResizableColumns`
- `SortKey`
- `SortDirection`
- `FilterText`
- `FilterColumns`
- `FilterPredicate`

Events:

- `OnSelectionChange(listener)`
- `OnRowCommand(listener)`
- `OnSortChange(listener)`
- `OnCellEditStart(listener)`
- `OnCellEditCommit(listener)`

Methods:

- `SetSort(columnKey, direction)`
- `ClearSort()`

Column shape supported now:

- `key`
- `field`
- `title`
- `width`
- `minWidth`
- `maxWidth`
- `align`
- `formatter`
- `sortValue`
- `filterValue`
- `parseValue`
- `editable`
- `editor`
- `options`
- `sortable`
- `overflow`
- `resizable`

Row command shape supported now:

- `key`
- `text`
- `themePreset`
- `enabled`
- `visible`

Notes:

- binds to a `JOG.Collection`
- renders a header row plus one rendered row per collection record
- supports single-row selection or `SelectionMode = "none"`
- `ResizableColumns = true` enables mouse-driven header resizing for columns that already use explicit pixel widths
- `SortKey` plus `SortDirection` control the current view-level sort
- `FilterText` plus `FilterColumns` or `FilterPredicate` filter visible rows without mutating the underlying collection
- inline editing supports text, textarea, and select editors, and commits collection updates directly through the bound row id
- moving directly from one editable cell to another commits the current edit before opening the next editor
- `minWidth` plus `maxWidth` bound mouse-driven pixel-width resizing
- `minWidth` plus `maxWidth` also bound flexible `1fr` columns without forcing a fixed pixel width
- `overflow` accepts `truncate`, `wrap`, or `clip`
- row command events expose `args.Key`, `args.RowId`, `args.Row`, and `args.Command`
- sort-change events expose the current column and direction
- cell-edit events expose the edited row, column, and committed value
- dirty and selected rows receive built-in styling
- virtualization, touch resizing, and keyboard navigation are not implemented yet

## Controls

### `JOG.Label`

Extends `JOG.Control`.

Methods:

- `BindText(store, key, formatter)`

Common usage:

```js
var label = new JOG.Label();
label.Text = "Customer Name";
```

Preset support:

- `ThemePreset = "primary"`
- `ThemePreset = "strong"`

### `JOG.ValidationMessage`

Extends `JOG.Label`.

Methods:

- `BindMessage(store, key, formatter)`

Notes:

- defaults to the built-in error text styling
- auto-hides when the bound message is empty

### `JOG.ValidationSummary`

Extends `JOG.SectionPanel`.

Methods:

- `BindSummary(store, key, formatter)`
- `BindErrors(store, keys, formatter)`

Notes:

- defaults `Title` to `Validation Summary`
- auto-hides when the bound summary is empty
- can derive a summary message directly from multiple error keys
- manages one internal `ValidationMessage` child

### `JOG.Button`

Extends `JOG.Control`.

Common usage:

```js
var button = new JOG.Button();
button.Text = "Save";
button.OnClick(function() {
  // handler
});
```

Preset support:

- `ThemePreset = "primary"`
- `ThemePreset = "danger"`
- `ThemePreset = "quiet"`

### `JOG.TextBox`

Extends `JOG.Control`.

Properties:

- inherited common properties
- `Placeholder`

Methods:

- `BindText(store, key)`

Emits:

- `Change`
- `Focus`
- `Blur`
- `KeyDown`
- `KeyUp`

Notes:

- supports invalid styling through inherited `Invalid` and `ErrorText`

### `JOG.TextArea`

Extends `JOG.Control`.

Properties:

- inherited common properties
- `Placeholder`

Methods:

- `BindText(store, key)`

Notes:

- shares the same binding helper as `TextBox`
- supports invalid styling through inherited `Invalid` and `ErrorText`

### `JOG.CheckBox`

Extends `JOG.Control`.

Properties:

- `Checked`

Methods:

- `BindChecked(store, key)`

Notes:

- supports invalid styling through inherited `Invalid` and `ErrorText`

### `JOG.RadioButton`

Extends `JOG.Control`.

Properties:

- `Checked`
- `GroupName`
- `Value`

Methods:

- `BindSelectedValue(store, key)`

Notes:

- intended to be used in a group where each radio binds to the same store key
- supports invalid styling through inherited `Invalid` and `ErrorText`
- radio-group validation can be applied at the container level by binding the error key to the parent `StackPanel`

### `JOG.DropDownList`

Extends `JOG.Control`.

Properties:

- `Options`
- `SelectedValue`

Methods:

- `BindSelectedValue(store, key)`

Options format:

```js
[
  { value: "enterprise", text: "Enterprise" },
  { value: "growth", text: "Growth" }
]
```

Plain string arrays also work.

Supports invalid styling through inherited `Invalid` and `ErrorText`.

### `JOG.ListBox`

Extends `JOG.Control`.

Properties:

- `Options`
- `SelectedValue`
- `SizeRows`

Methods:

- `BindSelectedValue(store, key)`

Notes:

- single-select only at present
- supports invalid styling through inherited `Invalid` and `ErrorText`

## Windows

### `JOG.Window`

Extends `JOG.Container`.

Properties:

- `Title`
- `Modal`
- `Draggable`
- `Resizable`
- `CloseButtonVisible`
- `CloseButtonText`
- `CloseOnEscape`

Methods:

- inherited common and container methods
- `ShowModal()`
- `Close()`
- `BringToFront()`
- `OnLoad(listener)`
- `OnShow(listener)`
- `OnHide(listener)`
- `OnClose(listener)`

Notes:

- `Resizable = true` enables edge and corner resize handles
- resize behavior respects `MinWidth` and `MinHeight`
- width defaults to `420px` if not set
- visible modal windows share one overlay, which stays under the top modal and above lower modal windows
- `OnLoad(listener)` fires once after the window mounts
- `OnShow(listener)` fires when the rendered window becomes visible, including the first visible mount
- `OnHide(listener)` fires when the rendered window becomes hidden, but not for an initially hidden mount

### `JOG.Dialog`

Extends `JOG.Window`.

Notes:

- defaults `Modal = true`

## Store and Events

### `JOG.Store`

Methods:

- `Get(key)`
- `Set(key, value)`
- `Subscribe(key, listener)`
- `Derive(key, dependencyKeys, compute)`

Notes:

- `Subscribe` returns an unsubscribe function
- `Set` does nothing if the new value is strictly equal to the old value
- `Derive` returns an unsubscribe function and keeps one store key in sync from other store keys through an explicit compute function

### `JOG.FormState`

Constructor:

- `new JOG.FormState(store, options)`

Options supported now:

- `summaryKey`
- `validKey`
- `summaryFormatter`
- `validations`

Validation item shape:

- `errorKey`
- `validate(currentStore)`

Methods:

- `Validate()`
- `ClearErrors()`
- `Watch(keys, options)`
- `StopWatching()`

Notes:

- `Validate()` writes each configured error key back into the store and returns `true` when no errors remain
- `ClearErrors()` clears configured error keys and resets `summaryKey` and `validKey` when those options are present
- `Watch(keys)` re-runs validation only when one of the watched keys changes and the form currently has errors
- `Watch(keys, { mode: "always" })` validates on every watched key change
- this helper is intentionally narrow and store-oriented, not a form-schema system

### `JOG.Collection`

Methods:

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
- `IsSelected(id)`
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

Notes:

- constructor accepts `{ idKey, rows, summaryDefinitions, selectedId, selectedIds }`
- row ids are compared as strings using the configured `idKey`
- `Update(id, updaterOrPatch)` accepts either a function or a shallow patch object
- dirty tracking covers changed current rows plus deleted baseline rows
- `MarkClean()` without ids resets the current snapshot as the clean baseline
- subscription keys are `rows`, `selection`, `dirty`, `summary`, and `change`
- `BindStore(store, key, eventKeys, compute)` pushes explicit collection-derived values into a target store key and returns an unsubscribe function

### `JOG.EventArgs`

Properties:

- `Source`
- `Type`
- `OriginalEvent`
- `Handled`
- `Value`
- `Key`
- `RowId`
- `Row`
- `Column`
- `Command`
- `Index`

## Minimal Example

```js
var store = new JOG.Store({
  name: "Atlas Bio"
});

var page = new JOG.Page();
page.Title = "Example";

var form = new JOG.StackPanel();
form.Orientation = "vertical";
form.Gap = 10;

var nameInput = new JOG.TextBox();
nameInput.BindText(store, "name");

var output = new JOG.Label();
output.Text = store.Get("name");

store.Subscribe("name", function(value) {
  output.Text = value;
});

form.Add(nameInput);
form.Add(output);
page.Add(form);

new JOG.Application().Run(page);
```
