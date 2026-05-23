export function headerTemplate() {
  return `
  <header class="pt-12 sm:pt-20 pb-8 sm:pb-12">
    <div class="flex items-start gap-3 mb-4">
      <svg class="w-8 h-8 text-accent shrink-0 mt-1" viewBox="0 0 32 32"
        fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <polyline points="4,22 10,14 16,18 26,6"/>
        <circle cx="26" cy="6" r="2.5" fill="currentColor" stroke="none"/>
      </svg>
      <h1 class="text-3xl sm:text-[2.7rem] sm:leading-[1.12] tracking-tight">
        How much can you safely withdraw?
      </h1>
    </div>
    <p class="text-muted text-[15px] sm:text-base leading-relaxed
      max-w-[460px]">
      A flexible withdrawal strategy, stress-tested against
      150&thinsp;years of real U.S.&nbsp;market history.
    </p>

    <button type="button"
      class="mt-5 text-sm font-semibold text-accent flex items-center
        gap-1.5 hover:underline underline-offset-4"
      @click="showHelp = !showHelp"
      :aria-expanded="showHelp">
      <span x-text="showHelp ? 'Hide details' : 'How does this work?'">
      </span>
      <svg class="w-3.5 h-3.5 transition-transform duration-200"
        :class="showHelp && 'rotate-180'"
        fill="none" stroke="currentColor" stroke-width="2.5"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <div x-show="showHelp" x-cloak
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0 -translate-y-1"
      x-transition:enter-end="opacity-100 translate-y-0"
      x-transition:leave="transition ease-in duration-150"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
      class="mt-4 text-sm text-muted leading-relaxed max-w-[500px]
        pl-4 border-l-2 border-line">
      <p class="mb-2.5">
        Each month you withdraw a
        <strong class="text-ink">percentage of savings</strong> that
        flexes with the market &mdash; but always between a
        <strong class="text-ink">floor</strong> and a
        <strong class="text-ink">cap</strong> you set.
      </p>
      <p class="mb-2.5">
        The calculator replays your plan through
        <strong class="text-ink">every starting month since
        1871</strong>. Whatever it shows is a ceiling.
      </p>
      <p>
        Three return streams:
        <strong class="text-ink">U.S.&nbsp;stocks</strong>,
        <strong class="text-ink">Treasury bonds</strong>, and
        <strong class="text-ink">gold</strong> (1968+).
        No taxes or fees modeled.
      </p>
    </div>
  </header>`;
}
