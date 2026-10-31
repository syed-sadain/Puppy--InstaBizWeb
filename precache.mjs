// Pre-cache all pages + assets through the local server so the mirror works offline.
// Usage:  node precache.mjs        (server.mjs must be running)

const PORT = Number(process.env.PORT || 4173);
const BASE = 'http://localhost:' + PORT;
const ROUTES = ['/', '/puppies', '/contact', '/faq', '/how-it-works', '/happy-families', '/gone-home'];

const seen = new Set();
let ok = 0;
let fail = 0;

const unesc = (s) => s.replace(/&amp;/g, '&');

const ASSET_RE =
  /\/_next\/[^\s"',\\)]+|\/media\/[^\s"',\\)]+|\/brand\/[^\s"',\\)]+|\/cursor\/[^\s"',\\)]+|\/(?:icon|apple-icon)\.png[^\s"',\\)]*/g;

async function get(url) {
  if (seen.has(url)) return null;
  seen.add(url);
  try {
    const r = await fetch(BASE + url, { headers: { accept: '*/*' } });
    if (!r.ok) {
      fail++;
      return null;
    }
    ok++;
    return Buffer.from(await r.arrayBuffer());
  } catch {
    fail++;
    return null;
  }
}

function extract(text) {
  const out = new Set();
  const m = String(text).match(ASSET_RE);
  if (m) for (const u of m) out.add(unesc(u));
  return [...out];
}

async function cacheCss(cssUrl) {
  const buf = await get(cssUrl);
  if (!buf) return;
  const css = buf.toString('utf8');
  const refs = [...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map((m) => m[2]);
  for (let ref of refs) {
    if (ref.startsWith('data:') || ref.startsWith('http')) continue;
    ref = ref.split('#')[0];
    let abs;
    try {
      abs = new URL(ref, 'http://x' + cssUrl).pathname + new URL(ref, 'http://x' + cssUrl).search;
    } catch {
      continue;
    }
    await get(abs);
  }
}

async function cacheJs(jsUrl) {
  const buf = await get(jsUrl);
  if (!buf) return;
  const js = buf.toString('utf8');
  const refs = js.match(
    /\/_next\/static\/media\/[^\s"'\\]+\.(?:woff2?|ttf)|\/media\/[^\s"'\\]+\.(?:jpe?g|png|webp|avif)|\/brand\/[^\s"'\\]+|\/cursor\/[^\s"'\\]+/g
  );
  if (refs) for (const r of new Set(refs)) await get(r);
}

async function main() {
  console.log('Pre-caching from ' + BASE + ' ...');

  // 1) pages
  const pages = [];
  for (const route of ROUTES) {
    const buf = await get(route);
    if (buf) {
      pages.push({ route, html: buf.toString('utf8') });
      console.log('  page  ' + route);
    }
  }

  // 2) assets referenced by each page
  const assets = new Set();
  for (const p of pages) for (const a of extract(p.html)) assets.add(a);

  const cssList = [];
  const jsList = [];
  for (const a of assets) {
    if (a.includes('?_rsc=')) continue;
    if (a.endsWith('.css')) cssList.push(a);
    else if (a.endsWith('.js')) jsList.push(a);
    else {
      const b = await get(a);
      if (b) console.log('  asset ' + a.slice(0, 100));
    }
  }

  // 3) css + their url() refs (fonts, background images)
  for (const c of cssList) {
    await cacheCss(c);
    console.log('  css   ' + c);
  }

  // 4) js + inline asset refs
  for (const j of jsList) {
    await cacheJs(j);
    console.log('  js    ' + j);
  }

  console.log('');
  console.log('Done.  cached/ok: ' + ok + '   failed: ' + fail);
  console.log('The site is now fully available offline at http://localhost:' + PORT + '/');
}

main();
