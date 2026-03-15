const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT || 8090);
const API_ORIGIN = 'https://baku.gps.az';
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Auth,Authorization');
}

function send(res, code, body, contentType = 'text/plain; charset=utf-8') {
  res.statusCode = code;
  res.setHeader('Content-Type', contentType);
  setCors(res);
  res.end(body);
}

function serveStatic(req, res) {
  const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let reqPath = decodeURIComponent(parsed.pathname || '/');
  if (reqPath === '/') reqPath = '/fleet-dashboard.html';

  const safePath = path.normalize(reqPath).replace(/^\/+/, '');
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, 'Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    setCors(res);
    res.end(data);
  });
}

function proxyToGpsApi(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    setCors(res);
    res.end();
    return;
  }

  const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const apiPath = parsed.pathname.replace(/^\/gps-api/, '') + (parsed.search || '');
  const target = new URL(apiPath, API_ORIGIN);

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.origin;
  delete headers.referer;

  const upstream = https.request(target, {
    method: req.method,
    headers
  }, (up) => {
    res.statusCode = up.statusCode || 502;
    for (const [k, v] of Object.entries(up.headers)) {
      if (k.toLowerCase() === 'content-security-policy') continue;
      if (k.toLowerCase() === 'access-control-allow-origin') continue;
      if (v !== undefined) res.setHeader(k, v);
    }
    setCors(res);
    up.pipe(res);
  });

  upstream.on('error', (err) => {
    send(res, 502, JSON.stringify({ error: 'Proxy error', detail: String(err.message || err) }), 'application/json; charset=utf-8');
  });

  req.pipe(upstream);
}

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (parsed.pathname.startsWith('/gps-api/')) {
    proxyToGpsApi(req, res);
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Dev server: http://127.0.0.1:${PORT}/fleet-dashboard.html`);
  console.log(`Proxy base: http://127.0.0.1:${PORT}/gps-api`);
});
