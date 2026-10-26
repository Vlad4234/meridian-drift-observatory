import http from 'node:http';
import { readFile } from 'node:fs/promises';
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT must be an integer between 1024 and 65535');
const routes = new Set(['/', '/systems', '/operations', '/events', '/account']);
const files = new Map([['/index.html', 'text/html; charset=utf-8'], ['/app.mjs', 'text/javascript; charset=utf-8'], ['/model.mjs', 'text/javascript; charset=utf-8'], ['/replay.mjs', 'text/javascript; charset=utf-8'], ['/donation.mjs', 'text/javascript; charset=utf-8'], ['/navigation.mjs', 'text/javascript; charset=utf-8'], ['/style.css', 'text/css; charset=utf-8'], ['/favicon.svg', 'image/svg+xml']]);
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, {'Allow':'GET, HEAD'}); res.end('DEMO is read-only over HTTP'); return; }
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = routes.has(pathname) ? '/index.html' : pathname;
  if (!files.has(file)) { res.writeHead(404); res.end('DEMO: page not found'); return; }
  try {
    const body = await readFile(new URL(`../dist${file}`, import.meta.url));
    res.writeHead(200, {'Content-Type': files.get(file)});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(503); res.end('DEMO build unavailable. Run npm run build.'); }
});
server.listen(port, '127.0.0.1', () => console.log(`DEMO http://localhost:${port}`));
