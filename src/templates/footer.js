export function footerTemplate() {
  return `
  <footer class="text-xs text-faint pt-8 pb-14 leading-relaxed">
    <p>Simulation data: U.S.&nbsp;equity, Treasury bonds, gold &amp;
      CPI through Jun&nbsp;2023.</p>
    <p class="mt-1">Educational only &mdash; not financial advice.
      <span class="opacity-50">v<span x-text="version"></span></span></p>
  </footer>`;
}
