# Event lab vertical slice — approved 19 November 2026

N1 Navigation, N2 dual transport, N3 interactive tests approved. Work on an isolated source branch, not the live site. Issue #12 records the owner observations: browser acceleration available, default event overlay empty, little difference between comparisons. Existing four lessons and browser-local model edits retained. The owner delegated usability review; GPU application acceptance and independent human trial remain open.

## Scope and gates
- Factory Atlas / Factory overview, Scenario lab, Event explorer; dedicated Test suite. Same editable factory geometry. No lesson-slice dropdown; full site with operational context retained.
- One original synthetic material-shortage journey: allocate A; shortage; notify planning; reject shortcut; propose B; authorize readiness; execute B; quality hold. A never becomes released because B succeeds.
- Public mode: synchronous in-memory pub/sub, deterministic envelope, separate projection, message trace and clickable test cases; NOT MQTT broker evidence.
- Local/CI: same event corpus sent through isolated loopback MQTT using Mosquitto, with independent subscriber and exact payload/order/projection assertions. No public broker or connection to any real plant. No private source or traces.
- Visual: depict distinct order/zone states, actual active route where applicable, blocked handovers, proposal and authorized execution; labels convey meaning independent of animation. Existing scripted lessons explicitly separate from executed experiment.
- Browser: headless regression of default/route navigation, event trace, invalid start, authorization and completion, reset, visual evidence. Software WebGL and GPU hardware proof distinct.
- Release: npm tests, typecheck/build, release audit and reproducible generated assets, independent broker and browser evidence; candidate source must not be presented as deployed. Publish only after review of actual evidence, no inherited passes.

Deferred: additional scenario engines, real plant connectivity, hardware proof, procurement, unrelated site changes. No private source is copied.
