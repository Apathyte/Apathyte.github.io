# Learning studio validation — 10 November 2026

Implementation release: 1.1.0. Exact published code revision and CI links will be
recorded after publication. This document does not certify any plant operation.

## Executed checks

- Node 24.22.1: 24 tests pass. All four lessons and every response branch reach
  evidence only after a choice. Invalid actions/IDs/versions fail. Reset clears
  selection, comparison is non-mutating, proposed handovers remain blocked.
- Original model schema v1 round-trips edited data without loss; no destructive
  schema migration is introduced. Old imports and new presentation preferences
  have separate contracts.
- TypeScript and Vite production build pass. The bundled Three.js application is
  approximately 911 KB uncompressed; the build retains its size advisory.
- Runtime and development dependency audit: zero known vulnerabilities at review.
- Browser (cloud Chrome, desktop, WebGL unavailable): reference/disruption focus,
  required response gate, bounded and rejected consequences, debrief/reset,
  comparison preserving SVG viewBox, four lesson selections, authority text
  register, keyboard zone selection, follow toggle and presentation entry/exit.
- 390 × 844 embedded viewport: content width 375px and scroll width 375px; no
  horizontal page overflow. Presentation entry and narrative-first layout checked.
- Existing v1 workspace imported with a synthetic label change, saved, reloaded
  and observed; original workspace then restored and saved. Invalid `{}` import
  rejected. No visitor content is sent to a server.
- Fictional slice proposal validated with resolved mappings, without applying it.

## Open limitations

- GPU/WebGL rendering, camera interpolation on real hardware and GPU reduced-motion
  behaviour are not browser-verified here. SVG focus works without animation.
- Mobile check uses a narrow browser iframe, not a physical phone or device lab.
- No facilitated learner trial or learning-effectiveness claim yet.
- Scope selection currently uses an authored lesson slice or the full site.
  Arbitrary slice assembly and general UML/document ingestion remain future work.
- Physics, OPC UA, recorded replay and physical-equipment gates remain unrun.
- Automated disclosure scanning cannot decide ownership or detect every secret.

## Reproduction

Run `npm ci --ignore-scripts`, `npm test`, `npm run build`,
`node scripts/release.mjs`, `npm run audit:release` in `demokit/`.
Use the eight browser journeys in `ACCEPTANCE.md`. Attach date, environment,
revision and exact result to new evidence; never carry a prior pass forward silently.
