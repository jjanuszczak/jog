# Start Here Discussion Draft

## Title

Start here: what to read first, how to try JOG, and how to contribute

## Body

JOG is now public as a technical preview.

If you are new here, use this discussion as the entry point instead of guessing where to start.

### What JOG is

JOG is a JavaScript-first browser UI framework for developers who want a desktop-style programming model for:

- internal tools
- line-of-business applications
- form-heavy screens
- CRUD-heavy workflows

The active implementation is in `v2/`.

### Read this first

1. `README.md`
2. `doc/developer-guide.md`
3. `doc/api-reference.md`
4. `doc/roadmap.md`

### Try these examples

- `v2/examples/hello-world.html`
- `v2/examples/example.html`
- `v2/examples/customer-admin.html`
- `v2/examples/form-demo.html`
- `v2/examples/opportunity-board.html`
- `v2/examples/third-party-demo.html`

### If you care about extension and wrappers

Read:

- `doc/developer-guide.md`
- `doc/third-party-control-spec.md`
- `doc/lexical-control-spec.md`

The repo now documents:

- when to compose from existing JOG controls
- when to wrap an external library
- when to build a new low-level control
- how to set up a standalone third-party JOG control repo

### Before opening an issue or pull request

Review:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`

Please frame bugs and requests around the current JOG lane instead of treating this as a general-purpose frontend framework.

### Good feedback right now

- runtime defects
- documentation gaps
- example breakage
- extension-surface friction
- internal-tool and CRUD workflow limitations

### Known limits

JOG is still pre-release software.

Some areas are intentionally partial, especially:

- deeper keyboard behavior in shell controls
- broader accessibility hardening
- long-term stability guarantees for newer extension surfaces

### Maintainer note

Pin this discussion as the primary onboarding entry when the repo opens.
