import { execFileSync } from "node:child_process";

// Fallback is the actual SSH remote verified when this project was created.
const sourceRepository = "halalsaleh7212-spec/shifra-website";
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
// A full URL supports ordinary project Pages, private Pages origins, and a later custom domain.
const deploymentUrl = new URL(
  process.env.SITE_URL || `https://${owner}.github.io${inferredBase}`,
);
export const siteOrigin = deploymentUrl.origin;
export const basePath = `/${deploymentUrl.pathname.split("/").filter(Boolean).join("/")}${deploymentUrl.pathname === "/" ? "" : "/"}`;
export const siteUrl = new URL(basePath, siteOrigin).href;
