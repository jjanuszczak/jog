# Notepad Hosting Guide

## Status

This guide covers the current `v2/notepad.html` example when hosted as a static site.

## Summary

The current Notepad example is a static browser app. That makes it straightforward to host, but it does not make it automatically risk-free.

The main safety property of the current implementation is that opened file contents stay in plain text controls rather than being rendered as HTML.

## Recommended Hosting Model

Use a static host:

- GitHub Pages for an early demo or beta
- Cloudflare Pages or Netlify if you want stronger header control
- a dedicated static subdomain later if the app becomes something users rely on

## Core Safety Rules

- host the app on a dedicated origin or narrow subpath
- avoid third-party scripts entirely
- keep file contents in plain text only
- do not add HTML preview or markdown rendering without a separate security pass
- use HTTPS only
- keep the deployment artifact tied to a known built `JOG.min.js`

## Browser Trust Boundary

Users should only open files in the hosted app if they trust that site origin.

That is because:

- page JavaScript can read the text content of files opened through the app during the session
- browser-granted file access is still access that the page origin receives
- same-origin browser storage is visible to code running on that origin

## Recommended Content Security Policy

For the current Notepad example, use a restrictive policy like this:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  ">
```

Notes:

- `style-src 'unsafe-inline'` is currently needed because JOG injects framework styles at runtime
- `script-src 'self'` is important, do not loosen it for convenience
- `frame-ancestors 'none'` helps prevent embedding and clickjacking

## Recommended Additional Headers

If your host supports response headers, add:

```text
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

## GitHub Pages Guidance

GitHub Pages is acceptable for an initial hosted beta or example release.

Recommended setup:

- publish only static assets
- keep the Notepad app separate from unrelated JavaScript-heavy pages if possible
- use the generated runtime artifact rather than an ad hoc local build file
- document clearly that users should only open files they are comfortable exposing to the hosted page origin

## Cloudflare Pages Or Netlify Guidance

These are preferable if you want stronger deployment control because they make it easier to:

- set real response headers
- manage redirects and cache rules
- separate environments more cleanly

## Do Not Do This Yet

- do not add analytics scripts
- do not add ad scripts or general-purpose widgets
- do not render file contents with `innerHTML`
- do not mix this app onto an origin that also runs unrelated untrusted front-end code

## Deployment Checklist

1. Build the release artifacts locally with `npm run build:release`.
2. Host the static files over HTTPS.
3. Use the CSP shown above.
4. Avoid third-party scripts.
5. Verify the hosted app still opens and saves text files correctly.
6. Tell users the app should only be trusted as much as they trust the hosting origin.
