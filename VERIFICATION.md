# SHIFRA release verification

Verified on 16 November 2026 for the single-page email-submission release.

## Requested changes

- All editable English text, including the main title, uses locally served Nunito Sans. The main title is weight 700. The thin display font, its dependency, and its font-face declaration are removed. The approved logo artwork remains unchanged.
- The file-upload form is replaced by a static Submit an abstract section. Its email action addresses **haotian.tang@mbzuai.ac.ae**, with a prefilled subject and an optional information template. The site does not send email automatically.
- The section clearly states that abstracts are considered for **poster presentations and selected talks**, reviewed **on a rolling basis**, and that organizers respond by email. No submission deadline, word limit, or attachment-format requirement is invented.
- Hala's address remains the plain-text general-enquiries contact in the compact footer.

## Validation

- Astro check: 0 errors, 0 warnings, 0 hints across 26 files.
- Production project-path and custom-root builds pass. Each validates one content page, five legacy section redirects, all 17 UAE-time agenda entries, canonical metadata, and 24 local asset/link references.
- The shared preview was reloaded in the actual logged-in Chrome browser. Computed styles confirm Nunito Sans and title weight 700; the document has no forms or file inputs and no horizontal overflow in the checked viewport.
- A 390-pixel mobile viewport also has no horizontal overflow; the title, logos, venue, and abstract action were inspected visually. The temporary viewport override was reset afterward.
- The visible section and both email links use the confirmed abstract recipient. The email subject/template and rolling-review/talk-selection wording were inspected in the actual page. No email was sent during verification.
- Existing section links, legacy URL aliases, campus map, committee, acknowledgement, countdown, and link-free footer remain in the single document.
- The temporary preview now uses Astro's static preview server. The retired upload endpoint returns HTTP 404. Old local submission files were left untouched outside the source checkout and are not part of the published artifact.

## Publication and domain setup

- Source publication targets the repository's main branch and its existing GitHub Pages workflow. The current login has source-write access, but GitHub's Pages settings are unavailable to that account; the settings UI was checked directly.
- The domain currently uses AEserver nameservers, an apex A record of 165.22.30.248, and a www alias to shifra.ae. These DNS records were read but not changed.
- The AEserver control panel is not logged in. DNS changes therefore require the domain account owner to log in, after the GitHub Pages domain has been configured by a repository administrator.
- Commit `f83b97c` was pushed successfully to both `codex/shifra-preview` and `main` through SSH. The formal branch now contains the complete website.
- [Actions run 43833134712](https://github.com/halalsaleh7212-spec/shifra-website/actions/runs/43833134712) installed dependencies and passed the type-check step, then failed at `actions/configure-pages@v5` with `Get Pages site failed` / `Not Found`. Build upload and deployment were skipped. No live GitHub Pages URL or custom-domain deployment is claimed.
- A repository administrator must enable Pages with GitHub Actions as its publishing source, then run the workflow. The standard `GITHUB_TOKEN` cannot enable Pages through the configure-pages action's optional enablement parameter; no extra credential or broader permission was introduced.
