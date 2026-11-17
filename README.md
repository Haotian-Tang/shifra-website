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

The home page contains About, Agenda, Registration, Location, Acknowledgement, and Countdown. The hero has one **Register for our symposium** action and displays the abstract deadline: **Tuesday, 24 November 2026 at 11:59 PM UAE time (GST, UTC+4)**. The two navigation links are **Home** and **Committee & Speakers**; committee and speaker cards live at `people/`. Printing the agenda hides the other home sections. The updated programme follows the organiser-supplied **SHIFRA Symposium.pdf** of 17 November 2026: 22 entries, three scientific sessions, 08:30–16:00 UAE time, and nine named scientific speakers.

| Content                                                   | File / setting                                                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Event date, venue, introduction, contact, acknowledgement | `src/data/event.ts` → `event`                                                                |
| Registration and abstract storage                         | Private Google Sheets and Drive via the configured Apps Script web app                     |
| Public enquiries                                          | `event.contactEmail` → `hala.alsaleh@mbzuai.ac.ae`                                           |
| Agenda times, durations, titles, notes                    | `src/data/agenda.ts` → `agenda`                                                              |
| Organizers and optional profiles                          | `src/data/event.ts` → `organizers`                                                           |
| Confirmed speakers                                        | `src/data/event.ts` → `speakers` (nine programme speakers)                                   |
| Registration intake                                      | `src/data/registration.ts` and `integrations/google-apps-script/`                             |
| Symposium banner and poster                               | `event.banner` and `event.poster`                                                            |
| Approved logos                                            | `public/images/logos/`, `Brand.astro`, and `Header.astro`                                    |
| Campus map                                                | `event.mapsUrl` and `event.mapsEmbedUrl`                                                     |
| Countdown                                                 | `Countdown.astro`; derives the target from the event date, UAE offset, and first agenda time |
| Sharing graphic                                           | `public/images/shifra-social.svg` and PNG rendition                                          |
| Deployment URL and base path                              | `site.config.mjs` and the optional full `SITE_URL` environment variable                      |

Missing fields remain `null` or empty arrays. No unconfirmed speakers, portraits, biographies, sponsor marks, or personal roles are invented. Organizer cards show the supplied names in order. The banner and poster supplied on 17 November 2026 are displayed on the page. The banner spans the full viewport width; the poster preview opens the original, downloadable PDF.

The venue is **Lecture Hall 1 & 2**, Mohamed bin Zayed University of Artificial Intelligence, **Abu Dhabi, UAE**. All programme times and the countdown use **Asia/Dubai — GST, UTC+4**. The countdown targets **27 November 2026 at 08:30** and does not convert to the visitor's local time zone. Campus location follows the [university's official map link](https://mbzuai.ac.ae/about-us), without claiming a separate room-level pin.

## Registration and abstract submissions

The **Register for our symposium** section collects first name, last name, email, affiliation, optional gender and title, and participation type: **Audience** or **I want to submit an abstract**. The abstract option reveals a text box and a local document upload. Applicants can provide text, an attachment, or both. Submissions are considered for posters and selected talks on a rolling basis. The abstract deadline is **Tuesday, 24 November 2026 at 11:59 PM UAE time (GST, UTC+4)**; audience registration remains available after that deadline.

An owner-deployed Google Apps Script intake stores each submission in a restricted Google Drive folder and appends a row to the private registration spreadsheet. The workbook has **Registrations** and **Speakers** tabs. Existing programme speakers are recorded separately from people who have registered; unknown speaker emails remain blank. Review status and presentation format are organiser fields, and no talk selection is automatic.

The static website is published at [shifra-symposium-uae.netlify.app](https://shifra-symposium-uae.netlify.app/), with GitHub Pages retained as a fallback; Google hosts the intake. The proposed university hostname `shifra.mbzuai.ac.ae` is pending MBZUAI IT's DNS configuration and is not yet live. See [Netlify setup](NETLIFY_SETUP.md) for the deployment and custom-domain steps. Files are limited to PDF, Word, or text documents of up to 10 MB. Submitted text and files stay in Drive, outside the public repository and published static build. The former local upload receiver is not used. See the [intake setup](integrations/google-apps-script/README.md) for deployment and permission details. Website success depends on a confirmed server response; repeated retries retain a request ID.

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

The workflow in `.github/workflows/deploy.yml` runs on **main** and supports manual dispatch. It installs pinned dependencies, checks types, reads the configured Pages origin/base, builds and validates the static output, uploads the Pages artifact, and deploys through the `github-pages` environment.

A repository administrator must first open **Settings → Pages → Build and deployment → Source: GitHub Actions**. Source write access alone does not provide this setting. Private-repository Pages availability depends on the owner's GitHub plan; see [GitHub Pages availability and setup](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

After Pages is enabled, run or rerun **Build and deploy SHIFRA to GitHub Pages**. The successful deployment's **View deployment** link is the verified public URL. `https://haotian-tang.github.io/shifra-website/` is the repository-derived default address; its actual availability must be checked after deployment. The default GitHub Pages origin is normalized to HTTPS even when Pages metadata still reports HTTP after a domain change.

`site.config.mjs` derives the repository from the actual remote or CI metadata. The workflow prefers the URL returned by `configure-pages`, so project paths, private Pages origins, and a later custom domain use the appropriate asset paths. No upload-service variable or Node receiver is required.

## Connect shifra.ae

An administrator must add **shifra.ae** in the repository's **Settings → Pages → Custom domain** before changing its DNS. Then update the domain's DNS provider to GitHub Pages records as described in [GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

On 17 November 2026, public DNS still uses `dns1.aeserver.com`, `dns2.aeserver.com`, and `dns3.aeserver.com`, with apex A `165.22.30.248` and `www` aliasing `shifra.ae`. AEserver marks the domain **Transferred** and disables its management, while the Hostinger owner's transfer overview still says **Transferring**. No DNS records were changed during this check. The failed custom-domain binding was removed from Pages so the site can publish at its default GitHub URL while domain management is unavailable.

Once the transfer is complete, confirm which nameservers are authoritative and configure the active DNS zone. If moving DNS to Hostinger, use the nameservers assigned in its dashboard and preserve unrelated records before switching. See [Hostinger DNS management](https://www.hostinger.com/support/how-to-use-hostingers-dns-zone-editor/). Restore the Pages custom-domain binding before directing the public domain to GitHub.

Use these website records when the Pages domain is configured:

| Type  | Host | Value                         |
| ----- | ---- | ----------------------------- |
| A     | @    | 185.199.108.153               |
| A     | @    | 185.199.109.153               |
| A     | @    | 185.199.110.153               |
| A     | @    | 185.199.111.153               |
| CNAME | www  | haotian-tang.github.io         |

Replace the old website A record and the `www` alias as appropriate, while retaining unrelated email and verification records. AEserver nameservers can remain only if that provider continues to offer an editable DNS zone after the transfer. If `SITE_URL` is set manually, use `https://shifra.ae/` once the domain is configured; otherwise the workflow derives the custom origin from Pages. Enable **Enforce HTTPS** when GitHub makes the certificate available.

For an Actions deployment, a `CNAME` file alone does not configure the domain; GitHub's Pages setting and DNS must both be configured. This source does not claim that DNS or the custom domain is already active.

## Assets and typography

The current navy MBZUAI JPEG is copied byte for byte from the supplied file and displayed at its native aspect ratio, without a color filter or crop. The SHIFRA logo retains its supplied lettering, with a browser filter to remove its JPEG black matte. Both logos have alternative text.

`public/images/shifra-banner.webp` is an optimized rendition of the supplied `Banner.png`. The poster preview in `public/images/shifra-poster.webp` is rendered from the supplied PDF. `public/downloads/SHIFRA_Poster.pdf` retains the original PDF byte for byte for viewing and download. The poster is shown at its original aspect ratio without cropping.

All editable English text, including the Home title, uses Nunito Sans. The title is weight 700; reading text remains comfortable at 18 px, with About text at 20 px on desktop and 19 px on mobile. The former Bodoni Moda font and dependency are removed. Current font notices are in `licenses/`. See `CONTENT_NOTES.md` for remaining organizer content decisions.
