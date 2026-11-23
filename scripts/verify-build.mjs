import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { basePath, siteOrigin } from "../site.config.mjs";
import { registrationUrl } from "../src/data/registration.ts";
import { speakers } from "../src/data/event.ts";
import { agenda as programme } from "../src/data/agenda.ts";

const directory = path.resolve(process.env.BUILD_DIR || "dist");
const redirects = {
  "agenda/": "#agenda",
  "organizing-committee/": "people/#organizing-committee",
  "speakers/": "people/#speakers",
  "registration/": "#registration",
  "registration/poster/": "#poster-registration",
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
  "The home page needs one main title",
);
assert(
  html.includes('aria-label="Main navigation"') && html.includes(`href="${basePath}people/"`),
  "Home and Committee & Speakers navigation must be available",
);
const hero = html.match(/<section class="home-hero"[\s\S]*?<\/section>/)?.[0];
assert(hero && (hero.match(/<a\b/g) || []).length === 1 && hero.includes('Register for our symposium') && !hero.includes('Add to calendar'), "Keep the hero focused on registration");
const agendaSection = html.match(/<section id="agenda"[\s\S]*?<\/section>/)?.[0];
assert(agendaSection && agendaSection.includes('Print agenda') && agendaSection.includes('Add to calendar') && agendaSection.includes(`href="${basePath}downloads/shifra-symposium.ics"`) && agendaSection.includes('download="SHIFRA-Symposium.ics"'), "The agenda must offer printing and the calendar download");
const calendar = await readFile(path.join(directory, 'downloads/shifra-symposium.ics'), 'utf8');
const unfoldedCalendar = calendar.replace(/\r\n[ \t]/g, '');
assert(calendar.endsWith('\r\n') && !/(?<!\r)\n/.test(calendar), "Calendar must use CRLF line endings");
assert(calendar.split('\r\n').every(line => Buffer.byteLength(line, 'utf8') <= 75), "Calendar lines must be folded within 75 UTF-8 octets");
assert.equal((unfoldedCalendar.match(/^BEGIN:VEVENT$/gm) || []).length, 1, "Calendar must contain one symposium event");
assert(unfoldedCalendar.includes('DTSTART:20261127T043000Z\r\n') && unfoldedCalendar.includes('DTEND:20261127T131000Z\r\n'), "Calendar must represent 27 November, 08:30–17:10 UAE time");
assert(unfoldedCalendar.includes('LOCATION:Lecture Hall 1 & 2') && unfoldedCalendar.includes('Mohamed bin Zayed University of Artificial Intelligence') && unfoldedCalendar.includes('Abu Dhabi'), "Calendar must include the full venue");
assert(unfoldedCalendar.includes(`URL:${documentUrl.href}\r\n`), "Calendar must link to the symposium website");
assert(!hero.includes('Symposium programme') && !hero.includes('View agenda'), "Remove the old hero programme label and agenda action");
assert(html.includes('2026-11-24T23:59:00+04:00') && html.includes('11:59 PM'), "The abstract deadline must show 24 November 2026 at 23:59 UAE time");
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
  "abstract-submission",
  "registration",
  "poster-registration",
  "location",
])
  assert(html.includes(`id="${section}"`), `Missing section ${section}`);
assert(!html.includes('id="organizing-committee"') && !html.includes('id="speakers"'), "Committee and speakers belong on their separate page");
const people = await readFile(path.join(directory, 'people/index.html'), 'utf8');
const peopleUrl = new URL(basePath + 'people/', siteOrigin);
assert.equal((people.match(/<h1(?:\s|>)/g) || []).length, 1, "The people page needs one main title");
assert(people.includes(`rel="canonical" href="${peopleUrl.href}"`), "People canonical URL missing");
for (const section of ['organizing-committee', 'speakers']) assert(people.includes(`id="${section}"`), `People page is missing ${section}`);
assert.equal((people.match(/class="person-panel speaker-panel"/g) || []).length, speakers.length, "Publish the organiser-approved speaker roster");
assert.equal(speakers.length, 10, "Ten speaker profiles are approved; Danial awaits identification");
for (const person of speakers) assert(people.includes(person.name), `Missing approved speaker ${person.name}`);
assert(!people.includes("Speaker names will be announced once confirmed."), "Remove the outdated speaker notice");
for (const withdrawnName of ['Shadab Khan', 'Boulbaba', 'Bol Baba']) assert(!people.includes(withdrawnName) && !html.includes(withdrawnName), `Withdrawn speaker must not appear: ${withdrawnName}`);
for (const match of people.matchAll(/\b(?:href|src)="([^"]+)"/g)) await verifyUrl(match[1], peopleUrl);
assert(
  html.includes("mbzuai-bls.png") &&
    html.includes('href="https://mbzuai.ac.ae/research/divisions/biological-life-sciences-division"'),
  "Use the supplied MBZUAI BLS logo linked to the division website",
);
assert(registrationUrl, "Configure the deployed Apps Script registration URL before publishing");
const intake = new URL(registrationUrl);
assert(intake.protocol === "https:" && intake.hostname === "script.google.com" && intake.pathname.endsWith("/exec"), "Registration must use the production Apps Script web app URL");
assert(html.includes(`src="${registrationUrl}"`) && html.includes('title="Register for SHIFRA"'), "Registration intake frame missing");
assert(!html.includes("SHIFRA%20abstract%20submission") && !html.includes("srcdoc="), "Do not publish the retired email intake or the disconnected preview form");
assert(html.includes("Print agenda") && html.includes("selected talk"), "Print action and presentation options must remain available");
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
for (const [route, destination] of Object.entries(redirects)) {
  const redirect = await readFile(
    path.join(directory, route, "index.html"),
    "utf8",
  );
  assert(
    redirect.includes('http-equiv="refresh"') &&
      redirect.includes(`0;url=${basePath}${destination}`),
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
  21,
  "All 21 updated programme entries must render",
);
for (const time of [
  "08:30",
  "09:00",
  "09:10",
  "09:25",
  "09:55",
  "10:20",
  "10:45",
  "11:00",
  "11:10",
  "12:10",
  "13:00",
  "13:20",
  "13:40",
  "14:00",
  "14:20",
  "14:40",
  "15:10",
  "15:30",
  "15:50",
  "16:30",
  "17:00",
]) {
  assert(
    agenda.includes(`T${time}:00+04:00`),
    `Incorrect or missing UAE start time ${time}`,
  );
}
assert(agendaSection.includes('08:30–17:10'), 'The agenda summary must match the new end time');
const minuteOfDay = time => time.split(':').map(Number).reduce((hours, minutes) => hours * 60 + minutes);
for (let i = 1; i < programme.length; i++) {
  assert.equal(minuteOfDay(programme[i - 1].start) + programme[i - 1].duration, minuteOfDay(programme[i].start), `Agenda gap or overlap before ${programme[i].start}`);
}
const panel = programme.find(entry => entry.category === 'Panel');
assert(panel?.start === '16:30' && panel.duration === 30 && panel.speaker.includes('Ghazal') && panel.notes.includes('Hala Alsaleh'), 'Panel must include Ghazal and Hala as moderator');
const sayeedTalks = programme.filter(entry => entry.category === 'Talk' && entry.speaker?.includes('Sayeed'));
assert(sayeedTalks.length === 1 && sayeedTalks[0].start === '09:55', 'Sayeed replaces Shadab once, at 09:55');
for (const name of ["Hala Alsaleh", "Haotian Tang", "Eduardo Beltrame"])
  assert(people.includes(name));
console.log(
  `Verified 2 content pages, 5 legacy section redirects, 21 continuous UAE-time agenda entries, 10 approved speaker profiles, registration deadline and intake, canonical metadata, and ${checked} local asset/link references for ${siteOrigin}${basePath}`,
);
