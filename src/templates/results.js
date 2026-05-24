export function resultsTemplate() {
  return `
  <template x-if="!showResults && !loading">
    <div class="text-center py-10 text-muted text-sm"
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0"
      x-transition:enter-end="opacity-100">
      <svg class="w-10 h-10 mx-auto mb-3 text-line" fill="none"
        stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621
          0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21
          6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75
          8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0
          1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125
          1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5
          4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21
          3.504 21 4.125v15.75c0 .621-.504 1.125-1.125
          1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
      </svg>
      <p>Adjust your settings above, then calculate.</p>
    </div>
  </template>

  <template x-if="loading">
    <div class="text-center py-12 text-muted"
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0"
      x-transition:enter-end="opacity-100"
      aria-live="polite">
      <div class="spin mx-auto mb-3" style="width:28px;height:28px;
        border-width:3px;"></div>
      <p class="text-sm">Running simulation&hellip;</p>
    </div>
  </template>

  <template x-if="showResults && rows.length > 0">
    <div x-transition:enter="transition ease-out duration-300"
      x-transition:enter-start="opacity-0 translate-y-2"
      x-transition:enter-end="opacity-100 translate-y-0">

      <div class="mb-10 pt-2">
        <p class="label mb-3">Your result</p>
        <p class="text-[2.6rem] sm:text-[3.4rem] leading-none
          font-semibold tracking-tight tnum text-ink"
          x-text="heroMonthly + '/mo'"></p>
        <p class="mt-3 text-muted text-[15px] leading-relaxed
          max-w-[460px]">
          safe to withdraw &mdash; worked in
          <strong class="font-bold text-ink"
            x-text="heroPassRate"></strong>
          of <span x-text="periodCount"></span> simulated
          retirements since
          <span x-text="firstYear"></span>.
        </p>
        <div class="mt-4 inline-flex items-center gap-2
          px-4 py-2 rounded-full text-sm font-semibold"
          :class="{
            'bg-teal-soft text-teal': heroConfidence==='high',
            'bg-accent-soft text-accent': heroConfidence==='good',
            'bg-amber-soft text-amber': heroConfidence==='fair',
            'bg-rose-soft text-rose': heroConfidence==='low',
          }">
          <span x-text="heroPassRate"></span> success rate
        </div>
      </div>

      <div class="grid sm:grid-cols-3 gap-4 mb-10">
        <div class="sec !mb-0">
          <p class="label mb-1">Starting income</p>
          <p class="text-2xl font-semibold tnum text-ink"
            x-text="heroMonthly + '/mo'"></p>
          <p class="text-xs text-faint mt-1.5">
            median first year</p>
        </div>
        <div class="sec !mb-0">
          <p class="label mb-1">Avg. over retirement</p>
          <p class="text-2xl font-semibold tnum text-ink"
            x-text="typicalAvgIncome"></p>
          <p class="text-xs text-faint mt-1.5">
            grows with savings</p>
        </div>
        <div class="sec !mb-0">
          <p class="label mb-1">Toughest period</p>
          <p class="text-2xl font-semibold tnum text-ink"
            x-text="worstCase
              ? pctFmt(worstCase.endRatio,0)+' left' : '—'">
          </p>
          <p class="text-xs text-faint mt-1.5">
            <span x-text="worstCase
              ? worstCase.start : ''"></span>
            <template x-if="failCount > 0">
              <span class="text-rose font-bold"
                x-text="' · '+failCount+' missed'"></span>
            </template>
          </p>
        </div>
      </div>

      <p class="text-sm text-muted leading-relaxed max-w-[520px]
        mb-10" x-text="summaryPhrase"></p>
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
