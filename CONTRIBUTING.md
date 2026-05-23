# Contributing

Thanks for your interest in contributing to the Retirement Withdrawal Calculator.

## Getting Started

1. Fork the repo and clone your fork
2. Set up the environment:
   ```bash
   python3 -m venv .venv
   . .venv/bin/activate
   pip install -r requirements.txt
   npm install
   npx playwright install chromium
   ```
3. Inline the worker and build:
   ```bash
   npm run build
   ```
4. Run the dev server (serves built bundle):
   ```bash
   npm run dev
   ```

## Development Workflow

- Work on the `dev` branch (or a feature branch off `dev`)
- PRs should target `dev` for features, `staging` for release candidates, `main` for hotfixes
- The CI will auto-bump the VERSION file if your PR doesn't include a version bump

## Running Tests

```bash
npm test
```

This runs: version check, data source validation, JS syntax check, Python compilation, ESLint, Vitest unit tests, and Playwright accessibility tests.

## Project Structure

```
index.html          Root HTML (Alpine.js markup)
src/
  main.js           Entry point (Alpine + styles)
  app.js            Alpine data component
  charts.js         Chart.js rendering
  analytics.js      GA4 event tracking
  sentry.js         Sentry error capture
  styles.css        Tailwind v4 + custom CSS
  worker.js         Web Worker with embedded market data
scripts/
  inline-worker.mjs Inlines worker.js into index.html at build
  ensure-version-bump.mjs  CI version enforcement
  version-utils.mjs Semver parsing/comparison
tests/
  calculator.test.js  Vitest unit tests
  a11y.mjs            Playwright + axe accessibility
  check-scripts.mjs   JS syntax validation
  check-data-sources.mjs  data_sources.json validation
```

## Code Style

- ESLint enforces style for all `src/` and `scripts/` files
- Max 320 lines per source file
- Use Alpine.js reactivity for all UI state
- No Vite artifacts in production output

## Adding Data Sources

Add a row to `data_sources.json` and run:
```bash
python collect_market_data.py --only your_new_id --refresh
```

## Reporting Issues

Open an issue on GitHub. Include:
- What you expected to happen
- What actually happened
- Browser and device info
- Screenshot if it's a visual issue
