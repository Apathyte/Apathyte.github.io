import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  catalogueSchema,
  transition,
  initialLessonState,
  comparison,
  VIEWS,
  availableLesson,
  previewSlice,
  presentationSchema,
} from "../src/lib/learning.ts";
import { labSchema } from "../src/lib/schema.ts";
const read = (p) =>
  JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const catalogue = catalogueSchema.parse(read("../src/lib/lessons.json"));
const model = read("../src/lib/public-seed.json");
for (const lesson of catalogue.lessons) {
  test(
    lesson.id + ": all branches reach evidence, preserve authority and reset",
    () => {
      assert(
        availableLesson(
          lesson,
          model.zones.map((z) => z.id),
        ),
      );
      for (const choice of lesson.choices) {
        let s = initialLessonState();
        s = transition(lesson, s, { type: "next" });
        assert.equal(s.stage, 1);
        s = transition(lesson, s, { type: "next" });
        assert.equal(s.stage, 2);
        s = transition(lesson, s, { type: "next" });
        assert.equal(s.stage, 3);
        assert.deepEqual(transition(lesson, s, { type: "next" }), s);
        s = transition(lesson, s, { type: "choose", id: choice.id });
        s = transition(lesson, s, { type: "next" });
        assert.equal(s.stage, 4);
        assert.equal(comparison(lesson, VIEWS[2], s).blocked, true);
        assert(
          choice.authority &&
            choice.risk &&
            choice.material &&
            choice.information &&
            choice.people,
        );
        s = transition(lesson, s, { type: "next" });
        assert.equal(s.stage, 5);
        assert.deepEqual(transition(lesson, s, { type: "next" }), s);
        assert.equal(transition(lesson, s, { type: "back" }).choice, choice.id);
        assert.deepEqual(
          transition(lesson, s, { type: "reset" }),
          initialLessonState(),
        );
        assert.deepEqual(transition(lesson, s, { type: "disrupt" }), {
          stage: 2,
          choice: null,
        });
      }
    },
  );
  test(lesson.id + ": comparison cannot imply unselected improvement", () => {
    const s = initialLessonState(),
      copy = structuredClone(s);
    assert.equal(comparison(lesson, VIEWS[2], s).label, "No response selected");
    assert.equal(comparison(lesson, VIEWS[0], s).blocked, false);
    assert.equal(comparison(lesson, VIEWS[1], s).blocked, true);
    assert.deepEqual(s, copy);
    assert.equal(availableLesson(lesson, []), false);
  });
}
const l = catalogue.lessons[0];
test("invalid transitions and responses fail closed", () => {
  assert.throws(() =>
    transition(l, initialLessonState(), {
      type: "choose",
      id: l.choices[0].id,
    }),
  );
  assert.throws(() =>
    transition(
      l,
      { stage: 3, choice: null },
      { type: "choose", id: "unknown" },
    ),
  );
  assert.throws(() =>
    transition(l, { stage: 9, choice: null }, { type: "next" }),
  );
  assert.throws(() =>
    transition(l, { stage: 4, choice: null }, { type: "next" }),
  );
  assert.throws(() =>
    transition(l, { stage: 3, choice: "unknown" }, { type: "next" }),
  );
  assert.equal(transition(l, initialLessonState(), { type: "back" }).stage, 0);
});
test("catalogue rejects duplicate choices and dangling stage references", () => {
  for (const mutate of [
    (d) => d.lessons[0].choices.push(d.lessons[0].choices[0]),
    (d) => (d.lessons[0].zones[0] = "missing"),
    (d) => d.lessons.push(d.lessons[0]),
  ]) {
    const d = structuredClone(catalogue);
    mutate(d);
    assert.equal(catalogueSchema.safeParse(d).success, false);
  }
});
test("existing schema v1 workspace round-trip retains edits and evidence", () => {
  const custom = structuredClone(model);
  custom.zones[0].name = "My fictional receiving area";
  custom.work[0].title = "My local task";
  const original = JSON.stringify(custom);
  assert.deepEqual(labSchema.parse(JSON.parse(original)), custom);
  assert.equal(custom.schemaVersion, 1);
  assert.equal("lessons" in custom, false);
});
const proposal = {
  schemaVersion: 1,
  kind: "factory-slice-proposal",
  title: "Example",
  provenance: "Synthetic",
  zones: [
    { id: "a", label: "Prep", mapsTo: "dosing" },
    { id: "b", label: "Review", mapsTo: "unknown" },
  ],
  boundaries: [{ from: "a", to: "b", kind: "Events", meaning: "Observation" }],
};
test("slice preview identifies unresolved mapping without changing input or model", () => {
  const before = JSON.stringify(model),
    p = JSON.stringify(proposal),
    result = previewSlice(
      proposal,
      model.zones.map((z) => z.id),
    );
  assert.equal(result.mapping[0].resolved, true);
  assert.equal(result.mapping[1].resolved, false);
  assert.equal(JSON.stringify(proposal), p);
  assert.equal(JSON.stringify(model), before);
});
test("slice preview rejects invalid endpoints and unknown versions", () => {
  assert.throws(() => previewSlice({ ...proposal, schemaVersion: 2 }, []));
  assert.throws(() =>
    previewSlice(
      {
        ...proposal,
        boundaries: [{ ...proposal.boundaries[0], to: "absent" }],
      },
      [],
    ),
  );
  assert.throws(() => previewSlice({}, []));
});
test("presentation preferences have an independent versioned contract", () => {
  const p = {
    schemaVersion: 1,
    lessonId: l.id,
    scope: "Lesson slice",
    view: VIEWS[0],
    follow: true,
    notes: false,
  };
  assert.deepEqual(presentationSchema.parse(p), p);
  assert.equal(
    presentationSchema.safeParse({ ...p, schemaVersion: 2 }).success,
    false,
  );
});
