# JOG Public Preview Release Notes Draft

## Title

JOG public technical preview

## Release framing

This release opens JOG as a public technical preview.

JOG is a JavaScript-first browser UI framework for developers who want a desktop-style programming model for internal tools, line-of-business applications, and CRUD-heavy browser software.

This is not a 1.0 stability claim. The framework is usable, documented, and test-backed, but it is still pre-release software and some areas remain intentionally partial.

## What is in the preview

- application and page bootstrapping
- a working set of shell controls, inputs, layout containers, dialogs, windows, and data-grid primitives
- explicit store, collection, and form-state helpers
- public theming through token overrides and selected theme presets
- first-pass public third-party control registration and extension hooks
- concrete third-party wrapper examples for Chart.js, Flatpickr, and Lexical
- browser-ready release artifacts in `dist/release/`
- a zero-dependency Node regression suite

## What this release proves

JOG now proves three things clearly enough for public evaluation:

1. the core control-and-container programming model works
2. the framework can carry internal-tool style shells, forms, dialogs, and CRUD screens
3. third-party libraries can be wrapped behind JOG-native controls without collapsing back into ad hoc app-owned DOM code

## Known limits

This release should still be evaluated with pre-release expectations.

Known partial areas include:

- deeper keyboard behavior across shell controls
- broader real-browser accessibility hardening
- long-term stability guarantees for newer extension surfaces
- richer shell-control depth such as menu navigation, toolbar overflow, and more advanced tab behavior
- broader package tooling beyond the current direct browser bundle model

## Recommended evaluation path

If you are trying JOG for the first time:

1. read `README.md`
2. read `doc/developer-guide.md`
3. open the examples under `v2/examples/`
4. inspect the roadmap in `doc/roadmap.md`
5. review `doc/third-party-control-spec.md` if you care about control packages or wrappers

## Contribution and feedback

This preview is open for technical feedback, defects, documentation gaps, and targeted feature requests that fit JOG's current lane.

The best feedback right now is:

- concrete runtime bugs
- documentation gaps
- extension-surface friction
- internal-tool and CRUD workflow gaps
- regressions against the examples or current public contract

## Assets

Attach these files from `dist/release/`:

- `JOG.min.js`
- `JOG.min.js.map`
- `jog-starter-index.html`
- `jog-starter-app.js`
