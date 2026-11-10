# Public release review — 10 November 2026

## Scope and provenance

Reviewed the allowlisted public source, synthetic seed, dependency lockfile, generated browser bundle, stylesheet and documentation. This reviews the teaching application; it does not certify ownership of unrelated work or repositories.

The public seed and activity-level descriptions were newly authored for this release. They describe a fictional factory with common industrial roles. Presentation, procedural geometry, editor and schema were authored during the lab's development. No private factory-data file, core runtime, integration adapter, historical run report or source-repository history is included. No imported industrial models, customer assets or copied standards text/figures are included.

## Excluded from publication

Private branch identifiers, commit references, test counts, runtime-specific narratives and source links were removed. Hosting identity, authentication and database code, runtime state, credentials, dependencies, source maps and workspace exports are outside the allowlist. No original Git history is copied.

The app connects to no plant, protocol endpoint, broker or private service. Topic names are fictional. Links point to this website and its public source. Dependencies are bundled locally: no CDN scripts, external fonts or analytics.

## Verification

The public port passed ten model tests (including eight rejection cases and JSON round-trip), TypeScript, production build and six browser-local integrity checks. Browser review covered selection, edit/save/reload, rejected invalid JSON, workboard filtering, pub/sub consumer selection and decision navigation. A 390 × 844 viewport review found no horizontal document overflow. WebGL was unavailable in the review browser, so the interactive SVG fallback was exercised; GPU rendering remains a separate verification item.

The runtime and development dependency audit reported zero known vulnerabilities after updates. The source and generated files passed credential, private-address and restricted-source-reference scans. Ignore rules and detector controls were checked. Pattern scanning does not prove legal ownership or catch every possible secret.

The public evidence register deliberately inherits no run counts or pass claims. Physical simulation, OPC UA, recorded replay and hardware gates remain unproven. CI records repeatable build and source checks against the actual public commit.

## Maintaining the boundary

Publish only `release-files.json` entries. Rebuild, scan and review outputs as well as source. Contributors must identify origins and have permission to publish. Keep confidential evidence and exports outside the public repository. The MIT grant covers this directory's original work only; bundled dependencies retain notices. It does not cover trademarks, employer/customer material or the rest of the website.
