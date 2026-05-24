/**
 * Google Analytics 4 event tracking.
 *
 * All events use a 'retirement_calc' prefix for easy filtering
 * in GA4 reports. The measurement ID is injected at build time
 * via __GA_MEASUREMENT_ID__ (set in vite.config.js / env).
 *
 * If no measurement ID is configured or gtag isn't loaded,
 * all calls silently no-op.
 */

function send(name, params) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

/* ── Page lifecycle ── */

export function trackPageView() {
  send('page_view', { page_title: document.title });
}

/* ── Step 1: Savings & duration ── */

export function trackSavingsChange(value) {
  send('rc_savings_change', {
    event_category: 'input',
    savings_amount: value,
    savings_bucket: bucketize(value, [100000, 250000, 500000, 1000000, 2000000, 5000000]),
  });
}

export function trackYearsChange(value) {
  send('rc_years_change', {
    event_category: 'input',
    retirement_years: value,
  });
}

/* ── Step 2: Goal ── */

export function trackGoalPreset(preset) {
  send('rc_goal_select', {
    event_category: 'configuration',
    goal_preset: preset,
  });
}

export function trackRetainPctChange(value) {
  send('rc_retain_pct_change', {
    event_category: 'input',
    retain_pct: value,
  });
}

/* ── Step 3: Portfolio ── */

export function trackStrategySelect(strategy) {
  send('rc_strategy_select', {
    event_category: 'configuration',
    strategy: strategy,
  });
}

export function trackAssetAdd(assetId, assetName) {
  send('rc_asset_add', {
    event_category: 'portfolio',
    asset_id: assetId,
    asset_name: assetName,
  });
}

export function trackAssetRemove(assetId, assetName) {
  send('rc_asset_remove', {
    event_category: 'portfolio',
    asset_id: assetId,
    asset_name: assetName,
  });
}

export function trackAssetWeightChange(assetId, weight) {
  send('rc_asset_weight', {
    event_category: 'portfolio',
    asset_id: assetId,
    weight: weight,
  });
}

/* ── Step 4: Withdrawal rules ── */

export function trackFloorModeChange(mode) {
  send('rc_floor_mode', {
    event_category: 'configuration',
    floor_mode: mode,
  });
}

export function trackCapModeChange(mode) {
  send('rc_cap_mode', {
    event_category: 'configuration',
    cap_mode: mode,
  });
}

export function trackMinIncomeChange(value) {
  send('rc_min_income_change', {
    event_category: 'input',
    min_income: value,
  });
}

export function trackMaxIncomeChange(value) {
  send('rc_max_income_change', {
    event_category: 'input',
    max_income: value,
  });
}

export function trackMinFloorPctChange(value) {
  send('rc_min_floor_pct', {
    event_category: 'input',
    min_floor_pct: value,
  });
}

export function trackMaxCapPctChange(value) {
  send('rc_max_cap_pct', {
    event_category: 'input',
    max_cap_pct: value,
  });
}

export function trackAdvancedToggle(open) {
  send('rc_advanced_toggle', {
    event_category: 'ui',
    is_open: open,
  });
}

export function trackLookbackChange(value) {
  send('rc_lookback_change', {
    event_category: 'input',
    lookback_months: value,
  });
}

export function trackRecalcChange(value) {
  send('rc_recalc_change', {
    event_category: 'input',
    recalc_months: value,
  });
}

/* ── Calculation ── */

export function trackCalculateStart(config) {
  send('rc_calculate_start', {
    event_category: 'calculation',
    savings: config.savings,
    years: config.years,
    strategy: config.strategyPreset,
    floor_mode: config.floorMode,
    cap_mode: config.capMode,
    goal: config.goalPreset,
    retain_pct: config.retainPct,
  });
}

export function trackCalculateComplete(result) {
  send('rc_calculate_complete', {
    event_category: 'calculation',
    hero_monthly: result.heroMonthly,
    pass_rate: result.heroPassRate,
    confidence: result.heroConfidence,
    period_count: result.periodCount,
    fail_count: result.failCount,
    duration_ms: result.durationMs,
  });
}

/* ── Results interaction ── */

export function trackResultTabSwitch(tab) {
  send('rc_result_tab', {
    event_category: 'results',
    tab: tab,
  });
}

export function trackSpotlightSelect(type, periodStart) {
  send('rc_spotlight_select', {
    event_category: 'results',
    spotlight_type: type,
    period_start: periodStart,
  });
}

export function trackTableExpand() {
  send('rc_table_expand', {
    event_category: 'results',
  });
}

export function trackTableRowClick(periodStart) {
  send('rc_table_row_click', {
    event_category: 'results',
    period_start: periodStart,
  });
}

/* ── Help / UI ── */

export function trackHelpToggle(open) {
  send('rc_help_toggle', {
    event_category: 'ui',
    is_open: open,
  });
}

export function trackCustomPortfolioOpen() {
  send('rc_custom_portfolio_open', {
    event_category: 'ui',
  });
}

export function trackValidationWarning(warning) {
  send('rc_validation_warning', {
    event_category: 'validation',
    warning_text: warning.substring(0, 100),
  });
}

export function trackUrlShare() {
  send('rc_url_share', {
    event_category: 'engagement',
    url_length: window.location.search.length,
    has_custom_params: window.location.search.length > 1,
  });
}

/* ── Scroll depth ── */

let maxScroll = 0;
export function initScrollTracking() {
  const thresholds = [25, 50, 75, 90];
  const fired = new Set();
  window.addEventListener('scroll', () => {
    const pct = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    if (pct > maxScroll) maxScroll = pct;
    for (const t of thresholds) {
      if (pct >= t && !fired.has(t)) {
        fired.add(t);
        send('rc_scroll_depth', {
          event_category: 'engagement',
          depth_pct: t,
        });
      }
    }
  }, { passive: true });
}

/* ── Session timing ── */

const sessionStart = Date.now();
export function trackSessionEnd() {
  send('rc_session_duration', {
    event_category: 'engagement',
    duration_seconds: Math.round((Date.now() - sessionStart) / 1000),
    max_scroll_pct: maxScroll,
  });
}

/* ── Alpine watcher setup ── */

export function wireWatchers(ctx) {
  let st, it, ct;
  const deb = (timer, fn, ms) => v => { clearTimeout(timer); timer = setTimeout(() => fn(v), ms); return timer; };
  ctx.$watch('savings', v => { st = deb(st, trackSavingsChange, 500)(v); });
  ctx.$watch('years', v => trackYearsChange(v));
  ctx.$watch('retainPct', v => trackRetainPctChange(v));
  ctx.$watch('floorMode', v => trackFloorModeChange(v));
  ctx.$watch('capMode', v => trackCapModeChange(v));
  ctx.$watch('minIncome', v => { it = deb(it, trackMinIncomeChange, 500)(v); });
  ctx.$watch('maxIncome', v => { ct = deb(ct, trackMaxIncomeChange, 500)(v); });
  ctx.$watch('minFloorPct', v => trackMinFloorPctChange(v));
  ctx.$watch('maxCapPct', v => trackMaxCapPctChange(v));
  ctx.$watch('lookback', v => trackLookbackChange(v));
  ctx.$watch('recalc', v => trackRecalcChange(v));
  ctx.$watch('showAdvanced', v => trackAdvancedToggle(v));
  ctx.$watch('showHelp', v => trackHelpToggle(v));
  ctx.$watch('resultTab', v => trackResultTabSwitch(v));
  ctx.$watch('withdrawalWarning', v => { if (v) trackValidationWarning(v); });
  trackPageView();
  initScrollTracking();
  window.addEventListener('beforeunload', () => trackSessionEnd());
}

/* ── Helpers ── */

function bucketize(value, thresholds) {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (value >= thresholds[i]) return thresholds[i] + '+';
  }
  return '<' + thresholds[0];
}
