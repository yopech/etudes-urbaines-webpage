// Minimal local preview server. Only public website files are served.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};
const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
  } catch {
    res.writeHead(400).end();
    return;
  }
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  const allowed =
    [
      "index.html",
      "neon-hero.html",
      "catalog.js",
      "script.js",
      "style.css",
      "exhibition.css",
      "exhibition.js",
      "neon.css",
      "power.js",
      "scroll.js",
      "favicon.svg",
    ].includes(relative) ||
    /^(neon-(off|partial|on)|switch-(off|on)|concrete-tile|photo-[1-4])\.jpg$/.test(relative) ||
    /^(frame-[1-4]|spotlight|switch-(off|on)|заказать_(off|mid|full))\.png$/.test(relative) ||
    /^assets\/web\/[a-z0-9-]+\.jpg$/.test(relative) ||
    /^assets\/audio\/power-on\.mp3$/.test(relative) ||
    /^assets\/(fonts|vendor)\/[a-z0-9.-]+\.(otf|ttf|txt|html|css|js)$/.test(
      relative,
    );
  if (!allowed) {
    res.writeHead(404).end("Not found");
    return;
  }
  const file = path.join(root, relative);
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404).end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(Number(process.env.PORT || 4173), "127.0.0.1", () =>
  console.log(`Preview: http://127.0.0.1:${server.address().port}`),
);
