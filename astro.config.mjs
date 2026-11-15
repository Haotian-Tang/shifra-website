import { defineConfig } from "astro/config";
import { siteOrigin, basePath } from "./site.config.mjs";

export default defineConfig({
  site: siteOrigin,
  base: basePath,
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  outDir: process.env.BUILD_DIR || "./dist",
  devToolbar: { enabled: false },
});
