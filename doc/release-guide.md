# JOG Release Guide

## Status

JOG currently treats GitHub Releases as the primary distribution channel for browser-ready artifacts.

There is no npm runtime package or CDN publish flow in this repo today.
Npm packaging is intentionally deferred unless the current release-asset automation stops being sufficient.

## What A Release Should Contain

Each GitHub Release should attach the built assets from `dist/release/`:

- `dist/release/JOG.min.js`
- `dist/release/JOG.min.js.map`
- `dist/release/jog-starter-index.html`
- `dist/release/jog-starter-app.js`

The renamed starter files are the minimal starter bundle that should ship beside the minified runtime.

## Current Release Flow

1. run `npm install`
2. run `npm run build:release`
3. verify the generated files in `dist/release/`
4. create or publish a GitHub Release

When a GitHub Release is published, [.github/workflows/release-artifacts.yml](../.github/workflows/release-artifacts.yml) builds the assets and uploads them automatically.

You can also run that workflow manually with `workflow_dispatch` to inspect the release artifact set without publishing a release.

For hosted static example guidance, including CSP and recommended browser-security headers for the current Notepad example, see [notepad-hosting.md](notepad-hosting.md).

## Pre-Release Checklist

Before publishing a public pre-release, verify all of this:

1. `node test/run-v2-tests.js` passes
2. `npm run build:release` has been run against the current `main`
3. the checked-in `dist/` and `dist/release/` assets match the current runtime
4. [README.md](../README.md), [doc/developer-guide.md](developer-guide.md), [doc/api-reference.md](api-reference.md), and [doc/roadmap.md](roadmap.md) reflect current implementation reality
5. known partial areas are described plainly, especially accessibility, keyboard depth, and newer extension surfaces
6. the release notes frame the build as pre-release software, not a stability promise
7. the release notes draft in [public-preview-release-notes-draft.md](public-preview-release-notes-draft.md) has been reviewed and adjusted for the exact release contents

## Public Repo Checklist

Before flipping the repository public, confirm these owner decisions are closed:

1. decide whether any local-only assets or documents should stay private
2. keep dated internal review notes such as `doc/YYYY-MM-DD-*.md` out of the public repo unless they are intentionally rewritten as public-facing documentation
3. confirm [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md), [SECURITY.md](../SECURITY.md), issue templates, and the pull request template are present and reflect the current maintainer workflow
4. confirm the main docs explain how contributors should build JOG-native composite controls, third-party wrappers, and new low-level controls
5. use a pinned "Start here" GitHub Discussion as the primary onboarding entry, pointing new readers to the README, developer guide, roadmap, examples, and contribution rules
6. review the draft text in [start-here-discussion-draft.md](start-here-discussion-draft.md) and convert it into the first pinned discussion when the repo opens

These are not runtime concerns, but they are real launch concerns.

## Non-Goals Today

- no npm package publishing
- no package-manager install story
- no CDN-specific bundle or manifest generation

## Revisit Threshold

Reconsider npm packaging only if the current GitHub Release artifact flow becomes a real limitation for users or maintainers.
