export function setupTemplate() {
  return `
  <section class="card mb-6">
    <p class="text-xs font-bold tracking-widest uppercase text-primary mb-2">Step 1</p>
    <h2 class="text-xl font-bold text-ink mb-6">Your situation</h2>

    <label class="block text-sm font-bold mb-1.5" for="inSavings">
      Retirement savings</label>
    <p class="text-xs text-muted mb-3">Your total nest egg, in today's dollars.</p>
    <div class="input-wrap mb-2">
      <span class="prefix">$</span>
      <input id="inSavings" type="number" class="has-prefix" min="10000" step="10000"
        x-model.number="savings" aria-label="Retirement savings">
    </div>
    <input type="range" min="50000" max="5000000" step="50000"
      x-model.number="savings" aria-label="Savings slider">
    <div class="flex justify-between text-xs text-faint tnum mt-1 mb-8">
      <span>$50k</span><span x-text="moneyK(savings)"></span><span>$5M</span>
    </div>

    <label class="block text-sm font-bold mb-1.5" for="inYears">
      How long should it last?</label>
    <p class="text-xs text-muted mb-3">
      We stress-test against every period of this length.</p>
    <div class="flex items-center gap-4 mb-1">
      <input id="inYears" type="range" min="5" max="60" step="1"
        x-model.number="years" class="flex-1" aria-label="Retirement length">
      <span class="text-2xl font-extrabold tnum w-20 text-right"
        x-text="years + ' yr'"></span>
    </div>
    <div class="flex justify-between text-xs text-faint mb-8">
      <span>5 yr</span><span>60 yr</span>
    </div>

    <label class="block text-sm font-bold mb-3">
      What should be left at the end?</label>
    <div class="flex gap-3 flex-wrap mb-3" role="radiogroup"
      aria-label="Retirement goal">
      <button type="button" role="radio"
        :aria-checked="goalPreset === 'preserve'"
        class="seg-btn" :class="goalPreset === 'preserve' && 'seg-btn-active'"
        @click="setGoalPreset('preserve')">Keep it all</button>
      <button type="button" role="radio"
        :aria-checked="goalPreset === 'spend'"
        class="seg-btn" :class="goalPreset === 'spend' && 'seg-btn-active'"
        @click="setGoalPreset('spend')">Spend it down</button>
      <button type="button" role="radio"
        :aria-checked="goalPreset === 'custom'"
        class="seg-btn" :class="goalPreset === 'custom' && 'seg-btn-active'"
        @click="setGoalPreset('custom')">Custom</button>
    </div>
    <template x-if="goalPreset === 'custom'">
      <div class="input-wrap mt-2">
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
  <section class="card mb-6">
    <p class="text-xs font-bold tracking-widest uppercase text-primary mb-2">Step 2</p>
    <h2 class="text-xl font-bold text-ink mb-2">Your portfolio</h2>
    <p class="text-sm text-muted mb-5">Pick a strategy or build your own.</p>

    <div class="flex gap-3 flex-wrap mb-6" role="radiogroup"
      aria-label="Portfolio strategy">
      <template x-for="s in [
        {id:'stocks',label:'All stocks'},
        {id:'balanced',label:'60 / 40'},
        {id:'conservative',label:'Conservative'},
        {id:'custom',label:'Custom'}
      ]" :key="s.id">
        <button type="button" role="radio"
          :aria-checked="strategyPreset === s.id"
          class="seg-btn" :class="strategyPreset === s.id && 'seg-btn-active'"
          @click="setStrategy(s.id)" x-text="s.label"></button>
      </template>
    </div>

    <div class="mb-5">
      <p class="text-xs font-bold text-muted mb-2 uppercase tracking-wide">
        Simulation mix</p>
      <div class="sleeve-bar">
        <span class="sleeve-eq" :style="'width:' + sleeveBarStyles.sp"></span>
        <span class="sleeve-bd" :style="'width:' + sleeveBarStyles.bd"></span>
        <span class="sleeve-gd" :style="'width:' + sleeveBarStyles.gd"></span>
      </div>
      <div class="flex gap-5 mt-3 text-xs">
        <span class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 rounded-sm bg-primary"></span>
          <span class="text-muted" x-text="Math.round(sleeves.sp) + '% stocks'"></span>
        </span>
        <span class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 rounded-sm bg-success"></span>
          <span class="text-muted" x-text="Math.round(sleeves.bd) + '% bonds'"></span>
        </span>
        <span class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 rounded-sm bg-warning"></span>
          <span class="text-muted" x-text="Math.round(sleeves.gd) + '% gold'"></span>
        </span>
      </div>
      <p class="text-xs text-muted mt-2" x-text="allocNote"></p>
    </div>

    <template x-if="showCustomPortfolio">
      <div>
        <p class="text-xs font-bold uppercase tracking-wide text-muted mb-3">
          Your holdings</p>
        <template x-if="portfolio.length === 0">
          <p class="text-sm text-muted bg-soft rounded-xl px-5 py-4 mb-4">
            No holdings yet. Pick sources below.
          </p>
        </template>
        <div class="space-y-2.5 mb-5">
          <template x-for="p in portfolio" :key="p.id">
            <div class="flex items-center gap-3 bg-soft rounded-xl px-4 py-3
              border border-border">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold truncate"
                  x-text="assetName(p.id)"></p>
                <p class="text-xs text-muted truncate"
                  x-text="assetTicker(p.id) + ' · ' + assetYears(p.id)"></p>
              </div>
              <div class="input-wrap w-20 shrink-0">
                <input type="number" class="has-suffix text-sm !py-2.5"
                  min="0" max="100" step="1"
                  :value="p.weight"
                  @input="updateWeight(p.id, $event.target.value)"
                  :aria-label="'Weight for ' + assetName(p.id)">
                <span class="suffix text-xs">%</span>
              </div>
              <button type="button" @click="removeAsset(p.id)"
                :aria-label="'Remove ' + assetName(p.id)"
                class="w-9 h-9 rounded-lg bg-surface border border-border text-muted
                  font-bold hover:bg-danger-light hover:text-danger
                  hover:border-danger transition-colors shrink-0 flex items-center
                  justify-center text-lg">&times;</button>
            </div>
          </template>
        </div>

        <p class="text-xs font-bold uppercase tracking-wide text-muted mb-3">
          Add sources</p>
        <div class="space-y-4">
          <template x-for="group in assetGroups" :key="group">
            <div>
              <p class="text-xs font-bold text-ink mb-2" x-text="group"></p>
              <div class="flex flex-wrap gap-2">
                <template x-for="a in groupAssets(group)" :key="a.id">
                  <button type="button" @click="addAsset(a.id)"
                    :aria-pressed="isInPortfolio(a.id)"
                    class="pill-btn"
                    :class="isInPortfolio(a.id) && 'pill-btn-active'"
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
