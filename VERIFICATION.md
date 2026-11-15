# Academic-style preview verification

Verified on 15 November 2026 against the actual static production output, using local Chrome. This revision replaces the original visual direction with the requested HCA conference layout.

- Captured the Home, Agenda, Local Organizing Team, and Speakers reference pages at 1440 and 390 px and compared them with SHIFRA at matching widths.
- Used actual normal-width D-DIN regular and bold from the supplied font repository, plus locally served Montserrat, Raleway, and Noto Sans Arabic. Five distinct WOFF2 files loaded successfully in the browser; D-DIN regular and bold were both checked as loaded font faces.
- Checked the requested rendered font families, sizes, weights, and line heights for navigation, Home and interior headings, section headings, Home paragraphs, dates, organizer names, and agenda text. Desktop content containers measure 992 px including side padding; desktop navigation boxes measure 50 px tall; the Home banner measures 422 px tall (220 px on mobile).
- Production builds and built-link/asset validation pass for the project subpath `/shifra-website/` and root path `/`. All four static HTML routes and 63 internal link/asset references per build resolve correctly.
- Astro type check: 0 errors, 0 warnings, 0 hints in 18 files. Dependency peer check: no issues.
- Visited and refreshed all four pages at 1440, 768, and 390 px. No horizontal overflow, clipped Arabic, broken image, failed resource request, or browser runtime error was found.
- Checked the two-column organizer grid, mobile stacking, the 33 px / 36.3 px mobile interior titles, mobile navigation, Escape closing and focus return, navigation clicks, the working print control, and print CSS.
- All four pages remain navigable without JavaScript. All four root-path pages also load directly.
- The old animated Home component, controls, observers, gradients, transitions, and animation styles were removed. The old display/body font packages and their unused license copies were removed, and the lockfile was updated. The replacement favicon and typographic sharing image contain no scientific illustration.
- The event data and all 17 UAE-time programme entries remain unchanged; only an optional `event.banner` setting was added. The existing GitHub Pages workflow and deployment URL/base configuration were preserved.

## Deliberate differences from the reference

SHIFRA has a simple text wordmark and four navigation routes. No approved banner image, poster, portraits, speaker roster, biographies, registration link, or contact details have been supplied, so these are intentionally absent or represented by plain labeled placeholders. No HCA branding, images, programme information, participant data, maps, countdowns, or registration controls are copied. The supplied SHIFRA content is shorter, so total page and panel heights differ naturally. The single-day agenda uses a provisional note instead of HCA's multiple-day tabs or session-detail controls.

## Publishing state

Source is maintained on `codex/shifra-preview` for review, with production deployment configured for `main` after merge. No GitHub Pages settings, repository visibility, custom domain, or DNS were changed. A temporary share preview is separate from the later production Pages deployment.
