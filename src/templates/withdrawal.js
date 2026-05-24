export function withdrawalTemplate() {
  return `
  <section class="sec">
    <h2 class="text-2xl mb-2">Withdrawal rules</h2>
    <p class="text-sm text-muted mb-6">Set your monthly income range.</p>

    <label class="block text-sm font-semibold text-ink mb-1">
      Minimum monthly income</label>
    <p class="text-xs text-muted mb-3">The least you need each month.</p>
    <div class="iw mb-1">
      <span class="p">$</span>
      <input type="number" class="has-pre" min="0" step="100"
        x-model.number="minIncome" aria-label="Minimum monthly income">
    </div>
    <input type="range" min="0" max="15000" step="100"
      x-model.number="minIncome" aria-label="Minimum income slider">
    <div class="flex justify-between text-xs text-faint tnum mb-8">
      <span>$0</span>
      <span x-text="'$' + minIncome.toLocaleString()"></span>
      <span>$15k</span>
    </div>

    <label class="block text-sm font-semibold text-ink mb-1">
      Maximum monthly income</label>
    <p class="text-xs text-muted mb-3">
      The most you'd withdraw, even in great markets.</p>
    <div class="iw mb-1">
      <span class="p">$</span>
      <input type="number" class="has-pre" min="0" step="100"
        x-model.number="maxIncome" aria-label="Maximum monthly income">
    </div>
    <input type="range" min="1000" max="50000" step="500"
      x-model.number="maxIncome" aria-label="Maximum income slider">
    <div class="flex justify-between text-xs text-faint tnum mb-6">
      <span>$1k</span>
      <span x-text="'$' + maxIncome.toLocaleString()"></span>
      <span>$50k</span>
    </div>

    <button type="button" @click="showAdvanced = !showAdvanced"
      :aria-expanded="showAdvanced"
      class="text-sm font-semibold text-accent flex items-center gap-1.5
        hover:underline underline-offset-4">
      <span x-text="showAdvanced ? 'Hide advanced' : 'Advanced options'"></span>
      <svg class="w-3.5 h-3.5 transition-transform"
        :class="showAdvanced && 'rotate-180'"
        fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>
    <template x-if="showAdvanced">
      <div class="mt-4 pt-5 border-t border-line space-y-5">
        ${advancedFields()}
      </div>
    </template>
  </section>

  <div class="mt-4 mb-12">
    <button type="button" @click="calculate()" class="cta" :disabled="loading">
      <span x-show="!loading">Calculate my safe withdrawal</span>
      <span x-show="loading" x-cloak
        class="flex items-center justify-center gap-2">
        <span class="spin"></span> Running&hellip;
      </span>
    </button>
  </div>`;
}

function advancedFields() {
  return `
    <div>
      <p class="text-xs font-bold text-ink mb-2">Floor mode</p>
      <div class="flex gap-2 flex-wrap" role="radiogroup">
        <template x-for="m in [{id:'usd',l:'Dollar'},{id:'pct',l:'Percentage'},{id:'both',l:'Both'}]" :key="m.id">
          <button type="button" class="opt text-xs !px-3 !py-2"
            :class="floorMode === m.id && 'opt-on'"
            @click="floorMode = m.id" x-text="m.l"></button>
        </template>
      </div>
      <template x-if="floorMode==='pct'||floorMode==='both'">
        <div class="iw mt-3 max-w-[160px]">
          <input type="number" class="has-suf text-sm" min="0" max="12" step=".05"
            x-model.number="minFloorPct" aria-label="Floor %"><span class="s text-xs">%/yr</span>
        </div>
      </template>
      <template x-if="floorMode==='both'">
        <div class="iw mt-2 max-w-[160px]">
          <input type="number" class="has-suf text-sm" min="0" max="12" step=".05"
            x-model.number="pctFloor" aria-label="Pct floor"><span class="s text-xs">%/yr</span>
        </div>
      </template>
    </div>
    <div>
      <p class="text-xs font-bold text-ink mb-2">Cap mode</p>
      <div class="flex gap-2 flex-wrap" role="radiogroup">
        <template x-for="m in [{id:'usd',l:'Dollar'},{id:'pct',l:'Percentage'},{id:'both',l:'Both'}]" :key="m.id">
          <button type="button" class="opt text-xs !px-3 !py-2"
            :class="capMode === m.id && 'opt-on'"
            @click="capMode = m.id" x-text="m.l"></button>
        </template>
      </div>
      <template x-if="capMode==='pct'||capMode==='both'">
        <div class="iw mt-3 max-w-[160px]">
          <input type="number" class="has-suf text-sm" min=".5" max="40" step=".25"
            x-model.number="maxCapPct" aria-label="Cap %"><span class="s text-xs">%/yr</span>
        </div>
      </template>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-xs font-bold text-ink mb-1">Lookback</p>
        <div class="iw"><input type="number" class="has-suf text-sm" min="1" max="120"
          x-model.number="lookback" aria-label="Lookback"><span class="s text-xs">mo</span></div>
      </div>
      <div>
        <p class="text-xs font-bold text-ink mb-1">Recalc every</p>
        <div class="iw"><input type="number" class="has-suf text-sm" min="1" max="120"
          x-model.number="recalc" aria-label="Recalc"><span class="s text-xs">mo</span></div>
      </div>
    </div>`;
}
