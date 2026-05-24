export function chartsSectionTemplate() {
  return `
  <template x-if="showResults && rows.length > 0">
    <section class="sec">
      <div class="tabs mb-6" role="tablist" aria-label="Charts">
        <template x-for="t in [
          {id:'income',l:'Income'},
          {id:'preserve',l:'Savings left'},
          {id:'spotlight',l:'Deep dive'}
        ]" :key="t.id">
          <button type="button" role="tab"
            :aria-selected="resultTab === t.id"
            class="tab" :class="resultTab===t.id && 'tab-on'"
            @click="resultTab = t.id" x-text="t.l"></button>
        </template>
      </div>

      <div x-show="resultTab==='income'" x-cloak>
        <p class="field-hint mb-4">Monthly withdrawal across
          every historical start date.</p>
        <div class="chart-box">
          <canvas id="chartIncome"></canvas>
        </div>
      </div>

      <div x-show="resultTab==='preserve'" x-cloak>
        <p class="field-hint mb-4">Savings remaining at the end.
          <span class="text-rose font-bold">Red</span> = missed
          goal.</p>
        <div class="chart-box">
          <canvas id="chartPreserve"></canvas>
        </div>
      </div>

      <div x-show="resultTab==='spotlight'" x-cloak>
        <p class="field-hint mb-4">A single retirement,
          month by month.</p>
        <div class="flex flex-wrap gap-2 items-center mb-4">
          <select class="text-sm !py-2 !px-3 max-w-full"
            @change="selectSpot($event.target.value)"
            :value="spotIdx"
            aria-label="Select period">
            <template x-for="opt in spotOptions" :key="opt.s">
              <option :value="opt.s" x-text="opt.label"
                :selected="spotIdx===opt.s"></option>
            </template>
          </select>
          <button type="button" @click="selectSpotWorst()"
            class="chip">Worst</button>
          <button type="button" @click="selectSpotBest()"
            class="chip">Best</button>
          <button type="button" @click="selectSpotTypical()"
            class="chip">Typical</button>
        </div>
        <div class="chart-box">
          <canvas id="chartSpotlight"></canvas>
        </div>
      </div>
    </section>
  </template>`;
}
