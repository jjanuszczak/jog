# Lexical Control Specification

## Status

This document defines the first implementation target for wrapping an external JavaScript UI library as a JOG third-party control.

The first implementation now exists:

- bundled browser package at [v2/packages/LexicalJOG.Controls.js](../v2/packages/LexicalJOG.Controls.js)
- editable source at [v2/packages-src/LexicalJOG.Controls.source.js](../v2/packages-src/LexicalJOG.Controls.source.js)
- rebuild script at [scripts/build-lexical-package.js](../scripts/build-lexical-package.js)

Current implementation status:

- `LexicalJOG.LexicalPlainTextBox` is implemented as a third-party `JOG.Control`
- `LexicalJOG.LexicalRichTextBox` is also implemented as a second-stage third-party `JOG.Control`
- `Value` persists the serialized Lexical editor-state JSON string for both controls
- `ReadOnly`, `BindValue(store, key)`, `BindPlainText(store, key)`, `SetError()`, `ClearError()`, and `BindError()` are implemented
- the rich-text control now also exposes `FormatText(formatType)`, `ToggleBold()`, `ToggleItalic()`, and `ToggleUnderline()`
- the third-party demo now exercises the rich-text wrapper beside the existing sample packages

Still intentionally deferred:

- toolbar composition as a reusable control
- HTML import and export helpers
- richer block-formatting commands
- selection-state reporting for active formats and block type
- active toolbar-button state driven by the current editor selection
- deeper accessibility verification in real browsers

Use this document with:

- [doc/third-party-control-spec.md](third-party-control-spec.md)
- [doc/developer-guide.md](developer-guide.md)
- [doc/api-reference.md](api-reference.md)
- issue [#24](https://github.com/jjanuszczak/jog/issues/24)

## Why Lexical

Lexical is a strong proof case for the broader wrapper pattern because it is not a trivial widget.

It has:

- its own editor instance lifecycle
- its own content model and serialization rules
- direct ownership of a `contentEditable` root
- meaningful keyboard, focus, and selection behavior
- a real requirement for clean disposal and reattachment

If JOG can wrap Lexical cleanly, the same pattern should extend to other third-party libraries with their own DOM and lifecycle expectations.

## Goal

Build a Lexical-based third-party JOG control that feels native to JOG app code:

- created with `new`
- configured by plain properties
- integrated through `OnX` events
- compatible with JOG validation and binding patterns
- safe across attach, detach, rerender, and disposal

## Non-Goals

This first pass does not try to solve every editor case.

Out of scope for the MVP:

- collaboration
- arbitrary plugin loading by app code
- nested JOG child controls inside the editable body
- HTML as the primary persistence model
- React bindings such as `@lexical/react`
- custom Lexical node authoring beyond what the MVP requires
- full CMS-grade toolbar and formatting surface

## MVP Order

The implementation sequence should stay narrow:

1. `LexicalPlainTextBox`
2. stable property and event contract
3. JSON persistence as the canonical value model
4. JOG invalid and error-state styling integration
5. rich-text variant after the plain-text wrapper is stable
6. optional toolbar composite after the core wrapper works
7. HTML import and export helpers only if a real use case demands them

## Package Shape

Recommended package location:

- `v2/packages/LexicalJOG.Controls.js`
- source lives at `v2/packages-src/LexicalJOG.Controls.source.js`

Recommended namespace:

- `LexicalJOG`

Recommended first exported constructor:

- `LexicalJOG.LexicalPlainTextBox`

Later constructors can follow the same family:

- `LexicalJOG.LexicalRichTextBox`
- `LexicalJOG.LexicalToolbar`

## Core Architectural Line

This wrapper depends on one strict ownership boundary:

- JOG owns the outer control shell, public properties, validation surface, layout participation, and app-facing events
- Lexical owns the inner editable DOM subtree, editor state internals, selection behavior, and editor commands

JOG must not treat the editable subtree like normal rerenderable control DOM.

If JOG rebuilds the active Lexical root during normal state application, the wrapper will lose selection, focus stability, and possibly content integrity.

## Base Type Choice

The first Lexical wrapper should extend `JOG.Control`, not `JOG.Container`.

Reasons:

- the editor surface behaves like a primary input control
- app code should not add arbitrary JOG child controls into the editable region
- validation, focus, disabled state, and value binding matter more than child composition
- the toolbar, if introduced later, should be a separate composite control rather than a child contract on the editor body

## Public API For The Current Controls

The current controls expose a narrow JOG-style surface.

Properties:

- `Value`
- `Placeholder`
- `ReadOnly`
- `Invalid`
- `ErrorText`
- `ThemePreset`

Methods:

- `Focus()`
- `Clear()`
- `GetPlainText()`
- `SetPlainText(text)`
- `IsEmpty()`
- `BindValue(store, key)`
- `BindPlainText(store, key)`

Rich-text-only methods implemented now:

- `FormatText(formatType)`
- `ToggleBold()`
- `ToggleItalic()`
- `ToggleUnderline()`

Events:

- `OnChange(listener)`
- `OnFocus(listener)`
- `OnBlur(listener)`

Deferred methods, not MVP-critical:

- `GetEditorStateJson()`

Methods that should not be public in the first pass:

- raw DOM getters
- arbitrary Lexical plugin registration
- direct access to the live `editor` instance

## Value Model

`Value` should be the serialized Lexical editor-state JSON string.

That should be the canonical persistence format for the wrapper.

Why:

- it aligns with Lexical's actual state model
- it preserves editor fidelity better than HTML
- it keeps JOG-side change detection simple
- it avoids pretending the DOM is the source of truth

The wrapper may later expose helper import and export methods for HTML, but HTML should not define the first public contract.

## Read-Only And Empty State

The control should support:

- editable mode
- read-only mode
- empty placeholder display

Placeholder behavior should be implemented through the wrapper contract and Lexical configuration, not by app code injecting extra DOM around the editor.

## Lifecycle Mapping

The wrapper should use only the documented JOG extension lifecycle.

### `CreateDom(doc)`

Create:

- one stable outer shell node
- one stable inner host node for Lexical
- any wrapper-level placeholder or status nodes that are outside the Lexical-managed subtree

The editable host node must be stable for the life of the attached editor instance.

### `OnAttached()`

Create and wire the Lexical editor instance here.

Responsibilities:

- create the Lexical editor with a narrow config
- set namespace and error handler
- register the plain-text behavior needed for the MVP
- attach the editor to the host node with `setRootElement(...)`
- register update listeners
- register focus and blur listeners if the wrapper needs them
- apply the initial JOG `Value` into the editor if one exists

### `ApplyState(prevState, nextState)`

This method should update wrapper-owned behavior only.

Responsibilities:

- apply JOG invalid and theme classes
- apply wrapper read-only state
- apply placeholder state when relevant
- detect externally-driven `Value` changes and push them into Lexical
- avoid reattaching the editor or rebuilding the host node

This method must not recreate the Lexical root element during ordinary updates.

### `OnDisposed()`

Dispose every external registration owned by the wrapper.

Responsibilities:

- unregister Lexical listeners
- detach the editor from the DOM with `setRootElement(null)`
- clear stored references

## State Synchronization Rules

This is the most important logic in the wrapper.

Required rule set:

- JOG property writes to `Value` represent external state changes
- user edits inside Lexical represent internal state changes
- internal changes raise `OnChange` with the new serialized JSON value
- internal changes must not immediately trigger a duplicate external reapply

The wrapper should keep at least these internal flags or equivalents:

- last applied serialized value
- last emitted serialized value
- suppression flag for wrapper-originated editor updates

Without explicit loop prevention, the wrapper will drift into cursor jumps, double updates, or needless full-state resets.

## Event Contract

The wrapper should emit JOG-style events.

`OnChange` payload should include:

- `Value`
- `OriginalEvent` when available

`OnFocus` and `OnBlur` should behave like other input controls as closely as possible.

The wrapper should not invent Lexical-specific event naming for the app-facing contract.

## Validation Contract

The control should follow the same input-like contract as JOG core controls:

- `Invalid`
- `ErrorText`
- `SetError(message)`
- `ClearError()`
- `BindError(store, key)`

Validation state should style the outer shell, not mutate Lexical's internal document model.

That keeps editor content separate from form-state concerns.

## Binding Contract

The first wrapper should support explicit JOG store binding through:

- `BindValue(store, key)`

Expected behavior:

- store changes update `Value`
- editor changes push the serialized JSON string back into the store

The wrapper should not introduce hidden two-way binding magic beyond that explicit helper.

## Theme And Styling Contract

The wrapper should consume existing JOG theme tokens first.

The first control should style:

- outer border
- background
- text color
- placeholder color
- focus ring
- invalid ring
- disabled or read-only surface treatment

Recommended styling layers:

1. JOG theme tokens
2. `ThemePreset`
3. package-scoped CSS hooks only where JOG tokens are insufficient

The wrapper should not hardcode product-specific visual decisions into the package.

## Focus And Accessibility

The wrapper must clear a minimum quality bar from the start.

The MVP should cover:

- visible focus state
- keyboard text entry
- disabled or read-only behavior
- placeholder semantics that do not break basic accessibility
- wrapper-level invalid state

The spec should be honest about limits.

If the first pass does not fully match JOG core controls for focus or screen-reader behavior, document that directly in the package docs and roadmap.

## Recommended Lexical Scope For The MVP

Keep the first implementation as plain text.

Recommended first-pass Lexical stack:

- `lexical`
- the minimum plain-text helper package required to make ordinary typing work
- no React packages
- no collaboration packages
- no formatting toolbar requirement

Rich text should be a second step because it changes:

- serialization expectations
- command coverage
- paste behavior
- keyboard behavior
- future HTML import and export pressure

## Why Plain Text First

This is the right first proof because it isolates the wrapper problem from the full editor-product problem.

It proves:

- lifecycle safety
- root-element stability
- event and store integration
- validation styling
- focus and disposal behavior
- external library wrapping inside the JOG control model

If those fail, rich text is the wrong next move.

## Toolbar Direction

The toolbar should not be built into the first editor control.

If toolbar work lands later, prefer:

- a separate `LexicalToolbar` composite control, or
- app-level JOG buttons that call documented wrapper methods or commands

That keeps the editor control narrow and lets app code decide whether it wants full editing chrome.

## HTML Import And Export

HTML helpers are useful, but they should stay secondary.

If added later, the API should likely be explicit methods such as:

- `SetHtml(html)`
- `GetHtml()`

Do not make HTML the first `Value` contract.

That would optimize the wrapper for interchange while weakening fidelity against Lexical's actual editor-state model.

## Failure Modes To Design Around

The wrapper should be designed against these failures from the start:

- JOG rerender recreates the Lexical root node
- store feedback loops cause repeated full editor resets
- focus moves unexpectedly after external value writes
- selection is lost on state synchronization
- disposal leaves orphaned listeners or retained editor references
- invalid styling leaks into the wrong DOM layer
- read-only mode blocks wrapper visuals but not editor interaction

## Acceptance Criteria For The First Implementation

The first implementation should not be called successful unless all of these are true:

- app code can construct the control with `new`
- app code sets `Value`, `Placeholder`, and `ReadOnly` with plain properties
- `OnChange` returns the serialized JSON string reliably
- `BindValue(store, key)` works both ways without feedback loops
- `SetError()`, `ClearError()`, and `BindError()` behave like other JOG inputs
- the Lexical root survives ordinary JOG state application without being recreated
- the control disposes cleanly without retaining listeners or crashing on reattach

## Future Generalization

If this wrapper lands cleanly, the broader pattern for external-library controls should be:

1. identify the real ownership boundary between JOG and the library
2. keep the app-facing API narrow and JOG-native
3. preserve the external library's internal state model instead of flattening it into DOM assumptions
4. isolate synchronization logic and loop prevention early
5. prove disposal, focus, and validation behavior before broadening features

That pattern should generalize better than a wrapper strategy based on HTML slots, raw DOM escape hatches, or ad hoc callback surfaces.
