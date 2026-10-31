<div align="center">

<img src="public/brand/logo.png" alt="TeddyPups U.A.E." width="120" />

# TeddyPups U.A.E.

**Premium teacup & teddy-bear puppy website (Dubai), packaged as a production-ready static site.**

[![Live Site](https://img.shields.io/badge/live-teddypups--instabizweb.netlify.app-00c7b7?logo=netlify&logoColor=white)](https://teddypups-instabizweb.netlify.app/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-3c873a?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](#)
[![Deploy](https://img.shields.io/badge/deploy-netlify%20%7C%20vercel-blue)](#deployment)

</div>

---

## Table of contents

- [Live site](#live-site)
- [Overview](#overview)
- [Features](#features)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [npm scripts](#npm-scripts)
- [Pages](#pages)
- [How it works](#how-it-works)
- [Deployment](#deployment)
- [Tech stack](#tech-stack)
- [Notes & limitations](#notes--limitations)
- [Author](#author)

---

## Live site

| Environment | URL |
| --- | --- |
| Production (Netlify) | <https://teddypups-instabizweb.netlify.app/> |
| Local development | <http://localhost:4173/> |

---

## Overview

This repository contains the complete **TeddyPups U.A.E.** marketing site — an
animation-rich Next.js experience with floating puppy mascots, scroll scenes and a
night/horizon theme — together with a tiny, dependency-free Node.js server that runs
the whole thing locally with a single command.

The site is stored in [`public/`](public) and served over HTTP by
[`scripts/server.mjs`](scripts/server.mjs). Server tooling lives in [`scripts/`](scripts)
and is never deployed.

> **Why a server instead of opening `index.html`?**
> The exported site uses **absolute asset paths** (`/_next/...`, `/media/...`) and ES
> modules, which browsers block under the `file://` protocol. Serving over
> `http://localhost` is what makes it render correctly.

---

## Features

- **Zero dependencies** — no `npm install` required, only Node.js.
- **Self-healing mirror** — any asset missing locally is fetched from the live origin
  and cached to disk, so nothing ever 404s.
- **Offline capable** — run `npm run precache` once and the site browses with no
  internet connection.
- **Clean separation** — deployable site in `public/`, tooling in `scripts/`, config at
  the root.
- **All routes included** — home, available puppies, gone home, happy families, how it
  works, FAQ and contact.

---

## Project structure

```text
.
├── public/                        # The website  ── deploy root
│   ├── index.html                 # Home                              /
│   ├── icon.png
│   ├── apple-icon.png
│   │
│   ├── puppies/                   # Available puppies                 /puppies
│   ├── gone-home/                 # Adopted puppies                   /gone-home
│   ├── happy-families/            # Testimonials                      /happy-families
│   ├── how-it-works/              # Process & delivery                /how-it-works
│   ├── faq/                       # Frequently asked questions        /faq
│   ├── contact/                   # Visit & contact                   /contact
│   │
│   ├── brand/                     # Brand mark
│   ├── cursor/                    # Custom cursor artwork
│   ├── media/                     # Photography & video library
│   ├── cdn-cgi/                   # Cloudflare runtime assets
│   └── _next/                     # Compiled JS / CSS / fonts
│       └── static/
│           ├── chunks/            # Application bundles (.js / .css)
│           └── media/             # Self-hosted woff2 fonts
│
├── scripts/                       # Local tooling  ── never deployed
│   ├── server.mjs                 # Static server with origin fallback + disk cache
│   ├── precache.mjs               # Pre-downloads every page & asset for offline use
│   └── start.cmd                  # One-click launcher (Windows)
│
├── netlify.toml                   # Netlify: publish dir, redirects, cache headers
├── vercel.json                    # Vercel: output directory
├── .vercelignore                  # Files excluded from Vercel uploads
├── .gitignore
├── package.json                   # npm scripts (start / precache)
└── README.md
```

Generated at runtime and deliberately kept **outside** the deploy root (git-ignored):

```text
.cache/                            # Origin cache written by scripts/server.mjs
├── index.json                     # URL -> cached file map
└── <mirrored paths>               # Anything not shipped in public/
```

### Why `media/`, `brand/`, `cursor/` and `_next/` keep their names

These are the paths **baked into the compiled HTML** (566 absolute references). They
also match the live origin's folder layout, which matters because Next.js image
requests (`/_next/image?url=%2Fmedia%2F...`) are proxied straight to the origin on
static hosts. Renaming them locally would break every image on the deployed site, so
they are intentionally left as the Next.js `public/` conventions dictate.

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18 or newer** (tested on v24). Nothing else.

### Run the site

```bash
npm start
```

Then open **http://localhost:4173**.

On Windows you can also double-click [`scripts/start.cmd`](scripts/start.cmd).

Stop the server with `Ctrl + C`.

### Make it fully offline

```bash
# terminal 1
npm start

# terminal 2
npm run precache
```

---

## npm scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `npm start` | `node scripts/server.mjs` | Serve the site at <http://localhost:4173> |
| `npm run precache` | `node scripts/precache.mjs` | Download all pages + assets for offline use |

Both accept environment overrides:

```bash
# PowerShell
$env:ORIGIN="https://example.com"; $env:PORT=8080; npm start
```

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `4173` | Port the local server listens on |
| `ORIGIN` | `https://puppy.instabizweb.com` | Upstream source for missing files |

---

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/puppies` | Available puppies |
| `/puppies/<slug>` | Individual puppy profile |
| `/gone-home` | Gone home (adopted) |
| `/happy-families` | Happy families |
| `/how-it-works` | How it works & delivery |
| `/faq` | FAQ |
| `/contact` | Visit & contact |

---

## How it works

`scripts/server.mjs` resolves every request in three steps:

1. **Origin cache** — look the URL up in `.cache/index.json` and stream the stored file.
2. **Committed file** — check `public/` for a file at the URL's natural path.
3. **Origin fallback** — fetch it from `ORIGIN`, save it under `.cache/`, index it, then serve it.

This keeps the repository a faithful, runnable copy of the site: a page or asset that
was never downloaded still loads, and is cached for next time — without ever adding
generated files to `public/`.

---

## Deployment

### Netlify

[`netlify.toml`](netlify.toml) is the single source of truth:

- `publish = "public"` — the deploy root.
- `/_next/image` is proxied to the live origin, which generates the real optimized
  images (static hosts ignore the `?url=` query string).
- A catch-all `/*` redirect proxies any path without a static file to the origin, so
  un-mirrored puppy profiles resolve correctly. Static files always win.
- Long-lived immutable cache headers for `/_next/static/*` and `/media/*`.

```bash
netlify deploy --prod --dir=public
```

### Vercel

[`vercel.json`](vercel.json) sets `outputDirectory` to `public`; `scripts/` is excluded
from uploads via [`.vercelignore`](.vercelignore).

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Site | Next.js (App Router) + Tailwind CSS |
| Fonts | Self-hosted `woff2` |
| Local tooling | Node.js `http` + built-in `fetch` (no external packages) |
| Hosting | Netlify (production) · Vercel (alternative) |

---

## Notes & limitations

- This is a **static capture** of the site. Content is rendered from the exported HTML;
  server-only features (forms backend, CMS, database) are not included.
- Enquiry, WhatsApp, Instagram, TikTok and Facebook links point to the live brand
  accounts and are intentionally left untouched.
- Puppy profile pages that were not mirrored are resolved through the origin fallback.
- `precache.mjs` may report a couple of non-critical `404`s for optional remote widgets;
  these do not affect the site.
- All brand names, imagery and media belong to their respective owner.

---

## Author

**Syed Sadain** — [@syed-sadain](https://github.com/syed-sadain)

Repository: [syed-sadain/Puppy--InstaBizWeb](https://github.com/syed-sadain/Puppy--InstaBizWeb)
