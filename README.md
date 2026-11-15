# SHIFRA Symposium

A four-page, static Astro + TypeScript site for **SHIFRA | شيفرة · Genomics × AI UAE**. English public copy, locally served fonts, an original SVG code illustration, and no backend or production Node server.

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

| Content                                                             | File / setting                                                                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Date, venue, institution, time zone, introduction, programme status | `src/data/event.ts` → `event`                                                                                            |
| Agenda start times, durations, titles, notes, category labels       | `src/data/agenda.ts` → `agenda`                                                                                          |
| Organizers, order, optional portraits and biographies               | `src/data/event.ts` → `organizers`                                                                                       |
| Confirmed speaker cards                                             | `src/data/event.ts` → `speakers` (currently `[]`)                                                                        |
| Poster                                                              | Set `event.poster.image` to a real file path relative to `public/`, e.g. `images/poster.webp`; add meaningful `alt` text |
| Poster download                                                     | Set `event.poster.download` only when a real downloadable file exists in `public/`                                       |
| Future registration link                                            | Set `event.registrationUrl` to the confirmed URL; Home and footer will show it                                           |
| Optional contact                                                    | Set `event.contactEmail` only when supplied for public use                                                               |
| Deployment origin and base path                                     | `site.config.mjs` and optional full `SITE_URL` environment variable                                                      |
| Social-sharing graphic                                              | `public/images/shifra-social.svg` and its PNG rendition; update if the event date changes                                |

Missing fields use `null`, so no broken images or empty links appear. Organizer fields `title`, `affiliation`, `biography`, `portrait`, and `profileUrl` remain empty until information is supplied. For speakers, add the same fields plus `talkTitle`. The three placeholder speaker cards imply no final count.

All times are fixed to **Asia/Dubai — GST, UTC+4**. They never convert to a visitor's time zone. The print control uses the browser's working print dialog and agenda-specific print CSS.

The header remains usable without JavaScript. With JavaScript, the mobile menu supports Escape and visible keyboard focus. The artwork has two native buttons with pressed states, a descriptive SVG, and a live caption. Motion consists of finite transitions only; reduced-motion users receive immediate complete arrangements. Hidden/offscreen artwork finishes transitions immediately.

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

Space Grotesk, DM Sans, and Noto Sans Arabic are self-hosted from their Fontsource packages under the SIL Open Font License; copies are in `licenses/`. No third-party event branding or imagery is used.
