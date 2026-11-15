import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdir,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { createReadStream } from "node:fs";
import { posterRules } from "../src/data/poster-rules.ts";
import { basePath as configuredBase } from "../site.config.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};
class SubmissionError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const inside = (root, target) =>
  target === root || target.startsWith(root + path.sep);
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

function sendJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(data));
}
function readBody(request, limit) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      total += chunk.length;
      if (total > limit) {
        request.pause();
        reject(
          new SubmissionError(
            413,
            "This upload is too large. Please choose a PDF of 20 MB or less.",
          ),
        );
      } else chunks.push(chunk);
    });
    request.once("end", () => resolve(Buffer.concat(chunks)));
    request.once("error", reject);
    request.once("aborted", () =>
      reject(
        new SubmissionError(
          400,
          "The upload was interrupted. Please try again.",
        ),
      ),
    );
  });
}
function requiredText(form, name, label, maxLength) {
  const values = form.getAll(name);
  if (values.length !== 1 || typeof values[0] !== "string")
    throw new SubmissionError(400, `Please provide your ${label}.`);
  const value = values[0].trim();
  if (
    !value ||
    value.length > maxLength ||
    /[\u0000-\u001f\u007f]/u.test(value)
  )
    throw new SubmissionError(400, `Please enter a valid ${label}.`);
  return value;
}

/** A temporary receiver for this computer. It is never part of the Pages build. */
export async function createPosterPreviewServer(options = {}) {
  const directory = await realpath(
    path.resolve(options.directory || path.join(projectRoot, "dist-preview")),
  );
  const uploadDirectory = path.resolve(
    options.uploadDirectory ||
      path.join(projectRoot, ".local", "poster-submissions"),
  );
  if (inside(directory, uploadDirectory))
    throw new Error(
      "The upload directory must be outside the public static directory.",
    );
  const base = `/${(options.basePath || configuredBase).split("/").filter(Boolean).join("/")}${(options.basePath || configuredBase) === "/" ? "" : "/"}`;
  const endpoint = `${base.replace(/\/$/, "")}/api/poster-submissions`;
  const maxFileBytes = options.maxFileBytes || posterRules.maxFileBytes;
  const maxBodyBytes = maxFileBytes + 128 * 1024;
  const allowedOrigins = new Set(options.allowedOrigins || []);
  const receiptPage = async (title, message, reference = "") => {
    const cssFile = (
      await readdir(path.join(directory, "_astro")).catch(() => [])
    ).find((name) => name.endsWith(".css"));
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} | SHIFRA</title><link rel="icon" href="data:,">${cssFile ? `<link rel="stylesheet" href="${base}_astro/${cssFile}">` : ""}</head><body><main class="container receipt"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${reference ? `<p>Submission reference: <strong>${escapeHtml(reference)}</strong></p><p>Submission does not confirm poster acceptance.</p>` : ""}<p><a href="${base}registration/poster/">Back to poster registration</a> · <a href="${base}">SHIFRA home</a></p></main></body></html>`;
  };

  const server = http.createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "no-store");
    let url;
    try {
      url = new URL(request.url, "http://127.0.0.1");
    } catch {
      response.writeHead(400);
      response.end("Invalid request.");
      return;
    }
    const wantsJson = request.headers.accept?.includes("application/json");
    if (url.pathname === endpoint) {
      try {
        if (request.method !== "POST") {
          response.setHeader("Allow", "POST");
          throw new SubmissionError(
            405,
            "Use the poster registration form to submit a poster.",
          );
        }
        const origin = request.headers.origin;
        const localOrigins = [
          `http://${request.headers.host}`,
          `http://localhost:${server.address()?.port}`,
          `http://127.0.0.1:${server.address()?.port}`,
        ];
        if (
          origin &&
          !allowedOrigins.has(origin) &&
          !localOrigins.includes(origin)
        )
          throw new SubmissionError(
            403,
            "Please submit from the SHIFRA registration page.",
          );
        const type = request.headers["content-type"] || "";
        if (!/^multipart\/form-data;\s*boundary=/i.test(type))
          throw new SubmissionError(
            415,
            "Please upload your poster using the registration form.",
          );
        const length = request.headers["content-length"];
        if (length && (!/^\d+$/.test(length) || Number(length) > maxBodyBytes))
          throw new SubmissionError(
            413,
            "This upload is too large. Please choose a PDF of 20 MB or less.",
          );
        const body = await readBody(request, maxBodyBytes);
        let form;
        try {
          form = await new Request("http://localhost/submission", {
            method: "POST",
            headers: { "Content-Type": type },
            body,
          }).formData();
        } catch {
          throw new SubmissionError(
            400,
            "The upload could not be read. Please select your PDF and try again.",
          );
        }
        const fullName = requiredText(
          form,
          "fullName",
          "full name",
          posterRules.maxNameLength,
        );
        const affiliation = requiredText(
          form,
          "affiliation",
          "affiliation",
          posterRules.maxAffiliationLength,
        );
        const email = requiredText(
          form,
          "email",
          "email address",
          posterRules.maxEmailLength,
        );
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          throw new SubmissionError(400, "Please enter a valid email address.");
        const files = form.getAll("poster");
        if (files.length !== 1 || !(files[0] instanceof File))
          throw new SubmissionError(400, "Please upload one poster PDF.");
        const file = files[0];
        if (file.size > maxFileBytes)
          throw new SubmissionError(
            413,
            "Please choose a PDF of 20 MB or less.",
          );
        if (!file.size)
          throw new SubmissionError(
            400,
            "The selected file is empty. Please choose your poster PDF.",
          );
        const bytes = Buffer.from(await file.arrayBuffer());
        if (
          !/\.pdf$/i.test(file.name) ||
          bytes.subarray(0, 5).toString("ascii") !== "%PDF-"
        )
          throw new SubmissionError(
            400,
            "The attachment must be a PDF file. Please select your poster PDF.",
          );
        const reference = randomUUID();
        const record = {
          reference,
          receivedAt: new Date().toISOString(),
          fullName,
          affiliation,
          email,
          originalFileName: path
            .basename(file.name.replaceAll("\\", "/"))
            .replace(/[\u0000-\u001f\u007f]/g, "")
            .slice(0, 255),
          fileName: "poster.pdf",
          fileSize: bytes.length,
          sha256: createHash("sha256").update(bytes).digest("hex"),
        };
        await mkdir(uploadDirectory, { recursive: true, mode: 0o700 });
        const actualUploads = await realpath(uploadDirectory);
        if (inside(directory, actualUploads))
          throw new Error(
            "Upload storage resolves inside the public directory.",
          );
        const pending = path.join(actualUploads, `.pending-${reference}`);
        try {
          await mkdir(pending, { mode: 0o700 });
          await writeFile(path.join(pending, "poster.pdf"), bytes, {
            flag: "wx",
            mode: 0o600,
          });
          await writeFile(
            path.join(pending, "registration.json"),
            JSON.stringify(record, null, 2) + "\n",
            { flag: "wx", mode: 0o600 },
          );
          await rename(pending, path.join(actualUploads, reference));
        } catch (error) {
          await rm(pending, { recursive: true, force: true });
          throw error;
        }
        if (wantsJson) sendJson(response, 201, { ok: true, reference });
        else {
          response.writeHead(201, {
            "Content-Type": "text/html; charset=utf-8",
          });
          response.end(
            await receiptPage(
              "Poster received",
              "Your registration details and poster have been saved for the organizers.",
              reference,
            ),
          );
        }
      } catch (error) {
        const status = error instanceof SubmissionError ? error.status : 503;
        const message =
          error instanceof SubmissionError
            ? error.message
            : "Your poster could not be saved. Please try again later.";
        if (!(error instanceof SubmissionError))
          console.error(
            "Poster receiver storage error:",
            error.code || "unavailable",
          );
        if (status === 413) response.setHeader("Connection", "close");
        if (wantsJson)
          sendJson(response, status, { ok: false, error: message });
        else {
          response.writeHead(status, {
            "Content-Type": "text/html; charset=utf-8",
          });
          response.end(await receiptPage("Poster not submitted", message));
        }
      }
      return;
    }
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Method not allowed.");
      return;
    }
    if (url.pathname === "/" && base !== "/") {
      response.writeHead(302, { Location: base });
      response.end();
      return;
    }
    if (!url.pathname.startsWith(base)) {
      response.writeHead(404);
      response.end("Not found.");
      return;
    }
    try {
      const relative = decodeURIComponent(url.pathname.slice(base.length));
      let file = path.resolve(directory, relative || ".");
      if (!inside(directory, file)) throw new Error("Not public.");
      const info = await stat(file);
      if (info.isDirectory()) {
        if (!url.pathname.endsWith("/")) {
          response.writeHead(308, {
            Location: url.pathname + "/" + url.search,
          });
          response.end();
          return;
        }
        file = path.join(file, "index.html");
      }
      file = await realpath(file);
      if (!inside(directory, file)) throw new Error("Not public.");
      const fileInfo = await stat(file);
      if (!fileInfo.isFile()) throw new Error("Not a file.");
      response.writeHead(200, {
        "Content-Type":
          mimeTypes[path.extname(file)] || "application/octet-stream",
        "Content-Length": fileInfo.size,
      });
      if (request.method === "HEAD") response.end();
      else
        createReadStream(file)
          .on("error", () => response.destroy())
          .pipe(response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found.");
    }
  });
  server.requestTimeout = 120000;
  server.headersTimeout = 30000;
  return server;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT || 4173);
  const uploadDirectory = path.resolve(
    process.env.POSTER_UPLOAD_DIR ||
      path.join(projectRoot, ".local", "poster-submissions"),
  );
  const server = await createPosterPreviewServer({
    uploadDirectory,
    allowedOrigins: (process.env.POSTER_ALLOWED_ORIGINS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  });
  server.listen(port, "127.0.0.1", () =>
    console.log(
      JSON.stringify({
        preview: `http://127.0.0.1:${port}${configuredBase}`,
        uploads: uploadDirectory,
        receiver: "local preview only",
      }),
    ),
  );
}
