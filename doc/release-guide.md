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

## Non-Goals Today

- no npm package publishing
- no package-manager install story
- no CDN-specific bundle or manifest generation

## Revisit Threshold

Reconsider npm packaging only if the current GitHub Release artifact flow becomes a real limitation for users or maintainers.
