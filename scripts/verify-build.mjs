import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { basePath, siteOrigin } from "../site.config.mjs";

const directory = path.resolve(process.env.BUILD_DIR || "dist");
const routes = [
  "",
  "agenda/",
  "organizing-committee/",
  "speakers/",
  "registration/",
  "registration/poster/",
];
const htmlFiles = routes.map((route) =>
  path.join(directory, route, "index.html"),
);
let checked = 0;
async function verifyUrl(reference, documentUrl) {
  if (/^(data:|mailto:|tel:)/.test(reference)) return;
  const url = new URL(reference.replaceAll("&amp;", "&"), documentUrl);
  if (url.origin !== siteOrigin) return;
  assert(
    url.pathname.startsWith(basePath),
    `URL escaped the deployment base: ${url}`,
  );
  let file = path.resolve(
    directory,
    decodeURIComponent(url.pathname.slice(basePath.length)),
  );
  assert(
    file === directory || file.startsWith(directory + path.sep),
    "Invalid asset path",
  );
  if (url.pathname.endsWith("/")) file = path.join(file, "index.html");
  assert((await stat(file)).isFile(), `Missing asset or page: ${url}`);
  if (url.hash && file.endsWith(".html")) {
    const html = await readFile(file, "utf8");
    assert(
      html.includes(`id="${url.hash.slice(1)}"`),
      `Missing anchor: ${url}`,
    );
  }
  checked++;
}
for (let i = 0; i < htmlFiles.length; i++) {
  const html = await readFile(htmlFiles[i], "utf8");
  const documentUrl = new URL(basePath + routes[i], siteOrigin);
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) || []).length,
    1,
    "Each page needs one h1",
  );
  assert.equal(
    (html.match(/aria-current="page"/g) || []).length,
    1,
    "Each page needs one current main navigation link",
  );
  assert(!html.includes('href="#"'), "No empty placeholder links");
  assert(
    html.includes('lang="ar"'),
    "Arabic brand must have a language attribute",
  );
  assert(html.includes('dir="rtl"'), "Arabic brand must use RTL isolation");
  assert(
    html.includes("2026-11-27") || html.includes("27 November 2026"),
    "Event date missing",
  );
  assert(
    html.includes(new URL(basePath + routes[i], siteOrigin).href),
    "Canonical URL missing",
  );
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g))
    await verifyUrl(match[1], documentUrl);
  const social = html.match(/property="og:image" content="([^"]+)"/);
  assert(social, "Social graphic missing");
  await verifyUrl(social[1], documentUrl);
}
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith(".css")) {
      const css = await readFile(file, "utf8");
      const url = new URL(
        basePath + path.relative(directory, file),
        siteOrigin,
      );
      for (const match of css.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g))
        await verifyUrl(match[1], url);
    }
  }
}
await walk(directory);
const agenda = await readFile(htmlFiles[1], "utf8");
assert.equal(
  (agenda.match(/class="agenda-entry"/g) || []).length,
  17,
  "All 17 programme entries must render",
);
for (const time of [
  "08:30",
  "09:00",
  "09:10",
  "09:40",
  "10:00",
  "10:20",
  "10:40",
  "11:40",
  "12:00",
  "12:20",
  "12:40",
  "13:00",
  "14:00",
  "14:15",
  "14:30",
  "14:45",
  "15:00",
]) {
  assert(
    agenda.includes(`T${time}:00+04:00`),
    `Incorrect or missing UAE start time ${time}`,
  );
}
for (const name of ["Hala Alsaleh", "Haotian Tang", "Eduardo Beltrame"])
  assert((await readFile(htmlFiles[2], "utf8")).includes(name));
console.log(
  `Verified 6 static routes, 17 UAE-time agenda entries, canonical metadata, and ${checked} local asset/link references for ${siteOrigin}${basePath}`,
);
