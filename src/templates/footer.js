export function footerTemplate() {
  return `
  <footer class="text-xs text-faint pt-6 pb-12 leading-relaxed">
    <p>Simulation data: U.S.&nbsp;equity, Treasury bonds,
      gold &amp; CPI through Jun&nbsp;2023.</p>
    <p class="mt-1.5">Educational only &mdash; not financial
      advice. v<span x-text="version"></span></p>
  </footer>`;
}
