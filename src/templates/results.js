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
    <div class="card mb-6 border-warning bg-warning-light">
      <p class="text-sm text-warning font-bold">
        Not enough market history for a
        <span x-text="years"></span>-year retirement with this portfolio.
        Shorten the retirement or adjust your portfolio.
      </p>
    </div>
  </template>`;
}

function heroCard() {
  return `
    <section class="rounded-2xl p-7 sm:p-9 mb-6 text-white"
      :class="{
        'bg-gradient-to-br from-emerald-600 to-emerald-700': heroConfidence === 'high',
        'bg-gradient-to-br from-indigo-600 to-indigo-700': heroConfidence === 'good',
        'bg-gradient-to-br from-amber-600 to-amber-700': heroConfidence === 'fair',
        'bg-gradient-to-br from-rose-600 to-rose-700': heroConfidence === 'low',
      }"
      style="box-shadow: 0 4px 24px rgba(0,0,0,.2);"
      aria-live="polite">
      <p class="text-xs font-bold tracking-widest uppercase opacity-75 mb-4">
        Your result</p>
      <p class="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none tnum"
        x-text="heroMonthly + '/mo'"></p>
      <p class="text-sm sm:text-base opacity-85 mt-4 leading-relaxed">
        safe to withdraw &mdash; worked in
        <strong class="font-extrabold" x-text="heroPassRate"></strong>
        of <span x-text="periodCount"></span> historical retirements
        since <span x-text="firstYear"></span>
      </p>
    </section>`;
}

function statCards() {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="card">
        <p class="text-xs font-bold text-muted mb-1.5">Typical starting income</p>
        <p class="text-2xl font-extrabold tnum" x-text="heroMonthly + '/mo'"></p>
        <p class="text-xs text-muted mt-1.5">median first-year withdrawal</p>
      </div>
      <div class="card">
        <p class="text-xs font-bold text-muted mb-1.5">Average over retirement</p>
        <p class="text-2xl font-extrabold tnum" x-text="typicalAvgIncome"></p>
        <p class="text-xs text-muted mt-1.5">grows as savings compound</p>
      </div>
      <div class="card">
        <p class="text-xs font-bold text-muted mb-1.5">Toughest period</p>
        <p class="text-2xl font-extrabold tnum"
          x-text="worstCase ? pctFmt(worstCase.endRatio, 0) + ' left' : '--'"></p>
        <p class="text-xs text-muted mt-1.5">
          <span x-text="worstCase ? 'started ' + worstCase.start : ''"></span>
          <template x-if="failCount > 0">
            <span class="text-danger font-bold"
              x-text="' · ' + failCount + ' missed goal'"></span>
          </template>
        </p>
      </div>
    </div>`;
}

function summaryCard() {
  return `
    <section class="card mb-6">
      <p class="text-xs font-bold tracking-widest uppercase text-primary mb-3">
        What this means</p>
      <p class="text-sm text-muted leading-relaxed" x-text="summaryPhrase"></p>
    </section>`;
}
