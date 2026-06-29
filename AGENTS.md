# Repository Instructions

## Project Summary

JOG is a JavaScript-first browser UI framework with a desktop-style programming model.

The active implementation is in `v2/`. Treat `v1/` and `ref/` as historical reference material unless a task explicitly requires them.

## First Read

Before making changes, read these files:

1. `README.md`
2. `doc/developer-guide.md`
3. `doc/api-reference.md`
4. `doc/roadmap.md`

Use `doc/roadmap.md` as the living source of truth for:

- what is already implemented
- what is partial
- what should happen next

Yes, the roadmap should be kept current across sessions. If a task lands, the roadmap should reflect the new reality even if the next listed step is not implemented in the same session.

## Working Areas

- `v2/JOG.js`: main runtime
- `v2/ExampleApp.js`: small runtime sanity example
- `v2/CustomerAdminApp.js`: CRUD-style example
- `v2/FormApp.js`: forms, validation, and binding example
- `test/run-v2-tests.js`: zero-dependency Node regression runner

## Basic Workflow

When changing the framework:

1. update the runtime or example code
2. run the relevant static checks
3. run `node test/run-v2-tests.js`
4. update docs in the same change

When deciding what to do next, prefer this order:

1. finish or harden partially implemented runtime behavior
2. improve examples so the behavior is exercised clearly
3. add or expand tests
4. update roadmap ordering if priorities have changed

## Documentation Rule

When you add, remove, or change a JOG V2 feature, update the developer documentation in the same change.

At minimum, review and update these files when they are affected:

- `doc/developer-guide.md`
- `doc/api-reference.md`
- `doc/roadmap.md`

## Documentation Standard

- Document what is implemented now, not what the spec hopes to implement later.
- If behavior is partial, unstable, or limited, say so directly.
- Keep examples in sync with the actual code under `v2/`.
- When a new control, property, method, event, binding helper, or example is added, update the relevant reference section and roadmap status.
- When a feature is intentionally deferred, add it to `doc/roadmap.md`.
- Keep `README.md` useful for a new contributor at the repo root.

## Verification Rule

At minimum, use these when relevant:

- `node --check v2/JOG.js`
- `node --check v2/ExampleApp.js`
- `node --check v2/CustomerAdminApp.js`
- `node --check v2/FormApp.js`
- `node test/run-v2-tests.js`

## Scope

These instructions apply to developers and agents working in this repository.
