import { readFile, writeFile, copyFile } from "node:fs/promises";
const names = [
  "react",
  "react-dom",
  "scheduler",
  "three",
  "lucide-react",
  "zod",
];
let text =
  "THIRD-PARTY NOTICES — DemoKit Open Factory Lab\n\nThese dependencies are bundled in the public browser application.\nOriginal lab code is licensed separately under ./LICENSE.\n";
for (const name of names) {
  const pkg = JSON.parse(
    await readFile(`node_modules/${name}/package.json`, "utf8"),
  );
  text +=
    `\n========== ${name} ${pkg.version} (${pkg.license}) ==========\n\n` +
    (await readFile(`node_modules/${name}/LICENSE`, "utf8")) +
    "\n";
}
await writeFile("THIRD_PARTY_NOTICES.txt", text);
await writeFile("dist/THIRD_PARTY_NOTICES.txt", text);
await copyFile("LICENSE", "dist/LICENSE");
