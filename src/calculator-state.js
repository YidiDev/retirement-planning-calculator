export const PARAM_KEYS = ['savings', 'years', 'goalPreset', 'retainPct', 'strategyPreset',
  'floorMode', 'minFloorPct', 'minIncome', 'capMode', 'maxCapPct', 'maxIncome',
  'lookback', 'recalc'];

export const NUM_KEYS = new Set(['savings', 'years', 'retainPct', 'minFloorPct', 'minIncome',
  'maxCapPct', 'maxIncome', 'lookback', 'recalc']);

export const DEFAULTS = {
  savings: 1000000,
  years: 30,
  goalPreset: 'spend',
  retainPct: 0,
  strategyPreset: 'balanced',
  floorMode: 'usd',
  minFloorPct: 4,
  minIncome: 3000,
  capMode: 'usd',
  maxCapPct: 6,
  maxIncome: 6000,
  lookback: 12,
  recalc: 12,
};

export const DEFAULT_PORTFOLIO = [
  { id: 'total_us_market_vti', weight: 60 },
  { id: 'ten_year_treasury_yield', weight: 40 },
];

const ASSET_SLEEVES = {
  sp500_price: 'sp',
  sp500_total_return: 'sp',
  sp500_equal_weight: 'sp',
  sp500_growth: 'sp',
  sp500_value: 'sp',
  sp500_quality: 'sp',
  sp500_momentum: 'sp',
  sp500_dividend_aristocrats: 'sp',
  total_us_market_vti: 'sp',
  russell_3000_iwv: 'sp',
  wilshire_5000_yahoo: 'sp',
  us_reit_vnq: 'sp',
  us_reit_iyr: 'sp',
  developed_ex_us_efa: 'sp',
  emerging_markets_eem: 'sp',
  total_bond_market_bnd: 'bd',
  ten_year_treasury_yield: 'bd',
  gold_gld: 'gd',
  gold_futures_yahoo: 'gd',
};

export function parseCalculatorSearch(search) {
  const params = new URLSearchParams(search || '');
  const state = { ...DEFAULTS, portfolio: DEFAULT_PORTFOLIO.map(item => ({ ...item })) };

  for (const key of PARAM_KEYS) {
    if (!params.has(key)) continue;
    state[key] = NUM_KEYS.has(key) ? parseFloat(params.get(key)) : params.get(key);
  }

  if (params.has('portfolio')) {
    try {
      const portfolio = JSON.parse(params.get('portfolio'));
      if (Array.isArray(portfolio)) {
        state.portfolio = portfolio;
      }
    } catch (error) {
      void error;
    }
  }

  state._autoRun = params.has('run');
  state._hasQuery = Array.from(params.keys()).length > 0;

  return state;
}

export function getSleeves(portfolio) {
  const sleeves = { sp: 0, bd: 0, gd: 0, total: 0 };

  for (const item of portfolio || []) {
    const sleeve = ASSET_SLEEVES[item.id];
    const weight = Math.max(0, parseFloat(item.weight) || 0);
    if (!sleeve) continue;
    sleeves[sleeve] += weight;
    sleeves.total += weight;
  }

  return sleeves;
}

export function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function buildAnalysisInput(state) {
  const sleeves = getSleeves(state.portfolio);

  if (sleeves.sp + sleeves.bd + sleeves.gd <= 0) {
    sleeves.sp = 100;
    sleeves.total = 100;
  }

  return {
    type: 'run',
    floorMode: state.floorMode,
    capMode: state.capMode,
    years: clamp(state.years, 5, 100),
    minA: clamp(state.minFloorPct, 4, 10),
    dollarFloor: Math.max(0, state.minIncome),
    pctFloor: clamp(state.minFloorPct, 0, 12),
    pctCap: clamp(state.maxCapPct, 0.5, 40),
    dollarCap: Math.max(0, state.maxIncome),
    lookback: clamp(Math.round(state.lookback), 1, 120),
    recalc: clamp(Math.round(state.recalc), 1, 120),
    nestEgg: Math.max(1000, state.savings),
    retain: clamp(state.retainPct, 0, 300),
    wSp: sleeves.sp,
    wBond: sleeves.bd,
    wGold: sleeves.gd,
  };
}

export function money(value) {
  return '$' + Math.round(value).toLocaleString('en-US');
}

export function median(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function passLabel(result) {
  if (result.n_pass >= result.n_windows) return '100%';
  const label = (result.n_pass / result.n_windows * 100).toFixed(1);
  return label === '100.0' ? '99.9%' : label + '%';
}

export function renderIndexMarkdown(state, analysis = null) {
  if (!state._hasQuery) {
    return `# Retirement Withdrawal Calculator

A flexible retirement withdrawal calculator stress-tested against 150+ years of real U.S. market history.

## What it does

Set savings, retirement length, portfolio mix, and withdrawal rules. The calculator replays the plan through every starting month since 1871 and reports how it would have held up.

## Agent Instructions

This endpoint supports machine-readable markdown. Request it with \`Accept: text/markdown\`.

Use query parameters to describe a retirement plan:

- \`savings\`: starting nest egg in dollars, for example \`1000000\`
- \`years\`: retirement length, clamped to 5-100
- \`retainPct\`: percent of starting capital to preserve, for example \`0\`, \`50\`, or \`100\`
- \`strategyPreset\`: \`stocks\`, \`balanced\`, \`conservative\`, or \`custom\`
- \`portfolio\`: JSON array of \`{ "id": string, "weight": number }\` entries for custom allocations
- \`floorMode\`: \`usd\`, \`pct\`, or \`both\`
- \`minIncome\`: monthly dollar floor when the floor uses dollars
- \`minFloorPct\`: annual percentage floor when the floor uses percent
- \`capMode\`: \`usd\`, \`pct\`, or \`both\`
- \`maxIncome\`: monthly dollar cap when the cap uses dollars
- \`maxCapPct\`: annual percentage cap when the cap uses percent
- \`lookback\`: trailing return lookback in months
- \`recalc\`: withdrawal recalculation interval in months
- \`run=1\`: run the historical analysis and include computed results in this markdown response

Example:

\`/?savings=1200000&years=35&retainPct=25&minIncome=3500&maxIncome=7000&run=1\`

## Data

- U.S. equity returns: monthly historical market data
- Treasury bonds: monthly historical bond model data
- Gold: free-market era monthly data
- Inflation: CPI-U for real-return calculations

## Links

- [Privacy Policy](/privacy)
- [Terms of Use](/terms)
- [Support the Project](https://github.com/sponsors/YidiDev)
- [Source Code](https://github.com/YidiDev/retirement-planning-calculator)

MIT License. Not financial advice.
`;
  }

  const sleeves = getSleeves(state.portfolio);
  const total = sleeves.total || 1;
  let markdown = `# Retirement Withdrawal Calculator

## Requested Plan

- Savings: ${money(state.savings)}
- Retirement length: ${state.years} years
- Capital retention goal: ${state.retainPct}%
- Strategy preset: ${state.strategyPreset}
- Portfolio sleeves: ${Math.round(sleeves.sp / total * 100)}% stocks, ${Math.round(sleeves.bd / total * 100)}% bonds, ${Math.round(sleeves.gd / total * 100)}% gold
- Income floor: ${state.floorMode === 'usd' ? money(state.minIncome) + '/mo' : state.minFloorPct + '%/yr'}
- Income cap: ${state.capMode === 'usd' ? money(state.maxIncome) + '/mo' : state.maxCapPct + '%/yr'}
- Lookback: ${state.lookback} months
- Recalculation interval: ${state.recalc} months
`;

  if (!state._autoRun) {
    return markdown + `
## Results

Analysis was not run. Add \`run=1\` to the query string to include computed historical results.
`;
  }

  const result = analysis.best;
  const rows = analysis.rows || [];
  const worst = rows.reduce((current, row) => row.endRatio < current.endRatio ? row : current, rows[0]);
  const typicalMonthly = rows.length ? money(median(rows.map(row => row.firstYearReal)) / 12) : '$0';
  const typicalAvgMonthly = rows.length ? money(median(rows.map(row => row.avgAnnualReal)) / 12) : '$0';
  const failCount = rows.filter(row => !row.passed).length;
  const floor = state.floorMode === 'usd' ? money(result.D) + '/mo' : result.aPct.toFixed(2) + '%/yr';
  const cap = state.capMode === 'usd' ? money(result.C) + '/mo' : result.bPct.toFixed(2) + '%/yr';

  markdown += `
## Results

- Historical windows tested: ${rows.length}
- Success rate: ${passLabel(result)}
- Failed windows: ${failCount}
- Typical first-year income: ${typicalMonthly}/mo
- Typical average income: ${typicalAvgMonthly}/mo
- Optimized floor: ${floor}
- Optimized cap: ${cap}
- Sensitivity: ${result.x.toFixed(2)}
`;

  if (worst) {
    markdown += `- Worst historical start: ${worst.start} to ${worst.end}
- Worst ending capital: ${(worst.endRatio * 100).toFixed(0)}% of starting capital
`;
  }

  return markdown + `
Results are based on historical market data and are not financial advice.
`;
}
