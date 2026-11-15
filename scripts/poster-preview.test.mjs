import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { createPosterPreviewServer } from "./poster-preview.mjs";

function samplePdf() {
  const content = "BT /F1 12 Tf 30 40 Td (SHIFRA preview upload test) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 100] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((n) => `${String(n).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}
const pdf = samplePdf();
const fields = {
  fullName: "Preview Test",
  affiliation: "Test & Research Institute",
  email: "preview@example.invalid",
};
function form(overrides = {}, bytes = pdf, filename = "poster.pdf") {
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...fields, ...overrides }))
    data.append(key, value);
  if (bytes !== null)
    data.append(
      "poster",
      new File([bytes], filename, { type: "application/pdf" }),
    );
  return data;
}

test("poster receiver validates, privately saves, and reports real outcomes", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "shifra-poster-test-"));
  const directory = path.join(root, "public");
  const uploads = path.join(root, "private-uploads");
  await mkdir(path.join(directory, "_astro"), { recursive: true });
  await writeFile(
    path.join(directory, "index.html"),
    "SHIFRA test static page",
  );
  await writeFile(
    path.join(directory, "_astro", "style.css"),
    "body{color:black}",
  );
  const server = await createPosterPreviewServer({
    directory,
    uploadDirectory: uploads,
    basePath: "/shifra-website/",
    maxFileBytes: 1024,
    allowedOrigins: ["https://preview.example.invalid"],
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const origin = `http://127.0.0.1:${server.address().port}`;
  const endpoint = `${origin}/shifra-website/api/poster-submissions`;
  const post = (data, originHeader) =>
    fetch(endpoint, {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json",
        ...(originHeader ? { Origin: originHeader } : {}),
      },
    });
  try {
    await t.test("persists all four fields and exact PDF bytes", async () => {
      const response = await post(
        form({}, pdf, "../../poster.pdf"),
        "https://preview.example.invalid",
      );
      assert.equal(response.status, 201);
      const result = await response.json();
      assert.equal(result.ok, true);
      assert.match(result.reference, /^[a-f0-9-]{36}$/);
      const folder = path.join(uploads, result.reference);
      const record = JSON.parse(
        await readFile(path.join(folder, "registration.json"), "utf8"),
      );
      for (const [name, value] of Object.entries(fields))
        assert.equal(record[name], value);
      assert.equal(record.originalFileName, "poster.pdf");
      assert.equal(record.fileSize, pdf.length);
      assert.equal(
        record.sha256,
        createHash("sha256").update(pdf).digest("hex"),
      );
      assert.deepEqual(await readFile(path.join(folder, "poster.pdf")), pdf);
      assert.equal(
        (await stat(path.join(folder, "poster.pdf"))).mode & 0o077,
        0,
      );
      assert.equal((await stat(folder)).mode & 0o077, 0);
      assert.equal(
        (await fetch(`${origin}/shifra-website/${result.reference}/poster.pdf`))
          .status,
        404,
      );
      assert.equal(
        (
          await fetch(
            `${origin}/shifra-website/../private-uploads/${result.reference}/registration.json`,
          )
        ).status,
        404,
      );
    });
    await t.test(
      "required fields and valid email are enforced on the server",
      async () => {
        for (const input of [
          { fullName: "" },
          { affiliation: "  " },
          { email: "not-an-email" },
        ])
          assert.equal((await post(form(input))).status, 400);
        assert.equal((await post(form({}, null))).status, 400);
      },
    );
    await t.test("a renamed non-PDF cannot be submitted", async () => {
      const response = await post(
        form({}, Buffer.from("<html>not a PDF</html>")),
      );
      assert.equal(response.status, 400);
      assert.equal((await response.json()).ok, false);
    });
    await t.test(
      "empty, oversized, and multiple attachments are rejected",
      async () => {
        assert.equal((await post(form({}, Buffer.alloc(0)))).status, 400);
        assert.equal((await post(form({}, Buffer.alloc(1025)))).status, 413);
        const multiple = form();
        multiple.append(
          "poster",
          new File([pdf], "another.pdf", { type: "application/pdf" }),
        );
        assert.equal((await post(multiple)).status, 400);
      },
    );
    await t.test(
      "declared oversized requests are rejected without accepting the body",
      async () => {
        const status = await new Promise((resolve, reject) => {
          const request = http.request(
            endpoint,
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data; boundary=test",
                "Content-Length": String(1024 + 128 * 1024 + 1),
              },
            },
            (response) => {
              response.resume();
              response.on("end", () => resolve(response.statusCode));
            },
          );
          request.on("error", reject);
          request.end();
        });
        assert.equal(status, 413);
      },
    );
    await t.test(
      "unrelated browser origins and non-form bodies are rejected",
      async () => {
        assert.equal(
          (await post(form(), "https://unrelated.example.invalid")).status,
          403,
        );
        assert.equal(
          (
            await fetch(endpoint, {
              method: "POST",
              body: "{}",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            })
          ).status,
          415,
        );
        assert.equal((await fetch(endpoint)).status, 405);
      },
    );
    await t.test(
      "native HTML forms receive a real confirmation without JavaScript",
      async () => {
        const response = await fetch(endpoint, {
          method: "POST",
          body: form(),
          headers: { Accept: "text/html" },
        });
        assert.equal(response.status, 201);
        assert.match(response.headers.get("content-type"), /text\/html/);
        assert.match(await response.text(), /Poster received/);
      },
    );
    await t.test(
      "static files load; symlinks cannot expose private data",
      async () => {
        assert.equal(
          await (await fetch(`${origin}/shifra-website/`)).text(),
          "SHIFRA test static page",
        );
        await writeFile(path.join(root, "private.txt"), "PRIVATE");
        await symlink(
          path.join(root, "private.txt"),
          path.join(directory, "shortcut.txt"),
        );
        assert.equal(
          (await fetch(`${origin}/shifra-website/shortcut.txt`)).status,
          404,
        );
        assert.equal((await readdir(uploads)).length, 2);
      },
    );
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});

test("a storage failure never returns a success receipt", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "shifra-poster-error-"));
  const directory = path.join(root, "public");
  await mkdir(path.join(directory, "_astro"), { recursive: true });
  await writeFile(path.join(directory, "_astro", "style.css"), "");
  const fileInsteadOfDirectory = path.join(root, "storage-file");
  await writeFile(fileInsteadOfDirectory, "not a directory");
  const server = await createPosterPreviewServer({
    directory,
    uploadDirectory: fileInsteadOfDirectory,
    basePath: "/",
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/poster-submissions`,
      { method: "POST", body: form(), headers: { Accept: "application/json" } },
    );
    assert.equal(response.status, 503);
    const result = await response.json();
    assert.equal(result.ok, false);
    assert.equal(result.reference, undefined);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});
