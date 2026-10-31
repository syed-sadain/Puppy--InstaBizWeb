// Local static server for the puppy.instabizweb.com mirror.
// - Serves files from ./puppy.instabizweb.com
// - If a file is missing locally, it is fetched from the live origin and cached to disk.
// Result: the downloaded folder renders exactly like the real site, and becomes
// fully offline-capable after the pages/assets have been visited (or pre-cached).

import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, 'puppy.instabizweb.com');
const ORIGIN = process.env.ORIGIN || 'https://puppy.instabizweb.com';
const PORT = Number(process.env.PORT || 4173);
const MAP_FILE = path.join(HERE, '.cache-index.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

const CT_EXT = [
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/svg', '.svg'],
  ['image/gif', '.gif'],
  ['text/css', '.css'],
  ['javascript', '.js'],
  ['text/html', '.html'],
  ['font/woff2', '.woff2'],
  ['font/woff', '.woff'],
  ['application/json', '.json'],
  ['text/x-component', '.txt'],
];

const mimeFor = (f) => MIME[path.extname(f).toLowerCase()] || 'application/octet-stream';
const extForType = (ct) => {
  if (!ct) return '';
  const s = ct.toLowerCase();
  for (const [k, v] of CT_EXT) if (s.includes(k)) return v;
  return '';
};

let map = {};
try {
  map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
} catch {}

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFile(MAP_FILE, JSON.stringify(map), () => {});
  }, 300);
}

// Decide the on-disk file name for a requested URL path.
function nameFor(urlPath, search, contentType) {
  const key = urlPath + search;
  const hit = map[key];
  if (hit && fs.existsSync(path.join(ROOT, hit.f))) return hit.f;

  const urlExt = path.extname(urlPath);
  const ext = extForType(contentType) || urlExt;

  if (!urlExt && !search) {
    const dir = urlPath.replace(/^\/+|\/+$/g, '');
    return (dir ? dir + '/' : '') + 'index.html';
  }

  const clean = urlPath.replace(/^\/+/, '');
  if (search) {
    const h = crypto.createHash('sha1').update(key).digest('hex').slice(0, 12);
    return clean + '__' + h + (ext || '.bin');
  }
  return clean + (urlExt ? '' : '.bin');
}

function safeJoin(rel) {
  const abs = path.resolve(ROOT, rel);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null;
  return abs;
}

async function fetchOrigin(urlPath, search) {
  try {
    const r = await fetch(ORIGIN + urlPath + search, {
      headers: {
        accept: 'image/avif,image/webp,image/apng,image/*,text/html,application/xhtml+xml,*/*;q=0.8',
        'user-agent': 'puppy-local-mirror/1.0',
      },
      redirect: 'follow',
    });
    if (!r.ok) return null;
    const body = Buffer.from(await r.arrayBuffer());
    return { body, type: r.headers.get('content-type') || '' };
  } catch {
    return null;
  }
}

function send(res, abs, type, method) {
  let st;
  try {
    st = fs.statSync(abs);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }
  res.writeHead(200, {
    'content-type': type || mimeFor(abs),
    'content-length': st.size,
    'cache-control': 'no-cache',
  });
  if (method === 'HEAD') return res.end();
  fs.createReadStream(abs).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    let urlPath;
    try {
      urlPath = decodeURIComponent(u.pathname);
    } catch {
      urlPath = u.pathname;
    }
    const search = u.search;
    const key = urlPath + search;

    // 1) cached on disk?
    const hit = map[key];
    if (hit) {
      const abs = safeJoin(hit.f);
      if (abs && fs.existsSync(abs) && fs.statSync(abs).isFile()) {
        return send(res, abs, hit.t || mimeFor(hit.f), req.method);
      }
    }

    // 2) deterministic name already on disk?
    const detRel = nameFor(urlPath, search);
    const detAbs = safeJoin(detRel);
    if (detAbs && fs.existsSync(detAbs) && fs.statSync(detAbs).isFile()) {
      return send(res, detAbs, mimeFor(detRel), req.method);
    }

    // 3) fetch from origin + cache
    const got = await fetchOrigin(urlPath, search);
    if (!got) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      return res.end('Not found: ' + key);
    }
    const rel = nameFor(urlPath, search, got.type);
    const abs = safeJoin(rel);
    if (!abs) {
      res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
      return res.end('Bad path');
    }
    await fsp.mkdir(path.dirname(abs), { recursive: true });
    await fsp.writeFile(abs, got.body);
    map[key] = { f: rel, t: got.type || mimeFor(rel) };
    persist();
    return send(res, abs, map[key].t, req.method);
  } catch (err) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Server error: ' + (err && err.message));
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  TeddyPups local site is running');
  console.log('  ------------------------------------------------');
  console.log('  Open:   http://localhost:' + PORT + '/');
  console.log('  Root:   ' + ROOT);
  console.log('  Origin: ' + ORIGIN + '  (used for missing files)');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});
