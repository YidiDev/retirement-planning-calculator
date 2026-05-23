export function tableSectionTemplate() {
  return `
  <template x-if="showResults && rows.length > 0">
    <section class="mx-4 sm:mx-auto sm:max-w-2xl bg-surface border border-border rounded-2xl p-5 mb-4">
      <details>
        <summary class="text-sm font-bold text-primary cursor-pointer select-none">
          See all <span x-text="periodCount"></span> simulated retirements
        </summary>

        <p class="text-xs text-muted mt-2 mb-3">
          <span x-text="periodCount"></span> periods tested.
          <template x-if="failCount === 0">
            <span>Every one met the goal.</span>
          </template>
          <template x-if="failCount > 0">
            <span class="text-danger font-bold" x-text="failCount + ' fell short (highlighted).'"></span>
          </template>
        </p>

        <div class="table-scroll" tabindex="0">
          <table>
            <thead>
              <tr>
                <th>Started</th>
                <th>Ended</th>
                <th>1st-yr income</th>
                <th>Avg income</th>
                <th>Savings left</th>
                <th>Goal</th>
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
