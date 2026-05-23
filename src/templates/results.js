export function resultsTemplate() {
  return `
  <template x-if="showResults && rows.length > 0">
    <div>

      <div class="mb-12 pt-4">
        <p class="label mb-3">Your result</p>
        <p class="text-[2.8rem] sm:text-[3.6rem] leading-none font-semibold
          tracking-tight tnum text-ink"
          x-text="heroMonthly + '/mo'"></p>
        <p class="mt-3 text-muted text-[15px] leading-relaxed max-w-[460px]">
          safe to withdraw &mdash; worked in
          <strong class="font-bold text-ink" x-text="heroPassRate"></strong>
          of <span x-text="periodCount"></span> simulated retirements
          since <span x-text="firstYear"></span>.
        </p>
        <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full
          text-sm font-semibold"
          :class="{
            'bg-teal-soft text-teal': heroConfidence === 'high',
            'bg-accent-soft text-accent': heroConfidence === 'good',
            'bg-amber-soft text-amber': heroConfidence === 'fair',
            'bg-rose-soft text-rose': heroConfidence === 'low',
          }">
          <span x-text="heroPassRate"></span> success rate
        </div>
      </div>

      <div class="grid sm:grid-cols-3 gap-5 mb-10">
        <div class="sec">
          <p class="label mb-1">Starting income</p>
          <p class="text-2xl font-semibold tnum text-ink"
            x-text="heroMonthly + '/mo'"></p>
          <p class="text-xs text-faint mt-1">median first year</p>
        </div>
        <div class="sec">
          <p class="label mb-1">Avg. over retirement</p>
          <p class="text-2xl font-semibold tnum text-ink"
            x-text="typicalAvgIncome"></p>
          <p class="text-xs text-faint mt-1">grows with savings</p>
        </div>
        <div class="sec">
          <p class="label mb-1">Toughest period</p>
          <p class="text-2xl font-semibold tnum text-ink"
            x-text="worstCase ? pctFmt(worstCase.endRatio, 0) + ' left' : '—'"></p>
          <p class="text-xs text-faint mt-1">
            <span x-text="worstCase ? worstCase.start : ''"></span>
            <template x-if="failCount > 0">
              <span class="text-rose font-bold"
                x-text="' · ' + failCount + ' missed'"></span>
            </template>
          </p>
        </div>
      </div>

      <div class="mb-10 text-sm text-muted leading-relaxed max-w-[540px]"
        x-text="summaryPhrase"></div>

    </div>
  </template>

  <template x-if="showResults && rows.length === 0">
    <div class="sec border-amber bg-amber-soft">
      <p class="text-sm font-semibold text-amber">
        Not enough history for
        <span x-text="years"></span>&thinsp;years.
        Shorten the retirement or adjust the portfolio.
      </p>
    </div>
  </template>`;
}
