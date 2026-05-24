import { ASSETS, assetById, assetGroups, sleeves } from './assets.js';
import { renderIncome, renderPreserve, renderSpotlight, destroyAll } from './charts.js';

function money(v) { return '$' + Math.round(v).toLocaleString('en-US'); }
function moneyK(v) {
  if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1000) return '$' + (Math.round(v / 100) / 10) + 'k';
  return '$' + Math.round(v);
}
function pctFmt(v, d) { return (v * 100).toFixed(d ?? 1) + '%'; }
function median(arr) { const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; }
function passLabel(r) {
  if (r.n_pass >= r.n_windows) return '100%';
  const s = (r.n_pass / r.n_windows * 100).toFixed(1);
  return s === '100.0' ? '99.9%' : s + '%';
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

let worker = null;

function initWorker(onResult, onSpotlight) {
  const el = document.getElementById('worker-src');
  if (!el) return;
  worker = new Worker(URL.createObjectURL(new Blob([el.textContent], { type: 'text/javascript' })));
  worker.onmessage = (ev) => {
    if (ev.data.type === 'result') onResult(ev.data);
    else if (ev.data.type === 'spotlight') onSpotlight(ev.data);
  };
}

export function calculator() {
  return {
    version: __APP_VERSION__,
    showResults: false, loading: false, resultTab: 'income',
    showAdvanced: false, showCustomPortfolio: false, showHelp: false, spotIdx: null,

    savings: 1000000, years: 30, goalPreset: 'preserve', retainPct: 100,
    strategyPreset: 'stocks',
    portfolio: [{ id: 'sp500_price', weight: 100 }],

    floorMode: 'usd', minFloorPct: 4, minIncome: 3000, pctFloor: 4,
    capMode: 'usd', maxCapPct: 9, maxIncome: 12000,
    lookback: 1, recalc: 1,

    result: null, rows: [], spotlight: null, spotOptions: [],

    get assets() { return ASSETS; },
    get assetGroups() { return assetGroups(); },
    groupAssets(group) { return ASSETS.filter(a => a.group === group); },
    isInPortfolio(id) { return this.portfolio.some(p => p.id === id); },
    get sleeves() { return sleeves(this.portfolio); },
    get sleeveBarStyles() {
      const s = this.sleeves; const t = s.total || 1;
      return { sp: (s.sp / t * 100).toFixed(1) + '%', bd: (s.bd / t * 100).toFixed(1) + '%', gd: (s.gd / t * 100).toFixed(1) + '%' };
    },
    get allocNote() {
      const s = this.sleeves;
      if (s.total <= 0) return 'Add holdings to see the simulation mix.';
      const note = Math.round(s.sp) + '% stocks, ' + Math.round(s.bd) + '% bonds, ' + Math.round(s.gd) + '% gold';
      const warn = (Math.abs(s.total - 100) > 0.5) ? ' (will be rescaled to 100%)' : '';
      const gold = s.gd > 0 ? ' Gold limits history to 1968\u20132023.' : '';
      return note + warn + '.' + gold;
    },
    get heroMonthly() {
      if (!this.rows.length) return '$0';
      return money(median(this.rows.map(r => r.firstYearReal)) / 12);
    },
    get heroPassRate() { return this.result ? passLabel(this.result) : '0%'; },
    get heroConfidence() {
      if (!this.result) return 'neutral';
      const rate = this.result.n_pass / this.result.n_windows;
      if (rate >= 0.999) return 'high'; if (rate >= 0.95) return 'good';
      if (rate >= 0.85) return 'fair'; return 'low';
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
    get firstYear() { return this.rows.length ? this.rows[0].start.slice(0, 4) : '1871'; },
    get summaryPhrase() {
      if (!this.result || !this.rows.length) return '';
      const b = this.result; const n = this.rows.length;
      const floor = this.floorMode === 'usd' ? money(b.D) + '/mo' : b.aPct.toFixed(2) + '%/yr';
      const cap = this.capMode === 'usd' ? money(b.C) + '/mo' : b.bPct.toFixed(2) + '%/yr';
      return `Tested against ${n} historical retirements spanning ${this.years} years each. `
        + `Floor: ${floor}. Cap: ${cap}. Sensitivity: ${b.x.toFixed(2)}. `
        + `${passLabel(b)} met the goal of retaining ${Math.round(this.retainPct)}% of savings. `
        + `These are ceilings \u2014 spending less is always safer.`;
    },

    money, moneyK, pctFmt,
    setGoalPreset(p) {
      this.goalPreset = p;
      if (p === 'preserve') this.retainPct = 100;
      else if (p === 'spend') this.retainPct = 0;
    },
    setStrategy(name) {
      this.strategyPreset = name;
      this.showCustomPortfolio = name === 'custom';
      if (name === 'stocks') this.portfolio = [{ id: 'sp500_price', weight: 100 }];
      else if (name === 'balanced') this.portfolio = [{ id: 'total_us_market_vti', weight: 60 }, { id: 'ten_year_treasury_yield', weight: 40 }];
      else if (name === 'conservative') this.portfolio = [{ id: 'total_us_market_vti', weight: 40 }, { id: 'ten_year_treasury_yield', weight: 40 }, { id: 'gold_gld', weight: 20 }];
    },
    addAsset(id) { if (!this.isInPortfolio(id)) this.portfolio = [...this.portfolio, { id, weight: 0 }]; },
    removeAsset(id) { this.portfolio = this.portfolio.filter(p => p.id !== id); },
    updateWeight(id, val) { this.portfolio = this.portfolio.map(p => p.id === id ? { ...p, weight: Math.max(0, parseFloat(val) || 0) } : p); },
    assetName(id) { const a = assetById(id); return a ? a.name : id; },
    assetTicker(id) { const a = assetById(id); return a ? a.ticker : ''; },
    assetYears(id) { const a = assetById(id); return a ? a.years : ''; },
    rowIncome(r) { return money(r.firstYearReal / 12); },
    rowAvg(r) { return money(r.avgAnnualReal / 12); },
    rowEnd(r) { return (r.endRatio * 100).toFixed(0) + '%'; },

    selectSpot(s) { this.spotIdx = +s; if (worker) worker.postMessage({ type: 'spotlight', s: +s }); },
    selectSpotWorst() { const w = this.worstCase; if (w) this.selectSpot(w.s); },
    selectSpotBest() { if (!this.rows.length) return; this.selectSpot(this.rows.reduce((b, r) => r.endRatio > b.endRatio ? r : b, this.rows[0]).s); },
    selectSpotTypical() { if (!this.rows.length) return; this.selectSpot(this.rows[Math.floor(this.rows.length / 2)].s); },

    calculate() {
      const s = this.sleeves;
      if (s.sp + s.bd + s.gd <= 0) { this.portfolio = [{ id: 'sp500_price', weight: 100 }]; return this.calculate(); }
      this.loading = true; this.showResults = false;
      const msg = {
        type: 'run', floorMode: this.floorMode, capMode: this.capMode,
        years: clamp(this.years, 5, 100), minA: clamp(this.minFloorPct, 4, 10),
        dollarFloor: Math.max(0, this.minIncome), pctFloor: clamp(this.pctFloor, 0, 12),
        pctCap: clamp(this.maxCapPct, 0.5, 40), dollarCap: Math.max(0, this.maxIncome),
        lookback: clamp(Math.round(this.lookback), 1, 120), recalc: clamp(Math.round(this.recalc), 1, 120),
        nestEgg: Math.max(1000, this.savings), retain: clamp(this.retainPct, 0, 300),
        wSp: s.sp, wBond: s.bd, wGold: s.gd,
      };
      setTimeout(() => { if (worker) worker.postMessage(msg); }, 20);
    },

    _onResult(m) {
      this.loading = false; this.result = m.best; this.rows = m.rows || [];
      this.showResults = true; this.resultTab = 'income';
      if (!this.rows.length) { destroyAll(); return; }
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

    init() { initWorker(m => this._onResult(m), m => this._onSpotlight(m)); },
  };
}
