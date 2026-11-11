# Public acceptance plan

Each gate needs public evidence identifying revision, environment, command, expected outcome, observed result and limitation. The browser's editable register starts without inherited run claims. The integrity runner reports only its six local checks.

| Gate | Acceptance target | Negative control / limitation |
| --- | --- | --- |
| Offline | Unique IDs, flow endpoints, scenario links, evidence attribution and dimensions | Reject missing endpoints, duplicate IDs, unsafe links and unattributed passes. |
| Browser | Five views, selection, scenarios, editing, save/reload, import validation and mobile layout | Record blocked storage and WebGL fallback. |
| Simulation | Defined model, deterministic fixtures, repeatable transitions and constraints | Break a constraint deliberately; animation alone does not pass. |
| OPC UA | Start, stop, restart, reconnect, stale quality and subscription recovery | No session exists in this application. Future adapters need their own evidence. |
| Replay | Trace identity, ordering, expected state and determinism | Teaching sequences are not recorded replay. |
| Hardware | Authorised machine and operator acceptance | No real equipment is included or controlled. |

Run `npm test` and the build locally. Public CI records repeatable checks against the public commit. Browser verification is described in `PUBLIC_RELEASE_REVIEW.md`.

## Learning studio regression

`npm test` includes all response branches, required-choice gates, rejected
transitions, comparison invariants, legacy workspace preservation, proposal
validation and separate presentation preferences. Browser review must exercise:

1. Reference → disruption → response → consequence → evidence → reset.
2. A bounded response and a rejected shortcut; neither releases held material.
3. Comparison keeps selection/viewpoint; overview and follow controls work.
4. Material/event/authority legends, endpoint lists and boundary dependencies.
5. Presentation entry/exit, keyboard selection and a 390px viewport.
6. Invalid JSON rejection, edited v1 import, save/reload and baseline restoration.
7. Slice-mapping preview resolves known IDs and labels unknown mappings.
8. Existing workboard, teaching, decisions and six local integrity checks.

Record GPU and reduced-motion camera acceptance separately from the SVG fallback.
