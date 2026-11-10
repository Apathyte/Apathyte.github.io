# DemoKit learning lab — approved delivery plan

Status: approved for implementation, 10 November 2026. Owner: Tim Boersma.
Baseline: public release `495c1a4986e25939326edcf3845d5a226a876eda`.
This file is the continuity record. Read it before changing scope or resuming work.

## Outcome and boundaries

Build a reusable factory learning and experimentation environment. Work with a
selected line, department or site; keep dependencies outside the selection visible.
Help participants understand material movement, information, decision authority,
operational constraints and the evidence needed to justify a change.

This is not an enterprise digital twin programme, a live control surface or a
claim of ISA-95 conformance. ISA-95 supplies useful activity/hierarchy concepts;
it does not prescribe a perfect factory. Use **reference flow / operational
reality / proposed change**, with the same factory slice in each comparison.

All S1–S4, V1–V5, F1–F3, B1–B3 and M1–M3 were approved. Delivery order and routine
implementation decisions are delegated. No further aesthetic approval gate is
required. Explicitly deferred capabilities remain deferred.

## Delivery sequence and completion gates

### P0 — Lock the scope and establish a recoverable baseline

- [x] Record approved scope, boundaries, sequence and acceptance criteria here.
- [ ] Commit this plan to the public repository with the release allowlist updated.
- [ ] Check current source and preserve existing browser-local workspaces.

Gate: the plan is durable in GitHub; no private discussion transcript or customer
identifiers are included. Existing working content remains available.

### P1 — Story and visual direction (S1–S4, V1)

- [ ] Write the purpose and first lesson before adapting the renderer.
- [ ] Establish a six-part lesson: situation, reference, disruption, response,
  consequences, evidence/debrief.
- [ ] Specify four fictional scenarios: shortage, quality hold, changeover and
  controlled workaround. Name authority, assumptions and residual risk in each.
- [ ] Record a design spike: layout, colour roles, typography, mobile and
  accessibility choices. Apply a coherent direction without adding remote fonts.

Gate: one lesson can be facilitated without a 3D model; the design supports that
lesson. No source customer process or real operational figures are published.

### P2 — First complete lesson: material shortage (V2–V5, F1–F2, B1–B2)

- [ ] Separate versioned learning definitions, model data, presentation state and
  evidence. Keep legacy workspace import/save supported.
- [ ] Build explicit disruption/response transitions and reset behaviour.
- [ ] Compare reference, current constraints and proposed change on the same slice.
- [ ] Show material, event and authority overlays with labels and distinct styles.
- [ ] Focus the camera/selection per step, with overview and reduced-motion support.
- [ ] Show upstream/downstream/shared-resource/authority boundary connections.
- [ ] Display consequences and questions, including unresolved or unsafe responses.

Gate: a visitor can follow the reference, introduce a shortage, choose a response,
explain downstream effects and reset. Viewpoint survives comparison changes.
These are deterministic teaching branches, explicitly not physical simulation.

### P3 — Extend and facilitate (S3–S4, F3, B3)

- [ ] Reuse the same engine for quality hold, changeover and controlled workaround.
- [ ] Add presentation mode, accessible navigation and optional facilitator notes.
- [ ] Define a bounded factory-slice JSON contract and mapping preview; document
  unsupported formats. Do not build arbitrary UML/document interpretation.
- [ ] Keep existing workboard, acceptance register, teaching room and decision log.

Gate: lessons remain data-authored; a presenter can use the lab on a projector and
small screen. Imported slice proposals cannot silently overwrite the workspace.

### P4 — Verify, publish and record (M1–M3)

- [ ] Test transitions, invalid actions, reference/current/proposed consistency,
  legacy saves/import migration and broken references.
- [ ] Test primary browser journeys, keyboard access, mobile layout and SVG fallback.
- [ ] Exercise WebGL if the environment supports it; otherwise keep that gap open.
- [ ] Re-run release allowlist/disclosure checks, dependency audit and build checks.
- [ ] Publish only reviewed source/assets and record the exact source revision,
  environment, date and limitations for evidence.
- [ ] Update the workboard as manually maintained; never imply live GitHub sync.
- [ ] Confirm Pages deployment and inspect the live experience.

Gate: tests/build/release checks pass; browser verification is reported honestly;
the site is public at https://apathyte.github.io/demokit/ without account access.

## Approved action register

| ID | Deliverable | Acceptance |
| --- | --- | --- |
| S1 | Purpose and scope | Learning/experimentation, selectable slice, bounded ambition |
| S2 | Lesson structure | Six repeatable stages with operational consequences |
| S3 | Four scenario pack | Fictional shortage, hold, changeover and workaround |
| S4 | Facilitator/debrief | Authority, missing evidence and downstream questions |
| V1 | Design spike and overhaul | Documented visual roles and responsive layouts |
| V2 | Prominent narrative | Active lesson clearly distinct from model workspace |
| V3 | Step camera focus | Selected zone follows steps; overview; reduced motion |
| V4 | Distinct flows | Material/events/authority; labels and styles beyond colour |
| V5 | Comparison | Same slice and viewpoint; explicit changed assumptions |
| F1 | Branching disruption | Choices change state and consequences; reset available |
| F2 | Slice boundaries | Relevant external dependencies remain explicit |
| F3 | Presentation mode | Large narrative, next/back, optional facilitator notes |
| B1 | Separated versioned data | Independent model/lessons/presentation/evidence contracts |
| B2 | Scenario state machine | Valid transitions, reproducible results, stated limits |
| B3 | Slice import contract | Small validated JSON proposal and mapping preview |
| M1 | Regression coverage | Meaningful logic, persistence and browser checks |
| M2 | Public provenance | Synthetic content; source/licence review for contributions |
| M3 | Evidence freshness | Revision/date/environment/limits; manual workboard label |

## Architecture and publication constraints

- Retain static GitHub Pages hosting, browser-local saves and JSON portability.
- No backend service is needed for this delivery. Back-end work means domain/data
  logic, validation and persistence boundaries, not a new server.
- Keep the existing public lab MIT scope and third-party notices intact.
- No customer names, production traces, internal endpoints, credentials or private
  implementation details. Never import a private repo/history into this release.
- A scripted outcome is an explanation, not a prediction or validated simulation.
- Existing baseline walkthroughs remain available; richer lessons are additive.
- Do not silently discard visitor edits or upgrade saved content destructively.
- Changes to the main personal website are outside this rework except its lab link.

## Deferred, not forgotten

Live plant/broker/OPC UA connections; physical simulation acceptance; enterprise
twin capabilities; shared cloud editing; automated repository synchronisation;
general UML/document ingestion; automatic technology/line redesign; proprietary
customer workspaces. B3 is the bounded contract first, not those integrations.

## How to resume and learn without losing direction

1. Read this plan and the latest execution log below; inspect current GitHub head.
2. Choose the earliest unmet gate and inspect its dependencies before adding work.
3. Implement a complete, reviewable slice and run the checks affected by it.
4. Record observed results, limitations and next action. Do not mark untested work
   complete or use an old run as evidence for a new revision.
5. Record a change to approach under Decisions; retain the original objective and
   action IDs. Ask only if new scope, rights to publish or an irreversible choice
   needs the owner's decision. Routine implementation can proceed.
6. Publish coherent verified increments; never publish an intermediate broken UI.

## Risks and decisions

| Risk / uncertainty | Current treatment |
| --- | --- |
| Rich visuals imply realism | State synthetic/scripted limits beside outcomes |
| Realistic stories reveal customer information | Author generic fictional composites; review both data and build |
| Too many simultaneous visual layers | Selectable overlay; persistent legend and textual equivalent |
| Camera movement distracts | Focus toggle, overview and reduced-motion support |
| Stored v1 workspaces omit new lesson data | Additive catalogue; explicit compatibility validation |
| Comparison implies measured improvement | Qualitative tradeoffs; no invented savings or performance figures |
| Expanding scope before one lesson works | P2 gate before scenario-pack expansion |
| Browser has no GPU | Test fallback; leave WebGL acceptance explicitly unverified |

## Execution log

- 2026-11-10: Scope approved. Baseline source recovered and public GitHub head
  confirmed. P0 started; existing static/local-save architecture retained.

## Next action

Commit the plan, then write the shortage lesson and design specification. Implement
and verify that complete lesson before extending the engine to the other three.
