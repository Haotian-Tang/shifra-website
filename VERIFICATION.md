# Preview verification

Verified on 15 November 2026 against the actual static production output, using local Chrome. No public deployment is claimed.

- Astro production builds: project subpath `/shifra-website/` and root path `/` both pass.
- Astro type check: 0 errors, 0 warnings, 0 hints. Compatible TypeScript 6 is pinned; the current checker does not yet support TypeScript 7.
- Dependency peer check: no issues.
- Built-file validator: all four HTML routes, canonical/social metadata, and 69 internal link/asset references per build pass. All 17 required programme entries and UAE UTC+4 start times render.
- Browser layout: all four pages inspected at 1440, 768, and 390 px. No horizontal overflow, broken image, failed asset request, or browser runtime error was found.
- Direct route visits and navigation clicks pass. Real static directories support refreshes without a router fallback.
- Main mobile menu opens/closes; Escape closes it and returns focus to its button. Keyboard focus and the skip link work.
- The SVG artwork switches using Enter and Space, updates its pressed states and caption, and renders completely with reduced motion.
- All four pages remain available with JavaScript disabled; main navigation stays visible and the illustration's default state is complete.
- The print button invokes the browser print function, and print CSS hides navigation/controls while preserving all 17 agenda entries. No downloadable PDF is advertised.
- Root-path browser visits to all four pages also pass.
- Desktop, tablet, and mobile Home screenshots were saved as separate review artifacts, along with additional internal page and interaction captures.

## Still required for public launch

The owner/admin must enable GitHub Pages with **GitHub Actions** as its source, on a plan supporting Pages for this private repository. The completed source is delivered on `codex/shifra-preview` for review, with deployment configured for `main` after merge. No Pages settings, repository visibility, custom domain, or DNS were changed. Speaker details, poster artwork, registration details, and the generic confirmation items in `CONTENT_NOTES.md` remain intentionally outstanding.
