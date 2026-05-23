# Retirement Planning Calculator

A retirement withdrawal calculator and backtesting toolkit. The repo contains a browser-based calculator plus Python scripts for collecting market data, building monthly datasets, and running optimization experiments.

## What Is Here

- `retirement_calculator.html`: standalone calculator UI with an embedded Web Worker.
- `collect_market_data.py`: configurable market-data collector for Yahoo Finance and FRED.
- `data_sources.json`: the asset universe to collect.
- `build_dataset.py`: legacy Shiller dataset cleaner for the original S&P 500-only workflow.
- `retirement_optimizer.py`: legacy optimizer/backtester for the original monthly S&P 500 dataset.

## Data Coverage

The new collection pipeline starts with these groups:

- S&P 500 headline, total return, equal weight, style/factor, dividend, and sector ETF/index proxies.
- Full-market indexes and ETF proxies, including Wilshire 5000, VTI, ITOT, IWV, IWB, and SCHB.
- REIT data, including broad U.S., international, and residential/specialized proxies.
- Bonds, gold, international developed markets, emerging markets, and CPI.

Most investable variants use ETF adjusted-close data because official long-run total-return index licensing is limited. The config marks those rows as ETF proxies and records shorter history where relevant.

## Setup

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

## Collect Market Data

Collect everything in `data_sources.json`:

```bash
python collect_market_data.py --refresh
```

Collect only specific series:

```bash
python collect_market_data.py --only sp500_price total_us_market_vti us_reit_vnq cpi_us --refresh
```

Outputs:

- `data/raw/<id>.csv`: raw source pull.
- `data/processed/<id>_monthly.csv`: month-end normalized values, monthly returns, and a normalized index.
- `data/catalog.json`: generated metadata, row counts, first/last month, and any source errors.

FRED works through its public CSV endpoint by default. If you want to use the FRED API, set `FRED_API_KEY` before running the collector.

## Add More Data Sources

Add a row to `data_sources.json` with:

- `id`: stable machine-readable id.
- `name`: human-readable name.
- `group`: category such as `s_and_p_500`, `full_market_indexes`, or `reits`.
- `source`: `yahoo` or `fred`.
- `ticker` or `series_id`: source symbol.
- `asset_class`, `return_type`, and `notes`: metadata for downstream modeling.

Then run:

```bash
python collect_market_data.py --only your_new_id --refresh
```

## Legacy S&P 500 Workflow

The older workflow expects a manually downloaded Shiller file:

```bash
python build_dataset.py
python retirement_optimizer.py
```

Those scripts expect `shiller_raw.csv` and generate `sp500_monthly.csv` / `window_results.csv`. Generated CSVs are ignored by git.

## Notes

- Historical backtests are educational and are not financial advice.
- Yahoo and FRED availability can change. Check `data/catalog.json` after each run for failed or shortened series.
- For retirement modeling, prefer total-return or adjusted-close series over price-only indexes when possible.
