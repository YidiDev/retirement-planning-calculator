export function headerTemplate() {
  return `
  <header class="pt-12 pb-6 text-center">
    <p class="text-xs font-bold tracking-widest uppercase text-primary mb-3">
      Retirement Planning</p>
    <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink leading-tight">
      How much can you safely withdraw?
    </h1>
    <p class="text-muted text-sm sm:text-base mt-3 max-w-md mx-auto leading-relaxed">
      A flexible withdrawal strategy, stress-tested against 150+ years of
      real U.S. market history.
    </p>
  </header>

  <div class="mb-6">
    <button type="button"
      class="w-full text-left px-5 py-4 rounded-2xl bg-surface border border-border
        shadow-sm flex items-center justify-between gap-3"
      @click="showHelp = !showHelp"
      :aria-expanded="showHelp">
      <span>
        <span class="font-bold text-ink text-sm">How does this work?</span>
        <span class="text-muted text-xs ml-2">Tap to learn</span>
      </span>
      <svg class="w-4 h-4 text-muted transition-transform shrink-0"
        :class="showHelp && 'rotate-180'"
        fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>
    <div x-show="showHelp" x-cloak class="mt-3 card text-sm text-muted leading-relaxed">
      <p class="mb-3">
        Each month you withdraw a <strong class="text-ink">percentage of your
        current savings</strong> that flexes with the market &mdash; more after
        strong months, less after weak ones &mdash; but always between a
        <strong class="text-ink">floor</strong> and a
        <strong class="text-ink">cap</strong> you choose.
      </p>
      <p class="mb-3">
        The calculator replays your plan through <strong class="text-ink">every
        starting month since 1871</strong> and reports how it held up. Whatever
        it shows is a ceiling &mdash; you can always spend less.
      </p>
      <p>
        The simulation uses three historical return streams:
        <strong class="text-ink">U.S. equity</strong> (S&amp;P 500 since 1871),
        <strong class="text-ink">Treasury bonds</strong> (10-year, since 1871),
        and <strong class="text-ink">gold</strong> (free-market era, 1968+).
        Taxes, fees, and fund expenses are not modeled.
      </p>
    </div>
  </div>`;
}
