export function headerTemplate() {
  return `
  <header class="pt-10 pb-6 px-5 text-center">
    <p class="text-xs font-bold tracking-widest uppercase text-primary mb-2">Retirement Planning</p>
    <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink leading-tight">
      How much can you safely withdraw?
    </h1>
    <p class="text-muted text-sm sm:text-base mt-2 max-w-md mx-auto leading-relaxed">
      A flexible withdrawal strategy, stress-tested against 150+ years of real U.S. market history.
    </p>
  </header>

  <section class="mx-4 sm:mx-auto sm:max-w-2xl mb-4">
    <button type="button"
      class="w-full text-left px-4 py-3 rounded-xl bg-surface border border-border text-sm"
      @click="$refs.howItWorks.open = !$refs.howItWorks.open">
      <span class="font-bold text-ink">How does this work?</span>
      <span class="text-muted ml-1">Tap to learn</span>
    </button>
    <details x-ref="howItWorks" class="mt-2 bg-surface border border-border rounded-xl px-4 py-4 text-sm text-muted leading-relaxed">
      <summary class="sr-only">How the calculator works</summary>
      <p class="mb-3">
        Each month you withdraw a <strong class="text-ink">percentage of your current savings</strong>
        that flexes with the market &mdash; more after strong months, less after weak ones &mdash;
        but always between a <strong class="text-ink">floor</strong> and a <strong class="text-ink">cap</strong> you choose.
      </p>
      <p class="mb-3">
        The calculator replays your plan through <strong class="text-ink">every starting month since 1871</strong>
        and reports how it held up. Whatever it shows is a ceiling &mdash; you can always spend less.
      </p>
      <p>
        The simulation maps your portfolio into three long-run data sleeves:
        <strong class="text-ink">U.S. equity</strong> (S&amp;P 500 since 1871),
        <strong class="text-ink">Treasury bonds</strong> (10-year, since 1871), and
        <strong class="text-ink">gold</strong> (free-market era, 1968+).
        Taxes, fees, and fund expenses are not modeled.
      </p>
    </details>
  </section>`;
}
