export function withdrawalTemplate() {
  return `
  <section class="mx-4 sm:mx-auto sm:max-w-2xl bg-surface border border-border rounded-2xl p-5 mb-4">
    <p class="text-xs font-bold tracking-widest uppercase text-primary mb-1">Step 3</p>
    <h2 class="text-lg font-bold text-ink mb-1">Withdrawal rules</h2>
    <p class="text-xs text-muted mb-4">Set a minimum and maximum monthly income. The calculator finds the best strategy within your rules.</p>

    <!-- Min income -->
    <label class="block text-sm font-bold mb-1">Minimum monthly income</label>
    <p class="text-xs text-muted mb-2">The least you need each month, in today's dollars.</p>
    <div class="input-wrap mb-1">
      <span class="prefix">$</span>
      <input type="number" class="has-prefix" min="0" step="100"
        x-model.number="minIncome" aria-label="Minimum monthly income">
    </div>
    <input type="range" min="0" max="15000" step="100"
      x-model.number="minIncome" aria-label="Minimum income slider">
    <div class="flex justify-between text-xs text-faint tnum mb-5">
      <span>$0</span><span x-text="'$' + minIncome.toLocaleString()"></span><span>$15k</span>
    </div>

    <!-- Max income -->
    <label class="block text-sm font-bold mb-1">Maximum monthly income</label>
    <p class="text-xs text-muted mb-2">The most you would withdraw even in great markets.</p>
    <div class="input-wrap mb-1">
      <span class="prefix">$</span>
      <input type="number" class="has-prefix" min="0" step="100"
        x-model.number="maxIncome" aria-label="Maximum monthly income">
    </div>
    <input type="range" min="1000" max="50000" step="500"
      x-model.number="maxIncome" aria-label="Maximum income slider">
    <div class="flex justify-between text-xs text-faint tnum mb-5">
      <span>$1k</span><span x-text="'$' + maxIncome.toLocaleString()"></span><span>$50k</span>
    </div>

    <!-- Advanced toggle -->
    <button type="button" @click="showAdvanced = !showAdvanced"
      class="text-sm font-bold text-primary mb-3 flex items-center gap-1">
      <span x-text="showAdvanced ? 'Hide' : 'Show'"></span> advanced options
      <svg class="w-3.5 h-3.5 transition-transform" :class="showAdvanced && 'rotate-180'"
        fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <template x-if="showAdvanced">
      <div class="space-y-4 bg-soft rounded-xl p-4">
        ${advancedFields()}
      </div>
    </template>
  </section>

  <!-- Calculate button -->
  <div class="mx-4 sm:mx-auto sm:max-w-2xl mb-6">
    <button type="button" @click="calculate()"
      class="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-base
        active:scale-[.98] transition-transform"
      :disabled="loading">
      <span x-show="!loading">Calculate my safe withdrawal</span>
      <span x-show="loading" class="flex items-center justify-center gap-2">
        <span class="spin"></span> Running simulation&hellip;
      </span>
    </button>
  </div>`;
}

function advancedFields() {
  return `
    <!-- Floor mode -->
    <div>
      <label class="block text-xs font-bold mb-1">Floor mode</label>
      <div class="flex gap-1.5 flex-wrap" role="radiogroup" aria-label="Floor mode">
        <template x-for="m in [{id:'usd',label:'Dollar amount'},{id:'pct',label:'Percentage'},{id:'both',label:'Both'}]" :key="m.id">
          <button type="button" role="radio" :aria-checked="floorMode === m.id"
            :class="floorMode === m.id ? 'bg-primary-light border-primary text-primary' : 'bg-surface border-border text-muted'"
            class="px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors"
            @click="floorMode = m.id" x-text="m.label"></button>
        </template>
      </div>
      <template x-if="floorMode === 'pct' || floorMode === 'both'">
        <div class="mt-2 input-wrap">
          <input type="number" class="has-suffix text-sm" min="0" max="12" step="0.05"
            x-model.number="minFloorPct" aria-label="Floor percentage">
          <span class="suffix text-xs">%/yr</span>
        </div>
      </template>
      <template x-if="floorMode === 'both'">
        <div class="mt-2 input-wrap">
          <input type="number" class="has-suffix text-sm" min="0" max="12" step="0.05"
            x-model.number="pctFloor" aria-label="Percentage floor for both mode">
          <span class="suffix text-xs">%/yr floor</span>
        </div>
      </template>
    </div>

    <!-- Cap mode -->
    <div>
      <label class="block text-xs font-bold mb-1">Cap mode</label>
      <div class="flex gap-1.5 flex-wrap" role="radiogroup" aria-label="Cap mode">
        <template x-for="m in [{id:'usd',label:'Dollar amount'},{id:'pct',label:'Percentage'},{id:'both',label:'Both'}]" :key="m.id">
          <button type="button" role="radio" :aria-checked="capMode === m.id"
            :class="capMode === m.id ? 'bg-primary-light border-primary text-primary' : 'bg-surface border-border text-muted'"
            class="px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors"
            @click="capMode = m.id" x-text="m.label"></button>
        </template>
      </div>
      <template x-if="capMode === 'pct' || capMode === 'both'">
        <div class="mt-2 input-wrap">
          <input type="number" class="has-suffix text-sm" min="0.5" max="40" step="0.25"
            x-model.number="maxCapPct" aria-label="Cap percentage">
          <span class="suffix text-xs">%/yr</span>
        </div>
      </template>
    </div>

    <!-- Timing -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-bold mb-1">Lookback</label>
        <div class="input-wrap">
          <input type="number" class="has-suffix text-sm" min="1" max="120" step="1"
            x-model.number="lookback" aria-label="Lookback months">
          <span class="suffix text-xs">mo</span>
        </div>
      </div>
      <div>
        <label class="block text-xs font-bold mb-1">Recalculate every</label>
        <div class="input-wrap">
          <input type="number" class="has-suffix text-sm" min="1" max="120" step="1"
            x-model.number="recalc" aria-label="Recalculation interval">
          <span class="suffix text-xs">mo</span>
        </div>
      </div>
    </div>`;
}
