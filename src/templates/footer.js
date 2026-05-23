export function footerTemplate() {
  return `
  <footer class="text-center text-xs text-faint pt-8 leading-relaxed">
    <p>Simulation data: monthly U.S. equity, Treasury bond, gold, and CPI
      histories through Jun 2023.</p>
    <p class="mt-1">Educational stress test only &mdash; not financial
      advice.</p>
    <p class="mt-1 opacity-60">
      Version <span x-text="version"></span></p>
  </footer>`;
}
