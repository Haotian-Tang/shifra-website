import { execFileSync } from "node:child_process";

// Fallback matches the current repository after its ownership transfer.
const sourceRepository = "Haotian-Tang/shifra-website";
function repositoryFromRemote() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  try {
    const remote = execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
    }).trim();
    return (
      remote.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/)?.[1] ||
      sourceRepository
    );
  } catch {
    return sourceRepository;
  }
}
export const repository = repositoryFromRemote();
const [owner, name] = repository.split("/");
const inferredBase =
  name.toLowerCase() === `${owner.toLowerCase()}.github.io` ? "/" : `/${name}/`;
// Netlify serves the generated files at the origin root. Preview deployments use
// their own URL; production uses the configured primary URL (including a custom domain).
const netlifyUrl = process.env.NETLIFY === "true"
  ? ((process.env.CONTEXT && process.env.CONTEXT !== "production"
      ? process.env.DEPLOY_PRIME_URL
      : process.env.URL) || process.env.URL || process.env.DEPLOY_PRIME_URL)
  : undefined;
// SITE_URL is the explicit override for manual uploads, custom domains, and Pages.
const deploymentUrl = new URL(
  process.env.SITE_URL ||
    (netlifyUrl ? `${new URL(netlifyUrl).origin}/` : undefined) ||
    `https://${owner}.github.io${inferredBase}`,
);
// GitHub's default Pages domains require HTTPS, even if stale Pages metadata says HTTP.
if (deploymentUrl.hostname.endsWith(".github.io")) {
  deploymentUrl.protocol = "https:";
}
export const siteOrigin = deploymentUrl.origin;
export const basePath = `/${deploymentUrl.pathname.split("/").filter(Boolean).join("/")}${deploymentUrl.pathname === "/" ? "" : "/"}`;
export const siteUrl = new URL(basePath, siteOrigin).href;
