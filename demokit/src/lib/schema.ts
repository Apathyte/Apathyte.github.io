import { z } from "zod";
const text = z.string().max(12000),
  url = z
    .string()
    .max(2000)
    .refine(
      (v) => !v || /^https:\/\//.test(v),
      "Evidence links must use https",
    );
const zone = z.object({
  id: text,
  code: text,
  name: text,
  short: text,
  kind: z.enum([
    "dock",
    "racks",
    "weigh",
    "process",
    "lab",
    "pack",
    "utilities",
    "workshop",
    "control",
    "office",
  ]),
  group: z.enum(["material", "production", "support"]),
  x: z.number().min(-100).max(100),
  z: z.number().min(-100).max(100),
  w: z.number().min(2).max(30),
  d: z.number().min(2).max(30),
  role: text,
  owner: text,
  assets: z.array(text).max(30),
  systems: z.array(z.tuple([text, z.number().int().min(0).max(4)])).max(20),
  events: z.array(text).max(30),
  decision: text,
  boundary: text,
});
const story = z.object({
  id: text,
  title: text,
  tag: text,
  summary: text,
  steps: z
    .array(
      z.object({
        zone: text,
        level: z.number().int().min(0).max(4),
        title: text,
        text: text,
        event: text,
        actor: text,
        claim: text,
      }),
    )
    .min(1)
    .max(50),
});
const work = z.object({
  id: text,
  title: text,
  type: z.enum(["Experiment", "Cleanup", "Pull request", "Documentation"]),
  status: z.enum(["Next", "In progress", "Review", "Retained"]),
  branch: text,
  detail: text,
  next: text,
  url,
});
const check = z.object({
  id: text,
  title: text,
  status: z.enum(["Recorded pass", "Needs evidence", "Not run", "Failed"]),
  scope: text,
  result: text,
  date: text,
  revision: text,
  command: text,
  environment: text,
  limit: text,
  url,
});
const decision = z.object({
  id: text,
  title: text,
  status: z.enum(["Open", "Bounded decision", "Proposed", "Superseded"]),
  context: text,
  choice: text,
  evidence: text,
  limit: text,
  risk: text,
  next: text,
  url,
});
export const labSchema = z
  .object({
    schemaVersion: z.literal(1),
    zones: z.array(zone).min(1).max(80),
    scenarios: z.array(story).min(1).max(50),
    materialLinks: z.array(z.tuple([text, text])).max(300),
    eventLinks: z.array(z.tuple([text, text])).max(300),
    work: z.array(work).max(300),
    checks: z.array(check).max(300),
    decisions: z.array(decision).max(300),
  })
  .superRefine((s, c) => {
    const ids = new Set(s.zones.map((z) => z.id));
    for (const key of [
      "zones",
      "scenarios",
      "work",
      "checks",
      "decisions",
    ] as const) {
      if (
        new Set(s[key].map((x) => x.id)).size !== s[key].length ||
        s[key].some((x) => !x.id.trim())
      )
        c.addIssue({
          code: "custom",
          message: key + ": IDs must be unique and nonempty",
        });
    }
    for (const [a, b] of [...s.materialLinks, ...s.eventLinks])
      if (!ids.has(a) || !ids.has(b))
        c.addIssue({
          code: "custom",
          message: "Every flow endpoint must exist",
        });
    for (const st of s.scenarios)
      for (const step of st.steps)
        if (!ids.has(step.zone))
          c.addIssue({
            code: "custom",
            message: "Scenario references unknown zone: " + step.zone,
          });
    for (const r of s.checks)
      if (
        r.status === "Recorded pass" &&
        (!r.url || !r.date || !r.revision || !r.command || !r.environment)
      )
        c.addIssue({
          code: "custom",
          message:
            "Recorded passes need source, date, revision, command and environment",
        });
  });
export type LabData = z.infer<typeof labSchema>;
export type Zone = LabData["zones"][number];
export function modelChecks(d: LabData) {
  const ids = new Set(d.zones.map((z) => z.id));
  return [
    {
      name: "Unique zone identities",
      pass: ids.size === d.zones.length,
      detail: d.zones.length + " zones",
    },
    {
      name: "Flow endpoint integrity",
      pass: [...d.materialLinks, ...d.eventLinks].every(
        ([a, b]) => ids.has(a) && ids.has(b),
      ),
      detail: "Material and event endpoints resolve",
    },
    {
      name: "Operational ownership",
      pass: d.zones.every((z) => z.owner.trim() && z.boundary.trim()),
      detail: "Every zone names an owner and boundary",
    },
    {
      name: "Evidence attribution",
      pass: d.checks
        .filter((c) => c.status === "Recorded pass")
        .every(
          (c) => c.url && c.date && c.revision && c.command && c.environment,
        ),
      detail: "Passes require environment, revision and source",
    },
    {
      name: "Scenario references",
      pass: d.scenarios.every((s) => s.steps.every((st) => ids.has(st.zone))),
      detail: "Every walkthrough step resolves to a zone",
    },
    {
      name: "Positive dimensions",
      pass: d.zones.every((z) => z.w > 0 && z.d > 0),
      detail: "Geometry has valid width and depth",
    },
  ];
}
