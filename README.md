# SHIFRA Symposium

A six-page, static Astro + TypeScript site for **SHIFRA | شيفرة · Genomics × AI UAE**. English public copy, locally served D-DIN, Montserrat, Raleway, and Arabic fonts, and no production Node server on GitHub Pages. A separate local preview server can receive poster registrations on this computer. The presentation follows the HCA reference: a white background, blue links, centered headings, and conventional conference panels.

## Local development and preview

Use Node **24** (`.node-version`) and pnpm **11.25.0** (`packageManager`).

```sh
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

Follow the Local URL printed by Astro. The default build mirrors the verified repository's project path, `/shifra-website/`.

```sh
pnpm check
pnpm build
pnpm verify
pnpm preview
```

`preview` serves the **production build** at `http://127.0.0.1:4173/shifra-website/`. Stop it with Ctrl+C. Every page is its own HTML document, including `agenda/index.html`, `organizing-committee/index.html`, and `speakers/index.html`. Direct visits and refreshes need no SPA fallback.

To independently check a root-domain build without changing the normal output:

```sh
SITE_URL=https://shifra.ae/ BUILD_DIR=dist-root pnpm build
SITE_URL=https://shifra.ae/ BUILD_DIR=dist-root pnpm verify
```

These commands only build local files; they do not activate the domain or DNS.

## Where to edit content

| Content                                                                              | File / setting                                                                                                           |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Date, venue, institution, time zone, introduction, programme status, acknowledgement | `src/data/event.ts` → `event`                                                                                            |
| Agenda start times, durations, titles, notes, category labels                        | `src/data/agenda.ts` → `agenda`                                                                                          |
| Organizers, order, optional portraits and biographies                                | `src/data/event.ts` → `organizers`                                                                                       |
| Confirmed speaker cards                                                              | `src/data/event.ts` → `speakers` (currently `[]`)                                                                        |
| Poster                                                                               | Set `event.poster.image` to a real file path relative to `public/`, e.g. `images/poster.webp`; add meaningful `alt` text |
| Poster download                                                                      | Set `event.poster.download` only when a real downloadable file exists in `public/`                                       |
| Optional background banner                                                           | `event.banner.image` and `event.banner.opacity` (currently 0.12); no separate banner panel is displayed                  |
| Optional general-registration link                                                   | Set `event.registrationUrl` to the confirmed URL; the Registration page and footer will show it                          |
| Optional contact                                                                     | Set `event.contactEmail` only when supplied for public use                                                               |
| Deployment origin and base path                                                      | `site.config.mjs` and optional full `SITE_URL` environment variable                                                      |
| Social-sharing graphic                                                               | `public/images/shifra-social.svg` and its PNG rendition; update if the event date changes                                |

Missing fields use `null`, so no broken images or empty links appear. Organizer fields `title`, `affiliation`, `biography`, `portrait`, and `profileUrl` remain empty until information is supplied. For speakers, add the same fields plus `talkTitle`. The three placeholder speaker cards imply no final count.

All times are fixed to **Asia/Dubai — GST, UTC+4**. They never convert to a visitor's time zone. The print control uses the browser's working print dialog and agenda-specific print CSS.

The normal-flow header remains usable without JavaScript. With JavaScript, the compact mobile menu supports Escape and visible keyboard focus. There are no animation controls, animated artwork, gradients, or scroll effects. Browser JavaScript supports navigation, printing, and accessible poster-form validation/submission; native form submission also works with the local receiver.

## Poster registration and the temporary local receiver

The new top-level **Registration** link sits between **Agenda** and **Organizing Committee**. `/registration/` opens the **Register for poster** entry, and `/registration/poster/` contains the four required fields: full name, affiliation, email address, and poster PDF. The venue is **Lecture Hall 1&2**.

To run a working preview that actually saves submissions:

```sh
pnpm build:preview
pnpm preview:posters
```

This produces a separate `dist-preview/` build with a same-origin `api/poster-submissions` endpoint and a visible preview notice. The local receiver binds to `127.0.0.1:4173`; it serves only that built directory. Stop any existing server on that port first (`pnpm exec astro preview stop` for an Astro preview daemon). `PORT` can select another local port.

By default, files go to `.local/poster-submissions/`, which is ignored by Git and never included in the static build. Set **POSTER_UPLOAD_DIR** to another private absolute directory to keep collection files outside the checkout. The shared preview for this task saves files in the private `outputs/shifra-poster-submissions/` folder outside the checkout. Each successful submission creates a random reference directory containing **poster.pdf** and **registration.json** (name, affiliation, email, original filename, received time, file size, and checksum). Directories use owner-only permissions and are not exposed by an HTTP listing or download route.

When sharing through a local tunnel, set **POSTER_ALLOWED_ORIGINS** to the tunnel's HTTPS origin (without a path). The normal local origins are accepted automatically. Both the receiver and tunnel must stay running for outside visitors to submit.

The limit is one **PDF up to 20 MB**. The server checks the fields, email, file size, extension, and PDF signature. It acknowledges success only after the PDF and registration record have both been written. If saving fails, the form keeps the user's inputs and displays an error. Confirmation is on screen; this implementation does not send email or confirm poster acceptance. Only test details should be used while the preview is under review.

```sh
pnpm test:posters
```

These tests use synthetic details and a sample PDF in a temporary directory. They check exact persistence, required fields, malformed/oversized/empty uploads, origin checks, private-file protection, native HTML confirmation, and failed-storage responses.

### Later: receiving on the published GitHub Pages site

A normal `pnpm build` keeps poster collection **closed** unless a real receiver is configured. GitHub Pages hosts the six HTML pages but cannot execute this local Node receiver. Before enabling public collection, deploy an appropriate upload receiver and set the repository Actions variable **POSTER_SUBMISSION_ENDPOINT** to its HTTPS URL. The existing Pages workflow passes this value to `PUBLIC_POSTER_SUBMISSION_ENDPOINT` during the build. An external receiver must accept the same multipart fields and permit the site's origin when using CORS. Expected JSON: `{ "ok": true, "reference": "submission-reference" }`; failures use an error HTTP status and `{ "ok": false, "error": "Helpful message" }`.

Do not use the local preview's relative endpoint for a GitHub Pages deployment. No attachment, registration record, secret, or local upload directory is committed or published by this workflow. Shared file rules are in `src/data/poster-rules.ts`; frontend endpoint/mode settings are in `src/data/registration.ts`.

## GitHub Pages deployment

Source remote: `git@github.com:halalsaleh7212-spec/shifra-website.git`.

1. Review the preview, then put the finished source on **main**, the repository's initially advertised default branch. The workflow triggers on main and also supports **Actions → Build and deploy SHIFRA to GitHub Pages → Run workflow**. If the owner chooses another production/default branch, update `on.push.branches` accordingly.
2. A repository owner/admin must open **Settings → Pages → Build and deployment → Source: GitHub Actions**. A private repository needs a GitHub plan that supports Pages for private repositories; see [GitHub's availability requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Do not change repository visibility just to deploy.
3. Push to main or run the workflow. It installs from the lockfile, checks types, reads the actual Pages origin/base path, builds and validates all static routes/assets, uploads the artifact, and deploys using the `github-pages` environment with Pages/OIDC permissions.
4. Open the successful deployment's **View deployment** link or the URL shown in **Settings → Pages**. That is the verified live address. The repository-derived default is `https://halalsaleh7212-spec.github.io/shifra-website/`; it is an expected address, not evidence that the site is already deployed.

`site.config.mjs` derives owner/repository from `GITHUB_REPOSITORY` in CI or the actual origin remote locally. The verified repository identity is a fallback for source archives without Git metadata. The workflow prefers the URL returned by `configure-pages` and supports a private Pages origin. `src/lib/urls.ts` applies Astro's base consistently to navigation, assets, metadata, and poster paths.

The action versions were checked against [Astro's Pages guide](https://docs.astro.build/en/guides/deploy/github/), [GitHub's custom workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), and the official action repositories during implementation. No custom domain is activated by this source.

## Later: connect shifra.ae

Do this only when the organizers are ready to activate the domain:

1. The owner/admin verifies domain ownership and sets **Settings → Pages → Custom domain** to `shifra.ae`.
2. At the actual DNS provider, add the GitHub Pages records described in [GitHub's custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Use the provider's supported A/ALIAS/ANAME configuration, and wait for validation. This source does not change DNS.
3. Set the repository Actions variable **SITE_URL** to `https://shifra.ae/`. This central setting changes `site` to the custom origin and `base` to `/` for all routes, assets, canonicals, and social metadata. It also makes local equivalent builds reproducible. Run the workflow again and verify every route.
4. Enable HTTPS in Pages settings when GitHub makes it available.

**A CNAME file alone does not configure an Actions deployment.** GitHub's Actions deployment uses the Pages custom-domain setting; no CNAME file is required. Avoid setting the future domain as the live canonical before activation. If GitHub's actual Pages URL changes first, use that URL for `SITE_URL` instead.

## Content and assets

See `CONTENT_NOTES.md` for outstanding generic confirmation details. The source proposal, internal invitees, unconfirmed organizations, portraits, sponsor marks, and contacts are not included. The symposium poster is deliberately unfilled. The typographic social graphic is a separate asset.

Unmodified **normal-width D-DIN regular and bold** webfonts come from [amcchord/datto-d-din](https://github.com/amcchord/datto-d-din). Their accompanying copyright, OFL, FONTLOG, and CC-BY-SA notices are retained in `public/fonts/d-din/`. Montserrat (body), Raleway (agenda), and Noto Sans Arabic are served locally from Fontsource packages; their OFL notices are in `licenses/`. Font files are bundled with base-aware URLs. No HCA branding, banner, portraits, event details, or registration data is used.

Typography baselines: navigation D-DIN 17/20 regular; text-only masthead D-DIN 64 px bold with 44 px Arabic; Home title D-DIN 48/52.8 bold (36/39.6 on mobile); interior titles D-DIN 55/60.5 bold (33/36.3 on mobile); section headings D-DIN 36/39.6 bold; body Montserrat 16/22.86 medium; agenda titles Raleway 18.75/26.79 bold and supporting text 15/21.43 medium. Desktop containers are 992 px including 15 px padding at each side. No dedicated banner or temporary logo is displayed. Set `event.banner.image` to an approved asset for a faint hero background, with opacity controlled by `event.banner.opacity` (currently 0.12). The About section places introductory copy beside the symposium poster, and the venue is followed by the acknowledgement.
