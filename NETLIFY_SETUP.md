# Netlify deployment

This Astro site is static. Registration remains hosted by the existing Google Apps Script service, with records and attachments in private Google Sheets and Drive.

Netlify project: **shifra-symposium-uae**. Current live site: **https://shifra-symposium-uae.netlify.app/**. The proposed university domain `shifra.mbzuai.ac.ae` is not yet live. Netlify reports that `mbzuai.ac.ae` or one of its subdomains is already managed by another Netlify team; that team association must be resolved before MBZUAI IT configures DNS.

## Manual deployment

Use the current Netlify URL when preparing an upload:

```sh
SITE_URL=https://shifra-symposium-uae.netlify.app/ pnpm build
SITE_URL=https://shifra-symposium-uae.netlify.app/ pnpm verify
```

Upload the contents of `dist/` through the site's manual deploy interface. The ZIP root must contain `index.html`, `_astro/`, and the other generated routes/assets. Do not upload the source repository, private submission files, or local configuration.

Use the same Netlify project for subsequent deployments. Manual uploads do not run the build command in `netlify.toml`, so build and verify locally before each upload.

## Optional repository builds

`netlify.toml` uses Node 24, pnpm 11.25.0, the build command `pnpm build && pnpm verify`, and publish directory `dist`. The repository's `packageManager` also pins the pnpm version.

`SITE_URL` takes precedence when explicitly provided. Otherwise, a Netlify production build uses `URL`; a branch or deploy preview uses `DEPLOY_PRIME_URL`. Netlify assets are built at `/`. Outside Netlify, the existing GitHub Pages origin and project path remain the fallback.

## University subdomain

Ask MBZUAI IT and the existing university Netlify team to coordinate hosting or transferring this project into the appropriate team. If the association is stale or unknown, the university domain owner should work with Netlify Support on ownership verification. Do not remove the university's DNS zone or change its nameservers to solve this one-site conflict.

Once Netlify accepts `shifra.mbzuai.ac.ae` as a custom domain, MBZUAI IT must point its `shifra` CNAME to **shifra-symposium-uae.netlify.app** (TTL 3600 is suitable, DNS only initially). Use Netlify's current domain verification and HTTPS instructions. Do not copy the unrelated `beltrame` nameservers or CAA records from the older email thread, and do not place CAA alongside the CNAME at the same hostname.

After DNS validation and HTTPS are working, use `SITE_URL=https://shifra.mbzuai.ac.ae/` for the production build and redeploy it. This updates canonical and sharing URLs while keeping all assets at the root. Do not announce the university hostname as live until it resolves and serves a valid certificate.

If `shifra.ae` becomes available later, add and validate it on the same Netlify project before changing the primary domain. Then rebuild with its full HTTPS URL. Retain the university domain as an alias if the university authorizes that arrangement.
