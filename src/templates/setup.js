export function setupTemplate() {
  return `
  <section class="mx-4 sm:mx-auto sm:max-w-2xl bg-surface border border-border rounded-2xl p-5 mb-4">
    <p class="text-xs font-bold tracking-widest uppercase text-primary mb-1">Step 1</p>
    <h2 class="text-lg font-bold text-ink mb-4">Your situation</h2>

    <!-- Savings -->
    <label class="block text-sm font-bold mb-1" for="inSavings">Retirement savings</label>
    <p class="text-xs text-muted mb-2">Your total nest egg, in today's dollars.</p>
    <div class="input-wrap mb-1">
      <span class="prefix">$</span>
      <input id="inSavings" type="number" class="has-prefix" min="10000" step="10000"
        x-model.number="savings" aria-label="Retirement savings">
    </div>
    <input type="range" min="50000" max="5000000" step="50000"
      x-model.number="savings" aria-label="Savings slider">
    <div class="flex justify-between text-xs text-faint tnum mb-5">
      <span>$50k</span><span x-text="moneyK(savings)"></span><span>$5M</span>
    </div>

    <!-- Years -->
    <label class="block text-sm font-bold mb-1" for="inYears">How long should it last?</label>
    <p class="text-xs text-muted mb-2">We stress-test against every period of this length.</p>
    <div class="flex items-center gap-3 mb-1">
      <input id="inYears" type="range" min="5" max="60" step="1"
        x-model.number="years" class="flex-1" aria-label="Retirement length">
      <span class="text-lg font-extrabold tnum w-16 text-right" x-text="years + ' yr'"></span>
    </div>
    <div class="flex justify-between text-xs text-faint mb-5"><span>5 yr</span><span>60 yr</span></div>

    <!-- Goal -->
    <label class="block text-sm font-bold mb-2">What should be left at the end?</label>
    <div class="flex gap-2 flex-wrap mb-2" role="radiogroup" aria-label="Retirement goal">
      <button type="button" role="radio" :aria-checked="goalPreset === 'preserve'"
        :class="goalPreset === 'preserve' ? 'bg-primary-light border-primary text-primary' : 'bg-soft border-border text-muted'"
        class="px-3 py-2 rounded-lg border text-sm font-bold transition-colors"
        @click="setGoalPreset('preserve')">Keep it all</button>
      <button type="button" role="radio" :aria-checked="goalPreset === 'spend'"
        :class="goalPreset === 'spend' ? 'bg-primary-light border-primary text-primary' : 'bg-soft border-border text-muted'"
        class="px-3 py-2 rounded-lg border text-sm font-bold transition-colors"
        @click="setGoalPreset('spend')">Spend it down</button>
      <button type="button" role="radio" :aria-checked="goalPreset === 'custom'"
        :class="goalPreset === 'custom' ? 'bg-primary-light border-primary text-primary' : 'bg-soft border-border text-muted'"
        class="px-3 py-2 rounded-lg border text-sm font-bold transition-colors"
        @click="setGoalPreset('custom')">Custom</button>
    </div>
    <template x-if="goalPreset === 'custom'">
      <div class="input-wrap mb-2">
        <input type="number" class="has-suffix" min="0" max="300" step="5"
          x-model.number="retainPct" aria-label="Retain percentage">
        <span class="suffix">%</span>
      </div>
    </template>
  </section>

  ${portfolioSection()}`;
}

function portfolioSection() {
  return `
  <section class="mx-4 sm:mx-auto sm:max-w-2xl bg-surface border border-border rounded-2xl p-5 mb-4">
    <p class="text-xs font-bold tracking-widest uppercase text-primary mb-1">Step 2</p>
    <h2 class="text-lg font-bold text-ink mb-1">Your portfolio</h2>
    <p class="text-xs text-muted mb-4">Pick a strategy or build your own.</p>

    <!-- Strategy presets -->
    <div class="flex gap-2 flex-wrap mb-4" role="radiogroup" aria-label="Portfolio strategy">
      <template x-for="s in [{id:'stocks',label:'All stocks'},{id:'balanced',label:'60 / 40'},{id:'conservative',label:'Conservative'},{id:'custom',label:'Custom'}]" :key="s.id">
        <button type="button" role="radio" :aria-checked="strategyPreset === s.id"
          :class="strategyPreset === s.id ? 'bg-primary-light border-primary text-primary' : 'bg-soft border-border text-muted'"
          class="px-3 py-2 rounded-lg border text-sm font-bold transition-colors"
          @click="setStrategy(s.id)" x-text="s.label"></button>
      </template>
    </div>

    <!-- Sleeve bar -->
    <div class="mb-2">
      <div class="sleeve-bar">
        <span class="sleeve-eq" :style="'width:' + sleeveBarStyles.sp"></span>
        <span class="sleeve-bd" :style="'width:' + sleeveBarStyles.bd"></span>
        <span class="sleeve-gd" :style="'width:' + sleeveBarStyles.gd"></span>
      </div>
      <p class="text-xs text-muted mt-1" x-text="allocNote"></p>
    </div>

    <!-- Custom portfolio picker -->
    <template x-if="showCustomPortfolio">
      <div class="mt-4">
        <!-- Current holdings -->
        <p class="text-xs font-bold uppercase tracking-wide text-muted mb-2">Your holdings</p>
        <template x-if="portfolio.length === 0">
          <p class="text-sm text-muted bg-soft rounded-xl px-4 py-3 mb-3">
            No holdings yet. Pick sources below.
          </p>
        </template>
        <div class="space-y-2 mb-4">
          <template x-for="p in portfolio" :key="p.id">
            <div class="flex items-center gap-2 bg-soft rounded-xl px-3 py-2">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold truncate" x-text="assetName(p.id)"></p>
                <p class="text-xs text-muted truncate" x-text="assetTicker(p.id) + ' · ' + assetYears(p.id)"></p>
              </div>
              <div class="input-wrap w-20 shrink-0">
                <input type="number" class="has-suffix text-sm !py-1.5" min="0" max="100" step="1"
                  :value="p.weight" @input="updateWeight(p.id, $event.target.value)"
                  :aria-label="'Weight for ' + assetName(p.id)">
                <span class="suffix text-xs">%</span>
              </div>
              <button type="button" @click="removeAsset(p.id)"
                :aria-label="'Remove ' + assetName(p.id)"
                class="w-7 h-7 rounded-lg bg-surface border border-border text-muted font-bold text-sm
                  hover:bg-danger-light hover:text-danger hover:border-danger transition-colors shrink-0">&times;</button>
            </div>
          </template>
        </div>

        <!-- Source picker -->
        <p class="text-xs font-bold uppercase tracking-wide text-muted mb-2">Add sources</p>
        <div class="space-y-3">
          <template x-for="group in assetGroups" :key="group">
            <div>
              <p class="text-xs font-bold text-ink mb-1.5" x-text="group"></p>
              <div class="flex flex-wrap gap-1.5">
                <template x-for="a in groupAssets(group)" :key="a.id">
                  <button type="button" @click="addAsset(a.id)"
                    :aria-pressed="isInPortfolio(a.id)"
                    :class="isInPortfolio(a.id)
                      ? 'bg-primary-light border-primary text-primary'
                      : 'bg-surface border-border text-ink hover:border-primary'"
                    class="px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all"
                    x-text="a.name"></button>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </section>`;
}
