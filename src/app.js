import { renderIncome, renderPreserve, renderSpotlight } from './charts.js';

const ASSETS = [
  // U.S. Large Cap
  { id: 'sp500_price', name: 'S&P 500 Index', ticker: '^GSPC', cat: 'U.S. Large Cap', sleeve: 'sp', years: '1928+', desc: 'Headline large-cap index' },
  { id: 'sp500_total_return', name: 'S&P 500 Total Return', ticker: '^SP500TR', cat: 'U.S. Large Cap', sleeve: 'sp', years: '1988+', desc: 'Dividends reinvested' },
  { id: 'sp500_equal_weight', name: 'S&P 500 Equal Weight', ticker: 'RSP', cat: 'U.S. Large Cap', sleeve: 'sp', years: '2003+', desc: 'Equal-weight proxy' },
  { id: 'sp500_growth', name: 'S&P 500 Growth', ticker: 'IVW', cat: 'U.S. Large Cap', sleeve: 'sp', years: '2000+', desc: 'Growth tilt' },
  { id: 'sp500_value', name: 'S&P 500 Value', ticker: 'IVE', cat: 'U.S. Large Cap', sleeve: 'sp', years: '2000+', desc: 'Value tilt' },
  // Factors
  { id: 'sp500_quality', name: 'Quality Factor', ticker: 'SPHQ', cat: 'Factor Strategies', sleeve: 'sp', years: '2005+', desc: 'Quality screen' },
  { id: 'sp500_momentum', name: 'Momentum Factor', ticker: 'SPMO', cat: 'Factor Strategies', sleeve: 'sp', years: '2015+', desc: 'Momentum screen' },
  { id: 'sp500_dividend_aristocrats', name: 'Dividend Aristocrats', ticker: 'NOBL', cat: 'Factor Strategies', sleeve: 'sp', years: '2013+', desc: '25+ yr dividend growers' },
  // Broad Market
  { id: 'total_us_market_vti', name: 'Total U.S. Market', ticker: 'VTI', cat: 'Broad U.S. Market', sleeve: 'sp', years: '2001+', desc: 'Full market cap-weighted' },
  { id: 'russell_3000_iwv', name: 'Russell 3000', ticker: 'IWV', cat: 'Broad U.S. Market', sleeve: 'sp', years: '2000+', desc: '3,000 largest U.S. stocks' },
  { id: 'wilshire_5000_yahoo', name: 'Wilshire 5000', ticker: '^W5000', cat: 'Broad U.S. Market', sleeve: 'sp', years: '1988+', desc: 'Broadest U.S. index' },
  // Real Estate
  { id: 'us_reit_vnq', name: 'U.S. REITs', ticker: 'VNQ', cat: 'Real Estate', sleeve: 'sp', years: '2004+', desc: 'Broad U.S. REIT fund' },
  { id: 'us_reit_iyr', name: 'U.S. Real Estate', ticker: 'IYR', cat: 'Real Estate', sleeve: 'sp', years: '2000+', desc: 'Real estate sector' },
  // International
  { id: 'developed_ex_us_efa', name: 'Developed ex-U.S.', ticker: 'EFA', cat: 'International', sleeve: 'sp', years: '2001+', desc: 'EAFE developed markets' },
  { id: 'emerging_markets_eem', name: 'Emerging Markets', ticker: 'EEM', cat: 'International', sleeve: 'sp', years: '2003+', desc: 'EM equity' },
  // Bonds
  { id: 'total_bond_market_bnd', name: 'Total Bond Market', ticker: 'BND', cat: 'Bonds', sleeve: 'bd', years: '2007+', desc: 'U.S. aggregate bonds' },
  { id: 'ten_year_treasury_yield', name: '10-Year Treasury', ticker: 'DGS10', cat: 'Bonds', sleeve: 'bd', years: '1962+', desc: 'Constant maturity model' },
  // Gold
  { id: 'gold_gld', name: 'Gold ETF', ticker: 'GLD', cat: 'Gold', sleeve: 'gd', years: '2004+', desc: 'Physical gold fund' },
  { id: 'gold_futures_yahoo', name: 'Gold Futures', ticker: 'GC=F', cat: 'Gold', sleeve: 'gd', years: '2000+', desc: 'Continuous futures' },
];

function assetCategories() {
  const cats = []; const seen = new Set();
  for (const a of ASSETS) { if (!seen.has(a.cat)) { seen.add(a.cat); cats.push(a.cat); } }
  return cats;
}

function money(v) { return '$' + Math.round(v).toLocaleString('en-US'); }
function moneyK(v) {
  if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1000) return '$' + (Math.round(v / 100) / 10) + 'k';
  return '$' + Math.round(v);
}
function median(a) { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }
function passLabel(r) {
  if (r.n_pass >= r.n_windows) return '100%';
  const s = (r.n_pass / r.n_windows * 100).toFixed(1);
  return s === '100.0' ? '99.9%' : s + '%';
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

let worker = null;
function initWorker(ctx) {
  const el = document.getElementById('worker-src');
  if (!el || !el.textContent.trim()) return;
  worker = new Worker(URL.createObjectURL(new Blob([el.textContent], { type: 'text/javascript' })));
  worker.onmessage = ev => {
    if (ev.data.type === 'result') ctx._onResult(ev.data);
    else if (ev.data.type === 'spotlight') ctx._onSpotlight(ev.data);
  };
}

export function calculator() {
  return {
    version: __APP_VERSION__,
    showResults: false, loading: false, resultTab: 'income',
    showAdvanced: false, showCustom: false, spotIdx: null,

    savings: 1000000, years: 30,
    goalPreset: 'preserve', retainPct: 100,
    strategyPreset: 'stocks',
    portfolio: [{ id: 'sp500_price', weight: 100 }],

    floorMode: 'usd', minFloorPct: 4, minIncome: 3000,
    capMode: 'usd', maxCapPct: 9, maxIncome: 12000,
    lookback: 1, recalc: 1,

    result: null, rows: [], spotlight: null, spotOptions: [],

    money, moneyK,
    get assets() { return ASSETS; },
    get categories() { return assetCategories(); },
    assetsByCat(cat) { return ASSETS.filter(a => a.cat === cat); },
    assetTicker(id) { const a = ASSETS.find(x => x.id === id); return a ? a.ticker : ''; },
    assetYears(id) { const a = ASSETS.find(x => x.id === id); return a ? a.years : ''; },
    assetDesc(id) { const a = ASSETS.find(x => x.id === id); return a ? a.desc : ''; },

    get withdrawalWarning() {
      const warnings = [];
      const fDollar = this.floorMode !== 'pct';
      const cDollar = this.capMode !== 'pct';
      const monthly = this.savings / 12;
      // Floor vs cap
      if (fDollar && cDollar && this.minIncome >= this.maxIncome && this.maxIncome > 0) {
        warnings.push('Your minimum ($' + this.minIncome.toLocaleString() + '/mo) meets or exceeds your maximum ($' + this.maxIncome.toLocaleString() + '/mo). The cap will be overridden.');
      }
      const fPct = this.floorMode !== 'usd';
      const cPct = this.capMode !== 'usd';
      if (fPct && cPct && this.minFloorPct >= this.maxCapPct) {
        warnings.push('Your floor rate (' + this.minFloorPct + '%) meets or exceeds your cap (' + this.maxCapPct + '%). The cap will be overridden.');
      }
      // Floor vs nest egg
      if (fDollar && this.minIncome > 0 && this.minIncome >= monthly) {
        warnings.push('Your minimum income ($' + this.minIncome.toLocaleString() + '/mo) would drain your entire $' + this.savings.toLocaleString() + ' nest egg within the first year. Check that both values are correct.');
      }
      if (cDollar && this.maxIncome > 0 && this.maxIncome >= monthly) {
        warnings.push('Your maximum income ($' + this.maxIncome.toLocaleString() + '/mo) exceeds your monthly nest egg value. This will deplete savings very quickly.');
      }
      return warnings.join(' ');
    },

    get sleeves() {
      const o = { sp: 0, bd: 0, gd: 0, total: 0 };
      for (const p of this.portfolio) {
        const a = ASSETS.find(x => x.id === p.id);
        const w = Math.max(0, parseFloat(p.weight) || 0);
        if (a) { o[a.sleeve] += w; o.total += w; }
      }
      return o;
    },
    get sleeveBarStyles() {
      const s = this.sleeves, t = s.total || 1;
      return {
        sp: (s.sp / t * 100).toFixed(1) + '%',
        bd: (s.bd / t * 100).toFixed(1) + '%',
        gd: (s.gd / t * 100).toFixed(1) + '%',
      };
    },
    get allocNote() {
      const s = this.sleeves;
      if (s.total <= 0) return '';
      const t = s.total || 1;
      const sp = Math.round(s.sp / t * 100), bd = Math.round(s.bd / t * 100), gd = Math.round(s.gd / t * 100);
      let note = sp + '% stocks, ' + bd + '% bonds, ' + gd + '% gold';
      if (Math.abs(s.total - 100) > 0.5) note += ' (weights rescaled from ' + Math.round(s.total) + '%)';
      if (s.gd > 0) note += '. Gold limits data to 1968\u20132023.';
      return note;
    },

    isInPortfolio(id) { return this.portfolio.some(p => p.id === id); },
    addAsset(id) {
      if (!this.isInPortfolio(id)) this.portfolio = [...this.portfolio, { id, weight: 0 }];
    },
    removeAsset(id) { this.portfolio = this.portfolio.filter(p => p.id !== id); },
    updateWeight(id, val) {
      this.portfolio = this.portfolio.map(p => p.id === id ? { ...p, weight: Math.max(0, parseFloat(val) || 0) } : p);
    },
    assetName(id) { const a = ASSETS.find(x => x.id === id); return a ? a.name : id; },

    get heroMonthly() {
      if (!this.rows.length) return '$0';
      return money(median(this.rows.map(r => r.firstYearReal)) / 12);
    },
    get heroPassRate() { return this.result ? passLabel(this.result) : '0%'; },
    get heroConfidence() {
      if (!this.result) return 'neutral';
      const rate = this.result.n_pass / this.result.n_windows;
      if (rate >= 0.999) return 'high';
      if (rate >= 0.95) return 'good';
      if (rate >= 0.85) return 'fair';
      return 'low';
    },
    get periodCount() { return this.rows.length; },
    get failCount() { return this.rows.filter(r => !r.passed).length; },
    get typicalAvgIncome() {
      if (!this.rows.length) return '$0/mo';
      return money(median(this.rows.map(r => r.avgAnnualReal)) / 12) + '/mo';
    },
    get worstCase() {
      if (!this.rows.length) return null;
      return this.rows.reduce((w, r) => r.endRatio < w.endRatio ? r : w, this.rows[0]);
    },
    get summaryPhrase() {
      if (!this.result || !this.rows.length) return '';
      const b = this.result, n = this.rows.length;
      const floor = this.floorMode === 'usd' ? money(b.D) + '/mo' : b.aPct.toFixed(2) + '%/yr';
      const cap = this.capMode === 'usd' ? money(b.C) + '/mo' : b.bPct.toFixed(2) + '%/yr';
      return 'Tested against ' + n + ' historical retirements spanning ' + this.years + ' years each. ' +
        'Floor: ' + floor + '. Cap: ' + cap + '. Sensitivity: ' + b.x.toFixed(2) + '. ' +
        passLabel(b) + ' met the goal. These are ceilings \u2014 spending less is always safer.';
    },

    rowIncome(r) { return money(r.firstYearReal / 12); },
    rowAvg(r) { return money(r.avgAnnualReal / 12); },
    rowEnd(r) { return (r.endRatio * 100).toFixed(0) + '%'; },

    setGoalPreset(p) {
      this.goalPreset = p;
      if (p === 'preserve') this.retainPct = 100;
      else if (p === 'spend') this.retainPct = 0;
    },
    setStrategy(name) {
      this.strategyPreset = name;
      this.showCustom = name === 'custom';
      if (name === 'stocks') this.portfolio = [{ id: 'sp500_price', weight: 100 }];
      else if (name === 'balanced') this.portfolio = [{ id: 'total_us_market_vti', weight: 60 }, { id: 'ten_year_treasury_yield', weight: 40 }];
      else if (name === 'conservative') this.portfolio = [{ id: 'total_us_market_vti', weight: 40 }, { id: 'ten_year_treasury_yield', weight: 40 }, { id: 'gold_gld', weight: 20 }];
    },

    selectSpot(s) { this.spotIdx = +s; if (worker) worker.postMessage({ type: 'spotlight', s: +s }); },
    selectSpotWorst() { const w = this.worstCase; if (w) this.selectSpot(w.s); },
    selectSpotBest() { if (!this.rows.length) return; this.selectSpot(this.rows.reduce((b, r) => r.endRatio > b.endRatio ? r : b, this.rows[0]).s); },
    selectSpotTypical() { if (!this.rows.length) return; this.selectSpot(this.rows[Math.floor(this.rows.length / 2)].s); },

    calculate() {
      const s = this.sleeves;
      if (s.sp + s.bd + s.gd <= 0) { this.portfolio = [{ id: 'sp500_price', weight: 100 }]; return this.calculate(); }
      if (!worker) { initWorker(this); if (!worker) { setTimeout(() => this.calculate(), 200); return; } }
      this.loading = true; this.showResults = false;
      const msg = {
        type: 'run', floorMode: this.floorMode, capMode: this.capMode,
        years: clamp(this.years, 5, 100), minA: clamp(this.minFloorPct, 4, 10),
        dollarFloor: Math.max(0, this.minIncome), pctFloor: clamp(this.minFloorPct, 0, 12),
        pctCap: clamp(this.maxCapPct, 0.5, 40), dollarCap: Math.max(0, this.maxIncome),
        lookback: clamp(Math.round(this.lookback), 1, 120),
        recalc: clamp(Math.round(this.recalc), 1, 120),
        nestEgg: Math.max(1000, this.savings), retain: clamp(this.retainPct, 0, 300),
        wSp: s.sp, wBond: s.bd, wGold: s.gd,
      };
      setTimeout(() => { if (worker) worker.postMessage(msg); }, 20);
    },

    _onResult(m) {
      this.loading = false; this.result = m.best; this.rows = m.rows || [];
      this.showResults = true; this.resultTab = 'income';
      if (!this.rows.length) return;
      this.spotOptions = this.rows.map(r => ({ s: r.s, label: r.start + ' \u2013 ' + r.end }));
      this.$nextTick(() => {
        renderIncome('chartIncome', this.rows);
        renderPreserve('chartPreserve', this.rows, m.target);
        this.selectSpotWorst();
      });
    },
    _onSpotlight(m) {
      this.spotlight = m.traj;
      this.$nextTick(() => { renderSpotlight('chartSpotlight', m.traj); });
    },

    init() { initWorker(this); },
  };
}
