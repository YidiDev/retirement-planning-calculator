"""
Collect and normalize market data for retirement backtesting.

The collector is intentionally configuration-driven. Add symbols to
data_sources.json instead of hard-coding more tickers in this script.
"""

from __future__ import annotations

import argparse
import io
import json
import os
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import pandas as pd
import requests
import yfinance as yf


HERE = Path(__file__).resolve().parent
CONFIG = HERE / "data_sources.json"
RAW_DIR = HERE / "data" / "raw"
PROCESSED_DIR = HERE / "data" / "processed"
CATALOG = HERE / "data" / "catalog.json"
FRED_OBSERVATIONS_URL = "https://api.stlouisfed.org/fred/series/observations"
FRED_CSV_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv"


@dataclass(frozen=True)
class Source:
    id: str
    name: str
    group: str
    source: str
    asset_class: str
    return_type: str
    notes: str = ""
    ticker: str | None = None
    series_id: str | None = None

    @classmethod
    def from_dict(cls, row: dict[str, Any]) -> "Source":
        return cls(**row)


def load_sources(config_path: Path = CONFIG) -> list[Source]:
    with config_path.open("r", encoding="utf-8") as fh:
        payload = json.load(fh)
    return [Source.from_dict(row) for row in payload["symbols"]]


def ensure_dirs() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def _utc_now() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat()


def _clean_date_index(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    out = df.copy()
    out.index = pd.to_datetime(out.index).tz_localize(None)
    out = out.sort_index()
    out = out[~out.index.duplicated(keep="last")]
    return out


def fetch_yahoo(src: Source, start: str | None, end: str | None) -> pd.DataFrame:
    if not src.ticker:
        raise ValueError(f"{src.id} is missing ticker")
    df = yf.download(
        src.ticker,
        start=start,
        end=end,
        auto_adjust=False,
        progress=False,
        threads=False,
    )
    df = _clean_date_index(df)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [c[0] for c in df.columns]
    keep = [c for c in ["Open", "High", "Low", "Close", "Adj Close", "Volume"] if c in df.columns]
    return df[keep]


def fetch_fred(src: Source, start: str | None, end: str | None, api_key: str | None) -> pd.DataFrame:
    if not src.series_id:
        raise ValueError(f"{src.id} is missing series_id")
    if not api_key:
        resp = requests.get(FRED_CSV_URL, params={"id": src.series_id}, timeout=60)
        resp.raise_for_status()
        df = pd.read_csv(io.StringIO(resp.text))
        date_col = "observation_date" if "observation_date" in df.columns else "DATE"
        value_col = src.series_id
        df["date"] = pd.to_datetime(df[date_col])
        df["value"] = pd.to_numeric(df[value_col].replace(".", pd.NA), errors="coerce")
        if start:
            df = df[df["date"] >= pd.Timestamp(start)]
        if end:
            df = df[df["date"] <= pd.Timestamp(end)]
        return _clean_date_index(df.dropna(subset=["value"]).set_index("date")[["value"]])
    params = {
        "series_id": src.series_id,
        "file_type": "json",
        "observation_start": start or "1776-07-04",
    }
    if end:
        params["observation_end"] = end
    if api_key:
        params["api_key"] = api_key
    resp = requests.get(FRED_OBSERVATIONS_URL, params=params, timeout=60)
    resp.raise_for_status()
    rows = resp.json().get("observations", [])
    df = pd.DataFrame(rows)
    if df.empty:
        return pd.DataFrame(columns=["value"])
    df["date"] = pd.to_datetime(df["date"])
    df["value"] = pd.to_numeric(df["value"].replace(".", pd.NA), errors="coerce")
    df = df.dropna(subset=["value"]).set_index("date")[["value"]]
    return _clean_date_index(df)


def raw_path(src: Source) -> Path:
    return RAW_DIR / f"{src.id}.csv"


def processed_path(src: Source) -> Path:
    return PROCESSED_DIR / f"{src.id}_monthly.csv"


def save_raw(src: Source, df: pd.DataFrame) -> None:
    out = df.copy()
    out.index.name = "date"
    out.to_csv(raw_path(src))


def load_raw(src: Source) -> pd.DataFrame:
    path = raw_path(src)
    if not path.exists():
        return pd.DataFrame()
    return pd.read_csv(path, parse_dates=["date"]).set_index("date")


def value_column(src: Source, df: pd.DataFrame) -> pd.Series:
    if df.empty:
        return pd.Series(dtype="float64", name="value")
    if src.source == "yahoo":
        col = "Adj Close" if "Adj Close" in df.columns else "Close"
    else:
        col = "value"
    values = pd.to_numeric(df[col], errors="coerce").dropna()
    values.name = "value"
    return values


def to_monthly(src: Source, raw: pd.DataFrame) -> pd.DataFrame:
    values = value_column(src, raw)
    if values.empty:
        return pd.DataFrame(columns=["date", "value", "monthly_return", "total_return_index"])
    monthly = values.resample("ME").last().dropna().to_frame()
    monthly["monthly_return"] = monthly["value"].pct_change()
    monthly["total_return_index"] = (1 + monthly["monthly_return"].fillna(0)).cumprod()
    monthly.index.name = "date"
    monthly = monthly.reset_index()
    monthly["date"] = monthly["date"].dt.date.astype(str)
    return monthly[["date", "value", "monthly_return", "total_return_index"]]


def collect_one(src: Source, start: str | None, end: str | None, fred_key: str | None, refresh: bool) -> dict[str, Any]:
    cached = load_raw(src)
    status = "cached"
    error = None
    raw = cached
    if refresh or cached.empty:
        try:
            if src.source == "yahoo":
                raw = fetch_yahoo(src, start, end)
            elif src.source == "fred":
                raw = fetch_fred(src, start, end, fred_key)
            else:
                raise ValueError(f"Unsupported source {src.source!r}")
            save_raw(src, raw)
            status = "downloaded"
        except Exception as exc:  # keep a partial catalog when one source fails
            error = str(exc)
            raw = cached
            status = "failed_cached" if not cached.empty else "failed"
    monthly = to_monthly(src, raw)
    if not monthly.empty:
        monthly.to_csv(processed_path(src), index=False)
    return {
        "id": src.id,
        "name": src.name,
        "group": src.group,
        "source": src.source,
        "symbol": src.ticker or src.series_id,
        "asset_class": src.asset_class,
        "return_type": src.return_type,
        "raw_path": str(raw_path(src).relative_to(HERE)),
        "monthly_path": str(processed_path(src).relative_to(HERE)),
        "rows_raw": int(len(raw)),
        "rows_monthly": int(len(monthly)),
        "first_month": None if monthly.empty else monthly["date"].iloc[0],
        "last_month": None if monthly.empty else monthly["date"].iloc[-1],
        "status": status,
        "error": error,
        "notes": src.notes,
    }


def write_catalog(entries: list[dict[str, Any]]) -> None:
    payload = {"generated_at": _utc_now(), "series": entries}
    CATALOG.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Collect market data for retirement backtests.")
    parser.add_argument("--start", default="1871-01-01", help="Start date for downloads when supported.")
    parser.add_argument("--end", default=None, help="End date for downloads when supported.")
    parser.add_argument("--config", type=Path, default=CONFIG, help="Path to data source config JSON.")
    parser.add_argument("--only", nargs="*", default=None, help="Optional source ids to collect.")
    parser.add_argument("--refresh", action="store_true", help="Refresh downloads even when raw cache exists.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    ensure_dirs()
    fred_key = os.environ.get("FRED_API_KEY")
    sources = load_sources(args.config)
    if args.only:
        wanted = set(args.only)
        sources = [src for src in sources if src.id in wanted]
        missing = wanted - {src.id for src in sources}
        if missing:
            raise SystemExit(f"Unknown source id(s): {', '.join(sorted(missing))}")
    entries = []
    for src in sources:
        entry = collect_one(src, args.start, args.end, fred_key, args.refresh)
        entries.append(entry)
        symbol = entry["symbol"] or entry["id"]
        print(f"{entry['status']:>14} {src.id:<32} {symbol:<16} monthly_rows={entry['rows_monthly']}")
        if entry["error"]:
            print(f"  error: {entry['error']}")
    write_catalog(entries)
    print(f"catalog -> {CATALOG.relative_to(HERE)}")


if __name__ == "__main__":
    main()
