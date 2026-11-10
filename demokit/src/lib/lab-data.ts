import data from "./public-seed.json";
import { labSchema } from "./schema";
export { labSchema, modelChecks } from "./schema";
export type { LabData, Zone } from "./schema";
export const REPO = "https://github.com/Apathyte/Apathyte.github.io";
export const LAB = REPO + "/tree/main/demokit";
export const seed = labSchema.parse(data);
