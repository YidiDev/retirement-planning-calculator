export function headerTemplate() {
  return `
  <header class="pt-14 sm:pt-20 pb-10 sm:pb-14">
    <h1 class="text-3xl sm:text-[2.7rem] sm:leading-[1.15] tracking-tight">
      How much can you<br class="hidden sm:inline"> safely withdraw?
    </h1>
    <p class="mt-4 text-muted text-[15px] sm:text-base leading-relaxed max-w-[440px]">
      A flexible withdrawal strategy, stress-tested against 150&thinsp;years
      of real U.S.&nbsp;market history.
    </p>

    <button type="button"
      class="mt-6 text-sm font-semibold text-accent flex items-center gap-1.5
        hover:underline underline-offset-4"
      @click="showHelp = !showHelp"
      :aria-expanded="showHelp">
      <span x-text="showHelp ? 'Hide' : 'How does this work?'"></span>
      <svg class="w-3.5 h-3.5 transition-transform" :class="showHelp && 'rotate-180'"
        fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <div x-show="showHelp" x-cloak
      class="mt-4 text-sm text-muted leading-relaxed max-w-[520px]
        pl-4 border-l-2 border-accent-soft">
      <p class="mb-2">
        Each month you withdraw a <strong class="text-ink">percentage of
        savings</strong> that flexes with the market &mdash; but always
        between a <strong class="text-ink">floor</strong> and a
        <strong class="text-ink">cap</strong> you set.
      </p>
      <p class="mb-2">
        The calculator replays your plan through <strong class="text-ink">every
        starting month since 1871</strong>. Whatever it shows is a ceiling.
      </p>
      <p>
        Three return sleeves: <strong class="text-ink">U.S.&nbsp;stocks</strong>
        (S&amp;P&nbsp;500), <strong class="text-ink">Treasury bonds</strong>,
        and <strong class="text-ink">gold</strong> (1968+). No taxes or fees.
      </p>
    </div>
  </header>`;
}
