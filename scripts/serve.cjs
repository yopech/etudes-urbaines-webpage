// Minimal local preview server. Only public website files are served.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  const allowed = ['index.html', 'catalog.js', 'script.js', 'style.css', 'favicon.svg'].includes(relative) || /^assets\/web\/[a-z0-9-]+\.jpg$/.test(relative);
  if (!allowed) { res.writeHead(404).end('Not found'); return; }
  const file = path.join(root, relative);
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${server.address().port}`));
