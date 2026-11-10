import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { labSchema, modelChecks } from "../src/lib/schema.ts";
const seed = JSON.parse(
  readFileSync(new URL("../src/lib/public-seed.json", import.meta.url), "utf8"),
);
test("public model and six integrity checks", () => {
  assert(labSchema.safeParse(seed).success);
  assert.equal(seed.zones.length, 13);
  assert.equal(seed.scenarios.length, 5);
  assert(modelChecks(seed).every((c) => c.pass));
  assert(seed.checks.every((c) => c.status === "Not run"));
});
for (const [name, mutate] of [
  ["dangling flow", (d) => d.materialLinks.push(["missing", "lineA"])],
  ["duplicate ID", (d) => d.zones.push(d.zones[0])],
  ["unknown scenario zone", (d) => (d.scenarios[0].steps[0].zone = "missing")],
  ["unattributed pass", (d) => (d.checks[0].status = "Recorded pass")],
  ["unsafe link", (d) => (d.checks[0].url = "javascript:alert(1)")],
  ["negative size", (d) => (d.zones[0].w = -1)],
  ["no scenarios", (d) => (d.scenarios = [])],
  ["empty ID", (d) => (d.zones[0].id = "")],
])
  test("reject " + name, () => {
    const d = structuredClone(seed);
    mutate(d);
    assert.equal(labSchema.safeParse(d).success, false);
  });
test("JSON round-trip", () =>
  assert.deepEqual(labSchema.parse(JSON.parse(JSON.stringify(seed))), seed));
