# Netlify deployment

This Astro site is static. Registration remains hosted by the existing Google Apps Script service, with records and attachments in private Google Sheets and Drive.

Netlify project: **shifra-symposium-uae**. Existing Netlify address: **https://shifra-symposium-uae.netlify.app/**. Netlify now lists **shifra.ae** as the primary domain and **www.shifra.ae** as its redirect alias, following the owner's confirmation that the domain transfer to Hostinger is complete. The production canonical URL is **https://shifra.ae/**; DNS and HTTPS are still being verified before announcing it as live.

The proposed university domain `shifra.mbzuai.ac.ae` remains an optional fallback and is not yet live. Netlify reports that `mbzuai.ac.ae` or one of its subdomains is already managed by another Netlify team; that team association must be resolved before MBZUAI IT configures DNS.

## Manual deployment

Use the production domain when preparing the approved custom-domain upload:

```sh
SITE_URL=https://shifra.ae/ pnpm build
SITE_URL=https://shifra.ae/ pnpm verify
```

Upload the contents of `dist/` through the site's manual deploy interface. The ZIP root must contain `index.html`, `_astro/`, and the other generated routes/assets. Do not upload the source repository, private submission files, or local configuration.

Use the same Netlify project for subsequent deployments. Manual uploads do not run the build command in `netlify.toml`, so build and verify locally before each upload.

## Optional repository builds

`netlify.toml` uses Node 24, pnpm 11.25.0, the build command `pnpm build && pnpm verify`, and publish directory `dist`. The repository's `packageManager` also pins the pnpm version.

`netlify.toml` sets `SITE_URL=https://shifra.ae/` only in the Netlify production context. `SITE_URL` takes precedence when explicitly provided. Branch and deploy previews keep their `DEPLOY_PRIME_URL`; without an explicit override, production falls back to Netlify's `URL`. Netlify assets are built at `/`. Outside Netlify, the existing GitHub Pages origin and project path remain the fallback.

## shifra.ae domain binding

Use the existing Netlify project for `shifra.ae` and `www.shifra.ae`. Set `shifra.ae` as primary after Netlify accepts the domains. Update only the website records in the authoritative DNS zone using the targets shown by Netlify, while preserving mail and verification records. Confirm the root domain serves the site over valid HTTPS and `www` redirects to the primary domain before distributing the new registration QR code.

Keep GitHub Pages on its existing `https://haotian-tang.github.io/shifra-website/` address. Do not bind `shifra.ae` to GitHub Pages while Netlify hosts the custom domain.

## University subdomain

Ask MBZUAI IT and the existing university Netlify team to coordinate hosting or transferring this project into the appropriate team. If the association is stale or unknown, the university domain owner should work with Netlify Support on ownership verification. Do not remove the university's DNS zone or change its nameservers to solve this one-site conflict.

Once Netlify accepts `shifra.mbzuai.ac.ae` as a custom domain, MBZUAI IT must point its `shifra` CNAME to **shifra-symposium-uae.netlify.app** (TTL 3600 is suitable, DNS only initially). Use Netlify's current domain verification and HTTPS instructions. Do not copy the unrelated `beltrame` nameservers or CAA records from the older email thread, and do not place CAA alongside the CNAME at the same hostname.

Adding the university hostname as an alias does not require changing the production build's canonical URL. Do not announce the university hostname as live until it resolves and serves a valid certificate.

If the university domain becomes available later, retain it as a Netlify alias only if the university authorizes that arrangement. Keep `shifra.ae` as the primary and canonical domain unless the owner requests another change.
