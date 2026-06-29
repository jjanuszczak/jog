# JOG V2 API Reference

## Status

This reference covers the implemented public API in [v2/JOG.js](/Users/johnjanuszczak/Projects/jog/v2/JOG.js). If code and this document diverge, update this document immediately.

## Application Types

### `JOG.Application`

Methods:

- `Run(page)`

Properties:

- `Runtime`
- `MainPage`
- `Debug`

Notes:

- `Run(page)` attaches to `document.body` and performs the first render.

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
- `Padding`
- `Margin`
- `Gap`
- `GridColumn`
- `GridRow`
- `ColumnSpan`
- `RowSpan`
- `Dock`

Common methods:

- `Show()`
- `Hide()`
- `Dispose()`
- `Refresh()`
- `Focus()`
- `Location(x, y)`
- `Size(width, height)`
- `SetBounds(x, y, width, height)`

Notes:

- `Dock` accepts `none`, `top`, `bottom`, `left`, `right`, `fill`
- `ColumnSpan` and `RowSpan` default to `1`

### `JOG.Control`

Extends `JOG.Component`.

Event registration methods:

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

### `JOG.StackPanel`

Extends `JOG.Container`.

Properties:

- `Orientation`
- `Spacing`

Notes:

- `Orientation` accepts `vertical` or `horizontal`
- `Gap` also works because it comes from `Component`
- render implementation prefers `Gap` when both are set

### `JOG.SectionPanel`

Extends `JOG.Container`.

Properties:

- `Title`

Notes:

- creates a titled frame with an internal body region
- children are added to the body area, not the outer node

### `JOG.Grid`

Extends `JOG.Container`.

Properties:

- `Columns`
- `Rows`
- `ColumnGap`
- `RowGap`

Child placement:

- `GridColumn`
- `GridRow`
- `ColumnSpan`
- `RowSpan`

Current limitation:

- explicit placement only

## Controls

### `JOG.Label`

Extends `JOG.Control`.

Common usage:

```js
var label = new JOG.Label();
label.Text = "Customer Name";
```

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

### `JOG.TextArea`

Extends `JOG.Control`.

Properties:

- inherited common properties
- `Placeholder`

Methods:

- `BindText(store, key)`

Notes:

- shares the same binding helper as `TextBox`

### `JOG.CheckBox`

Extends `JOG.Control`.

Properties:

- `Checked`

Methods:

- `BindChecked(store, key)`

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
- `OnClose(listener)`

Notes:

- `Resizable` is defined but not implemented
- width defaults to `420px` if not set

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
