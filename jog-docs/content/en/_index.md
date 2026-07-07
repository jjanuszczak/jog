---
title: "JOG Documentation"
description: "Developer documentation for the JOG JavaScript-first browser UI framework."
params:
  body_class: td-navbar-links-all-active
---

{{% blocks/cover title="JOG Documentation" image_anchor="top" height="full td-below-navbar" color="dark" %}}
JOG is a JavaScript-first browser UI framework for desktop-style internal tools, form-heavy systems, and CRUD-heavy applications. 

<a class="btn btn-lg btn-primary me-3 mb-4" href="{{< relref "/docs/_index.md" >}}">Read the docs</a>
<a class="btn btn-lg btn-outline-light me-3 mb-4" href="{{< relref "/docs/guides/developer-guide.md" >}}">Developer Guide</a>
<a class="btn btn-lg btn-outline-light mb-4" href="https://github.com/jjanuszczak/jog">View the repo</a>

<div class="jog-stat-grid">
  <div class="jog-stat-card">
    <strong>V2</strong>
    Active implementation line
  </div>
  <div class="jog-stat-card">
    <strong>7</strong>
    First-party example entry pages
  </div>
  <div class="jog-stat-card">
    <strong>0 deps</strong>
    Core Node regression runner
  </div>
</div>

{{% blocks/link-down color="info" %}}
{{% /blocks/cover %}}

{{% blocks/lead color="white" %}}
This site is the public-facing home for the docs that already define JOG today. The core pages are synced from the canonical repo docs, so the site stays aligned with the implementation instead of drifting into a second manual copy.
{{% /blocks/lead %}}

{{% blocks/section color="primary" type="row" %}}
{{% blocks/feature title="Start Here" icon="fa-solid fa-map" %}}
Read the overview first, then move to the developer guide and API reference.
{{% /blocks/feature %}}
{{% blocks/feature title="Reality, Not Aspirations" icon="fa-solid fa-list-check" %}}
The roadmap and reference pages describe what exists now, what is partial, and what still needs hardening.
{{% /blocks/feature %}}
{{% blocks/feature title="One Source of Truth" icon="fa-solid fa-code-branch" %}}
These pages are generated from the repo docs, not maintained as a second manual copy.
{{% /blocks/feature %}}
{{% /blocks/section %}}

{{% blocks/section color="white" %}}
## What To Read

<div class="jog-panel-grid">
  <div class="jog-panel">
    <h3>Getting Started</h3>
    <p>Use the overview page to understand what JOG is, what exists in V2, and how to evaluate the current release artifacts.</p>
    <p><a href="{{< relref "/docs/getting-started/overview.md" >}}">Open overview</a></p>
  </div>
  <div class="jog-panel">
    <h3>Guides</h3>
    <p>The developer guide explains the runtime model, control composition, layout primitives, and the current app-author workflow.</p>
    <p><a href="{{< relref "/docs/guides/developer-guide.md" >}}">Open developer guide</a></p>
  </div>
  <div class="jog-panel">
    <h3>Reference</h3>
    <p>The API reference and third-party controls page track the implemented public surface, not a future spec.</p>
    <p><a href="{{< relref "/docs/reference/api-reference.md" >}}">Open reference</a></p>
  </div>
  <div class="jog-panel">
    <h3>Project</h3>
    <p>The roadmap, release guide, and contribution rules document current implementation reality and project direction.</p>
    <p><a href="{{< relref "/docs/project/roadmap.md" >}}">Open project docs</a></p>
  </div>
</div>
{{% /blocks/section %}}

{{% blocks/section color="light" %}}
## Recommended Reading Order

<div class="jog-doc-callout">
  <p><strong>New readers:</strong> Overview, Developer Guide, API Reference, Roadmap.</p>
  <p><strong>Potential contributors:</strong> Developer Guide, Roadmap, Contributing, Release Guide.</p>
  <p><strong>Extension authors:</strong> API Reference, Third-Party Controls, Developer Guide.</p>
</div>
{{% /blocks/section %}}
