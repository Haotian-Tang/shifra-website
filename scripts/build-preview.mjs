import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const astroPackage = JSON.parse(
  readFileSync(path.join(root, "node_modules/astro/package.json"), "utf8"),
);
const astroCli = path.join(
  root,
  "node_modules/astro",
  typeof astroPackage.bin === "string"
    ? astroPackage.bin
    : astroPackage.bin.astro,
);
const env = {
  ...process.env,
  BUILD_DIR: "dist-preview",
};
for (const args of [
  [astroCli, "build"],
  [path.join(root, "scripts/verify-build.mjs")],
]) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    env,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
