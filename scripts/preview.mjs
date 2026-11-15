/**
 * Локальный просмотр собранного сайта: `npm run preview`.
 *
 * Отдаёт папку out/ так же, как GitHub Pages: /privacy/ -> privacy/index.html,
 * всё остальное — как файл или 404.html.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve("out");
const port = Number(process.env.PORT ?? 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const safe = path.normalize(clean).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, safe);
  if (!full.startsWith(root)) return { status: 403, file: null };

  const candidates = [];
  if (clean.endsWith("/")) candidates.push(path.join(full, "index.html"));
  candidates.push(full);
  candidates.push(`${full}.html`);
  candidates.push(path.join(full, "index.html"));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return { status: 200, file: candidate };
    }
  }
  return { status: 404, file: path.join(root, "404.html") };
}

http
  .createServer((req, res) => {
    const { status, file } = resolveFile(req.url ?? "/");
    if (!file || !fs.existsSync(file)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404");
      return;
    }
    res.writeHead(status, {
      "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream",
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => {
    console.log(`preview: http://127.0.0.1:${port}`);
  });
