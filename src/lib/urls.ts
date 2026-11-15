/** Paths here are relative to public/ or the site's route root. */
export function sitePath(path = ""): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function contentUrl(path: string): string {
  return /^(https?:)?\/\//.test(path) ? path : sitePath(path);
}
