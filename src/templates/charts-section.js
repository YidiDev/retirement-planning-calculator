export function chartsSectionTemplate() {
  return `
  <template x-if="showResults && rows.length > 0">
    <section class="card mb-6">
      <p class="text-xs font-bold tracking-widest uppercase text-primary mb-5">
        Charts</p>

      <div class="tab-bar mb-6" role="tablist" aria-label="Result charts">
        <template x-for="t in [
          {id:'income',label:'Income'},
          {id:'preserve',label:'Savings left'},
          {id:'spotlight',label:'Deep dive'}
        ]" :key="t.id">
          <button type="button" role="tab"
            :aria-selected="resultTab === t.id"
            class="tab-btn"
            :class="resultTab === t.id && 'tab-btn-active'"
            @click="resultTab = t.id" x-text="t.label"></button>
        </template>
      </div>

      <div x-show="resultTab === 'income'" x-cloak>
        <p class="text-xs text-muted mb-4">
          Monthly withdrawal in today's dollars for every retirement
          start date.</p>
        <div class="chart-wrap"><canvas id="chartIncome"></canvas></div>
      </div>

      <div x-show="resultTab === 'preserve'" x-cloak>
        <p class="text-xs text-muted mb-4">
          How much savings remained at the end of each simulated retirement.
          <span class="text-danger font-bold">Red dots</span> missed
          the goal.</p>
        <div class="chart-wrap"><canvas id="chartPreserve"></canvas></div>
      </div>

      <div x-show="resultTab === 'spotlight'" x-cloak>
        <p class="text-xs text-muted mb-4">
          Follow a single retirement month by month.</p>
        <div class="flex flex-wrap gap-2 items-center mb-4">
          <select class="text-sm !py-2.5 !px-3 max-w-full"
            @change="selectSpot($event.target.value)" :value="spotIdx"
            aria-label="Select retirement period">
            <template x-for="opt in spotOptions" :key="opt.s">
              <option :value="opt.s" x-text="opt.label"
                :selected="spotIdx === opt.s"></option>
            </template>
          </select>
          <button type="button" @click="selectSpotWorst()"
            class="chip-btn">Worst</button>
          <button type="button" @click="selectSpotBest()"
            class="chip-btn">Best</button>
          <button type="button" @click="selectSpotTypical()"
            class="chip-btn">Typical</button>
        </div>
        <div class="chart-wrap"><canvas id="chartSpotlight"></canvas></div>
      </div>
    </section>
  </template>`;
}
