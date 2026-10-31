<div align="center">

<img src="puppy.instabizweb.com/brand/logo.png" alt="TeddyPups U.A.E." width="120" />

# TeddyPups U.A.E. — Puppy Website

**A premium teacup & teddy-bear puppy website (Dubai), packaged as a fully browsable local mirror.**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-3c873a?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Static Site](https://img.shields.io/badge/type-static%20site-4a90d9)](#)
[![No dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](#)

</div>

---

## Overview

This repository contains the complete **TeddyPups U.A.E.** website together with a tiny,
dependency-free Node.js server that lets you run the entire site locally with one command.

The site itself is a modern, animation-rich marketing experience (floating puppy mascots,
scroll scenes, a night/horizon theme) built with **Next.js** and **Tailwind CSS**. The
exported HTML, CSS, JavaScript, fonts and media are stored in [`puppy.instabizweb.com/`](puppy.instabizweb.com),
and [`server.mjs`](server.mjs) serves them over HTTP so everything renders exactly as in production.

> Why a server and not just opening `index.html`? The site uses **absolute asset paths**
> (`/_next/...`) and ES modules, which browsers block under the `file://` protocol. Serving it
> over `http://localhost` is what makes it work.

---

## Features

- **Zero dependencies** — no `npm install` required, only Node.js.
- **Self-healing mirror** — any file that is missing locally is fetched automatically from the live
  origin and cached to disk, so a new page or asset never 404s.
- **Offline ready** — after the assets are cached (already included in this repository, or via the
  pre-cache script) the site runs entirely without an internet connection.
- **All pages included** — home, available puppies, gone home, happy families, how it works, FAQ and contact.

---

## Project structure

```
puppy.instabizweb.com/            # project root
├── server.mjs                    # Local static server (origin fallback + disk cache)
├── precache.mjs                  # Downloads all pages + assets for offline use
├── start.cmd                     # One-click launcher (Windows)
├── package.json                  # npm scripts (start / precache)
├── .cache-index.json             # URL  ->  local file map used by server.mjs
└── puppy.instabizweb.com/        # The website itself
    ├── index.html                # Home page
    ├── puppies/                  # Available puppies              (/puppies)
    ├── gone-home/                # Adopted puppies                (/gone-home)
    ├── happy-families/           # Testimonials                   (/happy-families)
    ├── how-it-works/             # Process + delivery             (/how-it-works)
    ├── faq/                      # Frequently asked questions     (/faq)
    ├── contact/                  # Visit & contact                (/contact)
    ├── brand/                    # Logo
    ├── cursor/                   # Custom cursor assets
    ├── media/                    # Photos & videos
    └── _next/                    # Compiled CSS, JS, fonts & optimized images
```

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18 or newer** (tested on v24). Nothing else.

### Run the site

```bash
# Option 1 — with npm
npm start

# Option 2 — directly
node server.mjs
```

Then open **http://localhost:4173** in your browser.

On Windows you can also just **double-click `start.cmd`**.

To stop the server press `Ctrl + C` in the terminal window.

### Make it fully offline (optional)

The assets are already committed, but you can refresh/re-download the whole site at any time:

```bash
# terminal 1
node server.mjs

# terminal 2
npm run precache      # or:  node precache.mjs
```

---

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/puppies` | Available puppies |
| `/gone-home` | Gone home (adopted) |
| `/happy-families` | Happy families |
| `/how-it-works` | How it works & delivery |
| `/faq` | FAQ |
| `/contact` | Visit & contact |

---

## How it works

`server.mjs` resolves every request in three steps:

1. **Disk cache** — look the URL up in `.cache-index.json` and stream the stored file.
2. **Deterministic name** — check for a file at the URL's natural path.
3. **Origin fallback** — fetch it from `https://puppy.instabizweb.com`, save it to disk, add it to the
   index, then serve it.

That means the repository stays a faithful, runnable copy of the site, and no request ever breaks —
even for assets that were never downloaded before.

You can point the server at a different origin if needed:

```bash
# PowerShell
$env:ORIGIN="https://example.com"; $env:PORT=8080; node server.mjs
```

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Site | Next.js (App Router) + Tailwind CSS |
| Fonts | Self-hosted `woff2` (Fraunces & display faces) |
| Local tooling | Node.js `http` + built-in `fetch` (no external packages) |

---

## Notes & limitations

- This is a **static capture** of the site. Content is rendered from the exported HTML; server-only
  features (forms, CMS, database) are not included.
- Enquiry, WhatsApp, Instagram, TikTok and Facebook links point to the live brand accounts and are
  intentionally left untouched.
- `precache.mjs` may report a couple of non-critical `404`s for optional/remote widgets; these do not
  affect the site.
- All brand names, imagery and media belong to their respective owner.

---

## Author

**Syed Sadain** — [@syed-sadain](https://github.com/syed-sadain)

Repository: [syed-sadain/Puppy--InstaBizWeb](https://github.com/syed-sadain/Puppy--InstaBizWeb)
