# Browser Data And Settings Utility PRD

## Status

This document captures a planned example app for later implementation. It is not implemented yet.

## Purpose

Build a desktop-style browser utility app that helps users inspect, edit, reset, and organize browser-persisted app state from one place.

This example should prove that JOG can support a serious browser-native utility application, not just forms, notes, and CRUD records.

## Why This Example Matters

- it is a credible browser utility, not a fake desktop app
- it stresses shells, dialogs, state, validation, and data-heavy repeated views
- it fits JOG's target lane of internal tools and line-of-business workflows
- it exercises `Collection` and `DataGrid` more naturally than a purely document-style example
- it gives the framework a practical place to show browser-integration helpers later

## Product Goal

Deliver a `Workspace Manager` for browser-resident state and settings.

The app should let a user:

- review persisted preferences
- inspect saved views and feature flags
- manage recent items
- inspect and edit local browser storage entries
- reset broken state safely
- understand dirty state and summary counts from a desktop-style shell

## Non-Goals

This first version should not try to be:

- a full browser developer tools replacement
- a full IndexedDB editor
- a cookie and permission manager across arbitrary websites
- a sync engine
- a general-purpose configuration platform

## Primary Users

- developers debugging browser-persisted state
- operators or internal-tool users managing saved views and preferences
- teams evaluating whether JOG can support a browser utility app with real shell depth

## Core User Outcomes

1. A user can inspect browser-persisted settings from a split-shell application.
2. A user can edit, delete, reset, or recreate key records through dialogs and inline editors.
3. A user can understand what changed through status chrome, dirty indicators, and summary counts.
4. A developer can study the app as a canonical JOG example for shell composition, `Collection`, `DataGrid`, dialogs, and validation.

## Product Scope

### Included In The First Credible Version

- left navigation for major sections
- top command surface
- main data view using `Collection` and `DataGrid`
- detail/editor area for the selected record
- status bar with item and dirty-state summaries
- edit, delete, reset, and confirm dialogs
- collection-backed data for preferences, saved views, recent items, and local storage records

### Deferred

- IndexedDB deep editing
- cookie and permission management
- global search across every section
- import and export
- drag-and-drop reordering
- advanced schema-aware editors
- cross-browser sync stories

## Information Architecture

Planned sections:

- `Preferences`
- `Saved Views`
- `Recent Items`
- `Local Storage`
- `Diagnostics`

## App Layout

### Shell

- top `MenuBar` or `ToolBar` for refresh, reset, import, export, and help later
- left navigation pane for major sections
- primary content area on the right
- optional lower status bar for counts, dirty state, and last action

### Main Content Pattern

The preferred first pattern is:

- left navigation
- main grid/list surface
- optional detail/editor region for the selected item

This can be implemented with `DockPanel`, `SplitPanel`, and `SectionPanel`.

## Section Definitions

### Preferences

Purpose:

- edit structured application settings by category

Likely fields:

- theme
- density
- autosave
- date formatting
- feature toggles

Behavior:

- select a row
- edit values in a detail pane or dialog
- validate before save
- show dirty markers and reset support

### Saved Views

Purpose:

- manage named saved filters, layouts, and workspace presets

Likely columns:

- `Name`
- `Scope`
- `Updated`
- `Default`

Behavior:

- create, edit, duplicate, delete
- mark one as default
- show derived counts and last-updated summaries

### Recent Items

Purpose:

- manage recently opened records, pages, or documents

Likely columns:

- `Title`
- `Kind`
- `Last Opened`
- `Pinned`

Behavior:

- open
- pin or unpin
- remove one
- clear all stale entries later

### Local Storage

Purpose:

- inspect and edit key/value state persisted through browser storage

Likely columns:

- `Key`
- `Type`
- `Preview`
- `Size`
- `Dirty`

Behavior:

- select a storage key
- inspect raw value
- edit value for simple cases
- delete or reset selected entries
- format JSON values where practical

### Diagnostics

Purpose:

- provide read-only operational summaries

Likely content:

- storage usage summaries
- selected section counts
- dirty-state totals
- recent actions
- runtime diagnostics later

## JOG Features This Example Should Prove

- shell composition with `DockPanel` and `SplitPanel`
- stable shell reflow under section changes and dialog usage
- `Collection` row identity, selection, dirty tracking, and summaries
- `DataGrid` as the main repeated-data surface
- dialogs for edit, delete, and reset flows
- validation summaries and inline errors
- status chrome and derived summaries
- theme presets and stronger business-app presentation

## Data Model Direction

Initial collections:

- `preferencesCollection`
- `savedViewsCollection`
- `recentItemsCollection`
- `storageCollection`

Illustrative row shapes:

```js
{
  id: "theme",
  category: "appearance",
  label: "Theme",
  value: "System",
  type: "string",
  dirty: false
}
```

```js
{
  id: "view-1",
  name: "Open Opportunities",
  scope: "OpportunityBoard",
  updatedAt: "2026-07-01T10:00:00Z",
  isDefault: true
}
```

```js
{
  id: "recent-1",
  title: "Q3 Pipeline",
  kind: "board",
  lastOpenedAt: "2026-07-01T11:30:00Z",
  pinned: false
}
```

```js
{
  id: "storage:filters",
  key: "opportunity.filters",
  valuePreview: "{\"stage\":\"Active\"}",
  valueType: "json",
  size: 128,
  dirty: false
}
```

## UX Rules

- keep the shell calm and business-like
- make destructive actions explicit and confirmable
- keep summaries visible in status chrome
- prefer dialogs for destructive edits and structured records
- prefer detail panes for low-risk inspection and small edits
- do not overload the first version with advanced browser diagnostics

## Success Criteria

1. The app is useful as a standalone browser utility.
2. The app demonstrates a stable shell without manual layout hacks.
3. The app shows `Collection` and `DataGrid` as first-class business-app primitives.
4. The app gives a better proof of JOG's target product lane than a generic demo page would.

## Implementation Plan

### Phase 1: Planning And Runtime Prerequisites

Goals:

- confirm the first four sections
- confirm what data is mocked versus read from real browser storage
- decide whether section navigation is a list, tabs, or both

Supporting runtime work that may need to land first:

- narrow browser helper for file import and export later
- any missing status-bar or shell-control polish needed by the app

### Phase 2: Shell Skeleton

Build:

- page shell
- left navigation
- top command strip
- status bar
- main content host

JOG areas stressed:

- `DockPanel`
- `SplitPanel`
- `StatusBar`
- `MenuBar` or `ToolBar`

Definition of done:

- the shell is stable at first paint and under resize
- navigation switches content without layout regressions

### Phase 3: Preferences And Saved Views

Build:

- `preferencesCollection`
- `savedViewsCollection`
- `DataGrid` views
- editor dialog or detail pane
- validation and dirty state

Definition of done:

- create, edit, save, reset, and delete flows work for these two sections
- summaries update correctly

### Phase 4: Recent Items And Local Storage

Build:

- `recentItemsCollection`
- `storageCollection`
- storage inspection view
- delete and reset flows

Definition of done:

- recent-item actions and storage edit/delete flows work
- local storage values can be inspected safely

### Phase 5: Diagnostics And Polish

Build:

- diagnostics section
- status summaries
- command cleanup
- example-specific polish and copy

Definition of done:

- app feels like a coherent browser utility
- example is strong enough to reference in docs and roadmap

### Phase 6: Regression Coverage

Add tests for:

- section switching
- collection updates per section
- dialog open and close flows
- delete and reset confirmation behavior
- status-bar summary changes
- local storage edit and remove behavior with mocked browser state

## Suggested First Sprint Scope

If this app were chosen next, the smallest credible sprint would be:

1. build the shell
2. implement `Preferences`
3. implement `Saved Views`
4. wire `Collection` plus `DataGrid`
5. add dialogs, status summaries, and tests

That is enough to prove the concept without pulling in every browser-data surface at once.

## Open Questions

- should section switching be left-nav only, tabs only, or hybrid
- should `Local Storage` be editable in the first pass or read-mostly
- should import and export wait until a runtime helper exists
- should diagnostics expose JOG runtime tree data in the first version or later

## Recommendation

Implement this example before a browser-scoped file explorer.

It is a more honest browser utility, it fits JOG's product lane better, and it exercises the exact shell, dialog, collection, and grid behavior JOG still needs to prove for an eventual beta.
