export function resultsTemplate() {
  return `
  <template x-if="showResults && rows.length > 0">
    <div>
      ${heroCard()}
      ${statCards()}
      ${summaryCard()}
    </div>
  </template>

  <template x-if="showResults && rows.length === 0">
    <div class="mx-4 sm:mx-auto sm:max-w-2xl bg-warning-light border border-warning
      rounded-2xl p-5 mb-4 text-sm text-warning">
      Not enough market history for a <span x-text="years"></span>-year retirement with
      this portfolio. Shorten the retirement or adjust your portfolio.
    </div>
  </template>`;
}

function heroCard() {
  return `
    <section class="mx-4 sm:mx-auto sm:max-w-2xl rounded-2xl p-5 sm:p-7 mb-4 text-white"
      :class="{
        'bg-gradient-to-br from-emerald-600 to-emerald-700': heroConfidence === 'high',
        'bg-gradient-to-br from-indigo-600 to-indigo-700': heroConfidence === 'good',
        'bg-gradient-to-br from-amber-600 to-amber-700': heroConfidence === 'fair',
        'bg-gradient-to-br from-rose-600 to-rose-700': heroConfidence === 'low',
      }"
      aria-live="polite">
      <p class="text-xs font-bold tracking-widest uppercase opacity-80 mb-2">Your result</p>
      <p class="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight tnum"
        x-text="heroMonthly + '/mo'"></p>
      <p class="text-sm opacity-90 mt-1">
        safe to withdraw &mdash; worked in
        <strong class="font-extrabold" x-text="heroPassRate"></strong>
        of <span x-text="periodCount"></span> historical retirements since <span x-text="firstYear"></span>
      </p>
    </section>`;
}

function statCards() {
  return `
    <div class="mx-4 sm:mx-auto sm:max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      <div class="bg-surface border border-border rounded-xl px-4 py-3">
        <p class="text-xs font-bold text-muted mb-0.5">Typical starting income</p>
        <p class="text-xl font-extrabold tnum" x-text="heroMonthly + '/mo'"></p>
        <p class="text-xs text-muted">median first-year withdrawal</p>
      </div>
      <div class="bg-surface border border-border rounded-xl px-4 py-3">
        <p class="text-xs font-bold text-muted mb-0.5">Average over retirement</p>
        <p class="text-xl font-extrabold tnum" x-text="typicalAvgIncome"></p>
        <p class="text-xs text-muted">grows as savings compound</p>
      </div>
      <div class="bg-surface border border-border rounded-xl px-4 py-3">
        <p class="text-xs font-bold text-muted mb-0.5">Toughest period</p>
        <p class="text-xl font-extrabold tnum" x-text="worstCase ? pctFmt(worstCase.endRatio, 0) + ' left' : '--'"></p>
        <p class="text-xs text-muted">
          <span x-text="worstCase ? 'started ' + worstCase.start : ''"></span>
          <template x-if="failCount > 0">
            <span class="text-danger font-bold" x-text="' &middot; ' + failCount + ' missed goal'"></span>
          </template>
        </p>
      </div>
    </div>`;
}

function summaryCard() {
  return `
    <section class="mx-4 sm:mx-auto sm:max-w-2xl bg-surface border border-border rounded-2xl p-5 mb-4">
      <p class="text-xs font-bold tracking-widest uppercase text-primary mb-2">What this means</p>
      <p class="text-sm text-muted leading-relaxed" x-text="summaryPhrase"></p>
    </section>`;
}
