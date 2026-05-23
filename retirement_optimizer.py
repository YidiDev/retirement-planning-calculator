"""
retirement_optimizer.py
-----------------------
Backtesting engine + optimizer for a dynamic retirement-withdrawal strategy.

THE STRATEGY
============
Every month the retiree may withdraw a *maximum* percentage of the current
portfolio. That maximum slides inside a band [a, b] based on last month's
market move:

    a  = the FLOOR        - lowest the (annualised) withdrawal rate can go.  (a > 4)
    b  = the CAP          - highest the rate can go.        (b > a, b - a < 5)
    x  = the SENSITIVITY  - what fraction (%) of last month's market move
                            feeds into this month's rate.   (x < 100)

For month t:
    raw_annual_rate% = x * return[t-1] * 12
    withdrawal_rate% = clamp(raw_annual_rate%, a, b)

THE NUMBER IS A CEILING, NOT A MANDATE. The backtest is worst-case: it assumes
the retiree always withdraws the full maximum.

OPTIMIZATION
============
Stage 1 - a coarse grid scan locates the right region.
Stage 2 - a refinement loop zooms in around the winner, shrinking the step 5x
          each pass, pinning a, b and x to 6-decimal precision.

REQUIREMENT TESTED: 50 years (600 months) after retirement begins, the
portfolio must still be worth at least its inflation-adjusted starting value,
tested against EVERY 50-year window in the 1871+ record.
"""

import numpy as np
import pandas as pd
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "sp500_monthly.csv")

WINDOW_YEARS = 50
WINDOW_MONTHS = WINDOW_YEARS * 12          # 600

# Constraints on the parameters.
MIN_A = 4.0          # a must exceed 4
MAX_DIFF = 5.0       # b - a must stay below 5

# Stage-1 coarse search grid.
A_GRID = np.round(np.arange(4.05, 9.01, 0.05), 2)
DELTA_GRID = np.round(np.arange(0.25, 5.00, 0.25), 2)
X_GRID = np.round(np.arange(5.0, 100.0, 5.0), 2)


def load_data():
    """Return (dates, monthly_total_return, cpi) as aligned numpy arrays."""
    df = pd.read_csv(DATA, parse_dates=["date"])
    return (df["date"].to_numpy(),
            df["monthly_total_return"].to_numpy(float),
            df["cpi"].to_numpy(float))


def withdrawal_rate_series(returns, a, b, x):
    """Annualised withdrawal-rate (%) permitted each month. rate[0] = NaN."""
    raw = np.empty_like(returns)
    raw[0] = np.nan
    raw[1:] = x * returns[:-1] * 12.0
    return np.clip(raw, a, b)


def monthly_growth_factors(returns, rate):
    """f[t] = (1 - rate[t]/100/12) * (1 + returns[t]); month 0 unused."""
    f = (1.0 - rate / 100.0 / 12.0) * (1.0 + returns)
    f[0] = 1.0
    return f


def evaluate(returns, cpi, a, b, x):
    """Test (a, b, x) against every 50-year window; return summary stats."""
    rate = withdrawal_rate_series(returns, a, b, x)
    f = monthly_growth_factors(returns, rate)
    log_cumprod = np.concatenate([[0.0], np.cumsum(np.log(f))])
    n = len(returns)
    starts = np.arange(1, n - WINDOW_MONTHS + 1)
    ends = starts + WINDOW_MONTHS - 1

    growth = np.exp(log_cumprod[ends + 1] - log_cumprod[starts])
    inflation = cpi[ends] / cpi[starts]
    passed = growth >= inflation
    return {
        "a": a, "b": b, "x": x,
        "n_windows": len(starts),
        "n_pass": int(passed.sum()),
        "pass_rate": float(passed.mean()),
        "mean_rate": float(np.nanmean(rate)),
        "starts": starts,
    }


def simulate_window(returns, cpi, rate, f, start, initial=1_000_000.0):
    """Full month-by-month simulation of one 50-year retirement window."""
    s = start
    months = np.arange(s, s + WINDOW_MONTHS)
    within = np.concatenate([[1.0], np.cumprod(f[s:s + WINDOW_MONTHS - 1])])
    value_start = initial * within
    nominal_withdrawal = rate[months] / 100.0 / 12.0 * value_start
    real_factor = cpi[s] / cpi[months]
    real_withdrawal = nominal_withdrawal * real_factor
    real_value = value_start * real_factor
    final_value = value_start[-1] * f[s + WINDOW_MONTHS - 1]
    final_real = final_value * cpi[s] / cpi[s + WINDOW_MONTHS - 1]
    return {
        "real_preservation_ratio": final_real / initial,
        "passed": final_real >= initial - 1e-6,
        "avg_annual_real_income": float(real_withdrawal.sum() / WINDOW_YEARS),
        "first_year_real_income": float(real_withdrawal[:12].sum()),
        "min_real_value": float(real_value.min()),
        "min_annual_real_income": float(real_withdrawal.min() * 12),
    }


def _better(r, cur):
    """Lexicographic: higher pass rate, then more income (mean rate)."""
    if r["pass_rate"] > cur["pass_rate"] + 1e-12:

        return True
    if r["pass_rate"] < cur["pass_rate"] - 1e-12:
        return False
    return r["mean_rate"] > cur["mean_rate"]


def optimize(returns, cpi):
    """Stage 1: coarse grid-search (a, b, x); return all results best-first."""
    results = []
    for a in A_GRID:
        for d in DELTA_GRID:
            b = round(float(a) + float(d), 2)
            for x in X_GRID:
                results.append(evaluate(returns, cpi, float(a), b, float(x)))
    results.sort(key=lambda r: (r["pass_rate"], r["mean_rate"], r["a"], r["b"]),
                 reverse=True)
    return results



def refine(returns, cpi, seed, min_a=MIN_A, max_diff=MAX_DIFF):
    """Stage 2: zoom in around a seed, shrinking the step 5x each pass, until
    a, b and x are pinned to better than 1e-6 precision."""
    a, d, x = seed["a"], seed["b"] - seed["a"], seed["x"]
    ha, hd, hx = 0.05, 0.25, 5.0
    best = evaluate(returns, cpi, a, a + d, x)
    ba, bd, bx = a, d, x
    while hx > 1e-6:
        ha, hd, hx = ha / 5, hd / 5, hx / 5
        for i in range(-5, 6):
            ca = max(min_a, a + i * ha)
            for j in range(-5, 6):
                cd = min(max_diff, max(1e-6, d + j * hd))
                for k in range(-5, 6):
                    cx = min(99.999999, max(1e-6, x + k * hx))
                    r = evaluate(returns, cpi, ca, ca + cd, cx)
                    if _better(r, best):
                        best, ba, bd, bx = r, ca, cd, cx
        a, d, x = ba, bd, bx
    # Round DOWN: a result that withdraws slightly less is always at least
    # as safe, so the reported 6-decimal values never tip a boundary window.
    a = math.floor(a * 1e6) / 1e6
    d = max(1e-6, math.floor(d * 1e6) / 1e6)
    b = round(a + d, 6)
    x = math.floor(x * 1e6) / 1e6
    return evaluate(returns, cpi, a, b, x)


def detailed_windows(dates, returns, cpi, a, b, x):
    """Run every 50-year window at (a, b, x); return a DataFrame of outcomes."""
    rate = withdrawal_rate_series(returns, a, b, x)
    f = monthly_growth_factors(returns, rate)
    starts = np.arange(1, len(returns) - WINDOW_MONTHS + 1)
    rows = []
    for s in starts:
        out = simulate_window(returns, cpi, rate, f, int(s))
        rows.append({
            "start": np.datetime_as_string(dates[s], unit="M"),
            "end": np.datetime_as_string(dates[s + WINDOW_MONTHS - 1], unit="M"),
            "real_preservation_ratio": round(out["real_preservation_ratio"], 4),
            "passed": out["passed"],
            "first_year_real_income_per_1M": round(out["first_year_real_income"], 0),
            "avg_annual_real_income_per_1M": round(out["avg_annual_real_income"], 0),
            "min_annual_real_income_per_1M": round(out["min_annual_real_income"], 0),
            "min_real_value_per_1M": round(out["min_real_value"], 0),
        })
    return pd.DataFrame(rows)


def report(label, r, dates, returns, cpi, write_csv=None):
    """Print a full report for one parameter set and optionally save windows."""
    print("=" * 72)
    print(label)
    print("=" * 72)
    print(f"  a (withdrawal floor) : {r['a']:.6f}%  per year")
    print(f"  b (withdrawal cap)   : {r['b']:.6f}%  per year")
    print(f"  x (sensitivity)      : {r['x']:.6f}")
    print(f"  band width (b - a)   : {r['b'] - r['a']:.6f}  (constraint: < 5)")
    print(f"  windows preserving capital : {r['n_pass']} / {r['n_windows']}  "
          f"({r['pass_rate'] * 100:.2f}%)")
    print(f"  average permitted withdrawal rate : {r['mean_rate']:.4f}% / year")
    print()
    wins = detailed_windows(dates, returns, cpi, r["a"], r["b"], r["x"])
    if write_csv:
        wins.to_csv(write_csv, index=False)
    worst = wins.nsmallest(8, "real_preservation_ratio")
    print("  8 worst-case retirement start dates:")
    print(f"  {'start':>9} -> {'end':>9} | {'end real/start':>14} | "
          f"{'yr-1 income/1M':>16} | pass")
    for _, w in worst.iterrows():
        inc = f"${w['first_year_real_income_per_1M']:,.0f}"
        print(f"  {w['start']:>9} -> {w['end']:>9} | "
              f"{w['real_preservation_ratio'] * 100:12.1f}%  | {inc:>16} | "
              f"{'YES' if w['passed'] else 'NO'}")
    print()
    print(f"  income range across all {len(wins)} windows (per $1,000,000):")
    print(f"    first-year income  : "
          f"${wins['first_year_real_income_per_1M'].min():,.0f} - "
          f"${wins['first_year_real_income_per_1M'].max():,.0f}")
    print(f"    50-year avg income : "
          f"${wins['avg_annual_real_income_per_1M'].min():,.0f} - "
          f"${wins['avg_annual_real_income_per_1M'].max():,.0f}  "
          f"(rises over time as the portfolio grows)")
    if write_csv:
        print(f"  per-window detail -> {os.path.basename(write_csv)}")
    print()
    return wins


def main():
    dates, returns, cpi = load_data()
    print("=" * 72)
    print("RETIREMENT WITHDRAWAL OPTIMIZER")
    print("=" * 72)
    print(f"Data         : {np.datetime_as_string(dates[0], unit='M')} to "
          f"{np.datetime_as_string(dates[-1], unit='M')}  ({len(returns)} months; "
          f"CPI inflation present for every month)")
    n_windows = len(returns) - WINDOW_MONTHS
    print(f"Test windows : {n_windows} overlapping {WINDOW_YEARS}-year retirements")
    print(f"Requirement  : real portfolio value after {WINDOW_YEARS}y >= real "
          f"value at start")
    print("Assumption   : retiree withdraws the FULL permitted maximum every "
          "month (worst case)")
    print()

    results = optimize(returns, cpi)

    print("STAGE-1 COARSE FRONTIER  (best strategy at each pass-rate level)")
    print("-" * 72)
    print(f"{'pass rate':>10} | {'avg withdrawal':>15} | {'a floor':>8} | "
          f"{'b cap':>7} | {'band':>6} | {'x':>4}")
    seen = set()
    for r in results:
        bucket = round(r["pass_rate"], 4)
        if bucket in seen:
            continue
        seen.add(bucket)
        print(f"{r['pass_rate'] * 100:9.2f}% | {r['mean_rate']:14.2f}%  | "
              f"{r['a']:7.2f}% | {r['b']:6.2f}% | {r['b'] - r['a']:6.2f} | "
              f"{r['x']:4.0f}")
        if len(seen) >= 12:
            break
    print()

    print("Stage 2: refining a, b and x to 6-decimal precision ...")
    print()
    best = refine(returns, cpi, results[0])

    report("OPTIMAL STRATEGY (most income at the best achievable pass rate)",
           best, dates, returns, cpi,
           write_csv=os.path.join(HERE, "window_results.csv"))

    print("=" * 72)
    print("NOTES")
    print("=" * 72)
    print(f"* OPTIMAL ANSWER:  a = {best['a']:.6f}% , b = {best['b']:.6f}% , "
          f"x = {best['x']:.6f}")
    print(f"  Preserves real capital in {best['n_pass']}/{best['n_windows']} "
          f"historical 50-year retirements.")
    print("* a, b and x are refined to 6-decimal precision: the reported values")
    print("  sit exactly on the boundary where the pass rate would otherwise")
    print("  drop - the most income the strategy can safely allow.")
    print("* A wider or higher band can NEVER raise the pass rate: taking more")
    print("  after good months only spends the safety buffer.")
    print("* Every number is a CEILING. Spending less than the maximum is")
    print("  strictly safer than this backtest shows.")


if __name__ == "__main__":
    main()
