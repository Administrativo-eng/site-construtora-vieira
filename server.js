// server.js — Node puro (sem Express), porta 8888
// Dev local para SITE CONSTRUTORA VIEIRA (MPA + rotas limpas)
// - HTML: Cache-Control no-store
// - Assets (css/js/img/ico/webp/avif): 1 ano + immutable
// - sw.js: revalidação (no-cache, must-revalidate)
// - 404: X-Robots-Tag: noindex, nofollow
// - CSP liberando GTM/GA/rss2json (conforme instruções)

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT  = 8888;
const ROOT  = __dirname;                   // pasta do projeto
const PAGES = path.join(ROOT, 'paginas');  // HTMLs internos

// Tipos MIME (inclui AVIF/WEBP/manifest/webmanifest)
const MIME = {
  '.html':        'text/html; charset=utf-8',
  '.css':         'text/css; charset=utf-8',
  '.js':          'application/javascript; charset=utf-8',
  '.png':         'image/png',
  '.jpg':         'image/jpeg',
  '.jpeg':        'image/jpeg',
  '.webp':        'image/webp',
  '.avif':        'image/avif',
  '.svg':         'image/svg+xml',
  '.ico':         'image/x-icon',
  '.json':        'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.map':         'application/json; charset=utf-8',
  '.txt':         'text/plain; charset=utf-8',
  '.xml':         'application/xml; charset=utf-8',
  '.mp4':         'video/mp4',
  '.webm':        'video/webm',
};

function existsFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

function securityHeaders(extra = {}) {
  // CSP minimalista para dev, liberando GTM/GA/rss2json
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com",
    "connect-src 'self' https://www.google-analytics.com https://api.rss2json.com",
    "img-src 'self' data: blob: https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "frame-src https://www.googletagmanager.com",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  return Object.assign({
    'Content-Security-Policy': csp,
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  }, extra);
}

function buildCacheHeaders(filePath, status, type) {
  const name = path.basename(filePath);
  let cache = 'public, max-age=31536000, immutable'; // padrão assets

  // HTML nunca em cache (facilita dev e evita stale)
  if (type.startsWith('text/html')) {
    cache = 'no-store';
  }

  // Service worker precisa revalidar
  if (name === 'sw.js') {
    cache = 'no-cache, must-revalidate';
  }

  const hdr = { 'Cache-Control': cache };

  // Se 404, instruir bots a não indexar
  if (status === 404 || name === '404.html') {
    hdr['X-Robots-Tag'] = 'noindex, nofollow, noarchive';
  }

  return hdr;
}

function sendFile(req, res, filePath, status = 200) {
  const ext  = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';

  // HEAD: só cabeçalhos
  if (req.method === 'HEAD') {
    res.writeHead(status, {
      'Content-Type': type,
      ...securityHeaders(),
      ...buildCacheHeaders(filePath, status, type)
    });
    return res.end();
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      const body = 'Página não encontrada';
      res.writeHead(404, {
        'Content-Type': 'text/plain; charset=utf-8',
        ...securityHeaders({ 'X-Robots-Tag': 'noindex, nofollow, noarchive' }),
        'Cache-Control': 'no-store'
      });
      return res.end(body);
    }
    res.writeHead(status, {
      'Content-Type': type,
      ...securityHeaders(),
      ...buildCacheHeaders(filePath, status, type)
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname)
    .replace(/\/{2,}/g, '/'); // normaliza barras

  // remove barra final (exceto raiz)
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);

  console.log('[REQ]', req.method, pathname);

  // 1) Assets diretos da raiz (ex.: /includes/style.css, /img_site/logocerta.png)
  const direct = path.join(ROOT, pathname);
  if (existsFile(direct)) return sendFile(req, res, direct);

  // 2) Home -> tenta paginas/index.html, senão ./index.html (raiz)
  if (pathname === '/') {
    const a = path.join(PAGES, 'index.html');
    const b = path.join(ROOT,  'index.html');
    const home = existsFile(a) ? a : b;
    console.log('     home =>', home);
    return sendFile(req, res, home);
  }

  // 3) Slug -> paginas/<slug>.html (ou paginas/<slug>/index.html)
  // Mantém case-insensitive de rota (arquivos são minúsculos)
  const slug  = pathname.slice(1).toLowerCase();
  const fileA = path.join(PAGES, `${slug}.html`);
  const fileB = path.join(PAGES, slug, 'index.html');

  console.log('     tenta:', fileA, existsFile(fileA) ? '✅' : '❌');
  console.log('     tenta:', fileB, existsFile(fileB) ? '✅' : '❌');

  if (existsFile(fileA)) return sendFile(req, res, fileA);
  if (existsFile(fileB)) return sendFile(req, res, fileB);

  // 4) 404 -> paginas/404.html (se existir) ou texto
  const notFound = path.join(PAGES, '404.html');
  if (existsFile(notFound)) return sendFile(req, res, notFound, 404);

  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8',
    ...securityHeaders({ 'X-Robots-Tag': 'noindex, nofollow, noarchive' }),
    'Cache-Control': 'no-store'
  });
  res.end('Página não encontrada');
});

server.listen(PORT, () => {
  console.log(`Servidor ON: http://localhost:${PORT}`);
  console.log('ROOT  =', ROOT);
  console.log('PAGES =', PAGES);
});
