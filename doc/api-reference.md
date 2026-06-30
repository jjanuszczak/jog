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

Notes:

- `Dock` accepts `none`, `top`, `bottom`, `left`, `right`, `fill`
- `ResponsiveLayout` accepts breakpoint keys `base`, `sm`, `md`, `lg`, and `xl`
- `ResponsiveLayout` breakpoint values can override `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `left`, `top`, `padding`, `margin`, `gap`, and `dock`
- `ResponsiveGrid` accepts breakpoint keys `base`, `sm`, `md`, `lg`, and `xl`
- `ResponsiveGrid` breakpoint values can override `column`, `row`, `area`, `columnSpan`, and `rowSpan`
- `ThemePreset` is a small built-in presentation hook, not an arbitrary style object
- `ColumnSpan` and `RowSpan` default to `1`
- `SetError(message)` sets both `ErrorText` and `Invalid`
- `ClearError()` clears both
- `BindError(store, key)` binds control error state to a store key whose value is an error string or empty
- `BindVisible(store, key, transform)` binds control visibility to a store key, with an optional mapper

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
- child `Margin`
- explicit child `Width` and `Height` where relevant

Responsive support:

- container-level changes can use inherited `ResponsiveLayout`
- child dock, width, height, and margin changes can also use inherited `ResponsiveLayout`

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

### `JOG.SectionPanel`

Extends `JOG.Container`.

Properties:

- `Title`

Notes:

- creates a titled frame with an internal body region
- children are added to the body area, not the outer node
- `ThemePreset` supports `primary` and `muted`

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
- no responsive helper surface yet for `SectionPanel`

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

Notes:

- `Subscribe` returns an unsubscribe function
- `Set` does nothing if the new value is strictly equal to the old value

### `JOG.EventArgs`

Properties:

- `Source`
- `Type`
- `OriginalEvent`
- `Handled`
- `Value`
- `Key`

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
