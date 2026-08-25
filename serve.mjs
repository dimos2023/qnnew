/* Local dev server for LEGACY MOTORS.
   Mirrors vercel.json: cleanUrls (serve /x for /x.html), the vanity-route
   rewrites, and security headers — so local testing matches deployment.

   Run:  node serve.mjs      then open  http://localhost:8900
*/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.dirname(url.fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? Number(process.env.PORT) : 8900;

let rewrites = new Map();
try {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  rewrites = new Map((cfg.rewrites || []).map((r) => [r.source, r.destination]));
} catch {
  /* no vercel.json — plain static serving */
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

function resolveFile(pathname) {
  if (rewrites.has(pathname)) return path.join(ROOT, rewrites.get(pathname));
  const p = path.join(ROOT, decodeURIComponent(pathname));
  if (pathname === '/') return path.join(ROOT, 'index.html');
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  if (fs.existsSync(p + '.html')) return p + '.html';
  if (fs.existsSync(p) && fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'index.html')))
    return path.join(p, 'index.html');
  return null;
}

http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);
  const file = resolveFile(pathname);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!file || !fs.existsSync(file)) {
    res.statusCode = 404;
    res.end('404 Not Found: ' + pathname);
    return;
  }
  res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
  res.statusCode = 200;
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log('LEGACY MOTORS dev server → http://localhost:' + PORT));
