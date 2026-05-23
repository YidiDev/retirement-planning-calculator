export function tableSectionTemplate() {
  return `
  <template x-if="showResults && rows.length > 0">
    <section class="sec">
      <details>
        <summary class="text-sm font-semibold text-accent cursor-pointer
          select-none hover:underline underline-offset-4">
          See all <span x-text="periodCount"></span> simulated retirements
        </summary>
        <div class="mt-4">
          <p class="text-xs text-muted mb-3">
            <template x-if="failCount === 0">
              <span class="font-bold text-teal">
                Every period met the goal.</span>
            </template>
            <template x-if="failCount > 0">
              <span class="font-bold text-rose"
                x-text="failCount + ' fell short.'"></span>
            </template>
          </p>
          <div class="tbl-wrap" tabindex="0" role="region"
            aria-label="Results table">
            <table>
              <thead><tr>
                <th>Started</th><th>Ended</th><th>1st yr</th>
                <th>Avg</th><th>Left</th><th>Goal</th>
              </tr></thead>
              <tbody>
                <template x-for="r in rows" :key="r.s">
                  <tr :class="!r.passed && 'fail'">
                    <td x-text="r.start"></td>
                    <td x-text="r.end"></td>
                    <td x-text="rowIncome(r)"></td>
                    <td x-text="rowAvg(r)"></td>
                    <td x-text="rowEnd(r)"></td>
                    <td><span class="badge"
                      :class="r.passed ? 'badge-ok' : 'badge-no'"
                      x-text="r.passed ? 'met' : 'short'"></span></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </section>
  </template>`;
}
