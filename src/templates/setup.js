export function setupTemplate() {
  return `
  <section class="sec">
    <h2 class="text-2xl mb-8">Your situation</h2>

    <label class="block text-sm font-semibold text-ink mb-1">
      Retirement savings</label>
    <p class="text-xs text-muted mb-3">Total nest egg, today's dollars.</p>
    <div class="iw mb-1">
      <span class="p">$</span>
      <input type="number" class="has-pre" min="10000" step="10000"
        x-model.number="savings" aria-label="Retirement savings">
    </div>
    <input type="range" min="50000" max="5000000" step="50000"
      x-model.number="savings" aria-label="Savings slider">
    <div class="flex justify-between text-xs text-faint tnum mb-8">
      <span>$50k</span><span x-text="moneyK(savings)"></span><span>$5M</span>
    </div>

    <label class="block text-sm font-semibold text-ink mb-1">
      How long should it last?</label>
    <div class="flex items-center gap-4 mt-2">
      <input type="range" min="5" max="60" step="1"
        x-model.number="years" class="flex-1" aria-label="Retirement length">
      <span class="text-2xl font-semibold tnum text-ink w-[72px] text-right"
        x-text="years + ' yr'"></span>
    </div>
    <div class="flex justify-between text-xs text-faint mt-1 mb-8">
      <span>5</span><span>60</span>
    </div>

    <label class="block text-sm font-semibold text-ink mb-3">
      What should remain at the end?</label>
    <div class="flex gap-2 flex-wrap" role="radiogroup"
      aria-label="Retirement goal">
      <button type="button" class="opt"
        :class="goalPreset === 'preserve' && 'opt-on'"
        @click="setGoalPreset('preserve')">Keep it all</button>
      <button type="button" class="opt"
        :class="goalPreset === 'spend' && 'opt-on'"
        @click="setGoalPreset('spend')">Spend it down</button>
      <button type="button" class="opt"
        :class="goalPreset === 'custom' && 'opt-on'"
        @click="setGoalPreset('custom')">Custom</button>
    </div>
    <template x-if="goalPreset === 'custom'">
      <div class="iw mt-3 max-w-[140px]">
        <input type="number" class="has-suf" min="0" max="300" step="5"
          x-model.number="retainPct" aria-label="Retain percentage">
        <span class="s">%</span>
      </div>
    </template>
  </section>

  ${portfolioSection()}`;
}

function portfolioSection() {
  return `
  <section class="sec">
    <h2 class="text-2xl mb-2">Your portfolio</h2>
    <p class="text-sm text-muted mb-5">Pick a strategy or build your own.</p>

    <div class="flex gap-2 flex-wrap mb-5" role="radiogroup"
      aria-label="Portfolio strategy">
      <template x-for="s in [
        {id:'stocks',label:'All stocks'},
        {id:'balanced',label:'60 / 40'},
        {id:'conservative',label:'Conservative'},
        {id:'custom',label:'Custom'}
      ]" :key="s.id">
        <button type="button" class="opt"
          :class="strategyPreset === s.id && 'opt-on'"
          @click="setStrategy(s.id)" x-text="s.label"></button>
      </template>
    </div>

    <div class="mb-1">
      <div class="mix-bar">
        <span class="bar-eq" :style="'width:' + sleeveBarStyles.sp"></span>
        <span class="bar-bd" :style="'width:' + sleeveBarStyles.bd"></span>
        <span class="bar-gd" :style="'width:' + sleeveBarStyles.gd"></span>
      </div>
      <div class="flex gap-5 mt-2.5 text-xs text-muted">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-sm bg-accent inline-block"></span>
          <span x-text="Math.round(sleeves.sp) + '% stocks'"></span></span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-sm bg-teal inline-block"></span>
          <span x-text="Math.round(sleeves.bd) + '% bonds'"></span></span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-sm bg-amber inline-block"></span>
          <span x-text="Math.round(sleeves.gd) + '% gold'"></span></span>
      </div>
      <p class="text-xs text-faint mt-1" x-text="allocNote"></p>
    </div>

    <template x-if="showCustomPortfolio">
      <div class="mt-6 pt-6 border-t border-line">
        <p class="label mb-3">Your holdings</p>
        <template x-if="portfolio.length === 0">
          <p class="text-sm text-muted py-3">No holdings yet — pick below.</p>
        </template>
        <div class="space-y-2 mb-6">
          <template x-for="p in portfolio" :key="p.id">
            <div class="flex items-center gap-3 bg-wash rounded-xl px-4 py-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-ink truncate"
                  x-text="assetName(p.id)"></p>
                <p class="text-xs text-faint truncate"
                  x-text="assetTicker(p.id) + ' · ' + assetYears(p.id)"></p>
              </div>
              <div class="iw w-[76px] shrink-0">
                <input type="number" class="has-suf text-sm !py-2" min="0"
                  max="100" step="1" :value="p.weight"
                  @input="updateWeight(p.id, $event.target.value)"
                  :aria-label="'Weight for ' + assetName(p.id)">
                <span class="s text-xs">%</span>
              </div>
              <button type="button" @click="removeAsset(p.id)"
                :aria-label="'Remove ' + assetName(p.id)"
                class="w-8 h-8 rounded-lg text-faint hover:text-rose
                  hover:bg-rose-soft transition-colors shrink-0 flex
                  items-center justify-center font-bold text-lg"
                >&times;</button>
            </div>
          </template>
        </div>
        <p class="label mb-3">Add sources</p>
        <div class="space-y-3">
          <template x-for="group in assetGroups" :key="group">
            <div>
              <p class="text-xs font-bold text-ink mb-1.5" x-text="group"></p>
              <div class="flex flex-wrap gap-1.5">
                <template x-for="a in groupAssets(group)" :key="a.id">
                  <button type="button" @click="addAsset(a.id)"
                    class="tag" :class="isInPortfolio(a.id) && 'tag-on'"
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
