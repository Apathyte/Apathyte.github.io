import { cp, rm, mkdir } from "node:fs/promises";
await rm("assets", { recursive: true, force: true });
await mkdir("assets", { recursive: true });
await cp("dist/assets", "assets", { recursive: true });
await cp("dist/index.html", "index.html");
console.log(
  "Prepared static Pages output. Run audit:release before publishing.",
);
