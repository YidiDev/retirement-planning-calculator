# AGENTS.md

## Setup

Requires both Python 3.12+ and Node 22+.

```bash
python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
npm install
npx playwright install chromium   # needed for a11y tests
```

## Key Commands

```bash
npm run build          # prebuild inlines worker.js into index.html, then vite builds to dist/
npm run dev            # build + serve dist/ on :8080 (NOT vite dev server — no HMR)
npm test               # full suite: version, json, js, python, lint, vitest, a11y
npm run test:unit      # vitest only
npm run test:a11y      # build → preview → playwright axe check (mobile 375×812)
npm run lint           # eslint on src/ scripts/ tests/
npm run data:refresh   # download all 39 market sources via Python
```

## Critical Build Quirk

`scripts/inline-worker.mjs` runs as `prebuild` and **mutates `index.html`** by inlining `src/worker.js` (73KB of embedded market data) into the `<script id="worker-src">` tag. This means:

- `index.html` in the working tree contains the full inlined worker after any build
- The worker source of truth is `src/worker.js` — never edit the inlined block in `index.html`
- The `prebuild` hook runs automatically; don't skip it

## Architecture

Single-page app with client-side routing via Pinecone Router.

| File | Role |
|------|------|
| `index.html` | All HTML markup — Alpine.js directives, routes (`/`, `/privacy`, `/terms`) |
| `src/main.js` | Entry: registers Alpine plugin (PineconeRouter), GA4 init, Sentry init |
| `src/app.js` | Alpine `calculator` component: all state, computed, methods, URL sync |
| `src/worker.js` | Web Worker with embedded 1871–2023 market data and optimizer |
| `src/charts.js` | Chart.js rendering (income, preservation, spotlight) |
| `src/analytics.js` | GA4 custom events + `wireWatchers()` for Alpine `$watch` setup |
| `src/sentry.js` | Silent `@sentry/browser` init, no UI feedback |
| `src/pages/*.js` | Privacy/terms page content as functions returning HTML strings |
| `functions/_middleware.js` | Cloudflare Pages middleware: serves markdown when `Accept: text/markdown` |

## Things That Will Bite You

- **Alpine `x-show` overwrites `style`**: If you put `display:flex` in a static `style` attribute and also use `x-show`, Alpine replaces the entire style. Use `x-if` with a wrapper or put display in `:style`.
- **Alpine `:style` replaces, doesn't merge**: `:style="'width:50%'"` wipes static `style="background:red"`. Put all properties in the `:style` binding.
- **`src/worker.js` is NOT an ES module**: It's a plain script (Web Worker context). ESLint has a separate config block for it with `sourceType: 'script'` and worker globals (`onmessage`, `postMessage`).
- **Max file size**: Tests warn at ~350 lines per source file in `src/`. This is a guideline, not a hard rule. The goal is not to compress code to satisfy a line count. Clear is better than clever, and code should practice documentation through readable structure, names, and spacing. If a file is too long, prefer splitting cohesive pieces into clearly named files. If splitting would make the code worse, leave it well-spaced and readable instead. Use one statement per line, blank lines between logical sections, and descriptive variable names.
- **Three build-time defines**: `__APP_VERSION__` (from `VERSION` file), `__GA_MEASUREMENT_ID__`, `__SENTRY_DSN__` (from env vars). All three must be in the eslint globals.

## Branching

- Commit to `dev` for day-to-day work
- PRs into `staging` or `main` trigger auto version bump if `VERSION` isn't already higher
- `VERSION` file is plain `MAJOR.MINOR.PATCH` — bump it manually or let CI do it

## URL State

All calculator config syncs to query params. Only non-default values are written. `run=1` triggers auto-calculate on page load. The defaults are in `DEFAULTS` and `DEFAULT_PORTFOLIO` constants in `app.js`.

## Vite Is Dev-Only

Vite, Tailwind, and all build tooling are in `devDependencies`. The production `dist/` output contains zero Vite client code — just `index.html`, one JS bundle, one CSS bundle, and static assets from `public/`.

## Data Pipeline

Python scripts in the root collect market data. They're independent of the frontend build:

```bash
.venv/bin/python collect_market_data.py --refresh          # all 39 sources
.venv/bin/python collect_market_data.py --only sp500_price  # single source
```

Config is in `data_sources.json`. Output goes to `data/raw/` and `data/processed/` (gitignored).

## Testing

`npm test` runs this sequence and fails fast:
1. `check:version` — VERSION file is valid semver
2. `check:json` — data_sources.json has ≥20 valid entries, no duplicate IDs
3. `check:js` — `node --check` on all src/ files
4. `check:python` — `py_compile` on Python scripts
5. `lint` — ESLint
6. `test:unit` — Vitest (file structure, line counts, template exports)
7. `test:a11y` — Build → preview on :4173 → Playwright + axe on mobile viewport
