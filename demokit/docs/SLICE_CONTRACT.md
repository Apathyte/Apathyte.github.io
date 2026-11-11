# Factory-slice proposal contract, version 1

Purpose: review how a small fictional source model maps to this teaching model.
The UI validates and previews; it does not apply changes, infer UML semantics or
upload content. Existing full workspace JSON import/export remains separate.

```json
{
  "schemaVersion": 1,
  "kind": "factory-slice-proposal",
  "title": "Fictional preparation slice",
  "provenance": "Original synthetic exercise",
  "zones": [
    {"id":"prep","label":"Preparation","mapsTo":"dosing"},
    {"id":"review","label":"Quality review","mapsTo":"quality"}
  ],
  "boundaries": [
    {"from":"review","to":"prep","kind":"Authority","meaning":"Eligibility approval before addition"}
  ]
}
```

Zone IDs must be unique; relationship endpoints must reference proposal IDs.
`mapsTo` is an existing public model zone ID. Unknown mappings remain visibly
unresolved; the preview never silently drops or applies them. Maximum 80 zones,
200 relationships and 100 KB input. Kind: Material, Events or Authority. Text is
rendered as text, not executed HTML. Invalid versions and malformed proposals fail.

Next integration question: define hierarchy, unit identity and interchange needs
using one public example before accepting diagrams, automation exports or UML.
General document interpretation and automatic model generation remain deferred.

## Version and persistence boundaries

- Existing `LabData` schema v1: model, baseline walkthroughs, workboard, evidence
  and decision records. Existing localStorage key and JSON exports stay compatible.
- Lesson catalogue schema v1: independent authored lessons in `src/lib/lessons.json`.
  Domain transitions live in `learning.ts`. Visitor JSON cannot replace these rules.
- Presentation preferences schema v1: independent browser-local key. Scope, lesson,
  view, follow and notes may persist; exercise progress deliberately resets.
- Evidence records retain date, tested revision, environment, command, source and
  limitations. A pass has no automatic validity for a later release or edited model.

No destructive migration is needed: new lessons are additive. A saved custom
model missing a lesson's mapped zones shows an unavailable-lesson notice rather
than replacing data. Unknown/invalid stored workspaces keep their original stored
bytes and show a warning. Export/back up visitor data before manual replacement.
