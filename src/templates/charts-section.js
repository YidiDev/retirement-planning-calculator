export function chartsSectionTemplate() {
  return `
  <template x-if="showResults && rows.length > 0">
    <section class="mx-4 sm:mx-auto sm:max-w-2xl bg-surface border border-border rounded-2xl p-5 mb-4">
      <p class="text-xs font-bold tracking-widest uppercase text-primary mb-3">Charts</p>

      <!-- Tab bar -->
      <div class="flex gap-1 bg-soft rounded-xl p-1 mb-4" role="tablist" aria-label="Result charts">
        <template x-for="t in [{id:'income',label:'Income'},{id:'preserve',label:'Savings left'},{id:'spotlight',label:'Deep dive'}]" :key="t.id">
          <button type="button" role="tab" :aria-selected="resultTab === t.id"
            :class="resultTab === t.id
              ? 'bg-surface text-primary shadow-sm'
              : 'text-muted'"
            class="flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all"
            @click="resultTab = t.id" x-text="t.label"></button>
        </template>
      </div>

      <!-- Income chart -->
      <div x-show="resultTab === 'income'" x-cloak>
        <p class="text-xs text-muted mb-3">
          Monthly withdrawal in today's dollars for every retirement start date.
        </p>
        <div class="chart-wrap"><canvas id="chartIncome"></canvas></div>
      </div>

      <!-- Preserve chart -->
      <div x-show="resultTab === 'preserve'" x-cloak>
        <p class="text-xs text-muted mb-3">
          How much savings remained at the end of each simulated retirement.
          <span class="text-danger font-bold">Red dots</span> missed the goal.
        </p>
        <div class="chart-wrap"><canvas id="chartPreserve"></canvas></div>
      </div>

      <!-- Spotlight chart -->
      <div x-show="resultTab === 'spotlight'" x-cloak>
        <p class="text-xs text-muted mb-3">
          Follow a single retirement month by month &mdash; portfolio value and income allowed.
        </p>
        <div class="flex flex-wrap gap-2 items-center mb-3">
          <select class="text-sm rounded-lg border border-border py-1.5 px-2 max-w-full"
            @change="selectSpot($event.target.value)" :value="spotIdx"
            aria-label="Select retirement period">
            <template x-for="opt in spotOptions" :key="opt.s">
              <option :value="opt.s" x-text="opt.label" :selected="spotIdx === opt.s"></option>
            </template>
          </select>
          <button type="button" @click="selectSpotWorst()"
            class="px-2.5 py-1.5 rounded-lg border border-border bg-soft text-xs font-bold text-ink
              hover:bg-danger-light hover:text-danger hover:border-danger transition-colors">Worst</button>
          <button type="button" @click="selectSpotBest()"
            class="px-2.5 py-1.5 rounded-lg border border-border bg-soft text-xs font-bold text-ink
              hover:bg-success-light hover:text-success hover:border-success transition-colors">Best</button>
          <button type="button" @click="selectSpotTypical()"
            class="px-2.5 py-1.5 rounded-lg border border-border bg-soft text-xs font-bold text-ink
              hover:bg-primary-light hover:text-primary hover:border-primary transition-colors">Typical</button>
        </div>
        <div class="chart-wrap"><canvas id="chartSpotlight"></canvas></div>
      </div>
    </section>
  </template>`;
}
