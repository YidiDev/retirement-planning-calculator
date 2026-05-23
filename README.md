# Retirement Withdrawal Calculator

A flexible, market-aware retirement withdrawal calculator stress-tested against 150+ years of real U.S. market history. Built with Alpine.js, Chart.js, Tailwind CSS v4, and a Web Worker-based simulation engine.

[Try it live](https://yididev.github.io/retirement-planning-calculator/) | [Report an issue](https://github.com/YidiDev/retirement-planning-calculator/issues)

## What It Does

Set your savings, timeline, portfolio mix, and withdrawal rules. The calculator replays your plan through every starting month since 1871 and reports how it would have held up. Results include monthly income estimates, success rates, interactive charts, and a full historical period table.

## Quick Start

```bash
# Clone
git clone https://github.com/YidiDev/retirement-planning-calculator.git
cd retirement-planning-calculator

# Python environment (for data collection)
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt

# Node environment (for build and tests)
npm install

# Build and serve
npm run build
npm run dev
```

Open `http://localhost:8080` in your browser.

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Build and serve from `dist/` on port 8080 |
| `npm run build` | Production build to `dist/` |
| `npm run build:prod` | Refresh market data + production build |
| `npm test` | Run all checks, unit tests, and accessibility tests |
| `npm run data:refresh` | Download latest market data from Yahoo/FRED |

## Environment Variables

Copy `.env.example` and fill in values before deploying:

| Variable | Purpose |
|----------|---------|
| `GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID |
| `SENTRY_DSN` | Sentry error tracking DSN |
| `FRED_API_KEY` | Optional FRED API key for data collection |

## Architecture

```
index.html            Alpine.js markup (warm paper design)
src/
  main.js             Entry: Alpine + Sentry + GA init
  app.js              Calculator Alpine component (state, methods, workers)
  charts.js           Chart.js rendering (income, preservation, spotlight)
  analytics.js        GA4 custom event tracking (30+ events)
  sentry.js           Silent Sentry error capture
  styles.css          Tailwind v4 + Newsreader/Source Sans 3 design system
  worker.js           Web Worker with embedded 1871-2023 market data
```

**Build pipeline:** Vite builds `src/` into a single JS bundle + CSS bundle in `dist/`. The worker source is inlined into `index.html` at build time. No Vite client code ships to production.

**Data pipeline:** `collect_market_data.py` pulls from Yahoo Finance and FRED into `data/raw/` and normalizes to `data/processed/`. 39 sources across U.S. equities, bonds, gold, REITs, international, and CPI.

## Data Sources

The calculator's embedded simulation uses three historical return streams:
- **U.S. Equity** — S&P 500 total return (monthly, since 1871)
- **Treasury Bonds** — 10-year constant maturity (monthly, since 1871)
- **Gold** — free-market era (monthly, 1968+)
- **Inflation** — CPI-U for real-return calculations

The portfolio builder maps user-selected assets into these sleeves. The data collection pipeline supports 39 additional sources for future modeling.

## Versioning

The project uses a `VERSION` file with semver (`MAJOR.MINOR.PATCH`). PRs into `staging` or `main` auto-bump the patch version if the incoming branch hasn't already bumped it.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and development workflow.

## Security

See [SECURITY.md](SECURITY.md) for supported versions and vulnerability reporting instructions.

## License

[MIT](LICENSE)

## Disclaimer

This calculator is an educational tool. It replays historical data and does not predict future market performance. It is not financial advice. Consult a qualified financial advisor for personal retirement planning.
