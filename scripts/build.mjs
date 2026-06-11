import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "build/index.js",
  format: "iife",
  globalName: "ZoteroPronounce",
  platform: "browser",
  target: ["firefox115"],
  sourcemap: true,
  logLevel: "info"
});
