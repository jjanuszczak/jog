# Contributing to JOG

JOG is still pre-release software.

That means contribution quality matters more than contribution volume. Small, well-scoped fixes that keep the runtime, docs, tests, and examples aligned are more useful than broad speculative rewrites.

Review these repo-level files before opening a public contribution:

- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)

## Before You Start

Read these first:

1. [README.md](README.md)
2. [doc/developer-guide.md](doc/developer-guide.md)
3. [doc/api-reference.md](doc/api-reference.md)
4. [doc/roadmap.md](doc/roadmap.md)

Use [doc/roadmap.md](doc/roadmap.md) as the current implementation truth.

## Working Rules

- treat `v2/` as the active implementation
- treat `v1/` and `ref/` as historical reference unless a task explicitly needs them
- keep the public programming model explicit: `new`, property assignment, `Add`, `OnX`, and `Application.Run(page)`
- do not document aspirational behavior as if it already exists

## Change Expectations

When you change framework behavior in `v2/`:

1. update the runtime or example code
2. update the relevant docs in the same change
3. run the relevant checks
4. keep the roadmap current

At minimum, review these when they are affected:

- [doc/developer-guide.md](doc/developer-guide.md)
- [doc/api-reference.md](doc/api-reference.md)
- [doc/roadmap.md](doc/roadmap.md)

## Verification

Run these when relevant:

```bash
node --check v2/runtime/JOG.js
node --check v2/apps/ExampleApp.js
node --check v2/apps/CustomerAdminApp.js
node --check v2/apps/FormApp.js
node test/run-v2-tests.js
```

If your change affects release artifacts, also run:

```bash
npm run build:release
```

## Scope Guidance

Good contribution targets:

- hardening partially implemented runtime behavior
- improving examples so real behavior is easier to verify
- adding regression coverage
- tightening docs so public expectations match reality
- improving contributor-facing guidance for control composition, third-party wrappers, and low-level control authoring

Less useful targets right now:

- broad speculative abstraction changes
- new API surface without tests and docs
- design work that assumes JOG is already a general-purpose frontend platform

## Pull Requests

A good pull request should:

- explain the concrete behavior change
- note any user-facing limitations that remain
- list the checks you ran
- keep unrelated cleanup out of the same patch

If the change is intentionally partial, say so directly.
