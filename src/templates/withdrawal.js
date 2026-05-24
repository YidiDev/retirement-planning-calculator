export function withdrawalTemplate() {
  return `
  <section class="mx-4 sm:mx-auto sm:max-w-2xl card mb-5">
    <p class="text-xs font-bold tracking-widest uppercase text-primary mb-1">Step 3</p>
    <h2 class="text-lg font-bold text-ink mb-1">Withdrawal rules</h2>
    <p class="text-xs text-muted mb-5">Set your monthly income range. The calculator
      finds the best strategy within your rules.</p>

    <label class="block text-sm font-bold mb-1">Minimum monthly income</label>
    <p class="text-xs text-muted mb-2">The least you need each month, in today's dollars.</p>
    <div class="input-wrap mb-1">
      <span class="prefix">$</span>
      <input type="number" class="has-prefix" min="0" step="100"
        x-model.number="minIncome" aria-label="Minimum monthly income">
    </div>
    <input type="range" min="0" max="15000" step="100"
      x-model.number="minIncome" aria-label="Minimum income slider">
    <div class="flex justify-between text-xs text-faint tnum mb-6">
      <span>$0</span><span x-text="'$' + minIncome.toLocaleString()"></span><span>$15k</span>
    </div>

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

    <button type="button" @click="showAdvanced = !showAdvanced"
      class="text-sm font-bold text-primary flex items-center gap-1.5"
      :aria-expanded="showAdvanced">
      <span x-text="showAdvanced ? 'Hide' : 'Show'"></span> advanced options
      <svg class="w-4 h-4 transition-transform" :class="showAdvanced && 'rotate-180'"
        fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <template x-if="showAdvanced">
      <div class="space-y-5 bg-soft rounded-xl p-4 mt-3 border border-border">
        ${advancedFields()}
      </div>
    </template>
  </section>

  <div class="mx-4 sm:mx-auto sm:max-w-2xl mb-8">
    <button type="button" @click="calculate()" class="btn-primary" :disabled="loading">
      <span x-show="!loading">Calculate my safe withdrawal</span>
      <span x-show="loading" x-cloak class="flex items-center justify-center gap-2">
        <span class="spin spin-sm"></span> Running simulation&hellip;
      </span>
    </button>
  </div>`;
}

function advancedFields() {
  return `
    <div>
      <label class="block text-xs font-bold mb-2">Floor mode</label>
      <div class="flex gap-2 flex-wrap" role="radiogroup" aria-label="Floor mode">
        <template x-for="m in [{id:'usd',label:'Dollar amount'},{id:'pct',label:'Percentage'},{id:'both',label:'Both'}]" :key="m.id">
          <button type="button" role="radio" :aria-checked="floorMode === m.id"
            class="seg-btn text-xs !px-3 !py-2" :class="floorMode === m.id && 'seg-btn-active'"
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

    <div>
      <label class="block text-xs font-bold mb-2">Cap mode</label>
      <div class="flex gap-2 flex-wrap" role="radiogroup" aria-label="Cap mode">
        <template x-for="m in [{id:'usd',label:'Dollar amount'},{id:'pct',label:'Percentage'},{id:'both',label:'Both'}]" :key="m.id">
          <button type="button" role="radio" :aria-checked="capMode === m.id"
            class="seg-btn text-xs !px-3 !py-2" :class="capMode === m.id && 'seg-btn-active'"
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
