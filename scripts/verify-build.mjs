import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { basePath, siteOrigin } from "../site.config.mjs";

const directory = path.resolve(process.env.BUILD_DIR || "dist");
const redirects = {
  "agenda/": "agenda",
  "organizing-committee/": "organizing-committee",
  "speakers/": "speakers",
  "registration/": "registration",
  "registration/poster/": "poster-registration",
};
const mainFile = path.join(directory, "index.html");
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
const html = await readFile(mainFile, "utf8");
const documentUrl = new URL(basePath, siteOrigin);
assert.equal(
  (html.match(/<h1(?:\s|>)/g) || []).length,
  1,
  "The single page needs one main title",
);
assert(
  !html.includes('id="main-navigation"') &&
    !html.includes('class="menu-toggle"'),
  "Separate page tabs and mobile navigation must be removed",
);
assert(!html.includes('href="#"'), "No empty placeholder links");
assert(
  html.includes('lang="ar"') && html.includes('dir="rtl"'),
  "Arabic identity must retain language and RTL isolation",
);
assert(html.includes("27 November 2026"), "Event date missing");
assert(
  html.includes(`rel="canonical" href="${documentUrl.href}"`),
  "Main canonical URL missing",
);
for (const section of [
  "about",
  "agenda",
  "registration",
  "poster-registration",
  "organizing-committee",
  "speakers",
  "location",
])
  assert(html.includes(`id="${section}"`), `Missing section ${section}`);
assert(
  html.includes("mbzuai-navy-blue.jpg") &&
    !html.includes("mbzuai-original.jpg"),
  "Use the supplied current MBZUAI logo",
);
assert.equal(
  (html.match(/id="poster-form"/g) || []).length,
  1,
  "Poster registration must be inline exactly once",
);
const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
assert(
  footer && !/<a\b/.test(footer),
  "Keep the footer compact and free of links",
);
for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g))
  await verifyUrl(match[1], documentUrl);
const social = html.match(/property="og:image" content="([^"]+)"/);
assert(social, "Social graphic missing");
await verifyUrl(social[1], documentUrl);
for (const [route, section] of Object.entries(redirects)) {
  const redirect = await readFile(
    path.join(directory, route, "index.html"),
    "utf8",
  );
  assert(
    redirect.includes('http-equiv="refresh"') &&
      redirect.includes(`0;url=${basePath}#${section}`),
    `Legacy route must lead to its section: ${route}`,
  );
  assert(
    !redirect.includes('id="poster-form"') &&
      !redirect.includes('class="agenda-entry"'),
    "Legacy links must not duplicate site content",
  );
  for (const match of redirect.matchAll(/\b(?:href|src)="([^"]+)"/g))
    await verifyUrl(match[1], new URL(basePath + route, siteOrigin));
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
const agenda = html;
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
  assert(html.includes(name));
console.log(
  `Verified 1 content page, 5 legacy section redirects, 17 UAE-time agenda entries, canonical metadata, and ${checked} local asset/link references for ${siteOrigin}${basePath}`,
);
