# JOG

JOG is a JavaScript-first browser UI framework aimed at developers who want a desktop-style programming model for front ends.

The core idea is simple:

- write straight JavaScript
- do not write app HTML
- do not manipulate the DOM directly
- build UIs from controls, containers, windows, dialogs, state, and events

The active implementation is `v2/`.

## Current Status

JOG V2 is functional and actively evolving. It already includes:

- application and page bootstrapping
- controls such as `Label`, `Button`, `TextBox`, `TextArea`, `CheckBox`, `RadioButton`, `DropDownList`, and `ListBox`
- layout containers such as `Panel`, `DockPanel`, `StackPanel`, `SectionPanel`, and `Grid`
- dialogs and windows with dragging, modal behavior, and lower-right resizing
- explicit store-based binding
- control-level validation state
- runtime diagnostics
- a zero-dependency Node test runner

It is not feature-complete. The roadmap in [doc/roadmap.md](/Users/johnjanuszczak/Projects/jog/doc/roadmap.md) is the living source for what is next.

## Repo Layout

- [v2](/Users/johnjanuszczak/Projects/jog/v2): active runtime and example apps
- [test](/Users/johnjanuszczak/Projects/jog/test): Node-based regression checks
- [doc](/Users/johnjanuszczak/Projects/jog/doc): living documentation
- [v1](/Users/johnjanuszczak/Projects/jog/v1): earlier implementation kept for reference
- [ref](/Users/johnjanuszczak/Projects/jog/ref): older reference material and experiments

## Where To Start

If you are new to the project, read these in order:

1. [doc/developer-guide.md](/Users/johnjanuszczak/Projects/jog/doc/developer-guide.md)
2. [doc/api-reference.md](/Users/johnjanuszczak/Projects/jog/doc/api-reference.md)
3. [doc/roadmap.md](/Users/johnjanuszczak/Projects/jog/doc/roadmap.md)
4. [AGENTS.md](/Users/johnjanuszczak/Projects/jog/AGENTS.md)

The developer guide explains the runtime model. The API reference documents what exists now. The roadmap tells you what is implemented, what is partial, and what should happen next.

## Running The Examples

Open these files directly in a browser:

- [v2/example.html](/Users/johnjanuszczak/Projects/jog/v2/example.html)
- [v2/customer-admin.html](/Users/johnjanuszczak/Projects/jog/v2/customer-admin.html)
- [v2/form-demo.html](/Users/johnjanuszczak/Projects/jog/v2/form-demo.html)

What they cover:

- `example.html`: small runtime sanity check, modal window, resize behavior
- `customer-admin.html`: CRUD-style page shell with edit dialog
- `form-demo.html`: form layout, explicit store binding, validation, inline errors, validation summary

## Running Tests

Run the current regression suite with:

```bash
node test/run-v2-tests.js
```

The current suite is lightweight and intentionally dependency-free. It covers core runtime behavior that should not regress while the framework continues to move.

## Diagnostics

JOG V2 includes a small built-in diagnostics layer.

Typical usage:

```js
var app = new JOG.Application();
app.Debug = true;
app.Run(page);

console.log(app.DumpTree());
app.LogTree();
```

`Debug = true` enables console logging for dirty queue work, render and mount lifecycle activity, and event dispatch. `DumpTree()` and `LogTree()` expose the current control tree.

## Development Rules

This repo treats docs as part of the product.

When you change `v2/`:

- update [doc/developer-guide.md](/Users/johnjanuszczak/Projects/jog/doc/developer-guide.md) if the programming model changed
- update [doc/api-reference.md](/Users/johnjanuszczak/Projects/jog/doc/api-reference.md) if the public surface changed
- update [doc/roadmap.md](/Users/johnjanuszczak/Projects/jog/doc/roadmap.md) so status and next steps stay accurate

Do that in the same change as the code.

## Project Direction

JOG is not trying to beat React as a general frontend platform.

The nearer target is narrower and more practical:

- internal tools
- line-of-business applications
- form-heavy systems
- CRUD-style interfaces
- developers who prefer a control-and-container mental model over a markup-first one

That direction is described in more detail in [doc/v2-spec.md](/Users/johnjanuszczak/Projects/jog/doc/v2-spec.md).
