# SHIFRA Symposium

A static Astro + TypeScript website for **SHIFRA | شيفرة · UAE Genomics × AI**, with a scrolling home page and a separate **Committee & Speakers** page. Both pages use the supplied SHIFRA and current navy MBZUAI logos. English titles and reading text use locally served **Nunito Sans**; Arabic fallback text uses Noto Sans Arabic.

## Development and preview

Use Node **24** (`.node-version`) and pnpm **11.25.0** (`packageManager`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Build and validate the production site:

```sh
pnpm check
pnpm build
pnpm verify
pnpm preview
```

The default preview is `http://127.0.0.1:4173/shifra-website/`. `pnpm preview --background` starts a background static preview; manage it with `pnpm exec astro preview status`, `logs`, and `stop`. The former upload receiver has been retired. The optional `pnpm build:preview` command now creates the same static site in `dist-preview/`, with no upload endpoint or preview-only form.

A root-domain build can be checked independently:

```sh
SITE_URL=https://shifra.ae/ BUILD_DIR=dist-root pnpm build
SITE_URL=https://shifra.ae/ BUILD_DIR=dist-root pnpm verify
```

These commands build local files; they do not activate the domain or DNS.

## Content and page structure

The home page contains About, Agenda, Registration, Location, Acknowledgement, and Countdown. The hero has one **Register for our symposium** action and displays the abstract deadline: **Tuesday, 24 November 2026 at 11:59 PM UAE time (GST, UTC+4)**. The two navigation links are **Home** and **Committee & Speakers**; committee and speaker cards live at `people/`. Printing the agenda hides the other home sections. The calendar download includes the current full programme in the event description. The updated programme follows the organiser-approved Google Doc and speaker changes of 23 November 2026: 21 displayed entries, including one 40-minute block for four selected-speaker talks, three scientific sessions, and a panel discussion, 08:30–17:10 UAE time. Eleven approved speaker profiles are published, including Daniel Sanchez, identified by the organiser on 24 November.

| Content                                                   | File / setting                                                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Event date, venue, introduction, contact, acknowledgement | `src/data/event.ts` → `event`                                                                |
| Registration and abstract storage                         | Private Google Sheets and Drive via the configured Apps Script web app                     |
| Public enquiries                                          | `event.contactEmail` → `hala.alsaleh@mbzuai.ac.ae`                                           |
| Agenda times, durations, titles, notes                    | `src/data/agenda.ts` → `agenda`                                                              |
| Organizers and optional profiles                          | `src/data/event.ts` → `organizers`                                                           |
| Approved speaker profiles                                 | `src/data/event.ts` → `speakers`                                                            |
| Registration intake                                      | `src/data/registration.ts` and `integrations/google-apps-script/`                             |
| Symposium banner and poster                               | `event.banner` and `event.poster`                                                            |
| Approved logos                                            | `public/images/logos/`, `Brand.astro`, and `Header.astro`                                    |
| Campus map                                                | `event.mapsUrl` and `event.mapsEmbedUrl`                                                     |
| Countdown                                                 | `Countdown.astro`; derives the target from the event date, UAE offset, and first agenda time |
| Sharing graphic                                           | `public/images/shifra-social.svg` and PNG rendition                                          |
| Deployment URL and base path                              | `site.config.mjs` and the optional full `SITE_URL` environment variable                      |

Missing fields remain `null` or empty arrays. No unconfirmed speakers, portraits, biographies, sponsor marks, or personal roles are invented. Organizer cards show the supplied names in order. The supplied banner and the V3 poster provided on 20 November 2026 are displayed on the page. The banner spans the full viewport width; the poster preview opens the original, downloadable PDF.

The venue is **Lecture Hall 1 & 2**, Mohamed bin Zayed University of Artificial Intelligence, **Abu Dhabi, UAE**. All programme times and the countdown use **Asia/Dubai — GST, UTC+4**. The countdown targets **27 November 2026 at 08:30** and does not convert to the visitor's local time zone. Campus location follows the [university's official map link](https://mbzuai.ac.ae/about-us), without claiming a separate room-level pin.

## Registration and abstract submissions

The **Register for our symposium** section collects first name, last name, email, affiliation, required gender (including **Prefer not to say**), optional honorific title, and participation type: **Audience** or **I want to submit an abstract**. Abstract applicants must enter an abstract title and choose either **Text** or **Upload your abstract**, then provide the selected content. Recording consent is required and checked by default; registration cannot proceed if it is unchecked. Submissions are considered for posters and selected talks on a rolling basis. The abstract deadline is **Tuesday, 24 November 2026 at 11:59 PM UAE time (GST, UTC+4)**; audience registration remains available after that deadline.

An owner-deployed Google Apps Script intake stores each submission in a restricted Google Drive folder and appends a row to the private registration spreadsheet. The workbook has **Registrations** and **Speakers** tabs. Existing programme speakers are recorded separately from people who have registered; unknown speaker emails remain blank. Review status and presentation format are organiser fields, and no talk selection is automatic.

The static website uses **GitHub Pages**, with **https://shifra.ae/** as its production URL; the custom-domain cutover, DNS and HTTPS must be verified before announcing it as live. Google hosts the intake. Netlify is no longer the production target, and the earlier university-hostname proposal is not required. See [GitHub Pages publication](#github-pages-publication) for deployment and domain configuration. Files are limited to PDF, Word, or text documents of up to 10 MB. Submitted text and files stay in Drive, outside the public repository and published static build. The former local upload receiver is not used. See the [intake setup](integrations/google-apps-script/README.md) for deployment and permission details. Website success depends on a confirmed server response; repeated retries retain a request ID.

The compact footer has no links and retains Hala's email as plain text for enquiries.

## Existing shared links

Five small redirect documents preserve old URLs without duplicating content:

| Former URL              | Current section                                          |
| ----------------------- | -------------------------------------------------------- |
| `agenda/`               | `#agenda`                                                |
| `organizing-committee/` | `people/#organizing-committee`                           |
| `speakers/`             | `people/#speakers`                                       |
| `registration/`         | `#registration`                                         |
| `registration/poster/`  | `#poster-registration`, an alias in the registration section |

The preferred registration link is `#registration`; `#abstract-submission` remains an alias. Redirects stay on the current origin and use the appropriate home or people page as their canonical URL. Registration uses JavaScript in the Google-hosted form; the direct-window link is available if embedding is unavailable.

## GitHub Pages publication

Repository: `git@github.com:Haotian-Tang/shifra-website.git` (transferred to Haotian-Tang).

The workflow in `.github/workflows/deploy.yml` runs on **main** and supports manual dispatch. It installs pinned dependencies, checks types, configures Pages, builds and validates the static output, uploads the Pages artifact, and deploys through the `github-pages` environment. Its production build explicitly sets `SITE_URL=https://shifra.ae/`, keeping assets at `/` and canonical/sharing URLs on HTTPS even while GitHub provisions the domain certificate.

A repository administrator must first open **Settings → Pages → Build and deployment → Source: GitHub Actions**. Source write access alone does not provide this setting. Private-repository Pages availability depends on the owner's GitHub plan; see [GitHub Pages availability and setup](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

After Pages is enabled and the custom domain is configured, run or rerun **Build and deploy SHIFRA to GitHub Pages**. Check the successful deployment's **View deployment** link and confirm HTTPS works at `https://shifra.ae/`. `https://haotian-tang.github.io/shifra-website/` remains the repository-derived local-build default; GitHub may redirect that address to the configured custom domain.

`site.config.mjs` derives the repository from the actual remote or CI metadata when no `SITE_URL` override is set. The production workflow pins the approved custom domain instead of relying on temporarily stale Pages URL metadata. Change that workflow value if the production hostname changes. No upload-service variable or Node receiver is required.

## Connect shifra.ae

The owner confirmed that the domain transfer to Hostinger is complete and selected **GitHub Pages** as the website host. Add **shifra.ae** in the repository's **Settings → Pages → Custom domain**, then configure these website records in the authoritative DNS zone:

| Type  | Host | Value                  |
| ----- | ---- | ---------------------- |
| A     | @    | 185.199.108.153         |
| A     | @    | 185.199.109.153         |
| A     | @    | 185.199.110.153         |
| A     | @    | 185.199.111.153         |
| CNAME | www  | haotian-tang.github.io  |

Replace obsolete website A/AAAA/ALIAS records that conflict with GitHub Pages, while preserving unrelated email and verification records. Confirm the active nameservers match the DNS zone being edited. Follow [GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site); an Actions deployment requires the Pages setting and DNS configuration, not just a `CNAME` file in the repository.

The Pages custom domain and all five Hostinger website records have been saved, and the former Netlify custom-domain bindings have been removed. After DNS validation succeeds and GitHub provisions the certificate, enable **Enforce HTTPS**. Verify `https://shifra.ae/`, its assets and registration form, and the `www` redirect. This source configuration alone does not confirm that public DNS or HTTPS is ready.

## Assets and typography

The current navy MBZUAI JPEG is copied byte for byte from the supplied file and displayed at its native aspect ratio, without a color filter or crop. The SHIFRA logo retains its supplied lettering, with a browser filter to remove its JPEG black matte. Both logos have alternative text.

`public/images/shifra-banner.webp` is an optimized rendition of the supplied `Banner.png`. The current poster preview in `public/images/shifra-poster-2026-11-25.webp` is rendered from `public/downloads/SHIFRA_Poster_2026-11-25.pdf`. This corrected edition changes only the original PDF's time glyphs from 4:15 PM to 5:10 PM, matching the approved 17:10 UAE-time programme; its artwork, photographs, QR code and layout are preserved. `public/downloads/SHIFRA_Poster_V3.pdf` retains the unmodified source for reference. The active poster is shown at its original aspect ratio without cropping.

All editable English text, including the Home title, uses Nunito Sans. The title is weight 700; reading text remains comfortable at 18 px, with About text at 20 px on desktop and 19 px on mobile. The former Bodoni Moda font and dependency are removed. Current font notices are in `licenses/`. See `CONTENT_NOTES.md` for remaining organizer content decisions.
