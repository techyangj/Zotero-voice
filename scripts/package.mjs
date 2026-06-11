import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const outDir = "dist";
const outFile = join(outDir, `zotero-pronounce-${manifest.version}.xpi`);
const entries = [
  "manifest.json",
  "bootstrap.js",
  "prefs.js",
  "build",
  "chrome",
  "locale",
  "README.md"
];

mkdirSync(outDir, { recursive: true });
rmSync(outFile, { force: true });

for (const entry of entries) {
  if (!existsSync(entry)) {
    throw new Error(`Cannot package missing entry: ${entry}`);
  }
}

execFileSync("zip", ["-Xqr", outFile, ...entries], { stdio: "inherit" });
console.log(`Created ${outFile}`);
