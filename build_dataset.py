"""
build_dataset.py
----------------
Step 1 of the retirement calculator: turn raw historical market data into a
clean monthly dataset the optimizer can consume.

INPUT  : shiller_raw.csv   (Robert Shiller's long-run U.S. stock-market dataset,
                             as mirrored by the GitHub `datasets/s-and-p-500`
                             project: monthly S&P 500 price, dividends, earnings
                             and the CPI inflation index, back to 1871.)

OUTPUT : sp500_monthly.csv  (one clean row per month with everything the
                             backtester needs.)

WHY TOTAL RETURN, NOT PRICE
---------------------------
A retiree's portfolio earns dividends as well as price appreciation. Ignoring
dividends understates real growth by roughly 2%/year, which would badly distort
a 50-year backtest. So we reconstruct a *total-return index* (dividends
reinvested) using the standard Shiller method:

    monthly_total_return_t = (Price_t + Dividend_t / 12) / Price_(t-1) - 1

where `Dividend` is the trailing 12-month dividend, so dividing by 12 gives the
dividend earned during that single month.

INFLATION
---------
The `Consumer Price Index` column is used directly. Any month's purchasing
power is comparable to another month's via the ratio of their CPI values.
"""

import pandas as pd
import numpy as np
import os

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "shiller_raw.csv")
OUT = os.path.join(HERE, "sp500_monthly.csv")


def main():
    df = pd.read_csv(RAW)

    # Standard, friendlier column names.
    df = df.rename(columns={
        "Date": "date",
        "SP500": "sp500_price",
        "Dividend": "dividend_annual",
        "Consumer Price Index": "cpi",
    })[["date", "sp500_price", "dividend_annual", "cpi"]]

    df["date"] = pd.to_datetime(df["date"])

    # The raw mirror pads not-yet-reported months with 0.0 for dividends and
    # CPI. Treat those zeros as missing and keep only the fully-populated span.
    for col in ("sp500_price", "dividend_annual", "cpi"):
        df.loc[df[col] == 0.0, col] = np.nan

    usable = df.dropna(subset=["sp500_price", "dividend_annual", "cpi"]).copy()
    usable = usable.sort_values("date").reset_index(drop=True)

    # --- Reconstruct the monthly total return (dividends reinvested) ---------
    prev_price = usable["sp500_price"].shift(1)
    monthly_dividend = usable["dividend_annual"] / 12.0
    usable["monthly_total_return"] = (
        (usable["sp500_price"] + monthly_dividend) / prev_price - 1.0
    )
    # First month has no prior price -> no return; drop it so every row is real.
    usable = usable.dropna(subset=["monthly_total_return"]).reset_index(drop=True)

    # Total-return index, normalised to 1.0 at the start of the series.
    usable["total_return_index"] = (
        1.0 + usable["monthly_total_return"]
    ).cumprod()

    out = usable[[
        "date", "sp500_price", "dividend_annual", "cpi",
        "monthly_total_return", "total_return_index",
    ]]
    out.to_csv(OUT, index=False)

    # --- Integrity report ----------------------------------------------------
    n = len(out)
    span_years = (out["date"].iloc[-1] - out["date"].iloc[0]).days / 365.25
    gaps = out["date"].diff().dropna().dt.days
    print(f"Wrote {OUT}")
    print(f"  months          : {n}")
    print(f"  span            : {out['date'].iloc[0].date()} -> "
          f"{out['date'].iloc[-1].date()}  ({span_years:.1f} years)")
    print(f"  month gap range : {gaps.min()}-{gaps.max()} days "
          f"(28-31 = no gaps)")
    print(f"  monthly return  : min {out['monthly_total_return'].min():+.2%}  "
          f"max {out['monthly_total_return'].max():+.2%}  "
          f"mean {out['monthly_total_return'].mean():+.3%}")
    annualised = (1 + out["monthly_total_return"].mean()) ** 12 - 1
    print(f"  => annualised nominal total return : {annualised:.2%}")
    cpi_growth = (out["cpi"].iloc[-1] / out["cpi"].iloc[0]) ** (1 / span_years) - 1
    print(f"  => annualised inflation (CPI)      : {cpi_growth:.2%}")
    complete_windows = n - 600
    print(f"  complete 50-year (600-month) windows available : {complete_windows}")


if __name__ == "__main__":
    main()
