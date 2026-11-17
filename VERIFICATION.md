# SHIFRA release verification

Verified on 17 November 2026 after the repository transfer and Pages publishing recovery.

## Published release

- Repository: `Haotian-Tang/shifra-website`; the authenticated owner has administrator access. The local SSH remote and source fallback both use the transferred repository.
- Deployed application commit: `5b0ad2f346847745c4e171ffccc7d25567cf2d8d`.
- [Actions run 44065760147](https://github.com/Haotian-Tang/shifra-website/actions/runs/44065760147): build and deploy both succeeded, including dependency installation, Astro type checking, production build, static-link verification, artifact upload, and deployment.
- Public website: <https://haotian-tang.github.io/shifra-website/>. An unauthenticated HTTPS request returned 200 directly, with this same URL as its canonical address.

## Recovery

The domain still pointed at an old server while the previous custom-domain binding redirected the default Pages URL to it. AEserver had disabled management after marking the domain Transferred, while Hostinger still reported Transferring. The unavailable custom-domain binding was removed from Pages, the repository address was updated, and the site was rebuilt for the default project path. Default github.io origins are normalized to HTTPS even when Pages metadata retains HTTP after a domain change.

## Validation

- A local production build using the HTTP origin reported by the previous Pages metadata passed verification at the normalized HTTPS URL. It validated one content page, five legacy redirects, all 17 UAE-time agenda entries, canonical metadata, and 24 local asset/link references.
- The actual deployed homepage and all six checked stylesheet, logo, icon, and font references returned 200, including both font files.
- The public website was opened in Chrome. Both supplied logos loaded successfully, the title computed as locally served Nunito Sans with weight 700, and no horizontal overflow appeared in the checked viewport.
- The single page has no upload form. The abstract actions address haotian.tang@mbzuai.ac.ae, with an email subject/template; rolling review and consideration for posters and selected talks are explicit. No email was sent during testing.
- The compact footer retains Hala's plain-text enquiries address. Existing agenda, committee, venue, map, acknowledgement, and countdown remain present.
- A screenshot of the actual public website was saved outside the source checkout as a user-facing release artifact.

## Domain follow-up

shifra.ae is not yet connected. Public DNS still uses the three AEserver nameservers, apex A 165.22.30.248, and www CNAME shifra.ae. No DNS records were changed. After domain management becomes available, restore shifra.ae in the repository's Pages settings before directing DNS to GitHub, then rebuild and enable HTTPS when the certificate is ready. The www CNAME target must now be haotian-tang.github.io. See README for the complete records and order of operations.
