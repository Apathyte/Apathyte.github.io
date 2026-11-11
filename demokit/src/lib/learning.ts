import { z } from "zod";
const text = z.string().trim().min(1).max(4000);
export const STAGES = [
  "Situation",
  "Reference",
  "Disruption",
  "Response",
  "Consequences",
  "Evidence",
] as const;
export const VIEWS = [
  "Reference flow",
  "Operational reality",
  "Proposed change",
] as const;
export const lessonSchema = z
  .object({
    id: text,
    title: text,
    question: text,
    slice: z.array(text).min(1).max(30),
    zones: z.tuple([text, text, text, text, text, text]),
    situation: text,
    reference: text,
    disruption: text,
    signal: text,
    owner: text,
    assumption: text,
    evidence: z.array(text).min(1).max(10),
    prompts: z.array(text).min(1).max(10),
    facilitator: text,
    referenceState: text,
    currentState: text,
    choices: z
      .array(
        z.object({
          id: text,
          title: text,
          action: text,
          authority: text,
          material: text,
          information: text,
          people: text,
          risk: text,
          verdict: z.enum(["Bounded response", "Unacceptable shortcut"]),
        }),
      )
      .min(2)
      .max(5),
  })
  .superRefine((v, c) => {
    if (new Set(v.choices.map((x) => x.id)).size !== v.choices.length)
      c.addIssue({ code: "custom", message: "Choice IDs must be unique" });
    if (new Set(v.slice).size !== v.slice.length)
      c.addIssue({ code: "custom", message: "Slice IDs must be unique" });
    if (v.zones.some((x) => !v.slice.includes(x)))
      c.addIssue({
        code: "custom",
        message: "Stage zones must be in the lesson slice",
      });
  });
export const catalogueSchema = z
  .object({
    schemaVersion: z.literal(1),
    provenance: text,
    lessons: z.array(lessonSchema).min(1).max(40),
  })
  .superRefine((v, c) => {
    if (new Set(v.lessons.map((x) => x.id)).size !== v.lessons.length)
      c.addIssue({ code: "custom", message: "Lesson IDs must be unique" });
  });
export type Lesson = z.infer<typeof lessonSchema>;
export type LessonState = { stage: number; choice: string | null };
export type LessonAction =
  | { type: "next" }
  | { type: "back" }
  | { type: "reset" }
  | { type: "disrupt" }
  | { type: "choose"; id: string };
export const initialLessonState = (): LessonState => ({
  stage: 0,
  choice: null,
});
export function transition(
  lesson: Lesson,
  state: LessonState,
  action: LessonAction,
): LessonState {
  if (!Number.isInteger(state.stage) || state.stage < 0 || state.stage > 5)
    throw Error("Invalid lesson stage");
  if (state.choice && !lesson.choices.some((c) => c.id === state.choice))
    throw Error("Unknown response");
  if (state.stage >= 4 && !state.choice)
    throw Error("Consequences require a response");
  if (action.type === "reset") return initialLessonState();
  if (action.type === "disrupt") return { stage: 2, choice: null };
  if (action.type === "choose") {
    if (state.stage !== 3)
      throw Error("Select responses in the response stage");
    if (!lesson.choices.some((c) => c.id === action.id))
      throw Error("Unknown response");
    return { ...state, choice: action.id };
  }
  if (action.type === "back")
    return { ...state, stage: Math.max(0, state.stage - 1) };
  if (state.stage === 3 && !state.choice) return state;
  return { ...state, stage: Math.min(5, state.stage + 1) };
}
export function comparison(lesson: Lesson, view: string, state: LessonState) {
  if (view === VIEWS[0])
    return {
      label: "Assumed reference",
      summary: lesson.referenceState,
      blocked: false,
    };
  if (view === VIEWS[1])
    return {
      label: "Constraint introduced",
      summary: lesson.currentState,
      blocked: true,
    };
  const c = lesson.choices.find((c) => c.id === state.choice);
  return c
    ? {
        label:
          c.verdict === "Unacceptable shortcut"
            ? "Rejected proposal"
            : "Hypothetical response · prerequisites unverified",
        summary: c.action + " " + c.risk,
        blocked: true,
      }
    : {
        label: "No response selected",
        summary:
          "Choose a response to compare its consequences. No improvement is assumed.",
        blocked: true,
      };
}
export const presentationSchema = z.object({
  schemaVersion: z.literal(1),
  lessonId: text,
  scope: z.enum(["Lesson slice", "Whole site"]),
  view: z.enum(VIEWS),
  follow: z.boolean(),
  notes: z.boolean(),
});
export const sliceProposalSchema = z
  .object({
    schemaVersion: z.literal(1),
    kind: z.literal("factory-slice-proposal"),
    title: text,
    provenance: text,
    zones: z
      .array(z.object({ id: text, label: text, mapsTo: text }))
      .min(1)
      .max(80),
    boundaries: z
      .array(
        z.object({
          from: text,
          to: text,
          kind: z.enum(["Material", "Events", "Authority"]),
          meaning: text,
        }),
      )
      .max(200),
  })
  .superRefine((p, c) => {
    const ids = new Set(p.zones.map((x) => x.id));
    if (ids.size !== p.zones.length)
      c.addIssue({ code: "custom", message: "Proposal IDs must be unique" });
    for (const b of p.boundaries)
      if (!ids.has(b.from) || !ids.has(b.to))
        c.addIssue({
          code: "custom",
          message: "Proposal endpoints must resolve",
        });
  });
export function previewSlice(input: unknown, modelIds: string[]) {
  const p = sliceProposalSchema.parse(input);
  return {
    ...p,
    mapping: p.zones.map((z) => ({
      ...z,
      resolved: modelIds.includes(z.mapsTo),
    })),
  };
}
export function availableLesson(l: Lesson, ids: string[]) {
  return l.slice.every((id) => ids.includes(id));
}
export const AUTHORITY_LINKS = [
  ["planning", "lineA"],
  ["quality", "dosing"],
  ["quality", "packing"],
  ["control", "lineA"],
  ["workshop", "lineA"],
];
export function evidenceFreshness(date: string, now = new Date()) {
  const time = Date.parse(date);
  if (!Number.isFinite(time)) return "Date not recorded";
  if (time > now.getTime()) return "Future date — review required";
  return now.getTime() - time > 90 * 86400000
    ? "Older than 90 days — review applicability"
    : "Dated record — verify revision and scope";
}
