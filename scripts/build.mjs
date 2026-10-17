import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
// npm appends --base to this wrapper; forward it to Vite rather than the page generator.
const vite = fileURLToPath(
  new URL("../node_modules/vite/bin/vite.js", import.meta.url),
);
const build = spawnSync(
  process.execPath,
  [vite, "build", ...process.argv.slice(2)],
  { stdio: "inherit" },
);
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status || 1);
await import("./build-pages.mjs");
