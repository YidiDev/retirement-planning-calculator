export function tableSectionTemplate() {
  return `
  <template x-if="showResults && rows.length > 0">
    <section class="card mb-6">
      <details>
        <summary class="text-sm font-bold text-primary cursor-pointer
          select-none py-1">
          See all <span x-text="periodCount"></span> simulated retirements
        </summary>

        <p class="text-xs text-muted mt-4 mb-4">
          <span x-text="periodCount"></span> periods tested.
          <template x-if="failCount === 0">
            <span class="font-bold text-success">
              Every one met the goal.</span>
          </template>
          <template x-if="failCount > 0">
            <span class="font-bold text-danger"
              x-text="failCount + ' fell short (highlighted).'"></span>
          </template>
        </p>

        <div class="table-scroll" tabindex="0" role="region"
          aria-label="Backtest results table">
          <table>
            <thead>
              <tr>
                <th>Started</th><th>Ended</th>
                <th>1st-yr income</th><th>Avg income</th>
                <th>Savings left</th><th>Goal</th>
              </tr>
            </thead>
            <tbody>
              <template x-for="r in rows" :key="r.s">
                <tr :class="!r.passed && 'fail'">
                  <td x-text="r.start"></td>
                  <td x-text="r.end"></td>
                  <td x-text="rowIncome(r)"></td>
                  <td x-text="rowAvg(r)"></td>
                  <td x-text="rowEnd(r)"></td>
                  <td>
                    <span class="pill"
                      :class="r.passed ? 'pill-pass' : 'pill-fail'"
                      x-text="r.passed ? 'met' : 'short'"></span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </details>
    </section>
  </template>`;
}
