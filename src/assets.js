/* ── Asset universe ── */
export const ASSETS = [
  { id: 'sp500_price', name: 'S&P 500', ticker: '^GSPC', group: 'U.S. Stocks', sleeve: 'sp', years: '1928 +' },
  { id: 'sp500_total_return', name: 'S&P 500 Total Return', ticker: '^SP500TR', group: 'U.S. Stocks', sleeve: 'sp', years: '1988 +' },
  { id: 'sp500_equal_weight', name: 'S&P 500 Equal Weight', ticker: 'RSP', group: 'U.S. Stocks', sleeve: 'sp', years: '2003 +' },
  { id: 'sp500_growth', name: 'S&P 500 Growth', ticker: 'IVW', group: 'U.S. Stocks', sleeve: 'sp', years: '2000 +' },
  { id: 'sp500_value', name: 'S&P 500 Value', ticker: 'IVE', group: 'U.S. Stocks', sleeve: 'sp', years: '2000 +' },
  { id: 'sp500_quality', name: 'Quality Factor', ticker: 'SPHQ', group: 'U.S. Stocks', sleeve: 'sp', years: '2005 +' },
  { id: 'sp500_momentum', name: 'Momentum Factor', ticker: 'SPMO', group: 'U.S. Stocks', sleeve: 'sp', years: '2015 +' },
  { id: 'sp500_dividend_aristocrats', name: 'Dividend Aristocrats', ticker: 'NOBL', group: 'U.S. Stocks', sleeve: 'sp', years: '2013 +' },
  { id: 'total_us_market_vti', name: 'Total U.S. Market', ticker: 'VTI', group: 'U.S. Stocks', sleeve: 'sp', years: '2001 +' },
  { id: 'russell_3000_iwv', name: 'Russell 3000', ticker: 'IWV', group: 'U.S. Stocks', sleeve: 'sp', years: '2000 +' },
  { id: 'wilshire_5000_yahoo', name: 'Wilshire 5000', ticker: '^W5000', group: 'U.S. Stocks', sleeve: 'sp', years: '1988 +' },
  { id: 'sp500_sector_technology', name: 'Technology', ticker: 'XLK', group: 'Sectors', sleeve: 'sp', years: '1998 +' },
  { id: 'sp500_sector_health_care', name: 'Health Care', ticker: 'XLV', group: 'Sectors', sleeve: 'sp', years: '1998 +' },
  { id: 'sp500_sector_financials', name: 'Financials', ticker: 'XLF', group: 'Sectors', sleeve: 'sp', years: '1998 +' },
  { id: 'sp500_sector_energy', name: 'Energy', ticker: 'XLE', group: 'Sectors', sleeve: 'sp', years: '1998 +' },
  { id: 'sp500_sector_consumer_discretionary', name: 'Consumer Disc.', ticker: 'XLY', group: 'Sectors', sleeve: 'sp', years: '1998 +' },
  { id: 'sp500_sector_consumer_staples', name: 'Consumer Staples', ticker: 'XLP', group: 'Sectors', sleeve: 'sp', years: '1998 +' },
  { id: 'sp500_sector_industrials', name: 'Industrials', ticker: 'XLI', group: 'Sectors', sleeve: 'sp', years: '1998 +' },
  { id: 'sp500_sector_utilities', name: 'Utilities', ticker: 'XLU', group: 'Sectors', sleeve: 'sp', years: '1998 +' },
  { id: 'sp500_sector_materials', name: 'Materials', ticker: 'XLB', group: 'Sectors', sleeve: 'sp', years: '1998 +' },
  { id: 'sp500_sector_real_estate', name: 'Real Estate', ticker: 'XLRE', group: 'Sectors', sleeve: 'sp', years: '2015 +' },
  { id: 'us_reit_vnq', name: 'U.S. REITs', ticker: 'VNQ', group: 'Real Estate', sleeve: 'sp', years: '2004 +' },
  { id: 'us_reit_iyr', name: 'U.S. Real Estate', ticker: 'IYR', group: 'Real Estate', sleeve: 'sp', years: '2000 +' },
  { id: 'global_reit_vnqi', name: 'Global ex-U.S. REITs', ticker: 'VNQI', group: 'Real Estate', sleeve: 'sp', years: '2010 +' },
  { id: 'developed_ex_us_efa', name: 'Developed ex-U.S.', ticker: 'EFA', group: 'International', sleeve: 'sp', years: '2001 +' },
  { id: 'emerging_markets_eem', name: 'Emerging Markets', ticker: 'EEM', group: 'International', sleeve: 'sp', years: '2003 +' },
  { id: 'total_bond_market_bnd', name: 'Total Bond Market', ticker: 'BND', group: 'Bonds', sleeve: 'bd', years: '2007 +' },
  { id: 'ten_year_treasury_yield', name: '10-Year Treasury', ticker: 'DGS10', group: 'Bonds', sleeve: 'bd', years: '1962 +' },
  { id: 'gold_gld', name: 'Gold ETF', ticker: 'GLD', group: 'Gold', sleeve: 'gd', years: '2004 +' },
  { id: 'gold_futures_yahoo', name: 'Gold Futures', ticker: 'GC=F', group: 'Gold', sleeve: 'gd', years: '2000 +' },
];

export function assetById(id) { return ASSETS.find(a => a.id === id) || null; }

export function assetGroups() {
  const groups = []; const seen = new Set();
  for (const a of ASSETS) { if (!seen.has(a.group)) { seen.add(a.group); groups.push(a.group); } }
  return groups;
}

export function sleeves(portfolio) {
  const out = { sp: 0, bd: 0, gd: 0, total: 0 };
  for (const p of portfolio) {
    const a = assetById(p.id); const w = Math.max(0, parseFloat(p.weight) || 0);
    if (!a) continue;
    out[a.sleeve] += w; out.total += w;
  }
  return out;
}
