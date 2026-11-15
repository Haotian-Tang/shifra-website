import { sitePath } from "../lib/urls";
import { posterRules } from "./poster-rules";

const configuredEndpoint =
  import.meta.env.PUBLIC_POSTER_SUBMISSION_ENDPOINT?.trim();
export const posterRegistration = {
  ...posterRules,
  endpoint: configuredEndpoint
    ? /^https:\/\//.test(configuredEndpoint)
      ? configuredEndpoint
      : sitePath(configuredEndpoint)
    : null,
  isPreview: import.meta.env.PUBLIC_POSTER_SUBMISSION_MODE === "local-preview",
};
