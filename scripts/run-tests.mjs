/**
 * Zero-dependency test runner.
 *
 * The app source uses extensionless, bundler-style imports (e.g. `./color`),
 * which Node's native ESM loader can't resolve. So we bundle each `*.test.ts`
 * with esbuild (already present via Vite) into plain ESM, then run them with
 * Node's built-in test runner (`node:test`). No test framework dependency.
 */
import { build } from "esbuild";
import { spawnSync } from "node:child_process";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = ".test-build";

function findTests(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...findTests(path));
    } else if (entry.name.endsWith(".test.ts")) {
      found.push(path);
    }
  }
  return found;
}

const tests = findTests("app");
if (tests.length === 0) {
  console.log("No *.test.ts files found under app/.");
  process.exit(0);
}

rmSync(OUT_DIR, { recursive: true, force: true });
await build({
  entryPoints: tests,
  outdir: OUT_DIR,
  bundle: true,
  format: "esm",
  platform: "node",
  sourcemap: "inline",
  logLevel: "error",
});

const result = spawnSync(
  process.execPath,
  ["--test", `${OUT_DIR}/**/*.test.js`],
  { stdio: "inherit" },
);

rmSync(OUT_DIR, { recursive: true, force: true });
process.exit(result.status ?? 1);
