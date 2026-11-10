# Public architecture decisions

The interactive log lives in `src/lib/public-seed.json`. Records include context, choice, evidence, limitations, risk and next action.

| Decision | Current position | Evidence and limit | Next action |
| --- | --- | --- | --- |
| Hosting and editing | Static GitHub Pages; browser-local workspaces | No account or backend. Saves are not shared. | Review contributions through GitHub. |
| Blender versus OIP | Open comparison; procedural Three.js baseline | No third-party model or simulation runtime included. No equal-scene benchmark published. | Identify exact candidate/version/licence; compare the same fictional task. |
| Operational authority | Viewer and teaching simulator remain observational | No command or integration API in this release. | Define an observation contract before adding adapters. |
| Model reuse | Validated data drives the scene | Zones and routes, not full standard conformance or interchange. | Validate richer parentage and asset definitions. |
| Open publication | MIT scope restricted to this directory | Synthetic content and explicit dependency notices. | Review provenance and disclosure at each release. |

A future pipeline may use Blender exports through glTF. No performance, fidelity or licensing conclusion is implied. OIP remains a candidate label from the design question; identify its exact distribution before adding any dependency.
